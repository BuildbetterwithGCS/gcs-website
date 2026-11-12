/** @jest-environment jsdom */
const app = require('../js/estimate-list.js');

function validPage() {
  return {
    schema_version: 'tenant-estimate-list-v1',
    checked_at: '2026-11-12T19:00:00Z',
    returned: 2,
    truncated: false,
    items: [
      {
        estimate_ref: 'estimate-one',
        revision: 3,
        customer_label: 'Synthetic customer one',
        title: 'Synthetic pool deck restoration',
        status: 'sent',
        amount_cents: 123456,
        expires_on: '2026-12-12',
        sent_at: '2026-11-12T18:00:00Z',
        updated_at: '2026-11-12T18:00:00Z',
      },
      {
        estimate_ref: 'estimate-two',
        revision: 0,
        customer_label: 'Synthetic customer two',
        title: 'Synthetic concrete repair',
        status: 'draft',
        amount_cents: 0,
        expires_on: null,
        sent_at: null,
        updated_at: '2026-11-12T18:30:00Z',
      },
    ],
  };
}

test('accepts only the exact bounded estimate summary contract', () => {
  const page = validPage();
  expect(app.validatedEstimateList(page)).toEqual(page);
  const invalid = [
    { ...page, tenant_id: 'must-not-reach-browser' },
    { ...page, returned: 1 },
    { ...page, truncated: 'false' },
    { ...page, checked_at: '2026-11-12T19:00:00+00:00' },
    { ...page, items: [{ ...page.items[0], contact_email: 'private@example.invalid' }] },
    { ...page, items: [{ ...page.items[0], provider: 'must-not-reach-browser' }] },
    { ...page, items: [{ ...page.items[0], status: 'paid' }] },
    { ...page, items: [{ ...page.items[0], amount_cents: -1 }] },
    { ...page, items: [{ ...page.items[0], updated_at: '2026-11-12T19:00:01Z' }] },
    { ...page, items: [{ ...page.items[0], sent_at: null }] },
    { ...page, items: [{ ...page.items[1], sent_at: '2026-11-12T18:00:00Z' }] },
    { ...page, items: [{ ...page.items[0], expires_on: '2026-11-01' }] },
    { ...page, items: [
      page.items[0], { ...page.items[1], estimate_ref: 'ESTIMATE-ONE' },
    ] },
  ];
  for (const value of invalid) {
    expect(() => app.validatedEstimateList(value))
      .toThrow('Estimate list is unavailable');
  }
});

test('expired estimates require a reached expiry date', () => {
  const page = validPage();
  const expired = {
    ...page.items[0],
    status: 'expired',
    expires_on: '2026-11-12',
  };
  expect(app.validatedEstimateList({
    ...page, returned: 1, items: [expired],
  }).items[0]).toEqual(expired);
  expect(() => app.validatedEstimateList({
    ...page,
    returned: 1,
    items: [{ ...expired, expires_on: '2026-11-13' }],
  })).toThrow('Estimate list is unavailable');
});

test('renders safe summaries without internal references or delivery claims', () => {
  document.body.innerHTML = '<ul id="estimate-list"></ul>';
  const page = validPage();
  page.items[0] = {
    ...page.items[0],
    customer_label: '<img src=x onerror=alert(1)>',
    title: '<script>alert(1)</script>',
  };
  page.truncated = true;
  app.renderEstimateList(document, page);
  expect(document.querySelector('img')).toBeNull();
  expect(document.querySelector('script')).toBeNull();
  expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(document.body.textContent).toContain('<script>alert(1)</script>');
  expect(document.body.textContent).toContain('Sent · $1,234.56');
  expect(document.body.textContent).toContain('this list is incomplete');
  expect(document.body.textContent).not.toContain('estimate-one');
  expect(document.body.textContent).not.toContain('2026-11-12T18:00:00Z');
  expect(document.body.textContent).not.toMatch(/delivered|paid|settled|emailed/i);
});

test('contract remains unconnected and does not accept customer contact fields', () => {
  expect(String(app.validatedEstimateList)).not.toMatch(
    /fetch|request|tenant_id|workspace_id|email|phone|address|provider/i,
  );
  expect(String(app.renderEstimateList)).not.toMatch(
    /innerHTML|fetch|request|email|phone|address|provider/i,
  );
});
