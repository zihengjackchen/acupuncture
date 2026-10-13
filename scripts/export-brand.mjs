import { mkdir, readFile, writeFile, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Resvg } from '@resvg/resvg-js';

// Option G keeps the original treatment scene, with stronger contours and website typography.
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
const logoPaths = [...originalLogo.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]);
assert.equal(logoPaths.length, 42, 'Original logo path count changed; review icon and wordmark extraction before exporting.');
const sceneColors = ['#557c69', colors.jade, '#8faa98', colors.jade, '#587a65', '#557c69', colors.jade, colors.jade, colors.jade, colors.jade, colors.jade, colors.jade, colors.jade, colors.jade, '#577a63', '#3c6756', '#577a63', '#8faa98'];
const symbolPaths = logoPaths.slice(0, 18).map((markup, index) => {
  const refined = markup.replace(/fill="[^"]+"/, `fill="${sceneColors[index]}"`)
    .replace('/>', ` stroke="${sceneColors[index]}" stroke-width="${index === 3 ? 1.15 : .7}" stroke-linejoin="round"/>`);
  assert.equal(refined.match(/ d="([^"]+)"/)[1], markup.match(/ d="([^"]+)"/)[1], 'The original scene geometry must remain unchanged.');
  return refined;
}).join('');
const recolor = (markup, color) => color === colors.jade ? markup : markup.replace(/(?:fill|stroke)="#[0-9a-fA-F]{6}"/g, attribute => attribute.replace(/#[0-9a-fA-F]{6}/, color));
const symbol = (color = colors.jade) => `<g transform="translate(.4 8.9) scale(.4274) translate(-82.64 -286.13)">${recolor(symbolPaths, color)}</g>`;
const wrap = (width, height, content, label = 'Wang’s Harmony Acupuncture') => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}"><title>${label}</title>${content}</svg>`;
const symbolSvg = color => wrap(160, 160, symbol(color), 'Wang’s Harmony original treatment scene in jade');
const typeColor = color => color === colors.jade ? colors.ink : color;
const horizontalSvg = color => wrap(1100, 280, `<g transform="translate(7 12) scale(1.6)">${symbol(color)}</g><text x="294" y="151" font-family="Cormorant Garamond" font-size="110" font-weight="500" letter-spacing="-1.5" fill="${typeColor(color)}" stroke="${typeColor(color)}" stroke-width=".5" stroke-linejoin="round">Wang’s Harmony</text><text x="298" y="239" font-family="DM Sans" font-size="36" font-weight="500" letter-spacing="8" fill="${color}">ACUPUNCTURE</text>`);
const stackedSvg = color => wrap(720, 550, `<g transform="translate(213 18) scale(1.8375)">${symbol(color)}</g><text x="360" y="405" text-anchor="middle" font-family="Cormorant Garamond" font-size="88" font-weight="500" letter-spacing="-1.1" fill="${typeColor(color)}" stroke="${typeColor(color)}" stroke-width=".4" stroke-linejoin="round">Wang’s Harmony</text><text x="363" y="494" text-anchor="middle" font-family="DM Sans" font-size="30" font-weight="500" letter-spacing="7" fill="${color}">ACUPUNCTURE</text>`);
const outlined = svg => new Resvg(svg, { font }).toString();
const png = (svg, width) => new Resvg(svg, { font, fitTo: { mode: 'width', value: width } }).render().asPng();
const spacingChecks = [];
for (const [shape, svg, sourceWidth, displayWidth, minimumGap] of [
  ['horizontal', horizontalSvg(colors.jade), 1100, 250, 5],
  ['stacked', stackedSvg(colors.jade), 720, 220, 8],
]) {
  const text = [...svg.matchAll(/<text\b[^>]*>[\s\S]*?<\/text>/g)].map(match => match[0]);
  const bounds = text.map(markup => new Resvg(wrap(1100, 550, markup), { font }).getBBox());
  const gap = (bounds[1].y - bounds[0].y - bounds[0].height) * displayWidth / sourceWidth;
  assert.ok(gap >= minimumGap, `${shape} descriptor must clear the name's descenders at its minimum display size`);
  spacingChecks.push({ shape, displayWidth, gapPixels: Math.round(gap * 100) / 100 });
}
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

const backgroundLogo = (width, height, background, color, logoWidth, monochrome = false) => {
  let artworkSvg = horizontalSvg(color);
  if (monochrome) artworkSvg = artworkSvg.replace(/(?:fill|stroke)="#[0-9a-fA-F]{6}"/g, attribute => attribute.replace(/#[0-9a-fA-F]{6}/, color));
  const bounds = new Resvg(artworkSvg, { font }).getBBox();
  const scale = logoWidth / bounds.width;
  const artwork = artworkSvg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
  return wrap(width, height, `<rect width="${width}" height="${height}" fill="${background}"/><g transform="translate(${(width - logoWidth) / 2 - bounds.x * scale} ${(height - bounds.height * scale) / 2 - bounds.y * scale}) scale(${scale})">${artwork}</g>`);
};
const wallpaper = backgroundLogo(3840, 2160, colors.paper, colors.jade, 2200);
const wallpaperOutlined = outlined(wallpaper);
const wallpaperReference = await readFile(path.join(root, 'assets/brand/options/g-wallpaper-reference/reference.svg'), 'utf8');
const wallpaperReferenceHash = createHash('sha256').update(wallpaperReference).digest('hex');
assert.equal(wallpaperReferenceHash, '7899e208bfa4e3f70678a74b899daea2804abbab04d344e1ef86884c1132c4d5', 'The approved wallpaper reference must remain unchanged.');
assert.equal(wallpaperOutlined, wallpaperReference, 'Keep the approved wallpaper font, horizontal layout and internal spacing.');
await writeFile(path.join(masters, 'wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-16x9.svg'), wallpaperOutlined);
await writeFile(path.join(pack, 'editable/wallpaper-16x9.svg'), wallpaper);
await writeFile(path.join(pack, 'wallpaper-3840x2160.png'), png(wallpaperOutlined, 3840));
await writeFile(path.join(pack, 'wallpaper-1920x1080.png'), png(wallpaperOutlined, 1920));
const wallpaperJade = backgroundLogo(3840, 2160, colors.jade, colors.paper, 2200);
await writeFile(path.join(pack, 'wallpaper-jade-16x9.svg'), outlined(wallpaperJade));
await writeFile(path.join(pack, 'wallpaper-jade-3840x2160.png'), png(wallpaperJade, 3840));
await writeFile(path.join(pack, 'wallpaper-jade-1920x1080.png'), png(wallpaperJade, 1920));

const wallpaperLogoFraction = 2200 / 3840;
const wallpaperFormats = [
  { id: 'landscape-16x9', label: 'Landscape · 16:9', width: 3840, height: 2160, widths: [3840, 1920] },
  { id: 'portrait-3x4', label: 'Portrait · 3:4', width: 1440, height: 1920, widths: [1440] },
  { id: 'portrait-4x5', label: 'Portrait · 4:5', width: 1080, height: 1350, widths: [1080] },
  { id: 'story-9x16', label: 'Story / phone · 9:16', width: 1080, height: 1920, widths: [1080] },
  { id: 'square-1x1', label: 'Square · 1:1', width: 1080, height: 1080, widths: [1080] },
];
const wallpaperThemes = [
  { id: 'ivory', label: 'Jade on ivory', background: colors.paper, color: colors.jade },
  { id: 'jade', label: 'Ivory on jade', background: colors.jade, color: colors.paper },
  { id: 'sage', label: 'Jade on sage', background: colors.sage, color: colors.jade, monochrome: true },
];
const wallpapers = [];
await mkdir(path.join(pack, 'wallpapers'), { recursive: true });
await mkdir(path.join(pack, 'editable/wallpapers'), { recursive: true });
await mkdir(path.join(masters, 'wallpapers'), { recursive: true });
for (const format of wallpaperFormats) {
  for (const theme of wallpaperThemes) {
    const name = `${theme.id}-${format.id}`;
    const master = backgroundLogo(format.width, format.height, theme.background, theme.color, format.width * wallpaperLogoFraction, theme.monochrome);
    const vector = outlined(master);
    const vectorFile = `wallpapers/${name}.svg`;
    const editableFile = `editable/wallpapers/${name}.svg`;
    await writeFile(path.join(pack, vectorFile), vector);
    await writeFile(path.join(pack, editableFile), master);
    await writeFile(path.join(masters, `wallpapers/${name}.svg`), master);
    const pngFiles = [];
    for (const width of format.widths) {
      const height = Math.round(width * format.height / format.width);
      const filename = `wallpapers/${name}-${width}x${height}.png`;
      await writeFile(path.join(pack, filename), png(vector, width));
      pngFiles.push({ file: filename, width, height });
    }
    wallpapers.push({ theme: theme.id, themeLabel: theme.label, format: format.id, formatLabel: format.label, svg: vectorFile, editableSvg: editableFile, pngs: pngFiles });
  }
}

const social = backgroundLogo(1200, 630, colors.paper, colors.jade, 930);
await writeFile(path.join(pack, 'social-preview.svg'), outlined(social));
await writeFile(path.join(pack, 'social-preview.png'), png(social, 1200));

const options = path.join(root, 'assets/brand/options');
await mkdir(options, { recursive: true });
for (const [name, content] of [
  ['g-horizontal.svg', outlined(horizontalSvg(colors.jade))],
  ['g-horizontal-editable.svg', horizontalSvg(colors.jade)],
  ['g-stacked.svg', outlined(stackedSvg(colors.jade))],
  ['g-symbol.svg', outlined(symbolSvg(colors.jade))],
  ['g-wallpaper-ivory.svg', wallpaperOutlined],
  ['g-wallpaper-jade.svg', outlined(wallpaperJade)],
]) await writeFile(path.join(options, name), content);
const inside = svg => svg.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const preview = wrap(1800, 1460, `<rect width="1800" height="1460" fill="${colors.paper}"/>
<g font-family="DM Sans" fill="${colors.ink}"><text x="80" y="79" font-size="36" font-weight="500">G / More room between the name and descriptor</text><text x="80" y="127" font-size="24">The same identity, with a clear gap below the descenders at small sizes.</text></g>
<g transform="translate(88 182) scale(1.48)">${inside(horizontalSvg(colors.jade))}</g>
<line x1="80" y1="642" x2="1720" y2="642" stroke="#cbd8c9"/>
<g font-family="DM Sans" fill="${colors.ink}" font-size="24"><text x="80" y="700">250 px header</text><text x="715" y="700">220 px stacked card mark</text><text x="1240" y="700">250 px footer</text></g>
<rect x="80" y="731" width="510" height="190" fill="#fffdf8"/>
<g transform="translate(118 788) scale(.22727273)">${inside(horizontalSvg(colors.jade))}</g>
<g transform="translate(742 738) scale(.30555556)">${inside(stackedSvg(colors.jade))}</g>
<rect x="1200" y="731" width="520" height="190" fill="${colors.jade}"/>
<g transform="translate(1240 788) scale(.22727273)">${inside(horizontalSvg(colors.paper))}</g>
<g font-family="DM Sans" fill="${colors.ink}" font-size="24"><text x="80" y="997">16:9 / Jade on ivory</text><text x="960" y="997">16:9 / Ivory on jade</text></g>
<g transform="translate(80 1030) scale(.19791667)">${inside(wallpaper)}</g>
<g transform="translate(960 1030) scale(.19791667)">${inside(wallpaperJade)}</g>`);
await writeFile(path.join(options, 'g-identity-preview.svg'), outlined(preview));
await writeFile(path.join(options, 'g-identity-preview.png'), png(preview, 1800));
await writeFile(path.join(options, 'g-horizontal-250.png'), png(horizontalSvg(colors.jade), 250));
await writeFile(path.join(options, 'g-stacked-220.png'), png(stackedSvg(colors.jade), 220));
const wallpaperBoard = wrap(1800, 1400, `<rect width="1800" height="1400" fill="${colors.paper}"/><text x="80" y="75" font-family="DM Sans" font-size="36" fill="${colors.ink}">Wallpapers / Five formats, three colors</text>${wallpaperFormats.map((format, column) => `<text x="${100 + column * 340}" y="133" font-family="DM Sans" font-size="22" fill="${colors.ink}">${format.label}</text>`).join('')}${wallpaperThemes.map((theme, row) => `<text x="80" y="${190 + row * 400}" font-family="DM Sans" font-size="21" fill="${colors.jade}">${theme.label}</text>${wallpaperFormats.map((format, column) => {
  const scale = Math.min(280 / format.width, 320 / format.height);
  const master = backgroundLogo(format.width, format.height, theme.background, theme.color, format.width * wallpaperLogoFraction, theme.monochrome);
  return `<g transform="translate(${80 + column * 340 + (280 - format.width * scale) / 2} ${210 + row * 400 + (320 - format.height * scale) / 2}) scale(${scale})">${inside(master)}<rect width="${format.width}" height="${format.height}" fill="none" stroke="#cbd5c5" stroke-width="1" vector-effect="non-scaling-stroke"/></g>`;
}).join('')}`).join('')}`);
await writeFile(path.join(options, 'g-wallpaper-collection.svg'), outlined(wallpaperBoard));
await writeFile(path.join(options, 'g-wallpaper-collection.png'), png(wallpaperBoard, 1800));

for (const filename of ['cormorant-garamond-latin-variable.woff2', 'cormorant-garamond-latin-italic-variable.woff2', 'dm-sans-latin-variable.woff2', 'OFL-CormorantGaramond.txt', 'OFL-DMSans.txt']) {
  await copyFile(path.join(root, 'static/fonts', filename), path.join(pack, 'fonts', filename));
}
for (const filename of ['CormorantGaramond.ttf', 'DMSans.ttf']) {
  await copyFile(path.join(root, 'assets/brand/fonts', filename), path.join(pack, 'fonts', filename));
}
const manifest = {
  brand: 'Wang’s Harmony Acupuncture', date: '2026-10-12',
  brandLine: 'Traditional medicine. Personal care.',
  concept: 'The original practitioner and acupuncture scene, with subtly stronger contours, a jade and muted sage palette, and a two-line Cormorant Garamond / DM Sans wordmark.',
  activeOption: 'G, revised spacing: original scene in the website palette with refined contours and website typography. Previous options and original masters remain archived.',
  colors,
  typography: { logo: 'Cormorant Garamond 500 for Wang’s Harmony; DM Sans 500 for ACUPUNCTURE.', websiteDisplay: 'Cormorant Garamond', supporting: 'DM Sans', license: 'Font files use the SIL Open Font License 1.1; included in fonts/' },
  svg: 'Production logos use outlined lettering and need no installed fonts. Editable masters retain live type; the matching TTF files are included.',
  scenePalette: { jade: colors.jade, mutedJade: '#557c69', softSage: '#8faa98', practitioner: '#577a63', ink: colors.ink },
  clearSpace: 'Keep a minimum space of one quarter of the symbol width around all logo variants.',
  minimumSizes: { symbol: '48 CSS px', horizontal: '250 CSS px', stacked: '220 CSS px' },
  spacingChecks,
  wallpaperLayout: { source: 'assets/brand/options/g-wallpaper-ivory.svg', sha256: wallpaperReferenceHash, logo: 'horizontal', logoWidthFraction: wallpaperLogoFraction, placement: 'Uniformly scaled to the same fraction of canvas width, then centered by visible artwork bounds.' },
  wallpapers,
  downloadFiles: [...exports, 'wallpaper-16x9.svg', 'wallpaper-3840x2160.png', 'wallpaper-1920x1080.png', 'wallpaper-jade-16x9.svg', 'wallpaper-jade-3840x2160.png', 'wallpaper-jade-1920x1080.png', 'social-preview.svg', 'social-preview.png', ...wallpapers.flatMap(item => [item.svg, item.editableSvg, ...item.pngs.map(png => png.file)])],
  fontSources: ['https://github.com/google/fonts/tree/main/ofl/cormorantgaramond', 'https://github.com/google/fonts/tree/main/ofl/dmsans'],
};
await writeFile(path.join(pack, 'brand-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
const downloadLinks = manifest.downloadFiles.map(name => `<li><a download href="${name}">${name}</a></li>`).join('\n');
const wallpaperGallery = wallpaperFormats.map(format => `<div class="wallpaper-format"><h3>${format.label}</h3><div class="wallpaper-grid">${wallpapers.filter(item => item.format === format.id).map(item => `<article class="wallpaper-card"><a class="wallpaper-thumb" href="${item.pngs[0].file}" download><img src="${item.svg}" width="${format.width}" height="${format.height}" alt="${item.themeLabel}, ${format.label.toLowerCase()} wallpaper"></a><h4>${item.themeLabel}</h4><div class="wallpaper-downloads">${item.pngs.map(image => `<a href="${image.file}" download>PNG ${image.width} × ${image.height}</a>`).join('')}<a href="${item.svg}" download>Outlined SVG</a><a href="${item.editableSvg}" download>Editable SVG</a></div></article>`).join('')}</div></div>`).join('');
const guide = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Wang’s Harmony | Brand guide</title><style>
@font-face{font-family:Cormorant;src:url('fonts/cormorant-garamond-latin-variable.woff2') format('woff2');font-weight:400 600;font-display:swap}@font-face{font-family:DM;src:url('fonts/dm-sans-latin-variable.woff2') format('woff2');font-weight:400 650;font-display:swap}
*{box-sizing:border-box}body{margin:0;background:#f7f3eb;color:#26352e;font:16px/1.7 DM,Arial,sans-serif}main{max-width:1040px;margin:auto;padding:64px 32px}h1,h2{font-family:Cormorant,Georgia,serif;font-weight:500;line-height:1.1}h1{font-size:clamp(40px,7vw,76px);margin:24px 0}h2{font-size:38px;margin:0 0 20px}section{padding:42px 0;border-top:1px solid #bdcabb}p{max-width:720px}a{color:#28594b;text-underline-offset:4px}a:focus-visible{outline:3px solid #a5684e;outline-offset:4px}.lead{font-size:18px}.sample{padding:36px;display:grid;place-items:center;min-height:220px;background:#fffdf8;border-radius:4px}.sample img{max-width:100%;width:630px}.reverse{background:#28594b}.grid{display:grid;grid-template-columns:1fr 1fr;gap:24px}.swatches{display:grid;grid-template-columns:repeat(5,1fr);gap:12px}.swatch i{display:block;height:90px;border-radius:3px}.swatch strong,.swatch code{display:block;margin-top:8px}.clearspace{width:280px;height:280px;margin:32px auto;padding:40px;border:1px dashed #a5684e;position:relative}.clearspace img{width:100%;height:100%}.clearspace span{position:absolute;left:7px;top:4px;font-size:12px;color:#637064}.display-type{font-family:Cormorant,Georgia,serif;font-size:45px;line-height:1.15}.download-list{display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;padding-left:22px;font-size:14px;overflow-wrap:anywhere}.wallpaper{width:100%;display:block}.button{display:inline-block;background:#28594b;color:#f7f3eb;padding:12px 22px;border-radius:3px;text-decoration:none;margin:12px 0}.note{color:#546352;font-size:14px}@media(max-width:640px){main{padding:36px 22px}.grid,.download-list{grid-template-columns:1fr}.swatches{grid-template-columns:repeat(2,1fr)}.sample{padding:22px}h2{font-size:32px}}
.wallpaper-format{margin-top:38px}.wallpaper-format h3{font-family:Cormorant,Georgia,serif;font-size:29px;font-weight:500;margin:0 0 18px}.wallpaper-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:24px}.wallpaper-card h4{font-size:15px;font-weight:500;margin:14px 0 8px}.wallpaper-thumb{display:grid;place-items:center;background:#eaece4;padding:14px;aspect-ratio:1.05;border:1px solid #cbd5c5}.wallpaper-thumb img{width:100%;height:100%;min-height:0;object-fit:contain;max-height:240px}.wallpaper-downloads{display:grid;gap:3px;font-size:13px}.wallpaper-downloads a{overflow-wrap:anywhere}@media(max-width:640px){.wallpaper-grid{grid-template-columns:1fr;gap:30px}.wallpaper-thumb{aspect-ratio:1.2}.wallpaper-thumb img{max-height:230px}}
</style></head><body><main><a href="/">Wang’s Harmony Acupuncture</a><h1>Brand guide &amp; media pack</h1><p class="lead">Traditional medicine. Personal care.</p><p>Option G retains the original practitioner-and-patient scene. Its refined contours, jade and muted sage colors, and two-line wordmark connect the identity to the website. The name and descriptor now have more space between them.</p><a class="button" download href="wangs-harmony-media-pack.zip">Download the media pack</a>
<section><h2>The refined identity</h2><div class="sample"><img src="logos/logo-horizontal.svg" alt="Jade treatment scene with the Wang’s Harmony wordmark"></div><div class="grid" style="margin-top:24px"><div class="sample"><img style="width:350px" src="logos/logo-stacked.svg" alt="Refined logo in a stacked layout"></div><div class="sample reverse"><img style="width:350px" src="logos/logo-stacked-ivory.svg" alt="Refined logo in ivory on jade"></div></div></section>
<section><h2>Color palette</h2><div class="swatches">${Object.entries(colors).map(([name,hex])=>`<div class="swatch"><i style="background:${hex};border:1px solid #bdcabb"></i><strong>${name[0].toUpperCase()+name.slice(1)}</strong><code>${hex}</code></div>`).join('')}</div><p>Use paper backgrounds, jade buttons, ink text, sage surfaces, and small clay accents. The original treatment scene uses jade, muted jade #557C69 and soft sage #8FAA98. Use the ivory logo on jade.</p></section>
<section><h2>Typography</h2><p>Use Cormorant Garamond for the name and DM Sans for the ACUPUNCTURE descriptor. Production SVG files contain outlined lettering; editable masters retain live type. Use the supplied lockups to preserve the spacing.</p><div class="grid"><div><p class="display-type">Cormorant Garamond<br>Traditional medicine.</p><p>Use for the wordmark and website headings.</p></div><div><p style="font-size:23px">DM Sans<br>Personal care.</p><p>Use for the descriptor, body copy, navigation and appointment information. The font files include their SIL Open Font License files.</p></div></div></section>
<section><h2>Space and scale</h2><div class="clearspace"><span>¼ symbol width</span><img src="logos/symbol.svg" alt="Logo clear-space example"></div><p>Leave at least one quarter of the symbol width clear around a logo. Recommended digital widths: symbol 48 px, horizontal logo 250 px, stacked logo 220 px. App icons use the supplied 32 px, 64 px or 180 px exports.</p><p>Keep the proportions and use the supplied colors. Preserve the clear gap below the name’s descenders; do not move the ACUPUNCTURE descriptor upward. Place the logo against a plain background with enough contrast to show the treatment scene.</p></section>
<section><h2>Wallpapers &amp; social backgrounds</h2><p>Choose an orientation and background. Every wallpaper uses the same horizontal lockup, font and internal spacing as the approved ivory reference. The logo spans the same proportion of canvas width and sits at the center. The artwork contains no added slogan or decorative text.</p><p>Landscape downloads include 4K and 1080p. Portraits, stories and squares come at the sizes shown below. Outlined SVG files work without installed fonts; editable SVG masters use the included fonts.</p>${wallpaperGallery}</section>
<section><h2>Individual downloads</h2><ul class="download-list">${downloadLinks}</ul><p class="note">PNG logos have transparent backgrounds. App icons and social graphics include their background color. The editable folder contains vector masters with live type. The repository retains the original source SVG files and all earlier alternatives.</p></section>
</main></body></html>`;
await writeFile(path.join(pack, 'brand-guide.html'), guide);
await writeFile(path.join(pack, 'README.txt'), `WANG'S HARMONY ACUPUNCTURE\nTraditional medicine. Personal care.\n\nCurrent identity: option G with increased space below the name. Original treatment scene, jade/sage colors, Cormorant Garamond / DM Sans typography.\n\nOpen brand-guide.html for thumbnail previews, colors, usage notes and individual downloads.\nlogos/: outlined horizontal and stacked logos, symbol, black/ivory variants and transparent PNG exports.\neditable/: vector masters with live typography. Matching TTF files are in fonts/.\n\nWALLPAPERS\nThree color sets: ivory (jade logo), jade (ivory logo), sage (jade logo).\nLandscape 16:9: 3840x2160 and 1920x1080 PNG.\nPortrait 3:4: 1440x1920 PNG.\nPortrait 4:5: 1080x1350 PNG.\nStory / phone 9:16: 1080x1920 PNG.\nSquare 1:1: 1080x1080 PNG.\n\nFilename pattern: wallpapers/{color}-{orientation}-{ratio}-{width}x{height}.png\nExamples: wallpapers/ivory-landscape-16x9-3840x2160.png and wallpapers/sage-story-9x16-1080x1920.png.\nOutlined vectors: wallpapers/{color}-{orientation}-{ratio}.svg\nLive-type masters: editable/wallpapers/{color}-{orientation}-{ratio}.svg\nAll formats use the approved horizontal lockup, with identical typography and internal spacing. The logo spans 2200/3840 (57.2917%) of canvas width and is centered by visible artwork bounds. The reference is assets/brand/options/g-wallpaper-ivory.svg.\n\nThe older wallpaper-*.png and wallpaper-jade-*.png filenames remain available.\nsocial-preview.png: 1200x630 preview.\nfonts/: fonts and their licenses.\n\nRebuild from the repository with npm run brand.\nThe original G spacing and media pack remain in assets/brand/options/g-original-spacing/.\nThe original identity package remains in assets/brand/archive-original-a/.\nEarlier options remain in assets/brand/options/ and assets/brand/archive-v1/.\n`);

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
console.log(`Brand exported: ${exports.length} logo files, ${wallpapers.length} wallpaper variants (${wallpapers.reduce((total, item) => total + item.pngs.length, 0)} PNGs), legacy wallpapers, social preview, guide, fonts and ZIP (${files.length} entries).`);
console.log(`Descriptor gaps at minimum display widths: ${spacingChecks.map(check => `${check.shape} ${check.gapPixels}px at ${check.displayWidth}px`).join('; ')}.`);
