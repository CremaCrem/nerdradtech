/* A made-up patient defined in Hounsfield units, so any slice can be sampled at any matrix, FOV or position.
   x: image left (patient right) -1 … +1 image right · y: anterior -1 … +1 posterior · z: 0 lung apex … 1 lower abdomen.
   One unit = 20 cm. Shared by the windowing lab, the workstation viewer, the image quality lab and the artifact gallery. */
window.Phantom = (() => {
  const UNIT = 20;
  const sm = (a, b, t) => Math.min(1, Math.max(0, (t - a) / (b - a)));
  const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2;
  const hash = (a, b, c) => { let h = Math.imul(a, 374761393) + Math.imul(b, 668265263) + Math.imul(c, 1274126177); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const bump = (z, a, b) => z < a || z > b ? 0 : Math.sin(Math.PI * (z - a) / (b - a));

  /* o: { arms, barium, screws, lesion } */
  function hu(x, y, z, o = {}) {
    const bx = 0.9 - 0.06 * sm(0.55, 0.8, z), by = 0.6 + 0.04 * sm(0.5, 0.9, z);
    const e = (x * x) / (bx * bx) + (y * y) / (by * by);
    if (e > 1) {
      if (o.arms) for (const s of [-1, 1]) {
        const a = ell(x, y, s * 1.12, 0.05, 0.15, 0.2);
        if (a < 1) return ell(x, y, s * 1.12, 0.05, 0.05, 0.06) < 1 ? 1000 : a > 0.85 ? -90 : 45;
      }
      return y > 0.66 && y < 0.72 && Math.abs(x) < 0.85 ? 150 : -1000;   // table top
    }
    if (o.screws && z > 0.7 && z < 0.8) for (const s of [-1, 1]) {
      const t = (y - 0.4) / 0.2, px = s * (0.02 + 0.05 * (1 - t));     // two pedicle screws converging into the body
      if (t > -0.1 && t < 1 && Math.abs(x - px) < 0.016) return 3000;
    }
    // spine: vertebral body with cortex, discs between levels, canal, posterior elements
    const vb = ell(x, y, 0, 0.36, 0.11, 0.095);
    if (vb < 1) return ((z * 9) % 1) < 0.16 ? 85 : vb > 0.7 ? 1100 : 320;
    const can = ell(x, y, 0, 0.5, 0.045, 0.04);
    if (can < 1) return 25;
    if (can < 2.6 && y > 0.45) return 800;
    if (Math.abs(x) < 0.022 && y > 0.52 && y < 0.62) return 800;
    // ribs: oval segments around the chest wall
    if (z < 0.66 && e > 0.72 && e < 0.8 && y > -0.42) {
      const th = Math.atan2(y, x);
      if (Math.cos(th * 11 + z * 38) > 0.62) return e > 0.74 && e < 0.78 ? 380 : 900;
    }
    if (z > 0.06 && z < 0.46 && ell(x, y, 0, -0.52, 0.075, 0.035) < 1) return 600;            // sternum
    if (z > 0.03 && z < 0.32) for (const s of [-1, 1]) {                                         // scapulae
      const u = (x - s * 0.55) * 0.83 + (y - 0.36) * 0.55 * s, v = -(x - s * 0.55) * 0.55 * s + (y - 0.36) * 0.83;
      if ((u / 0.2) ** 2 + (v / 0.025) ** 2 < 1) return 750;
    }
    if (e > 0.86) return e > 0.975 ? 30 : -105;                                                 // skin, subcutaneous fat
    // great vessels with contrast
    if (z > 0.12 && z < 0.66 && ell(x, y, 0.13, 0.24, 0.055, 0.055) < 1) return 310;           // descending aorta
    if (z >= 0.66 && ell(x, y, 0.05, 0.2, 0.05, 0.05) < 1) return 300;                          // abdominal aorta
    if (z > 0.16 && z < 0.32 && ell(x, y, 0.05, -0.2, 0.07, 0.07) < 1) return 300;              // ascending aorta
    if (z > 0.12 && z < 0.16 && ell(x, y, 0.05, 0.02, 0.07, 0.24) < 1) return 300;              // arch
    if (z > 0.2 && z < 0.3 && ell(x, y, 0.2, -0.24, 0.08, 0.06) < 1) return 240;                // pulmonary trunk
    if (z > 0.1 && z < 0.36 && ell(x, y, -0.14, -0.2, 0.045, 0.05) < 1) return 170;             // SVC
    if (z >= 0.6 && ell(x, y, -0.1, 0.18, 0.05, 0.045) < 1) return 150;                         // IVC
    // heart
    const hb = bump(z, 0.27, 0.58);
    if (hb > 0) {
      const h = ell(x, y, 0.14, -0.14, 0.33 * hb + 0.02, 0.25 * hb + 0.02);
      if (h < 1) return ell(x, y, 0.22, -0.12, 0.14 * hb, 0.11 * hb) < 1 ? 230 : ell(x, y, 0.02, -0.2, 0.1 * hb, 0.08 * hb) < 1 ? 190 : 45;
    }
    // lungs
    if (z < 0.62) {
      const g = 0.35 + 0.65 * sm(0, 0.3, z);
      for (const s of [-1, 1]) {
        const l = ell(x, y, s * 0.42, 0.02, 0.34 * g, 0.46 * g);
        if (l < 1 && z < 0.42 + 0.17 * l + (s > 0 ? 0.03 : 0)) {          // domed diaphragm: costophrenic recesses go deepest
          const cx = Math.floor(x * 30), cy = Math.floor(y * 30), cz = Math.floor(z * 60);
          const r = hash(cx, cy, cz);
          if (r < 0.09 && l < 0.85) { const fx = x * 30 - cx - 0.5, fy = y * 30 - cy - 0.5; if (fx * fx + fy * fy < 0.12) return 30; }
          if (z > 0.18 && z < 0.4 && ell(x, y, s * 0.16, -0.02, 0.035, 0.035) < 1) return -950;  // main bronchi
          return -860 + 40 * (1 - l);
        }
      }
    }
    // abdomen
    const lb = bump(z, 0.42, 0.8);
    if (lb > 0 && ell(x, y, -0.36, 0.0, 0.5 * lb + 0.05, 0.44 * lb + 0.05) < 1) {
      if (o.lesion && z > 0.5 && z < 0.64 && ell(x, y, -0.42, -0.08, 0.075, 0.075) < 1) return 42;
      return hash(Math.floor(x * 40), Math.floor(y * 40), Math.floor(z * 40)) < 0.03 ? 140 : 62;
    }
    if (z > 0.48 && z < 0.66 && ell(x, y, 0.55, 0.2, 0.16, 0.22) < 1) return 52;              // spleen
    if (z > 0.46 && z < 0.66) {                                                                  // stomach, air anterior
      const s = ell(x, y, 0.36, -0.24, 0.24, 0.17);
      if (s < 1) return s > 0.75 ? 40 : y < -0.27 ? -1000 : o.barium ? 900 : 15;
    }
    for (const s of [-1, 1]) {                                                                   // kidneys
      const kb = bump(z, 0.62, 0.86);
      if (kb > 0) { const k = ell(x, y, s * 0.3, 0.26, 0.12 * kb + 0.01, 0.15 * kb + 0.01); if (k < 1) return k < 0.25 ? 20 : 170; }
    }
    if (z > 0.62 && z < 0.7 && ell(x, y, 0.05, 0.02, 0.3, 0.05) < 1) return 45;               // pancreas
    if (z > 0.7) {                                                                               // bowel loops
      const C = 0.2, gx = Math.floor((x + 2) / C), gy = Math.floor((y + 2) / C), gz = Math.floor(z * 14);
      const r = hash(gx, gy, gz), rad = 0.24 + 0.14 * hash(gx, gz, gy), j = 0.5 - rad;
      const fx = (x + 2) / C - gx - 0.5 - (hash(gz, gx, gy) - 0.5) * 2 * j, fy = (y + 2) / C - gy - 0.5 - (hash(gy, gz, gx) - 0.5) * 2 * j;
      const d = Math.sqrt(fx * fx + fy * fy);
      if (y < 0.15 && r > 0.3 && d < rad) return d > rad - 0.07 ? 40 : r < 0.62 ? -1000 : 15;
    }
    for (const s of [-1, 1]) if (ell(x, y, s * 0.18, 0.47, 0.12, 0.1) < 1) return 52;          // paraspinal muscles
    if (e > 0.7) return 48;                                                                      // chest/abdominal wall muscle
    return z < 0.6 ? -40 : -85;                                                                  // mediastinal / intra-abdominal fat
  }

  /* A head at skull base level: skull, brain, ventricles, petrous bones (for beam hardening) */
  function head(x, y, o = {}) {
    const e = ell(x, y, 0, 0, 0.62, 0.76);
    if (e > 1) return -1000;
    if (e > 0.96) return 30;
    if (e > 0.82) return 1300;
    if (o.petrous) for (const s of [-1, 1]) { const p = ell(x, y, s * 0.3, 0.12, 0.15, 0.06); if (p < 1) return 1700; }
    for (const s of [-1, 1]) if (ell(x, y, s * 0.11, -0.12, 0.05, 0.2) < 1) return 6;
    return ell(x, y, 0, 0, 0.36, 0.5) < 1 ? 28 : 38;
  }

  /* Sample a slice. fov in cm, cx/cy offset of the display centre in cm. */
  function slice(z, n, fov = 40, cx = 0, cy = 0, o = {}, fn) {
    const out = new Float32Array(n * n), s = fov / UNIT, ox = cx / UNIT, oy = cy / UNIT;
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const x = ox + ((i + 0.5) / n - 0.5) * s, y = oy + ((j + 0.5) / n - 0.5) * s;
      out[j * n + i] = fn ? fn(x, y, o) : hu(x, y, z, o);
    }
    return out;
  }

  /* Average several thin slices into one thick one (partial volume averaging along z) */
  function thick(z, mm, n, fov, o, cx = 0, cy = 0) {
    const k = Math.max(1, Math.round(mm)), out = new Float32Array(n * n);
    for (let s = 0; s < k; s++) {
      const a = slice(z + ((s + 0.5) / k - 0.5) * mm / 10 / 50, n, fov, cx, cy, o);   // 1 unit of z ≈ 50 cm of patient
      for (let p = 0; p < out.length; p++) out[p] += a[p] / k;
    }
    return out;
  }

  function noise(arr, sigma, seed = 7) {
    if (!sigma) return arr;
    const r = U.rng(seed), out = new Float32Array(arr.length);
    for (let p = 0; p < arr.length; p++) out[p] = arr[p] + U.gauss(r) * sigma;
    return out;
  }

  /* Reconstruction kernel on an image: 'soft' smooths (less noise, blurrier), 'bone' sharpens (crisper, noisier) */
  function kernel(a, n, type) {
    if (type !== 'soft' && type !== 'bone') return a;
    const b = new Float32Array(a.length), at = (i, j) => a[Math.min(n - 1, Math.max(0, j)) * n + Math.min(n - 1, Math.max(0, i))];
    for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
      const c = a[j * n + i], s4 = at(i - 1, j) + at(i + 1, j) + at(i, j - 1) + at(i, j + 1), s8 = at(i - 1, j - 1) + at(i + 1, j - 1) + at(i - 1, j + 1) + at(i + 1, j + 1);
      b[j * n + i] = type === 'soft' ? (4 * c + 2 * s4 + s8) / 16 : 2.2 * c - 0.3 * s4;
    }
    return b;
  }

  /* Window an HU array onto an n×n offscreen canvas. Returns the canvas. */
  const offs = {};
  function toCanvas(arr, n, ww, wl, invert) {
    const c = offs[n] || (offs[n] = Object.assign(document.createElement('canvas'), { width: n, height: n }));
    const x = c.getContext('2d'), id = x.createImageData(n, n), lo = wl - ww / 2;
    for (let p = 0; p < n * n; p++) {
      let g = Math.max(0, Math.min(1, (arr[p] - lo) / ww)) * 255; if (invert) g = 255 - g;
      id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = g; id.data[p * 4 + 3] = 255;
    }
    x.putImageData(id, 0, 0); return c;
  }

  /* Draw a windowed slice to a visible canvas, scaled to fit */
  function draw(cv, arr, n, ww, wl, { invert = false, smooth = true, flip = false } = {}) {
    const { ctx, w, h } = U.hiDPI(cv, 1);
    ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, w, h);
    if (flip) { ctx.translate(w, 0); ctx.scale(-1, 1); }
    ctx.imageSmoothingEnabled = smooth; ctx.drawImage(toCanvas(arr, n, ww, wl, invert), 0, 0, w, h);
    ctx.restore();
    return { ctx, w, h };
  }

  /* AP scout (scanogram): attenuation summed front to back. Cached. */
  let scout = null;
  function topogram() {
    if (scout) return scout;
    const NX = 110, NZ = 150, NY = 48, c = document.createElement('canvas'); c.width = NX; c.height = NZ;
    const x = c.getContext('2d'), id = x.createImageData(NX, NZ), acc = new Float32Array(NX * NZ);
    let mx = 0;
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
      let s = 0; const xx = (i + 0.5) / NX * 2 - 1, zz = (k + 0.5) / NZ;
      for (let j = 0; j < NY; j++) { const v = hu(xx, (j + 0.5) / NY * 1.4 - 0.7, zz); s += Math.max(0, v + 1000); }
      acc[k * NX + i] = s; mx = Math.max(mx, s);
    }
    for (let p = 0; p < NX * NZ; p++) { const g = Math.pow(acc[p] / mx, 2.2) * 255; id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = g; id.data[p * 4 + 3] = 255; }
    x.putImageData(id, 0, 0);
    return (scout = c);
  }

  /* Mean and SD of HU inside a circle (pixel units) */
  function roi(arr, n, cx, cy, r) {
    let s = 0, s2 = 0, k = 0;
    for (let j = Math.max(0, Math.floor(cy - r)); j <= Math.min(n - 1, Math.ceil(cy + r)); j++)
      for (let i = Math.max(0, Math.floor(cx - r)); i <= Math.min(n - 1, Math.ceil(cx + r)); i++)
        if ((i - cx) ** 2 + (j - cy) ** 2 <= r * r) { const v = arr[j * n + i]; s += v; s2 += v * v; k++; }
    const m = k ? s / k : 0;
    return { mean: m, sd: k ? Math.sqrt(Math.max(0, s2 / k - m * m)) : 0, n: k };
  }

  return { UNIT, hu, head, slice, thick, noise, kernel, toCanvas, draw, topogram, roi };
})();
