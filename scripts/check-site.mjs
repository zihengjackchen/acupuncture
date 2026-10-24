import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const origin = process.env.HARMONY_TEST_URL || 'http://127.0.0.1:1313';
let server;
let browser;
const errors = [];
const checkedLinks = new Set();
const checkedFragments = new Set();
const output = path.resolve('.qa');
const coverage = JSON.parse(await fs.readFile('data/coverage.json', 'utf8'));
const testimonials = JSON.parse(await fs.readFile('data/testimonials.json', 'utf8'));
await fs.mkdir(output, { recursive: true });

async function ready() {
  try { return (await fetch(origin)).ok; } catch { return false; }
}
async function visit(page, route) {
  const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
  assert.equal(response.status(), 200, `Route ${route}`);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('main h1').count(), 1, `One h1 on ${route}`);
  const schema = await page.locator('script[type="application/ld+json"]').textContent();
  assert.ok(JSON.parse(schema)['@graph'], `Structured data on ${route}`);
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  assert.match(await page.locator('body').innerText(), /\bDan\b/, `Dan is named on ${route}`);
  assert.deepEqual(await page.locator('#main-nav a').allTextContents(), ['Our care', 'Locations & hours', 'Meet Dan', 'Your questions'], `Navigation order on ${route}`);
  assert.equal(await page.locator('.booking-cta').count(), 1, `One global booking invitation on ${route}`);
  const booking = page.locator('.booking-cta');
  assert.equal((await booking.locator('h2').innerText()).replace(/\s+/g, ' ').trim(), 'Your next step can be a gentle one.');
  assert.match(await booking.textContent(), /A little time for yourself/);
  assert.match(await booking.innerText(), /Find a time, ask a question, or simply start a conversation\./);
  if (['/team/', '/team/dr-dan-wang/'].includes(route)) {
    assert.match(await page.locator('main h1').innerText(), /Meet Dan\.\s*Feel heard\./);
    assert.match(await page.locator('.about-hero').innerText(), /Dr Dan Wang, L\.Ac\., Dipl OM/);
  }
  if (route === '/contact/') {
    assert.match(await page.locator('.first-visit').textContent(), /Before you arrive/);
    assert.deepEqual(await page.locator('.first-visit .visit-steps h3').allTextContents(), ['Confirm the details', 'Bring your questions', 'Plan together']);
  }
  if (route === '/blog/') assert.match(await page.locator('.page-hero .eyebrow').textContent(), /A little clarity/);
  if (route.startsWith('/services/')) {
    const duplicates = await page.evaluate(() => {
      const imageKey = image => new URL(image.src).pathname.replace(/-\d+(?=\.[^.]+$)/, '');
      const hero = document.querySelector('.page-hero-image');
      return hero ? [...document.querySelectorAll('.service-card-image img')].filter(image => imageKey(image) === imageKey(hero)).map(image => image.src) : [];
    });
    assert.deepEqual(duplicates, [], `Service hero does not repeat a card image on ${route}`);
  }
}

async function waitForCare(page, index) {
  await page.waitForFunction(index => {
    const items = [...document.querySelectorAll('.care-item')];
    const selected = items[index];
    const image = document.querySelector('#care-visual');
    const overlay = document.querySelector('.care-image-next');
    return selected?.open && selected.dataset.expanded === 'true'
      && items.every(item => item === selected || !item.open)
      && items.every(item => !item.style.height && !item.style.overflow)
      && image.complete && image.naturalWidth > 0
      && image.src === new URL(selected.dataset.image, location.href).href
      && Number(getComputedStyle(overlay).opacity) < .01;
  }, index, { timeout: 10000 });
}

async function waitForCardAngle(page, face) {
  await page.waitForFunction(face => {
    const card = document.querySelector('[data-card-flipper]');
    const angle = new DOMMatrixReadOnly(getComputedStyle(card).transform).m11;
    return face === 'front' ? angle > .98 : face === 'back' ? angle < -.98 : Math.abs(angle) < .9;
  }, face, { timeout: 5000 });
}

