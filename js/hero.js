/* The three O's in the headline: a spinning gantry, a cine scroll through the slices, and a sinogram filling in */
(() => {
  const { $ } = U;
  const S = 160;
  const prep = id => { const c = $(id); c.width = c.height = S; return c.getContext('2d'); };
  const g1 = prep('o1'), g2 = prep('o2'), g3 = prep('o3');

  /* O #1: gantry seen end-on */
  function gantry(t) {
    const c = g1, a = t / 700;
    c.clearRect(0, 0, S, S);
    c.lineWidth = 16; c.strokeStyle = '#231F2B'; c.beginPath(); c.arc(80, 80, 62, 0, 7); c.stroke();
    c.fillStyle = '#FF8DC1'; c.beginPath(); c.ellipse(80, 82, 30, 22, 0, 0, 7); c.fill();
    const tx = 80 + 62 * Math.cos(a), ty = 80 + 62 * Math.sin(a);
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(tx, ty);
    c.arc(80, 80, 62, a + Math.PI - 0.55, a + Math.PI + 0.55); c.closePath(); c.fill();
    c.strokeStyle = '#7D65AE'; c.lineWidth = 9; c.beginPath(); c.arc(80, 80, 62, a + Math.PI - 0.55, a + Math.PI + 0.55); c.stroke();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(tx, ty, 9, 0, 7); c.fill();
  }

  /* O #2 and #3 share precomputed slices */
  const N = 64, FR = 36;
  let frames = null, sino = null;
  function build() {
    frames = [];
    for (let f = 0; f < FR; f++) {
      const a = Phantom.slice(0.04 + 0.9 * f / (FR - 1), N, 44);
      const c = document.createElement('canvas'); c.width = c.height = N;
      c.getContext('2d').drawImage(Phantom.toCanvas(a, N, 500, 40), 0, 0); frames.push(c);
    }
    const a = Phantom.slice(0.4, N, 44), NA = 80; sino = new Float32Array(NA * N); let mx = 0;
    for (let k = 0; k < NA; k++) {
      const th = Math.PI * k / NA, ct = Math.cos(th), st = Math.sin(th);
      for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
        const x = i - N / 2 + 0.5, y = j - N / 2 + 0.5, b = Math.floor(x * ct + y * st + N / 2);
        if (b >= 0 && b < N) sino[k * N + b] += Math.max(0, a[j * N + i] + 1000);
      }
    }
    for (const v of sino) mx = Math.max(mx, v);
    const c = document.createElement('canvas'); c.width = N; c.height = NA;
    const x = c.getContext('2d'), id = x.createImageData(N, NA);
    for (let p = 0; p < sino.length; p++) { const g = 255 * Math.pow(sino[p] / mx, 1.4); id.data[p * 4] = id.data[p * 4 + 1] = id.data[p * 4 + 2] = g; id.data[p * 4 + 3] = 255; }
    x.putImageData(id, 0, 0); sino = c;
  }
  function cine(t) {
    if (!frames) return;
    const p = (t / 3200) % 2, f = Math.floor((p < 1 ? p : 2 - p) * (FR - 1));
    g2.imageSmoothingEnabled = true; g2.drawImage(frames[f], 0, 0, S, S);
  }
  function sinogram(t) {
    if (!sino) return;
    const p = (t / 4000) % 1.25, rows = Math.min(1, p) * sino.height;
    g3.fillStyle = '#7ADCF3'; g3.fillRect(0, 0, S, S);
    g3.save(); g3.beginPath(); g3.arc(80, 80, 80, 0, 7); g3.clip();
    g3.fillStyle = '#000'; g3.fillRect(0, 0, S, S * rows / sino.height);
    if (rows > 0) g3.drawImage(sino, 0, 0, sino.width, rows, 0, 0, S, S * rows / sino.height);
    g3.fillStyle = '#FFB257'; g3.fillRect(0, S * rows / sino.height - 2, S, 3);
    g3.restore();
  }

  setTimeout(build, 60);
  U.loop(document.querySelector('h1'), t => { gantry(t); cine(t); sinogram(t); });
})();
