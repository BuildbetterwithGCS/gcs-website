/** @jest-environment jsdom */
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
