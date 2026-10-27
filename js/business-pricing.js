(function () {
  'use strict';
  const root = document.getElementById('plan-builder');
  if (!root) return;
  const modules = Array.from(root.querySelectorAll('#module-options input[type="checkbox"]'));
  const team = document.getElementById('team-size');
  const complete = document.getElementById('complete-plan');
  const output = document.getElementById('plan-estimate');
  function update() {
    const raw = Number(team.value);
    const users = Number.isFinite(raw) && raw >= 1 && raw <= 100 && Number.isInteger(raw) ? raw : null;
    if (users === null) {
      output.textContent = 'Enter a whole number of users between 1 and 100.';
      return;
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