async function waitForEntrances(page) {
  await page.waitForFunction(() => [...document.querySelectorAll('.hero-enter')].every(element => !element.style.opacity));
}
async function checkTestimonials(page) {
  assert.deepEqual(await page.locator('.testimonial blockquote p').allTextContents(), testimonials.map(item => `“${item.quote}”`), 'Both original quotes are present in full');
  assert.doesNotMatch(await page.locator('.testimonials-section').innerText(), /FAKE|REAL #/i, 'No historical placeholder labels are published');
  const track = page.locator('[data-testimonials]');
  assert.ok(await track.evaluate(el => el.scrollWidth > el.clientWidth), 'Quotes form a horizontal scrolling row');
  assert.ok(await page.locator('[data-testimonial-previous]').isDisabled());
  await page.locator('[data-testimonial-next]').click();
  await page.waitForFunction(() => document.querySelector('[data-testimonial-next]').disabled);
  assert.ok(await track.evaluate(el => el.scrollLeft > 0), 'Next brings the second quote into view');
  await page.locator('[data-testimonial-previous]').focus();
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => document.querySelector('[data-testimonial-previous]').disabled);
}
async function validateLocalReferences(page, route) {
  const refs = await page.evaluate(() => [...document.querySelectorAll('a[href],img[src],script[src],link[rel="stylesheet"],link[rel="preload"]')].map(el => el.href || el.src).filter(Boolean));
  for (const ref of refs) {
    const url = new URL(ref);
    if (url.origin !== origin) continue;
    const resource = url.origin + url.pathname + url.search;
    if (!checkedLinks.has(resource)) {
      const response = await page.request.get(resource);
      assert.equal(response.status(), 200, `${route} references ${url.pathname}`);
      checkedLinks.add(resource);
    }
    if (url.hash && !checkedFragments.has(url.href)) {
      const response = await page.request.get(resource);
      const html = await response.text();
      const id = decodeURIComponent(url.hash.slice(1));
      const exists = await page.evaluate(({ html, id }) => !!new DOMParser().parseFromString(html, 'text/html').getElementById(id), { html, id });
      assert.ok(exists, `${route} anchor ${url.pathname}${url.hash}`);
      checkedFragments.add(url.href);
    }
  }
}

