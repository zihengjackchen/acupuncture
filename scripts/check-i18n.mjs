import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const origin = process.env.HARMONY_TEST_URL || 'http://127.0.0.1:1313';
let server;
let browser;
const errors = [];
async function ready() {
  try { return (await fetch(origin)).ok; } catch { return false; }
}

try {
  if (!await ready()) {
    assert.equal(origin, 'http://127.0.0.1:1313', 'Start the custom test server first');
    server = spawn('hugo', ['server', '--bind', '127.0.0.1', '--port', '1313', '--disableFastRender', '--destination', '.qa/i18n-preview'], { stdio: 'ignore', windowsHide: true });
    for (let i = 0; i < 60 && !await ready(); i++) await new Promise(resolve => setTimeout(resolve, 500));
    assert.ok(await ready(), 'Hugo test server starts');
  }
  const sitemapResponse = await fetch(`${origin}/zh/sitemap.xml`);
  assert.ok(sitemapResponse.ok, 'Chinese sitemap is available');
  const sitemap = await sitemapResponse.text();
  const routes = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname));
  assert.ok(routes.size > 10, 'Chinese sitemap includes the translated site');
  for (const route of ['/zh/about/', '/zh/privacy/', '/zh/team/dr-dan-wang/', '/zh/404/']) routes.add(route);

  browser = await chromium.launch({ channel: process.env.HARMONY_BROWSER || 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce', locale: 'zh-CN' });
  page.on('pageerror', error => errors.push(error.message));
  for (const route of routes) {
    assert.ok(route.startsWith('/zh/'), `Chinese sitemap route: ${route}`);
    const response = await page.goto(origin + route, { waitUntil: 'networkidle' });
    assert.equal(response.status(), 200, `Chinese route ${route}`);
    assert.equal(await page.locator('html').getAttribute('lang'), 'zh-Hans', `Chinese language on ${route}`);
    assert.match(await page.locator('main').innerText(), /\p{Script=Han}/u, `Chinese content on ${route}`);
    assert.deepEqual(await page.locator('#main-nav a').allTextContents(), ['诊疗服务', '地点与时间', '认识王医生', '常见问题']);
    const english = page.locator('.language-switch a[hreflang="en-US"]');
    const chinese = page.locator('.language-switch a[hreflang="zh-Hans"]');
    assert.equal(new URL(await english.getAttribute('href'), origin).pathname, route.replace(/^\/zh/, ''), `English counterpart of ${route}`);
    assert.equal(await chinese.getAttribute('aria-current'), 'true');
    assert.equal((await chinese.innerText()).trim(), '中文');
    const localLinks = await page.locator('#main-nav a, .booking-cta a, main a').evaluateAll(links => links.map(link => ({ href: link.href, raw: link.getAttribute('href') })));
    for (const { href, raw } of localLinks) {
      if (!raw?.startsWith('/')) continue;
      const url = new URL(href);
      if (!url.pathname.endsWith('/') || url.pathname.startsWith('/media-pack/')) continue;
      assert.ok(url.pathname.startsWith('/zh/'), `Chinese page link stays Chinese: ${route} → ${url.pathname}`);
    }
  }

  const noScriptPage = await browser.newPage({ javaScriptEnabled: false, locale: 'zh-CN' });
  await noScriptPage.goto(`${origin}/zh/contact/`, { waitUntil: 'networkidle' });
  assert.match(await noScriptPage.locator('#coverage-map-title').textContent(), /上门/, 'Chinese map title is available without JavaScript');
  assert.match(await noScriptPage.locator('.coverage-region').first().getAttribute('aria-label'), /上门/, 'Chinese map region labels are available without JavaScript');
  assert.ok(await noScriptPage.locator('.language-switch a[hreflang="en-US"]').isVisible(), 'Language switch works without JavaScript');
  await noScriptPage.close();

  await page.goto(`${origin}/services/womens-health-and-fertility/`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('html').getAttribute('lang'), /^en/);
  await page.locator('.language-switch a[hreflang="zh-Hans"]').click();
  await page.waitForURL(`${origin}/zh/services/womens-health-and-fertility/`);
  await page.locator('.language-switch a[hreflang="en-US"]').click();
  await page.waitForURL(`${origin}/services/womens-health-and-fertility/`);
  await page.goto(`${origin}/`, { waitUntil: 'networkidle' });
  assert.match(await page.locator('html').getAttribute('lang'), /^en/, 'English is the default homepage even with a Chinese browser locale');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${origin}/zh/`, { waitUntil: 'networkidle' });
  assert.ok(await page.locator('.language-switch').isVisible(), 'Language switch is visible on mobile');
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.ok(await page.locator('#main-nav').isVisible());
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');

  const zip = page.locator('#coverage-zip');
  const submit = page.locator('[data-coverage-form] button');
  await zip.fill('12');
  await submit.click();
  assert.equal(await zip.evaluate(input => input.validationMessage), '请输入五位数字邮政编码。');
  await zip.fill('60714');
  await submit.click();
  assert.match(await page.locator('#coverage-result').innerText(), /60714[\s\S]*上门诊疗/);
  assert.equal(await page.locator('.coverage-region.is-selected').getAttribute('data-zip'), '60714');
  assert.match(await page.locator('.coverage-region[data-zip="60714"]').getAttribute('aria-label'), /可预约上门诊疗/);
  assert.match(await page.locator('#coverage-map-title').textContent(), /上门诊疗服务区域/);
  await zip.fill('90210');
  await submit.click();
  assert.match(await page.locator('#coverage-result').innerText(), /无法确认邮编 90210/);
  assert.equal(await page.locator('.coverage-region.is-selected').count(), 0);
  await page.locator('[data-coverage-reset]').click();
  assert.match(await page.locator('#coverage-result').innerText(), /查询您的邮政编码[\s\S]*206 个完整邮区/);
  const firstRegion = page.locator('.coverage-region').first();
  await firstRegion.focus();
  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('.coverage-region.is-selected').count(), 1, 'Chinese map remains keyboard accessible');
  assert.match(await page.locator('[data-coverage-result-text]').innerText(), /上门诊疗预约/);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const landscape = page.locator('[data-landscape-toggle]');
  await landscape.scrollIntoViewIfNeeded();
  await page.waitForFunction(() => !document.querySelector('[data-landscape-toggle]').hidden);
  assert.equal(await landscape.innerText(), '暂停山水动画');
  await landscape.click();
  assert.equal(await landscape.innerText(), '继续山水动画');
  await landscape.click();
  assert.equal(await landscape.innerText(), '暂停山水动画');
  assert.deepEqual(errors, [], 'No JavaScript errors on Chinese pages');
  console.log(`Chinese checks passed for ${routes.size} routes, language switching, mobile navigation, ZIP lookup, keyboard map use, and landscape controls.`);
} finally {
  await browser?.close();
  server?.kill();
}
