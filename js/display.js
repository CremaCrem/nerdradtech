/* Chapter V: a CT workstation. Scout with reference line, cursor HU, ROI (mean, SD), distance, annotation,
   grid, magnification vs smaller DFOV, reverse display, multiple image display. Image coords are pixels of an N×N matrix. */
(() => {
  const { $, hiDPI } = U;
  const N = 256, cv = $('wsCv'), sc = $('wsScout');
  const st = { tool: 'cursor', z: 0.56, ww: 400, wl: 40, grid: false, mag: false, dfov: false, flip: false, inv: false, multi: false, roi: null, ruler: null, notes: [], hover: null };
  const cache = {};
  const fov = () => st.dfov ? 20 : 40, cy = () => st.dfov ? 2 : 0;
  const img = (z = st.z) => { const k = z.toFixed(3) + '|' + st.dfov; return cache[k] || (cache[k] = Phantom.noise(Phantom.slice(z, N, fov(), -4 * st.dfov, cy(), { lesion: 1 }), 10, Math.round(z * 1000))); };
  const pxmm = () => fov() * 10 / N;
  const fmt = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n));

  /* image pixel <-> canvas pixel, honouring magnification and L/R reverse */
  const view = w => { const s = st.mag ? 2 : 1, o = st.mag ? N / 4 : 0, k = w / N * s; return { k, o }; };
  const toC = (x, y, w) => { const { k, o } = view(w); return [((st.flip ? N - x : x) - o) * k, (y - o) * k]; };
  const fromC = (X, Y, w) => { const { k, o } = view(w); let x = X / k + o; if (st.flip) x = N - x; return [x, Y / k + o]; };

  function draw() {
    const { ctx: c, w } = hiDPI(cv, 1);
    c.fillStyle = '#000'; c.fillRect(0, 0, w, w);
    if (st.multi) {
      [-0.12, -0.04, 0.04, 0.12].forEach((d, i) => {
        const z = Math.min(0.97, Math.max(0.03, st.z + d)), src = Phantom.toCanvas(img(z), N, st.ww, st.wl, st.inv);
        c.imageSmoothingEnabled = true; c.drawImage(src, (i % 2) * w / 2, Math.floor(i / 2) * w / 2, w / 2, w / 2);
        label(c, `z ${Math.round(z * 100)}`, (i % 2) * w / 2 + 8, Math.floor(i / 2) * w / 2 + 16);
      });
      c.strokeStyle = '#3a3445'; c.lineWidth = 2; c.beginPath(); c.moveTo(w / 2, 0); c.lineTo(w / 2, w); c.moveTo(0, w / 2); c.lineTo(w, w / 2); c.stroke();
      $('wsCap').textContent = 'Multiple image display: 4 slices in one frame';
      return drawScout();
    }
    const src = Phantom.toCanvas(img(), N, st.ww, st.wl, st.inv);
    c.save();
    if (st.flip) { c.translate(w, 0); c.scale(-1, 1); }
    c.imageSmoothingEnabled = !st.mag;
    if (st.mag) c.drawImage(src, N / 4, N / 4, N / 2, N / 2, 0, 0, w, w); else c.drawImage(src, 0, 0, w, w);
    c.restore();
    if (st.grid) {
      c.strokeStyle = 'rgba(122,220,243,.55)'; c.lineWidth = 1; c.font = '10px "JetBrains Mono", monospace'; c.fillStyle = 'rgba(122,220,243,.9)';
      for (let i = 1; i < 8; i++) { const p = w * i / 8; c.beginPath(); c.moveTo(p, 0); c.lineTo(p, w); c.moveTo(0, p); c.lineTo(w, p); c.stroke(); c.fillText('ABCDEFGH'[i - 1], p - w / 16 - 3, 12); c.fillText(i, 4, p - w / 16 + 4); }
      c.fillText('H', w - w / 16 - 3, 12); c.fillText(8, 4, w - w / 16 + 4);
    }
    if (st.roi) {
      const [x, y] = toC(st.roi.x, st.roi.y, w), r = st.roi.r * view(w).k, s = Phantom.roi(img(), N, st.roi.x, st.roi.y, st.roi.r);
      c.strokeStyle = '#FFB257'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r, 0, 7); c.stroke();
      const area = Math.PI * (st.roi.r * pxmm() / 10) ** 2;
      tag(c, `${fmt(s.mean)} HU ± ${s.sd.toFixed(1)}`, x + r + 6, y - 4); tag(c, `${area.toFixed(2)} cm²`, x + r + 6, y + 14);
      st.roiStats = { ...s, area };
    }
    if (st.ruler) {
      const [a, b] = toC(st.ruler.x1, st.ruler.y1, w), [d, e] = toC(st.ruler.x2, st.ruler.y2, w);
      const mm = Math.hypot(st.ruler.x2 - st.ruler.x1, st.ruler.y2 - st.ruler.y1) * pxmm();
      c.strokeStyle = '#7ADCF3'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke();
      [[a, b], [d, e]].forEach(([x, y]) => { c.fillStyle = '#7ADCF3'; c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); });
      tag(c, `${mm.toFixed(1)} mm`, (a + d) / 2 + 8, (b + e) / 2 - 8); st.dist = mm;
    }
    st.notes.forEach(n => {
      const [x, y] = toC(n.x, n.y, w);
      c.strokeStyle = '#FF8DC1'; c.fillStyle = '#FF8DC1'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x - 34, y - 34); c.lineTo(x - 6, y - 6); c.stroke();
      c.beginPath(); c.moveTo(x - 4, y - 4); c.lineTo(x - 16, y - 8); c.lineTo(x - 8, y - 16); c.fill();
      tag(c, n.t, x - 38, y - 40, 'end');
    });
    if (st.hover && st.tool === 'cursor') {
      const [x, y] = toC(st.hover[0], st.hover[1], w);
      c.strokeStyle = '#FFB257'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 12, y); c.lineTo(x + 12, y); c.moveTo(x, y - 12); c.lineTo(x, y + 12); c.stroke();
    }
    label(c, st.flip ? 'L' : 'R', 8, w / 2); label(c, st.flip ? 'R' : 'L', w - 16, w / 2);
    label(c, `DFOV ${fov()} cm · ${st.mag ? '×2 magnified' : '×1'} · W ${st.ww} L ${fmt(st.wl)}`, 8, w - 10);
    $('wsCap').textContent = st.mag ? 'Magnified ×2 from the same pixels: bigger, not sharper' : st.dfov ? 'Rebuilt from raw data with a 20 cm DFOV: real new detail' : 'Axial slice · 40 cm DFOV · 256 matrix';
    drawScout(); readout();
  }
  function label(c, t, x, y) { c.font = '11px "JetBrains Mono", monospace'; c.fillStyle = '#A9A1B8'; c.textAlign = 'left'; c.fillText(t, x, y); }
  function tag(c, t, x, y, al = 'left') {
    c.font = '600 12px "JetBrains Mono", monospace'; const tw = c.measureText(t).width, X = al === 'end' ? x - tw : x;
    c.fillStyle = 'rgba(12,10,16,.75)'; c.fillRect(X - 4, y - 12, tw + 8, 17); c.fillStyle = '#fff'; c.textAlign = 'left'; c.fillText(t, X, y);
  }
  function drawScout() {
    const { ctx: c, w, h } = hiDPI(sc, 150 / 110);
    c.drawImage(Phantom.topogram(), 0, 0, w, h);
    const lines = st.multi ? [-0.12, -0.04, 0.04, 0.12].map(d => st.z + d) : [st.z];
    lines.forEach(z => { c.strokeStyle = '#FFB257'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, z * h); c.lineTo(w, z * h); c.stroke(); });
    c.fillStyle = '#FFB257'; c.font = '10px "JetBrains Mono", monospace'; c.fillText(`slice ${Math.round(st.z * 100)}`, 4, Math.max(12, st.z * h - 5));
  }
  function readout() {
    const cell = (k, v) => `<div><small>${k}</small><b>${v}</b></div>`;
    let o = '';
    if (st.hover) { const v = img()[Math.floor(st.hover[1]) * N + Math.floor(st.hover[0])]; o += cell('HU at cursor', v === undefined ? '—' : fmt(v)); }
    if (st.roi && st.roiStats) o += cell('ROI mean', fmt(st.roiStats.mean) + ' HU') + cell('ROI SD', st.roiStats.sd.toFixed(1));
    if (st.ruler) o += cell('Distance', st.dist.toFixed(1) + ' mm');
    $('wsRead').innerHTML = o || cell('Pixel size', pxmm().toFixed(2) + ' mm');
  }

  const INFO = {
    cursor: 'Point at the image. The <b>cursor</b> reads the <b>HU</b> of any spot: try the aorta (contrast), liver, fat and lung.',
    roi: 'Drag on the image to draw a circular <b>ROI</b>. You get the <b>mean HU</b> (Hounsfield measurement) and the <b>standard deviation</b> (how much the CT numbers vary inside it). Try the darker spot in the liver on slices 50–64, then normal liver beside it.',
    ruler: 'Drag across a structure for a <b>distance measurement</b>, in mm, worked out from the pixel size. That is how lesions are sized and biopsy needles planned.',
    annot: 'Tap the image to drop an <b>annotation</b> arrow with a label. Tap Annotation again to clear them.',
    grid: '<b>Grid</b> on: the RT checks centering, the radiologist says "lesion at C4".',
    mag: '<b>Magnification ×2</b> from the same image data. Each pixel just gets bigger, so edges look blocky. <b>Resolution does not improve.</b>',
    dfov: '<b>Smaller DFOV (20 cm)</b>: the image is rebuilt from raw data with each pixel covering half the tissue, so the detail is <b>really</b> finer. Compare it with Magnification.',
    rev: '<b>Reverse display</b>: left and right are swapped and black and white are swapped. Look at the R/L labels.',
    multi: '<b>Multiple image display</b>: four slices in one frame, a way of <b>saving film</b>. The scout shows all four <b>reference lines</b>.'
  };
  function setTool(t) {
    const btn = document.querySelector(`#wsTools [data-t="${t}"]`);
    if (['grid', 'mag', 'dfov', 'rev', 'multi'].includes(t)) {
      const key = { grid: 'grid', mag: 'mag', dfov: 'dfov', rev: 'flip', multi: 'multi' }[t];
      st[key] = !st[key]; if (t === 'rev') st.inv = st.flip;
      if (t === 'mag' && st.mag) st.dfov = false; if (t === 'dfov' && st.dfov) st.mag = false;
      if (t === 'dfov') { st.roi = null; st.ruler = null; st.notes = []; }
      ['grid', 'mag', 'dfov', 'rev', 'multi'].forEach(k => document.querySelector(`#wsTools [data-t="${k}"]`).setAttribute('aria-pressed', !!st[{ grid: 'grid', mag: 'mag', dfov: 'dfov', rev: 'flip', multi: 'multi' }[k]]));
    } else {
      if (t === 'annot' && st.tool === 'annot') st.notes = [];
      st.tool = t;
      ['cursor', 'roi', 'ruler', 'annot'].forEach(k => document.querySelector(`#wsTools [data-t="${k}"]`).setAttribute('aria-pressed', k === t));
    }
    $('wsInfo').innerHTML = INFO[t]; draw();
  }
  document.querySelectorAll('#wsTools button').forEach(b => b.addEventListener('click', () => setTool(b.dataset.t)));
  document.querySelectorAll('#wsWin button').forEach(b => b.addEventListener('click', () => {
    st.ww = +b.dataset.ww; st.wl = +b.dataset.wl; document.querySelectorAll('#wsWin button').forEach(x => x.setAttribute('aria-pressed', x === b)); draw();
  }));

  /* pointer on the image */
  let drag = null;
  const pos = e => { const r = cv.getBoundingClientRect(), w = r.width; return fromC(e.clientX - r.left, e.clientY - r.top, w); };
  cv.addEventListener('pointerdown', e => {
    if (st.multi) return; cv.setPointerCapture(e.pointerId);
    const [x, y] = pos(e); drag = { x, y };
    if (st.tool === 'roi') st.roi = { x, y, r: 2 };
    if (st.tool === 'ruler') st.ruler = { x1: x, y1: y, x2: x, y2: y };
    if (st.tool === 'annot') { st.notes.push({ x, y, t: ['look here', 'lesion?', 'compare', 'measure'][st.notes.length % 4] }); }
    draw();
  });
  cv.addEventListener('pointermove', e => {
    if (st.multi) return;
    const [x, y] = pos(e); st.hover = x >= 0 && y >= 0 && x < N && y < N ? [x, y] : null;
    if (drag && st.tool === 'roi') st.roi.r = Math.max(2, Math.hypot(x - drag.x, y - drag.y));
    if (drag && st.tool === 'ruler') { st.ruler.x2 = x; st.ruler.y2 = y; }
    draw();
  });
  cv.addEventListener('pointerup', () => { drag = null; });
  cv.addEventListener('pointerleave', () => { st.hover = null; draw(); });

  /* scout: drag to choose the slice */
  let sdrag = false;
  const setZ = e => { const r = sc.getBoundingClientRect(); st.z = Math.min(0.97, Math.max(0.03, (e.clientY - r.top) / r.height)); st.roi = null; st.ruler = null; st.notes = []; draw(); };
  sc.addEventListener('pointerdown', e => { sdrag = true; sc.setPointerCapture(e.pointerId); setZ(e); });
  sc.addEventListener('pointermove', e => sdrag && setZ(e));
  sc.addEventListener('pointerup', () => { sdrag = false; });

  $('wsInfo').innerHTML = INFO.cursor;
  U.visible(cv, v => v && draw());
  U.onRedraw(draw);
})();
