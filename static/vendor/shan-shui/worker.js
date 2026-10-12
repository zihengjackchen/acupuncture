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
      const strength = Math.max(0, Math.min(0.9, (255 - shade) / 180));
      // Preserve opaque fills: alpha-blending the tessellated distant hills
      // would darken overlapping triangles and create distracting facets.
      if (opacity === undefined) {
        const paper = [247, 243, 235];
        const pigment = [79, 107, 97];
        return `rgb(${paper.map((value, i) => Math.round(value + (pigment[i] - value) * strength)).join(',')})`;
      }
      const alpha = strength * Number(opacity);
      return `rgba(79,107,97,${Math.max(0, alpha).toFixed(3)})`;
    })
    .replace(/\bwhite\b/g, '#F7F3EB')
    .replace(/\bblack\b/g, '#4F6B61');
}

function region(index) {
  if (features.has(index)) return features.get(index);
  const art = self.ShanShui;
  art.seed((sceneSeed ^ Math.imul(index + 137, 0x45d9f3b)) >>> 0);
  const random = art.random;
  const x = index * TILE_WIDTH;
  const objects = [];
  const add = (depth, svg) => objects.push({ depth, svg: ink(svg) });
  add(0, art.distantMountain(x - 90, 230 + random() * 25, random() * 100, {
    // Upstream sampling expects a length divisible by span (10) * seg (5).
    hei: 130 + random() * 85, len: random() > 0.5 ? 1000 : 1250, seg: 5,
  }));
  const center = x + 310 + random() * 390;
  const shore = 320 + random() * 35;
  add(1, art.water(center, shore + 14, random(), { len: 800, clu: 5, hei: 1.4 }));
  add(shore, art.mountain(center, shore, random() * 100, {
      hei: 220 + random() * 170, wid: 490 + random() * 260, tex: 50, veg: false,
  }));
  if (random() > 0.3) {
    const nearShore = 365 + random() * 15;
    add(nearShore, art.mountain(x + 900 + random() * 90, nearShore, random() * 100, {
      hei: 130 + random() * 100, wid: 320 + random() * 100, tex: 35, veg: false,
    }));
  }
  if (random() > 0.45) {
    add(390, art.boat(x + 95 + random() * 150, 370 + random() * 20, random(), {
      sca: 0.32 + random() * 0.1, fli: random() > 0.5,
    }));
  }
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
