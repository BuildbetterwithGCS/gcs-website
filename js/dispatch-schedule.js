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
      'crew_label', 'location_label', 'starts_at', 'ends_at', 'status',
      'updated_at',
    ];
    const seen = new Set();
    let priorStart = -Infinity;
    let priorRef = '';
    for (const item of value.items) {
      if (!exactKeys(item, fields)
        || typeof item.assignment_ref !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(item.assignment_ref)
        || !Number.isInteger(item.revision) || item.revision < 0
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

  return { validatedDispatchSchedule, renderDispatchSchedule };
});
