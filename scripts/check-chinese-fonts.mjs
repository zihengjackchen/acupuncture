import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'assets/fonts/chinese-coverage.json'), 'utf8'));
const included = new Set(manifest.codepoints);
const punctuation = new Set([0xB7, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2026]);
const isChinese = cp => (cp >= 0x2E80 && cp <= 0x9FFF) || (cp >= 0xF900 && cp <= 0xFAFF)
  || (cp >= 0xFE10 && cp <= 0xFE1F) || (cp >= 0xFE30 && cp <= 0xFE4F)
  || (cp >= 0xFF00 && cp <= 0xFFEF) || (cp >= 0x20000 && cp <= 0x323AF) || punctuation.has(cp);
const required = new Set([...'中文'].map(char => char.codePointAt(0)));
for (const [folder, pattern] of [['content', /\.zh\.md$/], ['i18n', /^zh\.yaml$/], ['layouts', /\.html$/], ['assets/js', /\.js$/], ['data', /\.(json|ya?ml)$/]]) {
  for (const filename of await fs.readdir(path.join(root, folder), { recursive: true })) {
    if (!pattern.test(filename)) continue;
    const text = await fs.readFile(path.join(root, folder, filename), 'utf8');
    for (const char of text) {
      const cp = char.codePointAt(0);
      if (isChinese(cp)) required.add(cp);
    }
  }
}
const missing = [...required].filter(cp => !included.has(cp)).sort((a, b) => a - b);
assert.deepEqual(missing.map(cp => `${String.fromCodePoint(cp)} U+${cp.toString(16).toUpperCase()}`), [],
  'New Chinese characters need fonts regenerated: python scripts/prepare-chinese-fonts.py');
assert.deepEqual(manifest.weights, [400, 600]);
assert.deepEqual(manifest.fonts.map(font => font.file), ['noto-serif-sc-variable.woff2', 'noto-sans-sc-variable.woff2']);
for (const font of manifest.fonts) {
  const bytes = await fs.readFile(path.join(root, 'static/fonts', font.file));
  assert.equal(bytes.toString('ascii', 0, 4), 'wOF2', `${font.file} is WOFF2`);
  assert.equal(bytes.length, font.bytes, `${font.file} size matches its manifest`);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), font.sha256, `${font.file} checksum matches its verified glyph coverage`);
}
console.log(`Chinese fonts cover ${required.size} source characters; both WOFF2 files and weights match the manifest.`);
