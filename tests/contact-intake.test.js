const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../contact/index.html'), 'utf8');
const bodyMatch = html.match(/<body>([\s\S]*)<\/body>/i);
const scripts = Array.from(html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi))
  .map((match) => match[1].trim())
  .filter(Boolean);
const contactHandler = scripts[scripts.length - 1];

function renderContactForm() {
  document.body.innerHTML = bodyMatch[1];
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('contact intake submission behavior', () => {
  beforeEach(() => {
    renderContactForm();
    global.fetch = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
    window.eval(contactHandler);
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  test('blocks incomplete contact requests before any network call', () => {
    const form = document.getElementById('contact-form');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(document.getElementById('contact-name').getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('contact-name-error').textContent).toBe('Please complete this field.');
    expect(document.getElementById('contact-success').hidden).toBe(true);
  });

  test('encodes the complete bounded contact request and announces success', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200 });
    document.getElementById('contact-name').value = 'Jordan Lee';
    document.getElementById('contact-org').value = 'Example Township';
    document.getElementById('contact-email').value = 'jordan@example.gov';
    document.getElementById('contact-phone').value = '555-0100';
    document.getElementById('contact-industry').value = 'Local government';
    document.getElementById('contact-interest').value = 'Operations';
    document.getElementById('contact-challenge').value = 'We need one defensible view of facilities, assets, and capital needs.';

    const form = document.getElementById('contact-form');
    const success = document.getElementById('contact-success');
    const focusSpy = jest.spyOn(success, 'focus');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(options.body).toContain('form-name=contact');
    expect(options.body).toContain('bot-field=');
    expect(options.body).toContain('name=Jordan%20Lee');
    expect(options.body).toContain('organization=Example%20Township');
    expect(options.body).toContain('email=jordan%40example.gov');
    expect(options.body).toContain('interest=Operations');
    expect(options.body).toContain('challenge=We%20need%20one%20defensible%20view');
    expect(form.hidden).toBe(true);
    expect(success.hidden).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('restores the contact action and exposes a recoverable failure', async () => {
    global.fetch.mockRejectedValue(new Error('network unavailable'));
    document.getElementById('contact-name').value = 'Jordan Lee';
    document.getElementById('contact-org').value = 'Example Township';
    document.getElementById('contact-email').value = 'jordan@example.gov';
    document.getElementById('contact-industry').value = 'Local government';
    document.getElementById('contact-interest').value = 'Operations';
    document.getElementById('contact-challenge').value = 'We need one defensible view of facilities, assets, and capital needs.';

    const form = document.getElementById('contact-form');
    const button = form.querySelector('[type="submit"]');
    const error = document.getElementById('contact-error');
    const focusSpy = jest.spyOn(error, 'focus');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Contact GCS');
    expect(error.hidden).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });
});
