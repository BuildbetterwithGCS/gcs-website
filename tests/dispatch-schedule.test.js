/** @jest-environment jsdom */
const app = require('../js/dispatch-schedule.js');

function validSchedule() {
  return {
    schema_version: 'tenant-dispatch-schedule-v1',
    checked_at: '2026-11-13T03:30:00Z',
    returned: 2,
    truncated: false,
    items: [
      {
        assignment_ref: 'assignment-one',
        revision: 2,
        job_label: 'Synthetic pool deck restoration',
        work_order_label: 'WO-100 synthetic preparation',
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

test('allows an explicit truncated nonempty schedule only', () => {
  const schedule = validSchedule();
  expect(app.validatedDispatchSchedule({
    ...schedule, truncated: true,
  }).truncated).toBe(true);
  expect(() => app.validatedDispatchSchedule({
    ...schedule, returned: 0, items: [], truncated: true,
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

test('renders permitted schedule text without internal references', () => {
  const schedule = validSchedule();
  schedule.items[0] = {
    ...schedule.items[0],
    job_label: '<img src=x onerror=alert(1)>',
    work_order_label: '<script>alert(1)</script>',
    location_label: '<svg onload=alert(1)>',
  };
  schedule.truncated = true;
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
