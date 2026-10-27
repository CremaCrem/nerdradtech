/* Chapter II: miscentering, partial volume, matrix × FOV, DFOV vs SFOV, attenuation, HU ruler, rays and translation */
(() => {
  const { $ } = U;
  const fmt = n => (n < 0 ? '−' : n > 0 ? '+' : '') + Math.abs(Math.round(n));
  const gray = h => { const g = Math.round(Math.max(0, Math.min(1, (h + 350) / 1000)) * 255); return `rgb(${g},${g},${g})`; };

  /* ---------- miscentering ---------- */
  function drawMisc() {
    const mx = +$('mx').value, my = +$('my').value, k = 4, cx = 160 + mx * k, cy = 150 - my * k;
    $('mxOut').textContent = mx === 0 ? 'centered' : `${Math.abs(mx)} cm to the ${mx > 0 ? 'right' : 'left'}`;
    $('myOut').textContent = my === 0 ? 'centered' : `${Math.abs(my)} cm too ${my > 0 ? 'high' : 'low'}`;
    $('misc').innerHTML = `
      <circle cx="160" cy="150" r="138" fill="none" stroke="var(--lav)" stroke-width="18"/>
      <circle cx="160" cy="150" r="100" fill="none" stroke="var(--ink-2)" stroke-dasharray="4 5"/>
      <text x="160" y="40" text-anchor="middle" font-size="10" fill="var(--ink-2)">scan FOV</text>
      <rect x="${cx - 78}" y="${cy + 50}" width="156" height="10" rx="5" fill="var(--orange)"/>
      <ellipse cx="${cx}" cy="${cy}" rx="70" ry="48" fill="var(--pink)" opacity=".85"/>
      <ellipse cx="${cx}" cy="${cy + 26}" rx="11" ry="9" fill="#fff" opacity=".85"/>
      <path d="M160 6V294M16 150H304" stroke="#ff2a2a" stroke-width="1.6"/>
      <circle cx="160" cy="150" r="6" fill="none" stroke="#ff2a2a" stroke-width="2"/>
      <circle cx="${cx}" cy="${cy}" r="5" fill="var(--purple)"/>
      ${(mx || my) ? `<path d="M${cx} ${cy}L160 150" stroke="var(--purple)" stroke-width="2" stroke-dasharray="3 3"/>` : ''}
      <text x="296" y="144" text-anchor="end" font-size="10" fill="#ff2a2a">laser</text>`;
    const parts = [];
    if (mx) parts.push(`<b>X-direction miscentering</b>: the patient lies ${Math.abs(mx)} cm toward one side of the table.`);
    if (my) parts.push(`<b>Y-direction miscentering</b>: the table is set ${Math.abs(my)} cm too ${my > 0 ? 'high' : 'low'} in the gantry.`);
    $('miscText').innerHTML = parts.length ? parts.join(' ') : '<b>Centered.</b> The patient\'s center (purple dot) sits on the isocenter where the lasers cross.';
    $('miscText').className = 'say ' + (parts.length ? '' : 'ok');
  }
  ['mx', 'my'].forEach(id => $(id).addEventListener('input', drawMisc)); drawMisc();

  /* ---------- partial volume ---------- */
  const PV = [500, -200, 60, 40];
  function drawPV(m) {
    const cell = (v, big) => `<div style="background:${gray(v)};color:${v > 150 ? '#231F2B' : '#fff'};display:grid;place-items:center;border-radius:${big ? 22 : 12}px;font:700 ${big ? '2.4rem' : '1.3rem'} var(--mono)">${fmt(v)}</div>`;
    $('pvGrid').innerHTML = m === 'large'
      ? `<div style="display:grid;width:min(100%,260px);aspect-ratio:1;padding:6px;border-radius:26px;background:var(--purple)">${cell(100, true)}</div>`
      : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:min(100%,260px);aspect-ratio:1;padding:6px;border-radius:26px;background:var(--purple)">${PV.map(v => cell(v)).join('')}</div>`;
    $('pvText').innerHTML = m === 'large'
      ? '(+500) + (−200) + (+60) + (+40) = +400, and +400 ÷ 4 = <b>+100</b>. The +500 (a calcification, say) has vanished into an average that matches none of the four tissues. <b>High partial volume averaging.</b>'
      : 'Four small pixels keep four values. The +500 is still <b>+500</b>. <b>Low partial volume averaging</b>, which is why small pixels (and small voxels) give better spatial resolution.';
  }
  U.seg('pvSeg', 'p', drawPV); drawPV('large');

  /* ---------- matrix × FOV ---------- */
  let mxM = 512; const mxCache = {};
  function drawMx() {
    const fov = +$('fovR').value, thk = +$('thk').value, key = mxM + '|' + fov;
    const a = mxCache[key] || (mxCache[key] = Phantom.slice(0.4, mxM, fov));
    Phantom.draw($('mxCv'), a, mxM, 1400, -250, { smooth: false });
    const px = fov * 10 / mxM, vx = px * px * thk;
    $('fovOut').textContent = fov + ' cm'; $('thkOut').textContent = thk + ' mm';
    $('pxOut').textContent = px.toFixed(2) + ' mm'; $('vxOut').textContent = vx.toFixed(vx < 10 ? 2 : 1) + ' mm³';
    $('mxCap').textContent = `${mxM} × ${mxM} matrix · ${fov} cm FOV`;
    $('mxText').innerHTML = `${fov} cm = ${fov * 10} mm, spread over ${mxM} pixels: each pixel is <b>${px.toFixed(2)} mm</b> wide. ` +
      (px > 2 ? 'That is big, so small structures blur into their neighbours (partial volume): <b>poor spatial resolution</b>.' : px > 0.9 ? 'Detail is fair.' : 'Pixels this small show fine detail: <b>good spatial resolution</b>.');
  }
  U.seg('mxSeg', 'm', v => { mxM = +v; drawMx(); });
  ['fovR', 'thk'].forEach(id => $(id).addEventListener('input', drawMx));
  U.visible($('mxCv'), v => v && drawMx()); U.onRedraw(drawMx);

  /* ---------- DFOV vs SFOV ---------- */
  function drawFov() {
    const d = +$('dfov').value, k = 130 / 35, over = d > 50, dr = Math.min(d, 50) / 2 * k;
    $('dfovOut').textContent = d + ' cm';
    $('fovArt').innerHTML = `
      <circle cx="180" cy="150" r="130" fill="var(--lav-soft)" stroke="var(--lav)" stroke-width="10"/>
      <circle cx="180" cy="150" r="${25 * k}" fill="none" stroke="var(--purple)" stroke-width="2.5"/>
      <ellipse cx="180" cy="160" rx="${18 * k}" ry="${12 * k}" fill="var(--pink)" opacity=".8"/>
      <circle cx="180" cy="150" r="${dr}" fill="${over ? 'rgba(224,64,122,.15)' : 'rgba(255,178,87,.22)'}" stroke="${over ? 'var(--marker)' : 'var(--beam)'}" stroke-width="3" stroke-dasharray="7 5"/>
      <g font-size="11" font-weight="700"><text x="180" y="12" text-anchor="middle" fill="var(--ink-2)">gantry aperture 70 cm</text>
      <text x="180" y="${150 - 25 * k + 16}" text-anchor="middle" fill="var(--purple-ink)">SFOV 50 cm</text>
      <text x="180" y="${150 + dr - 8}" text-anchor="middle" fill="${over ? 'var(--marker)' : 'var(--beam-ink)'}">DFOV ${Math.min(d, 50)} cm</text></g>`;
    const s = $('fovText');
    s.className = 'say ' + (over ? 'bad' : '');
    s.innerHTML = over ? `You asked for ${d} cm, but <b>the DFOV cannot be larger than the SFOV</b> (50 cm here). Nothing outside the SFOV was imaged, so there is no data to show.`
      : d < 20 ? `DFOV ${d} cm: a <b>target (zoom)</b> view. The same pixels now cover a smaller area, so each pixel is smaller.` : `DFOV ${d} cm: the part of the scanned data shown on the image. The SFOV stays 50 cm whatever you pick here.`;
  }
  $('dfov').addEventListener('input', drawFov); drawFov();

  /* ---------- attenuation ---------- */
  const MU = { fat: 0.165, water: 0.18, muscle: 0.19, bone: 0.38 }, KV = { 80: 1.18, 120: 1, 140: 0.94 };
  const TC = { fat: '#FFE3A3', water: '#A9E6F5', muscle: '#FF9FB0', bone: '#F3EFE6' };
  let atT = 'water', atK = 120;
  function drawAt() {
    const x = +$('atThk').value, mu = MU[atT] * KV[atK], f = Math.exp(-mu * x), n = 12, out = Math.round(n * f);
    $('atThkOut').textContent = x + ' cm'; $('atMu').textContent = mu.toFixed(3); $('atTr').textContent = (f * 100).toFixed(f < 0.01 ? 2 : 1) + '%';
    const bx = 130, bw = x * 9; let o = `<rect x="${bx}" y="20" width="${bw}" height="180" rx="10" fill="${TC[atT]}" stroke="var(--rule-2)"/>`;
    const keep = new Set(Array.from({ length: out }, (_, i) => Math.round((i + 0.5) * n / Math.max(out, 1) - 0.5)));
    for (let i = 0; i < n; i++) {
      const y = 30 + i * 14.5;
      o += `<path d="M14 ${y}H${bx - 6}" stroke="var(--beam)" stroke-width="2.5" marker-end="url(#atA)"/>`;
      if (keep.has(i)) o += `<path d="M${bx + bw + 8} ${y}H408" stroke="var(--beam)" stroke-width="2.5" marker-end="url(#atA)"/>`;
      else { const px = bx + 6 + ((i * 37) % Math.max(8, bw - 12)); o += `<circle cx="${px}" cy="${y}" r="3.5" fill="var(--marker)"/>`; }
    }
    o = `<defs><marker id="atA" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0 10 5 0 10z" fill="var(--beam)"/></marker></defs>` + o +
      `<text x="14" y="214" font-size="11" fill="var(--ink-2)">in: ${n} photons</text><text x="408" y="214" text-anchor="end" font-size="11" fill="var(--ink-2)">out: ${out} · red = absorbed or scattered</text>`;
    $('atArt').innerHTML = o;
  }
  U.seg('atTissue', 't', v => { atT = v; drawAt(); });
  U.seg('atKv', 'k', v => { atK = +v; drawAt(); });
  $('atThk').addEventListener('input', drawAt); drawAt();

  /* ---------- HU ruler ---------- */
  const BK = [[-1000, 0], [-200, 18], [0, 35], [100, 50], [400, 65], [1000, 80], [3000, 100]];
  const pos = h => { for (let i = 1; i < BK.length; i++) if (h <= BK[i][0]) { const [a, p] = BK[i - 1], [b, q] = BK[i]; return p + (q - p) * (h - a) / (b - a); } return 100; };
  const huAt = p => { for (let i = 1; i < BK.length; i++) if (p <= BK[i][1]) { const [a, pa] = BK[i - 1], [b, pb] = BK[i]; return a + (b - a) * (p - pa) / (pb - pa); } return 3000; };
  const TICKS = [[-1000, 'Air', 1], [-700, 'Lung', 0], [-100, 'Fat', 1], [0, 'Water', 0], [40, 'Blood', 1], [60, 'Liver', 0], [300, 'Contrast', 1], [1000, 'Bone', 0], [3000, 'Dense bone', 1]];
  const KIND = [[-900, 'air'], [-450, 'lung (air with a little tissue)'], [-150, 'a lung or fat border'], [-30, 'fat'], [10, 'water'], [30, 'fluid such as CSF or bile'], [80, 'soft tissue: blood, muscle, organs'], [150, 'an enhancing organ'], [400, 'a contrast-filled vessel'], [1000, 'bone'], [3001, 'dense cortical bone (metal goes past the scale)']];
  const ruler = $('huRuler');
  ruler.style.background = 'linear-gradient(90deg,#000 0%,#1a1a1a 18%,#5c5c5c 35%,#8a8a8a 50%,#b8b8b8 65%,#e8e8e8 80%,#fff 100%)';
  ruler.innerHTML = TICKS.map(([h, n, up], i) => `<span class="tick${up ? ' up' : ''}${i === 0 ? ' first' : i === TICKS.length - 1 ? ' last' : ''}" style="left:${pos(h)}%">${n}<span>${fmt(h)}</span></span>`).join('') + '<i class="cursor" style="left:35%"></i>';
  const cur = ruler.querySelector('.cursor');
  ruler.addEventListener('pointermove', e => {
    const r = ruler.getBoundingClientRect(), p = Math.max(0, Math.min(100, (e.clientX - r.left) / r.width * 100)), h = Math.round(huAt(p) / 10) * 10;
    cur.style.left = p + '%';
    const k = KIND.find(([lim]) => h < lim)[1];
    $('huSay').innerHTML = `<b>${fmt(h)} HU</b>: typical of ${k}. ${h < 0 ? 'Attenuates <b>less than water</b>.' : h > 0 ? 'Attenuates <b>more than water</b>.' : 'Exactly water.'}`;
  });
  function drawMu() {
    const mu = +$('muT').value / 100, h = 1000 * (mu - 0.18) / 0.18;
    $('muTOut').textContent = mu.toFixed(2) + ' cm⁻¹';
    $('muSay').innerHTML = `1000 × (${mu.toFixed(2)} − 0.18) ÷ 0.18 = <b>${fmt(h)} HU</b>${mu === 0 ? ' (air: nothing attenuates)' : Math.abs(h) < 20 ? ' (water)' : ''}`;
  }
  $('muT').addEventListener('input', drawMu); drawMu();

  /* ---------- rays, projection, translation ---------- */
  const GR = [[2, 0, 1], [1, 4, 1], [0, 1, 3]];
  let dir = 'h', shown = Infinity, timer = 0;
  const RAYS = {
    h: [0, 1, 2].map(r => ({ cells: [[r, 0], [r, 1], [r, 2]], a: [30, 90 + r * 60], b: [270, 90 + r * 60] })),
    v: [0, 1, 2].map(c => ({ cells: [[0, c], [1, c], [2, c]], a: [90 + c * 60, 30], b: [90 + c * 60, 270] })),
    // diagonal k runs through the cells where column − row = k
    d: [-2, -1, 0, 1, 2].map(k => ({ cells: [0, 1, 2].map(r => [r, r + k]).filter(([, c]) => c >= 0 && c <= 2), a: [30 + 60 * k, 30], b: [270 + 60 * k, 270] }))
  };
  function drawRays() {
    const rays = RAYS[dir]; let o = '';
    GR.forEach((row, r) => row.forEach((v, c) => {
      o += `<rect x="${60 + c * 60}" y="${60 + r * 60}" width="60" height="60" fill="${gray(v * 160 - 300)}" stroke="var(--purple)" stroke-width="2"/>`;
      o += `<text x="${90 + c * 60}" y="${97 + r * 60}" text-anchor="middle" font-size="20" font-weight="700" fill="${v > 2 ? '#231F2B' : '#fff'}">${v}</text>`;
    }));
    rays.forEach((ray, i) => {
      if (i >= shown) return;
      const s = ray.cells.reduce((t, [r, c]) => t + GR[r][c], 0);
      o += `<line x1="${ray.a[0]}" y1="${ray.a[1]}" x2="${ray.b[0]}" y2="${ray.b[1]}" stroke="var(--beam)" stroke-width="4" opacity=".75" stroke-linecap="round"/>`;
      const [ex, ey] = ray.b, L = s * 9;
      if (dir === 'h') o += `<rect x="290" y="${ey - 11}" width="${L}" height="22" rx="8" fill="var(--purple)"/><text x="${296 + L}" y="${ey + 5}" font-size="14" font-weight="700" fill="var(--ink)">${s}</text>`;
      else if (dir === 'v') o += `<rect x="${ex - 11}" y="282" width="22" height="${L / 2 + 4}" rx="8" fill="var(--purple)"/><text x="${ex}" y="${296 + L / 2 + 8}" text-anchor="middle" font-size="14" font-weight="700" fill="var(--ink)">${s}</text>`;
      else o += `<circle cx="${Math.min(ex, 380)}" cy="${Math.min(ey, 285)}" r="13" fill="var(--purple)"/><text x="${Math.min(ex, 380)}" y="${Math.min(ey, 285) + 5}" text-anchor="middle" font-size="13" font-weight="700" fill="#fff">${s}</text>`;
    });
    const n = rays.length;
    if (dir === 'h') o += `<rect x="14" y="62" width="12" height="176" rx="6" fill="var(--cyan)"/><text x="20" y="54" text-anchor="middle" font-size="10" fill="var(--ink-2)">tube</text><text x="330" y="54" text-anchor="middle" font-size="10" fill="var(--ink-2)">ray sums</text>`;
    $('rayArt').innerHTML = o;
    $('rayText').innerHTML = shown < n
      ? `Ray ${Math.min(shown, n)} of ${n}: the beam passes one line of the patient. The detector only learns the <b>ray sum</b>, the total, never the separate values.`
      : `${n} rays, ${n} ray sums. Side by side they form one <b>projection</b> (view): the attenuation profile from this direction. Notice it never tells you which box holds the 4.`;
  }
  U.seg('raySeg', 'd', v => { dir = v; clearInterval(timer); shown = Infinity; $('transOut').textContent = ''; drawRays(); });
  $('transBtn').addEventListener('click', () => {
    clearInterval(timer); shown = 0; drawRays();
    const n = RAYS[dir].length;
    timer = setInterval(() => {
      shown++; $('transOut').textContent = `ray ${Math.min(shown, n)} of ${n}`; drawRays();
      if (shown >= n) { clearInterval(timer); $('transOut').textContent = 'one translation = one projection'; }
    }, U.reduced() ? 10 : 650);
  });
  drawRays();
})();
