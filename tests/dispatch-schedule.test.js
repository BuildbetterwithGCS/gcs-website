/** @jest-environment jsdom */
const app = require('../js/dispatch-schedule.js');

function validSchedule() {
  return {
    schema_version: 'tenant-dispatch-schedule-v1',
    checked_at: '2026-11-13T03:30:00Z',
    returned: 2,
    truncated: false,
    next_cursor: null,
    items: [
      {
        assignment_ref: 'assignment-one',
        revision: 2,
        job_label: 'Synthetic pool deck restoration',
        work_order_label: 'WO-100 synthetic preparation',
        crew_ref: 'crew-alpha',
        crew_label: 'Synthetic crew alpha',
        location_label: 'Synthetic Orlando-area site',
        starts_at: '2026-11-13T01:00:00Z',
        ends_at: '2026-11-13T02:00:00Z',
        status: 'completed',
        updated_at: '2026-11-13T02:00:00Z',
      },
      {
        assignment_ref: 'assignment-two',
        revision: 0,
        job_label: 'Synthetic concrete repair',
        work_order_label: 'WO-101 synthetic repair',
        crew_ref: 'crew-beta',
        crew_label: 'Synthetic crew beta',
        location_label: 'Synthetic Central Florida site',
        starts_at: '2026-11-13T04:00:00Z',
        ends_at: '2026-11-13T06:00:00Z',
        status: 'scheduled',
        updated_at: '2026-11-13T03:00:00Z',
      },
    ],
  };
}

test('accepts only the exact bounded dispatch schedule contract', () => {
  const schedule = validSchedule();
  expect(app.validatedDispatchSchedule(schedule)).toEqual(schedule);
  const invalid = [
    { ...schedule, tenant_id: 'must-not-reach-browser' },
    { ...schedule, returned: 1 },
    { ...schedule, truncated: 'false' },
    { ...schedule, checked_at: '2026-11-13T03:30:00+00:00' },
    { ...schedule, items: [{ ...schedule.items[0], actor_id: 'private' }] },
    { ...schedule, items: [{ ...schedule.items[0], customer_email: 'private@example.invalid' }] },
    { ...schedule, items: [{ ...schedule.items[0], provider: 'private' }] },
    { ...schedule, items: [{ ...schedule.items[0], status: 'paid' }] },
    { ...schedule, items: [{ ...schedule.items[0], revision: -1 }] },
    { ...schedule, items: [{ ...schedule.items[0], crew_ref: 'bad ref' }] },
    { ...schedule, items: [{ ...schedule.items[0], ends_at: schedule.items[0].starts_at }] },
    { ...schedule, items: [{
      ...schedule.items[0],
      starts_at: '2026-11-11T00:00:00Z',
      ends_at: '2026-11-13T00:00:01Z',
    }] },
    { ...schedule, items: [{ ...schedule.items[0], updated_at: '2026-11-13T03:30:01Z' }] },
    { ...schedule, items: [{
      ...schedule.items[1],
      status: 'completed',
      ends_at: '2026-11-13T06:00:00Z',
    }] },
    { ...schedule, items: [
      schedule.items[0],
      { ...schedule.items[1], assignment_ref: 'ASSIGNMENT-ONE' },
    ] },
    { ...schedule, items: [schedule.items[1], schedule.items[0]] },
  ];
  for (const value of invalid) {
    expect(() => app.validatedDispatchSchedule(value))
      .toThrow('Dispatch schedule is unavailable');
  }
});


test('rejects overlapping non-canceled assignments for the same crew', () => {
  const schedule = validSchedule();
  const overlapping = {
    ...schedule.items[1],
    assignment_ref: 'assignment-overlap',
    crew_ref: 'CREW-ALPHA',
    starts_at: '2026-11-13T01:30:00Z',
    ends_at: '2026-11-13T02:30:00Z',
    status: 'scheduled',
  };
  expect(() => app.validatedDispatchSchedule({
    ...schedule,
    returned: 2,
    items: [schedule.items[0], overlapping],
  })).toThrow('Dispatch schedule is unavailable');

  expect(app.validatedDispatchSchedule({
    ...schedule,
    returned: 2,
    items: [
      schedule.items[0],
      { ...overlapping, crew_ref: 'crew-gamma' },
    ],
  }).returned).toBe(2);

  expect(app.validatedDispatchSchedule({
    ...schedule,
    returned: 2,
    items: [
      schedule.items[0],
      { ...overlapping, status: 'canceled' },
    ],
  }).returned).toBe(2);
});


