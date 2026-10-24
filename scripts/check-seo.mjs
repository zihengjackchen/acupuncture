import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';

const output = path.resolve('dist');
const base = 'https://www.wangsharmonyacu.com/';
const sitemap = await fs.readFile(path.join(output, 'sitemap.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.ok(urls.length > 0, 'Sitemap contains pages');
assert.equal(new Set(urls).size, urls.length, 'Sitemap URLs are unique');
for (const url of urls) assert.ok(url.startsWith(base), `Production sitemap URL: ${url}`);
const robots = await fs.readFile(path.join(output, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${base}sitemap.xml`), 'Robots advertises the production sitemap');

// Match Hugo's quoted development and unquoted minified HTML attributes.
const canonicalPattern = /<link\s+rel="?canonical"?\s+href="?([^\s">]+)"?\s*\/?\s*>/;
const ogPattern = /<meta\s+property="?og:url"?\s+content="?([^\s">]+)"?\s*\/?\s*>/;
const noindexPattern = /<meta\s+name="?robots"?\s+content="?noindex[,"\s>]/;
const files = (await fs.readdir(output, { recursive: true }))
  .map(file => file.replaceAll('\\', '/'))
  .filter(file => file === '404.html' || /(^|\/)index\.html$/.test(file));
let checked = 0;
for (const file of files) {
  const html = await fs.readFile(path.join(output, file), 'utf8');
  const canonical = html.match(canonicalPattern)?.[1];
  const route = file.replace(/index\.html$/, '');
  const expected = new URL(file === 'team/dr-dan-wang/index.html' ? 'team/' : route, base).href;
  assert.equal(canonical, expected, `Canonical on ${file}`);
  assert.equal(html.match(ogPattern)?.[1], canonical, `Social URL on ${file}`);
  const omitted = noindexPattern.test(html) || canonical !== new URL(route, base).href || file === '404.html';
  assert.equal(urls.includes(new URL(route, base).href), !omitted, `Sitemap inclusion for ${file}`);
  const schema = html.match(/<script\s+type="?application\/ld\+json"?>([\s\S]*?)<\/script>/)?.[1];
  const graph = JSON.parse(schema)['@graph'];
  assert.equal(graph.find(item => item['@id'] === `${base}#practice`)?.url, base, `Practice URL on ${file}`);
  assert.doesNotMatch(schema, /http:\/\/(?:www\.)?wangsharmonyacu\.com/, `No insecure schema URL on ${file}`);
  checked++;
}
assert.ok(checked > 0, 'Built HTML pages were checked');
for (const route of ['404/index.html', 'about/index.html']) {
  assert.match(await fs.readFile(path.join(output, route), 'utf8'), noindexPattern, `${route} is noindex`);
}
assert.ok(urls.includes(`${base}team/`), 'Preferred practitioner page is in the sitemap');
assert.ok(!urls.includes(`${base}team/dr-dan-wang/`), 'Duplicate practitioner page is omitted');
console.log(`SEO checks passed for ${checked} HTML pages and ${urls.length} sitemap URLs.`);
