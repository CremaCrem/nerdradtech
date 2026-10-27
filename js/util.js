/* Shared helpers */
window.U = (() => {
  const $ = (id) => document.getElementById(id);
  const css = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Size a canvas to its displayed width for crisp drawing. Returns {ctx,w,h} in CSS pixels. */
  function hiDPI(cv, aspect) {
    const r = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth || cv.width;
    const h = aspect ? w * aspect : (cv.clientHeight || cv.height);
    if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) {
      cv.width = Math.round(w * r); cv.height = Math.round(h * r);
    }
    const ctx = cv.getContext('2d');
    ctx.setTransform(r, 0, 0, r, 0, 0);
    return { ctx, w, h };
  }

  /* Seeded random numbers so "low dose" noise looks the same every run */
  function rng(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  }
  function gauss(rand) { let u = 0, v = 0; while (!u) u = rand(); while (!v) v = rand(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

  /* Segmented button group: calls fn(value) and keeps aria-pressed in sync */
  function seg(groupId, attr, fn) {
    const g = $(groupId); const bs = [...g.querySelectorAll('button')];
    bs.forEach(b => b.addEventListener('click', () => {
      bs.forEach(x => x.setAttribute('aria-pressed', x === b)); fn(b.dataset[attr]);
    }));
  }

  /* Re-run a draw function when the colour theme changes or the window resizes */
  const redraws = [];
  function onRedraw(fn) { redraws.push(fn); }
  let rt; const fire = () => { clearTimeout(rt); rt = setTimeout(() => redraws.forEach(f => f()), 120); };
  addEventListener('resize', fire);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', fire);
  new MutationObserver(fire).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

  return { $, css, reduced, hiDPI, rng, gauss, seg, onRedraw };
})();

/* Tapping a .term link shows its glossary entry in a popup instead of jumping away.
   Without popover support the link still jumps to the glossary. */
(() => {
  const pop = document.getElementById('gpop');
  if (!pop || !pop.showPopover) return;
  document.addEventListener('click', e => {
    const a = e.target.closest('a.term');
    const open = pop.matches(':popover-open');
    if (!a) { if (open && e.target.closest('.gpop-all')) pop.hidePopover(); return; }
    const dt = document.querySelector(a.getAttribute('href'));
    if (!dt) return;
    e.preventDefault();
    pop.querySelector('.gpop-t').textContent = dt.textContent;
    pop.querySelector('.gpop-d').innerHTML = dt.nextElementSibling.innerHTML;
    if (!open) pop.showPopover();
  });
})();
