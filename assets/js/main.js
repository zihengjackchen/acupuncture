import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const nav = document.querySelector('#main-nav');
if (menuButton && nav) {
  header.classList.add('nav-ready');
  const closeMenu = () => { menuButton.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!header.contains(event.target)) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', closeMenu);
}

function markToday() {
  const day = new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Chicago' }).format(new Date());
  document.querySelectorAll('[data-day]').forEach(cell => {
    const today = cell.dataset.day === day;
    cell.classList.toggle('is-today', today);
    cell.querySelector('.today-label').hidden = !today;
  });
}
markToday();
document.addEventListener('visibilitychange', () => { if (!document.hidden) markToday(); });

const careItems = [...document.querySelectorAll('[data-care-item]')];
const careImage = document.querySelector('#care-visual');
careItems.forEach(item => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    careItems.forEach(other => { if (other !== item) other.open = false; });
    if (careImage) { careImage.src = item.dataset.image; careImage.alt = item.dataset.alt; }
    ScrollTrigger.refresh();
  });
});

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  gsap.from('.hero-enter', { y: 18, autoAlpha: 0, stagger: .11, duration: .85, ease: 'power2.out', clearProps: 'all' });
  document.querySelectorAll('[data-reveal]').forEach(element => {
    const reveal = gsap.from(element, { y: 22, opacity: 0, duration: .75, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 93%', once: true } });
    element.addEventListener('focusin', () => {
      reveal.progress(1);
      reveal.scrollTrigger?.kill();
      gsap.set(element, { clearProps: 'opacity,visibility,transform' });
    }, { once: true });
  });
  const stage = document.querySelector('[data-card-stage]');
  if (!stage) return;
  const flipper = stage.querySelector('[data-card-flipper]');
  const controls = stage.querySelector('[data-card-controls]');
  const button = stage.querySelector('[data-card-toggle]');
  const status = stage.querySelector('[data-card-status]');
  const hint = stage.querySelector('[data-card-hint]');
  stage.classList.add('card-interactive');
  controls.hidden = false;
  let flipped = false;
  let manual = false;
  const updateSide = back => {
    flipped = back;
    button.setAttribute('aria-label', back ? 'Show front of business card' : 'Show back of business card');
  };
  // A scroll-triggered turn settles on a readable face, even when scrolling stops.
  const timeline = gsap.timeline({ scrollTrigger: { trigger: stage, start: 'top 42%', toggleActions: 'play none none reverse', invalidateOnRefresh: true } });
  timeline.to(flipper, { rotationY: 180, ease: 'power2.inOut', duration: 1.15, onUpdate: () => { if (!manual) updateSide(Number(gsap.getProperty(flipper, 'rotationY')) > 90); } });
  const flip = () => {
    manual = true;
    timeline.scrollTrigger?.kill();
    timeline.kill();
    updateSide(!flipped);
    hint.textContent = flipped ? 'The back of your card' : 'The front of your card';
    gsap.to(flipper, { rotationY: flipped ? 180 : 0, duration: .85, ease: 'power2.inOut', overwrite: true });
    status.textContent = flipped ? 'Back of the business card shown.' : 'Front of the business card shown.';
  };
  button.addEventListener('click', flip);
  return () => {
    button.removeEventListener('click', flip);
    controls.hidden = true;
    stage.classList.remove('card-interactive');
    gsap.killTweensOf(flipper);
    gsap.set(flipper, { clearProps: 'all' });
  };
});

// Keep scroll positions accurate after fonts, native accordions, and lazy images settle.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
document.querySelectorAll('img[loading="lazy"]').forEach(img => img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
document.querySelectorAll('.faq-list details').forEach(item => item.addEventListener('toggle', () => ScrollTrigger.refresh()));
window.addEventListener('pageshow', () => { markToday(); ScrollTrigger.refresh(); });
