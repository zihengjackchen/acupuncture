/** Rebuild the pinned, locally hosted Shan Shui primitives and static fallback. */
import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';

const revision = '9f754d2b2e73495db7883d4d4055a7b0903b0454';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const destination = path.join(root, 'static/vendor/shan-shui');
const source = `https://raw.githubusercontent.com/LingDong-/shan-shui-inf/${revision}/`;
const get = async (name) => {
  const response = await fetch(source + name);
  if (!response.ok) throw new Error(`Cannot download ${name}: ${response.status}`);
  return response.text();
};
const [html, license] = await Promise.all([get('index.html'), get('LICENSE')]);
const start = html.indexOf('<script id="PerlinNoise">');
const end = html.indexOf('  function mountplanner(');
if (start < 0 || end <= start) throw new Error('Pinned upstream source layout changed.');
const primitives = html.slice(start, end)
  .replace(/<\/?script[^>]*>/g, '')
  // Clamp roundoff for degenerate triangles before Heron's square root.
  .replace('Math.sqrt(s * (s - a) * (s - b) * (s - c))',
    'Math.sqrt(Math.max(0, s * (s - a) * (s - b) * (s - c)))')
  // A footer needs fewer tiny ornaments than the original full-screen artwork.
  .replace('function vegetate(treeFunc, growthRule, proofRule) {',
    'var vegetationBudget = 12;\n      function vegetate(treeFunc, growthRule, proofRule) {')
  .replace('if (proofRule(veglist, i)) {', 'if (vegetationBudget-- > 0 && proofRule(veglist, i)) {')
  .replace(/      \/\/TRANSM[\s\S]*?(?=      \/\/BOTT ROCK)/, '')
  .replace('area: 100,\n          convex: true,', 'area: 900,\n          convex: true,')
  .replace(/^.*console\.log\(.*$/gm, '');
const adapted = `/*\n${license}\nAdapted from ${source}index.html\nOnly the drawing primitives are retained. Browser UI and global PRNG are excluded.\n*/\n(function (scope) {\nvar Math = Object.create(globalThis.Math);\nvar randomState = 1;\nMath.random = function () {\n  var t = randomState = (randomState + 0x6D2B79F5) | 0;\n  t = Math.imul(t ^ (t >>> 15), t | 1);\n  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n};\n${primitives}\nscope.ShanShui = {\n  mountain: Mount.mountain, distantMountain: Mount.distMount,\n  tree: Tree.tree02, water: water, boat: Arch.boat01,\n  random: Math.random,\n  seed: function (seed) { randomState = seed | 0; },\n  noiseSeed: function (seed) { Noise.noiseSeed(seed); }\n};\n})(self);\n`;
await mkdir(destination, { recursive: true });
await writeFile(path.join(destination, 'primitives.js'), adapted);
await writeFile(path.join(destination, 'LICENSE'), license);
await writeFile(path.join(destination, 'ORIGIN.txt'), `Shan, Shui by Lingdong Huang\nhttps://github.com/LingDong-/shan-shui-inf\nRevision: ${revision}\nLicense: MIT (see LICENSE)\n\nAdaptation: isolated drawing primitives with local seeded randomness;\na new bounded tile planner, worker, canvas playback, and static fallback.\nRegenerate using: node scripts/prepare-landscape.mjs\n`);

// The same deterministic renderer supplies the no-JavaScript illustration.
const workerSource = await readFile(path.join(destination, 'worker.js'), 'utf8');
let reply;
const scope = { console, Math, Map, Number, self: null, postMessage: (value) => { reply = value; } };
scope.self = scope;
const context = vm.createContext(scope);
scope.importScripts = () => vm.runInContext(adapted, context);
vm.runInContext(workerSource, context);
scope.onmessage({ data: { type: 'init', seed: 20261011 } });
scope.onmessage({ data: { type: 'poster', index: 0 } });
if (reply.type !== 'tile') throw new Error(reply.message || 'Fallback rendering failed.');
await writeFile(path.join(destination, 'fallback.svg'), reply.svg);
console.log('Prepared local Shan Shui primitives, MIT notice, and deterministic fallback.');