test('allows an explicit truncated nonempty schedule only', () => {
  const schedule = validSchedule();
  const cursor = 'a'.repeat(32);
  expect(app.validatedDispatchSchedule({
    ...schedule, truncated: true, next_cursor: cursor,
  }).next_cursor).toBe(cursor);
  expect(() => app.validatedDispatchSchedule({
    ...schedule, returned: 0, items: [], truncated: true,
    next_cursor: 'a'.repeat(32),
  })).toThrow('Dispatch schedule is unavailable');
  expect(() => app.validatedDispatchSchedule({
    ...schedule,
    returned: 101,
    items: Array.from({ length: 101 }, (_, index) => ({
      ...schedule.items[1],
      assignment_ref: 'assignment-' + index,
      starts_at: new Date(Date.parse('2026-11-14T00:00:00Z') + index * 3600000)
        .toISOString().replace('.000Z', 'Z'),
      ends_at: new Date(Date.parse('2026-11-14T00:30:00Z') + index * 3600000)
        .toISOString().replace('.000Z', 'Z'),
    })),
  })).toThrow('Dispatch schedule is unavailable');
});



test('dispatch continuation carries only a bounded opaque cursor', () => {
  const cursor = 'c'.repeat(32);
  expect(app.dispatchSchedulePath()).toBe('/dispatch/schedule');
  expect(app.dispatchSchedulePath(null)).toBe('/dispatch/schedule');
  expect(app.dispatchSchedulePath(cursor))
    .toBe('/dispatch/schedule?cursor=' + cursor);
  for (const invalid of [
    undefined,
    '',
    'short',
    'tenant=synthetic-a',
    'crew/synthetic-a',
    'x'.repeat(257),
  ]) {
    expect(() => app.dispatchSchedulePath(invalid))
      .toThrow('Dispatch continuation is unavailable');
  }
  expect(String(app.dispatchSchedulePath)).not.toMatch(
    /tenant|workspace|actor|employee|crew_ref|location|email|phone|provider/i,
  );

  const schedule = validSchedule();
  for (const invalid of [
    { ...schedule, truncated: true, next_cursor: null },
    { ...schedule, truncated: true, next_cursor: 'short' },
    { ...schedule, truncated: true, next_cursor: 'tenant/workspace/crew' },
    { ...schedule, truncated: false, next_cursor: cursor },
  ]) {
    expect(() => app.validatedDispatchSchedule(invalid))
      .toThrow('Dispatch schedule is unavailable');
  }
});


test('builds only allowed optimistic dispatch status transitions', () => {
  const now = Date.parse('2026-11-13T04:40:30Z');
  const request = app.dispatchStatusRequest(
    'assignment-two',
    3,
    'scheduled',
    'en_route',
    bytes => { bytes.fill(0xab); return bytes; },
    now,
  );
  expect(request).toEqual({
    assignment_ref: 'assignment-two',
    expected_revision: 3,
    current_status: 'scheduled',
    next_status: 'en_route',
    occurred_at: '2026-11-13T04:40:30Z',
    idempotency_key: 'dispatch-' + 'ab'.repeat(24),
  });
  for (const key of [
    'tenant_id', 'workspace_id', 'actor_id', 'employee_id', 'location',
    'email', 'phone', 'provider',
  ]) {
    expect(request).not.toHaveProperty(key);
  }

  const allowed = [
    ['scheduled', 'en_route'],
    ['scheduled', 'canceled'],
    ['en_route', 'on_site'],
    ['en_route', 'canceled'],
    ['on_site', 'completed'],
    ['on_site', 'canceled'],
  ];
  for (const [current, next] of allowed) {
    expect(app.dispatchStatusRequest(
      'assignment-two', 3, current, next,
      bytes => { bytes.fill(1); return bytes; }, now,
    ).next_status).toBe(next);
  }
  for (const [current, next] of [
    ['scheduled', 'completed'],
    ['en_route', 'completed'],
    ['on_site', 'en_route'],
    ['completed', 'scheduled'],
    ['canceled', 'scheduled'],
    ['unknown', 'canceled'],
  ]) {
    expect(() => app.dispatchStatusRequest(
      'assignment-two', 3, current, next,
      bytes => { bytes.fill(1); return bytes; }, now,
    )).toThrow('Dispatch update is unavailable');
  }
});

