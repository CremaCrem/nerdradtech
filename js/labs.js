/* Convolution profile, back projection vs FBP of a dot, Fourier waves with sound, helical interpolation */
(() => {
  const { $, css, hiDPI } = U;

  /* ---------- convolution ---------- */
  const RAW = [0, 0, 0, 1, 6, 6, 6, 6, 6, 1, 0, 0, 0, 0];
  const KER = { raw: null, smooth: [0.25, 0.5, 0.25], sharp: [-0.5, 2, -0.5] };
  const CTXT = {
    raw: 'The raw attenuation profile. It rises from 1 to 6 at each edge of the structure.',
    smooth: 'Smoothing: each value is averaged with its neighbours, so the jump at each edge becomes gentler. Noise gets averaged away too, but edges blur. Suits soft tissue.',
    sharp: 'Edge enhancing: each value is pushed away from its neighbours. The edges overshoot above 6 and dip below 0, so boundaries look crisp. Noise is exaggerated the same way. Suits bone.'
  };
  let convMode = 'raw';
  function drawConv() {
    const k = KER[convMode], v = k ? RAW.map((_, i) => k.reduce((s, w, j) => s + w * (RAW[i + j - 1] ?? 0), 0)) : RAW;
    const n = v.length, bw = 400 / n, base = 122, sc = 14; let o = '';
    o += `<line x1="10" y1="${base}" x2="410" y2="${base}" stroke="var(--ink)" stroke-width="1"/>`;
    v.forEach((x, i) => {
      const hgt = x * sc, y = hgt >= 0 ? base - hgt : base, X = 10 + i * bw;
      if (k) o += `<rect x="${X + 4}" y="${base - RAW[i] * sc}" width="${bw - 8}" height="${RAW[i] * sc}" fill="none" stroke="var(--ink-2)" stroke-dasharray="3 3"/>`;
      o += `<rect x="${X + 4}" y="${y}" width="${bw - 8}" height="${Math.abs(hgt)}" fill="${x < 0 ? 'var(--marker)' : 'var(--control)'}"/>`;
      o += `<text x="${X + bw / 2}" y="${178}" text-anchor="middle" font-size="11" fill="var(--ink-2)">${+x.toFixed(2)}</text>`;
    });
    if (k) o += `<text x="410" y="16" text-anchor="end" font-size="11" fill="var(--ink-2)">dashed = before filtering</text>`;
    $('convSvg').innerHTML = o; $('convText').textContent = CTXT[convMode];
  }
  U.seg('convSeg', 'c', m => { convMode = m; drawConv(); });
  drawConv();

  /* ---------- back projection vs FBP of one dot ---------- */
  function dot(cv, n, filtered) {
    const N = cv.width, c = (N - 1) / 2, ctx = cv.getContext('2d'), img = ctx.createImageData(N, N), acc = new Float32Array(N * N);
    const px = 0.28 * c, py = 0.2 * c;
    const h = (k) => k === 0 ? 0.25 : (k % 2 ? -1 / (Math.PI * Math.PI * k * k) : 0);
    for (let a = 0; a < n; a++) {
      const th = Math.PI * a / n, ct = Math.cos(th), st = Math.sin(th), s0 = px * ct + py * st;
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const d = (i - c) * ct + (c - j) * st - s0;
        acc[j * N + i] += filtered ? h(Math.round(d)) : (Math.abs(d) < 0.8 ? 1 : 0);
      }
    }
    let mx = 1e-9; for (const v of acc) mx = Math.max(mx, v);
    for (let p = 0; p < N * N; p++) { const g = Math.pow(Math.max(0, acc[p] / mx), filtered ? 0.7 : 0.9) * 255; img.data[p * 4] = img.data[p * 4 + 1] = img.data[p * 4 + 2] = g; img.data[p * 4 + 3] = 255; }
    ctx.putImageData(img, 0, 0);
  }
  function drawDots() {
    const n = +$('dotN').value; $('dotOut').textContent = n;
    dot($('dotBP'), n, false); dot($('dotFBP'), n, true);
    $('dotText').innerHTML = n === 1 ? 'With one projection there is only a single stripe. One back projection tells you almost nothing about where the dot is.'
      : n < 8 ? 'A few projections: the stripes cross where the dot is, but each stripe still runs right across the image.'
      : 'Many projections: the left image now resembles the dot but keeps a faint halo of spokes, the <b>star pattern</b>. On the right the filter has cancelled the spokes and the dot is sharp.';
  }
  $('dotN').addEventListener('input', drawDots); drawDots();

  /* ---------- Fourier: one complex wave = sum of simple waves ---------- */
  const W = [{ a: 1, f: 1, hz: 220 }, { a: 0.55, f: 3, hz: 330 }, { a: 0.35, f: 7, hz: 550 }];
  const on = [true, true, true];
  function drawWaves() {
    const { ctx: c, w, h } = hiDPI($('waves'), 300 / 640);
    const ink = css('--ink'), ink2 = css('--ink-2'), cols = [css('--control'), css('--beam-ink'), css('--marker')], rule = css('--rule');
    c.clearRect(0, 0, w, h);
    const L = Math.min(110, w * 0.2), top = h * 0.25, rowH = h * 0.18;
    c.font = '12px "IBM Plex Mono", monospace'; c.textBaseline = 'middle';
    const wave = (yc, amp, fn, col, width, dash) => {
      c.strokeStyle = col; c.lineWidth = width; c.setLineDash(dash || []); c.beginPath();
      for (let x = 0; x <= w - L - 10; x += 2) { const t = x / (w - L - 10) * 4 * Math.PI, y = yc - fn(t) * amp; x ? c.lineTo(L + x, y) : c.moveTo(L + x, y); }
      c.stroke(); c.setLineDash([]);
    };
    c.strokeStyle = rule; c.lineWidth = 1; c.beginPath(); c.moveTo(0, top + h * 0.15); c.lineTo(w, top + h * 0.15); c.stroke();
    c.fillStyle = ink; c.fillText('What reaches', 0, top - 8); c.fillText('the ear', 0, top + 8);
    wave(top, h * 0.11, t => W.reduce((s, q, i) => s + (on[i] ? q.a * Math.sin(q.f * t) : 0), 0), ink, 2.2);
    W.forEach((q, i) => {
      const yc = top + h * 0.3 + i * rowH;
      c.fillStyle = on[i] ? cols[i] : ink2; c.fillText(['Low', 'Middle', 'High'][i] + ' wave', 0, yc);
      wave(yc, h * 0.06 * q.a * 1.4, t => Math.sin(q.f * t), on[i] ? cols[i] : ink2, on[i] ? 1.8 : 1, on[i] ? null : [3, 4]);
    });
  }
  document.querySelectorAll('#waveSeg button').forEach(b => b.addEventListener('click', () => {
    const i = +b.dataset.w; on[i] = !on[i]; b.setAttribute('aria-pressed', on[i]); drawWaves();
  }));
  let actx = null;
  $('playBtn').addEventListener('click', () => {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const t0 = actx.currentTime, g = actx.createGain(); g.connect(actx.destination);
      g.gain.setValueAtTime(0, t0); g.gain.linearRampToValueAtTime(0.18, t0 + 0.05); g.gain.setValueAtTime(0.18, t0 + 1.4); g.gain.linearRampToValueAtTime(0, t0 + 1.8);
      W.forEach((q, i) => { if (!on[i]) return; const o = actx.createOscillator(), og = actx.createGain(); o.frequency.value = q.hz; og.gain.value = q.a; o.connect(og).connect(g); o.start(t0); o.stop(t0 + 1.85); });
      $('playNote').textContent = on.some(Boolean) ? 'You hear one sound. Your ear is separating it into the waves shown.' : 'All waves are off, so there is nothing to hear.';
    } catch (e) { $('playNote').textContent = 'Sound is not available in this browser.'; }
  });
  drawWaves(); U.onRedraw(drawWaves);

  /* ---------- helical interpolation (360° linear interpolation) ---------- */
  const SEL = 120;  // the angle we label in detail
  function drawHelix() {
    const { ctx: c, w, h } = hiDPI($('helix'), 320 / 680);
    const ink = css('--ink'), ink2 = css('--ink-2'), rule = css('--rule'), beam = css('--beam'), marker = css('--marker'), control = css('--control');
    c.clearRect(0, 0, w, h);
    const L = 54, R = 16, T = 16, B = 40, PW = w - L - R, PH = h - T - B;
    const zs = 1 + +$('zPos').value / 100 * 0.98;            // slice position in rotations
    const X = a => L + PW * a / 360, Y = z => T + PH * (1 - z / 3);
    c.font = '11px "IBM Plex Mono", monospace'; c.textBaseline = 'middle';
    // axes
    c.strokeStyle = rule; c.lineWidth = 1;
    for (let z = 0; z <= 3; z++) { c.beginPath(); c.moveTo(L, Y(z)); c.lineTo(L + PW, Y(z)); c.stroke(); }
    c.fillStyle = ink2; c.textAlign = 'right';
    for (let z = 0; z <= 3; z++) c.fillText(`${z} rot`, L - 6, Y(z));
    c.textAlign = 'center'; for (const a of [0, 90, 180, 270, 360]) c.fillText(a + '°', X(a), h - B + 14);
    c.fillText('gantry angle', L + PW / 2, h - 10);
    c.save(); c.translate(12, T + PH / 2); c.rotate(-Math.PI / 2); c.fillText('table position', 0, 0); c.restore();
    // the helix unrolled: one slanted line per rotation, with measurement points
    c.strokeStyle = beam; c.lineWidth = 2.5;
    for (let m = 0; m < 3; m++) { c.beginPath(); c.moveTo(X(0), Y(m)); c.lineTo(X(360), Y(m + 1)); c.stroke(); }
    // slice
    c.strokeStyle = ink; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(L, Y(zs)); c.lineTo(L + PW, Y(zs)); c.stroke(); c.setLineDash([]);
    c.fillStyle = ink; c.textAlign = 'right'; c.fillText('slice to build', L + PW, Y(zs) - 10);
    // interpolation pairs every 30°
    for (let a = 0; a < 360; a += 30) {
      const zl = Math.floor(zs - a / 360) + a / 360, zu = zl + 1, sel = a === SEL;
      c.strokeStyle = sel ? marker : ink2; c.lineWidth = sel ? 2 : 1;
      c.beginPath(); c.moveTo(X(a), Y(zl)); c.lineTo(X(a), Y(zu)); c.stroke();
      c.fillStyle = sel ? marker : ink2;
      for (const z of [zl, zu]) { c.beginPath(); c.arc(X(a), Y(z), sel ? 5 : 3, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = control; c.beginPath(); c.arc(X(a), Y(zs), sel ? 5 : 3, 0, Math.PI * 2); c.fill();
    }
    const zl = Math.floor(zs - SEL / 360) + SEL / 360, f = zs - zl, B2 = 5 + 10 * f;
    c.fillStyle = marker; c.textAlign = 'right';
    c.fillText('A = 5', X(SEL) - 9, Y(zl)); c.fillText('C = 15', X(SEL) - 9, Y(zl + 1)); c.textAlign = 'left';
    c.fillStyle = control; c.fillText(`B = ${+B2.toFixed(1)}`, X(SEL) + 9, Y(zs) + 12);
    $('zOut').textContent = `${Math.round(f * 100)}% of the way from A to C`;
    $('helixText').innerHTML = `At ${SEL}°, the tube measured this angle once below the slice (A = 5) and again one full rotation later above it (C = 15). The slice sits ${Math.round(f * 100)}% of the way between them, so the estimate is B = 5 + ${f.toFixed(2)} × (15 − 5) = <b>${B2.toFixed(1)}</b>. The scanner does this at every angle to straighten the spiral into a flat slice. Because A and C are a whole rotation apart, the slice borrows data from a thick band of the patient, which is the blurring the slide warns about.`;
  }
  $('zPos').addEventListener('input', drawHelix); drawHelix(); U.onRedraw(drawHelix);
})();
