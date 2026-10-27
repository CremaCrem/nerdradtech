/* Chapter I: raisin bread, step-and-shoot vs helical, CT processes, prospective/retrospective, windowing */
(() => {
  const { $, css, hiDPI } = U;
  const fmt = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n));

  /* ---------- raisin bread ---------- */
  // x: along the loaf 0..1, d: across 0..1, y: height 0..1, r: radius (fraction of loaf length)
  const RAISINS = [[0.12, 0.3, 0.4, 0.035], [0.2, 0.7, 0.62, 0.03], [0.31, 0.45, 0.3, 0.04], [0.4, 0.25, 0.7, 0.03], [0.42, 0.75, 0.35, 0.035],
    [0.55, 0.5, 0.55, 0.04], [0.63, 0.2, 0.28, 0.03], [0.72, 0.65, 0.66, 0.035], [0.83, 0.38, 0.45, 0.04], [0.9, 0.7, 0.3, 0.03]];
  let loafView = 'ct';
  const L0 = 34, L1 = 386, TOP = 46, BOT = 172;
  const crust = '#B9773A', crumb = '#F7E6C4', raisin = '#5B2A3C';
  function drawLoaf() {
    const k = +$('knife').value / 100, kx = L0 + (L1 - L0) * k;
    let o = `<path d="M${L0} ${BOT}V${TOP + 40}Q${L0} ${TOP} ${L0 + 50} ${TOP}H${L1 - 50}Q${L1} ${TOP} ${L1} ${TOP + 40}V${BOT}Z" fill="${crumb}" stroke="${crust}" stroke-width="10" stroke-linejoin="round"/>`;
    RAISINS.forEach(([x, , y, r]) => {
      const cut = loafView === 'ct' && Math.abs(x - k) < r;
      o += `<ellipse cx="${L0 + (L1 - L0) * x}" cy="${BOT - 12 - (BOT - TOP - 30) * y}" rx="${(L1 - L0) * r}" ry="${(L1 - L0) * r * 0.75}" fill="${raisin}" opacity="${loafView === 'xr' ? 0.9 : cut ? 1 : 0.32}"/>`;
    });
    if (loafView === 'ct') {
      o += `<rect x="${kx - 2}" y="${TOP - 26}" width="4" height="${BOT - TOP + 40}" rx="2" fill="var(--purple)"/>`;
      o += `<path d="M${kx - 12} ${TOP - 40}h24l-4 16h-16z" fill="var(--orange)"/>`;
    } else {
      o += `<g fill="var(--orange)" opacity=".8">${[0, 1, 2, 3, 4].map(i => `<path d="M${L0 + 30 + i * 75} 8l6 22h-12z"/>`).join('')}</g>`;
      o += `<text x="${(L0 + L1) / 2}" y="196" text-anchor="middle" font-size="11" fill="var(--ink-2)">x-ray beam from above passes through the whole loaf</text>`;
    }
    $('loaf').innerHTML = o;

    // right panel
    let s = '';
    if (loafView === 'ct') {
      s += `<path d="M30 160V80Q30 30 120 30Q210 30 210 80V160Z" fill="${crumb}" stroke="${crust}" stroke-width="12" stroke-linejoin="round"/>`;
      const hit = RAISINS.filter(([x, , , r]) => Math.abs(x - k) < r);
      hit.forEach(([x, d, y, r]) => {
        const f = Math.sqrt(1 - ((x - k) / r) ** 2), R = r * 360 * f;
        s += `<ellipse cx="${40 + 160 * d}" cy="${150 - 105 * y}" rx="${R}" ry="${R * 0.8}" fill="${raisin}"/>`;
      });
      $('loafText').innerHTML = hit.length
        ? `This slice cuts through <b>${hit.length} raisin${hit.length > 1 ? 's' : ''}</b>. You can see exactly where each one sits: how deep and how high. That is the point of tomography: <b>no superimposition</b>.`
        : 'No raisin in this slice: just crust (skin) around white bread (organs). Keep slicing.';
      $('knifeOut').textContent = `slice ${Math.round(k * 20) + 1} of 21`;
    } else {
      s += `<rect x="20" y="40" width="200" height="110" rx="20" fill="#2a2630"/>`;
      RAISINS.forEach(([x, , , r]) => { s += `<circle cx="${30 + 180 * x}" cy="95" r="${r * 300}" fill="#fff" opacity=".45"/>`; });
      s += `<text x="120" y="170" text-anchor="middle" font-size="11" fill="var(--ink-2)">one shadow of the whole loaf</text>`;
      $('loafText').innerHTML = 'A plain radiograph sees the <b>whole loaf at once</b>. Every raisin, from front to back, lands on the same shadow, so they overlap and you cannot tell how deep any of them is. Switch back to CT and move the knife.';
      $('knifeOut').textContent = 'not used in x-ray';
    }
    $('loafSlice').innerHTML = s;
  }
  U.seg('loafSeg', 'v', v => { loafView = v; drawLoaf(); });
  $('knife').addEventListener('input', drawLoaf); drawLoaf();

  /* ---------- step-and-shoot vs helical ---------- */
  let scanMode = 'step';
  const MODE = {
    step: 'Step-and-shoot: the table <b>stops</b>, the tube makes one full rotation, the table <b>moves</b>, then it shoots again. You get <b>separated data</b>: one slab per stop, with nothing measured in between.',
    helical: 'Helical: the tube keeps rotating while the table keeps moving, so the beam traces a <b>spiral</b> around the patient. Nothing is skipped, so you get <b>continuous volume data</b>, which is what makes good 3D and MPR possible.'
  };
  function drawMode(t) {
    const cv = $('modeCv'), { ctx: c, w, h } = hiDPI(cv, 280 / 420);
    c.fillStyle = '#0C0A10'; c.fillRect(0, 0, w, h);
    const x0 = w * 0.08, x1 = w * 0.92, cy = h * 0.55, ph = h * 0.22, p = (t / 7000) % 1, beam = css('--beam');
    // patient side view
    c.fillStyle = '#FF8DC1'; c.globalAlpha = 0.85;
    c.beginPath(); c.roundRect(x0, cy - ph / 2, (x1 - x0) * 0.86, ph, ph / 2); c.fill();
    c.beginPath(); c.arc(x1 - ph * 0.55, cy - ph * 0.05, ph * 0.5, 0, 7); c.fill(); c.globalAlpha = 1;
    c.fillStyle = '#3a3445'; c.fillRect(x0 - 10, cy + ph / 2 + 4, x1 - x0 + 20, 6);
    const reach = x0 + (x1 - x0) * Math.min(1, p * 1.15);
    if (scanMode === 'step') {
      const n = 8, gap = (x1 - x0) / n, sw = gap * 0.42;
      for (let i = 0; i < n; i++) {
        const xs = x0 + gap * (i + 0.5);
        if (xs > reach) break;
        c.fillStyle = beam; c.globalAlpha = 0.6; c.fillRect(xs - sw / 2, cy - ph * 0.85, sw, ph * 1.7); c.globalAlpha = 1;
      }
      const cur = x0 + gap * (Math.min(n - 1, Math.floor((reach - x0) / gap)) + 0.5);
      ring(c, cur, cy, ph);
      label(c, 'separated data · gaps between slices', w, h);
    } else {
      c.fillStyle = beam; c.globalAlpha = 0.22; c.fillRect(x0, cy - ph * 0.85, reach - x0, ph * 1.7); c.globalAlpha = 1;
      c.strokeStyle = beam; c.lineWidth = 2.5; c.beginPath();
      for (let x = x0; x <= reach; x += 2) { const y = cy - Math.sin((x - x0) / 18) * ph * 0.85; x === x0 ? c.moveTo(x, y) : c.lineTo(x, y); }
      c.stroke(); ring(c, reach, cy, ph);
      label(c, 'continuous volume data · one spiral', w, h);
    }
  }
  function ring(c, x, cy, ph) { c.strokeStyle = '#C9B8EA'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, cy, ph * 0.28, ph * 1.25, 0, 0, 7); c.stroke(); }
  function label(c, t, w, h) { c.fillStyle = '#A9A1B8'; c.font = '12px "JetBrains Mono", monospace'; c.fillText(t, 12, 20); }
  U.seg('modeSeg', 'm', m => { scanMode = m; $('modeText').innerHTML = MODE[m]; });
  $('modeText').innerHTML = MODE.step;
  U.loop($('modeCv'), drawMode);

  /* ---------- CT processes ---------- */
  const flowSvg = (labels, hi) => {
    const n = labels.length, bw = 320 / n - 12; let o = '';
    labels.forEach((l, i) => {
      const x = 20 + i * (bw + 12), on = i === hi;
      o += `<rect x="${x}" y="70" width="${bw}" height="56" rx="18" fill="${on ? 'var(--purple)' : 'var(--lav-soft)'}" stroke="var(--rule-2)"/>`;
      l.split('|').forEach((s, k, a) => { o += `<text x="${x + bw / 2}" y="${100 + (k - (a.length - 1) / 2) * 14}" text-anchor="middle" font-size="11" font-weight="700" fill="${on ? '#fff' : 'var(--ink)'}">${s}</text>`; });
      if (i < n - 1) o += `<path d="M${x + bw + 1} 98h10" stroke="var(--purple)" stroke-width="2.5"/>`;
    });
    return o;
  };
  const STEPS = [
    { art: flowSvg(['x-ray|tube', 'patient', 'detector', 'raw|data'], 3), cap: '"Get data"',
      t: `<h4>Data acquisition</h4><p>Collection of x-ray <b>attenuation (transmission) measurements</b> from the patient. The first step of the CT process.</p><ul><li>Attenuation values → detector → <b>raw data</b></li><li>The detectors' electrical signals are converted to <b>digital data</b> and sent to the computer</li><li>1st generation (<b>EMI head scanner</b>): <b>translate–rotate</b>, <b>1° rotation per translation</b>, <b>180 translations</b>, moving L→R then R→L</li></ul>` },
    { art: flowSvg(['raw|data', 'computer', 'image|data'], 1), cap: '"Use data"',
      t: `<h4>Image reconstruction</h4><p>Processing the collected transmission values using <b>mathematical techniques</b> to reconstruct the CT image.</p><ul><li><b>raw data → computer → image data</b></li><li><b>Prospective:</b> produced automatically during scanning</li><li><b>Retrospective:</b> the same raw data used later to generate a new image (lab below)</li></ul>` },
    { art: flowSvg(['recon.|data', 'electrical|signals', 'CRT|monitor', 'viewing'], 2), cap: '"Display data"',
      t: `<h4>Image display</h4><p>Conversion of the <b>digital data</b> from the reconstruction process into <b>electrical signals</b> the monitor can show.</p><ul><li>reconstructed data → CRT → viewing image data</li><li>Chapter V covers the display options (ROI, scout, magnification…)</li></ul>` },
    { art: flowSvg(['image', 'software', 'better|image'], 1), cap: 'Digital processing',
      t: `<h4>Image manipulation</h4><p>Digital image processing that <b>modifies images to make them more useful for diagnostic interpretation</b>, using computer software:</p><ul><li>Image smoothing</li><li>Edge enhancement</li><li><b>Gray scale manipulation</b> (windowing, next topic)</li><li>3D image processing (MIP, MinIP, SSD, SVD)</li></ul>` },
    { art: flowSvg(['image', 'tape|& disk', 'optical|laser', 'laser|camera'], 0), cap: 'Archiving',
      t: `<h4>Image storage</h4><p><b>Image archiving</b>: storing CT images for later analysis.</p><ul><li>Magnetic tape and disk</li><li>Optical / laser storage</li><li>Laser camera: records CT images</li></ul>` },
    { art: flowSvg(['CT', 'DICOM', 'PACS', 'RIS|HIS'], 1), cap: 'Networking',
      t: `<h4>Image communication</h4><p><b>Electronic transmission</b> of text data and images from the CT scanner to laser printers, workstations, display monitors, ICU/trauma/OR and computers outside the hospital.</p><ul><li>Uses <b>DICOM</b> (and DICOM printers)</li><li>Must make <b>connectivity</b> among modalities possible: PACS, RIS, HIS</li></ul>` },
  ];
  function showStep(i) {
    const s = STEPS[i];
    $('pipeArt').innerHTML = `<text x="180" y="40" text-anchor="middle" font-size="15" font-weight="700" fill="var(--purple-ink)">${s.cap}</text>${s.art}<text x="180" y="170" text-anchor="middle" font-size="11" fill="var(--ink-2)">step ${i + 1} of 6</text>`;
    $('pipeText').innerHTML = s.t;
  }
  U.seg('pipe', 's', v => showStep(+v)); showStep(0);

  /* ---------- prospective vs retrospective ---------- */
  const PN = 200, z = 0.74;
  const raw = Phantom.noise(Phantom.slice(z, PN, 40), 12, 3);
  const pro = Phantom.kernel(raw, PN, 'soft');
  const RETRO = {
    same: ['Retrospective: nothing requested yet', 'No new request yet, so both images match. The raw data is still saved on the scanner, ready to be used again.', () => Phantom.draw($('retroCv'), pro, PN, 400, 40)],
    zoom: ['Retrospective: DFOV 15 cm on the spine', 'Same raw data, rebuilt with a <b>smaller display FOV</b> centred on the spine. Each pixel now covers less tissue, so there is <b>real new detail</b>. Simply magnifying the left image would only make its pixels bigger.', () => { const a = Phantom.kernel(Phantom.noise(Phantom.slice(z, PN, 15, 0, 7.2), 12, 4), PN, 'soft'); Phantom.draw($('retroCv'), a, PN, 1500, 300); }],
    thin: ['Retrospective: edge-enhancing filter', 'Same raw data, rebuilt with an <b>edge-enhancing (bone) filter</b>. Edges are crisper but the image is grainier. No extra dose: the patient is not scanned again.', () => Phantom.draw($('retroCv'), Phantom.kernel(raw, PN, 'bone'), PN, 400, 40)],
  };
  let retro = 'same';
  function drawRetro() { Phantom.draw($('proCv'), pro, PN, 400, 40); const r = RETRO[retro]; $('retroCap').textContent = r[0]; $('retroText').innerHTML = r[1]; r[2](); }
  U.seg('retroSeg', 'r', v => { retro = v; drawRetro(); });
  U.visible($('proCv'), v => v && drawRetro());
  U.onRedraw(drawRetro);

  /* ---------- windowing ---------- */
  const WN = 256, cache = {};
  let ww = 400, wl = 40;
  const sliceAt = zz => cache[zz] || (cache[zz] = Phantom.noise(Phantom.slice(zz / 100, WN, 40), 8, zz));
  function drawWin() {
    const zz = +$('winZ').value, a = sliceAt(zz);
    Phantom.draw($('winCv'), a, WN, ww, wl);
    const lo = wl - ww / 2, hi = wl + ww / 2, P = v => Math.max(0, Math.min(100, (v + 1000) / 40));
    $('grayBar').style.background = `linear-gradient(90deg,#000 0 ${P(lo)}%,#fff ${P(hi)}% 100%)`;
    $('wwOut').textContent = ww + ' HU'; $('wlOut').textContent = fmt(wl) + ' HU';
    $('winZOut').textContent = zz < 55 ? 'chest' : 'abdomen';
    $('winCalc').innerHTML = `WW = ${ww} → WW/2 = <b>${ww / 2}</b><br>Upper = WL + WW/2 = ${fmt(wl)} + ${ww / 2} = <span class="r">${fmt(hi)}</span><br>Lower = WL − WW/2 = ${fmt(wl)} − ${ww / 2} = <span class="r">${fmt(lo)}</span><br>Gray: ${fmt(lo)} to ${fmt(hi)} · Black: below ${fmt(lo)} · White: above ${fmt(hi)}`;
    document.querySelectorAll('#winPresets button').forEach(b => b.setAttribute('aria-pressed', +b.dataset.ww === ww && +b.dataset.wl === wl));
  }
  const setWin = (a, b) => { ww = a; wl = b; $('ww').value = a; $('wl').value = b; drawWin(); };
  $('ww').addEventListener('input', e => { ww = +e.target.value; drawWin(); });
  $('wl').addEventListener('input', e => { wl = +e.target.value; drawWin(); });
  $('winZ').addEventListener('input', drawWin);
  document.querySelectorAll('#winPresets button').forEach(b => b.addEventListener('click', () => setWin(+b.dataset.ww, +b.dataset.wl)));
  $('winCv').addEventListener('pointermove', e => {
    const r = e.currentTarget.getBoundingClientRect(), i = Math.floor((e.clientX - r.left) / r.width * WN), j = Math.floor((e.clientY - r.top) / r.height * WN);
    if (i < 0 || j < 0 || i >= WN || j >= WN) return;
    const v = Math.round(sliceAt(+$('winZ').value)[j * WN + i]), lo = wl - ww / 2, hi = wl + ww / 2;
    $('winProbe').textContent = `${fmt(v)} HU → ${v < lo ? 'black (below the lower limit)' : v > hi ? 'white (above the upper limit)' : 'a shade of gray'}`;
  });
  U.visible($('winCv'), v => v && drawWin());
  U.onRedraw(drawWin);

  /* drill */
  const pickOne = a => a[Math.floor(Math.random() * a.length)];
  let dq;
  function newDrill() {
    dq = { ww: pickOne([80, 150, 350, 400, 500, 1000, 1500, 2000, 2500]), wl: pickOne([-600, -500, -50, 0, 35, 40, 50, 60, 300, 400, 500]) };
    $('drillQ').innerHTML = `A technologist sets <b>WW ${dq.ww}</b> and <b>WL ${fmt(dq.wl)}</b>. Which HU values show as shades of gray?`;
    $('drLo').value = ''; $('drHi').value = ''; $('drillSay').className = 'say'; $('drillSay').textContent = 'Lower = WL − WW/2. Upper = WL + WW/2.';
  }
  $('drCheck').addEventListener('click', () => {
    const lo = dq.wl - dq.ww / 2, hi = dq.wl + dq.ww / 2, ok = +$('drLo').value === lo && +$('drHi').value === hi && $('drLo').value !== '' && $('drHi').value !== '';
    $('drillSay').className = 'say ' + (ok ? 'ok' : 'bad');
    $('drillSay').innerHTML = ok ? `Correct: <b>${fmt(lo)} to ${fmt(hi)}</b>. Below ${fmt(lo)} is black, above ${fmt(hi)} is white.`
      : `Not quite. WW/2 = ${dq.ww / 2}. Lower = ${fmt(dq.wl)} − ${dq.ww / 2} = <b>${fmt(lo)}</b>. Upper = ${fmt(dq.wl)} + ${dq.ww / 2} = <b>${fmt(hi)}</b>.`;
  });
  $('drNew').addEventListener('click', newDrill); newDrill();
})();