test('accepts only exact request-bound dispatch confirmations', () => {
  const now = Date.parse('2026-11-13T04:40:30Z');
  const request = app.dispatchStatusRequest(
    'assignment-two',
    3,
    'en_route',
    'on_site',
    bytes => { bytes.fill(0xcd); return bytes; },
    now,
  );
  const result = {
    schema_version: 'tenant-dispatch-status-v1',
    assignment_ref: request.assignment_ref,
    previous_revision: request.expected_revision,
    revision: request.expected_revision + 1,
    previous_status: request.current_status,
    status: request.next_status,
    occurred_at: request.occurred_at,
    updated_at: request.occurred_at,
    replayed: false,
  };
  expect(app.validatedDispatchStatusResult(result, request, now))
    .toEqual(result);
  const invalidResults = [
    { ...result, tenant_id: 'must-not-reach-browser' },
    { ...result, actor_id: 'must-not-reach-browser' },
    { ...result, provider: 'must-not-reach-browser' },
    { ...result, assignment_ref: 'different-assignment' },
    { ...result, previous_revision: 2 },
    { ...result, revision: 5 },
    { ...result, previous_status: 'scheduled' },
    { ...result, status: 'completed' },
    { ...result, occurred_at: '2026-11-13T04:40:31Z' },
    { ...result, updated_at: '2026-11-13T04:40:31Z' },
    { ...result, replayed: 'false' },
  ];
  for (const value of invalidResults) {
    expect(() => app.validatedDispatchStatusResult(value, request, now))
      .toThrow('Dispatch update confirmation is unavailable');
  }
  for (const altered of [
    { ...request, tenant_id: 'must-not-be-accepted' },
    { ...request, idempotency_key: 'dispatch-invalid' },
    { ...request, expected_revision: -1 },
    { ...request, current_status: 'scheduled', next_status: 'completed' },
  ]) {
    expect(() => app.validatedDispatchStatusResult(result, altered, now))
      .toThrow('Dispatch update confirmation is unavailable');
  }
});

