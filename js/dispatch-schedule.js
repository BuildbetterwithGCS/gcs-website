(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GCSDispatchSchedule = api;
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const STATUSES = new Set([
    'scheduled', 'en_route', 'on_site', 'completed', 'canceled',
  ]);
  const STATUS_LABELS = Object.freeze({
    scheduled: 'Scheduled',
    en_route: 'En route',
    on_site: 'On site',
    completed: 'Completed',
    canceled: 'Canceled',
  });

  function exactKeys(value, keys) {
    return value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
  }

  function safeText(value, maximum) {
    if (typeof value !== 'string' || value.length < 1 || value.length > maximum
      || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value)) {
      throw new Error('Dispatch schedule is unavailable');
    }
    return value;
  }

  function timestamp(value) {
    const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
    if (typeof value !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
      || !Number.isFinite(parsed)
      || new Date(parsed).toISOString() !== value.replace('Z', '.000Z')) {
      throw new Error('Dispatch schedule is unavailable');
    }
    return parsed;
  }

  function validatedDispatchSchedule(value) {
    const pageFields = [
      'schema_version', 'checked_at', 'returned', 'truncated', 'items',
    ];
    if (!exactKeys(value, pageFields)
      || value.schema_version !== 'tenant-dispatch-schedule-v1'
      || !Array.isArray(value.items) || value.items.length > 100
      || !Number.isInteger(value.returned)
      || value.returned !== value.items.length
      || typeof value.truncated !== 'boolean'
      || (value.truncated && value.items.length === 0)) {
      throw new Error('Dispatch schedule is unavailable');
    }
    const checkedAt = timestamp(value.checked_at);
    const fields = [
      'assignment_ref', 'revision', 'job_label', 'work_order_label',
      'crew_ref', 'crew_label', 'location_label', 'starts_at', 'ends_at', 'status',
      'updated_at',
    ];
    const seen = new Set();
    const crewEnds = new Map();
    let priorStart = -Infinity;
    let priorRef = '';
    for (const item of value.items) {
      if (!exactKeys(item, fields)
        || typeof item.assignment_ref !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(item.assignment_ref)
        || !Number.isInteger(item.revision) || item.revision < 0
        || typeof item.crew_ref !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(item.crew_ref)
        || !STATUSES.has(item.status)) {
        throw new Error('Dispatch schedule is unavailable');
      }
      safeText(item.job_label, 200);
      safeText(item.work_order_label, 200);
      safeText(item.crew_label, 120);
      safeText(item.location_label, 200);
      const startsAt = timestamp(item.starts_at);
      const endsAt = timestamp(item.ends_at);
      const updatedAt = timestamp(item.updated_at);
      if (startsAt >= endsAt
        || endsAt - startsAt > 24 * 60 * 60 * 1000
        || updatedAt > checkedAt
        || (item.status === 'completed' && endsAt > checkedAt)) {
        throw new Error('Dispatch schedule is unavailable');
      }
      const refKey = item.assignment_ref.toLocaleLowerCase();
      if (seen.has(refKey)) throw new Error('Dispatch schedule is unavailable');
      seen.add(refKey);
      if (startsAt < priorStart
        || (startsAt === priorStart
          && item.assignment_ref.localeCompare(priorRef) <= 0)) {
        throw new Error('Dispatch schedule is unavailable');
      }
      priorStart = startsAt;
      priorRef = item.assignment_ref;
      if (item.status !== 'canceled') {
        const crewKey = item.crew_ref.toLocaleLowerCase();
        const priorEnd = crewEnds.get(crewKey);
        if (priorEnd !== undefined && startsAt < priorEnd) {
          throw new Error('Dispatch schedule is unavailable');
        }
        crewEnds.set(crewKey, endsAt);
      }
    }
    return value;
  }

  const TRANSITIONS = Object.freeze({
    scheduled: new Set(['en_route', 'canceled']),
    en_route: new Set(['on_site', 'canceled']),
    on_site: new Set(['completed', 'canceled']),
  });

  function dispatchIdempotencyKey(getRandomValues) {
    if (typeof getRandomValues !== 'function') {
      throw new Error('Dispatch update is unavailable');
    }
    const bytes = new Uint8Array(24);
    getRandomValues(bytes);
    return 'dispatch-' + Array.from(
      bytes,
      value => value.toString(16).padStart(2, '0'),
    ).join('');
  }

  function dispatchStatusRequest(assignmentRef, expectedRevision,
    currentStatus, nextStatus, getRandomValues, now = Date.now()) {
    if (typeof assignmentRef !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(assignmentRef)
      || !Number.isInteger(expectedRevision) || expectedRevision < 0
      || !TRANSITIONS[currentStatus]
      || !TRANSITIONS[currentStatus].has(nextStatus)
      || !Number.isFinite(Number(now))) {
      throw new Error('Dispatch update is unavailable');
    }
    let idempotencyKey;
    try {
      idempotencyKey = dispatchIdempotencyKey(getRandomValues);
    } catch (_error) {
      throw new Error('Dispatch update is unavailable');
    }
    const occurredAt = new Date(Math.floor(Number(now) / 1000) * 1000)
      .toISOString().replace('.000Z', 'Z');
    return {
      assignment_ref: assignmentRef,
      expected_revision: expectedRevision,
      current_status: currentStatus,
      next_status: nextStatus,
      occurred_at: occurredAt,
      idempotency_key: idempotencyKey,
    };
  }

  function validatedDispatchStatusResult(value, request, now = Date.now()) {
    const resultFields = [
      'schema_version', 'assignment_ref', 'previous_revision', 'revision',
      'previous_status', 'status', 'occurred_at', 'updated_at', 'replayed',
    ];
    const requestFields = [
      'assignment_ref', 'expected_revision', 'current_status', 'next_status',
      'occurred_at', 'idempotency_key',
    ];
    if (!exactKeys(value, resultFields)
      || !exactKeys(request, requestFields)
      || value.schema_version !== 'tenant-dispatch-status-v1'
      || typeof request.assignment_ref !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(request.assignment_ref)
      || value.assignment_ref !== request.assignment_ref
      || !Number.isInteger(request.expected_revision)
      || request.expected_revision < 0
      || value.previous_revision !== request.expected_revision
      || value.revision !== request.expected_revision + 1
      || !TRANSITIONS[request.current_status]
      || !TRANSITIONS[request.current_status].has(request.next_status)
      || value.previous_status !== request.current_status
      || value.status !== request.next_status
      || value.occurred_at !== request.occurred_at
      || value.updated_at !== request.occurred_at
      || typeof request.idempotency_key !== 'string'
      || !/^dispatch-[a-f0-9]{48}$/.test(request.idempotency_key)
      || typeof value.replayed !== 'boolean'
      || !Number.isFinite(Number(now))) {
      throw new Error('Dispatch update confirmation is unavailable');
    }
    let occurredAt;
    try {
      occurredAt = timestamp(value.occurred_at);
    } catch (_error) {
      throw new Error('Dispatch update confirmation is unavailable');
    }
    if (occurredAt > Number(now) + 5 * 60 * 1000) {
      throw new Error('Dispatch update confirmation is unavailable');
    }
    return value;
  }

  function dispatchRescheduleRequest(assignmentRef, expectedRevision,
    startsAtValue, endsAtValue, getRandomValues, now = Date.now()) {
    if (typeof assignmentRef !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(assignmentRef)
      || !Number.isInteger(expectedRevision) || expectedRevision < 0
      || !Number.isFinite(Number(now))) {
      throw new Error('Dispatch reschedule is unavailable');
    }
    let startsAt;
    let endsAt;
    try {
      startsAt = timestamp(startsAtValue);
      endsAt = timestamp(endsAtValue);
    } catch (_error) {
      throw new Error('Dispatch reschedule is unavailable');
    }
    if (startsAt < Number(now)
      || startsAt >= endsAt
      || endsAt - startsAt > 24 * 60 * 60 * 1000
      || endsAt > Number(now) + 180 * 24 * 60 * 60 * 1000) {
      throw new Error('Dispatch reschedule is unavailable');
    }
    let idempotencyKey;
    try {
      idempotencyKey = dispatchIdempotencyKey(getRandomValues);
    } catch (_error) {
      throw new Error('Dispatch reschedule is unavailable');
    }
    const requestedAt = new Date(Math.floor(Number(now) / 1000) * 1000)
      .toISOString().replace('.000Z', 'Z');
    return {
      assignment_ref: assignmentRef,
      expected_revision: expectedRevision,
      starts_at: startsAtValue,
      ends_at: endsAtValue,
      requested_at: requestedAt,
      idempotency_key: idempotencyKey,
    };
  }

  function validatedDispatchRescheduleResult(value, request, now = Date.now()) {
    const resultFields = [
      'schema_version', 'assignment_ref', 'previous_revision', 'revision',
      'status', 'starts_at', 'ends_at', 'updated_at', 'replayed',
    ];
    const requestFields = [
      'assignment_ref', 'expected_revision', 'starts_at', 'ends_at',
      'requested_at', 'idempotency_key',
    ];
    if (!exactKeys(value, resultFields)
      || !exactKeys(request, requestFields)
      || value.schema_version !== 'tenant-dispatch-reschedule-v1'
      || typeof request.assignment_ref !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(request.assignment_ref)
      || value.assignment_ref !== request.assignment_ref
      || !Number.isInteger(request.expected_revision)
      || request.expected_revision < 0
      || value.previous_revision !== request.expected_revision
      || value.revision !== request.expected_revision + 1
      || value.status !== 'scheduled'
      || value.starts_at !== request.starts_at
      || value.ends_at !== request.ends_at
      || value.updated_at !== request.requested_at
      || typeof request.idempotency_key !== 'string'
      || !/^dispatch-[a-f0-9]{48}$/.test(request.idempotency_key)
      || typeof value.replayed !== 'boolean'
      || !Number.isFinite(Number(now))) {
      throw new Error('Dispatch reschedule confirmation is unavailable');
    }
    let startsAt;
    let endsAt;
    let updatedAt;
    try {
      startsAt = timestamp(value.starts_at);
      endsAt = timestamp(value.ends_at);
      updatedAt = timestamp(value.updated_at);
    } catch (_error) {
      throw new Error('Dispatch reschedule confirmation is unavailable');
    }
    if (startsAt < updatedAt
      || startsAt >= endsAt
      || endsAt - startsAt > 24 * 60 * 60 * 1000
      || endsAt > updatedAt + 180 * 24 * 60 * 60 * 1000
      || updatedAt > Number(now) + 5 * 60 * 1000) {
      throw new Error('Dispatch reschedule confirmation is unavailable');
    }
    return value;
  }

  function renderDispatchSchedule(doc, value) {
    const list = doc && doc.getElementById('dispatch-schedule');
    if (!list) throw new Error('Dispatch schedule container is unavailable');
    const page = validatedDispatchSchedule(value);
    list.replaceChildren();
    for (const item of page.items) {
      const row = doc.createElement('li');
      const job = doc.createElement('strong');
      job.textContent = item.job_label;
      const workOrder = doc.createElement('span');
      workOrder.textContent = item.work_order_label;
      const crew = doc.createElement('span');
      crew.textContent = item.crew_label;
      const location = doc.createElement('span');
      location.textContent = item.location_label;
      const status = doc.createElement('span');
      status.textContent = STATUS_LABELS[item.status];
      const time = doc.createElement('time');
      time.dateTime = item.starts_at;
      time.textContent = item.starts_at;
      row.append(job, workOrder, crew, location, status, time);
      list.append(row);
    }
    if (page.truncated) {
      const notice = doc.createElement('li');
      notice.className = 'dispatch-schedule-truncated';
      notice.textContent = 'More permitted assignments are available; this schedule is incomplete.';
      list.append(notice);
    }
    return page;
  }

  return {
    validatedDispatchSchedule, dispatchStatusRequest,
    validatedDispatchStatusResult, dispatchRescheduleRequest,
    validatedDispatchRescheduleResult, renderDispatchSchedule,
  };
});
