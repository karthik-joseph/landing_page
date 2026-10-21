document.addEventListener('DOMContentLoaded', (e) => {
  'use strict';
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Image placeholder 
  $$('img').forEach(img => {
    const flag = () => img.classList.add('is-missing');
    img.addEventListener('error', flag);
    if (img.complete && img.naturalWidth === 0 && img.currentSrc) flag();
  });

  /* Navbar */
  const burger = $('.burger'), menu = $('#menu'), links = $$('a', menu);
  const toggleMenu = open => {
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  burger.addEventListener('click', () => toggleMenu(!menu.classList.contains('open')));
  menu.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a) return;
    links.forEach(l => l.classList.toggle('active', l === a));
    toggleMenu(false);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggleMenu(false); });
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) toggleMenu(false); });

  /* Scroll: active nav + collage (one rAF-throttled handler) */
  const sections = ['top', 'services', 'visit', 'contact'].map(id => document.getElementById(id));
  const collage = $('#collage');
  let ticking = false;

  function onScroll() {
    ticking = false;
    const vh = innerHeight;
    let cur = sections[0].id;
    sections.forEach(s => { if (s.getBoundingClientRect().top <= vh * 0.4) cur = s.id; });
    if (vh + scrollY >= document.documentElement.scrollHeight - 4) cur = 'contact';
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur));

    const top = collage.getBoundingClientRect().top;
    const p = reduceMotion ? 1 : Math.min(1, Math.max(0, (vh * 0.9 - top) / (vh * 0.5)));
    collage.style.setProperty('--p', p.toFixed(3));
  }
  const requestTick = () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', requestTick, { passive: true });
  addEventListener('resize', requestTick, { passive: true });

  /* Product slider */
  const vp = $('#vp'), track = $('#track'), slides = $$('.sl', track);
  const prev = $('#prev'), next = $('#next'), count = $('#count');
  let index = 0, startX = null;

  function go(i) {
    index = Math.max(0, Math.min(slides.length - 1, i));
    const el = slides[index];
    const x = vp.clientWidth / 2 - (el.offsetLeft + el.offsetWidth / 2);
    track.style.transform = `translate3d(${x}px,0,0)`;
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === index);
      s.setAttribute('aria-current', k === index);
      s.setAttribute('aria-label', `${k + 1} of ${slides.length}`);
    });
    prev.disabled = index === 0;
    next.disabled = index === slides.length - 1;
    count.textContent = `${index + 1} / ${slides.length}`;
  }

  track.addEventListener('click', e => {
    const s = e.target.closest('.sl');
    if (s) go(slides.indexOf(s));
  });
  
  prev.addEventListener('click', () => go(index - 1));
  next.addEventListener('click', () => go(index + 1));
  vp.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') go(index + 1);
    if (e.key === 'ArrowLeft') go(index - 1);
  });
  vp.addEventListener('pointerdown', e => { startX = e.clientX; });
  vp.addEventListener('pointerup', e => {
    if (startX !== null && Math.abs(e.clientX - startX) > 40) go(index + (e.clientX < startX ? 1 : -1));
    startX = null;
  });
  vp.addEventListener('pointercancel', () => { startX = null; });

  /* Re-centre when the viewport size changes (debounced) */
  let t;
  const recentre = () => { clearTimeout(t); t = setTimeout(() => go(index), 120); };
  'ResizeObserver' in window ? new ResizeObserver(recentre).observe(vp) : addEventListener('resize', recentre);
  addEventListener('load', () => go(index));

  go(0);
  onScroll();
})