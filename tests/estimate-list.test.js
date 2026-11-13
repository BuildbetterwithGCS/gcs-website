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



test('builds and confirms only an optimistic draft estimate update', () => {
  const now = Date.parse('2026-11-12T23:45:00Z');
  const request = app.estimateDraftUpdateRequest(
    'estimate-three',
    4,
    'Synthetic revised concrete repair',
    'Synthetic revised scope with no customer contact coordinates.',
    225000,
    '2026-12-20',
    bytes => { bytes.fill(0xef); return bytes; },
    now,
  );
  expect(request).toEqual({
    estimate_ref: 'estimate-three',
    expected_revision: 4,
    title: 'Synthetic revised concrete repair',
    scope_summary: 'Synthetic revised scope with no customer contact coordinates.',
    amount_cents: 225000,
    expires_on: '2026-12-20',
    idempotency_key: 'estimate-' + 'ef'.repeat(24),
  });
  for (const key of [
    'tenant_id', 'workspace_id', 'customer_label', 'email', 'phone',
    'address', 'provider', 'send',
  ]) {
    expect(request).not.toHaveProperty(key);
  }

  const result = {
    schema_version: 'tenant-estimate-draft-update-v1',
    estimate_ref: request.estimate_ref,
    previous_revision: request.expected_revision,
    revision: request.expected_revision + 1,
    status: 'draft',
    title: request.title,
    scope_summary: request.scope_summary,
    amount_cents: request.amount_cents,
    expires_on: request.expires_on,
    updated_at: '2026-11-12T23:45:00Z',
    replayed: false,
  };
  expect(app.validatedEstimateDraftUpdateResult(result, request, now))
    .toEqual(result);

  const invalidResults = [
    { ...result, tenant_id: 'must-not-reach-browser' },
    { ...result, provider: 'must-not-reach-browser' },
    { ...result, contact_email: 'private@example.invalid' },
    { ...result, estimate_ref: 'different-estimate' },
    { ...result, previous_revision: 3 },
    { ...result, revision: 6 },
    { ...result, status: 'sent' },
    { ...result, title: 'Different title' },
    { ...result, scope_summary: 'Different scope' },
    { ...result, amount_cents: 225001 },
    { ...result, expires_on: '2026-12-21' },
    { ...result, updated_at: '2026-11-12T23:50:01Z' },
    { ...result, replayed: 'false' },
  ];
  for (const value of invalidResults) {
    expect(() => app.validatedEstimateDraftUpdateResult(value, request, now))
      .toThrow('Estimate draft update confirmation is unavailable');
  }
});

