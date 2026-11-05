/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');
const app = require('../js/business-app.js');

beforeEach(() => {
  Object.defineProperty(document, 'cookie', {
    configurable: true, value: '__Host-nexus-csrf=csrf-token-value',
  });
  global.fetch = jest.fn();
});
afterEach(() => { delete global.fetch; });

test('reads the exact CSRF cookie and converts dollars safely', () => {
  expect(app.csrfToken('a=1; __Host-nexus-csrf=abc123; z=2')).toBe('abc123');
  expect(app.dollarsToCents('125.05')).toBe(12505);
  expect(() => app.dollarsToCents('12.345')).toThrow('valid dollar');
});

test('uses private same-origin requests and CSRF for state changes', async () => {
  fetch.mockResolvedValue({ ok: true, json: async () => ({ data: { status: 'pending_billing' } }) });
  const value = await app.request('/subscription', { method: 'POST', body: { bundle: 'complete' } });
  expect(value.status).toBe('pending_billing');
  expect(fetch).toHaveBeenCalledWith('/api/nexus/subscription', expect.objectContaining({
    method: 'POST', credentials: 'same-origin', cache: 'no-store',
    mode: 'same-origin', redirect: 'error', referrerPolicy: 'no-referrer',
    headers: expect.objectContaining({
      'X-CSRF-Token': 'csrf-token-value', 'Content-Type': 'application/json',
    }),
  }));
});

test('does not add CSRF header to safe reads and reports bounded errors', async () => {
  fetch.mockResolvedValueOnce({ ok: true, json: async () => ({ data: { open_work: 1 } }) });
  await app.request('/dashboard');
  expect(fetch.mock.calls[0][1]).toEqual(expect.objectContaining({
    credentials: 'same-origin', cache: 'no-store', mode: 'same-origin',
    redirect: 'error', referrerPolicy: 'no-referrer',
  }));
  expect(fetch.mock.calls[0][1].headers['X-CSRF-Token']).toBeUndefined();
  fetch.mockResolvedValueOnce({ ok: false, status: 403, json: async () => ({ error: 'request_denied' }) });
  await expect(app.request('/dashboard')).rejects.toMatchObject({ message: 'request_denied', status: 403 });
});

test('creates a bounded cryptographic checkout idempotency key', () => {
  const key = app.idempotencyKey(bytes => { bytes.fill(0xab); return bytes; });
  expect(key).toBe('nexus-' + 'ab'.repeat(24));
  expect(() => app.idempotencyKey(null)).toThrow('randomness');
});

test('accepts only plain HTTPS checkout handoffs', () => {
  expect(app.validatedCheckoutUrl('https://checkout.example.test/session/one'))
    .toBe('https://checkout.example.test/session/one');
  for (const value of ['http://checkout.example.test/session/one',
    'https://user@checkout.example.test/session/one',
    'https://checkout.example.test:444/session/one',
    'https://checkout.example.test/session/one#fragment', 'not a url']) {
    expect(() => app.validatedCheckoutUrl(value)).toThrow('invalid');
  }
});

test('retries only a server-reported expired provider session', () => {
  const now = Date.parse('2026-10-28T18:00:00Z');
  expect(app.checkoutNeedsRetry({
    status: 'PROVIDER_SESSION', expires_at: '2026-10-28T17:59:59+00:00',
  }, now)).toBe(true);
  expect(app.checkoutNeedsRetry({
    status: 'PROVIDER_SESSION', expires_at: '2026-10-28T18:00:00+00:00',
  }, now)).toBe(true);
  expect(app.checkoutNeedsRetry({
    status: 'PROVIDER_SESSION', expires_at: '2026-10-28T18:00:01+00:00',
  }, now)).toBe(false);
  expect(app.checkoutNeedsRetry({
    status: 'READY_FOR_PROVIDER', expires_at: '2026-10-28T17:00:00+00:00',
  }, now)).toBe(false);
  expect(app.checkoutNeedsRetry({
    status: 'PROVIDER_SESSION', expires_at: 'not-a-date',
  }, now)).toBe(false);
  expect(app.checkoutNeedsRetry(null, now)).toBe(false);
});

test('accepts only the exact current staged selection for checkout resume', () => {
  const current = {
    intent_id: 'checkout-1', selection_revision: 3, selection_current: true,
  };
  expect(app.checkoutIntentIsCurrent(current, 3)).toBe(true);
  expect(app.checkoutIntentIsCurrent({ ...current, selection_revision: 2 }, 3))
    .toBe(false);
  expect(app.checkoutIntentIsCurrent({ ...current, selection_current: false }, 3))
    .toBe(false);
  expect(app.checkoutIntentIsCurrent({
    intent_id: 'checkout-1', selection_revision: 3,
  }, 3)).toBe(false);
  expect(app.checkoutIntentIsCurrent(current, null)).toBe(false);
});

test('uses a new key to reset the same expired intent and no other intent', async () => {
  const send = jest.fn().mockResolvedValue({
    intent_id: 'checkout-1', status: 'READY_FOR_PROVIDER', expires_at: null,
  });
  const expired = {
    intent_id: 'checkout-1', status: 'PROVIDER_SESSION',
    expires_at: '2026-10-28T17:59:59+00:00',
  };
  const recovered = await app.retryExpiredCheckout(
    expired, 'checkout-1', send, bytes => { bytes.fill(0xcd); return bytes; },
    Date.parse('2026-10-28T18:00:00Z'),
  );
  expect(send).toHaveBeenCalledWith('/subscription/checkout-intent/retry', {
    method: 'POST', body: {
      intent_id: 'checkout-1', idempotency_key: 'nexus-' + 'cd'.repeat(24),
    },
  });
  expect(recovered).toEqual({
    intent: { intent_id: 'checkout-1', status: 'READY_FOR_PROVIDER', expires_at: null },
    idempotency_key: 'nexus-' + 'cd'.repeat(24),
  });

  send.mockClear();
  const current = { ...expired, expires_at: '2026-10-28T18:00:01+00:00' };
  await expect(app.retryExpiredCheckout(
    current, 'checkout-1', send, () => { throw new Error('must not run'); },
    Date.parse('2026-10-28T18:00:00Z'),
  )).resolves.toEqual({ intent: current, idempotency_key: null });
  expect(send).not.toHaveBeenCalled();
});

test('portal source contains no live billing, payroll or availability claim', () => {
  document.body.innerHTML = '<main></main>';
  expect(app.API).toBe('/api/nexus');
  expect(String(app.request)).not.toMatch(/bank|password|payment method/i);
});


test('clears only verified completed checkout state', () => {
  const removed = [];
  const storage = { removeItem: key => removed.push(key) };
  const active = {
    status: 'active', billing_verified: true, grants_access: true,
  };
  expect(app.subscriptionIsVerifiedActive(active)).toBe(true);
  expect(app.clearCompletedCheckout(active, storage)).toBe(true);
  expect(removed).toEqual([
    'nexus.checkout.intent', 'nexus.checkout.idempotency',
  ]);

  for (const incomplete of [
    { ...active, status: 'pending_billing' },
    { ...active, billing_verified: false },
    { ...active, grants_access: false },
    { status: 'active' },
    null,
  ]) {
    expect(app.subscriptionIsVerifiedActive(incomplete)).toBe(false);
    expect(app.clearCompletedCheckout(incomplete, storage)).toBe(false);
  }
  expect(removed).toHaveLength(2);
});


test('validates a bounded privacy-minimized manager leave queue', () => {
  const queue = {
    items: [{
      request_id: 'leave-1',
      employee_id: 'employee-1',
      kind: 'pto',
      date: '2026-11-12',
    }],
    returned: 1,
    truncated: false,
  };
  expect(app.validatedPendingLeaveQueue(queue)).toEqual(queue);
  for (const invalid of [
    { ...queue, actor: 'must-not-be-accepted' },
    { ...queue, returned: 2 },
    { ...queue, truncated: 'false' },
    { ...queue, items: [{ ...queue.items[0], role: 'manager' }] },
    { ...queue, items: [{ ...queue.items[0], kind: 'vacation' }] },
    { ...queue, items: [{ ...queue.items[0], date: 'November 12' }] },
    { ...queue, items: Array.from({ length: 101 }, () => queue.items[0]), returned: 101 },
  ]) {
    expect(() => app.validatedPendingLeaveQueue(invalid)).toThrow('unavailable');
  }
});

