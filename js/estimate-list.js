(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.GCSEstimateList = api;
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const ESTIMATE_STATUSES = new Set([
    'draft', 'sent', 'accepted', 'rejected', 'expired',
  ]);
  const STATUS_LABELS = Object.freeze({
    draft: 'Draft',
    sent: 'Sent',
    accepted: 'Accepted',
    rejected: 'Rejected',
    expired: 'Expired',
  });

  function exactKeys(value, keys) {
    return value
      && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
  }

  function safeText(value, maximum) {
    if (typeof value !== 'string' || value.length < 1 || value.length > maximum
      || /[\u0000-\u001f\u007f\u202a-\u202e\u2066-\u2069]/.test(value)) {
      throw new Error('Estimate list is unavailable');
    }
    return value;
  }

  function canonicalTimestamp(value) {
    const parsed = typeof value === 'string' ? Date.parse(value) : NaN;
    if (typeof value !== 'string'
      || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value)
      || !Number.isFinite(parsed)
      || new Date(parsed).toISOString() !== value.replace('Z', '.000Z')) {
      throw new Error('Estimate list is unavailable');
    }
    return value;
  }

  function calendarDate(value) {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      throw new Error('Estimate list is unavailable');
    }
    const parsed = Date.parse(value + 'T00:00:00Z');
    if (!Number.isFinite(parsed)
      || new Date(parsed).toISOString().slice(0, 10) !== value) {
      throw new Error('Estimate list is unavailable');
    }
    return value;
  }

  function validatedEstimateList(value) {
    const listFields = [
      'schema_version', 'checked_at', 'returned', 'truncated', 'next_cursor',
      'items',
    ];
    const hasCursor = typeof value?.next_cursor === 'string'
      && /^[A-Za-z0-9_-]{32,256}$/.test(value.next_cursor);
    if (!exactKeys(value, listFields)
      || value.schema_version !== 'tenant-estimate-list-v1'
      || !Array.isArray(value.items) || value.items.length > 100
      || !Number.isInteger(value.returned)
      || value.returned !== value.items.length
      || typeof value.truncated !== 'boolean'
      || (value.truncated && value.items.length === 0)
      || (value.truncated ? !hasCursor : value.next_cursor !== null)) {
      throw new Error('Estimate list is unavailable');
    }
    const checkedAt = Date.parse(canonicalTimestamp(value.checked_at));
    const checkedDate = value.checked_at.slice(0, 10);
    const itemFields = [
      'estimate_ref', 'revision', 'customer_label', 'title', 'status',
      'amount_cents', 'expires_on', 'sent_at', 'updated_at',
    ];
    const seen = new Set();
    for (const item of value.items) {
      if (!exactKeys(item, itemFields)
        || typeof item.estimate_ref !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(item.estimate_ref)
        || !Number.isInteger(item.revision) || item.revision < 0
        || !ESTIMATE_STATUSES.has(item.status)
        || !Number.isInteger(item.amount_cents)
        || item.amount_cents < 0 || item.amount_cents > 1000000000) {
        throw new Error('Estimate list is unavailable');
      }
      safeText(item.customer_label, 160);
      safeText(item.title, 200);
      const updatedAt = Date.parse(canonicalTimestamp(item.updated_at));
      if (updatedAt > checkedAt) throw new Error('Estimate list is unavailable');
      let sentAt = null;
      if (item.sent_at !== null) sentAt = canonicalTimestamp(item.sent_at);
      let expiresOn = null;
      if (item.expires_on !== null) expiresOn = calendarDate(item.expires_on);
      if ((item.status === 'draft' && sentAt !== null)
        || (item.status !== 'draft' && sentAt === null)
        || (expiresOn !== null && sentAt !== null
          && expiresOn < sentAt.slice(0, 10))
        || (item.status === 'expired'
          && (expiresOn === null || expiresOn > checkedDate))) {
        throw new Error('Estimate list is unavailable');
      }
      const dedupeKey = item.estimate_ref.toLocaleLowerCase();
      if (seen.has(dedupeKey)) throw new Error('Estimate list is unavailable');
      seen.add(dedupeKey);
    }
    return value;
  }

  function estimateListPath(cursor) {
    if (arguments.length === 0 || cursor === null) return '/estimates';
    if (typeof cursor !== 'string'
      || !/^[A-Za-z0-9_-]{32,256}$/.test(cursor)) {
      throw new Error('Estimate list continuation is unavailable');
    }
    return '/estimates?cursor=' + encodeURIComponent(cursor);
  }

  function validatedEstimatePageChain(entries) {
    if (!Array.isArray(entries) || entries.length < 1 || entries.length > 20) {
      throw new Error('Estimate list continuation is unavailable');
    }
    const items = [];
    const seenRefs = new Set();
    const consumedCursors = new Set();
    let expectedCursor = null;
    let checkedAt = null;
    let complete = false;
    for (const entry of entries) {
      if (!exactKeys(entry, ['requested_cursor', 'page'])
        || entry.requested_cursor !== expectedCursor
        || complete) {
        throw new Error('Estimate list continuation is unavailable');
      }
      if (entry.requested_cursor !== null) {
        if (typeof entry.requested_cursor !== 'string'
          || !/^[A-Za-z0-9_-]{32,256}$/.test(entry.requested_cursor)
          || consumedCursors.has(entry.requested_cursor)) {
          throw new Error('Estimate list continuation is unavailable');
        }
        consumedCursors.add(entry.requested_cursor);
      }
      const page = validatedEstimateList(entry.page);
      if (checkedAt === null) checkedAt = page.checked_at;
      if (page.checked_at !== checkedAt) {
        throw new Error('Estimate list continuation is unavailable');
      }
      for (const item of page.items) {
        const key = item.estimate_ref.toLocaleLowerCase();
        if (seenRefs.has(key)) {
          throw new Error('Estimate list continuation is unavailable');
        }
        seenRefs.add(key);
        items.push(item);
      }
      if (page.next_cursor !== null
        && (page.next_cursor === entry.requested_cursor
          || consumedCursors.has(page.next_cursor))) {
        throw new Error('Estimate list continuation is unavailable');
      }
      expectedCursor = page.next_cursor;
      complete = !page.truncated;
    }
    return {
      checked_at: checkedAt,
      items,
      next_cursor: expectedCursor,
      complete,
    };
  }

  function estimateIdempotencyKey(getRandomValues) {
    if (typeof getRandomValues !== 'function') {
      throw new Error('Estimate draft is unavailable');
    }
    const bytes = new Uint8Array(24);
    getRandomValues(bytes);
    return 'estimate-' + Array.from(
      bytes,
      value => value.toString(16).padStart(2, '0'),
    ).join('');
  }

  function estimateDraftRequest(customerLabel, title, scopeSummary, amountCents,
    expiresOn, getRandomValues, now = Date.now()) {
    if (!Number.isFinite(Number(now))
      || !Number.isInteger(amountCents)
      || amountCents < 1 || amountCents > 1000000000) {
      throw new Error('Estimate draft is unavailable');
    }
    try {
      safeText(customerLabel, 160);
      safeText(title, 200);
      safeText(scopeSummary, 2000);
      calendarDate(expiresOn);
    } catch (_error) {
      throw new Error('Estimate draft is unavailable');
    }
    const currentDate = new Date(Number(now)).toISOString().slice(0, 10);
    const lastDate = new Date(Number(now) + (180 * 24 * 60 * 60 * 1000))
      .toISOString().slice(0, 10);
    if (expiresOn < currentDate || expiresOn > lastDate) {
      throw new Error('Estimate draft is unavailable');
    }
    return {
      customer_label: customerLabel,
      title,
      scope_summary: scopeSummary,
      amount_cents: amountCents,
      expires_on: expiresOn,
      idempotency_key: estimateIdempotencyKey(getRandomValues),
    };
  }

  function validatedEstimateDraftResult(value, request, now = Date.now()) {
    const resultFields = [
      'schema_version', 'estimate_ref', 'revision', 'status',
      'customer_label', 'title', 'amount_cents', 'expires_on',
      'created_at', 'updated_at', 'replayed',
    ];
    const requestFields = [
      'customer_label', 'title', 'scope_summary', 'amount_cents',
      'expires_on', 'idempotency_key',
    ];
    if (!exactKeys(value, resultFields)
      || !exactKeys(request, requestFields)
      || value.schema_version !== 'tenant-estimate-draft-v1'
      || typeof value.estimate_ref !== 'string'
      || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(value.estimate_ref)
      || value.revision !== 0
      || value.status !== 'draft'
      || value.customer_label !== request.customer_label
      || value.title !== request.title
      || value.amount_cents !== request.amount_cents
      || value.expires_on !== request.expires_on
      || typeof request.idempotency_key !== 'string'
      || !/^estimate-[a-f0-9]{48}$/.test(request.idempotency_key)
      || typeof value.replayed !== 'boolean'
      || !Number.isFinite(Number(now))) {
      throw new Error('Estimate draft confirmation is unavailable');
    }
    let createdAt;
    let updatedAt;
    try {
      safeText(request.scope_summary, 2000);
      calendarDate(value.expires_on);
      createdAt = Date.parse(canonicalTimestamp(value.created_at));
      updatedAt = Date.parse(canonicalTimestamp(value.updated_at));
    } catch (_error) {
      throw new Error('Estimate draft confirmation is unavailable');
    }
    if (createdAt !== updatedAt || createdAt > Number(now) + (5 * 60 * 1000)) {
      throw new Error('Estimate draft confirmation is unavailable');
    }
    return value;
  }

  function formatAmount(cents) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  }

  function renderEstimateList(doc, value) {
    const list = doc && doc.getElementById('estimate-list');
    if (!list) throw new Error('Estimate list container is unavailable');
    const page = validatedEstimateList(value);
    list.replaceChildren();
    for (const item of page.items) {
      const row = doc.createElement('li');
      const customer = doc.createElement('strong');
      customer.textContent = item.customer_label;
      const title = doc.createElement('span');
      title.textContent = item.title;
      const status = doc.createElement('span');
      status.textContent = STATUS_LABELS[item.status] + ' · '
        + formatAmount(item.amount_cents);
      row.append(customer, title, status);
      list.append(row);
    }
    if (page.truncated) {
      const notice = doc.createElement('li');
      notice.className = 'estimate-list-truncated';
      notice.textContent = 'More permitted estimates are available; this list is incomplete.';
      list.append(notice);
    }
    return page;
  }

  return {
    validatedEstimateList, estimateListPath, validatedEstimatePageChain,
    estimateDraftRequest, validatedEstimateDraftResult, renderEstimateList,
  };
});
