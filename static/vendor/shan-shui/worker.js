/* Drawing primitives: Copyright (c) 2018 Lingdong Huang, MIT; see LICENSE.
 * Footer adaptation: deterministic forward tiles, bounded feature cache.
 * This worker owns all upstream scratch globals; no page globals are changed.
 */
importScripts('./primitives.js');

const TILE_WIDTH = 1024;
const SCENE_HEIGHT = 420;
const MAX_FEATURES = 9;
const features = new Map();
let sceneSeed = 20261011;

function ink(svg) {
  return svg
    .replace(/rgba?\((\d+),(\d+),(\d+)(?:,([\d.]+))?\)/g, (_, red, green, blue, opacity) => {
      const shade = (Number(red) + Number(green) + Number(blue)) / 3;
      const strength = Math.max(0, Math.min(1, (255 - shade) / 200));
      // Preserve opaque fills: alpha-blending the tessellated distant hills
      // would darken overlapping triangles and create distracting facets.
      if (opacity === undefined) {
        const paper = [247, 243, 235];
        const pigment = [48, 69, 59];
        return `rgb(${paper.map((value, i) => Math.round(value + (pigment[i] - value) * strength)).join(',')})`;
      }
      const alpha = strength * Number(opacity);
      return `rgba(48,69,59,${Math.max(0, alpha).toFixed(3)})`;
    })
    .replace(/\bwhite\b/g, '#F7F3EB')
    .replace(/\bblack\b/g, '#30453B');
}

function region(index) {
  if (features.has(index)) return features.get(index);
  const art = self.ShanShui;
  art.seed((sceneSeed ^ Math.imul(index + 137, 0x45d9f3b)) >>> 0);
  const random = art.random;
  const x = index * TILE_WIDTH;
  const objects = [];
  const add = (depth, svg) => objects.push({ depth, svg: ink(svg) });
  add(0, art.distantMountain(x - 90, 205 + random() * 25, random() * 100, {
    // Upstream sampling expects a length divisible by span (10) * seg (5).
    hei: 160 + random() * 85, len: random() > 0.5 ? 1000 : 1250, seg: 5,
  }));
  const center = x + 260 + random() * 240;
  const shore = 280 + random() * 25;
  add(1, art.water(center, shore + 18, random(), { len: 1000, clu: 12, hei: 2 }));
  add(shore, art.mountain(center, shore, random() * 100, {
    hei: 350 + random() * 140, wid: 500 + random() * 220,
  }));
  const nearShore = 325 + random() * 25;
  add(1, art.water(x + 780, nearShore + 25, random(), { len: 950, clu: 10, hei: 2 }));
  add(nearShore, art.mountain(x + 740 + random() * 100, nearShore, random() * 100, {
    hei: 290 + random() * 160, wid: 430 + random() * 170,
  }));
  // Upstream flatMount adds its own mature trees, rocks and occasional cottages.
  const bankX = x + 160 + random() * 280;
  const bankY = 370 + random() * 10;
  add(bankY, art.flatMountain(bankX, bankY, random() * 100, {
    wid: 410 + random() * 120, hei: 65, cho: .55 + random() * .15,
  }));
  if (random() > .45) add(bankY + 1, art.pavilion(bankX + 50, bankY - 18, random(), {
    wid: 40 + random() * 20, sto: 1, rot: .3 + random() * .4, sty: 1,
  }));
  add(400, art.boat(x + 650 + random() * 170, 380 + random() * 18, random(), {
    sca: .42 + random() * .13, fli: random() > .5,
  }));
  features.set(index, objects);
  while (features.size > MAX_FEATURES) features.delete(features.keys().next().value);
  return objects;
}

self.onmessage = ({ data }) => {
  try {
    if (data.type === 'init') {
      sceneSeed = Number(data.seed) >>> 0;
      features.clear();
      self.ShanShui.noiseSeed(sceneSeed);
      return;
    }
    if (!['render', 'poster'].includes(data.type) || !Number.isSafeInteger(data.index)) return;
    const index = data.index;
    const panelCount = data.type === 'poster' ? 3 : 1;
    // Each panel includes its neighbors. Shared objects have identical geometry
    // and depth ordering at every edge; new regions are generated as we advance.
    const indices = Array.from({ length: panelCount + 2 }, (_, i) => index - 1 + i);
    const objects = indices.flatMap(region)
      .sort((a, b) => a.depth - b.depth);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${TILE_WIDTH * panelCount}" height="${SCENE_HEIGHT}" viewBox="${index * TILE_WIDTH} 0 ${TILE_WIDTH * panelCount} ${SCENE_HEIGHT}"><rect x="${index * TILE_WIDTH}" width="${TILE_WIDTH * panelCount}" height="${SCENE_HEIGHT}" fill="#F7F3EB"/>${objects.map((object) => object.svg).join('')}</svg>`;
    if (/NaN|Infinity/.test(svg)) throw new Error('Invalid landscape geometry.');
    self.postMessage({ type: 'tile', index, svg, featureCount: features.size });
  } catch (error) {
    self.postMessage({ type: 'error', message: error.message });
  }
};
