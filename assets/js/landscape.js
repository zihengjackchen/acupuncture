/* Local, progressively enhanced footer. SVG generation stays in a worker;
 * the page retains a bounded set of rasterized tiles and one canvas. */
(() => {
  const TILE = 1024;
  const HEIGHT = 420;
  const MAX_TILES = 10;
  const SPEED = 6; // CSS pixels per second, independent of refresh rate.

  function mount(section) {
    if (section.harmonyLandscape) return;
    const canvas = section.querySelector('canvas');
    const viewport = section.querySelector('.harmony-landscape__view');
    const toggle = section.querySelector('[data-landscape-toggle]');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context || !window.Worker || !window.IntersectionObserver) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const tiles = new Map();
    const objectURLs = new Set();
    let worker = null;
    let busy = false;
    let destroyed = false;
    let failed = false;
    let near = false;
    let visible = false;
    let paused = false;
    let frame = 0;
    let previousTime = 0;
    let offset = 0;
    let width = 1;
    let height = 1;
    let scale = 1;
    let generation = 0;
    let featureCount = 0;
    let generatedTiles = 0;

    const active = () => !destroyed && !failed && !reduced.matches && !document.hidden;
    const firstTile = () => Math.floor(offset / TILE);
    const lastTile = () => Math.floor((offset + width / scale) / TILE);
    const covered = () => {
      for (let index = firstTile(); index <= lastTile(); index++) if (!tiles.has(index)) return false;
      return true;
    };
    const stop = () => { cancelAnimationFrame(frame); frame = 0; previousTime = 0; };
    const release = () => {
      generation++;
      worker?.terminate();
      worker = null;
      busy = false;
      for (const url of objectURLs) URL.revokeObjectURL(url);
      objectURLs.clear();
      tiles.clear();
    };

    function paint() {
      if (!covered()) return;
      context.fillStyle = '#F7F3EB';
      context.fillRect(0, 0, width, height);
      for (let index = firstTile(); index <= lastTile(); index++) {
        const x = (index * TILE - offset) * scale;
        context.drawImage(tiles.get(index), x, height - HEIGHT * scale, TILE * scale + .5, HEIGHT * scale);
      }
      section.classList.add('is-ready');
    }

    function trim() {
      const first = firstTile();
      for (const [index] of tiles) {
        if (index < first - 1 || index > lastTile() + 2) tiles.delete(index);
      }
      while (tiles.size > MAX_TILES) tiles.delete(tiles.keys().next().value);
    }

    function requestTile() {
      if (!worker || busy || !active() || !near || (paused && covered())) return;
      for (let index = firstTile(); index <= lastTile() + 2; index++) {
        if (!tiles.has(index)) {
          busy = true;
          worker.postMessage({ type: 'render', index });
          return;
        }
      }
    }

    function fail() {
      failed = true;
      stop();
      release();
      section.classList.remove('is-ready');
      toggle.hidden = true;
    }

    function createWorker() {
      if (worker || failed || !active()) return;
      const epoch = generation;
      try {
        worker = new Worker(section.dataset.workerUrl);
        worker.onerror = fail;
        worker.onmessage = async ({ data }) => {
          if (destroyed || epoch !== generation) return;
          if (data.type !== 'tile') { fail(); return; }
          const url = URL.createObjectURL(new Blob([data.svg], { type: 'image/svg+xml' }));
          objectURLs.add(url);
          try {
            const image = new Image();
            image.src = url;
            await image.decode();
            if (destroyed || epoch !== generation) return;
            tiles.set(data.index, image);
            featureCount = data.featureCount;
            generatedTiles++;
            busy = false;
            trim();
            paint();
            requestTile();
            start();
          } catch { if (!destroyed && epoch === generation) fail(); }
          finally { URL.revokeObjectURL(url); objectURLs.delete(url); }
        };
        const entropy = new Uint32Array(1);
        window.crypto.getRandomValues(entropy);
        worker.postMessage({ type: 'init', seed: entropy[0] });
        toggle.hidden = false;
      } catch { fail(); }
    }

    function tick(time) {
      frame = 0;
      if (!active() || !visible || paused) { previousTime = 0; return; }
      const elapsed = previousTime ? Math.min((time - previousTime) / 1000, .08) : 0;
      previousTime = time;
      const nextOffset = offset + elapsed * SPEED / scale;
      const nextLast = Math.floor((nextOffset + width / scale) / TILE);
      // Never expose an empty seam if a low-powered device needs more time.
      if (covered() && tiles.has(nextLast)) offset = nextOffset;
      trim();
      paint();
      requestTile();
      frame = requestAnimationFrame(tick);
    }

    function start() {
      if (!frame && active() && visible && !paused && covered()) frame = requestAnimationFrame(tick);
    }

    function sync() {
      if (!active() || !visible || paused) stop();
      if (reduced.matches) {
        release();
        section.classList.remove('is-ready');
        toggle.hidden = true;
        return;
      }
      if (active() && near) { createWorker(); requestTile(); start(); }
    }

    function resize() {
      const bounds = viewport.getBoundingClientRect();
      width = Math.max(1, bounds.width);
      height = Math.max(1, bounds.height);
      // Limit even ultrawide displays to six visible scene panels.
      scale = Math.max(height / HEIGHT, width / (TILE * 6));
      const density = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * density);
      canvas.height = Math.round(height * density);
      context.setTransform(density, 0, 0, density, 0, 0);
      trim();
      paint();
      if (!covered()) section.classList.remove('is-ready');
      sync();
    }

    function onToggle() {
      paused = !paused;
      toggle.textContent = paused ? 'Play landscape' : 'Pause landscape';
      toggle.setAttribute('aria-pressed', String(paused));
      sync();
    }

    const warmupObserver = new IntersectionObserver(([entry]) => {
      near = entry.isIntersecting;
      sync();
    }, { rootMargin: '180px 0px' });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      sync();
    });
    const resizeObserver = window.ResizeObserver ? new ResizeObserver(resize) : null;
    const onPageHide = (event) => { stop(); if (!event.persisted) destroy(); };
    const onPageShow = () => sync();

    function destroy() {
      if (destroyed) return;
      destroyed = true;
      stop();
      release();
      warmupObserver.disconnect();
      visibilityObserver.disconnect();
      resizeObserver?.disconnect();
      reduced.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', sync);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pagehide', onPageHide);
      window.removeEventListener('pageshow', onPageShow);
      toggle.removeEventListener('click', onToggle);
      toggle.hidden = true;
      section.classList.remove('is-ready');
    }

    section.harmonyLandscape = {
      destroy,
      get diagnostics() {
        return { tiles: tiles.size, maxTiles: MAX_TILES, featureCount, maxFeatures: 9,
          generatedTiles, firstTile: firstTile(), offset, running: Boolean(frame), paused,
          visible, reducedMotion: reduced.matches, pending: busy, objectURLs: objectURLs.size, destroyed, failed };
      },
    };
    toggle.addEventListener('click', onToggle);
    reduced.addEventListener('change', sync);
    document.addEventListener('visibilitychange', sync);
    window.addEventListener('pagehide', onPageHide);
    window.addEventListener('pageshow', onPageShow);
    if (resizeObserver) resizeObserver.observe(viewport);
    else window.addEventListener('resize', resize);
    resize();
    warmupObserver.observe(section);
    visibilityObserver.observe(section);
  }

  document.querySelectorAll('[data-landscape]').forEach(mount);
})();