test('renders manager leave actions with safe text and explicit decisions', () => {
  document.body.innerHTML = '<ul id="leave-review-list" hidden></ul>';
  const onReview = jest.fn();
  const queue = app.renderPendingLeaveQueue(document, {
    items: [{
      request_id: '<leave-1>',
      employee_id: '<img src=x onerror=alert(1)>',
      kind: 'sick',
      date: '2026-11-13',
    }],
    returned: 1,
    truncated: false,
  }, onReview);

  expect(queue.returned).toBe(1);
  expect(document.querySelector('img')).toBeNull();
  expect(document.getElementById('leave-review-list').hidden).toBe(false);
  expect(document.body.textContent).toContain(
    'Employee <img src=x onerror=alert(1)>'
  );
  const buttons = [...document.querySelectorAll('#leave-review-list button')];
  expect(buttons.map(button => button.textContent)).toEqual(['Approve', 'Deny']);
  expect(buttons[0].getAttribute('aria-label')).toContain('employee <img');
  buttons[0].click();
  buttons[1].click();
  expect(onReview.mock.calls).toEqual([
    ['<leave-1>', true],
    ['<leave-1>', false],
  ]);
});

test('manager leave panel is explicit-load, session-bound, and status accessible', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/id="leave-review-load"[^>]*>Load requests to review/);
  expect(html).toMatch(
    /id="leave-review-status"[^>]*role="status"[^>]*aria-live="polite"[^>]*tabindex="-1"/
  );
  expect(html).toContain('Choose Approve or Deny for one request at a time.');
  expect(js).toContain("request('/leave/pending')");
  expect(js).toContain("request('/leave/review', {");
  expect(js).toContain("body: { request_id: requestId, approve }");
  const reviewStart = js.indexOf('async function reviewPendingLeave');
  const reviewEnd = js.indexOf("leaveReviewLoad.addEventListener", reviewStart);
  const reviewSource = js.slice(reviewStart, reviewEnd);
  expect(reviewSource).not.toMatch(
    /tenant|actor|employee_id|provider|billing|password|bank/i
  );
  expect((js.match(/request\('\/leave\/pending'\)/g) || [])).toHaveLength(1);
});

test('validates a bounded identity-minimized assigned work queue', () => {
  const queue = {
    items: [{
      work_order_id: 'work-1',
      title: 'Inspect rooftop unit',
      status: 'open',
    }],
    returned: 1,
    truncated: false,
  };
  expect(app.validatedAssignedWorkQueue(queue)).toEqual(queue);
  for (const invalid of [
    { ...queue, actor: 'must-not-be-accepted' },
    { ...queue, returned: 2 },
    { ...queue, truncated: 'false' },
    { ...queue, items: [{ ...queue.items[0], assigned_to: 'employee-1' }] },
    { ...queue, items: [{ ...queue.items[0], status: 'completed' }] },
    { ...queue, items: [{ ...queue.items[0], title: '' }] },
    { ...queue, items: [{ ...queue.items[0], title: 'x'.repeat(201) }] },
    { ...queue, items: Array.from({ length: 101 }, () => queue.items[0]), returned: 101 },
  ]) {
    expect(() => app.validatedAssignedWorkQueue(invalid)).toThrow('unavailable');
  }
});

test('renders work safely and requires explicit completion confirmation', () => {
  document.body.innerHTML = '<ul id="work-queue-list" hidden></ul>';
  const onComplete = jest.fn();
  const queue = app.renderAssignedWorkQueue(document, {
    items: [{
      work_order_id: '<work-1>',
      title: '<img src=x onerror=alert(1)>',
      status: 'open',
    }],
    returned: 1,
    truncated: false,
  }, onComplete);

  expect(queue.returned).toBe(1);
  expect(document.querySelector('img')).toBeNull();
  expect(document.getElementById('work-queue-list').hidden).toBe(false);
  const buttons = [...document.querySelectorAll('#work-queue-list button')];
  expect(buttons.map(button => button.textContent)).toEqual([
    'Mark complete', 'Yes, mark complete', 'No, keep open',
  ]);
  buttons[0].click();
  expect(onComplete).not.toHaveBeenCalled();
  expect(buttons[0].hidden).toBe(true);
  expect(buttons[1].closest('.work-confirmation').hidden).toBe(false);
  buttons[2].click();
  expect(onComplete).not.toHaveBeenCalled();
  expect(buttons[0].hidden).toBe(false);
  buttons[0].click();
  buttons[1].click();
  expect(onComplete).toHaveBeenCalledWith('<work-1>');
});

test('My work panel is explicit-load, session-bound, and status accessible', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/id="work-queue-load"[^>]*>Load my work/);
  expect(html).toMatch(
    /id="work-queue-status"[^>]*role="status"[^>]*aria-live="polite"[^>]*tabindex="-1"/
  );
  expect(html).toContain('Mark one complete only after the work is finished.');
  expect(js).toContain("request('/work-orders')");
  expect(js).toContain("request('/work-orders/complete', {");
  expect(js).toContain("body: { item_id: workOrderId }");
  const completeStart = js.indexOf('async function completeAssignedWork');
  const completeEnd = js.indexOf(
    "workQueueLoad.addEventListener", completeStart);
  const completeSource = js.slice(completeStart, completeEnd);
  expect(completeSource).not.toMatch(
    /tenant|actor|assigned_to|employee_id|role|provider|billing|password|bank/i
  );
  expect((js.match(/request\('\/work-orders'\)/g) || [])).toHaveLength(1);
});

test('validates and formats bounded manager invoice summaries', () => {
  const page = {
    items: [{
      invoice_id: 'invoice-1',
      customer_label: 'Synthetic Customer',
      amount_cents: 123456789,
      due_date: '2026-11-30',
      status: 'draft',
    }],
    returned: 1,
    truncated: false,
  };
  expect(app.validatedInvoiceSummaries(page)).toEqual(page);
  expect(app.formatInvoiceAmount(0)).toBe('$0.00');
  expect(app.formatInvoiceAmount(12500)).toBe('$125.00');
  expect(app.formatInvoiceAmount(123456789)).toBe('$1,234,567.89');
  for (const invalid of [
    { ...page, tenant: 'must-not-be-accepted' },
    { ...page, returned: 2 },
    { ...page, truncated: 'false' },
    { ...page, items: [{ ...page.items[0], org_id: 'hidden' }] },
    { ...page, items: [{ ...page.items[0], status: 'settled' }] },
    { ...page, items: [{ ...page.items[0], due_date: '2026-99-99' }] },
    { ...page, items: [{ ...page.items[0], amount_cents: 12.5 }] },
    { ...page, items: [{ ...page.items[0], amount_cents: -1 }] },
    { ...page, items: [{ ...page.items[0], customer_label: '' }] },
    { ...page, items: Array.from({ length: 101 }, () => page.items[0]), returned: 101 },
  ]) {
    expect(() => app.validatedInvoiceSummaries(invalid)).toThrow('unavailable');
  }
});

test('renders invoice tracking summaries with safe text and no settlement claim', () => {
  document.body.innerHTML = '<ul id="invoice-list-items" hidden></ul>';
  const page = app.renderInvoiceSummaries(document, {
    items: [{
      invoice_id: 'invoice-1',
      customer_label: '<img src=x onerror=alert(1)>',
      amount_cents: 12500,
      due_date: '2026-11-30',
      status: 'paid',
    }],
    returned: 1,
    truncated: false,
  });

  expect(page.returned).toBe(1);
  expect(document.querySelector('img')).toBeNull();
  expect(document.getElementById('invoice-list-items').hidden).toBe(false);
  expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(document.body.textContent).toContain('$125.00');
  expect(document.body.textContent).toContain('Due 2026-11-30');
  expect(document.body.textContent).toContain('Paid · tracking only');
});

test('invoice list is explicit-load, read-only, and status accessible', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/id="invoice-list-load"[^>]*>Load invoice list/);
  expect(html).toMatch(
    /id="invoice-list-status"[^>]*role="status"[^>]*aria-live="polite"[^>]*tabindex="-1"/
  );
  expect(html).toContain(
    'does not send an invoice, collect payment, confirm settlement, or post an accounting entry.'
  );
  expect(js).toContain("request('/invoices')");
  const listStart = js.indexOf("invoiceListLoad.addEventListener");
  const listEnd = js.indexOf("const assetStatus", listStart);
  const listSource = js.slice(listStart, listEnd);
  expect(listSource).not.toMatch(/method:\s*'POST'|body:|tenant|actor|role|bank|password/i);
  expect((js.match(/request\('\/invoices'\)/g) || [])).toHaveLength(1);
});

