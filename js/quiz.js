/* Question bank, quick checks, mock exam and saved progress.
   Each question: [question, [correct, wrong, wrong, wrong], why, topic]. Options are shuffled when shown.
   Progress (questions answered right at least once) is kept in this browser only. */
(() => {
  const CH = {
    ch1: ['def', 'adv', 'proc', 'win', 'store'], ch2: ['slice', 'pix', 'fov', 'atten', 'hu', 'ray'],
    ch3: ['gen', 'pitch', 'msct', 'slip', 'parts', 'coll', 'det'], ch4: ['recon', 'mpr', 'bp', 'conv', 'fbp', 'fourier', 'helical', 'iter'],
    ch5: ['disp'], ch6: ['iq', 'unc', 'art']
  };
  const BANK = [
    /* ---------- I · definition ---------- */
    ['CT produces a 3D digital tomographic image from:', ['Diagnostic x-rays', 'Radio waves in a magnetic field', 'High-frequency sound waves', 'Gamma rays from an injected tracer'], 'Computed tomography uses diagnostic x-rays. Radio waves + magnet = MRI, sound = ultrasound, tracer = nuclear medicine.', 'def'],
    ['CT is usually performed in which plane, giving a high-quality direct image?', ['Transverse', 'Coronal', 'Sagittal', 'Oblique'], 'CT is usually performed transversely: a high-quality direct transverse image. Coronal needs special positioning and gantry tilt.', 'def'],
    ['In the raisin bread analogy, the raisin represents:', ['Pathology', 'Skin', 'Internal organs', 'The patient\'s body'], 'Loaf = body, brown crust = skin, white bread = internal organs, raisin = pathology.', 'def'],
    ['In the raisin bread analogy, the brown portion (crust) represents:', ['Skin', 'Pathology', 'Internal organs', 'Bone'], 'The crust is the skin around the whole loaf.', 'def'],
    ['CT basically consists of:', ['A finely-collimated beam and a detector', 'A wide beam and a film cassette', 'An image intensifier and a TV camera', 'A cone beam and a grid'], 'From the slides: CT consists of a finely-collimated beam and a detector.', 'def'],
    ['Which term is used for the modality today?', ['Computed tomography', 'Computed transverse axial tomography', 'Reconstructive tomography', 'Computerized transaxial transmission reconstruction tomography'], 'All the others are earlier terms in the evolution of the name.', 'def'],
    ['A topogram and an MPR are examples of which kind of CT image?', ['2D images', '3D images', 'Virtual images', 'Raw data'], '2D: topogram, MPR. 3D: SVD, SSD. Virtual: virtual colonoscopy.', 'def'],
    ['Virtual colonoscopy is an example of a:', ['Virtual CT image', '2D CT image', 'Scanogram', 'Sinogram'], 'The lecture lists 2D, 3D and virtual CT images. Virtual colonoscopy is the virtual example.', 'def'],

    /* ---------- I · advantages ---------- */
    ['The spatial resolution of CT is about:', ['1 lp/mm', '5 lp/mm', '7 lp/mm', '10 lp/mm'], 'CT ≈ 1 lp/mm, digital radiography 5 lp/mm, screen-film 7 lp/mm. Worse spatial resolution is a disadvantage of CT.', 'adv'],
    ['Screen-film radiography resolves about:', ['7 lp/mm', '1 lp/mm', '5 lp/mm', '3 lp/mm'], 'Screen-film 7, DR 5, CT 1 lp/mm.', 'adv'],
    ['Which is an ADVANTAGE of CT?', ['Good low contrast resolution', 'Superior spatial resolution', 'Low patient dose', 'No risk of allergic reaction'], 'CT sees small density differences well. Its spatial resolution is worse, its dose high, and contrast can cause allergy.', 'adv'],
    ['Which is a DISADVANTAGE of CT?', ['Worse spatial resolution', 'Variable contrast scale', 'Non-invasive', 'Volume data acquisition'], 'The other three are listed advantages.', 'adv'],
    ['Step-and-shoot scanning is also called:', ['Axial, slice-by-slice or sequential scanning', 'Helical scanning', 'Spiral scanning', 'Volumetric scanning'], 'Step-and-shoot = axial = slice-by-slice = sequential. It gives separated data.', 'adv'],
    ['Helical scanning gives what kind of data?', ['Continuous volume data', 'Separated data', 'Only 2D data', 'Data that cannot be reformatted'], 'Helical acquisition gives continuous volume data, which improves 3D and MPR.', 'adv'],
    ['CT\'s "variable contrast scale" refers to:', ['Window width and window level', 'kVp and mAs', 'Pitch and collimation', 'Matrix and FOV'], 'You can change WW and WL after the scan to change the contrast.', 'adv'],
    ['The iodinated contrast concentrations given in the lecture are:', ['320 and 370 mg of iodine per mL', '32 and 37 mg per mL', '3.2 and 3.7 g per mL', '120 and 140 mg per mL'], '320 mg I/mL and 370 mg I/mL: used for imaging large blood vessels, one of CT\'s strengths.', 'adv'],

    /* ---------- I · processes ---------- */
    ['"Get data" describes which CT process?', ['Data acquisition', 'Image reconstruction', 'Image display', 'Image communication'], 'Acquisition = get data, reconstruction = use data, display = display data.', 'proc'],
    ['"Use data" describes:', ['Image reconstruction', 'Data acquisition', 'Image storage', 'Image manipulation'], 'Reconstruction uses the collected transmission values with mathematical techniques.', 'proc'],
    ['Collection of x-ray attenuation (transmission) measurements from the patient is:', ['Data acquisition', 'Image reconstruction', 'Image manipulation', 'Image archiving'], 'That is the definition of data acquisition.', 'proc'],
    ['Reconstruction automatically produced during scanning is:', ['Prospective reconstruction', 'Retrospective reconstruction', 'Iterative reconstruction', 'Deconvolution'], 'Prospective = during the scan. Retrospective = the same raw data used later.', 'proc'],
    ['Using the same raw data later to generate a new image is:', ['Retrospective reconstruction', 'Prospective reconstruction', 'Back projection', 'Image communication'], 'Retrospective reconstruction needs no new scan, so no extra dose.', 'proc'],
    ['The data acquisition scheme of the 1st generation (EMI) scanner:', ['Translate–rotate', 'Rotate–rotate', 'Rotate–stationary', 'Stationary–stationary'], '1st gen: translate–rotate, 1° rotation per translation, 180 translations.', 'proc'],
    ['How many translations did the 1st generation scanner make?', ['180', '360', '1', '80'], '1° of rotation per translation, 180 translations in all.', 'proc'],
    ['Image smoothing, edge enhancement, gray scale manipulation and 3D processing are examples of:', ['Image manipulation', 'Data acquisition', 'Image storage', 'Image communication'], 'Image manipulation modifies images to make them more useful for interpretation.', 'proc'],
    ['A 3D processing tool that keeps the LOWEST values along each ray (showing air-filled airways):', ['Minimum intensity projection', 'Maximum intensity projection', 'Shaded surface display', 'Back projection'], 'MinIP is the opposite of MIP: the darkest value wins.', 'proc'],

    /* ---------- I · windowing ---------- */
    ['Bone window: WW 2000, WL 300. Which HU range shows as gray?', ['−700 to +1300', '−1700 to +2300', '−1000 to +1000', '−300 to +2300'], 'WW/2 = 1000. 300 − 1000 = −700, 300 + 1000 = 1300.', 'win'],
    ['Lung window: WW 1500, WL −500. Which HU range shows as gray?', ['−1250 to +250', '−2000 to +1000', '−1250 to −250', '−750 to +750'], 'WW/2 = 750. −500 − 750 = −1250, −500 + 750 = +250.', 'win'],
    ['With WW 1500 / WL −500, a pixel of +400 HU appears:', ['White', 'Black', 'Middle gray', 'Dark gray'], 'The upper limit is +250. Anything above it is white.', 'win'],
    ['With WW 2000 / WL 300, a pixel of −800 HU appears:', ['Black', 'White', 'Middle gray', 'Light gray'], 'The lower limit is −700. Anything below it is black.', 'win'],
    ['Window width controls:', ['The range of HU spread across the gray scale (contrast)', 'The HU at the center of the gray scale', 'The slice thickness', 'The tube current'], 'WW = how many HU share the grays. WL = which HU sits in the middle.', 'win'],
    ['Window level is:', ['The HU value at the center of the gray scale', 'The number of shades of gray', 'The pixel size', 'The scan field of view'], 'WL is the middle of the window and should be near the tissue of interest.', 'win'],
    ['WW 400, WL 40. The upper limit of the window is:', ['+240', '+440', '+200', '+360'], 'WW/2 = 200, so upper = 40 + 200 = 240 (lower = −160).', 'win'],
    ['A narrow window width gives:', ['High contrast (short scale)', 'Low contrast (long scale)', 'More quantum noise in the data', 'Thinner slices'], 'Few HU spread over all the grays means small HU differences look very different.', 'win'],

    /* ---------- I · storage & communication ---------- */
    ['The standard used to send CT images between devices from different makers:', ['DICOM', 'PACS', 'HIS', 'DAC'], 'DICOM is the shared standard (and DICOM printers). PACS is the archive system that uses it.', 'store'],
    ['Image communication must allow connectivity (networking) among:', ['PACS, RIS and HIS', 'CPU, GPU and RAM', 'Tube, detector and DAS', 'Gantry, couch and console'], 'The slide lists PACS, RIS and HIS.', 'store'],
    ['Storing CT images for later analysis is:', ['Image archiving (storage)', 'Image communication', 'Image reconstruction', 'Image manipulation'], 'Archiving = storage: tape, disk, optical/laser storage.', 'store'],
    ['A device that records CT images on film:', ['Laser camera', 'Photodiode', 'DAC', 'Slip ring'], 'The lecture lists the laser camera under image storage.', 'store'],
    ['Which is an image storage medium named in the lecture?', ['Magnetic tape and disk', 'Xenon gas', 'Bowtie filter', 'Spacing bars'], 'Storage: magnetic tape and disk, optical/laser storage, laser camera.', 'store'],

    /* ---------- II · slice ---------- */
    ['The Z-axis of a CT slice is its:', ['Thickness', 'Width', 'Height', 'Matrix size'], 'Z = thickness, X = width, Y = height.', 'slice'],
    ['The X-axis of a CT slice is its:', ['Width', 'Thickness', 'Height', 'Depth along the patient'], 'X = width.', 'slice'],
    ['The Y-axis of a CT slice is its:', ['Height', 'Width', 'Thickness', 'Pitch'], 'Y = height.', 'slice'],
    ['The patient lies more to one side of the table. This is:', ['X-direction miscentering', 'Y-direction miscentering', 'Z-direction miscentering', 'Out-of-field artifact'], 'Side to side = X.', 'slice'],
    ['The technologist sets the table too low or too high in the gantry. This is:', ['Y-direction miscentering', 'X-direction miscentering', 'Gantry tilt', 'Aliasing'], 'Up and down = Y.', 'slice'],

    /* ---------- II · pixel, voxel, matrix ---------- */
    ['A pixel is a:', ['Picture element (2D)', 'Volume element (3D)', 'Row of the sinogram', 'Single detector element'], 'Pixel = picture element. Voxel = volume element.', 'pix'],
    ['A voxel is a:', ['Volume element (3D)', 'Picture element (2D)', 'Unit of attenuation', 'Line pair'], 'Voxel = pixel × slice thickness: a 3D block of tissue.', 'pix'],
    ['Matrix of the original EMI scanner:', ['80 × 80', '512 × 512', '256 × 256', '1024 × 1024'], 'EMI: 80 × 80. Most common today: 512 × 512.', 'pix'],
    ['The most common CT matrix:', ['512 × 512', '80 × 80', '128 × 128', '2048 × 2048'], '512 × 512 is the most common.', 'pix'],
    ['Small pixel size results in:', ['Better spatial resolution', 'Poorer spatial resolution', 'More partial volume averaging', 'Lower patient dose'], 'Small pixels: better spatial resolution and less partial volume averaging.', 'pix'],
    ['With a fixed matrix size, increasing the FOV:', ['Increases the pixel size', 'Decreases the pixel size', 'Does not change the pixel size', 'Doubles the matrix'], 'Same number of pixels across a bigger area means each pixel is bigger.', 'pix'],
    ['With a fixed FOV, increasing the matrix size:', ['Reduces the pixel size', 'Increases the pixel size', 'Increases the FOV', 'Reduces the number of pixels'], 'More pixels across the same area means smaller pixels.', 'pix'],
    ['One large pixel contains +500, −200, +60 and +40 HU. It will display:', ['+100', '+400', '+500', '+25'], '(500 − 200 + 60 + 40) ÷ 4 = 400 ÷ 4 = +100: partial volume averaging.', 'pix'],
    ['FOV 25 cm, matrix 512. The pixel size is about:', ['0.49 mm', '4.9 mm', '0.049 mm', '2.05 mm'], 'Pixel = FOV ÷ matrix = 250 mm ÷ 512 ≈ 0.49 mm.', 'pix'],
    ['Pixel size 0.5 mm, slice thickness 2 mm. The voxel volume is:', ['0.5 mm³', '1 mm³', '0.25 mm³', '2.5 mm³'], 'Voxel = 0.5 × 0.5 × 2 = 0.5 mm³.', 'pix'],
    ['A large matrix size gives:', ['Better spatial resolution', 'Poorer spatial resolution', 'Higher dose by itself', 'A larger SFOV'], 'Larger matrix → smaller pixels (at a fixed FOV) → better detail.', 'pix'],

    /* ---------- II · FOV ---------- */
    ['The field of view is the:', ['Diameter of image reconstruction', 'Area of one detector', 'Slice thickness', 'Gantry aperture'], 'FOV: the diameter of image reconstruction, measured in cm.', 'fov'],
    ['The "target" or "zoom" region is the:', ['Display FOV', 'Scan FOV', 'Calibration FOV', 'Gantry aperture'], 'DFOV = the section of data selected for display.', 'fov'],
    ['The display FOV cannot be larger than the:', ['Scan FOV', 'Matrix', 'Pixel size', 'Slice thickness'], 'You can only display data that was acquired inside the SFOV.', 'fov'],
    ['The calibration FOV is another name for the:', ['Scan FOV', 'Display FOV', 'Window width', 'Matrix'], 'SFOV = calibration FOV: the area within the gantry from which raw data is acquired.', 'fov'],
    ['Anatomy outside the SFOV:', ['Is not imaged and can cause out-of-field artifacts', 'Is imaged at a lower resolution', 'Is displayed in reverse', 'Improves spatial resolution'], 'Anything outside the SFOV is not imaged.', 'fov'],

    /* ---------- II · attenuation ---------- */
    ['Beam attenuation depends on all of these EXCEPT:', ['Matrix size', 'Tissue mass density', 'Tissue thickness', 'Atomic number'], 'Density, thickness, atomic number and radiation energy. Matrix size is a display/reconstruction setting.', 'atten'],
    ['The symbol for the linear attenuation coefficient:', ['µ', 'λ', 'σ', 'Z'], 'µ (mu).', 'atten'],
    ['The lecture\'s value for the linear attenuation coefficient of water:', ['0.18 cm⁻¹ at 125 kVp', '1.8 cm⁻¹ at 70 kVp', '0.018 cm⁻¹ at 125 kVp', '18 cm⁻¹ at 125 kVp'], 'Water: 0.18 cm⁻¹ at 125 kVp.', 'atten'],
    ['µ of water = 0.18 cm⁻¹ means about:', ['18% of the beam is absorbed or scattered per cm', '0.18% is absorbed per cm', '82% is absorbed per cm', '18% is absorbed per mm'], '0.18 per cm ≈ 18% per centimetre.', 'atten'],
    ['Beam attenuation is:', ['The reduction in intensity of a beam as it passes through an object', 'The increase in beam energy from filtration', 'The conversion of x-rays into light', 'The spread of the beam with distance'], 'Definition from the slides.', 'atten'],

    /* ---------- II · HU ---------- */
    ['The HU range given in the lecture:', ['−1000 to +3000', '−1000 to +1000', '0 to 4096', '−3000 to +1000'], 'Range: −1000 to +3000.', 'hu'],
    ['A negative CT number means the object attenuates:', ['Less than water', 'More than water', 'Exactly like water', 'Like bone'], 'Negative = less than water (fat, lung, air).', 'hu'],
    ['A positive CT number means the object attenuates:', ['More than water', 'Less than water', 'Like air', 'Nothing'], 'Positive = more than water.', 'hu'],
    ['The CT number of water:', ['0', '−1000', '+1000', '+100'], 'Water is the reference: 0 HU.', 'hu'],
    ['The CT number of air:', ['−1000', '0', '+1000', '−100'], 'Air = −1000.', 'hu'],
    ['Hounsfield units are also called:', ['CT numbers or density values', 'Attenuation profiles', 'Ray sums', 'Line pairs'], 'CT numbers or density values: the numeric information in each pixel.', 'hu'],
    ['µ tissue = 0.36, µ water = 0.18. The CT number is:', ['+1000', '+500', '+2000', '−1000'], '1000 × (0.36 − 0.18) ÷ 0.18 = +1000.', 'hu'],
    ['Fat has a CT number of about:', ['−100', '+100', '−1000', '+1000'], 'Fat ≈ −100 HU: a little less attenuating than water.', 'hu'],
    ['CT numbers are used to:', ['Assess the nature of the tissue', 'Measure patient dose', 'Set the pitch', 'Calibrate the couch'], 'They quantify attenuation, which helps tell fat, fluid, blood and calcium apart.', 'hu'],

    /* ---------- II · rays ---------- */
    ['The path the x-ray beam takes from the tube to the detector:', ['Ray', 'View', 'Translation', 'Matrix'], 'Ray = tube-to-detector path.', 'ray'],
    ['A ray sum tells you:', ['How much of the beam was attenuated along that ray', 'The HU of one pixel', 'The gantry angle', 'The slice thickness'], 'The detector only knows the total along each ray.', 'ray'],
    ['A complete set of ray sums is a:', ['Projection (view)', 'Ray', 'Voxel', 'Matrix'], 'Projection = view = attenuation profile = a complete set of ray sums.', 'ray'],
    ['Movement of the source-detector assembly across the patient:', ['Translation', 'Rotation', 'Pitch', 'Interpolation'], 'Translation = sweep or scan across the patient.', 'ray'],
    ['One translation results in:', ['One projection (view)', 'One pixel', 'A complete image', 'One ray'], 'A sweep across the patient produces one projection.', 'ray'],

    /* ---------- III · generations ---------- */
    ['Scanner generation is decided by:', ['How the x-ray tube is arranged relative to the detectors', 'The matrix size', 'The kVp used', 'The year of manufacture'], 'Configuration of tube to detectors: scanning geometry, scanning motion and number of detectors.', 'gen'],
    ['The EMI head scanner, a demo project only, was which generation?', ['1st', '2nd', '3rd', '4th'], '1st generation: parallel beam, 80 × 80 matrix, water bag, reference detector.', 'gen'],
    ['The beam geometry of the 1st generation:', ['Parallel beam', 'Fan beam', 'Cone beam', 'Electron beam'], '1st: parallel (pencil). 2nd–4th: fan. 7th: cone.', 'gen'],
    ['The 1st generation scanner used a water bag and a:', ['Reference detector', 'Bowtie filter', 'Slip ring', 'Cone beam'], 'Water bag around the head + a reference detector.', 'gen'],
    ['Which generation first permitted whole-body scanning and used a "bowtie" filter?', ['2nd', '1st', '3rd', '5th'], '2nd gen: fan beam, whole-body scanning, bowtie filter, loss of collimation.', 'gen'],
    ['"Loss of collimation" is a feature of the:', ['2nd generation', '1st generation', '3rd generation', '5th generation'], 'The fan beam of the 2nd gen scatters more than a pencil beam.', 'gen'],
    ['The most widely used scanner design (the de facto baseline model):', ['3rd generation', '1st generation', '4th generation', '5th generation'], '3rd gen: rotate–rotate with a curvilinear detector array.', 'gen'],
    ['A curvilinear detector array of 30–60° is found in the:', ['3rd generation', '4th generation', '1st generation', '5th generation'], 'The 3rd gen arc rotates with the tube.', 'gen'],
    ['A stationary ring detector array is found in the:', ['4th generation', '3rd generation', '2nd generation', '1st generation'], '4th: rotate–stationary.', 'gen'],
    ['Overscan of a 400° arc belongs to the:', ['4th generation', '3rd generation', '5th generation', '7th generation'], '4th gen: overscan (400°), closer SID, lower technical factors.', 'gen'],
    ['In which generation does the beam apex originate from the detector?', ['4th', '3rd', '1st', '7th'], '4th: apex at the detector. 3rd: apex at the x-ray tube.', 'gen'],
    ['Electron beam CT (cardiac cine CT) is the:', ['5th generation', '4th generation', '6th generation', '7th generation'], '5th gen: EBCT, very high speed, no moving gantry.', 'gen'],
    ['Scan times of EBCT:', ['33, 50 and 100 ms', '0.5, 1 and 2 s', '1, 5 and 10 ms', '300, 500 and 1000 ms'], 'Very high speed: 33 ms, 50 ms, 100 ms.', 'gen'],
    ['Which generation has no moving gantry?', ['5th', '3rd', '4th', '7th'], 'EBCT steers an electron beam onto stationary targets. Nothing moves mechanically.', 'gen'],
    ['Which is NOT a part of the electron beam CT scanner?', ['Slip ring', 'Electron gun', 'Deflection coil', 'Vacuum pumps'], 'EBCT: electron gun, vacuum pumps, focus coil, deflection coil, target, detector.', 'gen'],
    ['The two x-ray tubes of dual source CT are offset by:', ['90°', '180°', '45°', '120°'], 'Two tubes, 90° apart.', 'gen'],
    ['Dual source CT is designed for:', ['Cardiac CT, giving high temporal resolution', 'Head CT, giving high spatial resolution', 'Low-dose pediatric scanning only', 'Bone imaging with high contrast'], 'Designed for cardiac CT and provides high temporal resolution.', 'gen'],
    ['Multislice / multidetector CT is the:', ['7th generation', '5th generation', '4th generation', '2nd generation'], '7th gen: MSCT/MDCT, multiple slices per rotation.', 'gen'],

    /* ---------- III · helical & pitch ---------- */
    ['Helical pitch is the relationship between:', ['Patient couch movement and x-ray beam width', 'kVp and mAs', 'Matrix size and FOV', 'Window width and window level'], 'Pitch = table movement per rotation ÷ beam width.', 'pitch'],
    ['Which is true of a LOW pitch?', ['Higher dose and higher spatial resolution', 'Faster scan time', 'Undersampling', 'Lower dose'], 'Low pitch: slower, high dose, high spatial resolution, oversampling, less anatomy covered.', 'pitch'],
    ['A HIGH pitch results in:', ['Undersampling', 'Oversampling', 'Higher dose', 'Higher spatial resolution'], 'High pitch: faster, low dose, low spatial resolution, more coverage, undersampling.', 'pitch'],
    ['Pitch 1.5 with a 10 mm beam. Table travel per rotation:', ['15 mm', '6.7 mm', '10 mm', '1.5 mm'], 'Table movement = pitch × beam width = 1.5 × 10 mm.', 'pitch'],
    ['A disadvantage of helical CT:', ['A full 360° data set is not acquired for each section, so data is slanted and must be interpolated', 'It always gives a higher dose', 'It cannot produce 3D images', 'It increases motion artifacts'], 'Slanted data needs interpolation, giving slightly poorer resolution than step-and-shoot.', 'pitch'],
    ['Compared with conventional scanning, helical CT needs ___ contrast media:', ['Less', 'More', 'The same amount of', 'Twice as much'], 'An advantage on the slides: requires less contrast media.', 'pitch'],
    ['Compared with step-and-shoot, helical resolution is:', ['Slightly poorer', 'Much better', 'Identical', 'Unmeasurable'], 'Slightly poorer resolution, because the data is interpolated.', 'pitch'],
    ['Which is an ADVANTAGE of helical CT?', ['Fewer motion artifacts', 'A full 360° data set for each section', 'No need for slip rings', 'No interpolation needed'], 'Speed reduces motion artifacts.', 'pitch'],
    ['Helical CT can reconstruct an image at any z-axis position because the data is:', ['Interpolated', 'Fourier transformed', 'Back projected only once', 'Stored on film'], 'Volumetric data + interpolation = any z position.', 'pitch'],

    /* ---------- III · MSCT ---------- */
    ['Multislice CT produces:', ['Multiple slices per gantry rotation', 'One slice per rotation', 'Only 3D images', 'Images without a detector'], 'Several detector rows → several slices per rotation.', 'msct'],
    ['In MSCT, spatial resolution is determined by the:', ['Width of the detector', 'Width of the x-ray beam', 'kVp', 'Gantry aperture'], 'The slides: spatial resolution is determined by the width of the detector.', 'msct'],
    ['Single-detector CT uses a ___ beam; multidetector CT uses a ___ beam:', ['Fan; cone', 'Cone; fan', 'Pencil; fan', 'Parallel; electron'], 'SDCT = fan beam, MDCT = cone beam.', 'msct'],
    ['A 20 mm beam on four 5 mm detectors CANNOT be displayed as:', ['Eight 2.5 mm sections', 'Four 5 mm sections', 'Two 10 mm sections', 'One 20 mm section'], 'Rows can be combined, never split. 5 mm is the thinnest.', 'msct'],
    ['Which is an advantage of MSCT?', ['Adjustable slice thickness', 'No slip rings needed', 'Only one slice per rotation', 'No post-acquisition reconstruction'], 'Plus longer, faster z coverage and post-acquisition reconstruction.', 'msct'],

    /* ---------- III · slip rings ---------- */
    ['Slip rings are:', ['Electromechanical conductive rings and brushes that transmit electricity across a rotating interface', 'Rings of scintillation crystals', 'Lead rings that collimate the beam', 'Rubber rings that cushion the couch'], 'Definition from the slides.', 'slip'],
    ['Slip ring technology made ___ possible:', ['Helical CT', 'Electron beam CT', 'Fourier reconstruction', 'Film archiving'], 'Continuous rotation = helical scanning.', 'slip'],
    ['Slip rings:', ['Power the x-ray tube and carry detector signals to the computer', 'Cool the anode', 'Collimate the beam', 'Move the couch'], 'Both functions are on the slides.', 'slip'],
    ['Which is NOT an advantage of slip rings?', ['The cable must be unwound between slices', 'Continuous tube rotation', 'Faster scan time', 'Minimal interscan delays'], 'Slip rings removed the cable wrap-around and the start–stop process.', 'slip'],
    ['Slip rings eliminated the:', ['High-voltage cable and the start–stop process', 'Reference detector', 'Bowtie filter', 'Data acquisition system'], 'No high-voltage cable, no cable wrap-around, no start–stop.', 'slip'],

    /* ---------- III · x-ray system ---------- */
    ['Gantry aperture of most scanners:', ['70 cm', '50 cm', '90 cm', '44 in.'], 'Most: 70 cm (ranges 70–90 cm, 50–85 cm, 20–34 in.).', 'parts'],
    ['Maximum gantry tilt:', ['±30°', '±12°', '±45°', '±90°'], 'Up to ±30°. Standard ±12° to ±30°.', 'parts'],
    ['Gantry tilt increments:', ['0.5°', '1°', '5°', '0.1°'], '0.5-degree increments.', 'parts'],
    ['Gantry tilt is used for:', ['Partial coronal images', 'Changing slice thickness', 'Increasing the SFOV', 'Reducing noise'], 'Tilt allows partial coronal images.', 'parts'],
    ['The largest component of the CT system:', ['Gantry', 'Couch', 'Console', 'HV generator'], 'The ring-shaped gantry is the largest and most visible part.', 'parts'],
    ['Current CT x-ray generators are:', ['High-frequency, inside the gantry', 'Three-phase, outside the gantry', 'Single-phase, outside the gantry', 'Capacitor discharge units'], 'HF: small, inside the gantry, short high-tension cable.', 'parts'],
    ['Power rating of CT generators:', ['20–100 kW', '1–5 kW', '200–500 kW', '500–1000 kW'], '20–100 kW, with current units up to 120 kW.', 'parts'],
    ['CT anode rotation speed:', ['3,600–10,000 rpm', '300–1,000 rpm', 'Over 100,000 rpm', '60–120 rpm'], 'Rotating anode, 3,600–10,000 rpm.', 'parts'],
    ['CT target angle:', ['12°', '7°', '20°', '45°'], 'Target angle 12°.', 'parts'],
    ['The anode of a helical CT tube is a:', ['Brazed graphite disk with a tungsten–rhenium focal track', 'Fixed copper block', 'Pure molybdenum disk', 'Oil-cooled fixed tungsten anode'], 'Graphite base body + tungsten–rhenium focal track.', 'parts'],
    ['The Straton tube is:', ['Direct-cooled with the whole tube in oil, 5 MHU/min, made for MSCT', 'A fixed-anode tube for 1st generation scanners', 'An electron gun for EBCT', 'A xenon detector'], 'Allows high-speed volume scanning, high mA, long exposure and coverage.', 'parts'],
    ['Fixed-anode, oil-cooled x-ray tubes were used in:', ['1st and 2nd generation CT', '3rd and 4th generation CT', '5th generation CT', '7th generation CT'], 'Rotating anodes are common today.', 'parts'],
    ['The bowtie filter:', ['Shapes the energy distribution across the beam for uniform beam hardening', 'Converts light into electrical signals', 'Stops the table in an emergency', 'Measures HU'], 'Shapes the beam and produces uniform beam hardening.', 'parts'],
    ['Filtration of the x-ray beam:', ['Increases its mean energy', 'Adds low-energy photons', 'Lengthens the wavelength', 'Makes the beam more polychromatic'], 'Removes low-energy, long-wavelength x-rays.', 'parts'],
    ['The CT couch is made of:', ['Low-Z carbon graphite fiber', 'Lead', 'Steel', 'Aluminum'], 'Low Z reduces beam attenuation.', 'parts'],
    ['Weight limit of the CT couch:', ['220 kg', '120 kg', '320 kg', '500 kg'], '220 kg.', 'parts'],
    ['The emergency pull:', ['Stops table movement in an emergency or malfunction', 'Turns off the x-ray tube only', 'Tilts the gantry', 'Ejects the raw data'], 'Stops the table.', 'parts'],
    ['Scannable range is:', ['How far the table can move horizontally, meaning how much can be scanned without repositioning', 'The diameter of the SFOV', 'The kVp range', 'The gantry tilt range'], 'Definition from the slides.', 'parts'],
    ['Current gantry cooling:', ['Circulating ambient air from the scanner room through the gantry', 'An air conditioner inside the gantry', 'A water jacket', 'Liquid nitrogen'], 'Old: AC in the gantry. Current: ambient room air.', 'parts'],
    ['The red gantry lasers are used to:', ['Position the patient for transverse, coronal and sagittal centering', 'Measure dose', 'Expose the film', 'Cool the tube'], 'Accurate centering.', 'parts'],

    /* ---------- III · collimation ---------- */
    ['Which collimator determines patient dose (the dose profile)?', ['Pre-patient', 'Post-patient', 'Septal', 'Bowtie'], 'Pre-patient (source) collimator: limits the area of the patient in the beam.', 'coll'],
    ['Which collimator determines slice thickness (the sensitivity profile)?', ['Post-patient', 'Pre-patient', 'Bowtie', 'None'], 'Post-patient (predetector) collimator.', 'coll'],
    ['The pre-patient collimator is also called the:', ['Source collimator', 'Predetector collimator', 'Septal collimator', 'Bowtie filter'], 'Source collimator, between the tube and the patient.', 'coll'],
    ['The post-patient collimator is also called the:', ['Predetector collimator', 'Source collimator', 'Pre-patient filter', 'Reference detector'], 'Predetector collimator, below the patient and above the detectors.', 'coll'],
    ['Decreasing scatter radiation and improving image contrast is a function of the:', ['Post-patient collimator', 'Pre-patient collimator', 'Bowtie filter', 'Slip ring'], 'It restricts the beam viewed by the detector array.', 'coll'],
    ['How many collimators does CT use?', ['Two', 'One', 'Three', 'None'], 'Pre-patient and post-patient.', 'coll'],

    /* ---------- III · detectors ---------- */
    ['Source-to-image distance of CT detectors in the lecture:', ['44 in.', '40 in.', '72 in.', '180 cm'], 'SID: 44 in.', 'det'],
    ['The dynamic range of a CT detector:', ['1,000,000 : 1', '1,000 : 1', '100 : 1', '10 : 1'], 'Largest signal ÷ smallest that can be told apart.', 'det'],
    ['Afterglow in CT should be:', ['Less than 0.01% at 100 ms after the beam stops', 'Less than 1% at 1 s', 'Exactly zero', 'Over 10%'], '<0.01%, 100 ms after termination, and subtracted before reconstruction.', 'det'],
    ['Capture efficiency =', ['(detected photons ÷ incident photons) × 100', '(electrical signals ÷ incident photons) × 100', '(absorbed ÷ scattered) × 100', '(signal ÷ noise) × 100'], 'Capture = detected ÷ incident.', 'det'],
    ['Conversion efficiency =', ['(total electrical signals ÷ total incident photons) × 100', '(detected ÷ incident) × 100', '(light ÷ electrons) × 100', '(mA ÷ kVp) × 100'], 'Conversion = electrical signals ÷ incident photons.', 'det'],
    ['Capture efficiency is affected by:', ['Detector area facing the beam and the distance between detectors', 'kVp and mAs', 'Matrix size', 'Window width'], 'Bigger faces and smaller gaps capture more.', 'det'],
    ['Absorption efficiency depends on the detector\'s:', ['Atomic number, physical density, size and face thickness', 'Matrix size', 'Window level', 'Pitch'], 'Those four from the slides.', 'det'],
    ['The persistence of the image after the radiation is turned off:', ['Afterglow', 'Crosstalk', 'Response time', 'Dynamic range'], 'Afterglow must be low and subtracted.', 'det'],
    ['Signal from one detector element leaking into its neighbour:', ['Crosstalk', 'Afterglow', 'Aliasing', 'Pile-up'], 'Crosstalk causes noise and lowers resolution. Spacing bars reduce it.', 'det'],
    ['How fast a detector detects an event and recovers for the next:', ['Response time', 'Dynamic range', 'Stability', 'Capture efficiency'], 'Should be very short (ms) to avoid afterglow and pile-up.', 'det'],
    ['Which detector type is more stable?', ['Gas-filled (xenon)', 'Scintillation', 'Both equally', 'Neither'], 'The slides: gas-filled detectors are more stable.', 'det'],
    ['Absorption efficiency of xenon detectors:', ['60–90%', 'Nearly 100%', '10–20%', 'Exactly 50%'], 'Low, partly from photon loss in the casing window.', 'det'],
    ['Xenon gas detectors are NOT used in:', ['4th generation and helical CT', '3rd generation CT', 'Inexpensive scanners', 'Any scanner'], 'They are highly directional, fixed and pointed at the tube.', 'det'],
    ['Xenon detector electrodes are:', ['Thin tungsten plates 1.5 mm apart', 'Copper rings 1 cm apart', 'Photodiodes', 'Spacing bars'], 'The spacing sets the display pixel size.', 'det'],
    ['Scintillation detectors are used in:', ['All helical and MSCT scanners', 'Only the original EMI scanner', 'Only 4th generation', 'No modern scanner'], 'Solid state, high Z and density.', 'det'],
    ['The part that converts the scintillator\'s light into an electrical signal:', ['Photodiode', 'Spacing bar', 'Slip ring', 'Bowtie filter'], 'The photodiode gives an analog electrical signal.', 'det'],
    ['Per the lecture, which crystal is 100% efficient but has high afterglow?', ['Sodium iodide (NaI)', 'Cadmium tungstate', 'Cesium iodide', 'Bismuth germanate'], 'NaI: 100% efficient, high afterglow. The others: ~90%, minimal afterglow.', 'det'],
    ['A highly directional detector type:', ['Xenon gas', 'Scintillation', 'Photodiode', 'All solid state'], 'Xenon detectors are fixed in position, oriented to the source.', 'det'],
    ['The desirable detector shape:', ['Deep and narrow', 'Short and wide', 'Round', 'Flat and thin'], 'Deep, narrow detectors accept less scatter.', 'det'],
    ['The correct order in a xenon detector:', ['Photon enters → gas ionized → ions accelerated and amplified → current', 'Gas ionized → photon enters → light → current', 'Photon enters → light → photodiode → current', 'Current → ions → photon'], 'The 4-step process from the slides.', 'det'],
    ['Spacing bars:', ['Separate detectors, let them sit in an arc, and avoid crosstalk', 'Increase afterglow', 'Store raw data', 'Filter low-energy photons'], 'From the slides.', 'det'],
    ['A small detector aperture gives:', ['Good spatial resolution and good scatter rejection', 'Poor spatial resolution', 'More crosstalk', 'Higher afterglow'], 'Small opening = fine detail and less scatter.', 'det'],

    /* ---------- IV · reconstruction basics ---------- */
    ['Reconstruction time with a single microprocessor:', ['30 seconds', 'Subsecond', '5 minutes', '1 millisecond'], 'Microprocessor 30 s. Array processor (multiprocessor) subsecond.', 'recon'],
    ['An array processor reconstructs in:', ['Less than a second', '30 seconds', '5 minutes', '1 hour'], 'Many processors in parallel.', 'recon'],
    ['Single source CT needs ___ for a full data set:', ['180° plus the fan/cone angle', '90° plus the fan angle', '360° exactly', '400°'], 'Dual source needs only 90°.', 'recon'],
    ['Dual source CT needs ___ for a full data set:', ['90° plus the fan/cone angle', '180°', '360°', '45°'], 'Two tubes 90° apart share the job.', 'recon'],
    ['A reconstruction algorithm is:', ['A set of rules or directions for getting a specific output from a specific input', 'A type of detector', 'A display option', 'A collimator setting'], 'Input = raw data, process = software, output = image data.', 'recon'],
    ['Which is NOT one of the three 3D MPR algorithms?', ['Filtered back projection', 'MIP', 'SSD', 'SVD'], 'FBP is a mathematical (reconstruction) algorithm.', 'recon'],
    ['The output of reconstruction is:', ['Image data', 'Raw data', 'Attenuation values', 'Ray sums'], 'raw data → computer → image data.', 'recon'],
    ['A reconstruction algorithm turns:', ['Raw data into image data', 'Image data into raw data', 'Pixels into voxels', 'Dose into HU'], 'Input = raw data, process = software (formula), output = image data.', 'recon'],

    /* ---------- IV · MPR (original bank) ---------- */
    ['Which 3D algorithm is widely used in CT angiography?', ['Maximum intensity projection', 'Shaded surface display', 'Shaded volume display', 'Helical interpolation'], 'MIP keeps the brightest value on each line, and contrast-filled vessels are some of the brightest things in the body.', 'mpr'],
    ['The simplest form of 3D imaging is:', ['MIP', 'SSD', 'SVD', 'Iterative reconstruction'], 'MIP has one rule: keep the brightest value.', 'mpr'],
    ['MIP reconstructs an image by selecting:', ['The highest value pixels along an arbitrary line', 'A narrow range of values as the object', 'Every pixel inside an operator-selected range', 'The lowest value pixels along a line'], 'Maximum intensity = highest value.', 'mpr'],
    ['Bone imaging and virtual colonoscopy are applications of:', ['Shaded surface display', 'Maximum intensity projection', 'Shaded volume display', 'Fourier transformation'], 'SSD shows the surface of whatever falls in a narrow range.', 'mpr'],
    ['Which algorithm identifies a narrow range of values as belonging to the object to be imaged?', ['SSD', 'MIP', 'SVD', 'Back projection'], 'Definition of shaded surface display, a computer-aided technique.', 'mpr'],
    ['Which 3D algorithm is very sensitive to the operator-selected pixel range?', ['Shaded volume display', 'Shaded surface display', 'Maximum intensity projection', 'Convolution'], 'SVD blends everything inside the chosen range.', 'mpr'],
    ['Which gives an image that appears very 3D (volume rendered)?', ['SVD', 'MIP', 'SSD', 'Back projection'], 'Shaded volume display.', 'mpr'],

    /* ---------- IV · back projection ---------- */
    ['Back projection is also known as:', ['Summation or linear superposition method', 'Convolution method', 'Deconvolution', 'Linear interpolation'], 'Summing all back-projected images, layered on top of each other.', 'bp'],
    ['The typical artifact of simple back projection:', ['Star pattern', 'Ring artifact', 'Stair-step artifact', 'Cupping artifact'], 'Each smeared ray leaves a spoke.', 'bp'],
    ['Back projection was described by Oldendorf (1961) and:', ['Kuhl and Edwards (1963)', 'Hounsfield and Cormack (1972)', 'Radon (1917)', 'Feldkamp and Davis (1984)'], 'Oldendorf 1961, Kuhl and Edwards 1963.', 'bp'],
    ['2 × 2 example (1, 2, 3, 4): what is subtracted from BP + P1 + P2 + P3 before dividing by 3?', ['10', '4', '3', '13'], '10 is the total of the object: 1 + 2 + 3 + 4.', 'bp'],
    ['Which reconstruction method is NOT used in clinical CT?', ['Simple back projection', 'Filtered back projection', 'Iterative reconstruction', 'Helical interpolation'], 'It does not give a sharp image.', 'bp'],

    /* ---------- IV · convolution ---------- */
    ['A convolution filter is applied to:', ['Raw data only', 'Image data only', 'Both raw and image data', 'The scanogram'], 'Raw data only, not image data.', 'conv'],
    ['Convolution is used to minimize:', ['Streak artifacts', 'Patient dose', 'Scan time', 'Matrix size'], 'A stated purpose of the convolution filter.', 'conv'],
    ['A filter that accentuates differences between neighbouring pixels gives:', ['High spatial resolution, high noise, edge enhancement for bone', 'Low noise, more blur, smoothing for soft tissue', 'Low contrast and low spatial resolution', 'No change in noise'], 'Sharpening exaggerates noise too.', 'conv'],
    ['A smoothing (soft tissue) filter results in:', ['Low noise and more blurring', 'High noise and low blurring', 'High spatial resolution', 'Edge enhancement'], 'Averaging removes grain but softens edges.', 'conv'],
    ['Returning pixel values to their original level by a reverse process:', ['Deconvolution', 'Convolution', 'Interpolation', 'Back projection'], '"De-" means undo.', 'conv'],

    /* ---------- IV · FBP, Fourier, helical, iterative ---------- */
    ['Convolution + back projection =', ['Filtered back projection', 'Iterative reconstruction', 'Fourier transformation', 'Deconvolution'], 'Filter each profile, then back project it.', 'fbp'],
    ['A disadvantage of filtered back projection:', ['Noise and streak artifacts', 'Star-like blurring', 'Requires GPUs', 'Prominent blurring from 360° interpolation'], 'FBP removes the star pattern but brings noise and streaks.', 'fbp'],
    ['Filtered back projection is also called the:', ['Convolution method', 'Summation method', 'Linear superposition method', 'Iterative method'], 'The projection profile is convolved (filtered).', 'fbp'],
    ['Fourier transformation is used to reconstruct images in:', ['MRI', 'Modern CT scanners', 'Conventional tomography', 'Ultrasound'], 'MRI, not modern CT.', 'fourier'],
    ['The analogy for Fourier transformation is the act of:', ['Hearing', 'Seeing', 'Breathing', 'Writing'], 'The ear separates sound into simple waves and the brain rebuilds it.', 'fourier'],
    ['Linear interpolation: A = 5 and C = 15. B halfway between is:', ['10', '20', '7.5', '15'], 'Halfway along a straight line from 5 to 15.', 'helical'],
    ['Helical interpolation is used to:', ['Straighten up the sectional image', 'Reduce patient dose', 'Remove the star pattern', 'Create a 3D surface'], 'It creates the missing data for a flat slice.', 'helical'],
    ['The first helical interpolation algorithm used:', ['360° linear interpolation', '180° linear interpolation', 'Iterative interpolation', 'Fourier interpolation'], 'It caused prominent blurring.', 'helical'],
    ['Helical interpolation is a ___ algorithm.', ['Post-acquisition', 'Pre-acquisition', 'Real-time display', '3D rendering'], 'Applied after the scan, to data already collected.', 'helical'],
    ['Iterative reconstruction starts by assuming that:', ['All points in the matrix have the same value', 'All points are zero', 'The topogram is correct', 'Only bone has value'], 'A flat guess, then corrections.', 'iter'],
    ['A primary advantage of iterative reconstruction:', ['Low patient dose', 'Faster reconstruction', 'Low computing requirement', 'Star pattern removal only'], 'Reduced noise and low dose are its primary advantages.', 'iter'],
    ['A disadvantage of iterative reconstruction:', ['Computationally intensive, slower reconstruction', 'More streaks from metal', 'Higher image noise', 'Cannot be used with helical data'], 'Needs GPUs and takes longer.', 'iter'],

    /* ---------- V · display ---------- */
    ['Image display is the ___ phase in creating the CT image:', ['Last', 'First', 'Second', 'Middle'], 'The last phase.', 'disp'],
    ['The component that converts digital data into electrical signals for the monitor:', ['DAC', 'ADC', 'DAS', 'PACS'], 'Digital-to-analog converter.', 'disp'],
    ['All of these are other names for the scanogram EXCEPT:', ['Reference image', 'Scout', 'Surview', 'Pilot'], 'Scanogram = localizer, scout, surview, topogram, preview, pilot. The reference image is a different display option.', 'disp'],
    ['The first image of a CT examination:', ['Scanogram', 'Reference image', 'MIP', 'Sinogram'], 'A 2D localization image with slightly poorer quality.', 'disp'],
    ['Image magnification:', ['Uses only the image data and does not improve resolution', 'Improves spatial resolution', 'Is the same as decreasing the FOV', 'Uses the raw data'], 'It is NOT the same as decreasing the FOV.', 'disp'],
    ['The region of interest is most often:', ['Circular', 'Square', 'Triangular', 'Linear'], 'It may also be elliptic, square or rectangular.', 'disp'],
    ['The standard deviation inside an ROI indicates:', ['The amount of CT number variance within the ROI', 'The mean HU', 'The ROI area', 'The slice thickness'], 'High SD = noisy or mixed tissue.', 'disp'],
    ['Distance measurement is essential for:', ['Placing a biopsy needle or drainage apparatus', 'Setting the window level', 'Choosing the kernel', 'Calibrating detectors'], 'It also reports the size of an abnormality.', 'disp'],
    ['Multiple image display is used as a method of:', ['Saving film', 'Reducing dose', 'Improving resolution', 'Removing artifacts'], 'More than one image per frame.', 'disp'],
    ['The reference image displays:', ['The slice lines at their locations on the scout image', 'The raw data', 'A 3D model', 'The ROI statistics'], 'Slice lines on the scout.', 'disp'],
    ['The grid is used by the RT to:', ['Confirm exact centering of the patient', 'Measure HU', 'Reverse the image', 'Change the matrix'], 'And by the radiologist to describe locations.', 'disp'],
    ['Reverse display:', ['Swaps left–right and black–white', 'Rotates the image 90°', 'Magnifies the image', 'Shows the previous slice'], 'Both reversals are on the slide.', 'disp'],
    ['The cursor is used for all EXCEPT:', ['Changing the slice thickness', 'Outlining the area of interest', 'Determining the HU', 'Volume estimates'], 'Slice thickness is an acquisition or reconstruction setting.', 'disp'],
    ['Image annotation adds:', ['Words, phrases, arrows and markers', 'Raw data', 'Extra dose', 'Pixels'], 'For descriptions or anatomical labels.', 'disp'],

    /* ---------- VI · image quality ---------- */
    ['The three criteria for evaluating CT image quality:', ['Spatial, low-contrast and temporal resolution', 'kVp, mAs and time', 'Pitch, matrix and FOV', 'WW, WL and ROI'], 'From the slides.', 'iq'],
    ['Which improves SPATIAL resolution?', ['Thin slice thickness', 'Thick slice thickness', 'Soft tissue filter', 'Large pixel size'], 'Thin slices reduce partial volume averaging.', 'iq'],
    ['Which improves LOW-CONTRAST resolution?', ['Increasing mAs', 'Small pixel size', 'Bone filter', 'Low pitch'], 'More photons = less noise = better contrast resolution.', 'iq'],
    ['Which improves TEMPORAL resolution?', ['Fast gantry rotation', 'Large matrix', 'Thick slices', 'Small focal spot'], 'Speed freezes motion.', 'iq'],
    ['A bone (sharp) reconstruction kernel improves:', ['Spatial resolution', 'Low-contrast resolution', 'Temporal resolution', 'Patient dose'], 'Bone filter → spatial. Soft tissue filter → low contrast.', 'iq'],
    ['A soft tissue reconstruction kernel improves:', ['Low-contrast resolution', 'Spatial resolution', 'Temporal resolution', 'Scan speed'], 'Smoothing lowers noise.', 'iq'],
    ['Small patient size improves:', ['Low-contrast resolution', 'Spatial resolution', 'Temporal resolution', 'Pitch'], 'Less tissue → more photons reach the detector → less noise.', 'iq'],
    ['Wide window width (long scale of contrast) is listed under factors for:', ['Low-contrast resolution', 'Spatial resolution', 'Temporal resolution', 'Dose reduction'], 'From the slide list.', 'iq'],
    ['Cardiac gating improves:', ['Temporal resolution', 'Spatial resolution', 'Low-contrast resolution', 'Matrix size'], 'Along with fast rotation, EBCT, dual source and contrast timing.', 'iq'],
    ['A small focal spot size improves:', ['Spatial resolution', 'Low-contrast resolution', 'Temporal resolution', 'Tube heat capacity'], 'Less geometric blur.', 'iq'],
    ['Large pixel size improves:', ['Low-contrast resolution', 'Spatial resolution', 'Temporal resolution', 'Nothing'], 'More photons per pixel = less noise (but less detail).', 'iq'],
    ['A small DFOV with a fixed matrix improves:', ['Spatial resolution', 'Low-contrast resolution', 'Temporal resolution', 'Scan speed'], 'Smaller pixels.', 'iq'],

    /* ---------- VI · uncoupling ---------- */
    ['The uncoupling effect means:', ['In digital CT the image is not directly linked to the dose', 'The tube is uncoupled from the detector', 'The couch moves independently of the gantry', 'Raw data is separated from image data'], 'More dose doesn\'t darken the image like film did.', 'unc'],
    ['When modifying the radiation dose, manipulate:', ['mAs rather than kVp', 'kVp rather than mAs', 'Pitch only', 'Window width'], 'mAs is more flexible and directly affects image quality.', 'unc'],
    ['mAs is described in the lecture as:', ['More flexible and directly affecting image quality', 'Unrelated to image quality', 'Only changing contrast', 'Fixed by the manufacturer'], 'That is why dose is adjusted with mAs.', 'unc'],

    /* ---------- VI · artifacts ---------- */
    ['An image artifact is:', ['Anything on the image that is not present in the object scanned', 'Any pathology', 'The scout image', 'Low noise'], 'Definition from the slides.', 'art'],
    ['Artifacts are classified as:', ['Physics-based, patient-based and equipment-induced', 'Small, medium and large', 'Prospective and retrospective', 'Axial and helical'], 'Three classes.', 'art'],
    ['Beam hardening is caused by:', ['The polychromatic nature of the x-ray beam', 'A faulty detector', 'Patient motion', 'Metal'], 'Low-energy photons are absorbed first.', 'art'],
    ['Beam hardening appears as:', ['Dark bands or streaks between dense objects', 'Concentric rings', 'A windmill pattern', 'Ghost outlines'], 'Commonly between the petrous bones.', 'art'],
    ['A common site of beam hardening:', ['Between the petrous bones (skull base, posterior fossa)', 'The lung apex', 'The liver dome', 'The knee'], 'Skull base, between petrous bones, posterior fossa.', 'art'],
    ['All of these correct beam hardening EXCEPT:', ['Decreasing the kVp', 'Filtering with Teflon or aluminum', 'Calibration correction', 'Beam-hardening correction software'], 'The correction is INCREASED kVp.', 'art'],
    ['Cupping artifact results from:', ['Beam hardening', 'A faulty detector', 'Motion', 'Aliasing'], 'Increased density around the periphery, like a cup.', 'art'],
    ['Partial volume artifact is caused by:', ['Thick slices, large pixels, large voxels', 'Thin slices', 'Low pitch', 'Fast rotation'], 'More than one tissue in a voxel is averaged.', 'art'],
    ['Partial volume artifact is corrected by:', ['Thin slices, small pixels, small voxels', 'Thick slices', 'Higher pitch', 'Larger voxels'], 'Smaller sampling volume.', 'art'],
    ['A pixel holds calcium (+600 HU) and lung (−600 HU). Partial volume averaging displays:', ['0 HU', '+600 HU', '−600 HU', '+1200 HU'], 'The average of +600 and −600 is 0: inaccurate.', 'art'],
    ['Aliasing results from:', ['Insufficient projection data (undersampling)', 'Too many projections', 'Metal', 'A faulty detector'], 'High pitch, too few samples, small FOV.', 'art'],
    ['Aliasing appears as:', ['Fine stripes radiating from a dense structure', 'Rings', 'Dark bands between bones', 'Ghosting'], 'Fine radiating stripes.', 'art'],
    ['All of these correct aliasing EXCEPT:', ['Increasing the pitch', 'Slowing gantry rotation', 'Increasing scan time', 'Increasing the FOV'], 'Reduce the pitch instead.', 'art'],
    ['Edge gradient effect occurs where:', ['Barium and air lie next to each other in the stomach', 'Metal is in the SFOV', 'The arms are down', 'A detector fails'], 'Largely unavoidable.', 'art'],
    ['Edge gradient effect is corrected by:', ['Thinner slices and a low-HU oral contrast such as water', 'Higher pitch', 'Raising the arms', 'Recalibration'], 'Water instead of barium removes the sharp edge.', 'art'],
    ['Motion artifact appears as:', ['Shading, ghosting, streaking, blurring', 'Concentric rings', 'A windmill', 'Fine radiating stripes'], 'Voluntary or involuntary movement.', 'art'],
    ['A manufacturer method that reduces motion artifact:', ['Cardiac gating', 'Increasing slice thickness', 'Using xenon detectors', 'Decreasing the matrix'], 'Also overscan, partial scan, software correction, β-blockers.', 'art'],
    ['Metal artifact occurs because metal:', ['Is beyond the dynamic range of the scanner', 'Is invisible to x-rays', 'Lowers the kVp', 'Causes detector afterglow'], 'Appears as streaks.', 'art'],
    ['Metal artifact is reduced by all EXCEPT:', ['Thicker slices', 'Removing metallic objects', 'Angling the gantry', 'Increasing technique'], 'Use THIN slices.', 'art'],
    ['Out-of-field artifact is classically caused by:', ['The patient\'s arms down by their sides during body imaging', 'A faulty detector', 'Barium in the stomach', 'High pitch'], 'Anatomy outside the SFOV.', 'art'],
    ['Out-of-field artifact is corrected by:', ['Raising the arms and using the largest SFOV', 'Lowering the kVp', 'Thicker slices', 'Recalibrating'], 'From the slides.', 'art'],
    ['Ring artifact is caused by:', ['Imperfect detector elements (faulty or out of calibration)', 'Patient motion', 'Beam hardening', 'Metal'], 'Correction: recalibrate or call the service engineer.', 'art'],
    ['Ring artifacts occur with which generation?', ['3rd', '4th', '5th', '1st'], 'Each element of a rotating 3rd-gen arc always sees the same distance from the center.', 'art'],
    ['Ring artifact appears as:', ['Rings centered on the rotational axis (near the isocenter)', 'Streaks from metal', 'A windmill pattern', 'Dark bands between petrous bones'], 'Concentric rings.', 'art'],
    ['Tube arcing is caused by:', ['An electrical surge in the tube, often from residual gas molecules', 'Patient motion', 'Barium', 'Low pitch'], 'High-voltage arcing (a short circuit).', 'art'],
    ['Tube arcing is corrected by:', ['Calling the service engineer', 'Raising the arms', 'Lowering the pitch', 'Thinner slices'], 'An equipment fault.', 'art'],
    ['Spiral interpolation artifact appears as:', ['Subtle inaccuracies in CT number', 'Concentric rings', 'Ghosting', 'Severe mottling'], 'From views not in the same plane. Correct with a lower pitch.', 'art'],
    ['The windmill artifact is the:', ['Cone beam effect', 'Ring artifact', 'Edge gradient effect', 'Aliasing artifact'], 'Lines in a windmill formation.', 'art'],
    ['Cone beam effect appears only on:', ['MDCT helical systems', '1st generation scanners', 'EBCT', 'Step-and-shoot single-slice scanners'], 'From the cone-shaped beam.', 'art'],
    ['Cone beam effect is corrected by:', ['The manufacturer\'s recommended pitch and a cone beam reconstruction algorithm', 'Raising the arms', 'Removing metal', 'Water as oral contrast'], 'From the slides.', 'art'],
    ['Which is an EQUIPMENT-induced artifact?', ['Ring', 'Beam hardening', 'Motion', 'Partial volume'], 'Equipment: ring, tube arcing, spiral interpolation, cone beam.', 'art'],
    ['Which is a PATIENT-based artifact?', ['Metal', 'Aliasing', 'Ring', 'Cone beam'], 'Patient: motion, metal, out-of-field.', 'art'],
    ['Which is a PHYSICS-based artifact?', ['Aliasing', 'Out-of-field', 'Tube arcing', 'Motion'], 'Physics: beam hardening, partial volume, aliasing, edge gradient.', 'art'],
  ];

  const chOf = t => Object.keys(CH).find(k => CH[k].includes(t));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- saved progress ---------- */
  let done = {};
  try { done = JSON.parse(localStorage.getItem('nrt-progress') || '{}'); } catch (e) {}
  const save = () => { try { localStorage.setItem('nrt-progress', JSON.stringify(done)); } catch (e) {} };
  function meters() {
    document.querySelectorAll('.tile[data-ch]').forEach(t => {
      const qs = BANK.filter(q => chOf(q[3]) === t.dataset.ch), n = qs.filter(q => done[q[0]]).length, p = Math.round(100 * n / qs.length);
      t.querySelector('.pct').textContent = n ? p + '%' : ''; t.querySelector('.meter i').style.width = p + '%';
    });
    const n = BANK.filter(q => done[q[0]]).length, e = document.getElementById('examInfo');
    if (e) e.textContent = `${n} of ${BANK.length} questions mastered in this browser`;
  }
  ['bankCount', 'bankCount2'].forEach(id => { const e = document.getElementById(id); if (e) e.textContent = Math.floor(BANK.length / 10) * 10; });

  /* ---------- one quiz box ---------- */
  function quiz(box, pick, mini) {
    let items, queue, results, firstTry, current;
    const mastered = () => Object.values(results).filter(v => v === true).length;
    function start() { items = pick(); queue = shuffle(items.map((_, i) => i)); results = {}; firstTry = 0; next(); }
    const track = () => `<div class="qtrack" aria-hidden="true">${items.map((_, i) => `<i class="${results[i] === true ? 'ok' : results[i] === false ? 'miss' : ''}"></i>`).join('')}</div>`;
    function next() {
      if (!queue.length) return finish();
      current = queue.shift();
      const [q, opts, why] = items[current], order = shuffle(opts.map((_, i) => i));
      box.innerHTML = `<div class="qhead"><span>${mastered()} of ${items.length} mastered</span>${track()}</div>
        <p class="qtext">${q}</p>
        <div class="qopts">${order.map((oi, n) => `<button data-i="${oi}"><b>${'ABCD'[n]}</b><span>${opts[oi]}</span></button>`).join('')}</div>
        <p class="qwhy" hidden></p><div class="stepper" hidden><button class="primary qnext">Next question</button></div>`;
      const bs = [...box.querySelectorAll('.qopts button')];
      box.dataset.answered = '0';
      bs.forEach(b => b.addEventListener('click', () => {
        if (box.dataset.answered === '1') return; box.dataset.answered = '1';
        const ok = +b.dataset.i === 0;
        bs.find(x => +x.dataset.i === 0).classList.add('right'); if (!ok) b.classList.add('wrong');
        if (ok) { if (results[current] === undefined) firstTry++; results[current] = true; done[items[current][0]] = 1; save(); meters(); }
        else { results[current] = false; queue.push(current); }
        const w = box.querySelector('.qwhy'); w.innerHTML = (ok ? '<b>Correct.</b> ' : '<b>Not this one.</b> It will come back later. ') + why; w.hidden = false;
        box.querySelector('.stepper').hidden = false; box.querySelector('.qnext').focus({ preventScroll: true });
        box.querySelector('.qhead span').textContent = `${mastered()} of ${items.length} mastered`;
        box.querySelector('.qtrack').outerHTML = track();
      }));
      box.querySelector('.qnext').addEventListener('click', next);
    }
    function finish() {
      const n = items.length, clean = firstTry === n;
      const msg = mini ? (clean ? 'All right on the first try. On to the next topic.' : 'Done. Read the board points once more, then move on.')
        : (clean ? 'Clean sweep. Try another chapter or a bigger round.' : 'The pink dots were missed at first. Revisit those topics, then start a new round.');
      box.innerHTML = `<div class="qhead"><span>All ${n} mastered</span>${track()}</div>
        <p class="qdone">${firstTry} of ${n} right on the first try</p><p class="qwhy">${msg}</p>
        <div class="stepper"><button class="${mini ? '' : 'primary '}qagain">${mini ? 'Try other questions' : 'New round'}</button></div>`;
      box.querySelector('.qagain').addEventListener('click', start);
    }
    start();
    return start;
  }

  /* quick checks after each topic */
  document.querySelectorAll('.quiz[data-topic]').forEach(box => {
    const pool = BANK.filter(q => q[3] === box.dataset.topic), n = +box.dataset.n || 3;
    if (pool.length) quiz(box, () => shuffle(pool).slice(0, n), true);
  });

  /* mock exam */
  const exam = document.getElementById('examBox');
  if (exam) {
    let chs = new Set(['all']), count = 25;
    document.querySelectorAll('#examCh button').forEach(b => b.addEventListener('click', () => {
      const c = b.dataset.c;
      if (c === 'all') chs = new Set(['all']); else { chs.delete('all'); chs.has(c) ? chs.delete(c) : chs.add(c); if (!chs.size) chs.add('all'); }
      document.querySelectorAll('#examCh button').forEach(x => x.classList.toggle('sel', chs.has(x.dataset.c)));
    }));
    U.seg('examN', 'n', v => { count = +v; });
    const pool = () => BANK.filter(q => chs.has('all') || chs.has(chOf(q[3])));
    const begin = () => quiz(exam, () => { const p = shuffle(pool()); return count ? p.slice(0, count) : p; }, false);
    document.getElementById('examStart').addEventListener('click', () => { begin(); exam.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); });
    document.getElementById('examReset').addEventListener('click', () => { if (confirm('Clear your saved progress in this browser?')) { done = {}; save(); meters(); } });
    exam.innerHTML = '<p class="qtext">Pick chapters and a length, then start a round.</p>';
  }
  meters();
})();