test('dispatch mutation contract remains unconnected and identity-free', () => {
  const now = Date.parse('2026-11-13T04:40:30Z');
  for (const values of [
    ['bad ref', 1, 'scheduled', 'en_route', bytes => bytes, now],
    ['assignment-two', -1, 'scheduled', 'en_route', bytes => bytes, now],
    ['assignment-two', 1.5, 'scheduled', 'en_route', bytes => bytes, now],
    ['assignment-two', 1, 'scheduled', 'en_route', null, now],
    ['assignment-two', 1, 'scheduled', 'en_route', bytes => bytes, NaN],
  ]) {
    expect(() => app.dispatchStatusRequest(...values))
      .toThrow('Dispatch update is unavailable');
  }
  expect(String(app.dispatchStatusRequest)).not.toMatch(
    /fetch\s*\(|tenant_id|workspace_id|actor_id|employee_id|email|phone|provider|notify/i,
  );
});



test('builds only a future bounded optimistic dispatch reschedule', () => {
  const now = Date.parse('2026-11-13T05:35:00Z');
  const request = app.dispatchRescheduleRequest(
    'assignment-two',
    4,
    '2026-11-13T06:00:00Z',
    '2026-11-13T14:00:00Z',
    bytes => { bytes.fill(0xef); return bytes; },
    now,
  );
  expect(request).toEqual({
    assignment_ref: 'assignment-two',
    expected_revision: 4,
    starts_at: '2026-11-13T06:00:00Z',
    ends_at: '2026-11-13T14:00:00Z',
    requested_at: '2026-11-13T05:35:00Z',
    idempotency_key: 'dispatch-' + 'ef'.repeat(24),
  });
  for (const key of [
    'tenant_id', 'workspace_id', 'actor_id', 'employee_id', 'crew_ref',
    'location', 'email', 'phone', 'provider', 'notify',
  ]) {
    expect(request).not.toHaveProperty(key);
  }
  for (const values of [
    ['bad ref', 4, '2026-11-13T06:00:00Z', '2026-11-13T14:00:00Z'],
    ['assignment-two', -1, '2026-11-13T06:00:00Z', '2026-11-13T14:00:00Z'],
    ['assignment-two', 4, '2026-11-13T05:34:59Z', '2026-11-13T14:00:00Z'],
    ['assignment-two', 4, '2026-11-13T14:00:00Z', '2026-11-13T14:00:00Z'],
    ['assignment-two', 4, '2026-11-13T06:00:00Z', '2026-11-14T06:00:01Z'],
    ['assignment-two', 4, '2027-06-01T06:00:00Z', '2027-06-01T07:00:00Z'],
  ]) {
    expect(() => app.dispatchRescheduleRequest(
      ...values,
      bytes => { bytes.fill(1); return bytes; },
      now,
    )).toThrow('Dispatch reschedule is unavailable');
  }
  expect(() => app.dispatchRescheduleRequest(
    'assignment-two', 4, '2026-11-13T06:00:00Z',
    '2026-11-13T14:00:00Z', null, now,
  )).toThrow('Dispatch reschedule is unavailable');
});

test('accepts only exact request-bound dispatch reschedule confirmations', () => {
  const now = Date.parse('2026-11-13T05:35:00Z');
  const request = app.dispatchRescheduleRequest(
    'assignment-two',
    4,
    '2026-11-13T06:00:00Z',
    '2026-11-13T14:00:00Z',
    bytes => { bytes.fill(2); return bytes; },
    now,
  );
  const result = {
    schema_version: 'tenant-dispatch-reschedule-v1',
    assignment_ref: request.assignment_ref,
    previous_revision: request.expected_revision,
    revision: request.expected_revision + 1,
    status: 'scheduled',
    starts_at: request.starts_at,
    ends_at: request.ends_at,
    updated_at: request.requested_at,
    replayed: false,
  };
  expect(app.validatedDispatchRescheduleResult(result, request, now))
    .toEqual(result);
  const invalidResults = [
    { ...result, tenant_id: 'must-not-reach-browser' },
    { ...result, actor_id: 'must-not-reach-browser' },
    { ...result, provider: 'must-not-reach-browser' },
    { ...result, assignment_ref: 'different-assignment' },
    { ...result, previous_revision: 3 },
    { ...result, revision: 6 },
    { ...result, status: 'en_route' },
    { ...result, starts_at: '2026-11-13T06:00:01Z' },
    { ...result, ends_at: '2026-11-13T14:00:01Z' },
    { ...result, updated_at: '2026-11-13T05:35:01Z' },
    { ...result, replayed: 'false' },
  ];
  for (const value of invalidResults) {
    expect(() => app.validatedDispatchRescheduleResult(value, request, now))
      .toThrow('Dispatch reschedule confirmation is unavailable');
  }
  for (const altered of [
    { ...request, tenant_id: 'must-not-be-accepted' },
    { ...request, idempotency_key: 'dispatch-invalid' },
    { ...request, expected_revision: -1 },
  ]) {
    expect(() => app.validatedDispatchRescheduleResult(result, altered, now))
      .toThrow('Dispatch reschedule confirmation is unavailable');
  }
  expect(String(app.dispatchRescheduleRequest)).not.toMatch(
    /fetch\s*\(|tenant_id|workspace_id|actor_id|employee_id|crew_ref|location|email|phone|provider|notify/i,
  );
});


test('renders permitted schedule text without internal references', () => {
  const schedule = validSchedule();
  schedule.items[0] = {
    ...schedule.items[0],
    job_label: '<img src=x onerror=alert(1)>',
    work_order_label: '<script>alert(1)</script>',
    location_label: '<svg onload=alert(1)>',
  };
  schedule.truncated = true;
  schedule.next_cursor = 'b'.repeat(32);
  document.body.innerHTML = '<ul id="dispatch-schedule"></ul>';
  expect(app.renderDispatchSchedule(document, schedule)).toEqual(schedule);
  expect(document.querySelector('img')).toBeNull();
  expect(document.querySelector('script')).toBeNull();
  expect(document.querySelector('svg')).toBeNull();
  expect(document.body.textContent).toContain('<img src=x onerror=alert(1)>');
  expect(document.body.textContent).toContain('Synthetic crew alpha');
  expect(document.body.textContent).toContain('Completed');
  expect(document.body.textContent).toContain('schedule is incomplete');
  expect(document.body.textContent).not.toContain('assignment-one');
  expect(document.body.textContent).not.toContain('crew-alpha');
  expect(document.body.textContent).not.toContain('revision');
});

test('schedule contract remains disconnected from identity and provider coordinates', () => {
  expect(String(app.validatedDispatchSchedule)).not.toMatch(
    /fetch|request|tenant_id|workspace_id|actor_id|email|phone|provider/i,
  );
  expect(String(app.renderDispatchSchedule)).not.toMatch(
    /innerHTML|fetch|request|email|phone|provider/i,
  );
  document.body.innerHTML = '';
  expect(() => app.renderDispatchSchedule(document, validSchedule()))
    .toThrow('Dispatch schedule container is unavailable');
});
