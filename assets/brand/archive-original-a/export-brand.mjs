import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { Resvg } from '@resvg/resvg-js';

// Keep the original outlined artwork as the default identity; source files stay intact.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const brand = path.join(root, 'static/images/brand');
const pack = path.join(root, 'static/media-pack');
const masters = path.join(root, 'assets/brand/masters');
const colors = { jade: '#28594b', ink: '#26352e', paper: '#f7f3eb', sage: '#dce5d8', clay: '#a5684e' };
const font = {
  loadSystemFonts: false,
  fontFiles: ['CormorantGaramond.ttf', 'DMSans.ttf'].map(name => path.join(root, 'assets/brand/fonts', name)),
  defaultFontFamily: 'DM Sans',
};
await Promise.all([brand, pack, masters, path.join(pack, 'logos'), path.join(pack, 'editable'), path.join(pack, 'fonts')].map(dir => mkdir(dir, { recursive: true })));

const originalLogo = await readFile(path.join(root, 'static/images/logo/logo.svg'), 'utf8');
const originalSymbol = await readFile(path.join(root, 'static/images/logo/logo-mobile.svg'), 'utf8');
const logoPaths = [...originalLogo.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]);
const symbolPaths = [...originalSymbol.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]).join('');
assert.equal(logoPaths.length, 42, 'Original logo path count changed; review icon and wordmark extraction before exporting.');
assert.ok(symbolPaths, 'Original symbol contains no vector paths.');
const recolor = (markup, color) => color === colors.jade ? markup : markup.replace(/fill="(?:#[0-9a-fA-F]{6}|rgb\([^)]+\))"/g, `fill="${color}"`);
const symbol = (color = colors.jade) => `<g transform="translate(0 9.21) scale(.39314937) translate(-308.52 -331.95)">${recolor(symbolPaths, color)}</g>`;
const wrap = (width, height, content, label = 'Wang’s Harmony Acupuncture') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}"><title>${label}</title>${content}</svg>`;
const symbolSvg = color => wrap(160, 160, symbol(color), 'Original Wang’s Harmony Acupuncture symbol');
const horizontalSvg = color => wrap(1321.4, 351.48, `<g transform="translate(-72.64 -276.13)">${recolor(logoPaths.join(''), color)}</g>`);
const wordPaths = logoPaths.slice(18).map(markup => {
  const b = new Resvg(wrap(1500, 800, markup)).getBBox();
  return { markup, x: b.x, y: b.y, width: b.width, height: b.height };
});
const wordRows = [wordPaths.filter(p => p.y < 410), wordPaths.filter(p => p.y >= 410 && p.y < 510), wordPaths.filter(p => p.y >= 510)];
const stackedSvg = color => wrap(720, 580, `<g transform="translate(225 20) scale(1.6875)">${symbol(color)}</g>` + wordRows.map((row, index) => {
  const x = Math.min(...row.map(p => p.x));
  const y = Math.min(...row.map(p => p.y));
  const width = Math.max(...row.map(p => p.x + p.width)) - x;
  return `<g transform="translate(${(720 - width * .68) / 2} ${315 + index * 79}) scale(.68) translate(${-x} ${-y})">${recolor(row.map(p => p.markup).join(''), color)}</g>`;
}).join(''));
const outlined = svg => new Resvg(svg, { font }).toString();
const png = (svg, width) => new Resvg(svg, { font, fitTo: { mode: 'width', value: width } }).render().asPng();
const variants = [{ name: '', color: colors.jade }, { name: '-black', color: '#000000' }, { name: '-ivory', color: colors.paper }];
const exports = [];
async function asset(name, data, includeInPack = true) {
  await writeFile(path.join(brand, name), data);
  if (includeInPack) {
    await writeFile(path.join(pack, 'logos', name), data);
    exports.push(`logos/${name}`);
  }
}
for (const variant of variants) {
  for (const [shape, make, sizes] of [['symbol', symbolSvg, [512, 1024]], ['logo-horizontal', horizontalSvg, [1024, 2048]], ['logo-stacked', stackedSvg, [1024, 2048]]]) {
    const original = make(variant.color);
    const vector = outlined(original);
    const name = shape + variant.name;
    await asset(`${name}.svg`, vector);
    await writeFile(path.join(masters, `${name}.svg`), original);
    await writeFile(path.join(pack, 'editable', `${name}.svg`), original);
    for (const size of sizes) await asset(`${name}-${size}.png`, png(vector, size));
  }
}

