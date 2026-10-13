import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Resvg } from '@resvg/resvg-js';

const source = await readFile('static/images/logo/logo.svg', 'utf8');
const paths = [...source.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]);
assert.equal(paths.length, 42);
const remove = new Set([6, 7, 8, 9, 10, 11, 12, 13]);
const simplify = (path, index) => {
  if (remove.has(index)) return '';
  if (index === 0 || index === 1) return path.replace(/fill="[^"]+"/, 'fill="#2f68a3"');
  if (index === 3) return path.replace('/>', ' stroke="rgb(77,140,108)" stroke-width="1.2" stroke-linejoin="round"/>');
  return path;
};
const reduced = paths.map(simplify);
const wrap = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
const lockup = list => wrap(1321.4, 351.48, `<g transform="translate(-72.64 -276.13)">${list.join('')}</g>`);
const icon = list => wrap(160, 160, `<g transform="translate(0 8.67) scale(.430385) translate(-82.64 -286.13)">${list.slice(0, 18).join('')}</g>`);
const original = lockup(paths);
const edited = lockup(reduced);
const originalIcon = icon(paths);
const editedIcon = icon(reduced);
const font = { loadSystemFonts: false, fontFiles: ['assets/brand/fonts/DMSans.ttf'] };
const raster = (svg, width) => new Resvg(svg, { font, fitTo: { mode: 'width', value: width } }).render().asPng();
const inner = svg => svg.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
await writeFile('assets/brand/options/e-faithful-reduction.svg', edited);
await writeFile('assets/brand/options/e-faithful-symbol.svg', editedIcon);
await writeFile('assets/brand/options/e-faithful-reduction.png', raster(edited, 1600));
await writeFile('assets/brand/options/e-faithful-symbol-64.png', raster(editedIcon, 64));

let preview = wrap(1800, 1240, `<rect width="1800" height="1240" fill="#f7f3eb"/>
  <g font-family="DM Sans" fill="#26352e"><text x="70" y="77" font-size="34" font-weight="500">Original / a small simplification</text><text x="70" y="121" font-size="23">Same practitioner, patient, curved frame, colors and serif lettering.</text></g>
  <text x="70" y="198" font-family="DM Sans" font-size="28" fill="#28594b">Original</text>
  <text x="958" y="198" font-family="DM Sans" font-size="28" fill="#28594b">E / Fewer details</text>
  <g transform="translate(62 245) scale(.575)">${inner(original)}</g>
  <g transform="translate(950 245) scale(.575)">${inner(edited)}</g>
  <line x1="900" y1="173" x2="900" y2="1118" stroke="#d1dacf"/>
  <g font-family="DM Sans" fill="#526459" font-size="21"><text x="958" y="514">Two needles. No small back dots.</text><text x="958" y="548">Stronger patient outline; one blue tone in the lower curve.</text></g>
  <line x1="70" y1="607" x2="1730" y2="607" stroke="#d1dacf"/>
  <text x="70" y="669" font-family="DM Sans" font-size="26" fill="#26352e">At 320 px wide</text>
  <text x="958" y="669" font-family="DM Sans" font-size="26" fill="#26352e">At 320 px wide</text>
  <rect x="70" y="704" width="760" height="151" fill="#fffdf8"/>
  <rect x="958" y="704" width="760" height="151" fill="#fffdf8"/>
  <g transform="translate(100 738) scale(.2421674)">${inner(original)}</g>
  <g transform="translate(988 738) scale(.2421674)">${inner(edited)}</g>
  <text x="70" y="941" font-family="DM Sans" font-size="26" fill="#26352e">64 px icon</text>
  <text x="958" y="941" font-family="DM Sans" font-size="26" fill="#26352e">64 px icon</text>
  <g transform="translate(90 987) scale(.4)">${inner(originalIcon)}</g>
  <g transform="translate(978 987) scale(.4)">${inner(editedIcon)}</g>
  <text x="70" y="1175" font-family="DM Sans" font-size="21" fill="#526459">Preview only. The original artwork remains unchanged.</text>`);
await writeFile('assets/brand/options/e-faithful-comparison.svg', preview);
await writeFile('assets/brand/options/e-faithful-comparison.png', raster(preview, 1800));
console.log('Faithful reduction saved; original artwork is unchanged.');
