const fs = require('fs');
const path = require('path');

const source = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');

function renderForm() {
  document.body.innerHTML = `
    <div>
      <form data-honest-form data-form-kind="Demonstration request">
        <input type="hidden" name="form-name" value="demo-request">
        <label for="demo-name">Full name *</label>
        <input id="demo-name" name="name" required maxlength="120" aria-describedby="demo-name-error">
        <p id="demo-name-error" class="form-error"></p>

        <label for="demo-email">Work email *</label>
        <input id="demo-email" name="email" type="email" required maxlength="254" aria-describedby="demo-email-error">
        <p id="demo-email-error" class="form-error"></p>

        <label><input type="checkbox" name="interest" value="ops">Operations</label>
        <label><input type="checkbox" name="interest" value="risk">Risk</label>

        <label for="demo-goals">What are you trying to solve? *</label>
        <textarea id="demo-goals" name="goals" required maxlength="2000" aria-describedby="demo-goals-error"></textarea>
        <p id="demo-goals-error" class="form-error"></p>

        <button type="submit">Submit request</button>
      </form>
      <div data-form-result hidden tabindex="-1">Request submitted.</div>
      <div data-form-error hidden tabindex="-1">Submission failed.</div>
    </div>
  `;
}

function loadMain() {
  window.eval(source);
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

describe('client intake submission behavior', () => {
  beforeEach(() => {
    renderForm();
    global.fetch = jest.fn();
    Element.prototype.scrollIntoView = jest.fn();
  });

  afterEach(() => {
    delete global.fetch;
    jest.restoreAllMocks();
  });

  test('blocks invalid intake before any network request', () => {
    loadMain();
    const form = document.querySelector('form');
    const name = document.getElementById('demo-name');

    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

    expect(global.fetch).not.toHaveBeenCalled();
    expect(name.getAttribute('aria-invalid')).toBe('true');
    expect(document.getElementById('demo-name-error').textContent).toBe('Please complete this field.');
    expect(document.querySelector('[data-form-result]').hidden).toBe(true);
  });

  test('encodes valid fields and announces successful submission', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200 });
    document.getElementById('demo-name').value = 'Jordan Lee';
    document.getElementById('demo-email').value = 'jordan@example.com';
    document.getElementById('demo-goals').value = 'We need a defensible asset plan across six facilities.';
    document.querySelector('input[value="ops"]').checked = true;
    document.querySelector('input[value="risk"]').checked = true;
    loadMain();

    const form = document.querySelector('form');
    const result = document.querySelector('[data-form-result]');
    const focusSpy = jest.spyOn(result, 'focus');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = global.fetch.mock.calls[0];
    expect(url).toBe('/');
    expect(options.method).toBe('POST');
    expect(options.headers).toEqual({ 'Content-Type': 'application/x-www-form-urlencoded' });
    expect(options.body).toContain('form-name=demo-request');
    expect(options.body).toContain('name=Jordan%20Lee');
    expect(options.body).toContain('email=jordan%40example.com');
    expect(options.body).toContain('interest=ops');
    expect(options.body).toContain('interest=risk');
    expect(options.body).toContain('goals=We%20need%20a%20defensible%20asset%20plan');
    expect(form.hidden).toBe(true);
    expect(result.hidden).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });

  test('restores the form action and exposes a recoverable error', async () => {
    global.fetch.mockRejectedValue(new Error('network unavailable'));
    document.getElementById('demo-name').value = 'Jordan Lee';
    document.getElementById('demo-email').value = 'jordan@example.com';
    document.getElementById('demo-goals').value = 'We need a defensible asset plan across six facilities.';
    loadMain();

    const form = document.querySelector('form');
    const button = form.querySelector('[type="submit"]');
    const error = document.querySelector('[data-form-error]');
    const focusSpy = jest.spyOn(error, 'focus');
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flushPromises();

    expect(button.disabled).toBe(false);
    expect(button.textContent).toBe('Submit request');
    expect(error.hidden).toBe(false);
    expect(focusSpy).toHaveBeenCalled();
  });
});
