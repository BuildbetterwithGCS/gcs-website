const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'business', 'index.html'), 'utf8');
const pricingScript = fs.readFileSync(
  path.join(ROOT, 'js', 'business-pricing.js'),
  'utf8'
);

function loadBuilder() {
  document.open();
  document.write(html);
  document.close();
  window.eval(pricingScript);
  return document;
}

describe('proposed modular subscription builder', () => {
  test('starts at the proposed core estimate without activation claims', () => {
    const document = loadBuilder();
    expect(document.getElementById('plan-estimate').textContent).toContain(
      'Estimated total: $20/month'
    );
    expect(document.getElementById('plan-estimate').textContent).toContain(
      'Illustrative pricing only'
    );
    expect(html).not.toMatch(/Subscribe Now|Start Free Trial|Pay Now|Checkout/i);
  });

  test('calculates selected modules and five-user blocks', () => {
    const document = loadBuilder();
    document.querySelector('input[value="finance"]').click();
    document.querySelector('input[value="operations"]').click();
    const team = document.getElementById('team-size');
    team.value = '11';
    team.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
    const output = document.getElementById('plan-estimate').textContent;
    expect(output).toContain('Estimated total: $70/month');
    expect(output).toContain('Modular: $70/month');
    expect(output).toContain('Complete: $109/month');
  });

  test('complete selects bundle pricing and disables module controls', () => {
    const document = loadBuilder();
    const complete = document.getElementById('complete-plan');
    complete.click();
    expect(document.getElementById('plan-estimate').textContent).toContain(
      'Estimated total: $79/month'
    );
    document
      .querySelectorAll('#module-options input[type="checkbox"]')
      .forEach((input) => expect(input.disabled).toBe(true));
  });

  test('rejects non-whole and out-of-range user counts', () => {
    for (const invalid of ['0', '1.5', '101']) {
      const document = loadBuilder();
      const team = document.getElementById('team-size');
      team.value = invalid;
      team.dispatchEvent(
        new document.defaultView.Event('input', { bubbles: true })
      );
      expect(document.getElementById('plan-estimate').textContent).toBe(
        'Enter a whole number of users between 1 and 100.'
      );
    }
  });
  test('demo handoff carries validated plan choices without starting checkout', () => {
    const document = loadBuilder();
    const link = document.getElementById('plan-demo-link');
    expect(link).not.toBeNull();
    expect(link.getAttribute('href')).toContain('gcs_plan=modular');
    document.querySelector('input[value="finance"]').click();
    document.querySelector('input[value="operations"]').click();
    document.getElementById('team-size').value = '11';
    document.getElementById('team-size').dispatchEvent(
      new document.defaultView.Event('input', { bubbles: true })
    );
    const href = new URL(link.getAttribute('href'), 'https://buildbetterwithgcs.com/business/');
    expect(href.pathname).toBe('/request-demo/');
    expect(href.searchParams.get('gcs_plan')).toBe('modular');
    expect(href.searchParams.get('gcs_users')).toBe('11');
    expect(href.searchParams.get('gcs_modules')).toBe('operations,finance');
    expect(href.search).not.toMatch(/email|payment|card|company|ein/i);
  });

  test('invalid user count disables plan inquiry and complete keeps modules private', () => {
    const document = loadBuilder();
    const link = document.getElementById('plan-demo-link');
    const team = document.getElementById('team-size');
    team.value = '0';
    team.dispatchEvent(new document.defaultView.Event('input', { bubbles: true }));
    expect(link.hasAttribute('href')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBe('true');
    team.value = '5';
    document.getElementById('complete-plan').click();
    const url = new URL(link.getAttribute('href'), 'https://buildbetterwithgcs.com/business/');
    expect(url.searchParams.get('gcs_plan')).toBe('complete');
    expect(url.searchParams.has('gcs_modules')).toBe(false);
    expect(link.getAttribute('aria-disabled')).toBeNull();
  });

});
