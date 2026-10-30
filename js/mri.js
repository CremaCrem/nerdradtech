/* MRI page: headline spin, spin lab, relaxation plots, TR/TE weighting, inversion time, pulse trains, gauss lines, artifact gallery */
(() => {
  const { $ } = U;
  const TAU = Math.PI * 2;
  const arrow = (c, x0, y0, x1, y1, col, w, head = 9) => {
    const a = Math.atan2(y1 - y0, x1 - x0);
    c.strokeStyle = c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * head * .6, y1 - Math.sin(a) * head * .6); c.stroke();
    if (head) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - head * Math.cos(a - .45), y1 - head * Math.sin(a - .45)); c.lineTo(x1 - head * Math.cos(a + .45), y1 - head * Math.sin(a + .45)); c.closePath(); c.fill(); }
  };

  /* ---------- headline O: one proton precessing ---------- */
  (() => {
    const cv = $('o1'), S = 160; cv.width = cv.height = S; const c = cv.getContext('2d');
    U.loop(cv, t => {
      const a = t / 380;
      c.clearRect(0, 0, S, S);
      c.strokeStyle = 'rgba(35,31,43,.35)'; c.lineWidth = 4; c.beginPath(); c.ellipse(80, 46, 40, 13, 0, 0, TAU); c.stroke();
      c.fillStyle = '#FF8DC1'; c.beginPath(); c.arc(80, 116, 22, 0, TAU); c.fill();
      arrow(c, 80, 116, 80 + 40 * Math.cos(a), 46 + 13 * Math.sin(a), '#231F2B', 9, 22);
      c.fillStyle = '#fff'; c.beginPath(); c.arc(72, 108, 6, 0, TAU); c.fill();
    });
  })();

  /* ---------- plotting helper for the SVG curve charts ---------- */
  function plot(svg, { xmax, ymin = 0, ymax = 1, curves, mark, guides = [], xlab }) {
    const X = t => 40 + t / xmax * 262, Y = v => 150 - (v - ymin) / (ymax - ymin) * 136;
    let h = `<path d="M40 14V150H302" stroke="var(--ink-2)" fill="none" stroke-width="1.5"/>`;
    if (ymin < 0) h += `<path d="M40 ${Y(0)}H302" stroke="var(--rule-2)"/>`;
    guides.forEach(g => h += `<path d="M40 ${Y(g.y)}H302" stroke="var(--ink-2)" stroke-dasharray="3 4"/><text x="36" y="${Y(g.y) + 4}" text-anchor="end" font-size="9" fill="var(--ink-2)">${g.label}</text>`);
    curves.forEach(cu => {
      const pts = Array.from({ length: 81 }, (_, i) => { const t = xmax * i / 80; return `${X(t).toFixed(1)} ${Y(cu.f(t)).toFixed(1)}`; });
      h += `<path d="M${pts.join('L')}" stroke="${cu.c}" stroke-width="2.5" fill="none"/>`;
      if (cu.label) h += `<text x="300" y="${Y(cu.f(xmax)) + (cu.dy || -4)}" text-anchor="end" font-size="9" font-weight="700" fill="${cu.c}">${cu.label}</text>`;
    });
    if (mark) h += `<path d="M${X(mark.x)} 14V150" stroke="var(--marker)" stroke-width="2"/><text x="${Math.min(X(mark.x) + 4, 268)}" y="24" font-size="10" font-weight="700" fill="var(--marker)">${mark.label}</text>`;
    h += `<text x="40" y="166" font-size="9" fill="var(--ink-2)">0</text><text x="302" y="166" text-anchor="end" font-size="9" fill="var(--ink-2)">${xlab}</text>`;
    svg.innerHTML = h;
  }

  /* ---------- tissues (T1, T2 from the lecture table; PD assumed) ---------- */
  const TIS = [
    { k: 'fat', name: 'Fat', t1: 245, t2: 70, pd: .9, c: '#F08F1C' },
    { k: 'wm', name: 'White matter', t1: 780, t2: 90, pd: .74, c: '#2FB6DC' },
    { k: 'gm', name: 'Gray matter', t1: 920, t2: 100, pd: .78, c: '#EC5E9E' },
    { k: 'csf', name: 'CSF', t1: 4350, t2: 2200, pd: 1, c: '#8D6CF0' }
  ];

  /* A brain slice: scalp fat, skull, CSF, gray matter, white matter, ventricles. g = grays 0..1 per tissue. */
  function brain(c, g, noise = 0, seed = 7) {
    const sh = v => { const n = Math.round(Math.max(0, Math.min(1, v)) * 255); return `rgb(${n},${n},${n})`; };
    const blob = (rx, ry, wob, col) => {
      c.fillStyle = col; c.beginPath();
      for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, r = 1 + wob * Math.sin(9 * a) + wob * .6 * Math.sin(14 * a + 1); c.lineTo(160 + rx * r * Math.cos(a), 162 + ry * r * Math.sin(a)); }
      c.fill();
    };
    c.fillStyle = '#000'; c.fillRect(0, 0, 320, 320);
    blob(130, 148, 0, sh(g.fat)); blob(118, 136, 0, sh(g.bone));
    blob(108, 126, 0, sh(g.csf)); blob(103, 121, .012, sh(g.gm)); blob(80, 98, .05, sh(g.wm));
    c.fillStyle = sh(g.csf);
    c.save(); c.translate(144, 158); c.rotate(.28); c.beginPath(); c.ellipse(0, 0, 9, 34, 0, 0, TAU); c.fill(); c.restore();
    c.save(); c.translate(176, 158); c.rotate(-.28); c.beginPath(); c.ellipse(0, 0, 9, 34, 0, 0, TAU); c.fill(); c.restore();
    c.fillRect(158, 36, 4, 82);
    if (noise > 0) {
      const im = c.getImageData(0, 0, 320, 320), d = im.data, r = U.rng(seed), k = noise * 255;
      for (let i = 0; i < d.length; i += 4) { const v = d[i] + U.gauss(r) * k; d[i] = d[i + 1] = d[i + 2] = v; }
      c.putImageData(im, 0, 0);
    }
  }
  const prep = cv => { cv.width = cv.height = 320; return cv.getContext('2d'); };

  /* ---------- static T1 and T2 curves ---------- */
  plot($('t1Plot'), { xmax: 4000, xlab: 'time (ms)', curves: [{ f: t => 1 - Math.exp(-t / 800), c: 'var(--purple)', label: 'Mz', dy: 14 }], mark: { x: 800, label: 'T1 → 63%' }, guides: [{ y: .63, label: '63%' }, { y: 1, label: '100%' }] });
  plot($('t2Plot'), { xmax: 400, xlab: 'time (ms)', curves: [{ f: t => Math.exp(-t / 100), c: 'var(--beam)', label: 'Mxy', dy: -6 }], mark: { x: 100, label: 'T2 → 37%' }, guides: [{ y: .37, label: '37%' }, { y: 1, label: '100%' }] });

  /* ---------- spin lab ---------- */
  (() => {
    const cv = $('spinCv'), c = prep(cv), cx = 160, cy = 190;
    const P = (x, y, z) => [cx + 110 * x, cy + 34 * y - 120 * z];
    const r = U.rng(3);
    const pro = Array.from({ length: 12 }, (_, i) => ({ ph: r() * TAU, tilt: .35 + r() * .3, down: i % 3 === 2, th: Math.acos(2 * r() - 1), az: r() * TAU }));
    let st = 0, t0 = performance.now(), flipped = false, fid = [];
    const larmor = () => 42.6 * +$('b0').value;
    const rf = () => document.querySelector('#rfSeg [aria-pressed="true"]').dataset.f;
    const matched = () => rf() === 'larmor';
    $('spinRead').innerHTML = '<div><small>Larmor frequency</small><b id="spL"></b></div><div><small>Mz (longitudinal)</small><b id="spZ"></b></div><div><small>Mxy (transverse)</small><b id="spX"></b></div>';
    function say() {
      const f = larmor().toFixed(1);
      const T = [
        '<b>Before B0.</b> The magnetic moments point every which way, so they cancel: <b>no net magnetization (M = 0)</b>.',
        `<b>In B0.</b> The protons <b>align</b> (most spin up, a few spin down) and <b>precess</b> around B0 at the Larmor frequency, <b>${f} MHz</b>, but out of step. The NMV lies along z: <b>Mz = 1, Mxy = 0</b>. It can't be measured yet.`,
        matched() ? `<b>RF on at ${f} MHz.</b> The RF matches the Larmor frequency, so <b>resonance</b> happens: the protons absorb energy, fall into <b>phase coherence</b>, and the NMV is <b>flipped 90°</b> into the xy plane. <b>Mz = 0, Mxy = 1</b>: maximum signal.`
          : `<b>RF on at ${rf()} MHz.</b> The protons precess at ${f} MHz, so this RF <b>doesn't match</b>. No resonance, no energy absorbed, nothing flips. Pick "Larmor".`,
        flipped ? '<b>RF off: relaxation.</b> The protons fall out of phase (<b>T2 decay</b>, Mxy shrinks fast) and realign with B0 (<b>T1 recovery</b>, Mz grows back slowly). The rotating Mxy induces the <b>FID</b> in the coil, the green trace.'
          : '<b>RF off.</b> Nothing was excited by the last RF pulse, so there is <b>no signal</b> to emit. Go back to stage 3 with the Larmor frequency.'
      ];
      $('spinSay').innerHTML = T[st];
    }
    U.seg('spinSeg', 's', v => {
      const was = st; st = +v; t0 = performance.now();
      fid = [];
      if (st === 3) flipped = was === 2 && matched();
      if (st < 2) flipped = false;
      say();
    });
    U.seg('rfSeg', 'f', () => { if (st === 2) t0 = performance.now(); say(); });
    const b0In = () => { $('b0Out').textContent = (+$('b0').value).toFixed(1) + ' T'; $('spL').textContent = larmor().toFixed(1) + ' MHz'; say(); };
    $('b0').addEventListener('input', b0In); b0In();

    U.loop(cv, (t) => {
      const ink = '#DCD6E6', pur = '#A994DA', org = '#FFB257', grn = '#94D9AF';
      const w = TAU * (.3 + .22 * +$('b0').value), ang = t / 1000 * w, tau = (t - t0) / 1000;
      let mz = 0, mxy = 0, alpha = 0, spread = 1;
      if (st === 1 || (st === 2 && !matched())) mz = 1;
      if (st === 2 && matched()) { const p = Math.min(1, tau / 1.4); alpha = p * Math.PI / 2; mz = Math.cos(alpha); mxy = Math.sin(alpha); spread = 1 - p; }
      if (st === 3) {
        if (flipped) { const r1 = 1 - Math.exp(-tau / 1.8), r2 = Math.exp(-tau / .55); mz = r1; mxy = r2; alpha = Math.PI / 2 * (1 - r1); spread = 1 - r2; }
        else mz = 1;
      }
      c.fillStyle = '#000'; c.fillRect(0, 0, 320, 320);
      c.strokeStyle = 'rgba(220,214,230,.35)'; c.lineWidth = 1.5;
      c.beginPath(); c.ellipse(cx, cy, 110, 34, 0, 0, TAU); c.stroke();
      arrow(c, cx, cy + 50, cx, 40, 'rgba(220,214,230,.55)', 1.5, 8);
      c.fillStyle = ink; c.font = '600 11px JetBrains Mono, monospace';
      c.fillText('z', cx + 6, 46); c.fillText('x-y', cx + 112, cy + 4);
      if (st > 0) { arrow(c, 22, 250, 22, 70, org, 3, 10); c.fillStyle = org; c.fillText('B0', 30, 80); }
      /* protons */
      pro.forEach((p, i) => {
        let th, az;
        if (st === 0) { th = p.th; az = p.az + t / 9000; }
        else if (mxy < .01 && alpha === 0) { th = p.down ? Math.PI - p.tilt : p.tilt; az = ang + p.ph; }
        else { th = alpha + (p.tilt - .2) * (st === 3 ? (1 - spread) * .4 + spread * .2 : spread); az = ang + p.ph * (st === 3 ? spread * 2 : spread); }
        const L = .55, [x, y] = P(L * Math.sin(th) * Math.cos(az), L * Math.sin(th) * Math.sin(az), L * Math.cos(th));
        arrow(c, cx, cy, x, y, 'rgba(169,148,218,.75)', 2, 7);
      });
      /* NMV */
      if (mz > .01 || mxy > .01) { const [x, y] = P(mxy * Math.cos(ang), mxy * Math.sin(ang), mz); arrow(c, cx, cy, x, y, org, 5, 14); }
      /* FID trace */
      if (st === 3 && flipped && tau < 4) fid.push(mxy * Math.cos(ang));
      if (fid.length) {
        c.strokeStyle = grn; c.lineWidth = 1.6; c.beginPath();
        const n = Math.min(fid.length, 300);
        for (let i = 0; i < n; i++) c.lineTo(10 + i, 292 - fid[fid.length - n + i] * 22);
        c.stroke(); c.fillStyle = grn; c.fillText('FID', 280, 280);
      }
      $('spZ').textContent = mz.toFixed(2); $('spX').textContent = mxy.toFixed(2);
      c.fillStyle = pur; c.fillText(['no B0', 'equilibrium', matched() ? 'excited' : 'no resonance', flipped ? 'relaxation' : 'no signal'][st], 12, 22);
    });
  })();

  /* ---------- TR / TE weighting ---------- */
  (() => {
    const c = prep($('wtCv'));
    $('wtMeters').innerHTML = TIS.map(s => `<div class="meter-row"><span>${s.name}</span><div class="bar"><i id="wm-${s.k}" style="background:${s.c}"></i></div><output id="wo-${s.k}"></output></div>`).join('');
    function draw() {
      const TR = +$('tr').value, TE = +$('te').value;
      $('trOut').textContent = TR + ' ms'; $('teOut').textContent = TE + ' ms';
      const sig = {}; TIS.forEach(s => sig[s.k] = s.pd * (1 - Math.exp(-TR / s.t1)) * Math.exp(-TE / s.t2));
      const mx = Math.max(...Object.values(sig)), k = 1 / mx;
      brain(c, { fat: sig.fat * k, bone: .02, csf: sig.csf * k, gm: sig.gm * k, wm: sig.wm * k }, .02 * k);
      TIS.forEach(s => { $('wm-' + s.k).style.width = (sig[s.k] * 100) + '%'; $('wo-' + s.k).textContent = Math.round(sig[s.k] * 100) + '%'; });
      const sTR = TR <= 800, lTR = TR >= 2000, sTE = TE <= 30, lTE = TE >= 80;
      const kind = sTR && sTE ? 'T1WI' : lTR && lTE ? 'T2WI' : lTR && sTE ? 'PDWI' : sTR && lTE ? 'weak' : 'mixed';
      const bright = TIS.reduce((a, b) => sig[a.k] > sig[b.k] ? a : b).name;
      $('wtCap').textContent = `TR ${TR} · TE ${TE} · ${kind === 'weak' ? 'very weak signal' : kind === 'mixed' ? 'mixed weighting' : kind}`;
      $('wtSay').className = 'say' + (kind === 'weak' ? ' bad' : kind === 'mixed' ? '' : ' ok');
      $('wtSay').innerHTML = {
        T1WI: `<b>T1 weighted.</b> Short TR gives T1 contrast: fat (shortest T1) recovers fastest and is <b>brightest</b>, CSF (longest T1) is <b>dark</b>. White matter is a little brighter than gray. Short TE keeps T2 out of it.`,
        T2WI: `<b>T2 weighted.</b> Long TR removes T1 differences, long TE lets T2 decay separate the tissues. <b>CSF</b> (longest T2) is <b>brightest</b>; fat fades.`,
        PDWI: `<b>PD weighted.</b> Long TR (little T1 contrast) and short TE (little T2 contrast) leave mostly <b>proton density</b>. Strong signal, low contrast.`,
        weak: `<b>Very weak signal.</b> Short TR leaves little Mz to flip, and long TE lets most of it decay. Look at the grain: low SNR.`,
        mixed: `<b>Mixed weighting.</b> Brightest now: ${bright}. Push TR and TE to the short or long ends to get a clean T1, T2 or PD weighted image.`
      }[kind];
      plot($('wtT1'), { xmax: 5000, xlab: '5000 ms', curves: TIS.map(s => ({ f: t => 1 - Math.exp(-t / s.t1), c: s.c, label: s.k === 'fat' ? '' : s.k === 'csf' ? 'CSF' : '' })), mark: { x: TR, label: 'TR ' + TR } });
      plot($('wtT2'), { xmax: 300, xlab: '300 ms', curves: TIS.map(s => ({ f: t => Math.exp(-t / s.t2), c: s.c, label: s.k === 'csf' ? 'CSF' : '' })), mark: { x: TE, label: 'TE ' + TE } });
    }
    ['tr', 'te'].forEach(id => $(id).addEventListener('input', draw));
    document.querySelectorAll('#wtPresets button').forEach(b => b.addEventListener('click', () => { $('tr').value = b.dataset.tr; $('te').value = b.dataset.te; draw(); }));
    draw(); U.onRedraw(draw);
  })();

  /* ---------- inversion time ---------- */
  (() => {
    const c = prep($('irCv')), TR = 6000;
    const mz = (s, ti) => 1 - 2 * Math.exp(-ti / s.t1) + Math.exp(-TR / s.t1);
    function draw() {
      const TI = +$('ti').value; $('tiOut').textContent = TI + ' ms';
      const sig = {}; TIS.forEach(s => sig[s.k] = s.pd * Math.abs(mz(s, TI)));
      const k = 1 / Math.max(...Object.values(sig));
      brain(c, { fat: sig.fat * k, bone: .02, csf: sig.csf * k, gm: sig.gm * k, wm: sig.wm * k }, .015 * k);
      const nulled = TIS.filter(s => Math.abs(mz(s, TI)) < .07);
      $('irCap').textContent = `Inversion recovery · TI ${TI} ms · TR ${TR} ms`;
      const n = nulled.map(s => s.name);
      $('irSay').className = 'say' + (n.length ? ' ok' : '');
      $('irSay').innerHTML = n.includes('Fat') ? `<b>Fat is nulled: this is STIR</b> (short TI, 100–180 ms). Fat's Mz is crossing zero when the 90° pulse arrives, so the scalp fat goes black.`
        : n.includes('CSF') ? `<b>CSF is nulled: this is FLAIR</b> (long TI, 1700–2200 ms). Water's long T1 means it crosses zero late. Dark CSF makes lesions near the ventricles easy to see.`
        : n.length ? `<b>${n.join(' and ')} nulled.</b> Not one of the two classic settings. Try the presets.`
        : 'No tissue sits at zero right now. Slide TI until a curve crosses the zero line at the red marker.';
      plot($('irPlot'), { xmax: 3000, ymin: -1, ymax: 1, xlab: '3000 ms', curves: TIS.map(s => ({ f: t => mz(s, t), c: s.c, label: s.k === 'csf' ? 'CSF' : s.k === 'fat' ? 'fat' : '', dy: s.k === 'fat' ? 12 : 14 })), mark: { x: TI, label: 'TI ' + TI }, guides: [{ y: 0, label: '0' }] });
    }
    $('ti').addEventListener('input', draw);
    document.querySelectorAll('#irPresets button').forEach(b => b.addEventListener('click', () => { $('ti').value = b.dataset.ti; draw(); }));
    draw(); U.onRedraw(draw);
  })();

  /* ---------- pulse trains ---------- */
  (() => {
    const H = { 90: 30, 180: 46, a: 16 }, COL = { 90: 'var(--purple)', 180: 'var(--beam)', a: 'var(--cyan)' };
    const rows = [
      ['Spin echo', [[90, 180], [180, 230], [90, 370], [180, 420], [90, 560], [180, 610]]],
      ['Fast spin echo', [[90, 180], [180, 230], [180, 290], [180, 350], [180, 410], [90, 560], [180, 610]]],
      ['Saturation recovery', [[90, 180], [90, 270], [90, 360], [90, 450], [90, 540], [90, 630]]],
      ['Inversion recovery', [[180, 180], [90, 240], [180, 380], [90, 440], [180, 560], [90, 620]]],
      ['Gradient echo', [['a', 180], ['a', 270], ['a', 360], ['a', 450], ['a', 540], ['a', 630]]]
    ];
    $('seqArt').innerHTML = rows.map(([name, ps], i) => {
      const y = 60 + i * 64;
      return `<text x="12" y="${y - 6}" font-size="11" font-weight="700" fill="var(--ink)">${name}</text>
        <path d="M150 ${y}H632" stroke="var(--ink-2)" stroke-width="1.5"/>` +
        ps.map(([k, x]) => `<rect x="${x - 7}" y="${y - H[k]}" width="14" height="${H[k]}" rx="3" fill="${COL[k]}"/><text x="${x}" y="${y - H[k] - 4}" text-anchor="middle" font-size="9" fill="var(--ink-2)">${k === 'a' ? 'α' : k + '°'}</text>`).join('');
    }).join('');
  })();

  /* ---------- gauss lines ---------- */
  (() => {
    const L = { 50: [92, 62], 10: [140, 90], 5: [190, 116] };
    const T = {
      50: '<b>Oxygen tank: stay outside the 50 G line.</b> So do IV pumps, wheelchairs, carts and patient monitors. Inside it, a steel object can become a projectile.',
      10: '<b>Credit card: stay outside the 10 G line.</b> So do magnetic tapes and analog watches: the field can erase or damage them.',
      5: '<b>Pacemaker: stay outside the 5 G line</b>, the outermost one. It marks the Zone III exclusion boundary. Inside it the field can upset the pacemaker.'
    };
    function draw(g) {
      $('gaussArt').innerHTML = `<rect x="6" y="6" width="408" height="248" rx="18" fill="var(--paper)" stroke="var(--rule-2)"/>` +
        [5, 10, 50].map(k => { const [rx, ry] = L[k], on = +g === k;
          return `<ellipse cx="210" cy="130" rx="${rx}" ry="${ry}" fill="${on ? 'rgba(224,64,122,.12)' : 'none'}" stroke="${on ? 'var(--marker)' : 'var(--purple)'}" stroke-width="${on ? 3.5 : 1.5}" stroke-dasharray="${on ? '' : '6 5'}"/>
            <text x="210" y="${130 - ry + 14}" text-anchor="middle" font-size="11" font-weight="700" fill="${on ? 'var(--marker)' : 'var(--purple-ink)'}">${k} G</text>`; }).join('') +
        `<rect x="172" y="104" width="76" height="52" rx="16" fill="var(--lav)"/><circle cx="210" cy="130" r="16" fill="var(--sheet)"/><rect x="160" y="126" width="100" height="8" rx="4" fill="var(--orange)"/>
         <text x="210" y="178" text-anchor="middle" font-size="10" fill="var(--ink)">magnet</text>`;
      $('gaussSay').innerHTML = T[g];
    }
    U.seg('gaussSeg', 'g', draw); draw(50);
  })();

  /* ---------- artifact gallery ---------- */
  (() => {
    const ART = [
      { k: 'motion', name: 'Motion', grp: 'Patient', cause: 'Respiration, heart beat, blood flow, eye movement, swallowing, accidental patient movement. The most pronounced artifacts relate to motion during acquisition.', look: '<b>Ghosting</b> (phase mismapping): the thorax seen as double or multiple. <b>Smearing</b> from aperiodic movement, like the eyes moving.', fix: 'Move the ghosts to areas that don\'t affect reading · fat suppression · fast (breath-hold) imaging · respiratory compensation · have the patient fix the eyes on one point' },
      { k: 'shift', name: 'Chemical shift', grp: 'Patient', cause: 'Hydrogen in <b>fat and water resonates at different frequencies</b>, so their signals are placed in slightly different spots.', look: 'Signal displacement between fat and water: a <b>signal void</b> on one edge, a bright band on the other. Common in <b>kidneys</b> (water surrounded by perirenal fat), orbits and vertebral bodies.', fix: 'Scan at lower field strength · STIR or FLAIR · <b>broaden the receive bandwidth</b>' },
      { k: 'ink', name: 'Chemical misregistration', aka: 'Black or india ink, contour, out-of-phase artifact', grp: 'Patient', cause: 'The image is made while fat and water are <b>out of phase</b> (from chemical shift). At 1.5 T they go in and out of phase every <b>2.4 ms</b>: the periodicity.', look: 'A <b>black contour</b> along borders of tissue containing both fat and water. In phase, their signals add; opposed phase, they cancel.', fix: '<b>Dixon technique</b> (TE = ½ periodicity) to reduce fat signal · a TE where fat and water are in phase (TE = periodicity) · <b>SE or TSE</b> with RF rephasing, not gradient rephasing' },
      { k: 'sus', name: 'Magnetic susceptibility', grp: 'Patient', cause: 'Tissues magnetize to different degrees, so local field inhomogeneity dephases the spins. Worse with <b>ferromagnetic material</b>, <b>gradient echo</b> (can\'t compensate), <b>EPI</b> and low bandwidth.', look: '<b>Signal void with high-signal rim</b> and distortion, at tissue–bone and tissue–air interfaces: PNS, orbits, lungs, heart, stomach, bowel loops.', fix: '<b>SE and TSE</b> (180° rephasing pulse) · remove all metal · high bandwidth · short TE · smaller voxels' },
      { k: 'dist', name: 'Distortion', grp: 'System', cause: 'Gradient linearity drops at the edge of a large FOV because the gradient coil has limited length: about <b>5% (1 cm) deviation</b> at the edge.', look: 'Anatomy distorted at the <b>edge of the FOV</b>.', fix: 'Large-FOV filter in reconstruction · measure two smaller FOVs · put the region of interest at the <b>magnetic isocenter</b>' },
      { k: 'zip', name: 'Zipper', aka: 'RF interference', grp: 'System', cause: '<b>External RF</b>: cellphones, electronic controls, electric motors.', look: 'A <b>line across the image</b>, and a noisy image.', fix: 'An RF-sealed room: the <b>Faraday cage</b>' },
      { k: 'magic', name: 'Magic angle', grp: 'System', cause: 'Structures at <b>54.7° (≈55°) to B0</b> lose their normally rapid T2 decay (22 ms). Common in tendons, articular cartilage, menisci and peripheral nerves.', look: '<b>Hyperintensity</b> on short-TE sequences (T1WI, PDWI, GRE). <b>Mistaken for tendinopathy.</b>', fix: '<b>Longer TE</b> · flip angle below 55°' },
      { k: 'trunc', name: 'Truncation', aka: 'Ringing artifact', grp: 'User', cause: '<b>Undersampling</b>, a reduced phase matrix, not enough data in K-space.', look: '<b>Periodic stripes or rings</b>: banding and edge oscillation.', fix: 'Weak raw-data filter (<b>Hamming</b>) · <b>bigger measurement matrix</b>' },
      { k: 'wrap', name: 'Wrap-around', aka: 'Aliasing, overfolding', grp: 'User', cause: 'Signal from tissue <b>outside the FOV</b> but still inside the coil\'s sensitive volume. Small DFOV, undersampling.', look: 'Anatomy from outside the FOV <b>overlaps the image on the opposite side</b>.', fix: '<b>Increase FOV</b> · more phase-encoding steps (<b>oversampling</b>) · presaturation' },
      { k: 'cross', name: 'Cross-talk', aka: 'Slice-overlap artifact', grp: 'User', cause: '<b>Overlapping slices</b> in a multi-angle, multislice acquisition: repeated RF saturates the protons there.', look: '<b>Dark bands</b>: signal dropout where the slices overlap.', fix: 'Don\'t overlap slices in one acquisition · put the overlap posterior to the spinal canal · <b>larger slice gap</b>' }
    ];
    const cv = $('artCv'), c = prep(cv), T1 = { fat: .95, bone: .03, csf: .15, gm: .45, wm: .62 };
    const off = document.createElement('canvas'), o = prep(off);
    const base = () => { brain(o, T1, .02); return off; };
    function abdomen(shift, ink) {
      c.fillStyle = '#000'; c.fillRect(0, 0, 320, 320);
      c.fillStyle = '#E8E8E8'; c.beginPath(); c.ellipse(160, 160, 150, 112, 0, 0, TAU); c.fill();
      c.fillStyle = '#6A6A6A'; c.beginPath(); c.ellipse(160, 160, 136, 98, 0, 0, TAU); c.fill();
      c.fillStyle = '#E8E8E8'; [[96, 168], [224, 168]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 40, 50, 0, 0, TAU); c.fill(); });
      c.fillStyle = '#4A4A4A'; c.beginPath(); c.arc(160, 196, 22, 0, TAU); c.fill();
      const kid = (x, y, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(x, y, 22, 34, 0, 0, TAU); c.fill(); };
      if (shift) {
        [[96, 168], [224, 168]].forEach(([x, y]) => kid(x, y, '#000'));
        c.globalCompositeOperation = 'lighter'; [[96, 168], [224, 168]].forEach(([x, y]) => kid(x + shift, y, '#5A5A5A')); c.globalCompositeOperation = 'source-over';
      } else [[96, 168], [224, 168]].forEach(([x, y]) => kid(x, y, '#8A8A8A'));
      if (ink) { c.strokeStyle = '#000'; c.lineWidth = 3.5; [[96, 168], [224, 168]].forEach(([x, y]) => { c.beginPath(); c.ellipse(x, y, 22, 34, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(x, y, 40, 50, 0, 0, TAU); c.stroke(); });
        c.beginPath(); c.ellipse(160, 160, 136, 98, 0, 0, TAU); c.stroke(); }
    }
    const R = {
      motion() { c.drawImage(base(), 0, 0); c.globalAlpha = .3; c.drawImage(off, 0, 44); c.drawImage(off, 0, -44); c.globalAlpha = .15; c.drawImage(off, 0, 88); c.drawImage(off, 0, -88); c.globalAlpha = 1; },
      shift() { abdomen(8); },
      ink() { abdomen(0, true); },
      sus() {
        c.drawImage(base(), 0, 0);
        const g = c.createRadialGradient(110, 262, 4, 110, 262, 48);
        g.addColorStop(0, '#000'); g.addColorStop(.62, '#000'); g.addColorStop(.72, '#fff'); g.addColorStop(.82, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; c.beginPath(); c.ellipse(110, 262, 60, 44, -.3, 0, TAU); c.fill();
      },
      dist() {
        brain(o, T1, .02);
        o.strokeStyle = 'rgba(255,255,255,.25)'; o.lineWidth = 1; for (let i = 0; i <= 320; i += 32) { o.beginPath(); o.moveTo(i, 0); o.lineTo(i, 320); o.moveTo(0, i); o.lineTo(320, i); o.stroke(); }
        const src = o.getImageData(0, 0, 320, 320).data, im = c.createImageData(320, 320), d = im.data;
        for (let y = 0; y < 320; y++) for (let x = 0; x < 320; x++) {
          const dx = (x - 160) / 160, dy = (y - 160) / 160, r2 = dx * dx + dy * dy, f = 1 + .14 * r2;
          const sx = Math.round(160 + dx * f * 160), sy = Math.round(160 + dy * f * 160), i = (y * 320 + x) * 4;
          if (sx >= 0 && sx < 320 && sy >= 0 && sy < 320) { const j = (sy * 320 + sx) * 4; d[i] = src[j]; d[i + 1] = src[j + 1]; d[i + 2] = src[j + 2]; }
          d[i + 3] = 255;
        }
        c.putImageData(im, 0, 0);
      },
      zip() {
        c.drawImage(base(), 0, 0); const r = U.rng(11);
        for (let y = 0; y < 320; y += 2) { const v = Math.round(r() * 255); c.fillStyle = `rgb(${v},${v},${v})`; c.fillRect(204, y, 4, 2); }
      },
      magic() {
        c.fillStyle = '#000'; c.fillRect(0, 0, 320, 320);
        c.fillStyle = '#5E5E5E'; c.beginPath(); c.ellipse(160, 160, 130, 150, 0, 0, TAU); c.fill();
        const pts = Array.from({ length: 61 }, (_, i) => { const a = Math.PI * (.95 - .9 * i / 60); return [60 + 180 * (Math.cos(a) + 1) / 2, 50 + 198 * Math.sin(a)]; });
        for (let i = 0; i < 60; i++) {
          const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], ang = Math.abs(Math.atan2(x1 - x0, y1 - y0) * 180 / Math.PI) % 180, toB0 = Math.min(ang, 180 - ang);
          const v = Math.abs(toB0 - 55) < 9 ? 210 : 18; c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = 16; c.lineCap = 'round';
          c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        }
        arrow(c, 296, 290, 296, 200, '#FFB257', 3, 10); c.fillStyle = '#FFB257'; c.font = '600 12px JetBrains Mono, monospace'; c.fillText('B0', 270, 196);
      },
      trunc() {
        c.drawImage(base(), 0, 0);
        for (let i = 1; i <= 5; i++) { c.strokeStyle = i % 2 ? `rgba(255,255,255,${.3 / i})` : `rgba(0,0,0,${.5 / i})`; c.lineWidth = 3; c.beginPath(); c.ellipse(160, 162, 108 - i * 5, 126 - i * 5, 0, 0, TAU); c.stroke(); }
      },
      wrap() { brain(o, T1, .02); c.fillStyle = '#000'; c.fillRect(0, 0, 320, 320); c.drawImage(off, 0, 70); c.globalCompositeOperation = 'lighter'; c.drawImage(off, 0, 70 - 320); c.globalCompositeOperation = 'source-over'; },
      cross() { c.drawImage(base(), 0, 0); c.save(); c.translate(160, 160); c.rotate(-.5); c.fillStyle = 'rgba(0,0,0,.62)'; c.fillRect(-240, -18, 480, 36); c.restore(); }
    };
    $('artChips').innerHTML = ART.map((a, i) => `<button data-i="${i}" aria-pressed="${!i}" class="${i ? '' : 'sel'}">${a.name}</button>`).join('');
    function show(i) {
      const a = ART[i];
      document.querySelectorAll('#artChips button').forEach(b => { const on = +b.dataset.i === i; b.classList.toggle('sel', on); b.setAttribute('aria-pressed', on); });
      R[a.k](); $('artCap').textContent = `Simulated: ${a.name.toLowerCase()} artifact`;
      $('artInfo').innerHTML = `<div class="card"><div class="h"><h4>${a.name}</h4><span class="hint">${a.grp}-related</span></div>${a.aka ? `<p class="hint">a.k.a. ${a.aka}</p>` : ''}
        <p><b>Cause.</b> ${a.cause}</p><p><b>Appearance.</b> ${a.look}</p><p><b>Remedy.</b> ${a.fix}</p></div>`;
    }
    document.querySelectorAll('#artChips button').forEach(b => b.addEventListener('click', () => show(+b.dataset.i)));
    show(0);
  })();
})();