test('draft update fails closed for unsafe or over-shared requests', () => {
  const now = Date.parse('2026-11-12T23:45:00Z');
  const make = (overrides = {}) => app.estimateDraftUpdateRequest(
    overrides.ref ?? 'estimate-three',
    overrides.revision ?? 4,
    overrides.title ?? 'Synthetic revised proposal',
    overrides.scope ?? 'Synthetic revised scope.',
    overrides.amount ?? 225000,
    overrides.expires ?? '2026-12-20',
    Object.prototype.hasOwnProperty.call(overrides, 'random')
      ? overrides.random
      : (bytes => { bytes.fill(2); return bytes; }),
    Object.prototype.hasOwnProperty.call(overrides, 'now') ? overrides.now : now,
  );
  for (const overrides of [
    { ref: 'bad ref' },
    { revision: -1 },
    { revision: 1.5 },
    { title: '' },
    { scope: 'x'.repeat(2001) },
    { scope: 'unsafe\u202etext' },
    { amount: 0 },
    { amount: 12.5 },
    { expires: '2026-11-11' },
    { expires: '2027-06-01' },
    { random: null },
    { now: NaN },
  ]) {
    expect(() => make(overrides))
      .toThrow('Estimate draft update is unavailable');
  }

  const request = make();
  const result = {
    schema_version: 'tenant-estimate-draft-update-v1',
    estimate_ref: request.estimate_ref,
    previous_revision: request.expected_revision,
    revision: request.expected_revision + 1,
    status: 'draft',
    title: request.title,
    scope_summary: request.scope_summary,
    amount_cents: request.amount_cents,
    expires_on: request.expires_on,
    updated_at: '2026-11-12T23:45:00Z',
    replayed: true,
  };
  for (const altered of [
    { ...request, tenant_id: 'must-not-be-accepted' },
    { ...request, idempotency_key: 'estimate-invalid' },
    { ...request, expected_revision: -1 },
  ]) {
    expect(() => app.validatedEstimateDraftUpdateResult(result, altered, now))
      .toThrow('Estimate draft update confirmation is unavailable');
  }
  expect(String(app.estimateDraftUpdateRequest)).not.toMatch(
    /fetch\s*\(|email|phone|address|tenant_id|workspace_id|provider|send/i,
  );
});



test('accepts only exact reconciled estimate proposal details', () => {
  const now = Date.parse('2026-11-13T01:35:00Z');
  const detail = {
    schema_version: 'tenant-estimate-detail-v1',
    estimate_ref: 'estimate-five',
    revision: 2,
    customer_label: 'Synthetic customer',
    title: 'Synthetic pool deck restoration',
    status: 'sent',
    scope_summary: 'Synthetic preparation and resurfacing scope.',
    line_items: [
      {
        line_ref: 'line-preparation',
        description: 'Synthetic surface preparation',
        quantity_millis: 1500,
        unit_amount_cents: 10000,
        line_total_cents: 15000,
      },
      {
        line_ref: 'line-finish',
        description: 'Synthetic decorative finish',
        quantity_millis: 2000,
        unit_amount_cents: 25000,
        line_total_cents: 50000,
      },
    ],
    subtotal_cents: 65000,
    tax_cents: 4550,
    total_cents: 69550,
    expires_on: '2026-12-12',
    sent_at: '2026-11-12T23:00:00Z',
    updated_at: '2026-11-12T23:00:00Z',
  };
  expect(app.validatedEstimateDetail(detail, now)).toEqual(detail);
  const invalid = [
    { ...detail, tenant_id: 'must-not-reach-browser' },
    { ...detail, contact_email: 'private@example.invalid' },
    { ...detail, provider: 'must-not-reach-browser' },
    { ...detail, line_items: [] },
    { ...detail, subtotal_cents: 65001 },
    { ...detail, total_cents: 69551 },
    { ...detail, status: 'draft' },
    { ...detail, sent_at: null },
    { ...detail, updated_at: '2026-11-13T01:40:01Z' },
    { ...detail, line_items: [
      detail.line_items[0],
      { ...detail.line_items[1], line_ref: 'LINE-PREPARATION' },
    ] },
    { ...detail, line_items: [{
      ...detail.line_items[0], line_total_cents: 14999,
    }] },
    { ...detail, line_items: [{
      ...detail.line_items[0], description: 'unsafe\u202etext',
    }] },
  ];
  for (const value of invalid) {
    expect(() => app.validatedEstimateDetail(value, now))
      .toThrow('Estimate detail is unavailable');
  }
});

test('estimate details enforce bounded line items and lifecycle evidence', () => {
  const now = Date.parse('2026-11-13T01:35:00Z');
  const item = index => ({
    line_ref: 'line-' + index,
    description: 'Synthetic line ' + index,
    quantity_millis: 1000,
    unit_amount_cents: 100,
    line_total_cents: 100,
  });
  const draft = {
    schema_version: 'tenant-estimate-detail-v1',
    estimate_ref: 'estimate-six',
    revision: 0,
    customer_label: 'Synthetic customer',
    title: 'Synthetic draft',
    status: 'draft',
    scope_summary: 'Synthetic draft scope.',
    line_items: [item(1)],
    subtotal_cents: 100,
    tax_cents: 0,
    total_cents: 100,
    expires_on: null,
    sent_at: null,
    updated_at: '2026-11-13T01:35:00Z',
  };
  expect(app.validatedEstimateDetail(draft, now)).toEqual(draft);
  expect(() => app.validatedEstimateDetail({
    ...draft,
    line_items: Array.from({ length: 51 }, (_, index) => item(index)),
    subtotal_cents: 5100,
    total_cents: 5100,
  }, now)).toThrow('Estimate detail is unavailable');
  expect(() => app.validatedEstimateDetail({
    ...draft,
    status: 'expired',
    sent_at: '2026-11-13T01:00:00Z',
    expires_on: '2026-11-14',
  }, now)).toThrow('Estimate detail is unavailable');
  expect(String(app.validatedEstimateDetail)).not.toMatch(
    /fetch\s*\(|email|phone|address|tenant_id|workspace_id|provider/i,
  );
});



test('builds an opaque detail path and renders proposal text safely', () => {
  const now = Date.parse('2026-11-13T02:42:00Z');
  const detail = {
    schema_version: 'tenant-estimate-detail-v1',
    estimate_ref: 'estimate-seven',
    revision: 1,
    customer_label: '<img src=x onerror=alert(1)>',
    title: '<script>alert(1)</script>',
    status: 'draft',
    scope_summary: 'Synthetic <b>pool deck</b> scope.',
    line_items: [{
      line_ref: 'line-seven',
      description: '<svg onload=alert(1)>Synthetic preparation',
      quantity_millis: 1250,
      unit_amount_cents: 20000,
      line_total_cents: 25000,
    }],
    subtotal_cents: 25000,
    tax_cents: 1750,
    total_cents: 26750,
    expires_on: '2026-12-20',
    sent_at: null,
    updated_at: '2026-11-13T02:40:00Z',
  };
  expect(app.estimateDetailPath(detail.estimate_ref))
    .toBe('/estimates/estimate-seven');
  for (const invalid of [
    '', 'bad ref', 'tenant/customer', 'x'.repeat(65), null,
  ]) {
    expect(() => app.estimateDetailPath(invalid))
      .toThrow('Estimate detail is unavailable');
  }

  document.body.innerHTML = '<section id="estimate-detail"></section>';
  expect(app.renderEstimateDetail(document, detail, now)).toEqual(detail);
  expect(document.querySelector('img')).toBeNull();
  expect(document.querySelector('script')).toBeNull();
  expect(document.querySelector('svg')).toBeNull();
  expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(document.body.textContent).toContain('<script>alert(1)</script>');
  expect(document.body.textContent).toContain('1.25');
  expect(document.body.textContent).toContain('Subtotal: $250.00');
  expect(document.body.textContent).toContain('Tax: $17.50');
  expect(document.body.textContent).toContain('Total: $267.50');
  expect(document.body.textContent).not.toContain('estimate-seven');
  expect(document.body.textContent).not.toContain('line-seven');
  expect(document.body.textContent).not.toMatch(/delivered|paid|settled|emailed/i);
});

test('detail rendering remains disconnected and requires its fixed container', () => {
  expect(String(app.estimateDetailPath)).not.toMatch(
    /tenant|workspace|customer|email|phone|address|provider/i,
  );
  expect(String(app.renderEstimateDetail)).not.toMatch(
    /innerHTML|fetch\s*\(|email|phone|address|tenant_id|workspace_id|provider/i,
  );
  document.body.innerHTML = '';
  expect(() => app.renderEstimateDetail(document, {}, Date.now()))
    .toThrow('Estimate detail container is unavailable');
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


test('estimate page chain preserves one snapshot and rejects replay or loops', () => {
  const page = validPage();
  const cursor = 'c'.repeat(32);
  const first = {
    ...page,
    returned: 1,
    truncated: true,
    next_cursor: cursor,
    items: [page.items[0]],
  };
  const second = {
    ...page,
    returned: 1,
    truncated: false,
    next_cursor: null,
    items: [page.items[1]],
  };
  expect(app.validatedEstimatePageChain([
    { requested_cursor: null, page: first },
    { requested_cursor: cursor, page: second },
  ])).toEqual({
    checked_at: page.checked_at,
    items: [page.items[0], page.items[1]],
    next_cursor: null,
    complete: true,
  });

  const invalidChains = [
    [
      { requested_cursor: null, page: first },
      { requested_cursor: 'd'.repeat(32), page: second },
    ],
    [
      { requested_cursor: null, page: first },
      { requested_cursor: cursor, page: { ...second, items: [page.items[0]] } },
    ],
    [
      { requested_cursor: null, page: first },
      { requested_cursor: cursor, page: {
        ...second, truncated: true, next_cursor: cursor,
      } },
    ],
    [
      { requested_cursor: null, page: first },
      { requested_cursor: cursor, page: {
        ...second, checked_at: '2026-11-12T19:00:01Z',
      } },
    ],
    [
      { requested_cursor: null, page: { ...first, truncated: false, next_cursor: null } },
      { requested_cursor: null, page: second },
    ],
    [
      { requested_cursor: null, page: first, tenant_id: 'must-not-be-accepted' },
    ],
  ];
  for (const chain of invalidChains) {
    expect(() => app.validatedEstimatePageChain(chain))
      .toThrow('Estimate list continuation is unavailable');
  }
  expect(() => app.validatedEstimatePageChain([]))
    .toThrow('Estimate list continuation is unavailable');
  expect(() => app.validatedEstimatePageChain(Array.from(
    { length: 21 },
    () => ({ requested_cursor: null, page: second }),
  ))).toThrow('Estimate list continuation is unavailable');
});
