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

test('portal source contains no live billing, payroll or availability claim', () => {
  document.body.innerHTML = '<main></main>';
  expect(app.API).toBe('/api/nexus');
  expect(String(app.request)).not.toMatch(/bank|password|payment method/i);
});
