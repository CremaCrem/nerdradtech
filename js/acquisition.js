/* Chapter III: generations, pitch, multislice, slip rings, 3D gantry explorer, collimation, detectors */
(() => {
  const { $, css, hiDPI } = U;
  const PI = Math.PI, TAU = PI * 2;
  const ORANGE = '#FFB257', PURPLE = '#8D6CF0', LAV = '#C9B8EA', PINK = '#FF8DC1', CYAN = '#7ADCF3', MUTED = '#A9A1B8';
  const txt = (c, s, x, y, col = MUTED, al = 'left') => { c.fillStyle = col; c.font = '12px "JetBrains Mono", monospace'; c.textAlign = al; c.fillText(s, x, y); };

  /* ---------- scanner generations ---------- */
  const GEN = {
    1: { name: '1st generation', motion: 'Translate–rotate', beam: 'Parallel (pencil) beam', det: 'Single detector + reference detector',
      pts: ['<b>EMI head scanner</b>, a demo project only', '<b>Parallel beam</b> geometry', '<b>80 × 80</b> matrix', 'Uses a <b>water bag</b> around the head', 'Uses a <b>reference detector</b>', '<b>1° rotation per translation</b>, <b>180 translations</b>, L→R then R→L', 'Fixed-anode, oil-cooled tube'] },
    2: { name: '2nd generation', motion: 'Translate–rotate', beam: 'Small fan beam', det: 'Several detectors in a row',
      pts: ['<b>Fan-beam</b> geometry, still translate–rotate', '<b>Permits whole body scanning</b>', '<b>Loss of collimation</b> (more scatter with a fan)', 'Uses the <b>"bowtie" filter</b>', 'Fixed-anode, oil-cooled tube'] },
    3: { name: '3rd generation', motion: 'Rotate–rotate', beam: 'Wide fan beam', det: 'Curvilinear array, 30–60°',
      pts: ['Fan-beam, <b>no translations</b>', '<b>Most widely used</b> (the de facto baseline model)', '<b>Curvilinear detector array (30–60°)</b> rotates with the tube', 'Reference detector', 'Beam apex comes from the <b>x-ray tube</b>', 'A faulty element makes a <b>ring artifact</b>'] },
    4: { name: '4th generation', motion: 'Rotate–stationary', beam: 'Fan beam', det: 'Stationary ring of detectors',
      pts: ['Fan-beam with a <b>stationary ring detector array</b>', 'Only the tube rotates', '<b>Closer SID</b>', '<b>Overscan</b>: a <b>400° arc</b>', '<b>Lower technical factors</b>', 'Beam apex comes from the <b>detector</b>'] },
    5: { name: '5th generation', motion: 'Stationary–stationary', beam: 'Electron beam swept onto targets', det: 'Stationary detector ring',
      pts: ['<b>Electron beam CT (EBCT)</b>, a.k.a. <b>cardiac cine CT</b>', 'Very high speed: <b>33 ms, 50 ms, 100 ms</b>', '<b>No moving gantry</b>', 'Parts: <b>electron gun, vacuum pumps, focus coil, deflection coil, target, detector</b>'] },
    6: { name: '6th generation', motion: 'Continuous rotation + moving table', beam: 'Fan beam', det: 'Arc (one or two)',
      pts: ['<b>Helical (spiral) CT</b> using <b>slip rings</b>: see 3.2 and 3.4', '<b>Dual source CT</b> (shown): <b>two x-ray tubes offset by 90°</b>', 'Designed for <b>cardiac CT</b>', 'Provides <b>high temporal resolution</b>', 'Single source needs 180° + fan for a full data set; dual source only <b>90°</b>'] },
    7: { name: '7th generation', motion: 'Rotate–rotate, helical', beam: 'Cone beam', det: 'Many rows along z',
      pts: ['<b>Multislice / multidetector CT</b> (MSCT/MDCT)', '<b>Multiple slices per gantry rotation</b>', 'Spatial resolution set by the <b>width of the detector</b>', 'SDCT = fan beam · <b>MDCT = cone beam</b>', 'Cone beam can cause the <b>windmill artifact</b>'] },
  };
  let gen = 1;
  $('genTable').innerHTML = `<table class="compare"><thead><tr><th scope="col">Gen</th><th scope="col">Motion</th><th scope="col">Beam</th><th scope="col">Detectors</th></tr></thead><tbody>${
    Object.entries(GEN).map(([k, g]) => `<tr data-g="${k}"><th scope="row">${k}</th><td>${g.motion}</td><td>${g.beam}</td><td>${g.det}</td></tr>`).join('')}</tbody></table>`;
  function genFacts() {
    const g = GEN[gen];
    $('genFacts').innerHTML = `<h4>${g.name}</h4><div class="tags"><span>${g.motion}</span><span>${g.beam}</span><span>${g.det}</span></div><ul>${g.pts.map(p => `<li>${p}</li>`).join('')}</ul>`;
    document.querySelectorAll('#genTable tr[data-g]').forEach(tr => tr.classList.toggle('on', +tr.dataset.g === gen));
  }
  const rot = (x, y, a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
  function drawGen(t) {
    const { ctx: c, w } = hiDPI($('genCv'), 1), C = w / 2, R = w * 0.42;
    c.fillStyle = '#0C0A10'; c.fillRect(0, 0, w, w);
    const P = (x, y, a) => { const [u, v] = rot(x, y, a); return [C + u, C + v]; };
    const patient = () => { c.fillStyle = PINK; c.globalAlpha = 0.8; c.beginPath(); c.ellipse(C, C, R * 0.4, R * 0.32, 0, 0, TAU); c.fill(); c.globalAlpha = 1; };
    const ring = col => { c.strokeStyle = col || '#2c2734'; c.lineWidth = 10; c.beginPath(); c.arc(C, C, R + 14, 0, TAU); c.stroke(); };
    const fan = (s, pts, al = 0.28) => { c.fillStyle = ORANGE; c.globalAlpha = al; c.beginPath(); c.moveTo(...s); pts.forEach(p => c.lineTo(...p)); c.closePath(); c.fill(); c.globalAlpha = 1; };
    const dot = (p, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(p[0], p[1], r, 0, TAU); c.fill(); };
    const boxAt = (p, a, col, bw = 8, bh = 14) => { c.save(); c.translate(...p); c.rotate(a); c.fillStyle = col; c.fillRect(-bw / 2, -bh / 2, bw, bh); c.restore(); };
    ring(); patient();
    if (gen <= 2) {
      const dur = 1700, ph = t / dur, k = Math.floor(ph), f = ph - k, step = gen === 1 ? 15 : 30, a = ((k * step) % 180) * PI / 180;
      const s = (k % 2 ? 1 - 2 * f : -1 + 2 * f) * R * 0.62;
      const tube = P(s, -R, a), det = P(s, R, a);
      if (gen === 1) {
        c.strokeStyle = ORANGE; c.lineWidth = 3; c.beginPath(); c.moveTo(...tube); c.lineTo(...det); c.stroke();
        boxAt(det, a, PURPLE, 14, 10);
      } else {
        const n = 6, sp = R * 0.09, pts = [];
        for (let i = 0; i < n; i++) pts.push(P(s + (i - (n - 1) / 2) * sp, R, a));
        fan(tube, [pts[0], pts[n - 1]], 0.35); pts.forEach(p => boxAt(p, a, PURPLE, 9, 10));
      }
      boxAt(tube, a, CYAN, 26, 14);
      c.strokeStyle = LAV; c.setLineDash([4, 5]); c.lineWidth = 1; c.beginPath(); c.moveTo(...P(-R * 0.62, -R, a)); c.lineTo(...P(R * 0.62, -R, a)); c.stroke(); c.setLineDash([]);
      txt(c, `translation ${k % 12 + 1} · angle ${(k * step) % 180}°`, 12, 20);
      txt(c, `steps exaggerated (real: 1° × 180)`, 12, w - 12);
      $('genCap').textContent = gen === 1 ? 'Pencil beam translates across, then the whole frame rotates' : 'A small fan translates across, then rotates by a bigger step';
    } else if (gen === 3 || gen === 6) {
      const a = t / 900, span = 0.48;
      const draw1 = (off, sp, col) => {
        const tube = P(0, -R, a + off), pts = [];
        for (let i = 0; i <= 16; i++) { const b = a + off + PI / 2 - sp + 2 * sp * i / 16; pts.push([C + R * Math.cos(b), C + R * Math.sin(b)]); }
        fan(tube, [pts[0], ...pts.slice(1)]);
        pts.forEach((p, i) => boxAt(p, a + off + PI / 2 - sp + 2 * sp * i / 16 + PI / 2, col));
        boxAt(tube, a + off, CYAN, 26, 14); return tube;
      };
      const t1 = draw1(0, span, PURPLE);
      if (gen === 6) { draw1(-PI / 2, 0.32, '#5E4C93'); txt(c, 'two tubes, 90° apart', 12, 20); txt(c, 'also 6th gen: helical (slip ring)', 12, w - 12); $('genCap').textContent = 'Dual source: two tube–detector pairs offset by 90°'; }
      else { dot(t1, 5, ORANGE); txt(c, 'apex at the TUBE', 12, 20); txt(c, 'tube and detector arc rotate together', 12, w - 12); $('genCap').textContent = 'Wide fan, curved detector array, both rotate'; }
    } else if (gen === 4) {
      const n = 72, a = t / 900;
      for (let i = 0; i < n; i++) { const b = TAU * i / n; boxAt([C + (R + 2) * Math.cos(b), C + (R + 2) * Math.sin(b)], b + PI / 2, '#5E4C93', 6, 12); }
      const tube = [C + R * 0.72 * Math.cos(a - PI / 2), C + R * 0.72 * Math.sin(a - PI / 2)], pts = [];
      for (let i = 0; i <= 12; i++) { const b = a + PI / 2 - 0.62 + 1.24 * i / 12; pts.push([C + R * Math.cos(b), C + R * Math.sin(b)]); }
      fan(tube, pts, 0.22);
      const d0 = 0.5 * PI + 0.0, D = [C + R * Math.cos(d0), C + R * Math.sin(d0)];
      c.strokeStyle = ORANGE; c.lineWidth = 1.4;
      for (let k = 0; k < 14; k++) { const tb = a - k * 0.05; const tp = [C + R * 0.72 * Math.cos(tb - PI / 2), C + R * 0.72 * Math.sin(tb - PI / 2)]; c.globalAlpha = 1 - k / 14; c.beginPath(); c.moveTo(...D); c.lineTo(...tp); c.stroke(); }
      c.globalAlpha = 1; dot(D, 6, ORANGE); boxAt(tube, a, CYAN, 22, 12);
      txt(c, 'apex at the DETECTOR (orange)', 12, 20); txt(c, 'ring stays still, only the tube turns', 12, w - 12);
      $('genCap').textContent = 'Stationary ring of detectors, rotating tube';
    } else if (gen === 5) {
      c.strokeStyle = ORANGE; c.lineWidth = 9; c.beginPath(); c.arc(C, C, R, PI * 0.15, PI * 0.85); c.stroke();
      c.strokeStyle = PURPLE; c.lineWidth = 9; c.beginPath(); c.arc(C, C, R - 14, PI * 1.12, PI * 1.88); c.stroke();
      const sa = PI * 0.5 + Math.sin(t / 500) * PI * 0.33, spot = [C + R * Math.cos(sa), C + R * Math.sin(sa)], gun = [8, C + R * 0.95];
      c.strokeStyle = CYAN; c.lineWidth = 2; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(...gun); c.quadraticCurveTo(C * 0.4, w - 6, ...spot); c.stroke(); c.setLineDash([]);
      const pts = []; for (let i = 0; i <= 12; i++) { const b = sa + PI - 0.5 + i / 12; pts.push([C + (R - 14) * Math.cos(b), C + (R - 14) * Math.sin(b)]); }
      fan(spot, pts, 0.3); dot(spot, 6, '#fff'); dot(gun, 7, CYAN);
      txt(c, 'electron gun', 12, w - 40); txt(c, 'target (tungsten)', C, w - 8, ORANGE, 'center'); txt(c, 'detectors', C, 22, '#C9B8FF', 'center');
      txt(c, 'deflection coil sweeps the beam', 12, 40);
      $('genCap').textContent = 'Electron beam CT: the electron beam is steered, nothing mechanical moves';
    } else {
      const top = w * 0.14, bot = w * 0.8, z0 = C - R * 0.55, z1 = C + R * 0.55, ph = Math.sin(t / 500) * 6;
      c.fillStyle = PINK; c.globalAlpha = 0.75; c.beginPath(); c.roundRect(w * 0.06, C - R * 0.28, w * 0.88, R * 0.56, R * 0.28); c.fill(); c.globalAlpha = 1;
      fan([C, top + ph], [[z0, bot], [z1, bot]], 0.33);
      c.strokeStyle = '#fff'; c.setLineDash([4, 4]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(C, top + ph); c.lineTo(C - 6, bot); c.moveTo(C, top + ph); c.lineTo(C + 6, bot); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 16; i++) { c.fillStyle = i % 2 ? '#7D65AE' : PURPLE; c.fillRect(z0 + (z1 - z0) * i / 16 + 1, bot, (z1 - z0) / 16 - 2, 16); }
      boxAt([C, top + ph - 6], 0, CYAN, 46, 18);
      txt(c, 'side view · z axis →', 12, 20); txt(c, 'cone beam on 16 rows', C, bot + 34, ORANGE, 'center'); txt(c, 'dashed = single-row fan', C, bot + 50, MUTED, 'center');
      $('genCap').textContent = 'Multidetector CT seen from the side: one rotation, many slices';
    }
  }
  U.seg('genSeg', 'g', v => { gen = +v; genFacts(); });
  genFacts(); U.loop($('genCv'), drawGen);

  /* ---------- pitch ---------- */
  function drawPitch() {
    const p = +$('pitchR').value, { ctx: c, w, h } = hiDPI($('pitchCv'), 1 / 3), bw = 10, mmpx = (w - 40) / 100, x0 = 20, y0 = h * 0.42, bh = h * 0.32;
    c.fillStyle = '#0C0A10'; c.fillRect(0, 0, w, h);
    const bands = []; for (let i = 0; i * p * bw < 100; i++) bands.push(i * p * bw);
    // gaps first (red hatching)
    c.fillStyle = 'rgba(255,127,168,.5)';
    for (let z = 0; z < 100; z += 0.5) if (!bands.some(b => z >= b && z < b + bw)) c.fillRect(x0 + z * mmpx, y0, 0.5 * mmpx + 0.5, bh);
    bands.forEach((b, i) => {
      c.fillStyle = i % 2 ? CYAN : ORANGE; c.globalAlpha = 0.5;
      c.fillRect(x0 + b * mmpx, y0, Math.min(bw, 100 - b) * mmpx, bh); c.globalAlpha = 1;
      if (b + bw / 2 < 100) txt(c, String(i + 1), x0 + (b + bw / 2) * mmpx, y0 + bh + 18, '#DCD6E6', 'center');
    });
    c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath();
    for (let z = 0; z <= 100; z += 0.5) { const y = h * 0.22 - Math.sin(z / (p * bw) * TAU) * h * 0.1, x = x0 + z * mmpx; z ? c.lineTo(x, y) : c.moveTo(x, y); }
    c.stroke();
    txt(c, 'tube path (helix, side view)', 12, 18); txt(c, 'rotation number', w - 12, h - 8, MUTED, 'right');
    const kind = p < 0.99 ? 'Oversampling' : p > 1.01 ? 'Undersampling' : 'Contiguous';
    $('pitchOut').textContent = p.toFixed(2); $('feedOut').textContent = (p * bw).toFixed(1) + ' mm'; $('pitchKind').textContent = kind;
    $('pitchText').innerHTML = p < 0.99
      ? `Pitch ${p.toFixed(2)}: the table moves only ${(p * bw).toFixed(1)} mm per rotation but the beam is 10 mm wide, so <b>bands overlap</b> (brighter where they stack). Every bit is measured more than once: <b>oversampling</b>, <b>higher dose</b>, <b>better spatial resolution</b>, <b>slower</b>, less anatomy covered.`
      : p > 1.01 ? `Pitch ${p.toFixed(2)}: the table moves ${(p * bw).toFixed(1)} mm per rotation, more than the 10 mm beam, so <b>gaps</b> (pink) are never directly measured and must be interpolated: <b>undersampling</b>, <b>lower dose</b>, <b>faster</b>, more anatomy covered, <b>lower spatial resolution</b>.`
      : 'Pitch 1: the table moves exactly one beam width per rotation. The bands touch with no gap and no overlap.';
  }
  $('pitchR').addEventListener('input', drawPitch);
  U.visible($('pitchCv'), v => v && drawPitch()); U.onRedraw(drawPitch);

  /* ---------- multislice binning ---------- */
  function drawMsct(m) {
    const x0 = 90, cw = 60, cols = [ORANGE, CYAN, '#FFCC33', PINK];
    let o = `<path d="M210 26 ${x0} 120H${x0 + 4 * cw}Z" fill="url(#gBeam)" opacity=".8"/><rect x="186" y="10" width="48" height="20" rx="10" fill="var(--cyan)"/>`;
    o += `<text x="210" y="70" text-anchor="middle" font-size="11" fill="var(--ink-2)">20 mm collimated beam</text>`;
    for (let i = 0; i < 4; i++) o += `<rect x="${x0 + i * cw + 2}" y="122" width="${cw - 4}" height="26" rx="6" fill="var(--purple)"/><text x="${x0 + i * cw + cw / 2}" y="140" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">5 mm</text>`;
    const g = 4 / m;
    for (let k = 0; k < m; k++) {
      const x = x0 + k * g * cw + 2, wd = g * cw - 4;
      o += `<rect x="${x}" y="170" width="${wd}" height="36" rx="12" fill="${cols[k]}"/><text x="${x + wd / 2}" y="193" text-anchor="middle" font-size="12" font-weight="700" fill="#231F2B">${g * 5} mm</text>`;
    }
    o += `<text x="210" y="224" text-anchor="middle" font-size="11" fill="var(--ink-2)">sections you get</text><text x="20" y="140" font-size="10" fill="var(--ink-2)">detectors</text>`;
    $('msctArt').innerHTML = o;
    $('msctText').innerHTML = { 4: '<b>Four 5 mm sections</b>: each detector row is its own slice. Thinnest slices, best z-axis detail.', 2: '<b>Two 10 mm sections</b>: pairs of rows are added together. Thicker slices, less noise.', 1: '<b>One 20 mm section</b>: all four rows combined into a single thick slice.' }[m] +
      ' Same beam, same exposure. Only the way the rows are grouped changes, which is why the slice thickness is adjustable.';
  }
  U.seg('msctSeg', 'm', v => drawMsct(+v)); drawMsct(4);

  /* ---------- slip rings ---------- */
  let slip = 'cable', slices = 0, lastRot = 0;
  const SLIP = {
    cable: 'The tube is wired to a high-voltage cable. After about one turn the cable is wound up, so the gantry must <b>stop</b> and <b>unwind</b> before the next slice: the <b>start–stop</b> process with interscan delays.',
    slip: 'Power and detector signals pass through <b>brushes sliding on conductive rings</b>, so the tube can spin <b>forever in one direction</b>. No cable, no unwinding, no interscan delay. This is what made <b>helical CT</b> possible.'
  };
  function drawSlip(t) {
    const { ctx: c, w } = hiDPI($('slipCv'), 1), C = w / 2, R = w * 0.36;
    c.fillStyle = '#0C0A10'; c.fillRect(0, 0, w, w);
    c.strokeStyle = '#2c2734'; c.lineWidth = 16; c.beginPath(); c.arc(C, C, R + 12, 0, TAU); c.stroke();
    c.fillStyle = PINK; c.globalAlpha = 0.8; c.beginPath(); c.ellipse(C, C, R * 0.42, R * 0.32, 0, 0, TAU); c.fill(); c.globalAlpha = 1;
    let a, state;
    if (slip === 'cable') {
      const T = 6000, ph = (t % T) / T;
      if (ph < 0.45) { a = ph / 0.45 * TAU; state = 'scanning one slice →'; }
      else if (ph < 0.55) { a = TAU; state = 'STOP · table moves'; }
      else { a = (1 - (ph - 0.55) / 0.45) * TAU; state = '← unwinding the cable'; }
      const anchor = PI / 2, n = 60;
      c.strokeStyle = '#E0A96A'; c.lineWidth = 3; c.beginPath();
      for (let i = 0; i <= n; i++) { const b = anchor - a * i / n, rr = R + 26 - 10 * i / n; const x = C + rr * Math.cos(b), y = C + rr * Math.sin(b); i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.stroke();
      c.fillStyle = '#E0A96A'; c.fillRect(C - 8, C + R + 22, 16, 18);
      if (ph < 0.45 && lastRot > 0.45) slices++;
      lastRot = ph;
      a = anchor - a;
    } else {
      a = t / 600; state = 'continuous rotation';
      [0.86, 0.8, 0.74].forEach(f => { c.strokeStyle = '#D08A4A'; c.lineWidth = 3; c.beginPath(); c.arc(C, C, R * f + 40, 0, TAU); c.stroke(); });
      c.fillStyle = '#FFD27A'; c.fillRect(C - 10, C + R * 0.86 + 34, 20, 22);
      if (Math.floor(a / TAU) !== Math.floor(lastRot / TAU)) slices++;
      lastRot = a;
    }
    const tp = [C + R * Math.cos(a), C + R * Math.sin(a)];
    c.save(); c.translate(...tp); c.rotate(a + PI / 2); c.fillStyle = CYAN; c.fillRect(-16, -9, 32, 18); c.restore();
    txt(c, state, 12, 22, slip === 'cable' && state.startsWith('STOP') ? PINK : MUTED);
    txt(c, `slices done: ${slices}`, w - 12, w - 12, ORANGE, 'right');
    $('slipCap').textContent = slip === 'cable' ? 'Brown line = high-voltage cable wrapping around' : 'Rings + brushes (yellow) transfer power across the rotation';
  }
  U.seg('slipSeg', 's', v => { slip = v; slices = 0; lastRot = 0; $('slipText').innerHTML = SLIP[v]; });
  $('slipText').innerHTML = SLIP.cable; U.loop($('slipCv'), drawSlip);

  /* ---------- 3D explorer ---------- */
  const INFO = {
    gantry: ['Gantry', 'The ring-shaped, <b>largest</b> and most visible component. Contains the rotating scan frame and houses the slip rings, x-ray tube, HV generator, collimators, detectors and DAS. Tilts <b>±30°</b> (standard ±12° to ±30° in 0.5° steps).'],
    aperture: ['Gantry aperture', 'The <b>central opening</b> of the gantry. Most scanners: <b>70 cm</b>. Ranges 70–90 cm, 50–85 cm, 20–34 in.'],
    tube: ['X-ray tube', '<b>Rotating anode</b> (≥ 5 in. diameter, 12° target, 3,600–10,000 rpm). Helical units use a <b>brazed graphite anode</b> with a tungsten–rhenium focal track. Produces a <b>heterogeneous</b> beam.'],
    generator: ['High-voltage generator', 'Modern: <b>high-frequency</b>, small, <b>inside the gantry</b> with a short high-tension cable. 20–100 kW (up to 120 kW). kVp 80–140, mA 20–500.'],
    filter: ['Bowtie filter', 'Removes low-energy x-rays (beam hardening, higher mean energy) and <b>shapes the energy distribution</b> across the beam for <b>uniform beam hardening</b>. First used in the 2nd generation.'],
    collimator: ['Pre-patient (source) collimator', 'Between the tube and the patient. Limits the area of the patient in the useful beam, so it determines <b>patient dose</b> (the <b>dose profile</b>).'],
    postcoll: ['Post-patient (predetector) collimator', 'Below the patient, above the detectors. Restricts what the detectors see, <b>reduces scatter</b>, <b>improves contrast</b>, and determines <b>slice thickness</b> (the <b>sensitivity profile</b>). The thin septa between elements also cut crosstalk.'],
    detectors: ['Detectors', 'Capture the beam coming out of the patient and convert it to electrical signals. 3rd generation: a <b>curvilinear array</b> that rotates with the tube. In multislice mode the array has many rows along z. <b>SID 44 in.</b>'],
    das: ['DAS (data acquisition system)', 'Sits right behind the detectors. Converts the detectors\' electrical (analog) signals into <b>digital data</b> and sends them toward the computer.'],
    sliprings: ['Slip rings', 'Conductive <b>rings and brushes</b> carry power to the tube and detector signals off the rotor across the rotating interface. Continuous rotation made <b>helical CT</b> possible.'],
    lasers: ['Positioning lasers', 'Red laser lights used to position the patient for accurate <b>transverse, coronal and sagittal centering</b>. They cross at the <b>isocenter</b> (red diamond).'],
    panel: ['Control panel and microphone', 'Control panels on the side of the gantry let the RT control the <b>lights, gantry tilt and table movement</b>. The <b>microphone</b> lets the RT and the patient talk.'],
    couch: ['Patient couch', '<b>Low-Z carbon graphite fiber</b>, flat or curved. Moves vertically and horizontally, has an <b>emergency pull</b>, limit <b>220 kg</b>. Its horizontal travel is the <b>scannable range</b>.'],
    patient: ['Patient', 'Lying supine, head first. The orange line traces where the beam has been: a <b>helix</b>. Change the pitch to stretch or squeeze it.'],
    rotor: ['Rotating frame', 'Carries the tube, collimators, filter, detectors and DAS around the patient.'],
    pedestal: ['Couch base', 'Raises and lowers the table top (vertical movement).']
  };
  const g3 = $('g3d') && window.THREE ? Gantry3D($('g3d'), { cover: 0.15, dist: 10.5, yaw: 0.85, elev: 0.36 }) : null;
  function info(p) {
    const [t, d] = INFO[p] || [p, ''];
    $('g3Info').innerHTML = `<div class="h"><h4>${t}</h4><span class="go">✦</span></div><p>${d}</p>`;
    document.querySelectorAll('#g3Parts button').forEach(b => b.classList.toggle('sel', b.dataset.p === p));
  }
  info('tube');
  if (g3) {
    g3.select('tube'); g3.onPick(info);
    document.querySelectorAll('#g3Parts button').forEach(b => b.addEventListener('click', () => { g3.select(b.dataset.p); info(b.dataset.p); }));
    U.seg('g3Mode', 'm', m => g3.set({ mode: m }));
    $('g3Scan').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.textContent = on ? 'X-ray on' : 'X-ray off'; g3.set({ scanning: on }); });
    $('g3Cover').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-pressed') !== 'true'; e.currentTarget.setAttribute('aria-pressed', on); e.currentTarget.textContent = on ? 'Cover on' : 'Cover off'; g3.set({ cover: on ? 1 : 0.15 }); });
    $('g3Cover').textContent = 'Cover off';
    $('g3Pitch').addEventListener('input', e => { $('g3PitchOut').textContent = (+e.target.value).toFixed(1); g3.set({ pitch: +e.target.value }); });
    $('g3Tilt').addEventListener('input', e => { $('g3TiltOut').textContent = e.target.value + '°'; g3.set({ tilt: +e.target.value }); });
    $('g3Height').addEventListener('input', e => {
      const v = +e.target.value; g3.set({ height: v * 0.08 });
      $('g3HeightOut').textContent = v ? `${Math.abs(v * 2)} cm too ${v > 0 ? 'high' : 'low'}` : 'centered';
      if (v) { $('g3Info').innerHTML = `<div class="h"><h4>Y-direction miscentering</h4><span class="go">!</span></div><p>The table is ${Math.abs(v * 2)} cm too ${v > 0 ? 'high' : 'low'}: the patient's center no longer sits on the <b>isocenter</b> (red diamond) and the helix is off-center around the body.</p>`; }
    });
  } else $('g3Info').innerHTML = '<p>The 3D view needs WebGL. All the facts are in the cards below.</p>';

  /* ---------- collimation ---------- */
  function drawColl() {
    const pre = +$('preC').value, post = +$('postC').value, a = pre * 1.25, F = [210, 20], yPre = 62, yPat = 165, yPost = 262, yDet = 296;
    const half = y => a * (y - F[1]) / (yPre - F[1]);
    const hb = half(yPost), b = post * 6, acc = Math.min(hb, b);
    $('preOut').textContent = pre + ' units'; $('postOut').textContent = post + ' units';
    let o = `<rect x="186" y="4" width="48" height="18" rx="9" fill="var(--cyan)"/>`;
    o += `<path d="M${F[0]} ${F[1]}L${F[0] - half(yDet)} ${yDet}H${F[0] + half(yDet)}Z" fill="url(#gBeam)" opacity=".75"/>`;
    o += `<rect x="40" y="${yPat - 26}" width="340" height="52" rx="26" fill="var(--pink)" opacity=".7"/><text x="50" y="${yPat + 4}" font-size="11" fill="#231F2B">patient</text>`;
    o += `<rect x="${F[0] - a - 90}" y="${yPre - 8}" width="90" height="16" rx="4" fill="var(--ink)"/><rect x="${F[0] + a}" y="${yPre - 8}" width="90" height="16" rx="4" fill="var(--ink)"/>`;
    o += `<rect x="${F[0] - b - 110}" y="${yPost - 8}" width="110" height="16" rx="4" fill="var(--purple)"/><rect x="${F[0] + b}" y="${yPost - 8}" width="110" height="16" rx="4" fill="var(--purple)"/>`;
    o += `<rect x="60" y="${yDet}" width="300" height="14" rx="5" fill="var(--lav)"/><rect x="${F[0] - acc}" y="${yDet}" width="${2 * acc}" height="14" rx="5" fill="var(--orange)"/>`;
    [[120, 190, 150, 250], [300, 185, 270, 252], [180, 192, 165, 252], [250, 192, 262, 252]].forEach(([x1, y1, x2, y2]) => {
      const blocked = Math.abs(x2 - F[0]) > b;
      o += `<path d="M${x1} ${y1}L${x2} ${y2 - (blocked ? 4 : -40)}" stroke="var(--marker)" stroke-width="2" stroke-dasharray="4 3"/>${blocked ? `<circle cx="${x2}" cy="${y2 - 4}" r="3.5" fill="var(--marker)"/>` : ''}`;
    });
    o += `<g font-size="11" fill="var(--ink)" font-weight="700"><text x="408" y="${yPre - 14}" text-anchor="end">pre-patient</text><text x="408" y="${yPost - 14}" text-anchor="end">post-patient</text><text x="${F[0]}" y="${yDet + 30}" text-anchor="middle">detector · slice width ${(2 * acc / 12).toFixed(1)}</text></g>`;
    o += `<text x="${F[0]}" y="${yPat - 32}" text-anchor="middle" font-size="11" fill="var(--beam-ink)" font-weight="700">dose profile width ${(2 * half(yPat) / 12).toFixed(1)}</text>`;
    $('collArt').innerHTML = o;
    $('collText').innerHTML = `The <b>pre-patient</b> collimator decides how wide a slab of patient is irradiated: that is the <b>dose profile</b>. The <b>post-patient</b> collimator decides how much of the exit beam the detector accepts: that is the <b>slice thickness</b> (sensitivity profile). ` +
      (b < hb ? 'Here it trims the edges and blocks the dashed scatter, so <b>contrast improves</b>, but the trimmed part was still dose to the patient.' : 'Here it is wider than the beam, so it trims nothing and lets more scatter in.');
  }
  ['preC', 'postC'].forEach(id => $(id).addEventListener('input', drawColl)); drawColl();

  /* ---------- detector efficiency ---------- */
  let mat = 'sc';
  function drawEff() {
    const size = +$('effSize').value, gap = +$('effGap').value, conv = +$('effConv').value / 100, abs = mat === 'xe' ? 0.75 : 0.98;
    const capt = size / (size + gap), detected = 1000 * capt, absorbed = detected * abs, signal = absorbed * conv;
    $('effSizeOut').textContent = size + ' units'; $('effGapOut').textContent = gap + ' units'; $('effConvOut').textContent = Math.round(conv * 100) + '%';
    const row = (n, v, col) => `<div class="meter-row"><span>${n}</span><div class="bar"><i style="width:${v * 100}%;background:${col}"></i></div><output>${Math.round(v * 100)}%</output></div>`;
    $('effMeters').innerHTML = row('Capture', capt, 'var(--cyan)') + row('Absorption', abs, 'var(--purple)') + row('Conversion (overall)', signal / 1000, 'var(--orange)');
    const tag = signal > 700 ? 'ok' : signal < 450 ? 'bad' : '';
    $('effText').className = 'say ' + tag;
    $('effText').innerHTML = `1,000 photons arrive → <b>${Math.round(detected)}</b> land on a detector face (the rest fall in gaps) → <b>${Math.round(absorbed)}</b> are absorbed (${mat === 'xe' ? 'xenon absorbs only 60–90%' : 'crystals absorb nearly 100%'}) → <b>${Math.round(signal)}</b> become electrical signal. ` +
      (tag === 'ok' ? 'An efficient detector: <b>less noise at a lower dose</b>.' : 'Photons lost here still gave the patient dose, so you need more mAs for the same noise.');
  }
  U.seg('effMat', 'm', v => { mat = v; drawEff(); });
  ['effSize', 'effGap', 'effConv'].forEach(id => $(id).addEventListener('input', drawEff)); drawEff();

  /* ---------- detector process ---------- */
  const PROC = {
    xe: ['A photon enters the channel through the casing window. Some photons are already lost in the window: one reason absorption is only 60–90%.',
      'The x-ray <b>ionizes the xenon gas</b>, knocking electrons off atoms: positive ions and free electrons.',
      'Charged <b>tungsten electrode plates</b> (1.5 mm apart) attract the ions, which are <b>accelerated and amplified</b>.',
      'The collected charge flows as an <b>electric current</b>. Its size is proportional to the photon energy, and it becomes the <b>raw data</b>.'],
    sc: ['A photon hits the <b>scintillation crystal</b> directly. There is no window to lose it in, so absorption is nearly 100%.',
      'The crystal <b>fluoresces</b>: it gives off a flash of <b>light</b>. Spacing bars on each side stop the light leaking to neighbours (crosstalk).',
      'A <b>photodiode</b> behind the crystal detects the light and converts it into an <b>analog electrical signal</b>.',
      'The signal is digitized into <b>binary data</b> and sent to the computer. Leftover glow after the beam stops is <b>afterglow</b>, which must be subtracted.']
  };
  let dt = 'xe', ds = 0;
  function drawDet() {
    let o = '';
    if (dt === 'xe') {
      o += `<rect x="70" y="40" width="260" height="170" rx="16" fill="var(--lav-soft)" stroke="var(--purple)" stroke-width="3"/><rect x="150" y="34" width="100" height="10" rx="4" fill="var(--cyan)"/>`;
      [110, 150, 190, 230, 270, 310].forEach((x, i) => { o += `<rect x="${x - 3}" y="60" width="6" height="130" rx="2" fill="${ds >= 2 ? 'var(--orange)' : '#8a8494'}"/>`; });
      for (let i = 0; i < 26; i++) o += `<circle cx="${84 + (i * 53) % 236}" cy="${66 + (i * 37) % 130}" r="3" fill="var(--purple)" opacity=".35"/>`;
      o += `<path d="M200 0V${ds ? 150 : 50}" stroke="var(--beam)" stroke-width="4" marker-end="url(#dA)"/>`;
      if (ds === 0) o += `<path d="M170 0V40" stroke="var(--beam)" stroke-width="3" opacity=".6"/><circle cx="170" cy="40" r="5" fill="var(--marker)"/><text x="160" y="28" text-anchor="end" font-size="10" fill="var(--marker)">lost in window</text>`;
      if (ds >= 1) [[185, 110], [215, 125], [195, 140], [205, 95]].forEach(([x, y], i) => { o += `<text x="${x}" y="${y}" font-size="16" font-weight="700" fill="${i % 2 ? 'var(--marker)' : 'var(--purple)'}" text-anchor="middle">${i % 2 ? '−' : '+'}</text>`; });
      if (ds >= 2) o += `<path d="M195 110h-35M215 125h35M195 140h-35M205 95h35" stroke="var(--ink)" stroke-width="2" marker-end="url(#dK)"/>`;
      if (ds >= 3) o += `<path d="M330 120h40v80" stroke="var(--orange)" stroke-width="4" fill="none"/><path d="M340 230q10-20 20 0t20 0" stroke="var(--orange)" stroke-width="3" fill="none"/><text x="360" y="252" text-anchor="middle" font-size="11" fill="var(--ink)">current</text>`;
      o += `<text x="200" y="232" text-anchor="middle" font-size="11" fill="var(--ink-2)">xenon gas between tungsten plates</text>`;
    } else {
      o += `<rect x="60" y="50" width="22" height="160" rx="4" fill="#8a8494"/><rect x="318" y="50" width="22" height="160" rx="4" fill="#8a8494"/>`;
      o += `<rect x="92" y="50" width="216" height="110" rx="12" fill="var(--cyan)" opacity="${ds >= 1 ? 1 : 0.75}"/><rect x="92" y="166" width="216" height="40" rx="10" fill="var(--ink)"/>`;
      o += `<text x="200" y="190" text-anchor="middle" font-size="11" fill="var(--sheet)">photodiode</text><text x="200" y="146" text-anchor="middle" font-size="11" fill="#231F2B">crystal (CsI, CdWO₄…)</text>`;
      o += `<path d="M200 0V${ds ? 100 : 46}" stroke="var(--beam)" stroke-width="4" marker-end="url(#dA)"/>`;
      if (ds >= 1) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; o += `<path d="M200 100l${Math.cos(a) * 34} ${Math.sin(a) * 30}" stroke="#FFE38A" stroke-width="3" stroke-linecap="round"/>`; }
      if (ds >= 2) o += `<path d="M308 186h50v20" stroke="var(--orange)" stroke-width="4" fill="none"/><path d="M340 230q10-20 20 0t20 0" stroke="var(--orange)" stroke-width="3" fill="none"/>`;
      if (ds >= 3) o += `<text x="200" y="250" text-anchor="middle" font-size="14" font-weight="700" fill="var(--purple-ink)">0110 1011 → computer</text>`;
      o += `<text x="40" y="40" font-size="10" fill="var(--ink-2)">spacing bars</text>`;
    }
    o = `<defs><marker id="dA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--beam)"/></marker><marker id="dK" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--ink)"/></marker></defs>` + o;
    $('detArt').innerHTML = o;
    $('detText').innerHTML = PROC[dt][ds];
    $('detCount').textContent = `Step ${ds + 1} of 4`;
    $('detPrev').disabled = ds === 0; $('detNext').disabled = ds === 3;
  }
  U.seg('detType', 't', v => { dt = v; ds = 0; drawDet(); });
  $('detPrev').addEventListener('click', () => { ds--; drawDet(); });
  $('detNext').addEventListener('click', () => { ds++; drawDet(); });
  drawDet();
})();