test('validates only non-empty xlsx workbooks within the 5 MB cap', () => {
  const valid = new File(['PK synthetic'], 'assets.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  expect(app.validateAssetWorkbook(valid)).toBe(valid);
  expect(() => app.validateAssetWorkbook(new File(['x'], 'assets.csv', {
    type: 'text/csv',
  }))).toThrow('Excel .xlsx');
  expect(() => app.validateAssetWorkbook({
    type: valid.type, size: 0,
  })).toThrow('between 1 byte and 5 MB');
  expect(() => app.validateAssetWorkbook({
    type: valid.type, size: (5 * 1024 * 1024) + 1,
  })).toThrow('between 1 byte and 5 MB');
});

test('uploads the exact xlsx privately without JSON or tenant identity fields', async () => {
  const file = new File(['PK synthetic'], 'assets.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ data: {
      receipt_id: 'xpr_' + 'a'.repeat(32), accepted_rows: 1,
      error_count: 0, errors: [],
    } }),
  });
  const value = await app.assetRequest('/imports/assets/preview', {
    method: 'POST', file,
  });
  expect(value.accepted_rows).toBe(1);
  expect(fetch).toHaveBeenCalledWith('/api/nexus/imports/assets/preview',
    expect.objectContaining({
      method: 'POST', body: file, credentials: 'same-origin',
      cache: 'no-store', mode: 'same-origin', redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers: expect.objectContaining({
        Accept: 'application/json',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'X-CSRF-Token': 'csrf-token-value',
      }),
    }));
  const options = fetch.mock.calls[0][1];
  expect(JSON.stringify(options.headers)).not.toMatch(/tenant|actor|role|provider/i);
});

test('downloads value-free errors only with the bounded preview receipt', async () => {
  const file = new File(['PK synthetic'], 'assets.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const csv = new Blob(['row,column,code\r\n2,status,invalid_choice\r\n'], {
    type: 'text/csv',
  });
  fetch.mockResolvedValue({
    ok: true,
    blob: async () => csv,
    headers: { get: name => name === 'X-Nexus-Errors-Truncated' ? 'false' : null },
  });
  const receipt = 'xpr_' + 'b'.repeat(32);
  const value = await app.assetRequest('/imports/assets/errors', {
    method: 'POST', file, receipt, download: true,
  });
  expect(value.blob).toBe(csv);
  expect(value.truncated).toBe(false);
  expect(fetch.mock.calls[0][1].headers).toEqual(expect.objectContaining({
    'X-Nexus-Preview-Receipt': receipt,
    'X-CSRF-Token': 'csrf-token-value',
  }));
  await expect(app.assetRequest('/imports/assets/errors', {
    method: 'POST', file, receipt: 'customer-supplied-path', download: true,
  })).rejects.toThrow('expired');
  expect(fetch).toHaveBeenCalledTimes(1);
});


test('clears stale preview details and returns keyboard focus to the file chooser', () => {
  document.body.innerHTML = `
    <input id="asset-workbook" type="file">
    <p id="asset-status" role="status" aria-live="polite">Old status</p>
    <div id="asset-preview">
      <strong id="asset-preview-summary">2 problems found</strong>
      <ul id="asset-errors"><li>Row 2, status: invalid_choice</li></ul>
      <button id="asset-error-download" type="button">Download error list</button>
    </div>`;
  const input = document.getElementById('asset-workbook');
  app.clearAssetPreview(document, { focus: true });
  expect(document.getElementById('asset-preview').hidden).toBe(true);
  expect(document.getElementById('asset-preview-summary').textContent).toBe('');
  expect(document.getElementById('asset-errors').children).toHaveLength(0);
  expect(document.getElementById('asset-error-download').hidden).toBe(true);
  expect(document.activeElement).toBe(input);
  expect(document.getElementById('asset-status').getAttribute('role')).toBe('status');
  expect(document.getElementById('asset-status').getAttribute('aria-live')).toBe('polite');
});

test('uses an actionable status for expiry or authorization loss', () => {
  expect(app.assetFailureMessage({ status: 401, message: 'request_denied' }))
    .toBe('Your spreadsheet check expired or your access changed. Choose the file again.');
  expect(app.assetFailureMessage({ status: 403, message: 'operation_denied' }))
    .toBe('Your spreadsheet check expired or your access changed. Choose the file again.');
  expect(app.assetFailureMessage(new Error('Spreadsheet check has expired')))
    .toBe('Spreadsheet check has expired');
  expect(app.assetFailureMessage(new Error('network failed')))
    .toBe('This spreadsheet task is not available yet. Try again later.');
});

test('does not retry a denied stale preview receipt', async () => {
  const file = new File(['PK synthetic'], 'assets.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  fetch.mockResolvedValue({
    ok: false,
    status: 403,
    json: async () => ({ error: 'operation_denied' }),
  });
  await expect(app.assetRequest('/imports/assets/errors', {
    method: 'POST',
    file,
    receipt: 'xpr_' + 'c'.repeat(32),
    download: true,
  })).rejects.toMatchObject({ status: 403, message: 'operation_denied' });
  expect(fetch).toHaveBeenCalledTimes(1);
});

test('asset panel source preserves screen-reader status and noindex preview boundary', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(html).toMatch(/<meta name="robots" content="noindex,nofollow">/);
  expect(html).toMatch(/id="asset-status"[^>]*role="status"[^>]*aria-live="polite"/);
  expect(html).toMatch(/id="asset-workbook" type="file"/);
  expect(html).toMatch(/Do not use real customer data/);
});


test('asset import can proceed only with an exact error-free positive-row receipt', () => {
  const base = { accepted_rows: 2, error_count: 0, receipt_id: 'xpr_' + 'a'.repeat(32) };
  expect(app.canCommitAssetPreview(base)).toBe(true);
  expect(app.canCommitAssetPreview({ ...base, error_count: 1 })).toBe(false);
  expect(app.canCommitAssetPreview({ ...base, accepted_rows: 0 })).toBe(false);
  expect(app.canCommitAssetPreview({ ...base, accepted_rows: -1 })).toBe(false);
  expect(app.canCommitAssetPreview({ ...base, error_count: undefined })).toBe(false);
  expect(app.canCommitAssetPreview({ ...base, receipt_id: 'wrong' })).toBe(false);
  expect(app.canCommitAssetPreview({ ...base, receipt_id: 'xpr_' + 'z'.repeat(32) })).toBe(false);
});

test('asset commit submits same workbook and receipt over authenticated CSRF-protected POST', async () => {
  const file = new File(['PK synthetic workbook'], 'assets.xlsx', {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const receipt = 'xpr_' + 'e'.repeat(32);
  fetch.mockResolvedValue({
    ok: true,
    json: async () => ({ data: { total_rows: 2, receipt_id: receipt } }),
  });
  const result = await app.assetRequest('/imports/assets/commit', {
    method: 'POST', file, receipt,
  });
  expect(result.total_rows).toBe(2);
  expect(fetch).toHaveBeenCalledWith('/api/nexus/imports/assets/commit',
    expect.objectContaining({
      method: 'POST', credentials: 'same-origin', redirect: 'error',
      body: file,
      headers: expect.objectContaining({
        'X-CSRF-Token': 'csrf-token-value',
        'X-Nexus-Preview-Receipt': receipt,
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      }),
    }));
});

test('import confirmation is hidden by default and needs explicit acknowledgement', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/id="asset-commit"[^>]*hidden/);
  expect(html).toMatch(/id="asset-import"[^>]*disabled/);
  expect(html).toMatch(/id="asset-confirm" type="checkbox"/);
  expect(js).toMatch(/assetConfirm\.checked/);
  expect(js).toMatch(/canCommitAssetPreview\(preview\)/);
  expect(js).toMatch(/assetCommitPending/);
  expect(js).toMatch(/clearAssetPreview\(doc\);/);
});


test('selecting a different workbook invalidates a previous preview before import', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(js).toContain("getElementById('asset-workbook').addEventListener('change'");
  expect(js).toContain('Spreadsheet changed. Check it again before importing.');
  expect(js).toContain('assetPreviewReady = false;');
  expect(js).toContain("clearAssetPreview(doc, { clearFile: false });");
});


