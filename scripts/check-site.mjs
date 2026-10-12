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
  assert.equal(await page.locator('.schedule-day.has-clinic').count(), 3);
  assert.equal(await page.locator('#elite-healthcare .button').getAttribute('href'), 'https://elitehcare.janeapp.com/');
  assert.equal(await page.locator('#pulling-down-the-moon .button').getAttribute('href'), 'tel:+18477860066');
  assert.match(await page.locator('#pulling-down-the-moon').innerText(), /provisional/i);

  await page.locator('.care-item').nth(1).locator('summary').click();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('.care-item[open]').count(), 1);
  assert.match(await page.locator('#care-visual').getAttribute('src'), /womens-health/);

  const zip = page.locator('#coverage-zip');
  for (const [code, pattern] of [['60035', /within|available|accepted|service area/i], ['60006', /no matching|not.*polygon|not.*map|no.*polygon/i], ['90210', /outside|not.*service|not.*listed/i]]) {
    await zip.fill(code);
    await page.locator('[data-coverage-form] button').click();
    await page.waitForTimeout(200);
    assert.match(await page.locator('#coverage-result').innerText(), pattern, `ZIP ${code}`);
  }
  assert.equal(await page.locator('[data-coverage-zip]').count(), 263);
  await page.locator('[data-coverage-reset]').click();

  await page.locator('[data-card-toggle]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(1300);
  const angle = await page.locator('[data-card-flipper]').evaluate(el => new DOMMatrixReadOnly(getComputedStyle(el).transform).m11);
  assert.ok(Math.abs(angle) > .98, 'Card settles on a readable face after scrolling stops');
  const previousLabel = await page.locator('[data-card-toggle]').getAttribute('aria-label');
  await page.locator('[data-card-toggle]').click();
  await page.waitForTimeout(1000);
  assert.notEqual(await page.locator('[data-card-toggle]').getAttribute('aria-label'), previousLabel);
  await page.locator('[data-card-toggle]').click();
  await page.waitForTimeout(150);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.card-interactive').count(), 0);
  assert.equal(await page.locator('[data-card-flipper]').evaluate(el => getComputedStyle(el).transform), 'none', 'Changing to reduced motion stops an in-progress manual card flip');
  assert.equal(await page.locator('.card-front').isVisible(), true);
  assert.equal(await page.locator('.card-back').isVisible(), true);
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
  assert.equal(await page.locator('#main-nav').isVisible(), false);
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('#main-nav').isVisible(), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('#main-nav').isVisible(), false);
  await page.locator('.menu-toggle').blur();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(output, 'home-mobile.png') });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await visit(page, '/');
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(output, 'home-desktop.png') });
  // Trigger entrances before taking the long-page reference, then return to the top.
  await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 850) { await page.evaluate(y => window.scrollTo(0, y), y); await page.waitForTimeout(130); }
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(output, 'home-full.png'), fullPage: true });

  const reduced = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  await visit(reduced, '/');
  assert.equal(await reduced.locator('.card-interactive').count(), 0);
  assert.equal(await reduced.locator('[data-card-controls]').isVisible(), false);
  assert.equal(await reduced.locator('.card-front').isVisible(), true);
  assert.equal(await reduced.locator('.card-back').isVisible(), true);
  await reduced.close();

  const plain = await browser.newPage({ viewport: { width: 390, height: 844 }, javaScriptEnabled: false });
  await plain.goto(origin, { waitUntil: 'networkidle' });
  assert.equal(await plain.locator('#main-nav').isVisible(), true);
  assert.equal(await plain.locator('.menu-toggle').isVisible(), false);
  const navBottom = (await plain.locator('#main-nav').boundingBox()).y + (await plain.locator('#main-nav').boundingBox()).height;
  const heroTop = (await plain.locator('h1').boundingBox()).y;
  assert.ok(heroTop > navBottom, 'No-JS mobile navigation stays above hero');
  assert.equal(await plain.locator('.card-front').isVisible(), true);
  assert.equal(await plain.locator('.card-back').isVisible(), true);
  assert.equal(await plain.locator('.harmony-landscape__fallback').isVisible(), true);
  assert.equal(await plain.locator('[data-coverage-form]').isVisible(), false);
  await plain.close();
  assert.deepEqual(errors, [], 'No browser JavaScript errors');
  console.log(`PASS: ${routes.size} routes, ${checkedLinks.size} local references, ${checkedFragments.size} anchors, booking, 263 ZIPs, card, responsive layouts, menu, reduced motion, and no-JS fallback.`);
  console.log(`Screenshots: ${output}`);
} finally {
  await browser?.close();
  server?.kill();
}
