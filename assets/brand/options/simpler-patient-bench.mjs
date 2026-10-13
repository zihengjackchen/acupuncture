import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { Resvg } from '@resvg/resvg-js';

const source = await readFile('static/images/logo/logo.svg', 'utf8');
const paths = [...source.matchAll(/<path\b[^>]*\/>/g)].map(match => match[0]);
assert.equal(paths.length, 42);
// Preserve the original lower frame, which shared a path with the old bench.
const lowerFrameCurve = paths[5].match(/C 353\.596[\s\S]+?323\.361 552\.141/)[0];
const lowerFrame = `<path d="M 353.781 542.127 ${lowerFrameCurve} Q 339.373 545.738 353.781 542.127 Z" fill="rgb(77,132,98)"/>`;
const patient = `<g fill="none" stroke="rgb(77,140,108)" stroke-width="4.8" stroke-linecap="round" stroke-linejoin="round">
  <ellipse cx="152" cy="468" rx="22" ry="18"/>
  <path d="M 182 463 C 198 447 216 444 239 451 C 259 457 269 460 287 453 C 309 444 324 464 357 468 L 357 493 L 199 493 C 187 493 181 487 181 478 Z"/>
</g>
<g fill="none" stroke="rgb(77,140,108)" stroke-width="2.6" stroke-linecap="round">
  <path d="M 210 445 L 213 420 M 238 447 L 245 423"/>
  <path d="M 211.5 420 L 212.5 414 M 244 423 L 246 417" stroke-width="4"/>
</g>`;
const bench = `<g fill="rgb(77,132,98)"><rect x="134" y="506" width="226" height="8" rx="2"/><rect x="165" y="513" width="8" height="44"/><rect x="329" y="513" width="8" height="103"/></g>`;
const simplified = paths.map((path, index) => {
  if (index === 3) return patient;
  if (index === 5) return bench + lowerFrame;
  if (index === 4 || (index >= 6 && index <= 13) || index === 15) return '';
  return path;
});
for (const index of [0, 1, 2, 14, 16, 17, ...Array.from({ length: 24 }, (_, i) => i + 18)]) {
  assert.equal(simplified[index], paths[index], 'Original frame, practitioner and lettering must be retained.');
}
const wrap = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
const lockup = list => wrap(1321.4, 351.48, `<g transform="translate(-72.64 -276.13)">${list.join('')}</g>`);
const icon = list => wrap(160, 160, `<g transform="translate(0 8.67) scale(.430385) translate(-82.64 -286.13)">${list.slice(0, 18).join('')}</g>`);
const edited = lockup(simplified);
const editedIcon = icon(simplified);
const original = lockup(paths);
const font = { loadSystemFonts: false, fontFiles: ['assets/brand/fonts/DMSans.ttf'] };
const raster = (svg, width) => new Resvg(svg, { font, fitTo: { mode: 'width', value: width } }).render().asPng();
const inner = svg => svg.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
await writeFile('assets/brand/options/f-simpler-patient-bench.svg', edited);
await writeFile('assets/brand/options/f-simpler-patient-bench.png', raster(edited, 1800));
await writeFile('assets/brand/options/f-simpler-symbol.svg', editedIcon);
await writeFile('assets/brand/options/f-simpler-symbol-64.png', raster(editedIcon, 64));
const preview = wrap(1800, 1280, `<rect width="1800" height="1280" fill="#f7f3eb"/>
<g font-family="DM Sans" fill="#26352e"><text x="80" y="80" font-size="36" font-weight="500">F / A simpler reclining person and bench</text><text x="80" y="128" font-size="24">The original practitioner, curved frame, colors and lettering stay the same.</text></g>
<g transform="translate(105 214) scale(1.2)">${inner(edited)}</g>
<line x1="80" y1="695" x2="1720" y2="695" stroke="#d1dacf"/>
<g font-family="DM Sans" fill="#526459" font-size="23"><text x="80" y="755">320 px header</text><text x="770" y="755">64 px icon</text><text x="1100" y="755">Original reference</text></g>
<rect x="80" y="790" width="600" height="145" rx="3" fill="#fffdf8"/>
<g transform="translate(110 825) scale(.2421674)">${inner(edited)}</g>
<g transform="translate(805 833) scale(.4)">${inner(editedIcon)}</g>
<g transform="translate(1100 805) scale(.43)">${inner(original)}</g>
<g font-family="DM Sans" fill="#526459" font-size="24"><text x="80" y="1045">An oval head, one smooth body outline, two needles.</text><text x="80" y="1084">A flat treatment surface and two straight legs.</text><text x="80" y="1195" font-size="21">Preview only. The current site still uses the original logo.</text></g>`);
await writeFile('assets/brand/options/f-simpler-comparison.svg', preview);
await writeFile('assets/brand/options/f-simpler-comparison.png', raster(preview, 1800));
console.log('F preview generated. Production artwork unchanged.');
