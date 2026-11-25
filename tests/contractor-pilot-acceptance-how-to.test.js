/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(
  __dirname, 'fixtures', 'contractor-pilot-acceptance-how-to.html',
);
const html = fs.readFileSync(fixturePath, 'utf8');

function parsedFixture() {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

test('acceptance How To is inactive, noindex, and contract-versioned', () => {
  const page = parsedFixture();
  const root = page.getElementById('contractor-pilot-acceptance');

  expect(page.querySelector('meta[name="robots"]').content)
    .toBe('noindex,nofollow');
  expect(root.dataset).toMatchObject({
    schemaVersion: 'gcs-contractor-pilot-acceptance-v1',
    classification: 'INTERNAL_SYNTHETIC_NONPRODUCTION',
    runnerStatus: 'PASS_INTERNAL_STEPS',
    externalStageStatus: 'BLOCKED_EXTERNAL',
  });
  expect(page.querySelectorAll('a, button, input, select, textarea, form'))
    .toHaveLength(0);
  expect(html).not.toMatch(/<script\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/i);
});

test('acceptance How To mirrors all seven bounded internal steps', () => {
  const page = parsedFixture();
  const steps = [...page.querySelectorAll('#internal-steps [data-step-id]')];

  expect(steps.map(step => step.dataset.stepId)).toEqual([
    'access_and_roles',
    'subscription_test_mode',
    'workforce_setup',
    'sales_operations',
    'field_operations',
    'finance_and_documents',
    'dashboard_and_assistant',
  ]);
  expect(steps.every(step => step.dataset.status === 'PASS')).toBe(true);

  const text = page.body.textContent;
  expect(text).toContain('cross-tenant session is denied');
  expect(text).toContain('entitlement remains unverified');
  expect(text).toContain('perform no payroll calculation');
  expect(text).toContain('without contacting a customer');
  expect(text).toContain('no GPS tracking');
  expect(text).toContain('perform no payment');
  expect(text).toContain('TEST_DATA_NOT_DELIVERABLE');
  expect(text).toContain('no email or provider delivery');
});

test('acceptance How To keeps all external gates blocked', () => {
  const page = parsedFixture();
  const gates = [...page.querySelectorAll(
    '#external-prerequisites [data-prerequisite-id]',
  )];

  expect(gates.map(gate => gate.dataset.prerequisiteId)).toEqual([
    'independent_reviews',
    'hosted_runtime',
    'billing_provider',
    'email_delivery',
    'radius_bid_discovery',
    'coastal_onboarding',
  ]);
  expect(gates.every(gate => gate.dataset.status === 'BLOCKED')).toBe(true);
  expect(page.body.textContent).toContain('No customer action is requested');
});

test('acceptance How To contains no unsupported affirmative live claim', () => {
  const text = parsedFixture().body.textContent.replace(/\s+/g, ' ').trim();

  for (const claim of [
    /subscription is live/i,
    /payment (?:was|is) collected/i,
    /payroll (?:was|is) calculated/i,
    /email (?:was|is) delivered/i,
    /customer (?:was|is) onboarded/i,
    /bid (?:was|is) submitted/i,
    /provider (?:was|is) verified/i,
    /production[- ]ready/i,
  ]) {
    expect(text).not.toMatch(claim);
  }

  expect(text).toContain('Do not represent a live subscription');
  expect(text).toContain('Do not contact, invite, charge, or access');
  expect(text).not.toMatch(/@[a-z0-9.-]+|\b\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}\b/i);
});
