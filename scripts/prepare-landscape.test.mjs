/** Offline renderer checks and a local browser lifecycle/performance smoke test.
 * Run: node scripts/prepare-landscape.test.mjs
 */
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import vm from 'node:vm';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readFile(path.join(root, 'static/vendor/shan-shui/primitives.js'), 'utf8');
const workerSource = await readFile(path.join(root, 'static/vendor/shan-shui/worker.js'), 'utf8');
let reply;
const scope = { console, Math, Map, Number, self: null, postMessage: (value) => { reply = value; } };
scope.self = scope;
const context = vm.createContext(scope);
scope.importScripts = () => vm.runInContext(primitives, context);
vm.runInContext(workerSource, context);
scope.onmessage({ data: { type: 'init', seed: 20261011 } });
const render = (index) => {
  scope.onmessage({ data: { type: 'render', index } });
  assert.equal(reply.type, 'tile', reply.message);
  assert.ok(reply.featureCount <= 9);
  assert.ok(!/NaN|Infinity/.test(reply.svg));
  return reply.svg;
};
const initial = render(0);
assert.ok((initial.match(/<polyline/g) || []).length > 3000, 'Retain the upstream drawing detail.');
assert.ok(!primitives.includes('vegetationBudget'), 'Do not truncate upstream vegetation and architecture.');
assert.notEqual(render(1), initial, 'New panels must contain new scenery.');
for (let index = 2; index < 120; index++) render(index);
assert.equal(render(0), initial, 'Evicted regions must regenerate deterministically.');
render(100000);
for (let seed = 1; seed <= 12; seed++) {
  scope.onmessage({ data: { type: 'init', seed: seed * 17389 } });
  for (const index of [0, 1, 17, 1234, 100000]) render(index);
}
console.log('Worker: 120 forward panels, bounded cache, deterministic regeneration, 12 seeds and distant coordinates checked.');

