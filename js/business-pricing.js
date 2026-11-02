(function () {
  'use strict';
  const root = document.getElementById('plan-builder');
  if (!root) return;
  const modules = Array.from(root.querySelectorAll('#module-options input[type="checkbox"]'));
  const team = document.getElementById('team-size');
  const complete = document.getElementById('complete-plan');
  const output = document.getElementById('plan-estimate');
  const demoLink = document.getElementById('plan-demo-link');
  function update() {
    const raw = Number(team.value);
    const users = Number.isFinite(raw) && raw >= 1 && raw <= 100 && Number.isInteger(raw) ? raw : null;
    if (users === null) {
      output.textContent = 'Enter a whole number of users between 1 and 100.';
      if (demoLink) {
        demoLink.removeAttribute('href');
        demoLink.setAttribute('aria-disabled', 'true');
        demoLink.tabIndex = -1;
      }
      return;
    }
    if (demoLink) {
      const params = new URLSearchParams();
      const bundle = complete.checked ? 'complete' : 'modular';
      const selectedModules = complete.checked ? [] : modules
        .filter(input => input.checked).map(input => input.value);
      params.set('gcs_plan', bundle);
      params.set('gcs_users', String(users));
      if (selectedModules.length) params.set('gcs_modules', selectedModules.join(','));
      demoLink.setAttribute('href', '../request-demo/?' + params.toString());
      demoLink.removeAttribute('aria-disabled');
      demoLink.removeAttribute('tabindex');
    }
    const selected = modules.filter(input => input.checked).length;
    const blocks = Math.ceil(Math.max(0, users - 5) / 5);
    const custom = 20 + selected * 10 + blocks * 15;
    const all = 79 + blocks * 15;
    const total = complete.checked ? all : custom;
    modules.forEach(input => { input.disabled = complete.checked; });
    output.textContent = 'Estimated total: $' + total + '/month for ' + users + ' user' + (users === 1 ? '' : 's') + '. Modular: $' + custom + '/month; Complete: $' + all + '/month. Illustrative pricing only.';
  }
  root.addEventListener('change', update);
  team.addEventListener('input', update);
  update();
})();
