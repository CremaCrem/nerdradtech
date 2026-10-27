# NerdRadTech: CT algorithms review

An interactive RTLE review page for Cluster 5, Computed Tomography (Asst. Prof. Meynard Y. Castro, RRT, MSRT).

## What's inside

| Part | Topic | Interactive |
|------|-------|-------------|
| Start | Basics | How CT works in plain words, the HU scale, and "Words to know" (a glossary). Dotted-underlined words anywhere on the page open their definition |
| A | Three 3D MPR algorithms: MIP, SSD, SVD | Simulated abdominal CT volume you can rotate, operator-selected HU range, and a ray probe that shows the HU values along one line of sight and what each algorithm does with them |
| B | Mathematical algorithms | The lecture's 2 × 2 back projection example; convolution profile; star pattern vs FBP; Fourier waves with sound; helical 360° linear interpolation; iterative 2 × 2 example; and at the end a guided scanner bench (gantry, sinogram, reconstruction) comparing all methods with smoothing/edge filters and low dose |
| C | Self-check | 31 board-style questions, missed ones repeat. Each topic also ends with a 2–3 question quick check |
| D | Last-minute summary | Board facts per topic. The print button prints the summary and the glossary only |

## Open it

- **On your computer:** double-click `index.html`. No install, no build step.
- **Online:** upload the whole folder to any static host (GitHub Pages, Netlify Drop).

Fonts load from Google Fonts. Without internet the site still works with fallback fonts.

## Files

```
index.html        page content
css/main.css      styles (light and dark)
js/util.js        shared helpers, glossary popup
js/volume.js      Part A 3D renderer (MIP, SSD, SVD) and ray probe
js/scanner.js     scanner bench: projection, BP, FBP, iterative (SIRT)
js/matrix.js      2 × 2 worked examples (back projection, iterative)
js/labs.js        convolution, dot BP vs FBP, Fourier, helical interpolation
js/quiz.js        question bank, quick checks and self-check
assets/favicon.svg
```

All images are simulations made for teaching, not patient data.
