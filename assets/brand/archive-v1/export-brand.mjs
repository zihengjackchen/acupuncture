import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Resvg } from '@resvg/resvg-js';

// Reproducible, vector-first identity exports. Existing logo masters are untouched.
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

const symbol = (color = colors.jade) => `<g fill="${color}">
  <path d="M78 14C42 14 14 42 14 78c0 29 19 54 46 64-16-17-21-31-18-48 3-19 16-30 27-43 11-12 15-23 9-37Z"/>
  <path d="M82 146c36 0 64-28 64-64 0-29-19-54-46-64 16 17 21 31 18 48-3 19-16 30-27 43-11 12-15 23-9 37Z"/>
  <path d="M80 43v72" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/>
  <path d="M76.7 47h6.6m-6.6 5h6.6m-6.6 5h6.6m-6.6 5h6.6" fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round"/>
  <path d="m78.9 112 1.1 9 1.1-9Z"/>
</g>`;
const wrap = (width, height, content, label = 'Wang’s Harmony Acupuncture') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}"><title>${label}</title>${content}</svg>`;
const symbolSvg = color => wrap(160, 160, symbol(color), 'Wang’s Harmony harmony and acupuncture symbol');
const horizontalSvg = color => wrap(882, 240, `
  <g transform="translate(28 30) scale(1.125)">${symbol(color)}</g>
  <g fill="${color}"><text x="252" y="126" font-family="Cormorant Garamond" font-weight="500" font-size="91" letter-spacing="-1.8">Wang’s Harmony</text>
  <text x="258" y="175" font-family="DM Sans" font-weight="400" font-size="23" letter-spacing="7.6">ACUPUNCTURE</text></g>`);
const stackedSvg = color => wrap(720, 430, `
  <g transform="translate(270 22) scale(1.125)">${symbol(color)}</g>
  <g fill="${color}"><text x="360" y="301" text-anchor="middle" font-family="Cormorant Garamond" font-weight="500" font-size="89" letter-spacing="-1.8">Wang’s Harmony</text>
  <text x="364" y="359" text-anchor="middle" font-family="DM Sans" font-weight="400" font-size="24" letter-spacing="7.5">ACUPUNCTURE</text></g>`);
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

const stackedIvory = stackedSvg(colors.paper).replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const wallpaper = wrap(3840, 2160, `<rect width="3840" height="2160" fill="${colors.jade}"/><g transform="translate(1340 733.6111) scale(1.6111111)">${stackedIvory}</g>`);
const wallpaperOutlined = outlined(wallpaper);
await writeFile(path.join(masters, 'wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-16x9.svg'), wallpaperOutlined);
await writeFile(path.join(pack, 'editable/wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-3840x2160.png'), png(wallpaperOutlined, 3840));
await writeFile(path.join(pack, 'wallpaper-1920x1080.png'), png(wallpaperOutlined, 1920));

const social = wrap(1200, 630, `<rect width="1200" height="630" fill="${colors.jade}"/><g transform="translate(332 154.9444) scale(.7444444)">${stackedIvory}</g>`);
await writeFile(path.join(pack, 'social-preview.svg'), outlined(social));
await writeFile(path.join(pack, 'social-preview.png'), png(social, 1200));

