import { readFile, writeFile } from 'node:fs/promises';
import { Resvg } from '@resvg/resvg-js';

const ink = '#28594b';
const font = { loadSystemFonts: false, fontFiles: ['assets/brand/fonts/DMSans.ttf'] };
const symbol = `<g fill="${ink}">
  <circle cx="29" cy="82" r="12"/>
  <path d="M47 91c16-20 35-19 56 2l38 3v12H47Z"/>
  <path d="M17 115h127v9H17Zm8 9h9v16h-9Zm102 0h9v16h-9Z"/>
  <path d="M82 30a4 4 0 0 1 8 0v22h-8Z"/>
  <path d="M84 51h4v29l-2 6-2-6Z"/>
</g>`;
const wrap = (width, height, content) => `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${content}</svg>`;
const mark = wrap(160, 160, symbol);
const lockup = wrap(760, 180, `<g transform="translate(8 4)">${symbol}</g><g fill="${ink}"><text x="202" y="87" font-family="DM Sans" font-size="61" font-weight="650" letter-spacing="-1.6">Wang’s Harmony</text><text x="205" y="133" font-family="DM Sans" font-size="25" font-weight="500" letter-spacing="3.1">ACUPUNCTURE</text></g>`);
const outlined = svg => new Resvg(svg, { font }).toString();
const raster = (svg, width) => new Resvg(svg, { font, fitTo: { mode: 'width', value: width } }).render().asPng();
await writeFile('assets/brand/options/d-simple-symbol.svg', outlined(mark));
await writeFile('assets/brand/options/d-simple-lockup.svg', outlined(lockup));
await writeFile('assets/brand/options/d-simple-lockup-editable.svg', lockup);
await writeFile('assets/brand/options/d-simple-symbol-32.png', raster(mark, 32));
await writeFile('assets/brand/options/d-simple-symbol-64.png', raster(mark, 64));
await writeFile('assets/brand/options/d-simple-lockup.png', raster(lockup, 1520));
const body = source => source.trim().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
const full = body(outlined(lockup));
const small = body(outlined(mark));
const preview = wrap(1800, 1270, `<rect width="1800" height="1270" fill="#f7f3eb"/>
  <g font-family="DM Sans" fill="#26352e"><text x="90" y="85" font-size="34" font-weight="500">A simpler treatment mark</text><text x="90" y="130" font-size="23">The reclining patient and one needle remain. The wordmark has two clear lines.</text></g>
  <g transform="translate(216 195) scale(1.8)">${full}</g>
  <line x1="90" y1="600" x2="1710" y2="600" stroke="#c9d5c4"/>
  <text x="90" y="664" font-family="DM Sans" font-size="27" fill="#26352e">At website header size</text>
  <rect x="90" y="709" width="1620" height="140" rx="3" fill="#fffdf8"/>
  <g transform="translate(130 744) scale(.3947368)">${full}</g>
  <g font-family="DM Sans" font-size="20" fill="#526459"><text x="900" y="789">About</text><text x="1017" y="789">Services</text><text x="1155" y="789">Locations</text></g>
  <rect x="1410" y="752" width="244" height="58" rx="3" fill="#28594b"/><text x="1451" y="790" font-family="DM Sans" font-size="19" fill="#f7f3eb">Book a visit</text>
  <text x="90" y="963" font-family="DM Sans" font-size="27" fill="#26352e">Small-size check</text>
  <g transform="translate(110 1012) scale(.2)">${small}</g><text x="177" y="1036" font-family="DM Sans" font-size="20" fill="#526459">32 px</text>
  <g transform="translate(351 997) scale(.4)">${small}</g><text x="453" y="1036" font-family="DM Sans" font-size="20" fill="#526459">64 px</text>
  <g transform="translate(659 971) scale(.8)">${small}</g><text x="827" y="1036" font-family="DM Sans" font-size="20" fill="#526459">128 px</text>
  <text x="90" y="1189" font-family="DM Sans" font-size="21" fill="#526459">Preview only. The original logo stays in use until you choose.</text>`);
await writeFile('assets/brand/options/d-simple-preview.svg', preview);
await writeFile('assets/brand/options/d-simple-preview.png', raster(preview, 1800));
console.log('Saved simpler vector concept and large/header/32px comparison.');
