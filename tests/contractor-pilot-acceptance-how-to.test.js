/** @jest-environment jsdom */
const fs = require('fs');
const path = require('path');

const fixturePath = path.join(
  __dirname, 'fixtures', 'contractor-pilot-acceptance-how-to.html',
);
const snapshotPath = path.join(
  __dirname, 'fixtures', 'gcs-contractor-pilot-acceptance-v1.snapshot.json',
);
const html = fs.readFileSync(fixturePath, 'utf8');
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
const contract = snapshot.contract;

function parsedFixture() {
  const parser = new DOMParser();
  return parser.parseFromString(html, 'text/html');
}

test('acceptance How To is inactive, noindex, and contract-versioned', () => {
  const page = parsedFixture();
  const root = page.getElementById('contractor-pilot-acceptance');

  expect(snapshot.snapshot_schema_version)
    .toBe('gcs-contractor-pilot-acceptance-snapshot-v1');
  expect(snapshot.source).toEqual({
    repository: 'BuildbetterwithGCS/gcs-founder',
    commit: 'cce95c7b92d416949c2ace80aa60dbcab2dc1c3c',
    path: 'reports/gcs-contractor-pilot-acceptance-v1.json',
    captured_on: '2026-11-25',
  });
  expect(page.querySelector('meta[name="robots"]').content)
    .toBe('noindex,nofollow');
  expect(root.dataset).toMatchObject({
    schemaVersion: contract.schema_version,
    classification: contract.classification,
    runnerStatus: contract.runner_status,
    externalStageStatus: contract.external_stage_status,
    sourceContractCommit: snapshot.source.commit,
    sourceContractPath: snapshot.source.path,
  });
  expect(contract.customer_action_required).toBe(false);
  expect(page.querySelectorAll('a, button, input, select, textarea, form'))
    .toHaveLength(0);
  expect(html).not.toMatch(
    /<script\b|\bfetch\s*\(|XMLHttpRequest|sendBeacon|WebSocket/i,
  );
});

test('How To step contract cannot drift from the founder snapshot', () => {
  const page = parsedFixture();
  const rendered = [...page.querySelectorAll(
    '#internal-steps [data-step-id]',
  )].map(step => ({
    step_id: step.dataset.stepId,
    status: step.dataset.status,
    acceptance: JSON.parse(step.dataset.acceptance),
  }));
  const expected = contract.internal_steps.map(step => ({
    step_id: step.step_id,
    status: step.status,
    acceptance: step.acceptance,
  }));

  expect(rendered).toEqual(expected);
  expect(rendered).toHaveLength(7);

  const text = page.body.textContent;
  expect(text).toContain('cross-tenant session is denied');
  expect(text).toContain('entitlement remains unverified');
  expect(text).toContain('perform no payroll calculation');
  expect(text).toContain('without contacting a customer');
  expect(text).toContain('no GPS tracking');
  expect(text).toContain('perform no payment');
  expect(text).toContain('TEST_DATA_NOT_DELIVERABLE');
  expect(text).toContain('allowlisted synthetic source');
  expect(text).toContain('viewer exclusion');
  expect(text).toContain('cross-tenant denial');
  expect(text).toContain('restart-safe deduplication');
  expect(text).toContain('no email, provider delivery, customer contact, or bid submission');
});

test('How To prerequisite contract cannot drift from the founder snapshot', () => {
  const page = parsedFixture();
  const rendered = [...page.querySelectorAll(
    '#external-prerequisites [data-prerequisite-id]',
  )].map(gate => ({
    id: gate.dataset.prerequisiteId,
    status: gate.dataset.status,
  }));

  expect(rendered).toEqual(contract.blocked_prerequisites);
  expect(rendered).toHaveLength(6);
  expect(contract.onboarding_phases).toEqual([
    { phase: 'synthetic_rehearsal', status: 'PASS' },
    { phase: 'review_and_provider_preflight', status: 'BLOCKED' },
    { phase: 'volunteer_pilot_onboarding', status: 'BLOCKED' },
  ]);
  expect(page.body.textContent).toContain('No customer action is requested');
  expect(page.body.textContent).toContain('authorized live sources');
  expect(page.body.textContent).toContain('no-fabrication evidence');
});

test('acceptance How To contains no unsupported affirmative live claim', () => {
  const text = parsedFixture().body.textContent.replace(/\s+/g, ' ').trim();

  expect(contract.prohibited_claims).toEqual([
    'live subscription',
    'payment collected',
    'payroll calculated',
    'email delivered',
    'customer onboarded',
    'bid submitted',
    'provider verified',
    'production ready',
  ]);
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
  expect(text).not.toMatch(
    /@[a-z0-9.-]+|\b\d{3}[-.)\s]+\d{3}[-.\s]+\d{4}\b/i,
  );
});