for (const filename of ['cormorant-garamond-latin-variable.woff2', 'cormorant-garamond-latin-italic-variable.woff2', 'dm-sans-latin-variable.woff2', 'OFL-CormorantGaramond.txt', 'OFL-DMSans.txt']) {
  await copyFile(path.join(root, 'static/fonts', filename), path.join(pack, 'fonts', filename));
}
for (const filename of ['CormorantGaramond.ttf', 'DMSans.ttf']) {
  await copyFile(path.join(root, 'assets/brand/fonts', filename), path.join(pack, 'fonts', filename));
}
const manifest = {
  brand: 'Wang’s Harmony Acupuncture', date: '2026-10-11',
  concept: 'Two opposing botanical forms create a balanced circle around a fine acupuncture needle.',
  colors,
  typography: { display: 'Cormorant Garamond', supporting: 'DM Sans', license: 'SIL Open Font License 1.1; included in fonts/' },
  svg: 'Portable logo SVGs have text converted to paths. Editable SVG masters retain live text and require the bundled fonts.',
  clearSpace: 'Keep a minimum space of one quarter of the symbol width around all logo variants.',
  minimumSizes: { symbol: '24 CSS px', horizontal: '320 CSS px', stacked: '240 CSS px' },
  downloadFiles: [...exports, 'wallpaper-16x9.svg', 'wallpaper-3840x2160.png', 'wallpaper-1920x1080.png', 'social-preview.svg', 'social-preview.png'],
  fontSources: ['https://github.com/google/fonts/tree/main/ofl/cormorantgaramond', 'https://github.com/google/fonts/tree/main/ofl/dmsans'],
};
await writeFile(path.join(pack, 'brand-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const downloadLinks = manifest.downloadFiles.map(name => `<li><a download href="${name}">${name}</a></li>`).join('\n');
const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wang’s Harmony | Brand guide</title><style>
@font-face{font-family:Cormorant;src:url('fonts/cormorant-garamond-latin-variable.woff2') format('woff2');font-weight:400 600;font-display:swap}@font-face{font-family:DM;src:url('fonts/dm-sans-latin-variable.woff2') format('woff2');font-weight:400 650;font-display:swap}
*{box-sizing:border-box}body{margin:0;background:#f7f3eb;color:#26352e;font:16px/1.7 DM,Arial,sans-serif}main{max-width:1040px;margin:auto;padding:64px 32px}h1,h2{font-family:Cormorant,Georgia,serif;font-weight:500;line-height:1.1}h1{font-size:clamp(40px,7vw,76px);margin:24px 0}h2{font-size:38px;margin:0 0 20px}section{padding:42px 0;border-top:1px solid #bdcabb}p{max-width:720px}a{color:#28594b;text-underline-offset:4px}a:focus-visible{outline:3px solid #a5684e;outline-offset:4px}.lead{font-size:18px}.sample{padding:36px;display:grid;place-items:center;min-height:220px;background:#fffdf8;border-radius:4px}.sample img{max-width:100%;width:630px}.reverse{background:#28594b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.swatch i{display:block;height:90px;border-radius:3px}.swatch strong,.swatch code{display:block;margin-top:8px}.clearspace{width:280px;height:280px;margin:32px auto;padding:40px;border:1px dashed #a5684e;position:relative}.clearspace img{width:100%;height:100%}.clearspace span{position:absolute;left:7px;top:4px;font-size:12px;color:#637064}.display-type{font-family:Cormorant,Georgia,serif;font-size:45px;line-height:1.15}.download-list{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;padding-left:22px;font-size:14px;overflow-wrap:anywhere}.wallpaper{width:100%;display:block}.button{display:inline-block;background:#28594b;color:#f7f3eb;padding:12px 22px;border-radius:3px;text-decoration:none;margin:12px 0}.note{color:#546352;font-size:14px}@media(max-width:640px){main{padding:36px 22px}.grid,.download-list{grid-template-columns:1fr}.swatches{grid-template-columns:repeat(2,1fr)}.sample{padding:22px}h2{font-size:32px}}
</style></head><body><main><a href="/">Wang’s Harmony Acupuncture</a><h1>A considered identity.<br>A sense of balance.</h1><p class="lead">A simple harmony circle formed by two flowing botanical shapes, with one fine acupuncture needle at its center. The mark connects Chinese medicine, thoughtful care and natural balance.</p><a class="button" download href="wangs-harmony-media-pack.zip">Download the media pack</a>
<section><h2>The identity</h2><div class="sample"><img src="logos/logo-horizontal.svg" alt="Jade Wang’s Harmony Acupuncture horizontal logo"></div><div class="grid" style="margin-top:24px"><div class="sample"><img style="width:350px" src="logos/logo-stacked.svg" alt="Stacked jade logo"></div><div class="sample reverse"><img style="width:350px" src="logos/logo-stacked-ivory.svg" alt="Stacked ivory logo on jade"></div></div></section>
<section><h2>The palette</h2><div class="swatches">${Object.entries(colors).map(([name,hex])=>`<div class="swatch"><i style="background:${hex};border:1px solid #bdcabb"></i><strong>${name[0].toUpperCase()+name.slice(1)}</strong><code>${hex}</code></div>`).join('')}</div><p>Use paper for generous backgrounds, jade for primary actions and the identity, ink for reading, sage for quiet secondary surfaces, and clay sparingly for accents. Keep body text in ink or jade on paper; use paper on jade for reversed applications.</p></section>
<section><h2>Typography</h2><div class="grid"><div><p class="display-type">Cormorant Garamond<br>Thoughtful, personal care.</p><p>Display headings and the wordmark. Prefer regular or medium weights with open line spacing.</p></div><div><p style="font-size:23px">DM Sans<br>Clear, welcoming information.</p><p>Body copy, navigation, appointment information and the spaced acupuncture descriptor. Fonts are bundled under the SIL Open Font License.</p></div></div></section>
<section><h2>Space and scale</h2><div class="clearspace"><span>¼ symbol width</span><img src="logos/symbol.svg" alt="Logo clear-space example"></div><p>Leave at least one quarter of the symbol width clear on every side of each logo. Minimum digital widths: symbol 24 px, horizontal logo 320 px, stacked logo 240 px. The mark should remain recognizable without relying on the needle’s smallest details.</p><p>Keep the original proportions. Use the supplied single-color versions. Avoid shadows, outlines, gradients, rotation, tight cropping, extra decorative elements, and placing the mark on busy imagery.</p></section>
<section><h2>Social wallpaper</h2><img class="wallpaper" src="wallpaper-1920x1080.png" alt="Centered ivory logo on a solid jade background"><p>A clean 16:9 canvas for Xiaohongshu and other social posts: solid jade, centered ivory identity, no additional wording. Available at 3840 × 2160 and 1920 × 1080. The social preview is 1200 × 630.</p></section>
<section><h2>Individual downloads</h2><ul class="download-list">${downloadLinks}</ul><p class="note">All PNG logos use transparent backgrounds, except the app icons and social backgrounds. Production SVG wordmarks are outlined for portability. The editable folder contains live-text masters; install the bundled font files before editing. Existing source logos remain preserved in the website repository.</p></section>
</main></body></html>`;
await writeFile(path.join(pack, 'brand-guide.html'), guide);

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
console.log(`Brand exported: ${exports.length} logo files, 3 wallpaper files, 2 social files, guide, fonts and ZIP (${files.length} entries).`);