try {
  if (!await ready()) {
    assert.equal(origin, 'http://127.0.0.1:1313', 'Start the custom test server before running tests');
    server = spawn('hugo', ['server', '--bind', '127.0.0.1', '--port', '1313', '--disableFastRender', '--destination', '.qa/preview'], { stdio: 'ignore', windowsHide: true });
    for (let i = 0; i < 60 && !await ready(); i++) await new Promise(resolve => setTimeout(resolve, 500));
    assert.ok(await ready(), 'Hugo test server starts');
  }
  browser = await chromium.launch({ channel: process.env.HARMONY_BROWSER || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => errors.push(error.message));
  const routes = new Set(['/', '/contact/', '/services/', '/team/', '/team/dr-dan-wang/', '/blog/', '/about/', '/privacy/']);
  await visit(page, '/');
  for (const href of await page.locator('a[href]').evaluateAll(elements => elements.map(el => el.getAttribute('href')))) {
    if (href?.startsWith('/services/') || href?.startsWith('/blog/')) routes.add(href.split('#')[0]);
  }
  await visit(page, '/blog/');
  for (const href of await page.locator('.article-card a').evaluateAll(elements => elements.map(el => el.getAttribute('href')))) routes.add(href);
  await visit(page, '/services/');
  for (const href of await page.locator('.service-card a').evaluateAll(elements => elements.map(el => el.getAttribute('href')))) routes.add(href);
  for (const route of routes) {
    await visit(page, route);
    await validateLocalReferences(page, route);
  }

  await visit(page, '/');
  await checkTestimonials(page);
  assert.equal(await page.locator('.clinic-calendar [data-period="morning"] .calendar-available').count(), 1);
  assert.equal(await page.locator('.clinic-calendar [data-period="afternoon"] .calendar-available').count(), 3);
  assert.match(await page.locator('.clinic-calendar [data-period="morning"] .calendar-available').innerText(), /9 a.m.–12 p.m./);
  const sectionOrder = await page.locator('#care, #practitioner, #first-visit, #keep-in-touch, #locations, #mobile-visits').evaluateAll(nodes => nodes.map(node => node.id));
  assert.deepEqual(sectionOrder, ['care', 'practitioner', 'first-visit', 'keep-in-touch', 'locations', 'mobile-visits']);
  assert.equal(await page.locator('.harmony-seal, [data-card-toggle]').count(), 0);
  assert.equal(await page.locator('[data-landscape-toggle]').count(), 1, 'Landscape has a pause control');
  assert.equal(await page.locator('#elite-healthcare .button').getAttribute('href'), 'https://elitehcare.janeapp.com/');
  assert.equal(await page.locator('#pulling-down-the-moon .button').getAttribute('href'), 'tel:+18477860066');
  assert.match(await page.locator('#pulling-down-the-moon').innerText(), /provisional/i);

  await page.locator('.care-item').nth(1).locator('summary').click();
  assert.ok(await page.locator('.care-item').nth(1).evaluate(el => !!el.style.height), 'Accordion animates height');
  await page.waitForFunction(() => Number(getComputedStyle(document.querySelector('.care-image-next')).opacity) > 0);
  await waitForCare(page, 1);
  assert.equal(await page.locator('.care-item[open]').count(), 1);
  // Dispatch the next requests before their transitions finish to exercise cancellation.
  for (const index of [2, 4, 3]) {
    await page.locator('.care-item').nth(index).locator('summary').evaluate(element => element.click());
  }
  await waitForCare(page, 3);
  assert.equal(await page.locator('.care-item[open]').count(), 1, 'Rapid accordion input leaves one open item');

  const zip = page.locator('#coverage-zip');
  assert.ok(coverage.records.every(record => record.coverage === 'full'), 'Every selected ZIP has whole-region coverage');
  const wholeRegions = await page.locator('.coverage-svg').evaluate(svg => {
    const box = svg.viewBox.baseVal;
    return [...svg.querySelectorAll('.coverage-region')].map(region => {
      const bounds = region.getBBox();
      const original = svg.querySelector(`[data-context-zip="${region.dataset.zip}"]`);
      return {
        zip: region.dataset.zip,
        complete: region.getAttribute('d') === original?.getAttribute('d'),
        withinView: bounds.x >= box.x && bounds.y >= box.y && bounds.x + bounds.width <= box.x + box.width && bounds.y + bounds.height <= box.y + box.height,
      };
    });
  });
  assert.equal(wholeRegions.length, coverage.total);
  assert.ok(wholeRegions.every(region => region.complete && region.withinView), 'Complete original ZIP shapes fit the initial viewport');
  assert.equal(await page.locator('.coverage-svg .coverage-perimeter, .coverage-svg [stroke-dasharray]').count(), 0, 'Map has no outer dashed boundary');
  for (const code of ['60540', '60462', '60614', '60035', '60193', '60120', '46394', '90210']) {
    await zip.fill(code);
    await page.locator('[data-coverage-form] button').click();
    await page.waitForFunction(code => document.querySelector('#coverage-result').textContent.includes(code), code);
    const result = await page.locator('#coverage-result').innerText();
    const record = coverage.records.find(record => record.zip === code);
    if (code === '90210') {
      assert.match(result, /outside|cannot confirm coverage|not.*service|not.*listed/i, `Unknown ZIP ${code} is not accepted`);
      assert.equal(await page.locator('.coverage-region.is-selected').count(), 0, 'Unknown ZIP selects no polygon');
    } else {
      assert.ok(record, `Anchor ZIP ${code} is represented`);
      assert.match(result, /accepts|accepted|service area|covered|call to confirm/i, `ZIP ${code}`);
      assert.match(result, /throughout this ZIP area/i, `ZIP ${code} is covered in full`);
      assert.doesNotMatch(result, /part of this ZIP|partly covered|partial|only the green portion/i, `ZIP ${code} has no obsolete partial-coverage message`);
      if (record.mapped) assert.equal(await page.locator(`.coverage-region[data-zip="${code}"].is-selected`).count(), 1, `ZIP ${code} highlights its covered geometry`);
    }
  }
  assert.equal(await page.locator('[data-coverage-zip]').count(), coverage.total);
  await page.locator('[data-coverage-reset]').click();

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => scrollY < 1);
  const card = await page.locator('[data-card-pin]').evaluate(el => ({ start: el.getBoundingClientRect().top + scrollY - Math.max(document.querySelector('.site-header').offsetHeight + 20, (innerHeight - el.offsetHeight) / 2), distance: Math.round(innerHeight * 1.15) }));
  await page.evaluate(y => window.scrollTo(0, y), card.start + card.distance * .05);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('[data-card-pin]')).position === 'fixed');
  await waitForCardAngle(page, 'front');
  const pinnedTop = (await page.locator('[data-card-pin]').boundingBox()).y;
  await page.evaluate(y => window.scrollTo(0, y), card.start + card.distance * .5);
  await waitForCardAngle(page, 'middle');
  assert.ok(Math.abs((await page.locator('[data-card-pin]').boundingBox()).y - pinnedTop) < 2, 'Card composition stays pinned during turn');
  await page.evaluate(y => window.scrollTo(0, y), card.start + card.distance * .96);
  await waitForCardAngle(page, 'back');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => !document.querySelector('.namecard-stage.is-animated') && !document.querySelector('.pin-spacer'));
  assert.equal(await page.locator('.namecard-stage.is-animated').count(), 0);
  assert.equal(await page.locator('.pin-spacer').count(), 0, 'Reduced motion removes pin spacing');
  assert.ok(await page.locator('[data-card-flipper]').evaluate(el => { const value = getComputedStyle(el).transform; return value === 'none' || new DOMMatrixReadOnly(value).isIdentity; }), 'Reduced motion leaves both card faces unrotated');
  assert.equal(await page.locator('.namecard-front').isVisible(), true);
  assert.equal(await page.locator('.namecard-back').isVisible(), true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/', '/contact/', '/services/', '/team/', '/blog/']) {
      await visit(page, route);
      const measured = await page.evaluate(() => ({ viewport: innerWidth, content: document.documentElement.scrollWidth }));
      assert.ok(measured.content <= measured.viewport + 1, `No horizontal overflow on ${route} at ${width}: ${measured.content}`);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await visit(page, '/');
  await checkTestimonials(page);
  assert.equal(await page.locator('#main-nav').isVisible(), false);
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('#main-nav').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#main-nav').isVisible(), false);
  await page.locator('.menu-toggle').blur();
  await waitForEntrances(page);
  await page.screenshot({ path: path.join(output, 'home-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/');
  await waitForEntrances(page);
  await page.screenshot({ path: path.join(output, 'home-desktop.png') });
  // Trigger entrances before taking the long-page reference, then return to the top.
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 850) {
    await page.evaluate(y => new Promise(resolve => {
      window.scrollTo(0, y);
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }), y);
  }
  await page.waitForFunction(() => [...document.querySelectorAll('[data-reveal], [data-booking-reveal] > *')].every(element => !element.style.opacity || Number(element.style.opacity) > .99));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForFunction(() => scrollY < 1);
  await page.screenshot({ path: path.join(output, 'home-full.png'), fullPage: true });

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await visit(reduced, '/');
  await checkTestimonials(reduced);
  assert.equal(await reduced.locator('.namecard-stage.is-animated').count(), 0);
  assert.equal(await reduced.locator('[data-card-hint]').isVisible(), false);
  assert.equal(await reduced.locator('[data-landscape-toggle]').isVisible(), false);
  assert.equal(await reduced.locator('.namecard-front').isVisible(), true);
  assert.equal(await reduced.locator('.namecard-back').isVisible(), true);
  await reduced.locator('.care-item').nth(1).locator('summary').click();
  await waitForCare(reduced, 1);
  assert.equal(await reduced.locator('.care-item[open]').count(), 1);
  await reduced.close();

  const plain = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await plain.goto(origin, { waitUntil: 'networkidle' });
  await plain.bringToFront();
  assert.deepEqual(await plain.locator('.testimonial blockquote p').allTextContents(), testimonials.map(item => `“${item.quote}”`), 'Quotes remain available without JavaScript');
  assert.equal(await plain.locator('[data-testimonial-controls]').isVisible(), false);
  await plain.locator('[data-testimonials]').scrollIntoViewIfNeeded();
  await plain.locator('[data-testimonials]').focus();
  await plain.keyboard.press('ArrowRight');
  // Poll from Node: page animation-frame polling is disabled along with JavaScript.
  for (let attempt = 0; attempt < 100 && await plain.locator('[data-testimonials]').evaluate(el => el.scrollLeft === 0); attempt++) {
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  assert.ok(await plain.locator('[data-testimonials]').evaluate(el => el.scrollLeft > 0), 'Native keyboard scrolling works without JavaScript');
  assert.equal(await plain.locator('#main-nav').isVisible(), true);
  assert.equal(await plain.locator('.menu-toggle').isVisible(), false);
  const navBottom = (await plain.locator('#main-nav').boundingBox()).y + (await plain.locator('#main-nav').boundingBox()).height;
  const heroTop = (await plain.locator('h1').boundingBox()).y;
  assert.ok(heroTop > navBottom, 'No-JS mobile navigation stays above hero');
  assert.equal(await plain.locator('.namecard-front').isVisible(), true);
  assert.equal(await plain.locator('.namecard-back').isVisible(), true);
  assert.equal(await plain.locator('.harmony-landscape__fallback').isVisible(), true);
  assert.equal(await plain.locator('[data-landscape-toggle]').isVisible(), false);
  assert.equal(await plain.locator('[data-coverage-form]').isVisible(), false);
  await plain.close();
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  console.log(`PASS: ${routes.size} routes, ${checkedLinks.size} local references, ${checkedFragments.size} anchors, revised navigation/copy, one global booking invitation, distinct service hero imagery, ${coverage.total} whole-region ZIP records, animated accordion, pinned card, responsive layouts, reduced motion, and no-JS fallback.`);
  console.log(`Screenshots: ${output}`);
} finally {
  await browser?.close();
  server?.kill();
}
