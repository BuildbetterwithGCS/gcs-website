/** @jest-environment jsdom */
const app = require('../js/estimate-list.js');

function validPage() {
  return {
    schema_version: 'tenant-estimate-list-v1',
    checked_at: '2026-11-12T19:00:00Z',
    returned: 2,
    truncated: false,
    next_cursor: null,
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
  page.next_cursor = 'a'.repeat(32);
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


test('builds only a bounded idempotent internal estimate draft request', () => {
  const now = Date.parse('2026-11-12T20:00:00Z');
  const request = app.estimateDraftRequest(
    'Synthetic customer',
    'Synthetic stamped concrete proposal',
    'Prepare and install a synthetic stamped concrete test surface.',
    250000,
    '2026-12-12',
    bytes => { bytes.fill(0xab); return bytes; },
    now,
  );
  expect(request).toEqual({
    customer_label: 'Synthetic customer',
    title: 'Synthetic stamped concrete proposal',
    scope_summary: 'Prepare and install a synthetic stamped concrete test surface.',
    amount_cents: 250000,
    expires_on: '2026-12-12',
    idempotency_key: 'estimate-' + 'ab'.repeat(24),
  });
  expect(request).not.toHaveProperty('tenant_id');
  expect(request).not.toHaveProperty('workspace_id');
  expect(request).not.toHaveProperty('email');
  expect(request).not.toHaveProperty('phone');
  expect(request).not.toHaveProperty('address');
  expect(request).not.toHaveProperty('send');
});

test('estimate draft request rejects unsafe content, money, dates, and randomness', () => {
  const now = Date.parse('2026-11-12T20:00:00Z');
  const make = (overrides = {}) => app.estimateDraftRequest(
    overrides.customer ?? 'Synthetic customer',
    overrides.title ?? 'Synthetic proposal',
    overrides.scope ?? 'Synthetic bounded scope',
    overrides.amount ?? 10000,
    overrides.expires ?? '2026-12-12',
    Object.prototype.hasOwnProperty.call(overrides, 'random')
      ? overrides.random
      : (bytes => { bytes.fill(1); return bytes; }),
    Object.prototype.hasOwnProperty.call(overrides, 'now') ? overrides.now : now,
  );
  for (const overrides of [
    { customer: '' },
    { title: 'x'.repeat(201) },
    { scope: 'x'.repeat(2001) },
    { scope: 'unsafe\u202etext' },
    { amount: 0 },
    { amount: 12.5 },
    { amount: 1000000001 },
    { expires: '2026-11-11' },
    { expires: '2027-06-01' },
    { expires: '2026-02-30' },
    { random: null },
    { now: NaN },
  ]) {
    expect(() => make(overrides)).toThrow('Estimate draft is unavailable');
  }
});

test('estimate draft builder remains unconnected and cannot send a proposal', () => {
  expect(String(app.estimateDraftRequest)).not.toMatch(
    /fetch\s*\(|request\s*\(\s*['\"]|email|phone|address|tenant_id|workspace_id|provider|send/i,
  );
});


test('accepts only an exact request-bound estimate draft confirmation', () => {
  const now = Date.parse('2026-11-12T21:00:00Z');
  const request = app.estimateDraftRequest(
    'Synthetic customer',
    'Synthetic concrete repair',
    'Synthetic bounded repair scope.',
    175000,
    '2026-12-12',
    bytes => { bytes.fill(0xcd); return bytes; },
    now,
  );
  const result = {
    schema_version: 'tenant-estimate-draft-v1',
    estimate_ref: 'estimate-three',
    revision: 0,
    status: 'draft',
    customer_label: request.customer_label,
    title: request.title,
    amount_cents: request.amount_cents,
    expires_on: request.expires_on,
    created_at: '2026-11-12T21:00:00Z',
    updated_at: '2026-11-12T21:00:00Z',
    replayed: false,
  };
  expect(app.validatedEstimateDraftResult(result, request, now)).toEqual(result);
  const invalid = [
    { ...result, tenant_id: 'must-not-reach-browser' },
    { ...result, provider: 'must-not-reach-browser' },
    { ...result, contact_email: 'private@example.invalid' },
    { ...result, estimate_ref: 'bad ref' },
    { ...result, revision: 1 },
    { ...result, status: 'sent' },
    { ...result, customer_label: 'Different customer' },
    { ...result, title: 'Different work' },
    { ...result, amount_cents: 175001 },
    { ...result, expires_on: '2026-12-13' },
    { ...result, created_at: '2026-11-12T21:05:01Z',
      updated_at: '2026-11-12T21:05:01Z' },
    { ...result, updated_at: '2026-11-12T21:00:01Z' },
    { ...result, replayed: 'false' },
  ];
  for (const value of invalid) {
    expect(() => app.validatedEstimateDraftResult(value, request, now))
      .toThrow('Estimate draft confirmation is unavailable');
  }
});

test('draft confirmation rejects altered or over-shared request evidence', () => {
  const now = Date.parse('2026-11-12T21:00:00Z');
  const request = app.estimateDraftRequest(
    'Synthetic customer',
    'Synthetic proposal',
    'Synthetic bounded scope.',
    10000,
    '2026-12-12',
    bytes => { bytes.fill(1); return bytes; },
    now,
  );
  const result = {
    schema_version: 'tenant-estimate-draft-v1',
    estimate_ref: 'estimate-four',
    revision: 0,
    status: 'draft',
    customer_label: request.customer_label,
    title: request.title,
    amount_cents: request.amount_cents,
    expires_on: request.expires_on,
    created_at: '2026-11-12T21:00:00Z',
    updated_at: '2026-11-12T21:00:00Z',
    replayed: true,
  };
  for (const altered of [
    { ...request, tenant_id: 'must-not-be-accepted' },
    { ...request, idempotency_key: 'estimate-invalid' },
    { ...request, scope_summary: '' },
  ]) {
    expect(() => app.validatedEstimateDraftResult(result, altered, now))
      .toThrow('Estimate draft confirmation is unavailable');
  }
});


test('estimate pagination requires a bounded opaque cursor only when truncated', () => {
  const page = validPage();
  const cursor = 'a'.repeat(32);
  expect(app.validatedEstimateList({
    ...page,
    truncated: true,
    next_cursor: cursor,
  }).next_cursor).toBe(cursor);
  for (const invalid of [
    { ...page, truncated: true, next_cursor: null },
    { ...page, truncated: true, next_cursor: 'short' },
    { ...page, truncated: true, next_cursor: 'tenant/workspace/customer' },
    { ...page, truncated: false, next_cursor: cursor },
    { ...page, returned: 0, items: [], truncated: true, next_cursor: cursor },
  ]) {
    expect(() => app.validatedEstimateList(invalid))
      .toThrow('Estimate list is unavailable');
  }
});

test('estimate continuation path carries only an opaque cursor', () => {
  const cursor = 'b'.repeat(32);
  expect(app.estimateListPath()).toBe('/estimates');
  expect(app.estimateListPath(null)).toBe('/estimates');
  expect(app.estimateListPath(cursor)).toBe('/estimates?cursor=' + cursor);
  for (const invalid of [
    undefined,
    '',
    'short',
    'tenant=synthetic-a',
    'workspace/synthetic-a',
    'x'.repeat(257),
  ]) {
    expect(() => app.estimateListPath(invalid))
      .toThrow('Estimate list continuation is unavailable');
  }
  expect(String(app.estimateListPath)).not.toMatch(
    /tenant|workspace|customer|email|phone|address|provider/i,
  );
});