const partial = (await readFile(path.join(root, 'layouts/partials/landscape.html'), 'utf8'))
  .replace(/\{\{ "([^"]+)" \| relURL \}\}/g, '/$1');
const css = await readFile(path.join(root, 'assets/css/landscape.css'));
const js = await readFile(path.join(root, 'assets/js/landscape.js'), 'utf8');
const server = createServer(async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  if (url.pathname === '/') {
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(`<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;font-family:Arial;background:#f7f3eb}</style><link rel="stylesheet" href="/landscape.css"></head><body><main style="height:1100px">Local landscape verification</main>${partial}<script>window.originalRandom = Math.random;</script><script src="/landscape.js${url.search}" defer></script></body></html>`);
  } else if (url.pathname === '/landscape.css') {
    response.setHeader('Content-Type', 'text/css'); response.end(css);
  } else if (url.pathname === '/landscape.js') {
    response.setHeader('Content-Type', 'text/javascript');
    // Accelerated playback exercises retirement in seconds instead of minutes.
    response.end(url.searchParams.has('fast') ? js.replace('const SPEED = 3;', 'const SPEED = 6000;') : js);
  } else if (url.pathname.startsWith('/vendor/shan-shui/')) {
    const name = path.basename(url.pathname);
    response.setHeader('Content-Type', name.endsWith('.svg') ? 'image/svg+xml' : 'text/javascript');
    try { response.end(await readFile(path.join(root, 'static/vendor/shan-shui', name))); }
    catch { response.writeHead(404).end(); }
  } else response.writeHead(404).end();
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true,
    ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const diagnostics = () => page.locator('[data-landscape]').evaluate((element) => element.harmonyLandscape.diagnostics);
  await page.goto(origin);
  assert.equal((await diagnostics()).generatedTiles, 0, 'Do not render before approaching the footer.');
  await page.locator('[data-landscape]').scrollIntoViewIfNeeded();
  await page.waitForSelector('.harmony-landscape.is-ready');
  await page.waitForTimeout(300);
  assert.ok((await diagnostics()).offset > 0);
  assert.equal(await page.evaluate(() => window.originalRandom === Math.random), true);
  await page.waitForFunction(() => {
    const state = document.querySelector('[data-landscape]').harmonyLandscape.diagnostics;
    return !state.pending && state.generatedTiles >= 4;
  });
  const beforeMotion = await diagnostics();
  await page.waitForTimeout(2000);
  const afterMotion = await diagnostics();
  assert.ok(afterMotion.animationFrames > beforeMotion.animationFrames + 10);
  assert.equal(afterMotion.paintCount, beforeMotion.paintCount, 'Steady drift must not repaint the canvas.');
  assert.equal(afterMotion.drawCalls, beforeMotion.drawCalls, 'Reuse the painted strip between buffer changes.');
  assert.ok(afterMotion.offsetCSS - beforeMotion.offsetCSS > 4);
  assert.ok(afterMotion.offsetCSS - beforeMotion.offsetCSS < 8);
  console.log('Two-second steady motion sample:', JSON.stringify({
    frames: afterMotion.animationFrames - beforeMotion.animationFrames,
    paints: afterMotion.paintCount - beforeMotion.paintCount,
    drawCalls: afterMotion.drawCalls - beforeMotion.drawCalls,
    distanceCSS: afterMotion.offsetCSS - beforeMotion.offsetCSS,
    generatedTiles: afterMotion.generatedTiles - beforeMotion.generatedTiles,
    maxTileMs: Math.round(afterMotion.maxTileMs), canvasBytes: afterMotion.canvasBytes,
  }));
  await page.getByRole('button', { name: 'Pause landscape' }).focus();
  await page.keyboard.press('Enter');
  const stopped = await diagnostics();
  await page.waitForTimeout(250);
  assert.equal((await diagnostics()).offset, stopped.offset);
  assert.equal((await diagnostics()).animationFrames, stopped.animationFrames);
  assert.equal((await diagnostics()).paintCount, stopped.paintCount);
  assert.equal((await diagnostics()).generatedTiles, stopped.generatedTiles);
  assert.equal((await diagnostics()).running, false);
  await page.getByRole('button', { name: 'Resume landscape' }).click();
  await page.waitForTimeout(150);
  assert.ok((await diagnostics()).offset > stopped.offset);
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { configurable: true, value: true });
    document.dispatchEvent(new Event('visibilitychange'));
  });
  assert.equal((await diagnostics()).running, false);
  await page.evaluate(() => {
    delete document.hidden;
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await page.waitForTimeout(50);
  assert.equal((await diagnostics()).running, true);
  await page.locator('[data-landscape]').screenshot({ path: path.join(os.tmpdir(), 'harmony-landscape-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('[data-landscape]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(300);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.locator('[data-landscape]').screenshot({ path: path.join(os.tmpdir(), 'harmony-landscape-mobile.png') });
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(150);
  assert.equal((await diagnostics()).running, false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.locator('[data-landscape]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  assert.equal((await diagnostics()).tiles, 0);
  assert.equal((await diagnostics()).running, false);
  assert.equal(await page.locator('[data-landscape-toggle]').isVisible(), false);
  assert.equal(await page.locator('.harmony-landscape__fallback').isVisible(), true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.waitForSelector('.harmony-landscape.is-ready');
  await page.goto(`${origin}/?fast=1`);
  await page.locator('[data-landscape]').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => document.querySelector('[data-landscape]').harmonyLandscape.diagnostics.firstTile > 20, null, { timeout: 30000 });
  const longRun = await diagnostics();
  assert.ok(longRun.tiles <= 10);
  assert.ok(longRun.featureCount <= 9);
  assert.equal(await page.locator('[data-landscape] canvas').count(), 1);
  await page.locator('[data-landscape]').evaluate((element) => element.harmonyLandscape.destroy());
  assert.equal((await diagnostics()).tiles, 0);
  assert.equal((await diagnostics()).objectURLs, 0);
  assert.equal((await diagnostics()).running, false);
  assert.equal(errors.length, 0, errors.join('\n'));
  const noScript = await browser.newPage({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  await noScript.goto(origin);
  await noScript.locator('[data-landscape]').scrollIntoViewIfNeeded();
  assert.equal(await noScript.locator('.harmony-landscape__fallback').isVisible(), true);
  assert.equal(await noScript.locator('[data-landscape-toggle]').isVisible(), false);
  await noScript.close();
  console.log('Browser: visible-only start, buffered drift, keyboard pause/resume, hidden document, mobile width, offscreen pause, reduced motion, no-JS fallback, 20+ tile retirement, and cleanup passed.');
  console.log(JSON.stringify(longRun));
  console.log(`Previews: ${path.join(os.tmpdir(), 'harmony-landscape-desktop.png')} and harmony-landscape-mobile.png`);
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