test('dashboard composition exposes only the privacy-minimized asset total', () => {
  expect(app.dashboardSummaryValues({
    open_work: 1,
    completed_work: 2,
    pending_leave: 3,
    unapproved_punches: 4,
    assets: {
      total_assets: 7,
      items: [{ asset_id: 'must-not-render' }],
      workbook_sha256: 'must-not-render',
    },
  })).toEqual([1, 2, 3, 4, 7]);
  expect(app.dashboardSummaryValues({
    open_work: 1,
    completed_work: 2,
    pending_leave: 3,
    unapproved_punches: 4,
  })).toEqual([1, 2, 3, 4, null]);
  expect(app.dashboardSummaryValues({ assets: { total_assets: -1 } }))
    .toEqual([undefined, undefined, undefined, undefined, null]);
});

test('confirmed import refreshes the dashboard and keeps the asset card aggregate-only', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/<strong>—<\/strong><span>Imported assets<\/span>/);
  expect(js).toMatch(/clearAssetPreview\(doc\);\s+await refresh\(\);/);
  expect(js).toContain('New assets added. Dashboard refreshed.');
  expect(js).not.toMatch(/dashboard\.assets\.(items|asset_id|workbook_sha256)/);
});


test('How To center gives searchable, truthful asset import recovery steps', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  expect(help).toMatch(/<meta name="robots" content="noindex,nofollow">/);
  expect(help).toContain('Bring in an asset spreadsheet');
  expect(help).toContain('This check does not save assets.');
  expect(help).toContain('download the error list');
  expect(help).toContain('Do not reuse an old confirmation.');
  expect(help).toContain('Import new assets');
  expect(help).toContain('Existing assets are not updated or deleted.');
  expect(help).toContain('Do not upload real customer data');
  expect(help).toContain("split(/\\s+/).filter(Boolean)");
  expect(help).toContain("terms.some(term=>!haystack.includes(term))");
});



test('browser-level asset help supports direct links, search recovery, and keyboard access', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(null, '', '/business/help/#asset-spreadsheet-guide');
  window.eval(document.querySelector('script').textContent);

  const input = document.getElementById('search');
  const guide = document.getElementById('asset-spreadsheet-guide');
  const count = document.getElementById('count');
  const empty = document.getElementById('empty');
  const guideTotal = document.querySelectorAll('#guides details').length;

  expect(portal).toContain('href="../help/#asset-spreadsheet-guide"');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(count.getAttribute('role')).toBe('status');
  expect(count.getAttribute('aria-live')).toBe('polite');

  input.value = 'expired receipt';
  input.dispatchEvent(new Event('input'));
  expect(guide.hidden).toBe(false);
  expect(count.textContent).toBe('1 of ' + guideTotal + ' guides shown');
  expect([...document.querySelectorAll('#guides details')]
    .filter(item => !item.hidden)).toEqual([guide]);

  input.value = 'no matching task';
  input.dispatchEvent(new Event('input'));
  expect(count.textContent).toBe('0 of ' + guideTotal + ' guides shown');
  expect(empty.hidden).toBe(false);

  input.value = '';
  input.dispatchEvent(new Event('input'));
  expect(count.textContent).toBe(guideTotal + ' of ' + guideTotal + ' guides shown');
  expect(empty.hidden).toBe(true);
});


test('asset inventory accepts only the bounded backend privacy contract', () => {
  const raw = {
    schema_version: 'assets-v1',
    items: [{
      asset_id: 'asset-1',
      asset_name: 'Forklift',
      site_id: 'site-a',
      status: 'active',
      source: 'xlsx-import',
      committed_at: '2026-10-29T14:30:00+00:00',
    }],
    returned: 1,
    truncated: false,
  };
  expect(app.validatedAssetInventory(raw)).toEqual({
    items: [{
      asset_id: 'asset-1', asset_name: 'Forklift',
      site_id: 'site-a', status: 'active',
    }],
    returned: 1,
    truncated: false,
  });
  for (const invalid of [
    { ...raw, returned: 2 },
    { ...raw, truncated: 'false' },
    { ...raw, receipt_id: 'must-not-be-accepted' },
    { ...raw, items: [{ ...raw.items[0], status: 'unknown' }] },
    { ...raw, items: [{ ...raw.items[0], source: 'manual' }] },
    { ...raw, items: [{ ...raw.items[0], committed_at: 'not-a-date' }] },
    { ...raw, items: [{ ...raw.items[0], workbook_sha256: 'private' }] },
    { ...raw, items: Array.from({ length: 101 }, () => raw.items[0]), returned: 101 },
  ]) {
    expect(() => app.validatedAssetInventory(invalid)).toThrow('unavailable');
  }
});

test('asset inventory renderer uses safe text cells and shows truncation', () => {
  document.body.innerHTML = `
    <table id="asset-inventory-table" hidden><tbody id="asset-inventory-rows"></tbody></table>
    <p id="asset-inventory-truncated" hidden></p>`;
  const value = app.renderAssetInventory(document, {
    schema_version: 'assets-v1',
    items: [{
      asset_id: '<asset-1>',
      asset_name: '<img src=x onerror=alert(1)>',
      site_id: '',
      status: 'maintenance',
      source: 'xlsx-import',
      committed_at: '2026-10-29T14:30:00+00:00',
    }],
    returned: 1,
    truncated: true,
  });
  const cells = [...document.querySelectorAll('td')].map(cell => cell.textContent);
  expect(cells).toEqual([
    '<img src=x onerror=alert(1)>', '<asset-1>', 'No site', 'Maintenance',
  ]);
  expect(document.querySelector('img')).toBeNull();
  expect(document.getElementById('asset-inventory-table').hidden).toBe(false);
  expect(document.getElementById('asset-inventory-truncated').hidden).toBe(false);
  expect(value.items[0]).not.toHaveProperty('source');
  expect(document.body.textContent).not.toContain('xlsx-import');
  expect(document.body.textContent).not.toContain('2026-10-29');
});

test('asset list is explicit-load, read-only, and clears stale rows after import', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/id="asset-inventory-load"[^>]*>Load imported assets/);
  expect(html).toMatch(/id="asset-inventory-status"[^>]*role="status"[^>]*aria-live="polite"/);
  expect(html).toContain('Showing results from the first 100 assets returned.');
  expect(js).toContain("assetInventoryLoad.addEventListener('click'");
  expect(js).toContain("request('/assets')");
  expect(js).toContain("assetInventoryStatus.textContent = 'Assets changed. Load the list again.'");
  expect(String(app.renderAssetInventory)).not.toMatch(/innerHTML|receipt|workbook|billing|principal/);
});


test('loaded asset filters combine search words and fixed status locally', () => {
  const items = [
    { asset_id: 'fork-1', asset_name: 'Main Forklift', site_id: 'site-a', status: 'active' },
    { asset_id: 'gen-2', asset_name: 'Backup Generator', site_id: 'site-b', status: 'maintenance' },
    { asset_id: 'old-3', asset_name: 'Old Pump', site_id: '', status: 'inactive' },
  ];
  expect(app.filterAssetItems(items, 'site-a forklift', 'all'))
    .toEqual([items[0]]);
  expect(app.filterAssetItems(items, 'generator', 'maintenance'))
    .toEqual([items[1]]);
  expect(app.filterAssetItems(items, '', 'inactive'))
    .toEqual([items[2]]);
  expect(app.filterAssetItems(items, 'missing', 'all')).toEqual([]);
  expect(() => app.filterAssetItems(items, '', 'unknown')).toThrow('unavailable');
  expect(() => app.filterAssetItems(Array.from({ length: 101 }, () => items[0]), '', 'all'))
    .toThrow('unavailable');
});

test('clear asset filters restores all loaded rows and keyboard focus locally', () => {
  document.body.innerHTML = `
    <input id="asset-inventory-search" type="search" value="forklift">
    <select id="asset-inventory-status-filter">
      <option value="all">All statuses</option>
      <option value="maintenance" selected>Maintenance</option>
    </select>
    <button id="asset-inventory-clear" type="button">Clear filters</button>`;
  const search = document.getElementById('asset-inventory-search');
  const status = document.getElementById('asset-inventory-status-filter');
  const clear = document.getElementById('asset-inventory-clear');
  const apply = jest.fn();

  app.clearAssetFilters(search, status, clear, apply);

  expect(search.value).toBe('');
  expect(status.value).toBe('all');
  expect(clear.disabled).toBe(true);
  expect(apply).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(search);
  expect(() => app.clearAssetFilters(null, status, clear, apply))
    .toThrow('unavailable');
});