const iconSvg = wrap(180, 180, `<rect width="180" height="180" rx="0" fill="${colors.jade}"/><g transform="translate(25 25) scale(.8125)">${symbol(colors.paper)}</g>`);
await asset('apple-touch-icon.png', png(iconSvg, 180));
await asset('favicon.svg', outlined(iconSvg));
await asset('favicon-32.png', png(iconSvg, 32));
await asset('favicon-64.png', png(iconSvg, 64));

const backgroundLogo = (width, height, background, color, logoWidth) => {
  const scale = logoWidth / 1321.4;
  const artwork = horizontalSvg(color).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return wrap(width, height, `<rect width="${width}" height="${height}" fill="${background}"/><g transform="translate(${(width - logoWidth) / 2} ${(height - 351.48 * scale) / 2}) scale(${scale})">${artwork}</g>`);
};
const wallpaper = backgroundLogo(3840, 2160, colors.paper, colors.jade, 2200);
const wallpaperOutlined = outlined(wallpaper);
await writeFile(path.join(masters, 'wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-16x9.svg'), wallpaperOutlined);
await writeFile(path.join(pack, 'editable/wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-3840x2160.png'), png(wallpaperOutlined, 3840));
await writeFile(path.join(pack, 'wallpaper-1920x1080.png'), png(wallpaperOutlined, 1920));
const wallpaperJade = backgroundLogo(3840, 2160, colors.jade, colors.paper, 2200);
await writeFile(path.join(pack, 'wallpaper-jade-16x9.svg'), outlined(wallpaperJade));
await writeFile(path.join(pack, 'wallpaper-jade-3840x2160.png'), png(wallpaperJade, 3840));
await writeFile(path.join(pack, 'wallpaper-jade-1920x1080.png'), png(wallpaperJade, 1920));

const social = backgroundLogo(1200, 630, colors.paper, colors.jade, 930);
await writeFile(path.join(pack, 'social-preview.svg'), outlined(social));
await writeFile(path.join(pack, 'social-preview.png'), png(social, 1200));

