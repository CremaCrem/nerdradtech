/* A clay-style 3D CT gantry (three.js r128). Used by the hero (auto-play) and the Chapter III explorer.
   Gantry group tilts; rotor group spins inside it; table group slides through the aperture and carries the helix. */
window.Gantry3D = function (canvas, opts = {}) {
  const T = window.THREE;
  const st = Object.assign({ scanning: true, cover: 1, pitch: 1, tilt: 0, height: 0, mode: 'single', auto: false, selected: null }, opts);
  let renderer;
  try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) {
    const p = document.createElement('p'); p.className = 'cap'; p.textContent = 'The 3D view needs WebGL, which this browser has turned off.';
    canvas.replaceWith(p); return { set() {}, select() {}, onPick() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = T.sRGBEncoding;
  const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.1, 100);
  scene.add(new T.HemisphereLight(0xffffff, 0xb9a6e0, 0.95));
  const sun = new T.DirectionalLight(0xffffff, 0.8); sun.position.set(4, 6, 6); scene.add(sun);
  const rim = new T.DirectionalLight(0xffd9a0, 0.4); rim.position.set(-6, 2, -4); scene.add(rim);

  const mats = {}, pick = [];
  const M = (part, color, x = {}) => {
    if (mats[part]) return mats[part];
    const lin = h => new T.Color(h).convertSRGBToLinear();   // hex colours are sRGB; the renderer works in linear
    const m = mats[part] = new T.MeshStandardMaterial(Object.assign({ roughness: 0.5, metalness: 0.04 }, x, { color: lin(x.color ?? color) }));
    if (x.emissive) m.emissive = lin(x.emissive);
    m.userData.e0 = m.emissive.getHex(); m.userData.i0 = m.emissiveIntensity; return m;
  };
  const add = (parent, geo, part, color, pos = [0, 0, 0], rot = [0, 0, 0], x) => {
    const m = new T.Mesh(geo, M(part, color, x)); m.position.set(...pos); m.rotation.set(...rot); m.userData.part = part;
    parent.add(m); pick.push(m); return m;
  };
  const box = (w, h, d) => new T.BoxGeometry(w, h, d);

  /* ---------- gantry (tilts) ---------- */
  const G = new T.Group(); scene.add(G);
  const sh = new T.Shape(), W = 1.75, B = -2.0, Hh = 1.75, r = 0.6;
  sh.moveTo(-W + r, B); sh.lineTo(W - r, B); sh.quadraticCurveTo(W, B, W, B + r); sh.lineTo(W, Hh - r); sh.quadraticCurveTo(W, Hh, W - r, Hh);
  sh.lineTo(-W + r, Hh); sh.quadraticCurveTo(-W, Hh, -W, Hh - r); sh.lineTo(-W, B + r); sh.quadraticCurveTo(-W, B, -W + r, B);
  const hole = new T.Path(); hole.absarc(0, 0, 0.74, 0, Math.PI * 2, true); sh.holes.push(hole);
  const hg = new T.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: true, bevelSize: 0.09, bevelThickness: 0.09, bevelSegments: 5, curveSegments: 64 }); hg.translate(0, 0, -0.5);
  const housing = add(G, hg, 'gantry', 0xf5f1fb, [0, 0, 0], [0, 0, 0], { side: T.DoubleSide });
  add(G, new T.TorusGeometry(0.78, 0.05, 16, 80), 'gantry', 0xf5f1fb, [0, 0, 0.6]);
  add(G, new T.TorusGeometry(0.86, 0.035, 12, 80), 'aperture', 0xffb257, [0, 0, 0.62]);
  const panel = add(G, box(0.42, 0.26, 0.06), 'panel', 0x7d65ae, [1.15, -1.45, 0.62]);
  [-0.12, 0, 0.12].forEach((x, i) => add(G, new T.CylinderGeometry(0.035, 0.035, 0.04, 16), 'panel', 0xffb257, [1.15 + x, -1.45, 0.66], [Math.PI / 2, 0, 0]));
  add(G, new T.SphereGeometry(0.05, 16, 12), 'panel', 0x7d65ae, [-1.2, -1.45, 0.62]);              // microphone
  const red = { emissive: 0xff2a2a, emissiveIntensity: 0.9, color: 0xff4d4d };
  add(G, box(0.012, 1.46, 0.012), 'lasers', 0xff4d4d, [0, 0, 0.66], [0, 0, 0], red);
  add(G, box(1.46, 0.012, 0.012), 'lasers', 0xff4d4d, [0, 0, 0.66]);
  add(G, new T.SphereGeometry(0.04, 12, 8), 'lasers', 0xff4d4d, [0, 0.76, 0.62]);
  [0, 0.08, -0.08].forEach(dz => add(G, box(0.08, 0.06, 0.05), 'sliprings', 0xe0a96a, [0, 1.03 + dz * 0.0, -0.7 + dz], [0, 0, 0], { metalness: 0.5, roughness: 0.35 }));

  /* ---------- rotor (spins) ---------- */
  const R = new T.Group(); G.add(R);
  add(R, new T.TorusGeometry(1.26, 0.05, 12, 96), 'rotor', 0xb7aacb, [0, 0, 0], [0, 0, 0], { metalness: 0.3 });
  [0.95, 1.03, 1.11].forEach(rr => add(R, new T.TorusGeometry(rr, 0.022, 10, 96), 'sliprings', 0xd08a4a, [0, 0, -0.66], [0, 0, 0], { metalness: 0.6, roughness: 0.3 }));
  function tube(parent, ang) {
    const g = new T.Group(); g.rotation.z = ang - Math.PI / 2; parent.add(g);
    add(g, new T.CylinderGeometry(0.19, 0.19, 0.78, 32), 'tube', 0x7adcf3, [0, 1.32, 0], [Math.PI / 2, 0, 0]);
    add(g, new T.SphereGeometry(0.19, 24, 16), 'tube', 0x7adcf3, [0, 1.32, 0.39]);
    add(g, new T.SphereGeometry(0.19, 24, 16), 'tube', 0x7adcf3, [0, 1.32, -0.39]);
    add(g, box(0.14, 0.06, 0.14), 'tube', 0xffb257, [0, 1.12, 0]);
    add(g, box(0.34, 0.06, 0.32), 'collimator', 0x3b3542, [0, 1.04, 0]);
    add(g, box(0.24, 0.05, 0.24), 'filter', 0xc9b8ea, [0, 0.97, 0]);
    return g;
  }
  function detector(parent, ang, span, n) {
    const g = new T.Group(); parent.add(g); const dets = [];
    for (let k = 0; k < n; k++) {
      const a = ang - span + 2 * span * k / (n - 1);
      dets.push(add(g, box(0.09, 0.15, 1), 'detectors', 0x7d65ae, [1.22 * Math.cos(a), 1.22 * Math.sin(a), 0], [0, 0, a + Math.PI / 2]));
      if (k < n - 1) { const b = a + span / (n - 1); add(g, box(0.012, 0.12, 1), 'postcoll', 0x5c5566, [1.12 * Math.cos(b), 1.12 * Math.sin(b), 0], [0, 0, b + Math.PI / 2]); }
    }
    add(g, box(0.95, 0.16, 0.45), 'das', 0x4e3a82, [1.46 * Math.cos(ang), 1.46 * Math.sin(ang), 0], [0, 0, ang + Math.PI / 2]);
    return g;
  }
  function beam(ang, span, h) {
    const a = new T.Vector3(Math.cos(ang + Math.PI) * 0.96, Math.sin(ang + Math.PI) * 0.96, 0), pts = [], idx = [], n = 24;
    pts.push(a.x, a.y, 0);
    for (let k = 0; k <= n; k++) { const t = ang - span + 2 * span * k / n; pts.push(1.16 * Math.cos(t), 1.16 * Math.sin(t), -h, 1.16 * Math.cos(t), 1.16 * Math.sin(t), h); }
    for (let k = 0; k < n; k++) { const p = 1 + 2 * k; idx.push(0, p, p + 2, 0, p + 3, p + 1, p, p + 1, p + 3, p, p + 3, p + 2); }
    idx.push(0, 1, 2, 0, 2 * n + 2, 2 * n + 1);
    const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pts, 3)); g.setIndex(idx); g.computeVertexNormals();
    const m = new T.Mesh(g, new T.MeshBasicMaterial({ color: new T.Color(0xffb257).convertSRGBToLinear(), transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false }));
    R.add(m); return m;
  }
  const tubeA = tube(R, Math.PI / 2), detA = detector(R, -Math.PI / 2, 0.5, 23);
  const tubeB = tube(R, Math.PI), detB = detector(R, 0, 0.34, 15);
  add(R, box(0.42, 0.5, 0.6), 'generator', 0xffb257, [1.35 * Math.cos(3.93), 1.35 * Math.sin(3.93), 0], [0, 0, 3.93]);
  let beamA = null, beamB = null;

  /* ---------- couch (does not tilt) ---------- */
  add(scene, box(0.5, 1.85, 0.8), 'pedestal', 0xc9b8ea, [0, -1.5, 2.6]);
  add(scene, box(2.7, 0.3, 1.4), 'gantry', 0xe9e2f4, [0, -2.25, 0]);
  const TB = new T.Group(); scene.add(TB);
  add(TB, box(0.66, 0.07, 4.4), 'couch', 0xfaf7ff, [0, -0.47, 0]);
  add(TB, new T.CylinderGeometry(0.26, 0.26, 1.55, 32), 'patient', 0xff8dc1, [0, -0.16, 0.1], [Math.PI / 2, 0, 0]);
  add(TB, new T.SphereGeometry(0.26, 24, 16), 'patient', 0xff8dc1, [0, -0.16, 0.88]);
  add(TB, new T.SphereGeometry(0.26, 24, 16), 'patient', 0xff8dc1, [0, -0.16, -0.68]);
  add(TB, new T.SphereGeometry(0.19, 24, 16), 'patient', 0xff8dc1, [0, -0.13, -1.12]);
  const iso = new T.Mesh(new T.OctahedronGeometry(0.06), new T.MeshBasicMaterial({ color: 0xff2a2a })); G.add(iso);

  /* soft floor shadow */
  const sc = document.createElement('canvas'); sc.width = sc.height = 128;
  const sx = sc.getContext('2d'), grd = sx.createRadialGradient(64, 64, 4, 64, 64, 64);
  grd.addColorStop(0, 'rgba(60,30,110,.35)'); grd.addColorStop(1, 'rgba(60,30,110,0)'); sx.fillStyle = grd; sx.fillRect(0, 0, 128, 128);
  const floor = new T.Mesh(new T.PlaneGeometry(7, 7), new T.MeshBasicMaterial({ map: new T.CanvasTexture(sc), transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -2.42; floor.position.z = 0.8; scene.add(floor);

  /* ---------- helix traced on the patient ---------- */
  let helix = null, turnsMax = 1, theta = 0, hold = 0;
  const RH = 0.46, ZA = 1.3;
  const bw = () => st.mode === 'multi' ? 0.36 : 0.16;
  function buildHelix() {
    if (helix) { TB.remove(helix); helix.geometry.dispose(); }
    const lead = st.pitch * bw(), turns = (2 * ZA) / lead; turnsMax = turns;
    const pts = [], segs = Math.ceil(turns * 40);
    for (let k = 0; k <= segs; k++) {
      const th = turns * 2 * Math.PI * k / segs, a = Math.PI / 2 - th;
      pts.push(new T.Vector3(RH * Math.cos(a), RH * Math.sin(a) - st.height, -ZA + lead * th / (2 * Math.PI)));
    }
    const geo = new T.TubeGeometry(new T.CatmullRomCurve3(pts), segs, 0.014, 6, false);
    helix = new T.Mesh(geo, new T.MeshBasicMaterial({ color: new T.Color(0xf08f1c).convertSRGBToLinear() })); helix.userData.segs = segs; TB.add(helix);
  }

  function apply() {
    const op = st.cover;
    M('gantry').transparent = op < 1; M('gantry').opacity = op; M('gantry').depthWrite = op >= 1;
    G.rotation.x = st.tilt * Math.PI / 180;
    TB.position.y = st.height;
    const dual = st.mode === 'dual', h = st.mode === 'multi' ? 0.2 : 0.05;
    tubeB.visible = detB.visible = dual;
    [detA, detB].forEach(d => d.children.forEach(c => { if (c.userData.part !== 'das') c.scale.z = st.mode === 'multi' ? 0.5 : 0.16; }));
    if (beamA) R.remove(beamA); if (beamB) R.remove(beamB);
    beamA = beam(-Math.PI / 2, 0.5, h); beamB = beam(0, 0.34, h); beamB.visible = dual;
    buildHelix(); theta = Math.min(theta, turnsMax * 2 * Math.PI);
  }

  /* ---------- camera orbit ---------- */
  let yaw = opts.yaw ?? 0.75, elev = opts.elev ?? 0.32, drag = null;
  function place() {
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 400, asp = w / h;
    renderer.setSize(w, h, false); cam.aspect = asp;
    const d = (opts.dist || 10.5) / Math.min(1, asp * 0.95);
    cam.position.set(d * Math.cos(elev) * Math.sin(yaw), d * Math.sin(elev) - 0.1, d * Math.cos(elev) * Math.cos(yaw) + 0.6);
    cam.lookAt(0, -0.25, 0.6); cam.updateProjectionMatrix();
  }
  const ray = new T.Raycaster(), ndc = new T.Vector2();
  let pickFn = null;
  canvas.addEventListener('pointerdown', e => { drag = { x: e.clientX, y: e.clientY, yaw, elev, moved: false }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    if (!drag.moved) return;
    yaw = drag.yaw - dx * 0.008; elev = Math.max(-0.1, Math.min(1.2, drag.elev + dy * 0.006)); draw();
  });
  canvas.addEventListener('pointerup', e => {
    if (drag && !drag.moved && pickFn) {
      const b = canvas.getBoundingClientRect(); ndc.set((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1);
      ray.setFromCamera(ndc, cam);
      const hit = ray.intersectObjects(pick.filter(m => m.visible && m.parent.visible), false).find(h => !(h.object.userData.part === 'gantry' && st.cover < 1));
      if (hit) { select(hit.object.userData.part); pickFn(hit.object.userData.part); }
    }
    drag = null;
  });

  function select(part) {
    Object.values(mats).forEach(m => { m.emissive.setHex(m.userData.e0); m.emissiveIntensity = m.userData.i0; });
    st.selected = part;
  }

  /* ---------- animation ---------- */
  let lastT = 0;
  function frame(t, dt) {
    if (st.auto && !drag) yaw += dt * 0.12;
    if (st.scanning && dt) {
      if (hold > 0) { hold -= dt; if (hold <= 0) theta = 0; }
      else { theta += dt * 2 * Math.PI * 0.55; if (theta >= turnsMax * 2 * Math.PI) { theta = turnsMax * 2 * Math.PI; hold = 1.2; } }
    }
    const lead = st.pitch * bw();
    R.rotation.z = -theta;
    TB.position.z = ZA - lead * theta / (2 * Math.PI) + 0.1;
    beamA.visible = st.scanning; beamB.visible = st.scanning && st.mode === 'dual';
    if (helix) helix.geometry.setDrawRange(0, Math.floor(helix.userData.segs * theta / (turnsMax * 2 * Math.PI)) * 36);
    if (st.selected && mats[st.selected]) { const m = mats[st.selected]; m.emissive.setHex(0x8a4a00); m.emissiveIntensity = 0.35 + 0.25 * Math.sin(t / 220); }
    lastT = t; draw();
  }
  function draw() { place(); renderer.render(scene, cam); }

  apply();
  U.loop(canvas, frame);
  U.onRedraw(draw);
  return {
    set(o) { Object.assign(st, o); apply(); draw(); },
    select(p) { select(p); draw(); },
    onPick(fn) { pickFn = fn; },
    state: st
  };
};

/* Hero instance */
(() => {
  const c = document.getElementById('heroGantry');
  if (c && window.THREE) Gantry3D(c, { auto: true, cover: 0.5, yaw: 1.05, elev: 0.36, dist: 10.5 });
  else if (c) c.nextElementSibling.textContent = 'The 3D gantry needs an internet connection to load';
})();
