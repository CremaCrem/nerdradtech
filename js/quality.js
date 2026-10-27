/* Chapter VI: factor sorter, image quality trade-off lab, artifact gallery with before/after wipe, spot the artifact */
(() => {
  const { $ } = U;
  const fmt = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n));

  /* ---------- sorter ---------- */
  const FACTORS = [
    ['Thin slice', 's'], ['Small pixel size', 's'], ['Small detector aperture', 's'], ['Large matrix', 's'], ['Small DFOV', 's'], ['Bone filter', 's'], ['Low pitch', 's'], ['Small focal spot', 's'],
    ['Increase mAs', 'c'], ['Thick slice', 'c'], ['Large pixel size', 'c'], ['Soft tissue filter', 'c'], ['Small patient', 'c'], ['Wide window width', 'c'], ['Increase SNR', 'c'],
    ['Fast gantry rotation', 't'], ['Dual source CT', 't'], ['EBCT', 't'], ['Cardiac gating', 't'], ['Short exposure time', 't'], ['Improved contrast timing', 't']];
  const NAME = { s: 'spatial', c: 'low-contrast', t: 'temporal' };
  let sel = null, placed = 0, misses = 0;
  function resetSort() {
    const order = FACTORS.map((f, i) => i).sort(() => Math.random() - 0.5);
    $('sortChips').innerHTML = order.map(i => `<button data-i="${i}">${FACTORS[i][0]}</button>`).join('');
    document.querySelectorAll('#sortBuckets .got').forEach(g => g.innerHTML = '');
    sel = null; placed = 0; misses = 0; score();
    $('sortSay').className = 'say'; $('sortSay').textContent = 'Pick a factor first.';
    document.querySelectorAll('#sortChips button').forEach(b => b.addEventListener('click', () => {
      document.querySelectorAll('#sortChips button').forEach(x => x.classList.toggle('sel', x === b));
      sel = b; document.querySelectorAll('.bucket').forEach(x => x.classList.add('ready'));
      $('sortSay').className = 'say'; $('sortSay').innerHTML = `<b>${b.textContent}</b> improves which resolution?`;
    }));
  }
  const score = () => { $('sortScore').textContent = `${placed} of ${FACTORS.length} sorted · ${misses} miss${misses === 1 ? '' : 'es'}`; };
  document.querySelectorAll('.bucket').forEach(bk => bk.addEventListener('click', () => {
    if (!sel) return;
    const [name, ans] = FACTORS[+sel.dataset.i], ok = ans === bk.dataset.b;
    if (ok) {
      bk.querySelector('.got').insertAdjacentHTML('beforeend', `<span>${name}</span>`); sel.remove(); placed++;
      $('sortSay').className = 'say ok'; $('sortSay').innerHTML = placed === FACTORS.length ? `All sorted with ${misses} miss${misses === 1 ? '' : 'es'}. ${misses ? 'Start over to try for zero.' : 'Perfect.'}` : `Yes: <b>${name}</b> → ${NAME[ans]} resolution.`;
    } else {
      misses++; sel.classList.remove('bad'); void sel.offsetWidth; sel.classList.add('bad');
      $('sortSay').className = 'say bad'; $('sortSay').innerHTML = `Not ${NAME[bk.dataset.b]}. Hint: ${ans === 's' ? 'it makes things <b>smaller or sharper</b>' : ans === 'c' ? 'it means <b>more photons per pixel or less noise</b>' : 'it is about <b>speed</b>'}.`;
    }
    if (ok) { sel = null; document.querySelectorAll('.bucket').forEach(x => x.classList.remove('ready')); }
    score();
  }));
  $('sortReset').addEventListener('click', resetSort); resetSort();

  /* ---------- trade-off lab ---------- */
  const TN = 192, TF = 26, TCX = -3, TCY = 2, TZ = 0.57, tCache = {};
  const LES = { x: (-8.4 - TCX) / TF * TN + TN / 2, y: (-1.6 - TCY) / TF * TN + TN / 2 }, LIV = { x: (-5 - TCX) / TF * TN + TN / 2, y: (2 - TCY) / TF * TN + TN / 2 };
  let ker = 'soft', size = 1;
  function drawTq() {
    const thk = +$('tqThk').value, mas = +$('tqMas').value;
    const base = tCache[thk] || (tCache[thk] = Phantom.thick(TZ, thk, TN, TF, { lesion: 1 }, TCX, TCY));
    const sigma = 11 * Math.sqrt(100 / mas) * Math.sqrt(5 / thk) * size;
    const img = Phantom.kernel(Phantom.noise(base, sigma, 41), TN, ker);
    const { ctx: c, w } = Phantom.draw($('tqCv'), img, TN, 160, 55), k = w / TN;
    [[LES, '#FFB257'], [LIV, '#7ADCF3']].forEach(([p, col]) => { c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.arc(p.x * k, p.y * k, (p === LES ? 8 : 6) * k, 0, 7); c.stroke(); });
    const a = Phantom.roi(img, TN, LES.x, LES.y, 6), b = Phantom.roi(img, TN, LIV.x, LIV.y, 6);
    const noise = b.sd, cnr = Math.abs(b.mean - a.mean) / Math.max(1, noise);
    const spatial = Math.max(0.05, Math.min(1, (10 - thk) / 9 * 0.6 + (ker === 'bone' ? 0.4 : 0.12)));
    const dose = Math.min(1, mas / 400 * size);
    $('tqThkOut').textContent = thk + ' mm'; $('tqMasOut').textContent = mas;
    const row = (n, v, col, out) => `<div class="meter-row"><span>${n}</span><div class="bar"><i style="width:${Math.max(3, v * 100)}%;background:${col}"></i></div><output>${out}</output></div>`;
    $('tqMeters').innerHTML = row('Spatial res.', spatial, 'var(--purple)', Math.round(spatial * 10) + '/10') + row('Lesion CNR', Math.min(1, cnr / 3), 'var(--cyan)', cnr.toFixed(1)) +
      row('Noise (SD)', Math.min(1, noise / 40), 'var(--pink)', noise.toFixed(1)) + row('Patient dose', dose, 'var(--orange)', Math.round(dose * 100) + '%');
    const seen = cnr > 1.6;
    $('tqSay').className = 'say ' + (seen ? 'ok' : 'bad');
    $('tqSay').innerHTML = `Liver ${fmt(b.mean)} HU vs lesion ${fmt(a.mean)} HU, noise SD ${noise.toFixed(1)}. ` + (seen ? '<b>The lesion is visible.</b> ' : '<b>The lesion drowns in the noise.</b> ') +
      (ker === 'bone' ? 'The bone filter sharpens edges but multiplies the noise: bad for low contrast. ' : '') +
      (thk <= 2 ? 'Thin slices sharpen detail but collect fewer photons, so noise rises. ' : thk >= 8 ? 'Thick slices are smooth (good contrast) but blur small things (partial volume). ' : '') +
      (size > 1 ? 'A large patient absorbs more of the beam, so fewer photons reach the detector. ' : '');
  }
  ['tqThk', 'tqMas'].forEach(id => $(id).addEventListener('input', drawTq));
  U.seg('tqKer', 'k', v => { ker = v; drawTq(); });
  U.seg('tqSize', 's', v => { size = +v; drawTq(); });
  U.visible($('tqCv'), v => v && drawTq()); U.onRedraw(drawTq);

  /* ---------- artifact simulations ---------- */
  const S = 200;
  const lazy = f => { let v; return () => v || (v = f()); };
  const head = lazy(() => Phantom.noise(Phantom.slice(0, S, 34, 0, 0, { petrous: 1 }, Phantom.head), 4, 1));
  const water = lazy(() => Phantom.noise(Phantom.slice(0, S, 34, 0, 0, {}, (x, y) => x * x + y * y < 0.42 ? 0 : -1000), 4, 2));
  const abd = lazy(() => Phantom.noise(Phantom.slice(0.72, S, 44), 6, 3));
  const chest = lazy(() => Phantom.noise(Phantom.slice(0.3, S, 44), 6, 4));
  const screws = lazy(() => Phantom.noise(Phantom.slice(0.75, S, 44, 0, 0, { screws: 1 }), 6, 5));
  const barium = lazy(() => Phantom.noise(Phantom.slice(0.56, S, 44, 0, 0, { barium: 1 }), 6, 6));
  const waterOral = lazy(() => Phantom.noise(Phantom.slice(0.56, S, 44), 6, 6));
  const arms = lazy(() => Phantom.noise(Phantom.slice(0.7, S, 56, 0, 0, { arms: 1 }), 6, 7));
  const armsUp = lazy(() => Phantom.noise(Phantom.slice(0.7, S, 56), 6, 7));
  const pvThick = lazy(() => Phantom.noise(Phantom.thick(0.5, 10, S, 44), 4, 8));
  const pvThin = lazy(() => Phantom.noise(Phantom.thick(0.5, 1, S, 44), 6, 8));

  const map = (src, f) => { const a = src(), o = new Float32Array(a.length); for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) o[j * S + i] = f(a[j * S + i], i, j, a); return o; };
  const C = S / 2, toPx = (cm, fov) => cm / fov * S + C;
  const lineDist = (i, j, x0, y0, th) => Math.abs((i - x0) * Math.sin(th) - (j - y0) * Math.cos(th));
  const inBody = v => v > -500;
  const sfovMask = (a) => { const R = 25 / 56 * S; for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) if ((i - C) ** 2 + (j - C) ** 2 > R * R) a[j * S + i] = -1000; return a; };

  const ARTS = [
    { id: 'bh', name: 'Beam hardening', cls: 'Physics', ww: 120, wl: 40,
      make: () => { const L = [toPx(-6, 34), toPx(2.4, 34)], R = [toPx(6, 34), toPx(2.4, 34)];
        return map(head, (v, i, j) => { if (v < -10 || v > 200) return v; const t = Math.max(0, Math.min(1, ((i - L[0]) * (R[0] - L[0])) / ((R[0] - L[0]) ** 2))), px = L[0] + t * (R[0] - L[0]), d = Math.hypot(i - px, j - L[1]);
          let s = -65 * Math.exp(-((d / 7) ** 2)); for (const th of [0.5, -0.5, 0.25, -0.25]) s -= 22 * Math.exp(-((lineDist(i, j, C, L[1], th) / 1.4) ** 2)) * (Math.abs(i - C) < 45 ? 1 : 0); return v + s; }); },
      fix: head, cause: 'The beam is <b>polychromatic</b>: low-energy photons are absorbed first, so the beam "hardens" as it crosses dense bone. Structures behind it get different HU from the same tissue in front.',
      look: '<b>Dark bands or streaks between dense objects</b>. Common at the <b>skull base</b>, <b>between the petrous bones</b>, and in the <b>posterior fossa</b>.',
      fixTxt: 'Filter the beam (<b>Teflon or aluminum</b>), calibration correction, beam-hardening correction software, <b>higher kVp</b>, choose the appropriate SFOV.' },
    { id: 'cup', name: 'Cupping', cls: 'Physics', ww: 60, wl: 0, profile: true,
      make: () => map(water, (v, i, j) => { return inBody(v) ? v - 32 * Math.max(0, 1 - ((i - C) ** 2 + (j - C) ** 2) / ((S * 0.38) ** 2)) : v; }),
      fix: water, cause: 'A result of <b>beam hardening</b>: rays through the middle of the body harden more than rays through the edge.',
      look: 'A <b>vague area of increased density around the periphery</b> in a concentric shape, <b>like a cup</b>. The middle reads darker (see the yellow profile). Broad dark bands.',
      fixTxt: 'As for beam hardening: beam filtration (bowtie), calibration, beam-hardening correction software.' },
    { id: 'pv', name: 'Partial volume', cls: 'Physics', ww: 1200, wl: -300,
      make: pvThick, fix: pvThin, cause: '<b>More than one tissue inside one voxel</b>: their values are averaged into one less accurate number. Caused by a <b>thick slice, large pixel, large voxel</b>.',
      look: '<b>Shading</b> where structures change quickly along z: here the lung bases and liver dome blur into each other in a 10 mm slice. Lecture examples: 8 mm normal + 2 mm pathology in 10 mm; calcium +600 with lung −600 averages to 0.',
      fixTxt: 'Use a <b>thin slice</b>, <b>small pixel</b>, <b>small voxel</b> (right side: 1 mm).' },
    { id: 'alias', name: 'Aliasing', cls: 'Physics', ww: 400, wl: 40,
      make: () => { const vx = C, vy = toPx(7.2, 44); return map(chest, (v, i, j) => { if (!inBody(v)) return v; const r = Math.hypot(i - vx, j - vy), th = Math.atan2(j - vy, i - vx); return r < 12 ? v : v + 55 * Math.cos(th * 90) * Math.exp(-(r - 12) / 40); }); },
      fix: chest, cause: '<b>Insufficient projection data</b>: <b>high pitch</b>, <b>too few samples (undersampling)</b>, small FOV.',
      look: '<b>Fine stripes radiating from a dense structure</b> (here the spine).',
      fixTxt: '<b>Slow the gantry rotation</b>, increase scan time, <b>reduce helical pitch</b>, increase the FOV.' },
    { id: 'edge', name: 'Edge gradient', cls: 'Physics', ww: 400, wl: 40,
      make: () => { const yI = toPx(-5.4, 44), x0 = toPx(2.4, 44), x1 = toPx(12.2, 44); return map(barium, (v, i, j) => { const dy = j - yI, out = i < x0 ? x0 - i : i > x1 ? i - x1 : 0; return inBody(v) || out < 40 ? v + 170 * Math.sin(dy / 1.3) * Math.exp(-Math.abs(dy) / 5) * Math.exp(-out / 26) : v; }); },
      fix: waterOral, cause: 'Occurs where <b>barium and air lie next to each other</b> (in the stomach). The beam angle varies between two similar views across the sharp edge. <b>Largely unavoidable.</b>',
      look: '<b>Streaks or shading, both light and dark</b>, along the barium–air interface.',
      fixTxt: '<b>Thinner slices</b>, and use a <b>low-HU oral contrast such as water</b> (right side).' },
    { id: 'motion', name: 'Motion', cls: 'Patient', ww: 400, wl: 40,
      make: () => { const a = abd(); return map(abd, (v, i, j) => { const ii = Math.min(S - 1, Math.max(0, i - 6)), jj = Math.min(S - 1, Math.max(0, j - 3)); let s = 0.6 * v + 0.4 * a[jj * S + ii]; for (const [th, A] of [[0.3, 90], [-0.6, -80], [1.2, 70]]) s += A * Math.exp(-((lineDist(i, j, C + 30, C - 30, th) / 1.2) ** 2)); return s; }); },
      fix: abd, cause: '<b>Voluntary or involuntary</b> patient motion (breathing, peristalsis, the heart, a restless patient).',
      look: '<b>Shading, ghosting, streaking, blurring</b>: here a doubled outline (ghost) and streaks.',
      fixTxt: 'Explain the procedure, clear <b>breathing instructions</b>, immobilization, sedation, <b>shorter scan time</b>. Manufacturer: overscan and partial scan modes, software correction, <b>cardiac gating</b>, β-blockers.' },
    { id: 'metal', name: 'Metal', cls: 'Patient', ww: 400, wl: 40,
      make: () => streaks(1), fix: () => streaks(0.2), cause: 'A <b>metallic object in the SFOV</b> (here pedicle screws) attenuates <b>beyond the dynamic range</b> of the scanner.',
      look: '<b>Streaks</b> radiating from the metal, bright and dark.',
      fixTxt: '<b>Remove metallic objects</b> from the SFOV when possible, <b>angle the gantry</b>, <b>increase technique</b>, <b>thin slices</b> (right side: reduced streaks).' },
    { id: 'oof', name: 'Out-of-field', cls: 'Patient', ww: 400, wl: 40, sfov: true,
      make: () => { const a = arms(), R = 25 / 56 * S; const o = map(arms, (v, i, j) => { const r = Math.hypot(i - C, j - C), th = Math.atan2(j - C, i - C), side = Math.abs(Math.cos(th)) ** 6; let s = v; if (inBody(v) && r < R) s += 160 * side * Math.exp(-(R - r) / 7); s += 70 * Math.exp(-((lineDist(i, j, C, C + 2, 0) / 1.5) ** 2)) * (r < R ? 1 : 0) * (inBody(v) ? 1 : 0); return s; }); return sfovMask(o); },
      fix: () => sfovMask(new Float32Array(armsUp())), cause: '<b>Anatomy extends outside the selected SFOV</b>. Classic cause: the <b>patient\'s arms down by their sides</b> during body imaging.',
      look: '<b>Streaks and shading</b> near the edge of the image. The dashed circle is the SFOV: anything outside it is not imaged.',
      fixTxt: '<b>Raise the patient\'s arms</b>, use the <b>largest SFOV</b> (right side: arms up).' },
    { id: 'ring', name: 'Ring', cls: 'Equipment', ww: 400, wl: 40,
      make: () => map(abd, (v, i, j) => { const r = Math.hypot(i - C, j - C); let s = 0; for (const [r0, A] of [[11, 90], [19, -80], [33, 70], [46, -60]]) s += A * Math.exp(-(((r - r0) / 0.9) ** 2)); return inBody(v) ? v + s : v; }),
      fix: abd, cause: '<b>Imperfect detector elements</b>, faulty or out of calibration. Occurs with <b>3rd generation</b> scanners, where each element always sees the same distance from the center.',
      look: 'A <b>ring or concentric rings centered on the rotation axis</b> (near the isocenter).',
      fixTxt: '<b>Recalibrate</b> the detectors, or <b>call the service engineer</b>.' },
    { id: 'arc', name: 'Tube arcing', cls: 'Equipment', ww: 400, wl: 40,
      make: () => { const r = U.rng(11), L = Array.from({ length: 7 }, () => [C + (r() - 0.5) * 120, C + (r() - 0.5) * 120, r() * Math.PI, (r() - 0.5) * 500]), n = U.rng(12);
        return map(abd, (v, i, j) => { if (!inBody(v)) return v; let s = v; for (const [x, y, th, A] of L) s += A * Math.exp(-((lineDist(i, j, x, y, th) / 0.9) ** 2)); if (((i >> 4) + (j >> 4)) % 3 === 0) s += U.gauss(n) * 45; return s; }); },
      fix: abd, cause: '<b>High-voltage arcing</b>: an undesired surge of electrical current (a short circuit) in the x-ray tube, often from <b>residual gas molecules</b>.',
      look: '<b>No specific pattern</b>: from a single slight streak to many streaks and <b>severe mottling</b>.',
      fixTxt: '<b>Call the service engineer.</b>' },
    { id: 'spiral', name: 'Spiral interpolation', cls: 'Equipment', ww: 400, wl: 40,
      make: () => { const vy = toPx(7.2, 44); return map(abd, (v, i, j) => { if (!inBody(v)) return v; const th = Math.atan2(j - vy, i - C), r = Math.hypot(i - C, j - vy); return v + 28 * Math.sin(th * 3 + r / 16) * Math.exp(-r / 70); }); },
      fix: abd, cause: 'From the <b>helical interpolation and reconstruction</b>: images are made from views that are <b>not all in the same plane</b>. Worse with a <b>higher pitch</b>.',
      look: '<b>Subtle inaccuracies in CT number</b>: faint blotchy shading (look closely).',
      fixTxt: 'Use a <b>lower pitch</b>.' },
    { id: 'cone', name: 'Cone beam (windmill)', cls: 'Equipment', ww: 400, wl: 40,
      make: () => { const vy = toPx(7.2, 44); return map(chest, (v, i, j) => { if (!inBody(v) || v > 300) return v; const th = Math.atan2(j - vy, i - C), r = Math.hypot(i - C, j - vy); return r < 10 ? v : v + 110 * Math.sign(Math.sin(th * 7 + r / 9)) * Math.exp(-(r - 10) / 28); }); },
      fix: chest, cause: 'From the <b>cone-shaped x-ray beam</b>. Appears <b>only on MDCT helical</b> systems.',
      look: '<b>Lines in a windmill formation</b> spinning out from a dense structure.',
      fixTxt: 'Use the <b>pitch recommended by the manufacturer</b> and a <b>cone beam reconstruction algorithm</b>.' },
  ];
  /* streaks from two pedicle screws; f scales them (1 = artifact, 0.2 = after correction) */
  function streaks(f) {
    const y = toPx(9.8, 44), M = [[C - 4, y], [C + 4, y]];
    return map(screws, (v, i, j) => {
      if (!inBody(v)) return v;
      let s = v;
      for (let k = 0; k < 36; k++) { const th = k / 36 * Math.PI, [x0, y0] = M[k % 2]; s += f * (k % 3 ? 320 : -420) * Math.exp(-((lineDist(i, j, x0, y0, th) / 0.8) ** 2)) / (1 + Math.hypot(i - x0, j - y0) / 30); }
      if (Math.abs(i - C) < 30) s -= f * 160 * Math.exp(-((lineDist(i, j, M[0][0], M[0][1], 0) / 2.2) ** 2));
      return s;
    });
  }

  const imgCache = {};
  const get = (a, which) => imgCache[a.id + which] || (imgCache[a.id + which] = which === 'a' ? a.make() : a.fix());
  function render(cv, a, which) {
    const { ctx: c, w } = Phantom.draw(cv, get(a, which), S, a.ww, a.wl);
    if (a.sfov) { c.strokeStyle = '#FFB257'; c.setLineDash([5, 5]); c.lineWidth = 1.5; c.beginPath(); c.arc(w / 2, w / 2, 25 / 56 * w, 0, 7); c.stroke(); c.setLineDash([]); }
    if (a.profile) {
      // mean of a band of rows through the middle, smoothed along the row, so the cup shape shows through the noise
      const arr = get(a, which), r0 = S / 2 - 6, prof = [];
      for (let i = 0; i < S; i++) { let t = 0, k = 0; for (let r = r0; r < r0 + 12; r++) for (let d = -3; d <= 3; d++) { const v = arr[r * S + Math.min(S - 1, Math.max(0, i + d))]; if (v > -500) { t += v; k++; } } prof.push(k > 40 ? t / k : null); }
      c.strokeStyle = '#FFE38A'; c.lineWidth = 2.5; c.beginPath(); let on = false;
      prof.forEach((v, i) => { if (v === null) return; const y = w * 0.78 - (v + 40) * 2.2 * w / S; on ? c.lineTo(i * w / S, y) : c.moveTo(i * w / S, y); on = true; });
      c.stroke();
    }
  }
  $('artGrid').innerHTML = ARTS.map((a, i) => `<button class="art-card" data-i="${i}" aria-pressed="${i === 0}"><canvas width="150" height="150"></canvas><span><small>${a.cls}</small>${a.name}</span></button>`).join('');
  let cur = 0;
  function show(i) {
    cur = i; const a = ARTS[i];
    document.querySelectorAll('.art-card').forEach((b, k) => b.setAttribute('aria-pressed', k === i));
    render($('artWipe').querySelector('.before'), a, 'a'); render($('artWipe').querySelector('.after'), a, 'b');
    $('artInfo').innerHTML = `<h4 style="font-size:1.6rem">${a.name}</h4><span class="badge">${a.cls}-based</span>
      <div class="card"><b>Cause</b><p>${a.cause}</p></div><div class="card"><b>Appearance</b><p>${a.look}</p></div><div class="card tone mint"><b>Correction</b><p>${a.fixTxt}</p></div>`;
  }
  document.querySelectorAll('.art-card').forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
  let galleryDone = false;
  U.visible($('artGrid'), v => {
    if (!v || galleryDone) return; galleryDone = true;
    let k = 0; const next = () => { if (k >= ARTS.length) return; render(document.querySelectorAll('.art-card canvas')[k], ARTS[k], 'a'); k++; setTimeout(next, 16); };
    show(0); next();
  });
  U.onRedraw(() => { if (galleryDone) { show(cur); document.querySelectorAll('.art-card canvas').forEach((c, k) => render(c, ARTS[k], 'a')); } });
  // wipe
  const wipe = $('artWipe');
  const cut = e => { const r = wipe.getBoundingClientRect(); wipe.style.setProperty('--cut', Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)) + '%'); };
  let wd = false;
  wipe.addEventListener('pointerdown', e => { wd = true; wipe.setPointerCapture(e.pointerId); cut(e); });
  wipe.addEventListener('pointermove', e => wd && cut(e));
  wipe.addEventListener('pointerup', () => { wd = false; });

  /* ---------- spot the artifact ---------- */
  let spot = null, right = 0, total = 0, answered = false;
  const shuffle = a => a.map(v => [Math.random(), v]).sort((x, y) => x[0] - y[0]).map(x => x[1]);
  function nextSpot() {
    let i; do { i = Math.floor(Math.random() * ARTS.length); } while (spot === i);
    spot = i; answered = false; render($('spotCv'), ARTS[i], 'a');
    const opts = shuffle([i, ...shuffle(ARTS.map((_, k) => k).filter(k => k !== i)).slice(0, 3)]);
    $('spotOpts').innerHTML = opts.map((k, n) => `<button data-k="${k}"><b>${'ABCD'[n]}</b><span>${ARTS[k].name}</span></button>`).join('');
    $('spotWhy').hidden = true;
    document.querySelectorAll('#spotOpts button').forEach(b => b.addEventListener('click', () => {
      if (answered) return; answered = true; total++;
      const ok = +b.dataset.k === spot; if (ok) right++;
      document.querySelector(`#spotOpts [data-k="${spot}"]`).classList.add('right'); if (!ok) b.classList.add('wrong');
      $('spotWhy').hidden = false; $('spotWhy').innerHTML = `${ok ? '<b>Correct.</b>' : `<b>It's ${ARTS[spot].name}.</b>`} ${ARTS[spot].look}`;
      $('spotScore').textContent = `${right} of ${total} right`;
    }));
  }
  $('spotNext').addEventListener('click', nextSpot);
  let spotStarted = false;
  U.visible($('spotCv'), v => { if (v && !spotStarted) { spotStarted = true; nextSpot(); } });
})();
