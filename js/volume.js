/* Part A: MIP, SSD and SVD rendered from one simulated abdominal CT volume.
   The volume is defined analytically in HU so it can be sampled anywhere along a ray. */
(() => {
  const { $, css, hiDPI } = U;
  const cv = $('vol'), ctx = cv.getContext('2d');
  let mode = 'mip', yaw = 0.5, pitch = -0.18, lo = 200, hi = 1200;
  let probe = { u: 0.06, v: 0.05 };          // default ray goes through the aorta
  const STEPS = 120, T0 = -1.25, T1 = 1.25;

  /* ---------- the patient (HU) ----------
     y = head(+) to feet(-), x = patient left/right, z = front(-) to back(+) */
  function hu(x, y, z) {
    if (y > 0.92 || y < -0.92) return -1000;
    const e = (x * x) / 0.6084 + (z * z) / 0.2704;           // body ellipse .78 x .52
    if (e > 1) return -1000;
    let v = e > 0.86 ? -90 : 40;                                // subcutaneous fat, then soft tissue
    if (y > -0.05 && e > 0.76 && e < 0.83 && z < 0.3) {         // ribs
      const m = (y + 2) % 0.2; if (m < 0.04) v = 700;
    }
    const sx = x, sz = z - 0.32;                                // spine with discs
    if (sx * sx + sz * sz < 0.0121) v = ((y + 2) % 0.24) < 0.185 ? 1000 : 90;
    if ((x + 0.36) ** 2 / 0.06 + (y - 0.38) ** 2 / 0.12 + (z + 0.02) ** 2 / 0.06 < 1 && v < 100) v = 60; // liver
    for (const kx of [-0.42, 0.42]) {                           // enhancing kidneys
      const dx = (x - kx) / 0.12, dy = (y + 0.25) / 0.23, dz = (z - 0.2) / 0.11;
      if (dx * dx + dy * dy + dz * dz < 1) v = Math.max(v, 170);
    }
    const ax = x - 0.06, az = z - 0.08;                         // aorta with contrast
    if (ax * ax + az * az < 0.0042 && y > -0.6) v = 330;
    if (Math.abs(y + 0.22) < 0.028 && Math.abs(z - 0.13) < 0.03 && Math.abs(x - 0.03) < 0.33 && Math.abs(x - 0.03) > 0.03) v = 330; // renal arteries
    if (y <= -0.6) for (const s of [-1, 1]) {                   // iliac arteries
      const ix = x - 0.06 - s * (-0.6 - y) * 0.6, iz = z - 0.08;
      if (ix * ix + iz * iz < 0.0025) v = 330;
    }
    return v;
  }

  /* camera: view (u,v,t) -> world, pitch about x then yaw about y */
  function basis() {
    const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
    return (u, v, t) => {
      const y = v * cp - t * sp, z1 = v * sp + t * cp;
      return [u * cy + z1 * sy, y, -u * sy + z1 * cy];
    };
  }

  /* walk one ray, returning sample HUs (used by renderer and the probe chart) */
  function samples(M, u, v, n) {
    const out = new Float32Array(n);
    for (let k = 0; k < n; k++) {
      const t = T0 + (T1 - T0) * k / (n - 1); const p = M(u, v, t);
      out[k] = hu(p[0], p[1], p[2]);
    }
    return out;
  }

  /* transfer function for SVD: colour and opacity per HU class */
  function tf(h) {
    if (h >= 600) return [238, 230, 212, 0.34];
    if (h >= 250) return [196, 46, 38, 0.26];
    if (h >= 120) return [176, 96, 72, 0.12];
    if (h >= -20) return [184, 132, 112, 0.02];
    return [214, 170, 140, 0.035];
  }

  function shadeSSD(M, u, v, t) {
    const e = 0.025, p = M(u, v, t);
    const inR = (x, y, z) => { const h = hu(x, y, z); return h >= lo && h <= hi ? 1 : 0; };
    let nx = inR(p[0] - e, p[1], p[2]) - inR(p[0] + e, p[1], p[2]);
    let ny = inR(p[0], p[1] - e, p[2]) - inR(p[0], p[1] + e, p[2]);
    let nz = inR(p[0], p[1], p[2] - e) - inR(p[0], p[1], p[2] + e);
    const len = Math.hypot(nx, ny, nz);
    const view = M(0, 0, 1);                                    // direction into the screen
    const lam = len ? Math.abs((nx * view[0] + ny * view[1] + nz * view[2]) / len) : 0.6;
    const depth = 1 - (t - T0) / (T1 - T0);
    return 0.18 + 0.82 * (0.55 * lam + 0.45 * depth);
  }

  let res = 150;
  function render() {
    const R = res, img = ctx.createImageData(R, R), d = img.data, M = basis();
    for (let j = 0; j < R; j++) for (let i = 0; i < R; i++) {
      const u = (i + 0.5) / R * 2 - 1, v = 1 - (j + 0.5) / R * 2;
      let r = 0, g = 0, b = 0;
      if (mode === 'mip') {
        let mx = -1000;
        for (let k = 0; k < STEPS; k++) { const p = M(u, v, T0 + (T1 - T0) * k / (STEPS - 1)); const h = hu(p[0], p[1], p[2]); if (h > mx) mx = h; }
        r = g = b = Math.max(0, Math.min(1, (mx + 160) / 760)) * 255;
      } else if (mode === 'ssd') {
        for (let k = 0; k < STEPS; k++) {
          const t = T0 + (T1 - T0) * k / (STEPS - 1), p = M(u, v, t), h = hu(p[0], p[1], p[2]);
          if (h >= lo && h <= hi) { const s = shadeSSD(M, u, v, t); r = 236 * s; g = 228 * s; b = 210 * s; break; }
        }
      } else {
        let a = 0;
        for (let k = 0; k < STEPS && a < 0.97; k++) {
          const p = M(u, v, T0 + (T1 - T0) * k / (STEPS - 1)), h = hu(p[0], p[1], p[2]);
          if (h < lo || h > hi || h === -1000) continue;
          const c = tf(h), w = (1 - a) * c[3];
          r += c[0] * w; g += c[1] * w; b += c[2] * w; a += w;
        }
      }
      const q = (j * R + i) * 4; d[q] = r; d[q + 1] = g; d[q + 2] = b; d[q + 3] = 255;
    }
    cv.width = R; cv.height = R;
    ctx.putImageData(img, 0, 0);
    // probe crosshair
    const px = (probe.u + 1) / 2 * R, py = (1 - probe.v) / 2 * R;
    ctx.strokeStyle = '#e3735b'; ctx.lineWidth = R / 150;
    ctx.beginPath(); ctx.arc(px, py, R / 28, 0, Math.PI * 2);
    ctx.moveTo(px - R / 16, py); ctx.lineTo(px - R / 40, py); ctx.moveTo(px + R / 40, py); ctx.lineTo(px + R / 16, py);
    ctx.moveTo(px, py - R / 16); ctx.lineTo(px, py - R / 40); ctx.moveTo(px, py + R / 40); ctx.lineTo(px, py + R / 16);
    ctx.stroke();
    drawProbe();
  }

  /* ---------- probe chart: HU along the chosen ray ---------- */
  function drawProbe() {
    const pc = $('probe'); const { ctx: c, w, h } = hiDPI(pc, 220 / 560);
    const ink = css('--ink'), ink2 = css('--ink-2'), rule = css('--rule'), beam = css('--beam'), marker = css('--marker');
    c.clearRect(0, 0, w, h);
    const L = 46, Rm = 10, Tm = 12, B = 26, W = w - L - Rm, H = h - Tm - B;
    const n = 220, s = samples(basis(), probe.u, probe.v, n);
    const Y = (v) => Tm + H * (1 - (v + 1000) / 2300), X = (k) => L + W * k / (n - 1);
    c.font = '11px "JetBrains Mono", monospace'; c.textBaseline = 'middle';
    // range band
    if (mode !== 'mip') { c.fillStyle = beam; c.globalAlpha = 0.18; c.fillRect(L, Y(hi), W, Y(lo) - Y(hi)); c.globalAlpha = 1; }
    // grid
    for (const g of [-1000, 0, 500, 1000]) {
      c.strokeStyle = rule; c.lineWidth = 1; c.beginPath(); c.moveTo(L, Y(g)); c.lineTo(L + W, Y(g)); c.stroke();
      c.fillStyle = ink2; c.textAlign = 'right'; c.fillText(g, L - 6, Y(g));
    }
    c.textAlign = 'left'; c.fillStyle = ink2; c.fillText('front', L, h - 9); c.textAlign = 'right'; c.fillText('back', L + W, h - 9);
    c.textAlign = 'center'; c.fillText('HU along the ray', L + W / 2, h - 9);
    // profile
    c.strokeStyle = ink; c.lineWidth = 1.6; c.beginPath();
    for (let k = 0; k < n; k++) { const x = X(k), y = Y(s[k]); k ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    // per-mode marker
    const note = $('probeNote');
    const dot = (k, col) => { c.fillStyle = col; c.beginPath(); c.arc(X(k), Y(s[k]), 5, 0, Math.PI * 2); c.fill(); };
    if (mode === 'mip') {
      let mk = 0; for (let k = 1; k < n; k++) if (s[k] > s[mk]) mk = k;
      dot(mk, marker);
      note.innerHTML = s[mk] <= -1000 ? 'This ray misses the patient, so the pixel stays black.'
        : `The highest value on this ray is <b>${s[mk]} HU</b>. MIP throws everything else away and paints the pixel with that value. Where it sits in depth does not matter, which is why MIP has no 3D depth.`;
    } else if (mode === 'ssd') {
      const k = s.findIndex(v => v >= lo && v <= hi);
      if (k < 0) note.innerHTML = 'No value on this ray falls inside the range, so SSD draws nothing here.';
      else { dot(k, marker); note.innerHTML = `The first value inside the range (${lo} to ${hi} HU) is <b>${s[k]} HU</b>. SSD treats that as the surface of the object and shades it. Everything behind it is hidden.`; }
    } else {
      let a = 0; c.strokeStyle = marker; c.lineWidth = 1.6; c.setLineDash([4, 3]); c.beginPath();
      for (let k = 0; k < n; k++) {
        const v = s[k]; if (v >= lo && v <= hi && v !== -1000) { const t = tf(v); a += (1 - a) * Math.min(1, t[3] * STEPS / n * 1.0); }
        const x = X(k), y = Tm + H * (1 - a); k ? c.lineTo(x, y) : c.moveTo(x, y);
      }
      c.stroke(); c.setLineDash([]);
      c.fillStyle = marker; c.textAlign = 'right'; c.fillText('opacity builds up', L + W - 4, Tm + 8);
      note.innerHTML = `Every value inside the range adds a little colour and opacity (dashed line). Nothing is thrown away, so tissue in front and behind both show. Narrow or widen the range and this curve changes a lot.`;
    }
  }

  /* ---------- notes per algorithm ---------- */
  const NOTES = {
    mip: `<h4>Maximum intensity projection</h4><p>In plain words: on each line of sight, only the <b>brightest</b> value is shown.</p><ul>
      <li><b>Simplest form</b> of 3D imaging</li>
      <li>Reconstructs an image by selecting the <b>highest value pixels</b> along an arbitrary line</li>
      <li>Widely used in <b>CT angiography</b></li></ul>
      <p class="watch">Watch for: contrast-filled aorta, renal and iliac arteries stand out because they are the brightest thing on their rays after bone. Rotate it: front and back overlap, there is no depth.</p>`,
    ssd: `<h4>Shaded surface display</h4><p>In plain words: you pick a range of CT numbers. The first thing in that range becomes a <b>solid surface</b>, and anything behind it is hidden.</p><ul>
      <li>A <b>computer-aided technique</b></li>
      <li>Identifies a <b>narrow range of values</b> as belonging to the object to be imaged</li>
      <li>Applications: <b>bone imaging</b> and <b>virtual colonoscopy</b></li></ul>
      <p class="watch">Watch for: press Bone and you get a clean skeleton surface. Press Skin surface and the outside of the body becomes the object, the same idea as the inner wall in virtual colonoscopy.</p>`,
    svd: `<h4>Shaded volume display</h4><p>In plain words: <b>everything</b> in your chosen range is shown, partly see-through, so you see inside as well as the surface.</p><ul>
      <li><b>Very sensitive to the operator-selected pixel range</b></li>
      <li>Provides an image that appears <b>very 3D</b> (volume rendered)</li></ul>
      <p class="watch">Watch for: move the lower limit from 200 down to -100 and see how much the picture changes. That sensitivity is the board point.</p>`
  };

  function setMode(m) {
    mode = m; $('rangeBox').hidden = m === 'mip'; $('volNotes').innerHTML = NOTES[m];
    if (m === 'ssd' && lo < 150 && lo > -200) setRange(200, 1200);
    render();
  }
  function setRange(a, b) {
    lo = a; hi = Math.max(b, a + 10); $('lo').value = lo; $('hi').value = hi;
    $('loOut').textContent = lo + ' HU'; $('hiOut').textContent = hi + ' HU';
  }
  U.seg('volMode', 'm', setMode);
  $('lo').addEventListener('input', e => { setRange(+e.target.value, hi); render(); });
  $('hi').addEventListener('input', e => { setRange(lo, +e.target.value); render(); });
  document.querySelectorAll('.presets button').forEach(b => b.addEventListener('click', () => { setRange(+b.dataset.lo, +b.dataset.hi); render(); }));

  /* drag to rotate, tap to probe; low resolution while dragging keeps it smooth */
  let drag = null, raf = 0;
  const queue = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); };
  cv.addEventListener('pointerdown', e => { cv.setPointerCapture(e.pointerId); drag = { x: e.clientX, y: e.clientY, yaw, pitch, moved: false }; });
  cv.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
    if (!drag.moved) return;
    yaw = drag.yaw + dx * 0.012; pitch = Math.max(-0.9, Math.min(0.9, drag.pitch + dy * 0.008));
    res = 80; queue();
  });
  cv.addEventListener('pointerup', e => {
    if (drag && !drag.moved) {
      const r = cv.getBoundingClientRect();
      probe = { u: ((e.clientX - r.left) / r.width) * 2 - 1, v: 1 - ((e.clientY - r.top) / r.height) * 2 };
    }
    drag = null; res = 150; render();
  });
  cv.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') yaw -= 0.15; else if (e.key === 'ArrowRight') yaw += 0.15;
    else if (e.key === 'ArrowUp') pitch = Math.max(-0.9, pitch - 0.1); else if (e.key === 'ArrowDown') pitch = Math.min(0.9, pitch + 0.1); else return;
    e.preventDefault(); render();
  });
  cv.tabIndex = 0;

  U.onRedraw(drawProbe);
  setMode('mip');
})();
