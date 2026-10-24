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

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const testimonials = document.querySelector('[data-testimonials]');
if (testimonials) {
  const previous = document.querySelector('[data-testimonial-previous]');
  const next = document.querySelector('[data-testimonial-next]');
  const updateControls = () => {
    previous.disabled = testimonials.scrollLeft <= 1;
    next.disabled = testimonials.scrollLeft + testimonials.clientWidth >= testimonials.scrollWidth - 1;
  };
  const scrollQuote = direction => {
    const gap = parseFloat(getComputedStyle(testimonials).columnGap) || 0;
    testimonials.scrollBy({ left: direction * (testimonials.firstElementChild.offsetWidth + gap), behavior: reducedMotion.matches ? 'instant' : 'smooth' });
  };
  previous.addEventListener('click', () => scrollQuote(-1));
  next.addEventListener('click', () => scrollQuote(1));
  testimonials.addEventListener('scroll', updateControls, { passive: true });
  new ResizeObserver(updateControls).observe(testimonials);
  document.querySelector('[data-testimonial-controls]').hidden = false;
  updateControls();
}
const careItems = [...document.querySelectorAll('[data-care-item]')];
const careImage = document.querySelector('#care-visual');
const nextImage = document.querySelector('.care-image-next');
let imageRequest = 0;

async function showCareImage(item) {
  if (!careImage || !nextImage) return;
  const request = ++imageRequest;
  const preload = new Image();
  preload.src = item.dataset.image;
  try { await preload.decode(); } catch { return; }
  if (request !== imageRequest) return;
  gsap.killTweensOf(nextImage);
  if (reducedMotion.matches) {
    careImage.src = item.dataset.image;
    careImage.alt = item.dataset.alt;
    gsap.set(nextImage, { opacity: 0 });
    return;
  }
  nextImage.src = preload.src;
  gsap.fromTo(nextImage, { opacity: 0 }, { opacity: 1, duration: .9, ease: 'power1.inOut', onComplete: () => {
    careImage.src = item.dataset.image;
    careImage.alt = item.dataset.alt;
    gsap.set(nextImage, { opacity: 0 });
  } });
}

function setCareOpen(item, open, instant = false) {
  const startHeight = item.getBoundingClientRect().height;
  const summary = item.querySelector('summary');
  const body = item.querySelector('.care-description');
  gsap.killTweensOf(item);
  item.dataset.expanded = String(open);
  summary.setAttribute('aria-expanded', String(open));
  body.inert = !open;
  if (instant || reducedMotion.matches) {
    item.open = open;
    gsap.set(item, { clearProps: 'height,overflow' });
    return;
  }
  item.open = true;
  item.style.height = 'auto';
  const endHeight = open ? item.getBoundingClientRect().height : summary.getBoundingClientRect().height + 1;
  gsap.fromTo(item, { height: startHeight, overflow: 'hidden' }, { height: endHeight, duration: .7, ease: 'power2.inOut', onComplete: () => {
    item.open = open;
    gsap.set(item, { clearProps: 'height,overflow' });
    ScrollTrigger.refresh();
  } });
}

careItems.forEach(item => {
  item.dataset.expanded = String(item.open);
  item.querySelector('summary').addEventListener('click', event => {
    event.preventDefault();
    const open = item.dataset.expanded !== 'true';
    careItems.forEach(other => {
      if (other === item) setCareOpen(item, open);
      else if (other.dataset.expanded === 'true') setCareOpen(other, false);
    });
    if (open) showCareImage(item);
  });
});
reducedMotion.addEventListener('change', () => {
  careItems.forEach(item => setCareOpen(item, item.dataset.expanded === 'true', true));
  const selected = careItems.find(item => item.dataset.expanded === 'true');
  if (selected) showCareImage(selected);
});

const media = gsap.matchMedia();
media.add('(prefers-reduced-motion: no-preference)', () => {
  const entrance = gsap.from('.hero-enter', { y: 24, opacity: 0, stagger: .14, duration: 1.3, ease: 'power2.out', clearProps: 'all' });
  document.querySelectorAll('.hero-enter').forEach(element => element.addEventListener('focusin', () => entrance.progress(1), { once: true }));
  document.querySelectorAll('[data-reveal]').forEach(element => {
    const reveal = gsap.from(element, { y: 28, opacity: 0, duration: 1.25, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: element, start: 'top 94%', once: true } });
    element.addEventListener('focusin', () => {
      reveal.progress(1);
      reveal.scrollTrigger?.kill();
      gsap.set(element, { clearProps: 'opacity,visibility,transform' });
    }, { once: true });
  });
  const booking = document.querySelector('[data-booking-reveal]');
  if (booking) {
    const invitation = gsap.from(booking.children, { y: 26, opacity: 0, duration: 1.4, stagger: .16, ease: 'power2.out', clearProps: 'all', scrollTrigger: { trigger: booking, start: 'top 88%', once: true } });
    booking.addEventListener('focusin', () => invitation.progress(1), { once: true });
  }
  const stage = document.querySelector('[data-card-stage]');
  if (!stage) return;
  const pin = document.querySelector('[data-card-pin]');
  const flipper = stage.querySelector('[data-card-flipper]');
  const hint = stage.querySelector('[data-card-hint]');
  stage.classList.add('is-animated');
  flipper.setAttribute('aria-hidden', 'true');
  hint.hidden = false;
  // Native scrolling pins the composition, holds each face, and turns the card between them.
  gsap.timeline({ scrollTrigger: {
    id: 'business-card',
    trigger: pin,
    start: () => 'top ' + Math.max(header.offsetHeight + 20, (innerHeight - pin.offsetHeight) / 2),
    end: () => '+=' + Math.round(innerHeight * 1.15),
    pin,
    scrub: .8,
    anticipatePin: 1,
    invalidateOnRefresh: true
  } })
    .to(flipper, { rotationY: 0, duration: .25 })
    .to(flipper, { rotationY: 180, duration: 1, ease: 'power1.inOut' })
    .to(flipper, { rotationY: 180, duration: .3 });
  return () => {
    stage.classList.remove('is-animated');
    flipper.removeAttribute('aria-hidden');
    hint.hidden = true;
  };
});

document.fonts?.ready.then(() => ScrollTrigger.refresh());
document.querySelectorAll('img[loading="lazy"]').forEach(img => img.addEventListener('load', () => ScrollTrigger.refresh(), { once: true }));
window.addEventListener('pageshow', () => { markToday(); ScrollTrigger.refresh(); });