test('asset filters are accessible, bounded to loaded rows, and never refetch', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toMatch(/<label for="asset-inventory-search">Find a loaded asset<\/label>/);
  expect(html).toMatch(/<label for="asset-inventory-status-filter">Status<\/label>/);
  expect(html).toMatch(/id="asset-inventory-clear"[^>]*type="button"[^>]*disabled>Clear filters<\/button>/);
  expect(html).toMatch(/id="asset-inventory-count"[^>]*role="status"[^>]*aria-live="polite"/);
  expect(html).toContain('Showing results from the first 100 assets returned.');
  expect(html).toContain('The full workspace inventory contains more records.');
  expect(js).toContain("assetInventorySearch.addEventListener('input', applyAssetInventoryFilters)");
  expect(js).toContain("assetInventoryStatusFilter.addEventListener('change', applyAssetInventoryFilters)");
  expect(js).toContain("assetInventoryClear.addEventListener('click'");
  expect(js).toContain('clearAssetFilters(');
  expect((js.match(/request\('\/assets'\)/g) || [])).toHaveLength(1);
  expect(String(app.filterAssetItems)).not.toMatch(/fetch|request|receipt|workbook|billing|principal/);
});


test('How To center explains assigned-work completion without payroll claims', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#work-completion-guide"');
  expect(help).toContain('id="work-completion-guide"');
  expect(help).toContain('<strong>Load my work</strong>');
  expect(help).toContain('<strong>Yes, mark complete</strong>');
  expect(help).toContain('<strong>No, keep open</strong>');
  expect(help).toContain('does not automatically retry a completion');
  expect(help).toContain(
    'It does not approve time, calculate pay, or run payroll.');
});

test('How To center explains invoice labels without delivery or settlement claims', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#invoice-status-guide"');
  expect(help).toContain('id="invoice-status-guide"');
  expect(help).toContain(
    '<strong>Issued</strong> is a tracking label. It is not proof that an invoice was delivered.');
  expect(help).toContain(
    '<strong>Paid</strong> is a tracking label. It is not proof that money settled.');
  expect(help).toContain(
    'does not send an invoice, collect payment, confirm settlement, or post an accounting entry.');
});

test('contextual work help opens directly and remains keyboard accessible', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(null, '', '/business/help/#work-completion-guide');
  window.eval(document.querySelector('script').textContent);
  const guide = document.getElementById('work-completion-guide');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(document.getElementById('count').textContent).toMatch(/guides shown/);
});


test('How To center bounds manager leave decisions and access recovery', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#manager-leave-review-guide"');
  expect(help).toContain('id="manager-leave-review-guide"');
  expect(help).toContain('<strong>Load requests to review</strong>');
  expect(help).toContain('<strong>Approve</strong>');
  expect(help).toContain('<strong>Deny</strong>');
  expect(help).toContain(
    'The page does not automatically retry an approval or denial.');
  expect(help).toContain(
    'It does not change payroll, guarantee a paid balance, calculate overtime, or prove policy compliance.');
});

test('contextual manager leave help opens directly and remains keyboard accessible', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(
    null, '', '/business/help/#manager-leave-review-guide');
  window.eval(document.querySelector('script').textContent);
  const guide = document.getElementById('manager-leave-review-guide');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(document.getElementById('count').textContent).toMatch(/guides shown/);
});


test('How To center bounds employee time-clock recovery and claims', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#time-clock-guide"');
  expect(help).toContain('id="time-clock-guide"');
  expect(help).toContain('<strong>Clock in</strong> once');
  expect(help).toContain('<strong>Clock out</strong> once');
  expect(help).toContain('Do not guess a number or create another punch');
  expect(help).toContain(
    'The page does not automatically retry a clock action.');
  expect(help).toContain(
    'It does not calculate wages, overtime, or payroll, and it does not prove an employee\'s physical or jobsite location.');
});

test('How To center bounds manager time review and compliance claims', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#manager-time-review-guide"');
  expect(help).toContain('id="manager-time-review-guide"');
  expect(help).toContain('When an authorized manager review queue is available');
  expect(help).toContain(
    'Do not approve a record with a missing time or unresolved discrepancy.');
  expect(help).toContain(
    'does not calculate pay, establish legal compliance, or prove where the employee worked.');
});

test('contextual time-clock help opens directly and remains keyboard accessible', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(null, '', '/business/help/#time-clock-guide');
  window.eval(document.querySelector('script').textContent);
  const guide = document.getElementById('time-clock-guide');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(document.getElementById('count').textContent).toMatch(/guides shown/);
});


test('How To center separates subscription selection, handoff, billing, and access', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#subscription-checkout-guide"');
  expect(help).toContain('id="subscription-checkout-guide"');
  expect(help).toContain(
    'Saving creates a versioned pending selection only; it is not a charge and does not grant access.');
  expect(help).toContain(
    'Leaving GCS for a provider page is a handoff, not proof of payment or settlement.');
  expect(help).toContain(
    'The recovery keeps the saved selection but uses a fresh retry key; it does not automatically charge anything.');
  expect(help).toContain(
    'the old handoff is stale. Save the current selection and begin a new handoff');
  expect(help).toContain(
    'Returning from checkout does not activate access.');
  expect(help).toContain(
    'active, billing is verified, access is granted, and the required independent approval is complete.');
  expect(help).toContain(
    'It does not prove a live checkout, charge, settlement, subscription, or entitlement.');
});

test('contextual subscription help opens directly and remains keyboard accessible', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(
    null, '', '/business/help/#subscription-checkout-guide');
  window.eval(document.querySelector('script').textContent);
  const guide = document.getElementById('subscription-checkout-guide');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(document.getElementById('count').textContent).toMatch(/guides shown/);
});


test('dashboard refresh clears stale totals before requesting current workspace data', () => {
  document.body.innerHTML = `
    <div id="dashboard">
      <article><strong>8</strong></article>
      <article><strong>5</strong></article>
      <article><strong>3</strong></article>
      <article><strong>2</strong></article>
      <article><strong>13</strong></article>
    </div>`;
  app.clearDashboardSummary(document);
  expect([...document.querySelectorAll('#dashboard strong')]
    .map(node => node.textContent)).toEqual(['—', '—', '—', '—', '—']);

  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(js).toMatch(
    /async function refresh\(\) \{[\s\S]{0,500}clearDashboardSummary\(doc\);[\s\S]{0,500}const dashboard = await run/);
});


test('How To center bounds saved dashboard refresh and summary claims', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const portal = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  expect(portal).toContain('href="../help/#saved-dashboard-guide"');
  expect(help).toContain('id="saved-dashboard-guide"');
  expect(help).toContain(
    'The five totals summarize only the current signed-in workspace.');
  expect(help).toContain(
    'The page clears the old figures before requesting new ones');
  expect(help).toContain(
    'the totals remain as dashes. Sign in again, confirm the correct workspace');
  expect(help).toContain(
    'It does not display asset rows, workbook contents, receipt details, or who imported them.');
  expect(help).toContain(
    'These totals are not payroll calculations, accounting records, invoice-delivery or payment-settlement evidence, compliance determinations, or an audit trail.');
});


test('contextual saved dashboard help opens directly and remains keyboard accessible', () => {
  const help = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'help', 'index.html'), 'utf8');
  const body = help.slice(help.indexOf('<body>') + 6, help.lastIndexOf('</body>'));
  document.body.innerHTML = body;
  window.history.replaceState(
    null, '', '/business/help/#saved-dashboard-guide');
  window.eval(document.querySelector('script').textContent);
  const guide = document.getElementById('saved-dashboard-guide');
  expect(guide.open).toBe(true);
  expect(guide.querySelector('summary').tabIndex).toBe(0);
  expect(document.getElementById('count').textContent).toMatch(/guides shown/);
});


test('workspace access status accepts only the minimized server contract', () => {
  expect(app.validatedAccessStatus({ access: 'manager' })).toBe('manager');
  expect(app.validatedAccessStatus({ access: 'employee' })).toBe('employee');
  expect(app.validatedAccessStatus({ access: 'viewer' })).toBe('viewer');
  for (const value of [
    null,
    {},
    { access: 'admin' },
    { access: 'employee', principal_id: 'must-not-render' },
    { access: 'manager', workspace_id: 'must-not-render' },
  ]) {
    expect(() => app.validatedAccessStatus(value))
      .toThrow('Workspace access is unavailable');
  }
});


