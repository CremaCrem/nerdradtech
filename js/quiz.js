/* Self-check: one question at a time, missed questions come back at the end.
   Every .quiz[data-topic] box gets its own round; data-n picks that many at random, "all" uses the whole bank. */
(() => {
  const BANK = [
    ['A CT number (Hounsfield unit) of 0 belongs to:', ['Water', 'Air', 'Bone', 'Fat'], 'Water is set to 0 HU. Air is about −1000 and bone is about +400 to +1000.', 'basics'],
    ['The measurements that come straight from the detectors, before any image exists, are called:', ['Raw data', 'Image data', 'Pixels', 'Voxels'], 'Raw data is just numbers from the detectors. Reconstruction turns it into image data.', 'basics'],
    ['A reconstruction algorithm turns:', ['Raw data into image data', 'Image data into raw data', 'Pixels into voxels', 'Dose into HU'], 'Input = raw data, process = software (formula), output = image data.', 'basics'],
    ['A voxel is:', ['A pixel with thickness: a small cube of tissue', 'One row of the sinogram', 'One x-ray beam', 'A type of filter'], 'A pixel is the flat box on the screen. A voxel is the small cube of the patient that box stands for.', 'basics'],

    ['Which 3D algorithm is widely used in CT angiography?', ['Maximum intensity projection', 'Shaded surface display', 'Shaded volume display', 'Helical interpolation'], 'MIP keeps the brightest value on each line, and vessels filled with contrast are some of the brightest things in the body.', 'mpr'],
    ['The simplest form of 3D imaging is:', ['MIP', 'SSD', 'SVD', 'Iterative reconstruction'], 'The slides call MIP the simplest form of 3D imaging. It only has one rule: keep the brightest value.', 'mpr'],
    ['MIP reconstructs an image by selecting:', ['The highest value pixels along an arbitrary line', 'A narrow range of values as the object', 'Every pixel inside an operator-selected range', 'The lowest value pixels along a line'], 'Maximum intensity = highest value. The brightest value on each line wins.', 'mpr'],
    ['Bone imaging and virtual colonoscopy are applications of:', ['Shaded surface display', 'Maximum intensity projection', 'Shaded volume display', 'Fourier transformation'], 'SSD shows only the surface of whatever falls in a narrow range of values, like the outside of a bone or the inner wall of the colon.', 'mpr'],
    ['Which algorithm identifies a narrow range of values as belonging to the object to be imaged?', ['SSD', 'MIP', 'SVD', 'Back projection'], 'That is the definition of shaded surface display, a computer-aided technique.', 'mpr'],
    ['Which 3D algorithm is very sensitive to the operator-selected pixel range?', ['Shaded volume display', 'Shaded surface display', 'Maximum intensity projection', 'Convolution'], 'SVD blends everything inside the chosen range, so changing the range changes the picture a lot.', 'mpr'],
    ['Which gives an image that appears very 3D (volume rendered)?', ['SVD', 'MIP', 'SSD', 'Back projection'], 'Shaded volume display gives the volume-rendered, see-through 3D look.', 'mpr'],

    ['Back projection is also known as:', ['Summation or linear superposition method', 'Convolution method', 'Deconvolution', 'Linear interpolation'], 'Back projection adds up (sums) all the back-projected images, layered on top of each other (superposition).', 'bp'],
    ['The typical artifact of simple back projection is the:', ['Star pattern', 'Ring artifact', 'Stair-step artifact', 'Cupping artifact'], 'Each smeared ray leaves a spoke, so objects get a star-shaped halo.', 'bp'],
    ['Back projection was described by Oldendorf (1961) and:', ['Kuhl and Edwards (1963)', 'Hounsfield and Cormack (1972)', 'Radon (1917)', 'Feldkamp and Davis (1984)'], 'Oldendorf (1961) and Kuhl and Edwards (1963).', 'bp'],
    ['In the 2 × 2 example (1, 2, 3, 4), what is subtracted from BP + P1 + P2 + P3 before dividing by 3?', ['10', '4', '3', '13'], '10 is the total of the whole object: 1 + 2 + 3 + 4.', 'bp'],
    ['Which reconstruction method is NOT used in clinical CT?', ['Simple back projection', 'Filtered back projection', 'Iterative reconstruction', 'Helical interpolation'], 'Simple back projection does not give a sharp image, so it is not used clinically.', 'bp'],

    ['A convolution filter is applied to:', ['Raw data only', 'Image data only', 'Both raw and image data', 'The scanogram'], 'The slides stress it: raw data only, not image data.', 'conv'],
    ['Convolution is used to minimize:', ['Streak artifacts', 'Patient dose', 'Scan time', 'Matrix size'], 'One stated purpose of the convolution filter is to minimize streak artifacts.', 'conv'],
    ['A filter that accentuates the difference between neighboring pixels gives:', ['High spatial resolution, high noise, edge enhancement for bone', 'Low noise, more blur, smoothing for soft tissue', 'Low contrast and low spatial resolution', 'No change in noise'], 'Exaggerating differences sharpens bone edges, but it exaggerates the graininess too.', 'conv'],
    ['A smoothing (soft tissue) filter results in:', ['Low noise and more blurring', 'High noise and low blurring', 'High spatial resolution', 'Edge enhancement'], 'Making neighbouring pixels more alike removes graininess but also softens edges.', 'conv'],
    ['Returning pixel values to their original level by a reverse process is:', ['Deconvolution', 'Convolution', 'Interpolation', 'Back projection'], '"De-" means undo. Deconvolution undoes convolution.', 'conv'],

    ['Convolution + back projection =', ['Filtered back projection', 'Iterative reconstruction', 'Fourier transformation', 'Deconvolution'], 'Filter (convolve) each profile, then back project it: filtered back projection.', 'fbp'],
    ['Disadvantage of filtered back projection:', ['Noise and streak artifacts', 'Star-like blurring', 'Requires GPUs', 'Prominent blurring from 360° interpolation'], 'FBP removes the star pattern, but it brings noise and streak artifacts.', 'fbp'],

    ['Fourier transformation is used to reconstruct images in:', ['MRI', 'Modern CT scanners', 'Conventional tomography', 'Ultrasound'], 'It is used in MRI, not in modern CT scanners.', 'fourier'],
    ['The analogy used for Fourier transformation is the act of:', ['Hearing', 'Seeing', 'Breathing', 'Writing'], 'The ear separates sound into simple waves and the brain puts them back together.', 'fourier'],

    ['Linear interpolation: point A = 5 and point C = 15. Point B halfway between is:', ['10', '20', '7.5', '15'], 'Halfway along a straight line from 5 to 15 is 10.', 'helical'],
    ['Helical interpolation is used to:', ['Straighten up the sectional image', 'Reduce patient dose', 'Remove the star pattern', 'Create a 3D surface'], 'It creates the missing data so a flat slice can be made from spiral data.', 'helical'],
    ['The first helical interpolation algorithm used:', ['360° linear interpolation', '180° linear interpolation', 'Iterative interpolation', 'Fourier interpolation'], '360° linear interpolation, which caused prominent blurring.', 'helical'],
    ['Helical interpolation is a ___ algorithm.', ['Post-acquisition', 'Pre-acquisition', 'Real-time display', '3D rendering'], 'It is applied after the scan, to data already collected.', 'helical'],

    ['Iterative reconstruction starts with the assumption that:', ['All points in the matrix have the same value', 'All points are zero', 'The topogram is correct', 'Only bone has value'], 'It starts with a flat guess, then corrects it against the measurements.', 'iter'],
    ['A primary advantage of iterative reconstruction is:', ['Low patient dose', 'Faster reconstruction', 'Low computing requirement', 'Star pattern removal only'], 'Reduced image noise and low patient dose are its primary advantages.', 'iter'],
    ['A disadvantage of iterative reconstruction is:', ['Computationally intensive, slower reconstruction', 'More streak artifacts from metal', 'Higher image noise', 'Cannot be used with helical data'], 'Repeating guess-and-check many times needs strong computers (GPUs) and takes longer.', 'iter'],
  ];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  function quiz(box, pick, mini) {
    let items, queue, results, firstTry, current;
    const mastered = () => Object.values(results).filter(v => v === true).length;

    function start() { items = pick(); queue = shuffle(items.map((_, i) => i)); results = {}; firstTry = 0; next(); }
    function track() {
      return `<div class="qtrack" aria-hidden="true">${items.map((_, i) => `<i class="${results[i] === true ? 'ok' : results[i] === false ? 'miss' : ''}"></i>`).join('')}</div>`;
    }
    function next() {
      if (!queue.length) return finish();
      current = queue.shift();
      const [q, opts, why] = items[current];
      const order = shuffle(opts.map((_, i) => i));
      box.innerHTML = `<div class="qhead"><span>${mastered()} of ${items.length} mastered</span>${track()}</div>
        <p class="qtext">${q}</p>
        <div class="qopts">${order.map((oi, n) => `<button data-i="${oi}"><b>${'ABCD'[n]}</b><span>${opts[oi]}</span></button>`).join('')}</div>
        <p class="qwhy" hidden></p><div class="stepper" hidden><button class="primary qnext">Next question</button></div>`;
      const bs = [...box.querySelectorAll('.qopts button')];
      bs.forEach(b => b.addEventListener('click', () => {
        if (box.dataset.answered === '1') return; box.dataset.answered = '1';
        const ok = +b.dataset.i === 0;
        bs.find(x => +x.dataset.i === 0).classList.add('right'); if (!ok) b.classList.add('wrong');
        if (ok) { if (results[current] === undefined) firstTry++; results[current] = true; }
        else { results[current] = false; queue.push(current); }
        const w = box.querySelector('.qwhy'); w.innerHTML = (ok ? '<b>Correct.</b> ' : '<b>Not this one.</b> It will come back later. ') + why; w.hidden = false;
        box.querySelector('.stepper').hidden = false; box.querySelector('.qnext').focus({ preventScroll: true });
        box.querySelector('.qhead span').textContent = `${mastered()} of ${items.length} mastered`;
        box.querySelector('.qtrack').outerHTML = track();
      }));
      box.dataset.answered = '0';
      box.querySelector('.qnext').addEventListener('click', next);
    }
    function finish() {
      const n = items.length, clean = firstTry === n;
      const msg = mini
        ? (clean ? 'All right on the first try. On to the next topic.' : 'Done. Read the board points once more, then move on.')
        : (clean ? 'Clean sweep.' : 'The red marks above were missed at first. Go back to those sections, then try another round.');
      box.innerHTML = `<div class="qhead"><span>All ${n} mastered</span>${track()}</div>
        <p class="qdone">${firstTry} of ${n} right on the first try</p>
        <p class="qwhy">${msg}</p>
        <div class="stepper"><button class="${mini ? '' : 'primary '}qagain">${mini ? 'Try other questions' : 'New round'}</button></div>`;
      box.querySelector('.qagain').addEventListener('click', start);
    }
    start();
  }

  document.querySelectorAll('.quiz[data-topic]').forEach(box => {
    const t = box.dataset.topic, n = +box.dataset.n;
    const pool = t === 'all' ? BANK : BANK.filter(q => q[3] === t);
    quiz(box, () => n ? shuffle(pool).slice(0, n) : pool, t !== 'all');
  });
})();
