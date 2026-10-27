# NerdRadTech: visual CT review

An interactive RTLE review of the whole Cluster 5 Computed Tomography lecture (Asst. Prof. Meynard Y. Castro, RRT, MSRT). Every topic in the 310 slides has its own visual or lab, a quick check at the end, and there is a mock board exam and a printable summary.

## What's inside

| Chapter | Topics | Labs and visuals |
|---------|--------|------------------|
| I · Overview | Definition, evolution of terms, advantages and disadvantages, CT processes, windowing, storage and communication | Raisin bread slicer, step-and-shoot vs helical, six-step pipeline, prospective vs retrospective reconstruction, windowing lab with a WW/WL drill |
| II · Physical principles | Slice axes and miscentering, pixel, voxel, matrix, FOV, attenuation and µ, HU, ray / projection / translation | Laser centering, partial volume, matrix × FOV, DFOV vs SFOV, photons through tissue, HU ruler and calculator, 3 × 3 ray sums |
| III · Data acquisition | Generations 1–7, helical CT and pitch, MSCT, slip rings, gantry / generator / tube / filter / couch, collimation, detectors | Animated generations, pitch bands, MSCT binning, cable vs slip ring, **3D gantry explorer** (three.js), collimator profiles, detector designer, xenon vs scintillation step-through |
| IV · Image reconstruction | Basics, MIP / SSD / SVD, back projection, convolution, FBP, Fourier, helical interpolation, iterative | 3D volume renderer with ray probe, 2 × 2 worked examples, filter profiles, dot BP vs FBP, waves with sound, interpolation, scanner bench |
| V · Image display | DAC and the 13 display options | A working CT workstation: scout + reference lines, cursor HU, ROI mean/SD, distance, annotation, grid, magnification vs smaller DFOV, reverse, multiple images |
| VI · Image quality and artifacts | Spatial / low-contrast / temporal resolution, factors, uncoupling effect, all 12 artifacts | Factor sorting game, "tune the scan" lesion lab, simulated artifact gallery with before/after wipe, spot-the-artifact |
| Mock exam | About 260 board-style questions | Pick chapters and length. Missed questions repeat. Progress is saved in the browser and shown on the chapter tiles |
| Summary + Words to know | One card per topic, glossary | Print button prints only these two |

Facts that go beyond the slides (pixel-size and HU formulas) are tagged "beyond the slides".

## Open it

- **On your computer:** double-click `index.html`. No install, no build step.
- **Online:** upload the whole folder to any static host (GitHub Pages, Netlify Drop).

Fonts and three.js load from CDNs. Without internet the page still works with fallback fonts, but the two 3D gantry views are replaced by a short note.

## Files

```
index.html          page content
css/main.css        design system (light: lavender + orange, dark: charcoal + pastels)
js/util.js          shared helpers, theme toggle, scroll reveal, glossary popup
js/phantom.js       simulated patient in HU (chest to abdomen, head); slices, scout, ROI, kernels
js/hero.js          the live O's in the headline
js/gantry3d.js      three.js gantry used by the hero and the Chapter III explorer
js/overview.js      Chapter I labs
js/principles.js    Chapter II labs
js/acquisition.js   Chapter III labs
js/volume.js        Chapter IV: MIP, SSD, SVD renderer and ray probe
js/matrix.js        Chapter IV: 2 × 2 back projection and iterative examples
js/labs.js          Chapter IV: convolution, dot BP vs FBP, Fourier, helical interpolation
js/scanner.js       Chapter IV: scanner bench (projection, BP, FBP, SIRT)
js/display.js       Chapter V workstation
js/quality.js       Chapter VI: sorter, trade-off lab, artifact simulations, spot the artifact
js/quiz.js          question bank, quick checks, mock exam, saved progress
assets/favicon.svg
```

All images are simulations made for teaching, not patient data. The lecture PDF itself is not part of the site.
