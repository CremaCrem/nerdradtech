/* The 2 x 2 worked examples from the lecture: back projection and iterative reconstruction */
(() => {
  const { $ } = U;
  // cell centres: a b / c d
  const RAYS = {
    H:  { lines: [[30, 85, 200, 85], [30, 145, 200, 145]], at: [[214, 89], [214, 149]], sums: [3, 7], dir: '→' },
    P1: { lines: [[52, 123, 128, 47], [48, 187, 192, 43], [112, 183, 188, 107]], at: [[132, 42], [196, 38], [192, 102]], sums: [1, 5, 4], dir: '↗' },
    P2: { lines: [[90, 28, 90, 195], [150, 28, 150, 195]], at: [[90, 214], [150, 214]], sums: [4, 6], dir: '↓' },
    P3: { lines: [[52, 107, 128, 183], [48, 43, 192, 187], [112, 47, 188, 123]], at: [[134, 196], [200, 200], [196, 134]], sums: [3, 5, 2], dir: '↘' },
  };
  const CELLS = [[60, 55], [120, 55], [60, 115], [120, 115]];

  function svg(el, cellText, ray, labels) {
    let o = '';
    CELLS.forEach(([x, y], i) => {
      o += `<rect x="${x}" y="${y}" width="60" height="60" fill="none" stroke="var(--ink)" stroke-width="1.5"/>`;
      o += `<text x="${x + 30}" y="${y + 38}" text-anchor="middle" font-size="22" fill="var(--ink)">${cellText[i]}</text>`;
    });
    if (ray) {
      const R = RAYS[ray];
      R.lines.forEach(([x1, y1, x2, y2]) => { o += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--beam)" stroke-width="3" opacity=".8"/>`; });
      R.at.forEach(([x, y], i) => { o += `<text x="${x}" y="${y}" text-anchor="middle" font-size="15" font-weight="500" fill="var(--marker)">${(labels || R.sums)[i]}</text>`; });
    }
    el.innerHTML = o;
  }

  function stepper(prefix, steps, cellsFor) {
    let i = 0, prev = null;
    function show() {
      const s = steps[i];
      $(prefix + 'Mat').innerHTML = s.v.map((x, k) => `<div class="${prev && prev[k] !== x ? 'chg' : ''}">${x}</div>`).join('');
      svg($(prefix + 'Rays'), cellsFor(s), s.ray, s.labels);
      $(prefix + 'Label').textContent = s.t;
      $(prefix + 'Text').innerHTML = s.d;
      $(prefix + 'Count').textContent = `Step ${i + 1} of ${steps.length}`;
      $(prefix + 'Prev').disabled = i === 0; $(prefix + 'Next').disabled = i === steps.length - 1;
    }
    $(prefix + 'Prev').addEventListener('click', () => { prev = steps[i].v; i--; show(); });
    $(prefix + 'Next').addEventListener('click', () => { prev = steps[i].v; i++; show(); });
    show();
  }

  stepper('bp', [
    { v: ['', '', '', ''], t: 'Empty matrix', d: 'The object on the left is what we want to rebuild: 1, 2, 3, 4. The scanner cannot see inside. It can only send rays through and measure the total along each ray.' },
    { v: [3, 3, 7, 7], ray: 'H', t: 'BP', d: 'First projection, straight across. Row sums: 1 + 2 = <b>3</b> and 3 + 4 = <b>7</b>. Back projection puts each sum into every cell that ray passed through.' },
    { v: [4, 8, 12, 11], ray: 'P1', t: 'BP + P1', d: 'P1 runs diagonally. Its sums are <b>1, 5, 4</b>. Add each sum to the cells on that diagonal: 3 + 1, 3 + 5, 7 + 5, 7 + 4.' },
    { v: [8, 14, 16, 17], ray: 'P2', t: 'BP + P1 + P2', d: 'P2 runs down the columns. Column sums are <b>4</b> and <b>6</b>: 4 + 4, 8 + 6, 12 + 4, 11 + 6.' },
    { v: [13, 16, 19, 22], ray: 'P3', t: 'BP + P1 + P2 + P3', d: 'P3 runs along the other diagonal. Its sums are <b>2, 5, 3</b>: 8 + 5, 14 + 2, 16 + 3, 17 + 5. Notice the order is right but every cell is far too big. That excess is the blur.' },
    { v: [3, 6, 9, 12], t: 'BP + P1 + P2 + P3 − 10', d: 'Subtract <b>10</b>, the total of the whole object (1 + 2 + 3 + 4). Every cell picked up that extra amount from rays that only passed nearby.' },
    { v: [1, 2, 3, 4], t: '(BP + P1 + P2 + P3 − 10) ÷ 3 = CT image', d: 'Divide by <b>3</b> and the matrix matches the object: <b>1, 2, 3, 4</b>. Four directions were enough for this tiny matrix. A real 512 × 512 matrix needs hundreds of projections.' },
  ], s => [1, 2, 3, 4]);

  stepper('ir', [
    { v: ['', '', '', ''], ray: 'H', labels: ['3', '7'], t: 'Measured data', d: 'The scanner has all its projections, for example the row sums <b>3</b> and <b>7</b>. The object itself is unknown, so the cells show question marks.' },
    { v: [2.5, 2.5, 2.5, 2.5], t: 'First guess', d: 'Assume every point has the same value. The total is 10 across 4 cells, so each starts at <b>2.5</b>.' },
    { v: [2.5, 2.5, 2.5, 2.5], ray: 'H', labels: ['5→3', '5→7'], t: 'Compare rows', d: 'Project the guess: each row adds to 5. The measured rows are 3 and 7. Row 1 is 2 too high, row 2 is 2 too low.' },
    { v: [1.5, 1.5, 3.5, 3.5], ray: 'H', labels: ['3 ✓', '7 ✓'], t: 'Correction 1', d: 'Spread each error over its row: take 1 from each cell in row 1 and add 1 to each cell in row 2. Rows now match.' },
    { v: [1.5, 1.5, 3.5, 3.5], ray: 'P2', labels: ['5→4', '5→6'], t: 'Compare columns', d: 'Project again down the columns: each adds to 5, but the measured columns are 4 and 6.' },
    { v: [1, 2, 3, 4], ray: 'P2', labels: ['4 ✓', '6 ✓'], t: 'Correction 2', d: 'Take 0.5 from each cell in column 1 and add 0.5 to column 2. The guess is now <b>1, 2, 3, 4</b> and agrees with every measurement. A real scanner repeats these loops many times, which is why iterative reconstruction needs GPUs and takes longer.' },
  ], () => ['?', '?', '?', '?']);
})();