for (const filename of ['cormorant-garamond-latin-variable.woff2', 'cormorant-garamond-latin-italic-variable.woff2', 'dm-sans-latin-variable.woff2', 'OFL-CormorantGaramond.txt', 'OFL-DMSans.txt']) {
  await copyFile(path.join(root, 'static/fonts', filename), path.join(pack, 'fonts', filename));
}
for (const filename of ['CormorantGaramond.ttf', 'DMSans.ttf']) {
  await copyFile(path.join(root, 'assets/brand/fonts', filename), path.join(pack, 'fonts', filename));
}
const manifest = {
  brand: 'Wang’s Harmony Acupuncture', date: '2026-10-12',
  brandLine: 'Traditional medicine. Personal care.',
  concept: 'Original practitioner and acupuncture scene, circular blue and green forms, and original outlined lettering.',
  activeOption: 'A: original artwork and colors. Other refinements remain previews until selected.',
  colors,
  typography: { logo: 'Original outlined letterforms, preserved from the source artwork.', websiteDisplay: 'Cormorant Garamond', supporting: 'DM Sans', license: 'Website font files use the SIL Open Font License 1.1; included in fonts/' },
  svg: 'All logo lettering uses the original editable vector paths; no font installation is required to render the logo.',
  clearSpace: 'Keep a minimum space of one quarter of the symbol width around all logo variants.',
  minimumSizes: { symbol: '48 CSS px', horizontal: '250 CSS px', stacked: '220 CSS px' },
  downloadFiles: [...exports, 'wallpaper-16x9.svg', 'wallpaper-3840x2160.png', 'wallpaper-1920x1080.png', 'wallpaper-jade-16x9.svg', 'wallpaper-jade-3840x2160.png', 'wallpaper-jade-1920x1080.png', 'social-preview.svg', 'social-preview.png'],
  fontSources: ['https://github.com/google/fonts/tree/main/ofl/cormorantgaramond', 'https://github.com/google/fonts/tree/main/ofl/dmsans'],
};
await writeFile(path.join(pack, 'brand-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const downloadLinks = manifest.downloadFiles.map(name => `<li><a download href="${name}">${name}</a></li>`).join('\n');
const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wang’s Harmony | Brand guide</title><style>
@font-face{font-family:Cormorant;src:url('fonts/cormorant-garamond-latin-variable.woff2') format('woff2');font-weight:400 600;font-display:swap}@font-face{font-family:DM;src:url('fonts/dm-sans-latin-variable.woff2') format('woff2');font-weight:400 650;font-display:swap}
*{box-sizing:border-box}body{margin:0;background:#f7f3eb;color:#26352e;font:16px/1.7 DM,Arial,sans-serif}main{max-width:1040px;margin:auto;padding:64px 32px}h1,h2{font-family:Cormorant,Georgia,serif;font-weight:500;line-height:1.1}h1{font-size:clamp(40px,7vw,76px);margin:24px 0}h2{font-size:38px;margin:0 0 20px}section{padding:42px 0;border-top:1px solid #bdcabb}p{max-width:720px}a{color:#28594b;text-underline-offset:4px}a:focus-visible{outline:3px solid #a5684e;outline-offset:4px}.lead{font-size:18px}.sample{padding:36px;display:grid;place-items:center;min-height:220px;background:#fffdf8;border-radius:4px}.sample img{max-width:100%;width:630px}.reverse{background:#28594b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.swatch i{display:block;height:90px;border-radius:3px}.swatch strong,.swatch code{display:block;margin-top:8px}.clearspace{width:280px;height:280px;margin:32px auto;padding:40px;border:1px dashed #a5684e;position:relative}.clearspace img{width:100%;height:100%}.clearspace span{position:absolute;left:7px;top:4px;font-size:12px;color:#637064}.display-type{font-family:Cormorant,Georgia,serif;font-size:45px;line-height:1.15}.download-list{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;padding-left:22px;font-size:14px;overflow-wrap:anywhere}.wallpaper{width:100%;display:block}.button{display:inline-block;background:#28594b;color:#f7f3eb;padding:12px 22px;border-radius:3px;text-decoration:none;margin:12px 0}.note{color:#546352;font-size:14px}@media(max-width:640px){main{padding:36px 22px}.grid,.download-list{grid-template-columns:1fr}.swatches{grid-template-columns:repeat(2,1fr)}.sample{padding:22px}h2{font-size:32px}}
</style></head><body><main><a href="/">Wang’s Harmony Acupuncture</a><h1>Brand guide &amp; media pack</h1><p class="lead">Traditional medicine. Personal care.</p><p>Use the original practitioner-and-patient artwork and its blue and green colors. These files preserve the original lettering as vector outlines. The stacked layout uses the same artwork and lettering.</p><a class="button" download href="wangs-harmony-media-pack.zip">Download the media pack</a>
<section><h2>The original identity</h2><div class="sample"><img src="logos/logo-horizontal.svg" alt="Original blue and green Wang’s Harmony Acupuncture logo"></div><div class="grid" style="margin-top:24px"><div class="sample"><img style="width:350px" src="logos/logo-stacked.svg" alt="Original artwork in a stacked layout"></div><div class="sample reverse"><img style="width:350px" src="logos/logo-stacked-ivory.svg" alt="Original artwork in ivory on jade"></div></div></section>
<section><h2>Website palette</h2><div class="swatches">${Object.entries(colors).map(([name,hex])=>`<div class="swatch"><i style="background:${hex};border:1px solid #bdcabb"></i><strong>${name[0].toUpperCase()+name.slice(1)}</strong><code>${hex}</code></div>`).join('')}</div><p>Keep the logo’s original blue and green colors. Use this supporting palette for the website: paper backgrounds, jade buttons, ink text, sage surfaces, and small clay accents. Set body text in ink or jade on paper. Use the ivory logo on jade.</p></section>
<section><h2>Typography</h2><p>The logo uses its original outlined lettering. Do not retype it. Use the supplied SVG or PNG lockup.</p><div class="grid"><div><p class="display-type">Cormorant Garamond<br>Traditional medicine.</p><p>Use for website headings in regular or medium weights.</p></div><div><p style="font-size:23px">DM Sans<br>Personal care.</p><p>Use for body copy, navigation and appointment information. The website fonts include their SIL Open Font License files.</p></div></div></section>
<section><h2>Space and scale</h2><div class="clearspace"><span>¼ symbol width</span><img src="logos/symbol.svg" alt="Logo clear-space example"></div><p>Leave at least one quarter of the symbol width clear around a logo. Recommended digital widths: symbol 48 px, horizontal logo 250 px, stacked logo 220 px. App icons use the supplied 32 px, 64 px or 180 px exports.</p><p>Keep the proportions and use the supplied colors. Place the logo against a plain background with enough contrast to show the treatment scene.</p></section>
<section><h2>Social wallpaper</h2><img class="wallpaper" src="wallpaper-1920x1080.png" alt="Original blue and green logo centered on ivory"><p>For Xiaohongshu and other posts, use the original logo centered on a solid ivory 16:9 canvas. The pack also includes an ivory-on-jade version. Both come at 3840 × 2160 and 1920 × 1080. The social preview measures 1200 × 630. The artwork has no added slogan.</p></section>
<section><h2>Individual downloads</h2><ul class="download-list">${downloadLinks}</ul><p class="note">PNG logos have transparent backgrounds. App icons and social graphics include their background color. The editable folder contains vector masters with outlined lettering. The repository retains the original source SVG files.</p></section>
</main></body></html>`;
await writeFile(path.join(pack, 'brand-guide.html'), guide);
await writeFile(path.join(pack, 'README.txt'), `WANG'S HARMONY ACUPUNCTURE\nTraditional medicine. Personal care.\n\nCurrent identity: original logo (option A), with original colors and lettering.\n\nOpen brand-guide.html for previews, colors, usage notes and individual downloads.\nlogos/: original horizontal artwork, stacked layout, symbol, black/ivory variants and PNG exports.\neditable/: vector masters. The lettering remains outlined; no font is required for the logo.\nwallpaper-*: centered original artwork on ivory, at 1920x1080 and 3840x2160.\nwallpaper-jade-*: ivory artwork on jade at the same dimensions.\nsocial-preview.png: 1200x630 preview.\nfonts/: website fonts and their licenses.\n\nRebuild from the repository with npm run brand.\nThe prior identity package remains archived in assets/brand/archive-v1/.\n`);

// Small ZIP writer using the standard uncompressed ZIP format: no platform-specific
// shell or extra package is needed, and an existing ZIP is explicitly excluded.
const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = data => { let c = 0xffffffff; for (const b of data) c = crcTable[(c ^ b) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
async function filesIn(dir, prefix = '') {
  const result = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const name = prefix + item.name;
    if (item.isDirectory()) result.push(...await filesIn(path.join(dir, item.name), name + '/'));
    else if (!name.endsWith('.zip')) result.push(name);
  }
  return result.sort();
}
const locals = [], centrals = [];
let offset = 0;
const files = await filesIn(pack);
for (const name of files) {
  const filename = Buffer.from(name, 'utf8');
  const data = await readFile(path.join(pack, name));
  const crc = crc32(data);
  const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50, 0); local.writeUInt16LE(20, 4); local.writeUInt16LE(0x800, 6); local.writeUInt32LE(crc, 14); local.writeUInt32LE(data.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
  const central = Buffer.alloc(46); central.writeUInt32LE(0x02014b50, 0); central.writeUInt16LE(20, 4); central.writeUInt16LE(20, 6); central.writeUInt16LE(0x800, 8); central.writeUInt32LE(crc, 16); central.writeUInt32LE(data.length, 20); central.writeUInt32LE(data.length, 24); central.writeUInt16LE(filename.length, 28); central.writeUInt32LE(offset, 42);
  locals.push(local, filename, data); centrals.push(central, filename); offset += local.length + filename.length + data.length;
}
const directory = Buffer.concat(centrals);
const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
await writeFile(path.join(pack, 'wangs-harmony-media-pack.zip'), Buffer.concat([...locals, directory, end]));
console.log(`Brand exported: ${exports.length} logo files, 6 wallpaper files, 2 social files, guide, fonts and ZIP (${files.length} entries).`);
