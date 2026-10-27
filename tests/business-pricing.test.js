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
});