test('workspace access label renders plain language and clears on refresh failure', () => {
  document.body.innerHTML = '<p id="access-status">Old access</p>';
  app.renderAccessStatus(document, { access: 'manager' });
  expect(document.getElementById('access-status').textContent)
    .toBe('Manager access verified.');
  app.renderAccessStatus(document, { access: 'employee' });
  expect(document.getElementById('access-status').textContent)
    .toBe('Employee access verified.');
  app.renderAccessStatus(document, { access: 'viewer' });
  expect(document.getElementById('access-status').textContent)
    .toBe('View-only access verified.');
  app.clearAccessStatus(document);
  expect(document.getElementById('access-status').textContent)
    .toBe('Access not verified.');
});


test('workspace refresh checks access without making browser authorization claims', () => {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(html).toContain('id="access-status"');
  expect(html).toContain('Access not verified.');
  expect(html).toContain(
    'The server still checks permission for every action.');
  expect(js).toMatch(
    /async function refresh\(\) \{\s+clearAccessStatus\(doc\);\s+clearDashboardSummary\(doc\);\s+const access = await run\(\(\) => request\('\/access'\)/);
  expect(js).toContain('if (access) renderAccessStatus(doc, access);');
  expect(js).not.toMatch(/access\s*===?\s*['"](?:manager|employee|viewer)['"][\s\S]{0,120}(?:hidden|disabled)/);
});


test('subscription onboarding states remain visibly distinct and fail closed', () => {
  expect(app.subscriptionStatusView({
    status: 'selection_required',
    billing_verified: false,
    grants_access: false,
    staged_revision: null,
  })).toEqual({
    active: false,
    approval_pending: false,
    staged_revision: null,
    message: 'Choose and save business tools. No subscription is active.',
  });

  expect(app.subscriptionStatusView({
    status: 'pending_billing',
    billing_verified: false,
    grants_access: false,
    staged_revision: 3,
  })).toEqual({
    active: false,
    approval_pending: false,
    staged_revision: 3,
    message: 'Selection saved; billing verification is still required.',
  });

  expect(app.subscriptionStatusView({
    status: 'pending_billing',
    billing_verified: true,
    grants_access: false,
    staged_revision: 3,
  })).toEqual({
    active: false,
    approval_pending: true,
    staged_revision: null,
    message: 'Billing verified; access is still waiting for approval.',
  });

  expect(app.subscriptionStatusView({
    status: 'active',
    billing_verified: true,
    grants_access: true,
    staged_revision: 3,
  })).toEqual({
    active: true,
    approval_pending: false,
    staged_revision: null,
    message: 'Subscription active.',
  });

  for (const invalid of [
    null,
    { status: 'selection_required', billing_verified: false,
      grants_access: false, staged_revision: 1 },
    { status: 'pending_billing', billing_verified: false,
      grants_access: false, staged_revision: null },
    { status: 'pending_billing', billing_verified: false,
      grants_access: true, staged_revision: 1 },
    { status: 'active', billing_verified: false,
      grants_access: true, staged_revision: 1 },
    { status: 'unknown', billing_verified: false,
      grants_access: false, staged_revision: null },
  ]) {
    expect(app.subscriptionStatusView(invalid)).toEqual({
      active: false,
      approval_pending: false,
      staged_revision: null,
      message: 'Subscription status is unavailable. Try again later.',
    });
  }
});


test('workspace refresh uses validated subscription onboarding presentation', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(js).toContain(
    'const subscriptionView = subscriptionStatusView(subscription);');
  expect(js).toContain(
    "doc.getElementById('subscription-state').textContent = subscriptionView.message;");
  expect(js).toMatch(
    /checkoutReady\(\s+subscriptionView\.staged_revision,\s+subscriptionView\.active,\s+subscriptionView\.approval_pending/);
  expect(js).not.toMatch(
    /subscription-state'\)\.textContent = active\s+\?/);
});


test('verified billing awaiting approval cannot start another checkout', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(js).toMatch(
    /checkoutButton\.disabled = checkoutPending \|\| active \|\| approvalPending\s+\|\| stagedRevision === null;/);
  expect(js).toContain(
    'Billing is verified. Access approval is pending; no checkout is needed.');
  expect(js).toContain('approvalPending ? null : subscription.staged_revision');
});


test('subscription refresh clears stale status and checkout readiness', () => {
  document.body.innerHTML = `
    <p id="subscription-state">Subscription active.</p>
    <button id="continue-checkout">Continue to secure checkout</button>
    <p id="checkout-state">Your selection is saved.</p>`;
  document.getElementById('continue-checkout').disabled = false;

  app.clearSubscriptionPresentation(document);

  expect(document.getElementById('subscription-state').textContent)
    .toBe('Subscription status not verified.');
  expect(document.getElementById('continue-checkout').disabled).toBe(true);
  expect(document.getElementById('checkout-state').textContent)
    .toBe('Refresh subscription status before continuing.');
});


test('subscription presentation clears before the authenticated status request', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  expect(js).toMatch(
    /stagedRevision = null;\s+clearSubscriptionPresentation\(doc\);\s+const subscription = await run\(\(\) => request\('\/subscription'\)/);
  expect(js.indexOf('clearSubscriptionPresentation(doc);'))
    .toBeLessThan(js.indexOf("request('/subscription')"));
});

test('subscription save fails closed and validates the returned status before checkout', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  const submit = js.slice(
    js.indexOf("getElementById('subscription-form').addEventListener('submit'"),
    js.indexOf("checkoutButton.addEventListener('click'"),
  );

  expect(submit).toMatch(
    /stagedRevision = null;\s+clearSubscriptionPresentation\(doc\);\s+run\(\(\) => request\('\/subscription', \{ method: 'POST'/);
  expect(submit).toContain("'Subscription request completed.'");
  expect(submit).toContain('presentSubscription(value);');
  expect(submit).not.toContain('checkoutReady(value.staged_revision)');
  expect(submit).not.toContain(
    'Selection saved; billing verification is still required.');
});

test('saved subscription responses share approval and active checkout lockout', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  const presentation = js.slice(
    js.indexOf('function presentSubscription(subscription)'),
    js.indexOf('async function refresh()'),
  );

  expect(presentation).toContain(
    'const subscriptionView = subscriptionStatusView(subscription);');
  expect(presentation).toMatch(
    /checkoutReady\(\s+subscriptionView\.staged_revision,\s+subscriptionView\.active,\s+subscriptionView\.approval_pending/);
  expect(presentation).toContain(
    'clearCompletedCheckout(subscription, view.sessionStorage);');
});

test('validates the complete checkout intent before persistence or navigation', () => {
  const ready = {
    intent_id: 'checkout-123',
    selection_revision: 7,
    selection_current: true,
    status: 'READY_FOR_PROVIDER',
    expires_at: null,
    created_at: '2026-11-05T05:00:00Z',
    updated_at: '2026-11-05T05:00:00Z',
    checkout_url: null,
  };
  expect(app.validatedCheckoutIntent(ready, 7)).toEqual(ready);

  const provider = {
    ...ready,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-05T05:15:00Z',
    checkout_url: 'https://checkout.example.test/session/one',
  };
  const beforeExpiry = Date.parse('2026-11-05T05:14:59Z');
  expect(app.validatedCheckoutIntent(
    provider, 7, 'checkout-123', beforeExpiry,
  )).toEqual(provider);
  for (const expiredAt of [
    Date.parse('2026-11-05T05:15:00Z'),
    Date.parse('2026-11-05T05:15:01Z'),
  ]) {
    expect(() => app.validatedCheckoutIntent(
      provider, 7, 'checkout-123', expiredAt,
    )).toThrow('Secure checkout response is invalid');
  }
  expect(() => app.validatedCheckoutIntent(
    { ...provider, expires_at: null }, 7, 'checkout-123', beforeExpiry,
  )).toThrow('Secure checkout response is invalid');
});

test('rejects malformed, mismatched, or over-shared checkout intents', () => {
  const valid = {
    intent_id: 'checkout-123',
    selection_revision: 7,
    selection_current: true,
    status: 'READY_FOR_PROVIDER',
    expires_at: null,
    created_at: '2026-11-05T05:00:00Z',
    updated_at: '2026-11-05T05:00:00Z',
    checkout_url: null,
  };
  const invalid = [
    null,
    { ...valid, provider: 'must-not-reach-browser' },
    { ...valid, intent_id: 'bad intent' },
    { ...valid, selection_revision: 0 },
    { ...valid, selection_current: 'yes' },
    { ...valid, status: 'UNKNOWN' },
    { ...valid, created_at: 'not-a-time' },
    { ...valid, expires_at: 'not-a-time' },
    { ...valid, checkout_url: 'https://checkout.example.test/session/one' },
    { ...valid, status: 'PROVIDER_SESSION', selection_current: false,
      checkout_url: 'https://checkout.example.test/session/one' },
  ];
  for (const value of invalid) {
    expect(() => app.validatedCheckoutIntent(value))
      .toThrow('Secure checkout response is invalid');
  }
  expect(() => app.validatedCheckoutIntent(valid, 8))
    .toThrow('Secure checkout response is invalid');
  expect(() => app.validatedCheckoutIntent(valid, 7, 'checkout-other'))
    .toThrow('Secure checkout response is invalid');
});

test('every checkout response is validated before intent storage', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  const checkout = js.slice(
    js.indexOf("checkoutButton.addEventListener('click'"),
    js.indexOf('checkoutReady(null);'),
  );
  expect((checkout.match(/validatedCheckoutIntent\(/g) || [])).toHaveLength(4);
  expect(checkout).not.toMatch(
    /intent = await request\('\/subscription\/checkout-intent/);
  expect(checkout.indexOf('validatedCheckoutIntent('))
    .toBeLessThan(checkout.indexOf('sessionStorage.setItem(INTENT_KEY'));
});

test('checkout handoff is single-flight and stays disabled while pending', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  const checkout = js.slice(
    js.indexOf("checkoutButton.addEventListener('click'"),
    js.indexOf('checkoutReady(null);'),
  );

  expect(js).toContain('let checkoutPending = false;');
  expect(js).toMatch(
    /checkoutButton\.disabled = checkoutPending \|\| active \|\| approvalPending\s+\|\| stagedRevision === null;/);
  expect(checkout).toMatch(
    /if \(checkoutPending\) return;\s+checkoutPending = true;\s+checkoutButton\.disabled = true;\s+checkoutState\.textContent = 'Preparing secure checkout…';/);
  expect(checkout.indexOf('checkoutPending = true;'))
    .toBeLessThan(checkout.indexOf("request('/subscription/checkout-intent"));
  expect(checkout).toMatch(
    /const intent = await run\([\s\S]+checkoutPending = false;\s+if \(!intent \|\| !intent\.checkout_url\) \{\s+checkoutButton\.disabled = stagedRevision === null;/);
});

test('single-flight checkout keeps the existing idempotency boundary', () => {
  const js = fs.readFileSync(
    path.join(__dirname, '..', 'js', 'business-app.js'), 'utf8');
  const checkout = js.slice(
    js.indexOf("checkoutButton.addEventListener('click'"),
    js.indexOf('checkoutReady(null);'),
  );

  expect(checkout).toContain(
    'let key = view.sessionStorage.getItem(IDEMPOTENCY_KEY);');
  expect(checkout).toContain(
    'view.sessionStorage.setItem(IDEMPOTENCY_KEY, key);');
  expect(checkout).toContain('expected_selection_revision: stagedRevision');
  expect(checkout).toContain('validatedCheckoutIntent(');
});



async function flushCheckoutRuntime() {
  for (let index = 0; index < 20; index += 1) {
    await Promise.resolve();
  }
}

function initCheckoutRuntime(checkoutResponse, options = {}) {
  const html = fs.readFileSync(
    path.join(__dirname, '..', 'business', 'app', 'index.html'), 'utf8');
  document.body.innerHTML = html.slice(
    html.indexOf('<body>') + 6,
    html.lastIndexOf('</body>'),
  );
  window.sessionStorage.clear();
  if (options.intentId) {
    window.sessionStorage.setItem('nexus.checkout.intent', options.intentId);
  }
  if (options.idempotencyKey) {
    window.sessionStorage.setItem(
      'nexus.checkout.idempotency', options.idempotencyKey);
  }
  fetch.mockImplementation(url => {
    const respond = data => Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data }),
    });
    if (url.endsWith('/access')) return respond({ access: 'employee' });
    if (url.endsWith('/dashboard')) {
      return respond({
        open_work: 0,
        completed_work: 0,
        pending_leave: 0,
        unapproved_punches: 0,
        assets: { total_assets: 0 },
      });
    }
    if (url.endsWith('/subscription')) {
      return respond({
        status: 'pending_billing',
        billing_verified: false,
        grants_access: false,
        staged_revision: 7,
      });
    }
    if (url.endsWith('/subscription/checkout-intent/status')) {
      return options.statusResponse;
    }
    if (url.endsWith('/subscription/checkout-intent/retry')) {
      return options.retryResponse;
    }
    if (url.endsWith('/subscription/checkout-intent')) return checkoutResponse;
    throw new Error('Unexpected runtime request: ' + url);
  });
  app.init(document);
  return document.getElementById('continue-checkout');
}

test('delayed checkout runtime ignores repeated activation and re-enables without a URL', async () => {
  let releaseCheckout;
  const checkoutResponse = new Promise(resolve => { releaseCheckout = resolve; });
  const checkoutButton = initCheckoutRuntime(checkoutResponse);
  await flushCheckoutRuntime();
  expect(checkoutButton.disabled).toBe(false);

  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

  const checkoutCalls = () => fetch.mock.calls.filter(
    ([url]) => url.endsWith('/subscription/checkout-intent'),
  );
  expect(checkoutCalls()).toHaveLength(1);
  expect(checkoutButton.disabled).toBe(true);
  expect(document.getElementById('checkout-state').textContent)
    .toBe('Preparing secure checkout…');

  releaseCheckout({
    ok: true,
    status: 200,
    json: async () => ({ data: {
      intent_id: 'checkout-123',
      selection_revision: 7,
      selection_current: true,
      status: 'READY_FOR_PROVIDER',
      expires_at: null,
      created_at: '2026-11-05T08:00:00Z',
      updated_at: '2026-11-05T08:00:00Z',
      checkout_url: null,
    } }),
  });
  await flushCheckoutRuntime();

  expect(checkoutCalls()).toHaveLength(1);
  expect(checkoutButton.disabled).toBe(false);
  expect(document.getElementById('checkout-state').textContent)
    .toBe('Secure checkout is being prepared. Try again later.');
});

test('delayed checkout failure restores only the eligible saved selection', async () => {
  let releaseCheckout;
  const checkoutResponse = new Promise(resolve => { releaseCheckout = resolve; });
  const checkoutButton = initCheckoutRuntime(checkoutResponse);
  await flushCheckoutRuntime();

  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  expect(checkoutButton.disabled).toBe(true);

  releaseCheckout({
    ok: false,
    status: 503,
    json: async () => ({ error: 'workspace_unavailable' }),
  });
  await flushCheckoutRuntime();

  expect(fetch.mock.calls.filter(
    ([url]) => url.endsWith('/subscription/checkout-intent'),
  )).toHaveLength(1);
  expect(checkoutButton.disabled).toBe(false);
  expect(document.getElementById('app-status').textContent)
    .toBe('This task is not available yet. Try again later.');
  expect(document.getElementById('app-status').classList.contains('error')).toBe(true);
});


test('malformed provider timeline restores eligible checkout without persistence', async () => {
  const originalLocation = window.location.href;
  const malformed = {
    intent_id: 'checkout-malformed-runtime',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-05T13:00:00Z',
    created_at: '2026-11-05T12:31:00Z',
    updated_at: '2026-11-05T12:30:00Z',
    checkout_url: 'https://checkout.example.test/session/malformed-runtime',
  };
  const checkoutButton = initCheckoutRuntime(Promise.resolve({
    ok: true,
    status: 200,
    json: async () => ({ data: malformed }),
  }));
  await flushCheckoutRuntime();
  expect(checkoutButton.disabled).toBe(false);

  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  await flushCheckoutRuntime();

  expect(fetch.mock.calls.filter(
    ([url]) => url.endsWith('/subscription/checkout-intent'),
  )).toHaveLength(1);
  expect(window.sessionStorage.getItem('nexus.checkout.intent')).toBeNull();
  expect(window.location.href).toBe(originalLocation);
  expect(checkoutButton.disabled).toBe(false);
  expect(document.getElementById('checkout-state').textContent)
    .toBe('Secure checkout was not started. Try again later.');
  expect(document.getElementById('app-status').textContent)
    .toBe('This task is not available yet. Try again later.');
  expect(document.getElementById('app-status').classList.contains('error')).toBe(true);
});

test('checkout navigation validates before assigning a new location', () => {
  const view = { location: { assign: jest.fn() } };
  expect(app.navigateToCheckout(
    view, 'https://checkout.example.test/session/verified',
  )).toBe('https://checkout.example.test/session/verified');
  expect(view.location.assign).toHaveBeenCalledTimes(1);
  expect(view.location.assign).toHaveBeenCalledWith(
    'https://checkout.example.test/session/verified');

  view.location.assign.mockClear();
  for (const invalid of [
    'http://checkout.example.test/session/one',
    'https://user@checkout.example.test/session/one',
    'https://checkout.example.test:444/session/one',
    'https://checkout.example.test/session/one#fragment',
    'not a url',
  ]) {
    expect(() => app.navigateToCheckout(view, invalid)).toThrow(
      'Secure checkout address is invalid');
  }
  expect(view.location.assign).not.toHaveBeenCalled();
  expect(() => app.navigateToCheckout({}, 'https://checkout.example.test'))
    .toThrow('Secure checkout navigation is unavailable');
});

test('delayed saved-intent retry remains single-flight', async () => {
  let releaseStatus;
  const statusResponse = new Promise(resolve => { releaseStatus = resolve; });
  const retryIntent = {
    intent_id: 'checkout-saved',
    selection_revision: 7,
    selection_current: true,
    status: 'READY_FOR_PROVIDER',
    expires_at: null,
    created_at: '2026-11-05T09:00:00Z',
    updated_at: '2026-11-05T09:05:00Z',
    checkout_url: null,
  };
  const checkoutButton = initCheckoutRuntime(undefined, {
    intentId: 'checkout-saved',
    idempotencyKey: 'nexus-' + 'ab'.repeat(24),
    statusResponse,
    retryResponse: Promise.resolve({
      ok: true,
      status: 200,
      json: async () => ({ data: retryIntent }),
    }),
  });
  await flushCheckoutRuntime();
  expect(checkoutButton.disabled).toBe(false);

  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
  checkoutButton.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 0 }));

  const callsEnding = suffix => fetch.mock.calls.filter(
    ([url]) => url.endsWith(suffix),
  );
  expect(callsEnding('/subscription/checkout-intent/status')).toHaveLength(1);
  expect(callsEnding('/subscription/checkout-intent/retry')).toHaveLength(0);
  expect(checkoutButton.disabled).toBe(true);

  releaseStatus({
    ok: true,
    status: 200,
    json: async () => ({ data: {
      ...retryIntent,
      status: 'PROVIDER_SESSION',
      expires_at: '2026-11-05T08:59:59Z',
      updated_at: '2026-11-05T09:00:00Z',
    } }),
  });
  await flushCheckoutRuntime();

  expect(callsEnding('/subscription/checkout-intent/status')).toHaveLength(1);
  expect(callsEnding('/subscription/checkout-intent/retry')).toHaveLength(1);
  expect(callsEnding('/subscription/checkout-intent')).toHaveLength(0);
  expect(checkoutButton.disabled).toBe(false);
  expect(document.getElementById('checkout-state').textContent)
    .toBe('Secure checkout is being prepared. Try again later.');
  expect(window.sessionStorage.getItem('nexus.checkout.intent'))
    .toBe('checkout-saved');
  expect(window.sessionStorage.getItem('nexus.checkout.idempotency'))
    .not.toBe('nexus-' + 'ab'.repeat(24));
});


test('expired checkout URL never reaches the navigation boundary', () => {
  const view = { location: { assign: jest.fn() } };
  const expired = {
    intent_id: 'checkout-expired',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-05T10:00:00Z',
    created_at: '2026-11-05T09:55:00Z',
    updated_at: '2026-11-05T09:59:00Z',
    checkout_url: 'https://checkout.example.test/session/expired',
  };
  expect(() => {
    const intent = app.validatedCheckoutIntent(
      expired,
      7,
      'checkout-expired',
      Date.parse('2026-11-05T10:00:00Z'),
    );
    app.navigateToCheckout(view, intent.checkout_url);
  }).toThrow('Secure checkout response is invalid');
  expect(view.location.assign).not.toHaveBeenCalled();
});


test('checkout provider lifetime is capped at twenty-four hours', () => {
  const clientNow = Date.parse('2026-11-05T11:55:00Z');
  const base = {
    intent_id: 'checkout-lifetime',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-05T12:00:00Z',
    checkout_url: 'https://checkout.example.test/session/lifetime',
  };
  const exactlyTwentyFourHours = {
    ...base,
    expires_at: '2026-11-06T12:00:00Z',
  };
  expect(app.validatedCheckoutIntent(
    exactlyTwentyFourHours, 7, 'checkout-lifetime', clientNow,
  )).toEqual(exactlyTwentyFourHours);

  const tooLong = {
    ...base,
    expires_at: '2026-11-06T12:00:00.001Z',
  };
  expect(() => app.validatedCheckoutIntent(
    tooLong, 7, 'checkout-lifetime', clientNow,
  )).toThrow('Secure checkout response is invalid');
});

test('overlong checkout lifetime never reaches navigation', () => {
  const view = { location: { assign: jest.fn() } };
  const overlong = {
    intent_id: 'checkout-overlong',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-06T12:00:00.001Z',
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-05T12:00:00Z',
    checkout_url: 'https://checkout.example.test/session/overlong',
  };
  expect(() => {
    const intent = app.validatedCheckoutIntent(
      overlong,
      7,
      'checkout-overlong',
      Date.parse('2026-11-05T12:00:00Z'),
    );
    app.navigateToCheckout(view, intent.checkout_url);
  }).toThrow('Secure checkout response is invalid');
  expect(view.location.assign).not.toHaveBeenCalled();
});


test('URL-bearing checkout intents require monotonic provider timestamps', () => {
  const base = {
    intent_id: 'checkout-monotonic',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-05T12:30:00Z',
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-05T12:00:00Z',
    checkout_url: 'https://checkout.example.test/session/monotonic',
  };
  const clientNow = Date.parse('2026-11-05T11:59:00Z');
  expect(app.validatedCheckoutIntent(
    base, 7, 'checkout-monotonic', clientNow,
  )).toEqual(base);

  for (const invalid of [
    {
      ...base,
      created_at: '2026-11-05T12:01:00Z',
      updated_at: '2026-11-05T12:00:00Z',
    },
    {
      ...base,
      updated_at: '2026-11-05T12:30:00Z',
    },
    {
      ...base,
      updated_at: '2026-11-05T12:31:00Z',
    },
  ]) {
    expect(() => app.validatedCheckoutIntent(
      invalid, 7, 'checkout-monotonic', clientNow,
    )).toThrow('Secure checkout response is invalid');
  }
});

test('non-monotonic provider timestamps never reach navigation', () => {
  const view = { location: { assign: jest.fn() } };
  const base = {
    intent_id: 'checkout-ordering',
    selection_revision: 7,
    selection_current: true,
    status: 'PROVIDER_SESSION',
    expires_at: '2026-11-05T13:00:00Z',
    created_at: '2026-11-05T12:00:00Z',
    updated_at: '2026-11-05T12:30:00Z',
    checkout_url: 'https://checkout.example.test/session/ordering',
  };
  const clientNow = Date.parse('2026-11-05T11:59:00Z');

  for (const invalid of [
    { ...base, created_at: '2026-11-05T12:31:00Z' },
    { ...base, updated_at: '2026-11-05T13:00:00Z' },
    { ...base, updated_at: '2026-11-05T13:01:00Z' },
  ]) {
    expect(() => {
      const intent = app.validatedCheckoutIntent(
        invalid, 7, 'checkout-ordering', clientNow,
      );
      app.navigateToCheckout(view, intent.checkout_url);
    }).toThrow('Secure checkout response is invalid');
  }
  expect(view.location.assign).not.toHaveBeenCalled();
});
