/** @jest-environment jsdom */
const app = require('../js/business-app.js');

function fixture() {
  return {
    schema_version: 'assistant-synthetic-review-preview-v1',
    classification: 'TEST_DATA_NOT_DELIVERABLE',
    checked_at: '2026-11-19T11:00:00+00:00',
    preference_revision: 1,
    returned: 1,
    truncated: false,
    items: [{
      topic: 'follow_ups',
      title: 'Review MATERIAL cost for WO-TEST-1: $485.00 (SUBMITTED)',
      action_label: 'Review contractor cost',
      deadline_at: null,
      evidence: {
        freshness_status: 'CURRENT',
        observed_at: '2026-11-19T10:00:00+00:00',
        source_updated_at: '2026-11-19T10:00:00+00:00',
        is_synthetic: true,
        source_url: null,
        location_known: null,
        within_radius: null,
      },
    }],
  };
}

test('accepts only the exact labeled synthetic review schema', () => {
  const value = fixture();
  expect(app.validatedAssistantSyntheticReviewPreview(value)).toBe(value);

  const invalid = [
    { ...value, classification: 'DELIVERABLE' },
    { ...value, schema_version: 'assistant-digest-preview-v1' },
    { ...value, tenant_id: 'must-not-reach-browser' },
    { ...value, provider: 'mail-provider' },
    { ...value, recipient: 'private@example.invalid' },
    { ...value, returned: 2 },
    { ...value, truncated: 'false' },
    { ...value, checked_at: 'not-a-time' },
    {
      ...value,
      items: [{
        ...value.items[0],
        record_id: 'private-record',
      }],
    },
    {
      ...value,
      items: [{
        ...value.items[0],
        evidence: {
          ...value.items[0].evidence,
          is_synthetic: false,
        },
      }],
    },
    {
      ...value,
      items: [{
        ...value.items[0],
        evidence: {
          ...value.items[0].evidence,
          freshness_status: 'VERIFIED_LIVE',
        },
      }],
    },
  ];
  for (const candidate of invalid) {
    expect(() => app.validatedAssistantSyntheticReviewPreview(candidate))
      .toThrow('unavailable');
  }
});

test('synthetic preview enforces evidence order, uniqueness, and bid proof', () => {
  const value = fixture();
  const item = value.items[0];
  for (const changed of [
    {
      ...item,
      evidence: {
        ...item.evidence,
        source_updated_at: '2026-11-19T10:00:01+00:00',
      },
    },
    {
      ...item,
      evidence: {
        ...item.evidence,
        observed_at: '2026-11-19T11:05:01+00:00',
        source_updated_at: '2026-11-19T11:05:01+00:00',
      },
    },
    {
      ...item,
      topic: 'bid_opportunities',
      evidence: {
        ...item.evidence,
        source_url: null,
        location_known: false,
        within_radius: false,
      },
    },
  ]) {
    expect(() => app.validatedAssistantSyntheticReviewPreview({
      ...value, items: [changed],
    })).toThrow('Assistant test preview evidence');
  }

  expect(() => app.validatedAssistantSyntheticReviewPreview({
    ...value,
    returned: 2,
    items: [item, { ...item }],
  })).toThrow('Assistant test preview item');
});

test('renders into a caller-supplied detached container with text nodes only', () => {
  const value = fixture();
  value.items[0].title = '<img src=x onerror=alert(1)> Synthetic cost';
  value.items[0].action_label = '<script>bad()</script>';
  const container = document.createElement('ul');

  expect(app.renderAssistantSyntheticReviewPreview(
    document, value, container,
  )).toBe(value);
  expect(container.children).toHaveLength(2);
  expect(container.children[0].textContent)
    .toBe('TEST DATA — NOT DELIVERABLE');
  expect(container.textContent).toContain(
    '<img src=x onerror=alert(1)> Synthetic cost');
  expect(container.textContent).toContain('<script>bad()</script>');
  expect(container.querySelector('img')).toBeNull();
  expect(container.querySelector('script')).toBeNull();
  expect(container.innerHTML).not.toContain('<img src=x');
  expect(container.innerHTML).not.toContain('<script>bad()');
});

test('synthetic preview client is inactive and contains no request path', () => {
  expect(String(app.validatedAssistantSyntheticReviewPreview)).not.toMatch(
    /fetch\s*\(|XMLHttpRequest|test-review-preview|recipient|email_address|provider|send\s*\(/i,
  );
  expect(String(app.renderAssistantSyntheticReviewPreview)).not.toMatch(
    /fetch\s*\(|XMLHttpRequest|test-review-preview|recipient|email_address|provider|send\s*\(/i,
  );
  expect(() => app.renderAssistantSyntheticReviewPreview(
    document, fixture(), null,
  )).toThrow('container');
});
