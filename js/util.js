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

  /* Call fn(true/false) as an element scrolls in and out of view, so animations only run when seen */
  function visible(el, fn) {
    if (!('IntersectionObserver' in window)) return fn(true);
    new IntersectionObserver(es => es.forEach(e => fn(e.isIntersecting)), { rootMargin: '80px' }).observe(el);
  }

  /* A requestAnimationFrame loop that only runs while its element is on screen and motion is allowed */
  function loop(el, frame) {
    let on = false, raf = 0, last = 0;
    const step = t => { raf = requestAnimationFrame(step); frame(t, Math.min(0.05, (t - (last || t)) / 1000)); last = t; };
    visible(el, v => { on = v && !reduced(); cancelAnimationFrame(raf); last = 0; if (on) raf = requestAnimationFrame(step); else frame(performance.now(), 0); });
  }

  return { $, css, reduced, hiDPI, rng, gauss, seg, onRedraw, visible, loop };
})();

/* Theme toggle (remembered per browser), scroll reveal, chapter tile arrows */
(() => {
  const root = document.documentElement, btn = document.getElementById('themeBtn');
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  btn && btn.addEventListener('click', () => {
    root.dataset.theme = dark() ? 'light' : 'dark';
    try { localStorage.setItem('nrt-theme', root.dataset.theme); } catch (e) {}
  });
  const els = document.querySelectorAll('.topic, .lab, .card, .board, .tip, .check, .sumgrid > div');
  if ('IntersectionObserver' in window && !U.reduced()) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    els.forEach(el => { el.classList.add('rv'); io.observe(el); });
  }
  const tr = document.getElementById('tileTrack');
  if (tr) {
    document.getElementById('tilePrev').addEventListener('click', () => tr.scrollBy({ left: -tr.clientWidth * 0.7, behavior: 'smooth' }));
    document.getElementById('tileNext').addEventListener('click', () => tr.scrollBy({ left: tr.clientWidth * 0.7, behavior: 'smooth' }));
  }
  document.querySelectorAll('.menu-list a').forEach(a => a.addEventListener('click', () => a.closest('details').open = false));
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
