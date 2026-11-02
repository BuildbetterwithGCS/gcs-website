(function () {
  'use strict';

  // Only non-personal, publicly described plan choices are accepted from the URL.
  // Do not place customer identities, company details, prices or tax IDs in links.
  const allowed = Object.freeze({
    workforce: 'Workforce & Time',
    operations: 'Jobs & Operations',
    finance: 'Finance & Invoicing',
    assets: 'Assets & Maintenance',
    procurement: 'Procurement',
    bids: 'Bid Discovery (planned)',
    analytics: 'Advanced Analytics',
    crm: 'Customers & CRM'
  });

  const query = new URLSearchParams(window.location.search);
  const bundle = query.get('gcs_plan');
  if (bundle !== 'modular' && bundle !== 'complete') return;

  const rawUsers = query.get('gcs_users') || '';
  if (!/^(?:[1-9]|[1-9][0-9]|100)$/.test(rawUsers)) return;
  const users = Number(rawUsers);
  const rawModules = query.get('gcs_modules') || '';
  const modules = rawModules ? rawModules.split(',') : [];

  if (modules.length > 8 ||
      new Set(modules).size !== modules.length ||
      modules.some(value => !Object.prototype.hasOwnProperty.call(allowed, value)) ||
      (bundle === 'complete' && modules.length)) return;

  const hiddenInput = document.getElementById('requested-plan');
  const preview = document.getElementById('plan-handoff');
  if (!hiddenInput || !preview) return;

  const selectedNames = bundle === 'complete'
    ? 'All eight proposed standard modules'
    : modules.length
      ? modules.map(name => allowed[name]).join(', ')
      : 'Core only';
  const summary = (bundle === 'complete' ? 'Complete' : 'Modular') +
    ' preview | ' + users + ' user' + (users === 1 ? '' : 's') +
    ' | ' + selectedNames;

  hiddenInput.value = summary;
  preview.textContent = 'Your selected plan: ' + summary +
    '. This is an inquiry, not a subscription or payment.';
  preview.hidden = false;

  // The actual business challenge remains required and editable by the visitor.
})();
