/* Scanner bench: forward projection (raw data), back projection, filtered back projection
   and iterative reconstruction (SIRT) on the same simulated slice. Parallel beam over 180°. */
(() => {
  const { $, css, hiDPI, reduced } = U;
  const N = 72, NB = 105, SMAX = 1.25, DS = 2 * SMAX / (NB - 1), L = 2 / N;
  const st = { phantom: 'abdomen', method: 'fbp', kernel: 'soft', dose: 'std', n: 90, iters: 12 };

  /* ---------- phantoms ---------- */
  function makePhantom(kind) {
    const img = new Float32Array(N * N);
    const E = kind === 'dot' ? [[0.3, 0.25, 0.045, 0.045, 1]] : [
      [0, 0, 0.86, 0.62, 0.92],     // subcutaneous fat
      [0, 0, 0.79, 0.55, 1.0],      // soft tissue
      [-0.38, 0.12, 0.34, 0.3, 1.07],   // liver
      [0.27, 0.27, 0.15, 0.1, 0.05],    // gas in the stomach
      [-0.4, -0.22, 0.11, 0.15, 1.22],  // kidneys
      [0.4, -0.22, 0.11, 0.15, 1.22],
      [0.07, -0.16, 0.065, 0.065, 1.45],// aorta with contrast
      [-0.12, -0.12, 0.07, 0.055, 1.2], // IVC
      [0, -0.37, 0.14, 0.13, 1.9],      // vertebral body
      [0, -0.53, 0.05, 0.04, 1.0],      // spinal canal
    ];
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i + 0.5 - N / 2) / (N / 2), y = (N / 2 - j - 0.5) / (N / 2);
      let v = 0;
      for (const [cx, cy, rx, ry, val] of E) if (((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 < 1) v = val;
      img[j * N + i] = v;
    }
    return img;
  }

  /* ---------- geometry: which detector bin each pixel falls into, per angle ---------- */
  let G = null;
  function geom(n) {
    const b0 = new Int16Array(n * N * N), w = new Float32Array(n * N * N);
    for (let k = 0; k < n; k++) {
      const th = Math.PI * k / n, c = Math.cos(th), s = Math.sin(th);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = (i + 0.5 - N / 2) / (N / 2), y = (N / 2 - j - 0.5) / (N / 2);
        const f = (x * c + y * s + SMAX) / DS, b = Math.floor(f), q = k * N * N + j * N + i;
        b0[q] = b; w[q] = f - b;
      }
    }
    return { n, b0, w };
  }
  function projectOne(img, k, out, off) {
    out.fill(0, off, off + NB);
    const base = k * N * N;
    for (let p = 0; p < N * N; p++) {
      const v = img[p]; if (!v) continue;
      const b = G.b0[base + p], w = G.w[base + p];
      out[off + b] += v * (1 - w) * L; out[off + b + 1] += v * w * L;
    }
  }
  function backOne(prof, off, k, acc, scale) {
    const base = k * N * N;
    for (let p = 0; p < N * N; p++) {
      const b = G.b0[base + p], w = G.w[base + p];
      acc[p] += (prof[off + b] * (1 - w) + prof[off + b + 1] * w) * scale;
    }
  }

  /* ---------- convolution filters (Ram-Lak plus a soft or sharp variant) ---------- */
  const RL = (() => { const h = new Float32Array(2 * NB + 1); for (let m = -NB; m <= NB; m++) h[m + NB] = m === 0 ? 1 / (4 * DS * DS) : (m % 2 ? -1 / (Math.PI * Math.PI * m * m * DS * DS) : 0); return h; })();
  function filterProfile(p, off, kernel, out) {
    let src = p.slice(off, off + NB);
    const smooth = (a) => a.map((v, i) => 0.25 * (a[i - 1] || 0) + 0.5 * v + 0.25 * (a[i + 1] || 0));
    if (kernel === 'soft') src = smooth(src);
    for (let i = 0; i < NB; i++) { let s = 0; for (let j = 0; j < NB; j++) s += src[j] * RL[i - j + NB]; out[off + i] = s * DS; }
    if (kernel === 'bone') {
      const t = out.slice(off, off + NB);
      for (let i = 0; i < NB; i++) out[off + i] = 1.7 * t[i] - 0.35 * (t[i - 1] || 0) - 0.35 * (t[i + 1] || 0);
    }
  }

  /* ---------- state of a scan ---------- */
  let phantom, sino, filt, recon, k = 0, iter = 0, playing = false, raf = 0;
  function reset() {
    cancelAnimationFrame(raf); playing = false;
    phantom = makePhantom(st.phantom);
    if (!G || G.n !== st.n) G = geom(st.n);
    sino = new Float32Array(st.n * NB); filt = new Float32Array(st.n * NB); recon = new Float32Array(N * N);
    k = 0; iter = 0;
    $('scanBtn').textContent = 'Scan';
    drawAll();
  }

  function acquire(kk) {
    projectOne(phantom, kk, sino, kk * NB);
    if (st.dose === 'low') {                       // fewer photons: more quantum noise in the raw data
      const rand = U.rng(1234 + kk * 7919);
      for (let b = 0; b < NB; b++) sino[kk * NB + b] += U.gauss(rand) * (st.phantom === 'dot' ? 0.004 : 0.03);
    } else if (st.phantom !== 'dot') {
      const rand = U.rng(99 + kk * 31);
      for (let b = 0; b < NB; b++) sino[kk * NB + b] += U.gauss(rand) * 0.004;
    }
    if (st.method === 'bp') backOne(sino, kk * NB, kk, recon, Math.PI / st.n);
    if (st.method === 'fbp') { filterProfile(sino, kk * NB, st.kernel, filt); backOne(filt, kk * NB, kk, recon, Math.PI / st.n); }
  }

  /* SIRT: start flat, compare projections, correct, repeat */
  let R = null, C = null;
  function sirtInit() {
    const ones = new Float32Array(N * N).fill(1);
    R = new Float32Array(st.n * NB); for (let kk = 0; kk < st.n; kk++) projectOne(ones, kk, R, kk * NB);
    const onesP = new Float32Array(st.n * NB).fill(1);
    C = new Float32Array(N * N); for (let kk = 0; kk < st.n; kk++) backOne(onesP, kk * NB, kk, C, L);
    let total = 0; for (let b = 0; b < NB; b++) total += sino[b] * DS;  // area integral from one projection
    const flat = Math.max(0, total / (Math.PI * 0.95));
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const x = (i + 0.5 - N / 2) / (N / 2), y = (N / 2 - j - 0.5) / (N / 2);
      recon[j * N + i] = x * x + y * y < 0.95 ? flat : 0;
    }
  }
  function sirtStep() {
    const est = new Float32Array(st.n * NB);
    for (let kk = 0; kk < st.n; kk++) projectOne(recon, kk, est, kk * NB);
    for (let q = 0; q < est.length; q++) est[q] = R[q] > 1e-6 ? (sino[q] - est[q]) / R[q] : 0;
    const upd = new Float32Array(N * N);
    for (let kk = 0; kk < st.n; kk++) backOne(est, kk * NB, kk, upd, L);
    for (let p = 0; p < N * N; p++) if (C[p] > 1e-6) recon[p] = Math.max(0, recon[p] + 1.6 * upd[p] / C[p]);
  }

  /* ---------- drawing ---------- */
  const off = document.createElement('canvas'); off.width = N; off.height = N;
  const offS = document.createElement('canvas'); offS.width = NB;

  function grayImage(arr, lo, hi) {
    const o = off.getContext('2d'), id = o.createImageData(N, N);
    for (let p = 0; p < N * N; p++) { const g = Math.max(0, Math.min(1, (arr[p] - lo) / (hi - lo))) * 255; id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = g; id.data[p * 4 + 3] = 255; }
    o.putImageData(id, 0, 0); return off;
  }

  function drawGantry() {
    const cv = $('gantry'); const { ctx: c, w } = hiDPI(cv, 1);
    const cx = w / 2, cy = w / 2, S = w / 2 / 1.75;          // world unit -> px
    c.fillStyle = '#000'; c.fillRect(0, 0, w, w);
    // gantry ring
    c.strokeStyle = '#2b3033'; c.lineWidth = w * 0.05; c.beginPath(); c.arc(cx, cy, S * 1.6, 0, Math.PI * 2); c.stroke();
    // patient
    c.imageSmoothingEnabled = true; c.globalAlpha = 0.85;
    c.drawImage(grayImage(phantom, 0, st.phantom === 'dot' ? 1 : 2), cx - S, cy - S, 2 * S, 2 * S);
    c.globalAlpha = 1;
    if (k >= st.n && !playing) { label(c, w, 'Scan complete'); return; }
    const kk = Math.min(k, st.n - 1), th = Math.PI * kk / st.n;
    const sx = Math.cos(th), sy = -Math.sin(th);             // detector axis on screen
    const dx = -Math.sin(th), dy = -Math.cos(th);            // ray direction on screen
    const beam = css('--beam');
    // rays
    c.strokeStyle = beam; c.globalAlpha = 0.22; c.lineWidth = 1;
    for (let s = -1.15; s <= 1.15; s += 0.12) {
      c.beginPath(); c.moveTo(cx + sx * s * S - dx * 1.45 * S, cy + sy * s * S - dy * 1.45 * S);
      c.lineTo(cx + sx * s * S + dx * 1.35 * S, cy + sy * s * S + dy * 1.35 * S); c.stroke();
    }
    c.globalAlpha = 1;
    // tube
    c.save(); c.translate(cx - dx * 1.55 * S, cy - dy * 1.55 * S); c.rotate(Math.atan2(sy, sx));
    c.fillStyle = beam; c.fillRect(-S * 1.2, -S * 0.07, S * 2.4, S * 0.14); c.restore();
    // detector
    const ddx = cx + dx * 1.42 * S, ddy = cy + dy * 1.42 * S;
    c.strokeStyle = '#d9dcd6'; c.lineWidth = 3; c.beginPath();
    c.moveTo(ddx - sx * SMAX * S, ddy - sy * SMAX * S); c.lineTo(ddx + sx * SMAX * S, ddy + sy * SMAX * S); c.stroke();
    // attenuation profile, drawn outward from the detector
    let mx = 1e-6; for (let b = 0; b < NB; b++) mx = Math.max(mx, sino[kk * NB + b]);
    c.strokeStyle = '#e3735b'; c.lineWidth = 1.8; c.beginPath();
    for (let b = 0; b < NB; b++) {
      const s = -SMAX + b * DS, a = Math.max(0, sino[kk * NB + b]) / mx * 0.28 * S;
      const x = ddx + sx * s * S + dx * (a + 3), y = ddy + sy * s * S + dy * (a + 3);
      b ? c.lineTo(x, y) : c.moveTo(x, y);
    }
    c.stroke();
    c.fillStyle = '#9aa19c'; c.font = '11px "JetBrains Mono", monospace'; c.textAlign = 'left';
    c.fillText(`${Math.round(180 * kk / st.n)}°`, 10, 18);
  }
  function label(c, w, t) { c.fillStyle = '#9aa19c'; c.font = '11px "JetBrains Mono", monospace'; c.textAlign = 'left'; c.fillText(t, 10, 18); }

  function drawSino() {
    const cv = $('sino'); const { ctx: c, w } = hiDPI(cv, 1);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, w);
    offS.height = st.n; const o = offS.getContext('2d'), id = o.createImageData(NB, st.n);
    let mx = 1e-6; for (const v of sino) mx = Math.max(mx, v);
    for (let q = 0; q < st.n * NB; q++) { const g = Math.max(0, sino[q] / mx) * 255; id.data[q * 4] = id.data[q * 4 + 1] = id.data[q * 4 + 2] = g; id.data[q * 4 + 3] = 255; }
    o.putImageData(id, 0, 0);
    c.imageSmoothingEnabled = st.n > 30; c.drawImage(offS, 0, 0, w, w);
    if (k < st.n) { c.strokeStyle = '#e3735b'; c.lineWidth = 1; const y = (k / st.n) * w; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    label(c, w, 'detector →   angle ↓');
  }

  function drawRecon() {
    const cv = $('recon'); const { ctx: c, w } = hiDPI(cv, 1);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, w);
    let lo = 0.78, hi = 1.55;
    if (st.method === 'bp' || st.phantom === 'dot') { lo = Infinity; hi = -Infinity; for (const v of recon) { lo = Math.min(lo, v); hi = Math.max(hi, v); } if (hi - lo < 1e-6) hi = lo + 1; if (st.method !== 'bp') lo = 0; }
    c.imageSmoothingEnabled = true; c.drawImage(grayImage(recon, lo, hi), 0, 0, w, w);
    const t = st.method === 'ir' ? (iter ? `iteration ${iter}` : (k >= st.n ? 'flat first guess' : 'waiting for all projections')) : `${Math.min(k, st.n)} projections added`;
    label(c, w, t);
  }

  const NOTE = {
    bp: 'Back projection: each profile is spread straight back across the image, and all of them are added up. The result is never sharp. Every bright object gets a halo of spokes, the typical star pattern. Try the single dot with 6 projections.',
    fbp: 'Filtered back projection: each profile is filtered (convolution) first, then spread back. The smoothing filter keeps the image clean but blurs edges (soft tissue). The edge-enhancing filter sharpens edges but makes the image grainier (bone). Try low dose to see noise and streaks.',
    ir: 'Iterative reconstruction: it waits until every projection is collected. Then it starts from a flat guess (every point the same value), checks that guess against the real measurements, corrects it, and repeats. At low dose its image stays cleaner than filtered back projection, which is why it allows a lower patient dose.'
  };
  function drawAll() {
    drawGantry(); drawSino(); drawRecon();
    $('methodNote').textContent = NOTE[st.method];
    $('reconCap').textContent = { bp: 'Image data: back projection', fbp: 'Image data: filtered back projection', ir: 'Image data: iterative reconstruction' }[st.method];
    $('status').textContent = k < st.n ? `Projection ${k} of ${st.n}` : (st.method === 'ir' ? `All ${st.n} projections collected · ${iter} of ${st.iters} iterations` : `All ${st.n} projections collected`);
  }

  /* ---------- running a scan ---------- */
  function tick() {
    const per = Math.max(1, Math.round(st.n / 70));
    if (k < st.n) { for (let i = 0; i < per && k < st.n; i++) acquire(k++); if (k === st.n && st.method === 'ir') sirtInit(); }
    else if (st.method === 'ir' && iter < st.iters) { sirtStep(); iter++; }
    else { playing = false; $('scanBtn').textContent = 'Scan again'; drawAll(); return; }
    drawAll();
    raf = requestAnimationFrame(st.method === 'ir' && k >= st.n ? () => setTimeout(tick, 90) : tick);
  }
  function scan() { reset(); if (reduced()) return instant(); playing = true; $('scanBtn').textContent = 'Scanning…'; tick(); }
  function instant() {
    cancelAnimationFrame(raf);
    if (k === 0 || k >= st.n) reset();
    while (k < st.n) acquire(k++);
    if (st.method === 'ir') { sirtInit(); while (iter < st.iters) { sirtStep(); iter++; } }
    playing = false; $('scanBtn').textContent = 'Scan again'; drawAll();
  }

  /* ---------- controls ---------- */
  const syncGroups = () => { $('kernelGroup').hidden = st.method !== 'fbp'; $('iterGroup').hidden = st.method !== 'ir'; };
  const rerun = () => { syncGroups(); instant(); };
  U.seg('phantomSeg', 'p', v => { st.phantom = v; rerun(); });
  U.seg('methodSeg', 'r', v => { st.method = v; rerun(); });
  U.seg('kernelSeg', 'k', v => { st.kernel = v; rerun(); });
  U.seg('doseSeg', 'd', v => { st.dose = v; rerun(); });
  $('nProj').addEventListener('input', e => { st.n = +e.target.value; $('nOut').textContent = st.n; });
  $('nProj').addEventListener('change', () => rerun());
  $('nIter').addEventListener('input', e => { st.iters = +e.target.value; $('itOut').textContent = st.iters; });
  $('nIter').addEventListener('change', () => rerun());
  $('scanBtn').addEventListener('click', scan);
  $('instantBtn').addEventListener('click', () => { reset(); instant(); });
  U.onRedraw(() => drawAll());

  syncGroups(); reset(); instant();
})();
