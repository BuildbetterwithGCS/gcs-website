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
      'schema_version', 'checked_at', 'returned', 'truncated', 'items',
    ];
    if (!exactKeys(value, listFields)
      || value.schema_version !== 'tenant-estimate-list-v1'
      || !Array.isArray(value.items) || value.items.length > 100
      || !Number.isInteger(value.returned)
      || value.returned !== value.items.length
      || typeof value.truncated !== 'boolean') {
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

  return { validatedEstimateList, renderEstimateList };
});
