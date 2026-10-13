(() => {
  const root = document.querySelector('[data-coverage]');
  if (!root) return;
  const records = JSON.parse(root.querySelector('[data-coverage-records]').textContent);
  const recordByZip = new Map(records.map(record => [record.zip, record]));
  const svg = root.querySelector('.coverage-svg');
  const regions = [...root.querySelectorAll('.coverage-region')];
  const pathByZip = new Map(regions.map(path => [path.dataset.zip, path]));
  const form = root.querySelector('[data-coverage-form]');
  const input = form.querySelector('input');
  const title = root.querySelector('[data-coverage-result-title]');
  const text = root.querySelector('[data-coverage-result-text]');
  const defaultView = '0 0 900 720';
  let selected = null;
  let focusIndex = 0;
  form.hidden = false;
  root.querySelector('[data-coverage-tools]').hidden = false;
  if (regions.length) regions[0].setAttribute('tabindex', '0');

  function clearSelection() {
    if (selected) {
      selected.classList.remove('is-selected');
      selected.setAttribute('aria-pressed', 'false');
    }
    selected = null;
  }

  function selectZip(zip, zoom = false) {
    clearSelection();
    const record = recordByZip.get(zip);
    input.value = zip;
    if (!record) {
      svg.setAttribute('viewBox', defaultView);
      title.textContent = `We cannot confirm coverage for ${zip}.`;
      text.textContent = 'This ZIP is not in the mapped service area. Some postal-only ZIPs have no map boundary. Call 847-786-0066 to check your street address or book a clinic visit.';
      return;
    }
    title.textContent = `${zip} · ${record.locality}`;
    selected = pathByZip.get(zip);
    if (selected) {
      selected.classList.add('is-selected');
      selected.setAttribute('aria-pressed', 'true');
      regions[focusIndex].setAttribute('tabindex', '-1');
      focusIndex = regions.indexOf(selected);
      selected.setAttribute('tabindex', '0');
      text.textContent = 'Dan accepts mobile requests throughout this ZIP area. Call to confirm your address, appointment, and travel fee.';
      if (zoom) {
        const bounds = selected.getBBox();
        const width = Math.max(bounds.width + 80, 180);
        const height = Math.max(bounds.height + 80, width * 0.8);
        const fittedWidth = Math.max(width, height / 0.8);
        svg.setAttribute('viewBox', `${bounds.x + bounds.width / 2 - fittedWidth / 2} ${bounds.y + bounds.height / 2 - height / 2} ${fittedWidth} ${height}`);
      }
    } else {
      svg.setAttribute('viewBox', defaultView);
      text.textContent = 'Call to confirm whether your street address is within the mobile service area and ask about the travel fee.';
    }
  }

  form.addEventListener('submit', event => {
    event.preventDefault();
    const zip = input.value.trim();
    if (!/^\d{5}$/.test(zip)) {
      title.textContent = 'Enter a five-digit ZIP code.';
      text.textContent = 'For example, 60035 for Highland Park.';
      input.focus();
      return;
    }
    selectZip(zip, true);
  });

  svg.addEventListener('click', event => {
    const path = event.target.closest('.coverage-region');
    if (path) selectZip(path.dataset.zip);
  });
  svg.addEventListener('focusin', event => {
    const path = event.target.closest('.coverage-region');
    if (path) selectZip(path.dataset.zip);
  });
  svg.addEventListener('keydown', event => {
    if (!event.target.matches('.coverage-region')) return;
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      let next = focusIndex;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = regions.length - 1;
      else next = (focusIndex + (['ArrowRight', 'ArrowDown'].includes(event.key) ? 1 : -1) + regions.length) % regions.length;
      svg.setAttribute('viewBox', defaultView);
      regions[next].focus();
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectZip(event.target.dataset.zip, true);
    } else if (event.key === 'Escape') {
      svg.setAttribute('viewBox', defaultView);
    }
  });

  root.querySelector('[data-coverage-reset]').addEventListener('click', () => {
    svg.setAttribute('viewBox', defaultView);
    clearSelection();
    input.value = '';
    title.textContent = 'Check your ZIP code.';
    text.textContent = `The service area includes ${records.length} ZIP areas, shown in full in green. Gray areas are outside it.`;
  });
  root.querySelectorAll('[data-coverage-zip]').forEach(button => {
    button.addEventListener('click', () => {
      selectZip(button.dataset.coverageZip, true);
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      root.querySelector('.coverage-map-frame').scrollIntoView({ behavior: reducedMotion ? 'instant' : 'smooth', block: 'center' });
      input.focus({ preventScroll: true });
    });
  });
})();
