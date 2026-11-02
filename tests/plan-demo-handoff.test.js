/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'request-demo', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'js', 'plan-demo-handoff.js'), 'utf8');

function load(query) {
  window.history.replaceState({}, '', '/request-demo/' + query);
  document.open();
  document.write(html);
  document.close();
  window.eval(script);
  return {
    field: document.getElementById('requested-plan'),
    hint: document.getElementById('plan-handoff'),
    goals: document.getElementById('demo-goals')
  };
}

describe('public plan-interest handoff into Netlify demonstration request', () => {
  test('retains customer-editable problem field and no charged subscription', () => {
    const { field, hint, goals } = load('?gcs_plan=modular&gcs_users=11&gcs_modules=operations%2Cfinance');
    expect(field.value).toContain('Modular preview | 11 users');
    expect(field.value).toContain('Jobs & Operations, Finance & Invoicing');
    expect(hint.hidden).toBe(false);
    expect(hint.textContent).toContain('not a subscription or payment');
    expect(goals.required).toBe(true);
    expect(goals.value).toBe('');
    expect(html).toMatch(/name="demo-request"/);
  });

  test('complete bundle does not invent module selections', () => {
    const { field } = load('?gcs_plan=complete&gcs_users=5');
    expect(field.value).toContain('Complete preview | 5 users');
    expect(field.value).toContain('All eight proposed standard modules');
  });

  test.each([
    '?gcs_plan=complete&gcs_users=5&gcs_modules=finance',
    '?gcs_plan=modular&gcs_users=101',
    '?gcs_plan=modular&gcs_users=0',
    '?gcs_plan=modular&gcs_users=5&gcs_modules=operations%2Coperations',
    '?gcs_plan=modular&gcs_users=5&gcs_modules=invalid',
    '?gcs_plan=modular&gcs_users=5&gcs_modules=%3Cscript%3E',
  ])('ignores invalid plan context without unsafe markup (%s)', query => {
    const { field, hint } = load(query);
    expect(field.value).toBe('');
    expect(hint.hidden).toBe(true);
  });

  test('never displays arbitrary untrusted URL content', () => {
    const { field, hint } = load('?gcs_plan=modular&gcs_users=4&gcs_modules=finance');
    expect(field.value).not.toContain('<');
    expect(hint.querySelector('script')).toBeNull();
    expect(hint.textContent).toContain('Finance & Invoicing');
  });
});
