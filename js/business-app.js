(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  } else {
    root.GCSBusinessApp = api;
    api.init(root.document);
  }
})(typeof window !== 'undefined' ? window : globalThis, function () {
  'use strict';

  const API = '/api/nexus';
  const INTENT_KEY = 'nexus.checkout.intent';
  const IDEMPOTENCY_KEY = 'nexus.checkout.idempotency';
  const XLSX_CONTENT_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  const MAX_WORKBOOK_BYTES = 5 * 1024 * 1024;
  const MAX_PROVIDER_SESSION_MS = 24 * 60 * 60 * 1000;
  const PREVIEW_RECEIPT_HEADER = 'X-Nexus-Preview-Receipt';
  const ASSISTANT_FREQUENCIES = new Set(['paused', 'daily', 'weekly']);
  const ASSISTANT_TOPICS = new Set([
    'assigned_work', 'work_orders', 'leave_actions', 'invoice_status',
    'leads', 'follow_ups', 'bid_opportunities',
  ]);

  function csrfToken(cookie) {
    const prefix = '__Host-nexus-csrf=';
    return String(cookie || '').split(';').map(value => value.trim())
      .find(value => value.startsWith(prefix))?.slice(prefix.length) || '';
  }

  async function request(path, options = {}) {
    const method = options.method || 'GET';
    const headers = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';
    if (method !== 'GET') headers['X-CSRF-Token'] = csrfToken(document.cookie);
    const response = await fetch(API + path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      mode: 'same-origin',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
    let payload = {};
    try { payload = await response.json(); } catch (_error) {}
    if (!response.ok) {
      const error = new Error(payload.error || 'workspace_unavailable');
      error.status = response.status;
      throw error;
    }
    return payload.data;
  }

  function validateAssetWorkbook(file) {
    if (!file || file.type !== XLSX_CONTENT_TYPE) {
      throw new Error('Choose an Excel .xlsx spreadsheet');
    }
    if (!Number.isInteger(file.size) || file.size < 1
      || file.size > MAX_WORKBOOK_BYTES) {
      throw new Error('Spreadsheet must be between 1 byte and 5 MB');
    }
    return file;
  }

  async function assetRequest(path, options = {}) {
    const method = options.method || 'GET';
    const headers = {
      Accept: options.download ? 'application/octet-stream' : 'application/json',
    };
    let body;
    if (options.file !== undefined) {
      body = validateAssetWorkbook(options.file);
      headers['Content-Type'] = XLSX_CONTENT_TYPE;
    }
    if (options.receipt !== undefined) {
      if (!/^xpr_[A-Za-z0-9_-]{32}$/.test(options.receipt)) {
        throw new Error('Spreadsheet check has expired');
      }
      headers[PREVIEW_RECEIPT_HEADER] = options.receipt;
    }
    if (method !== 'GET') {
      headers['X-CSRF-Token'] = csrfToken(document.cookie);
    }
    const response = await fetch(API + path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      mode: 'same-origin',
      redirect: 'error',
      referrerPolicy: 'no-referrer',
      headers,
      body,
    });
    if (!response.ok) {
      let payload = {};
      try { payload = await response.json(); } catch (_error) {}
      const error = new Error(payload.error || 'workspace_unavailable');
      error.status = response.status;
      throw error;
    }
    if (options.download) {
      return {
        blob: await response.blob(),
        truncated: response.headers.get('X-Nexus-Errors-Truncated') === 'true',
      };
    }
    const payload = await response.json();
    return payload.data;
  }

  function saveDownload(doc, blob, filename) {
    const view = doc && doc.defaultView;
    if (!view || !view.URL || typeof view.URL.createObjectURL !== 'function') {
      throw new Error('Secure download is not supported in this browser');
    }
    const url = view.URL.createObjectURL(blob);
    try {
      const link = doc.createElement('a');
      link.href = url;
      link.download = filename;
      link.rel = 'noopener';
      link.click();
    } finally {
      view.URL.revokeObjectURL(url);
    }
  }

  function clearAssetPreview(doc, options = {}) {
    const input = doc.getElementById('asset-workbook');
    const preview = doc.getElementById('asset-preview');
    const summary = doc.getElementById('asset-preview-summary');
    const errors = doc.getElementById('asset-errors');
    const download = doc.getElementById('asset-error-download');
    const commit = doc.getElementById('asset-commit');
    const confirmation = doc.getElementById('asset-confirm');
    const importButton = doc.getElementById('asset-import');
    if (commit) commit.hidden = true;
    if (confirmation) confirmation.checked = false;
    if (importButton) importButton.disabled = true;
    if (options.clearFile !== false) input.value = '';
    preview.hidden = true;
    summary.textContent = '';
    errors.replaceChildren();
    download.hidden = true;
    if (options.focus === true) input.focus();
  }

  function assetFailureMessage(error) {
    if (error && (error.status === 401 || error.status === 403)) {
      return 'Your spreadsheet check expired or your access changed. Choose the file again.';
    }
    const message = error && typeof error.message === 'string' ? error.message : '';
    if (message.startsWith('Choose') || message.startsWith('Spreadsheet')) {
      return message;
    }
    return 'This spreadsheet task is not available yet. Try again later.';
  }

  function canCommitAssetPreview(preview) {
    return Boolean(preview)
      && Number.isInteger(preview.error_count)
      && preview.error_count === 0
      && Number.isInteger(preview.accepted_rows)
      && preview.accepted_rows > 0
      && typeof preview.receipt_id === 'string'
      && /^xpr_[a-f0-9]{32}$/.test(preview.receipt_id);
  }

  function dashboardSummaryValues(dashboard) {
    const assetTotal = dashboard && dashboard.assets
      && Number.isInteger(dashboard.assets.total_assets)
      && dashboard.assets.total_assets >= 0
      ? dashboard.assets.total_assets
      : null;
    return [
      dashboard && dashboard.open_work,
      dashboard && dashboard.completed_work,
      dashboard && dashboard.pending_leave,
      dashboard && dashboard.unapproved_punches,
      assetTotal,
    ];
  }


  function clearDashboardSummary(root) {
    root.querySelectorAll('#dashboard strong').forEach((node) => {
      node.textContent = '—';
    });
  }


  function validatedAccessStatus(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)
      || Object.keys(value).length !== 1
      || !Object.prototype.hasOwnProperty.call(value, 'access')
      || !['manager', 'employee', 'viewer'].includes(value.access)) {
      throw new Error('Workspace access is unavailable');
    }
    return value.access;
  }

  function renderAccessStatus(root, value) {
    const access = validatedAccessStatus(value);
    const labels = {
      manager: 'Manager access verified.',
      employee: 'Employee access verified.',
      viewer: 'View-only access verified.',
    };
    root.getElementById('access-status').textContent = labels[access];
  }

  function clearAccessStatus(root) {
    root.getElementById('access-status').textContent = 'Access not verified.';
  }


  function validatedAssetInventory(inventory) {
    if (!inventory || typeof inventory !== 'object' || Array.isArray(inventory)) {
      throw new Error('Asset list is unavailable');
    }
    const topFields = new Set(['schema_version', 'items', 'returned', 'truncated']);
    if (Object.keys(inventory).some(key => !topFields.has(key))
      || typeof inventory.schema_version !== 'string'
      || inventory.schema_version.length < 1
      || inventory.schema_version.length > 40
      || !Array.isArray(inventory.items)
      || inventory.items.length > 100
      || !Number.isInteger(inventory.returned)
      || inventory.returned !== inventory.items.length
      || typeof inventory.truncated !== 'boolean') {
      throw new Error('Asset list is unavailable');
    }
    const itemFields = new Set([
      'asset_id', 'asset_name', 'site_id', 'status', 'source', 'committed_at',
    ]);
    const allowedStatuses = new Set(['active', 'inactive', 'maintenance']);
    const items = inventory.items.map(item => {
      if (!item || typeof item !== 'object' || Array.isArray(item)
        || Object.keys(item).some(key => !itemFields.has(key))
        || typeof item.asset_id !== 'string' || !item.asset_id
        || item.asset_id.length > 200
        || typeof item.asset_name !== 'string' || !item.asset_name
        || item.asset_name.length > 200
        || typeof item.site_id !== 'string' || item.site_id.length > 200
        || !allowedStatuses.has(item.status)
        || item.source !== 'xlsx-import'
        || typeof item.committed_at !== 'string'
        || !Number.isFinite(Date.parse(item.committed_at))) {
        throw new Error('Asset list is unavailable');
      }
      return {
        asset_id: item.asset_id,
        asset_name: item.asset_name,
        site_id: item.site_id,
        status: item.status,
      };
    });
    return { items, returned: inventory.returned, truncated: inventory.truncated };
  }

  function filterAssetItems(items, query = '', status = 'all') {
    if (!Array.isArray(items) || items.length > 100
      || typeof query !== 'string'
      || !['all', 'active', 'inactive', 'maintenance'].includes(status)) {
      throw new Error('Asset filters are unavailable');
    }
    const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
    return items.filter(item => {
      if (status !== 'all' && item.status !== status) return false;
      const haystack = [
        item.asset_name, item.asset_id, item.site_id, item.status,
      ].join(' ').toLocaleLowerCase();
      return terms.every(term => haystack.includes(term));
    });
  }

  function clearAssetFilters(search, status, clearButton, apply) {
    if (!search || !status || !clearButton || typeof apply !== 'function') {
      throw new Error('Asset filters are unavailable');
    }
    search.value = '';
    status.value = 'all';
    clearButton.disabled = true;
    apply();
    search.focus();
  }

  function validatedPendingLeaveQueue(queue) {
    const exactKeys = (value, keys) => value
      && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
    if (!exactKeys(queue, ['items', 'returned', 'truncated'])
      || !Array.isArray(queue.items)
      || queue.items.length > 100
      || !Number.isInteger(queue.returned)
      || queue.returned !== queue.items.length
      || typeof queue.truncated !== 'boolean') {
      throw new Error('Pending time-off requests are unavailable');
    }
    const items = queue.items.map(item => {
      if (!exactKeys(item, ['request_id', 'employee_id', 'kind', 'date'])
        || typeof item.request_id !== 'string'
        || item.request_id.length < 1 || item.request_id.length > 128
        || typeof item.employee_id !== 'string'
        || item.employee_id.length < 1 || item.employee_id.length > 128
        || !['pto', 'sick', 'unpaid'].includes(item.kind)
        || typeof item.date !== 'string'
        || !/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        throw new Error('Pending time-off requests are unavailable');
      }
      return {
        request_id: item.request_id,
        employee_id: item.employee_id,
        kind: item.kind,
        date: item.date,
      };
    });
    return { items, returned: queue.returned, truncated: queue.truncated };
  }

  function renderPendingLeaveQueue(doc, queue, onReview) {
    if (typeof onReview !== 'function') {
      throw new Error('Pending time-off requests are unavailable');
    }
    const value = validatedPendingLeaveQueue(queue);
    const list = doc.getElementById('leave-review-list');
    const labels = { pto: 'PTO', sick: 'Sick', unpaid: 'Unpaid' };
    list.replaceChildren();
    for (const item of value.items) {
      const row = doc.createElement('li');
      row.className = 'leave-review-item';
      const employee = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = 'Employee ' + item.employee_id;
      employee.appendChild(strong);
      const details = doc.createElement('p');
      details.textContent = labels[item.kind] + ' · ' + item.date;
      const actions = doc.createElement('div');
      actions.className = 'leave-review-actions';
      for (const decision of [
        { label: 'Approve', approve: true, className: '' },
        { label: 'Deny', approve: false, className: 'deny' },
      ]) {
        const button = doc.createElement('button');
        button.type = 'button';
        button.className = decision.className;
        button.textContent = decision.label;
        button.setAttribute(
          'aria-label',
          decision.label + ' ' + labels[item.kind] + ' for employee '
            + item.employee_id + ' on ' + item.date,
        );
        button.addEventListener('click', () =>
          onReview(item.request_id, decision.approve));
        actions.appendChild(button);
      }
      row.append(employee, details, actions);
      list.appendChild(row);
    }
    list.hidden = value.returned === 0;
    return value;
  }

  function formatInvoiceAmount(amountCents) {
    if (!Number.isInteger(amountCents)
      || amountCents < 0 || amountCents > 1000000000) {
      throw new Error('Invoice amount is unavailable');
    }
    const dollars = String(Math.floor(amountCents / 100))
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return '$' + dollars + '.' + String(amountCents % 100).padStart(2, '0');
  }

  function validatedInvoiceSummaries(page) {
    const exactKeys = (value, keys) => value
      && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
    if (!exactKeys(page, ['items', 'returned', 'truncated'])
      || !Array.isArray(page.items)
      || page.items.length > 100
      || !Number.isInteger(page.returned)
      || page.returned !== page.items.length
      || typeof page.truncated !== 'boolean') {
      throw new Error('Invoice summaries are unavailable');
    }
    const statuses = new Set(['draft', 'issued', 'paid', 'void']);
    const items = page.items.map(item => {
      const date = typeof item.due_date === 'string'
        && /^\d{4}-\d{2}-\d{2}$/.test(item.due_date)
        ? new Date(item.due_date + 'T00:00:00Z') : null;
      const validDate = date
        && !Number.isNaN(date.getTime())
        && date.toISOString().slice(0, 10) === item.due_date;
      if (!exactKeys(item, [
        'invoice_id', 'customer_label', 'amount_cents', 'due_date', 'status',
      ])
        || typeof item.invoice_id !== 'string'
        || item.invoice_id.length < 1 || item.invoice_id.length > 128
        || typeof item.customer_label !== 'string'
        || item.customer_label.length < 1 || item.customer_label.length > 160
        || !Number.isInteger(item.amount_cents)
        || item.amount_cents < 0 || item.amount_cents > 1000000000
        || !validDate
        || !statuses.has(item.status)) {
        throw new Error('Invoice summaries are unavailable');
      }
      return {
        invoice_id: item.invoice_id,
        customer_label: item.customer_label,
        amount_cents: item.amount_cents,
        due_date: item.due_date,
        status: item.status,
      };
    });
    return { items, returned: page.returned, truncated: page.truncated };
  }

  function renderInvoiceSummaries(doc, page) {
    const value = validatedInvoiceSummaries(page);
    const list = doc.getElementById('invoice-list-items');
    const labels = { draft: 'Draft', issued: 'Issued', paid: 'Paid', void: 'Void' };
    list.replaceChildren();
    for (const item of value.items) {
      const row = doc.createElement('li');
      row.className = 'invoice-list-item';
      const customer = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = item.customer_label;
      customer.appendChild(strong);
      const amount = doc.createElement('p');
      amount.textContent = formatInvoiceAmount(item.amount_cents);
      const due = doc.createElement('p');
      due.textContent = 'Due ' + item.due_date;
      const status = doc.createElement('p');
      status.textContent = labels[item.status] + ' · tracking only';
      row.append(customer, amount, due, status);
      list.appendChild(row);
    }
    list.hidden = value.returned === 0;
    return value;
  }

  function validatedAssignedWorkQueue(queue) {
    const exactKeys = (value, keys) => value
      && typeof value === 'object'
      && !Array.isArray(value)
      && Object.keys(value).sort().join('|') === keys.slice().sort().join('|');
    if (!exactKeys(queue, ['items', 'returned', 'truncated'])
      || !Array.isArray(queue.items)
      || queue.items.length > 100
      || !Number.isInteger(queue.returned)
      || queue.returned !== queue.items.length
      || typeof queue.truncated !== 'boolean') {
      throw new Error('Assigned work orders are unavailable');
    }
    const items = queue.items.map(item => {
      if (!exactKeys(item, ['work_order_id', 'title', 'status'])
        || typeof item.work_order_id !== 'string'
        || item.work_order_id.length < 1 || item.work_order_id.length > 128
        || typeof item.title !== 'string'
        || item.title.length < 1 || item.title.length > 200
        || item.status !== 'open') {
        throw new Error('Assigned work orders are unavailable');
      }
      return {
        work_order_id: item.work_order_id,
        title: item.title,
        status: item.status,
      };
    });
    return { items, returned: queue.returned, truncated: queue.truncated };
  }

  function renderAssignedWorkQueue(doc, queue, onComplete) {
    if (typeof onComplete !== 'function') {
      throw new Error('Assigned work orders are unavailable');
    }
    const value = validatedAssignedWorkQueue(queue);
    const list = doc.getElementById('work-queue-list');
    list.replaceChildren();
    for (const item of value.items) {
      const row = doc.createElement('li');
      row.className = 'work-queue-item';
      const title = doc.createElement('p');
      const strong = doc.createElement('strong');
      strong.textContent = item.title;
      title.appendChild(strong);
      const detail = doc.createElement('p');
      detail.textContent = 'Open work order';
      const mark = doc.createElement('button');
      mark.type = 'button';
      mark.textContent = 'Mark complete';
      mark.setAttribute('aria-label', 'Mark ' + item.title + ' complete');
      const confirmation = doc.createElement('div');
      confirmation.className = 'work-confirmation';
      confirmation.hidden = true;
      const prompt = doc.createElement('p');
      prompt.textContent = 'Is this work finished?';
      const actions = doc.createElement('div');
      actions.className = 'work-confirmation-actions';
      const confirm = doc.createElement('button');
      confirm.type = 'button';
      confirm.textContent = 'Yes, mark complete';
      confirm.setAttribute('aria-label', 'Confirm ' + item.title + ' is complete');
      const cancel = doc.createElement('button');
      cancel.type = 'button';
      cancel.className = 'cancel';
      cancel.textContent = 'No, keep open';
      cancel.setAttribute('aria-label', 'Keep ' + item.title + ' open');
      mark.addEventListener('click', () => {
        mark.hidden = true;
        confirmation.hidden = false;
        confirm.focus();
      });
      cancel.addEventListener('click', () => {
        confirmation.hidden = true;
        mark.hidden = false;
        mark.focus();
      });
      confirm.addEventListener('click', () => onComplete(item.work_order_id));
      actions.append(confirm, cancel);
      confirmation.append(prompt, actions);
      row.append(title, detail, mark, confirmation);
      list.appendChild(row);
    }
    list.hidden = value.returned === 0;
    return value;
  }

  function renderAssetRows(doc, items) {
    const rows = doc.getElementById('asset-inventory-rows');
    const labels = {
      active: 'Active', inactive: 'Inactive', maintenance: 'Maintenance',
    };
    rows.replaceChildren();
    for (const item of items) {
      const row = doc.createElement('tr');
      for (const text of [
        item.asset_name, item.asset_id, item.site_id || 'No site', labels[item.status],
      ]) {
        const cell = doc.createElement('td');
        cell.textContent = text;
        row.appendChild(cell);
      }
      rows.appendChild(row);
    }
  }

  function renderAssetInventory(doc, inventory) {
    const value = validatedAssetInventory(inventory);
    const table = doc.getElementById('asset-inventory-table');
    const truncated = doc.getElementById('asset-inventory-truncated');
    renderAssetRows(doc, value.items);
    table.hidden = value.returned === 0;
    truncated.hidden = !value.truncated;
    return value;
  }

  function dollarsToCents(value) {
    if (!/^\d+(\.\d{1,2})?$/.test(String(value).trim())) {
      throw new Error('Enter a valid dollar amount');
    }
    return Math.round(Number(value) * 100);
  }

  function idempotencyKey(getRandomValues) {
    if (typeof getRandomValues !== 'function') {
      throw new Error('Secure browser randomness is required');
    }
    const bytes = new Uint8Array(24);
    getRandomValues(bytes);
    return 'nexus-' + Array.from(bytes, value => value.toString(16).padStart(2, '0')).join('');
  }

  function validatedCheckoutUrl(value) {
    let url;
    try { url = new URL(value); } catch (_error) {
      throw new Error('Secure checkout address is invalid');
    }
    if (url.protocol !== 'https:' || url.username || url.password || url.hash
      || (url.port && url.port !== '443')) {
      throw new Error('Secure checkout address is invalid');
    }
    return url.href;
  }

  function navigateToCheckout(view, value) {
    if (!view || !view.location || typeof view.location.assign !== 'function') {
      throw new Error('Secure checkout navigation is unavailable');
    }
    const url = validatedCheckoutUrl(value);
    view.location.assign(url);
    return url;
  }

  function checkoutNeedsRetry(intent, now = Date.now()) {
    if (!intent || intent.status !== 'PROVIDER_SESSION'
      || typeof intent.expires_at !== 'string') return false;
    const expiresAt = Date.parse(intent.expires_at);
    const currentTime = Number(now);
    return Number.isFinite(expiresAt) && Number.isFinite(currentTime)
      && expiresAt <= currentTime;
  }

  function checkoutIntentIsCurrent(intent, stagedRevision) {
    return Boolean(intent)
      && intent.selection_current === true
      && Number.isInteger(stagedRevision)
      && stagedRevision > 0
      && intent.selection_revision === stagedRevision;
  }

  function validatedCheckoutIntent(value, expectedRevision = null,
    expectedIntentId = null, now = Date.now()) {
    const invalid = () => {
      throw new Error('Secure checkout response is invalid');
    };
    if (!value || typeof value !== 'object' || Array.isArray(value)) invalid();
    const fields = [
      'checkout_url', 'created_at', 'expires_at', 'intent_id',
      'selection_current', 'selection_revision', 'status', 'updated_at',
    ];
    const keys = Object.keys(value).sort();
    if (keys.length !== fields.length
      || keys.some((key, index) => key !== fields[index])) invalid();
    if (typeof value.intent_id !== 'string'
      || !/^[A-Za-z0-9._:-]{1,255}$/.test(value.intent_id)) invalid();
    if (expectedIntentId !== null && value.intent_id !== expectedIntentId) invalid();
    if (!Number.isInteger(value.selection_revision)
      || value.selection_revision < 1) invalid();
    if (expectedRevision !== null
      && value.selection_revision !== expectedRevision) invalid();
    if (typeof value.selection_current !== 'boolean') invalid();
    if (!['READY_FOR_PROVIDER', 'PROVIDER_SESSION', 'SUBSCRIPTION_BOUND']
      .includes(value.status)) invalid();
    for (const timestamp of [value.created_at, value.updated_at]) {
      if (typeof timestamp !== 'string' || timestamp.length > 64
        || !Number.isFinite(Date.parse(timestamp))) invalid();
    }
    if (value.expires_at !== null
      && (typeof value.expires_at !== 'string' || value.expires_at.length > 64
        || !Number.isFinite(Date.parse(value.expires_at)))) invalid();
    let checkoutUrl = null;
    if (value.checkout_url !== null) {
      checkoutUrl = validatedCheckoutUrl(value.checkout_url);
      const currentTime = Number(now);
      const createdAt = Date.parse(value.created_at);
      const expiresAt = Date.parse(value.expires_at);
      const updatedAt = Date.parse(value.updated_at);
      if (!value.selection_current || value.status !== 'PROVIDER_SESSION'
        || typeof value.expires_at !== 'string'
        || !Number.isFinite(currentTime) || !Number.isFinite(createdAt)
        || !Number.isFinite(expiresAt) || !Number.isFinite(updatedAt)
        || createdAt > updatedAt
        || updatedAt >= expiresAt
        || expiresAt <= currentTime
        || expiresAt - updatedAt > MAX_PROVIDER_SESSION_MS) invalid();
    }
    return { ...value, checkout_url: checkoutUrl };
  }

  function subscriptionIsVerifiedActive(subscription) {
    return Boolean(subscription)
      && subscription.status === 'active'
      && subscription.billing_verified === true
      && subscription.grants_access === true;
  }

  function clearSubscriptionPresentation(root) {
    root.getElementById('subscription-state').textContent =
      'Subscription status not verified.';
    root.getElementById('continue-checkout').disabled = true;
    root.getElementById('checkout-state').textContent =
      'Refresh subscription status before continuing.';
  }

  function subscriptionStatusView(subscription) {
    const unavailable = {
      active: false,
      approval_pending: false,
      staged_revision: null,
      message: 'Subscription status is unavailable. Try again later.',
    };
    if (!subscription || typeof subscription !== 'object'
      || Array.isArray(subscription)) return unavailable;

    if (subscription.status === 'selection_required') {
      if (subscription.billing_verified !== false
        || subscription.grants_access !== false
        || subscription.staged_revision !== null) return unavailable;
      return {
        active: false,
        approval_pending: false,
        staged_revision: null,
        message: 'Choose and save business tools. No subscription is active.',
      };
    }

    if (subscription.status === 'pending_billing') {
      if (subscription.grants_access !== false
        || !Number.isInteger(subscription.staged_revision)
        || subscription.staged_revision < 1) return unavailable;
      const approvalPending = subscription.billing_verified === true;
      if (!approvalPending && subscription.billing_verified !== false) {
        return unavailable;
      }
      return {
        active: false,
        approval_pending: approvalPending,
        staged_revision: approvalPending ? null : subscription.staged_revision,
        message: approvalPending
          ? 'Billing verified; access is still waiting for approval.'
          : 'Selection saved; billing verification is still required.',
      };
    }

    if (subscriptionIsVerifiedActive(subscription)) {
      return {
        active: true,
        approval_pending: false,
        staged_revision: null,
        message: 'Subscription active.',
      };
    }
    return unavailable;
  }

  function clearCompletedCheckout(subscription, storage) {
    if (!subscriptionIsVerifiedActive(subscription)) return false;
    storage.removeItem(INTENT_KEY);
    storage.removeItem(IDEMPOTENCY_KEY);
    return true;
  }

  async function retryExpiredCheckout(intent, intentId, send, getRandomValues,
    now = Date.now()) {
    if (!checkoutNeedsRetry(intent, now)) {
      return { intent, idempotency_key: null };
    }
    const key = idempotencyKey(getRandomValues);
    const retried = await send('/subscription/checkout-intent/retry', {
      method: 'POST', body: {
        intent_id: intentId,
        idempotency_key: key,
      },
    });
    return { intent: retried, idempotency_key: key };
  }


  function validatedAssistantPreference(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      throw new Error('Assistant settings are unavailable');
    }
    const fields = new Set(['revision', 'enabled', 'frequency', 'timezone', 'topics']);
    if (Object.keys(value).length !== fields.size
      || Object.keys(value).some(key => !fields.has(key))
      || !Number.isInteger(value.revision) || value.revision < 0
      || typeof value.enabled !== 'boolean'
      || !ASSISTANT_FREQUENCIES.has(value.frequency)
      || typeof value.timezone !== 'string'
      || value.timezone.length < 1 || value.timezone.length > 80
      || !/^[A-Za-z0-9_+\/-]+$/.test(value.timezone)
      || !Array.isArray(value.topics)
      || value.topics.length > ASSISTANT_TOPICS.size
      || new Set(value.topics).size !== value.topics.length
      || value.topics.some(topic => !ASSISTANT_TOPICS.has(topic))) {
      throw new Error('Assistant settings are unavailable');
    }
    return value;
  }


  function hasExactFields(value, fields) {
    return value && typeof value === 'object' && !Array.isArray(value)
      && Object.keys(value).length === fields.size
      && Object.keys(value).every(key => fields.has(key));
  }

  function boundedTimestamp(value, field) {
    if (typeof value !== 'string' || value.length < 20 || value.length > 40
      || !Number.isFinite(Date.parse(value))) {
      throw new Error('Assistant preview ' + field + ' is unavailable');
    }
    return value;
  }

  function safeEvidenceUrl(value) {
    if (value === null) return null;
    if (typeof value !== 'string' || value.length > 2048) {
      throw new Error('Assistant preview evidence is unavailable');
    }
    let url;
    try { url = new URL(value); } catch (_error) {
      throw new Error('Assistant preview evidence is unavailable');
    }
    if (url.protocol !== 'https:' || url.username || url.password
      || url.hash || url.toString() !== value) {
      throw new Error('Assistant preview evidence is unavailable');
    }
    return value;
  }

  function validatedAssistantDigestPreview(value) {
    const previewFields = new Set([
      'schema_version', 'period_start', 'period_end', 'preference_revision',
      'checked_at', 'items', 'returned', 'truncated',
    ]);
    if (!hasExactFields(value, previewFields)
      || value.schema_version !== 'assistant-digest-preview-v1'
      || !Number.isInteger(value.preference_revision) || value.preference_revision < 0
      || !Array.isArray(value.items) || value.items.length > 100
      || value.returned !== value.items.length
      || typeof value.truncated !== 'boolean'
      || (value.truncated && value.items.length === 0)) {
      throw new Error('Assistant preview is unavailable');
    }
    const periodStart = boundedTimestamp(value.period_start, 'period');
    const periodEnd = boundedTimestamp(value.period_end, 'period');
    const checkedAt = Date.parse(boundedTimestamp(value.checked_at, 'check time'));
    if (Date.parse(periodStart) >= Date.parse(periodEnd)
      || Date.parse(periodEnd) > checkedAt) {
      throw new Error('Assistant preview period is unavailable');
    }
    const itemFields = new Set([
      'topic', 'title', 'action_label', 'deadline_at', 'evidence',
    ]);
    const evidenceFields = new Set([
      'freshness_status', 'observed_at', 'source_updated_at', 'is_synthetic',
      'source_url', 'location_known', 'within_radius',
    ]);
    const seenItems = new Set();
    value.items.forEach(item => {
      if (!hasExactFields(item, itemFields)
        || !ASSISTANT_TOPICS.has(item.topic)
        || typeof item.title !== 'string' || item.title.length < 1
        || item.title.length > 200
        || typeof item.action_label !== 'string' || item.action_label.length < 1
        || item.action_label.length > 120
        || (item.deadline_at !== null
          && (typeof item.deadline_at !== 'string'
            || !Number.isFinite(Date.parse(item.deadline_at))))) {
        throw new Error('Assistant preview item is unavailable');
      }
      const evidence = item.evidence;
      if (!hasExactFields(evidence, evidenceFields)
        || evidence.freshness_status !== 'CURRENT'
        || evidence.is_synthetic !== false
        || ![null, true, false].includes(evidence.location_known)
        || ![null, true, false].includes(evidence.within_radius)) {
        throw new Error('Assistant preview evidence is unavailable');
      }
      const observedAt = Date.parse(
        boundedTimestamp(evidence.observed_at, 'evidence time'));
      const sourceUpdatedAt = Date.parse(
        boundedTimestamp(evidence.source_updated_at, 'source time'));
      const sourceUrl = safeEvidenceUrl(evidence.source_url);
      if (sourceUpdatedAt > observedAt || observedAt > checkedAt
        || (item.topic === 'bid_opportunities'
          && (sourceUrl === null || evidence.location_known !== true
            || evidence.within_radius !== true))) {
        throw new Error('Assistant preview evidence is unavailable');
      }
      const itemKey = JSON.stringify([
        item.topic, item.title, item.action_label, item.deadline_at, sourceUrl,
      ]);
      if (seenItems.has(itemKey)) {
        throw new Error('Assistant preview item is unavailable');
      }
      seenItems.add(itemKey);
    });
    return value;
  }

  function renderAssistantDigestPreview(doc, value, preferenceValue) {
    const preview = validatedAssistantDigestPreview(value);
    let preference;
    try {
      preference = validatedAssistantPreference(preferenceValue);
    } catch (_error) {
      throw new Error('Assistant preview is unavailable');
    }
    if (!preference.enabled || preference.frequency === 'paused'
      || preview.preference_revision !== preference.revision
      || preview.items.some(item => !preference.topics.includes(item.topic))) {
      throw new Error('Assistant preview is unavailable');
    }
    const periodMs = Date.parse(preview.period_end) - Date.parse(preview.period_start);
    const dayMs = 24 * 60 * 60 * 1000;
    if ((preference.frequency === 'daily'
        && (periodMs < 22 * 60 * 60 * 1000 || periodMs > 26 * 60 * 60 * 1000))
      || (preference.frequency === 'weekly'
        && (periodMs < 6 * dayMs || periodMs > 8 * dayMs))) {
      throw new Error('Assistant preview period is unavailable');
    }
    const list = doc.getElementById('assistant-preview-items');
    if (!list) throw new Error('Assistant preview container is unavailable');
    list.replaceChildren();
    preview.items.forEach(item => {
      const row = doc.createElement('li');
      const title = doc.createElement('strong');
      title.textContent = item.title;
      const action = doc.createElement('span');
      action.textContent = item.action_label;
      const evidence = doc.createElement('small');
      evidence.textContent = 'Source checked ' + item.evidence.observed_at;
      row.append(title, action, evidence);
      if (item.evidence.source_url) {
        const source = doc.createElement('a');
        source.href = item.evidence.source_url;
        source.textContent = 'Open source evidence';
        source.target = '_blank';
        source.rel = 'nofollow noopener noreferrer';
        row.append(source);
      }
      list.append(row);
    });
    if (preview.truncated) {
      const notice = doc.createElement('li');
      notice.className = 'assistant-preview-truncated';
      notice.textContent =
        'More permitted updates are available; this preview is incomplete.';
      list.append(notice);
    }
    return preview;
  }

  function validatedAssistantEmailReadiness(value, preferenceValue) {
    const fields = new Set([
      'schema_version', 'preference_revision', 'disposition', 'checked_at',
      'digest_key', 'duplicate_of', 'unsubscribe_ready',
    ]);
    if (!hasExactFields(value, fields)
      || value.schema_version !== 'assistant-email-readiness-v1'
      || !Number.isInteger(value.preference_revision)
      || value.preference_revision < 0
      || !new Set([
        'PREVIEW_ONLY', 'SUPPRESSED_OPT_OUT', 'SUPPRESSED_DUPLICATE',
      ]).has(value.disposition)
      || typeof value.digest_key !== 'string'
      || !/^[A-Za-z0-9_-]{32,128}$/.test(value.digest_key)
      || typeof value.unsubscribe_ready !== 'boolean') {
      throw new Error('Assistant email readiness is unavailable');
    }
    let preference;
    try {
      preference = validatedAssistantPreference(preferenceValue);
      boundedTimestamp(value.checked_at, 'email readiness');
    } catch (_error) {
      throw new Error('Assistant email readiness is unavailable');
    }
    if (value.preference_revision !== preference.revision) {
      throw new Error('Assistant email readiness is unavailable');
    }
    const active = preference.enabled
      && preference.frequency !== 'paused'
      && preference.topics.length > 0;
    if (value.disposition === 'PREVIEW_ONLY') {
      if (!active || value.duplicate_of !== null
        || value.unsubscribe_ready !== true) {
        throw new Error('Assistant email readiness is unavailable');
      }
    } else if (value.disposition === 'SUPPRESSED_OPT_OUT') {
      if (active || value.duplicate_of !== null) {
        throw new Error('Assistant email readiness is unavailable');
      }
    } else {
      if (!active
        || typeof value.duplicate_of !== 'string'
        || !/^[A-Za-z0-9_-]{32,128}$/.test(value.duplicate_of)
        || value.duplicate_of === value.digest_key) {
        throw new Error('Assistant email readiness is unavailable');
      }
    }
    return value;
  }

  function assistantUnsubscribeRequest(token, expectedRevision) {
    if (typeof token !== 'string'
      || !/^[A-Za-z0-9_-]{43,256}$/.test(token)
      || !Number.isInteger(expectedRevision)
      || expectedRevision < 0) {
      throw new Error('Assistant unsubscribe is unavailable');
    }
    return {
      unsubscribe_token: token,
      expected_revision: expectedRevision,
    };
  }

  function validatedAssistantUnsubscribeResult(value, request,
    now = Date.now()) {
    const resultFields = new Set([
      'schema_version', 'status', 'previous_revision', 'revision', 'enabled',
      'frequency', 'unsubscribed_at', 'replayed',
    ]);
    const requestFields = new Set([
      'unsubscribe_token', 'expected_revision',
    ]);
    if (!hasExactFields(value, resultFields)
      || !hasExactFields(request, requestFields)
      || value.schema_version !== 'assistant-unsubscribe-v1'
      || value.status !== 'UNSUBSCRIBED'
      || typeof request.unsubscribe_token !== 'string'
      || !/^[A-Za-z0-9_-]{43,256}$/.test(request.unsubscribe_token)
      || !Number.isInteger(request.expected_revision)
      || request.expected_revision < 0
      || value.previous_revision !== request.expected_revision
      || value.revision !== request.expected_revision + 1
      || value.enabled !== false
      || value.frequency !== 'paused'
      || typeof value.replayed !== 'boolean'
      || !Number.isFinite(Number(now))) {
      throw new Error('Assistant unsubscribe confirmation is unavailable');
    }
    let unsubscribedAt;
    try {
      unsubscribedAt = Date.parse(
        boundedTimestamp(value.unsubscribed_at, 'unsubscribe time'));
    } catch (_error) {
      throw new Error('Assistant unsubscribe confirmation is unavailable');
    }
    if (unsubscribedAt > Number(now) + 5 * 60 * 1000) {
      throw new Error('Assistant unsubscribe confirmation is unavailable');
    }
    return value;
  }

  function validatedAssistantAuditPage(value) {
    const pageFields = new Set([
      'schema_version', 'checked_at', 'returned', 'truncated', 'entries',
    ]);
    if (!hasExactFields(value, pageFields)
      || value.schema_version !== 'assistant-delivery-audit-v1'
      || !Array.isArray(value.entries)
      || value.entries.length > 100
      || value.returned !== value.entries.length
      || typeof value.truncated !== 'boolean'
      || (value.truncated && value.entries.length === 0)) {
      throw new Error('Assistant audit is unavailable');
    }
    let checkedAt;
    try {
      checkedAt = Date.parse(boundedTimestamp(value.checked_at, 'audit check'));
    } catch (_error) {
      throw new Error('Assistant audit is unavailable');
    }
    const entryFields = new Set([
      'audit_ref', 'preference_revision', 'outcome', 'digest_key',
      'duplicate_of', 'occurred_at',
    ]);
    const outcomes = new Set([
      'PREVIEW_ONLY', 'SUPPRESSED_OPT_OUT', 'SUPPRESSED_DUPLICATE',
      'UNSUBSCRIBED',
    ]);
    const seen = new Set();
    let priorOccurredAt = Infinity;
    let priorRef = '';
    value.entries.forEach(entry => {
      if (!hasExactFields(entry, entryFields)
        || typeof entry.audit_ref !== 'string'
        || !/^[A-Za-z0-9][A-Za-z0-9_-]{2,63}$/.test(entry.audit_ref)
        || !Number.isInteger(entry.preference_revision)
        || entry.preference_revision < 0
        || !outcomes.has(entry.outcome)) {
        throw new Error('Assistant audit entry is unavailable');
      }
      let occurredAt;
      try {
        occurredAt = Date.parse(
          boundedTimestamp(entry.occurred_at, 'audit event'));
      } catch (_error) {
        throw new Error('Assistant audit entry is unavailable');
      }
      const refKey = entry.audit_ref.toLocaleLowerCase();
      if (seen.has(refKey) || occurredAt > checkedAt
        || occurredAt > priorOccurredAt
        || (occurredAt === priorOccurredAt
          && entry.audit_ref.localeCompare(priorRef) <= 0)) {
        throw new Error('Assistant audit entry is unavailable');
      }
      seen.add(refKey);
      priorOccurredAt = occurredAt;
      priorRef = entry.audit_ref;
      const hasDigest = typeof entry.digest_key === 'string'
        && /^[A-Za-z0-9_-]{32,128}$/.test(entry.digest_key);
      const hasDuplicate = typeof entry.duplicate_of === 'string'
        && /^[A-Za-z0-9_-]{32,128}$/.test(entry.duplicate_of);
      if (entry.outcome === 'UNSUBSCRIBED') {
        if (entry.digest_key !== null || entry.duplicate_of !== null) {
          throw new Error('Assistant audit entry is unavailable');
        }
      } else if (entry.outcome === 'SUPPRESSED_DUPLICATE') {
        if (!hasDigest || !hasDuplicate
          || entry.digest_key === entry.duplicate_of) {
          throw new Error('Assistant audit entry is unavailable');
        }
      } else if (!hasDigest || entry.duplicate_of !== null) {
        throw new Error('Assistant audit entry is unavailable');
      }
    });
    return value;
  }

  function init(doc) {
    if (!doc) return;
    const status = doc.getElementById('app-status');
    const checkoutButton = doc.getElementById('continue-checkout');
    const checkoutState = doc.getElementById('checkout-state');
    const assistantLoad = doc.getElementById('assistant-load');
    const assistantStatus = doc.getElementById('assistant-status');
    const assistantForm = doc.getElementById('assistant-form');
    const assistantControls = doc.getElementById('assistant-controls');
    const assistantEnabled = doc.getElementById('assistant-enabled');
    const assistantFrequency = doc.getElementById('assistant-frequency');
    const assistantTimezone = doc.getElementById('assistant-timezone');
    const view = doc.defaultView;
    let stagedRevision = null;
    let checkoutPending = false;
    let checkoutLockReason = null;
    let workspaceAccess = null;
    let assetReceipt = null;
    let assetWorkbook = null;
    let assetPreviewReady = false;
    let assetCommitPending = false;
    let loadedAssetInventory = null;
    let assistantRevision = null;
    let assistantLoadPending = false;
    let assistantSavePending = false;
    let workspaceVerified = false;

    function message(text, error = false) {
      status.textContent = text;
      status.classList.toggle('error', error);
    }

    function checkoutReady(revision, active = false, approvalPending = false) {
      stagedRevision = Number.isInteger(revision) && revision > 0 ? revision : null;
      checkoutLockReason = active
        ? 'active'
        : approvalPending ? 'approval_pending' : null;
      checkoutButton.disabled = checkoutPending || active || approvalPending
        || stagedRevision === null;
      checkoutState.textContent = active
        ? 'Subscription access is active. No checkout is needed.'
        : approvalPending
          ? 'Billing is verified. Access approval is pending; no checkout is needed.'
          : stagedRevision === null
            ? 'Save your business tools before continuing.'
            : 'Your selection is saved. Billing is still unverified.';
    }

    function setWorkspaceMutationAccess(access = null) {
      workspaceAccess = ['manager', 'employee'].includes(access) ? access : null;
      const employeeAllowed = workspaceAccess === 'manager'
        || workspaceAccess === 'employee';
      doc.getElementById('clock-in').disabled = !employeeAllowed;
      doc.getElementById('clock-out').disabled = !employeeAllowed;
      doc.querySelector('#leave-form button[type="submit"]').disabled = !employeeAllowed;
      doc.querySelector('#work-form button[type="submit"]').disabled
        = workspaceAccess !== 'manager';
    }


    function clearAssistantSettings(text = 'Load your saved settings before making a change.') {
      assistantRevision = null;
      assistantEnabled.checked = false;
      assistantFrequency.value = 'paused';
      assistantTimezone.value = 'UTC';
      doc.querySelectorAll('input[name="assistant-topic"]').forEach(input => {
        input.checked = false;
      });
      assistantControls.disabled = true;
      assistantStatus.textContent = text;
    }

    function setAssistantAccess(verified) {
      workspaceVerified = verified === true;
      assistantLoad.disabled = !workspaceVerified || assistantLoadPending;
      if (!workspaceVerified) {
        clearAssistantSettings('Verify workspace access, then load your settings.');
      }
    }

    function renderAssistantSettings(value) {
      const preference = validatedAssistantPreference(value);
      assistantRevision = preference.revision;
      assistantEnabled.checked = preference.enabled;
      assistantFrequency.value = preference.frequency;
      assistantTimezone.value = preference.timezone;
      const selected = new Set(preference.topics);
      doc.querySelectorAll('input[name="assistant-topic"]').forEach(input => {
        input.checked = selected.has(input.value);
      });
      assistantControls.disabled = false;
      assistantStatus.textContent = 'Settings loaded. No email is sent yet.';
      return preference;
    }

    async function loadAssistantSettings() {
      if (!workspaceVerified || assistantLoadPending) return;
      assistantLoadPending = true;
      assistantLoad.disabled = true;
      clearAssistantSettings('Loading update settings…');
      try {
        renderAssistantSettings(await request('/assistant/preferences'));
      } catch (error) {
        const denied = error && (error.status === 401 || error.status === 403);
        if (denied) {
          clearRevokedWorkspace();
          assistantStatus.textContent =
            'Your access or active subscription does not allow these settings.';
        } else {
          clearAssistantSettings('Update settings are unavailable. Try loading them again.');
        }
      } finally {
        assistantLoadPending = false;
        assistantLoad.disabled = !workspaceVerified;
      }
    }

    function clearRevokedWorkspace() {
      setWorkspaceMutationAccess(null);
      setAssistantAccess(false);
      clearAccessStatus(doc);
      clearDashboardSummary(doc);
    }

    function workspaceMutationAllowed(requiredAccess) {
      if (requiredAccess === 'manager') return workspaceAccess === 'manager';
      return workspaceAccess === 'manager' || workspaceAccess === 'employee';
    }

    async function run(action, success, options = {}) {
      try {
        message('Saving…');
        const value = await action();
        message(success);
        return value;
      } catch (error) {
        const denied = error && (error.status === 401 || error.status === 403);
        if (denied && options.lockOnDenied) clearRevokedWorkspace();
        message(denied
          ? 'Your secure session does not allow this task.'
          : 'This task is not available yet. Try again later.', true);
        return null;
      }
    }

    function runWorkspaceMutation(requiredAccess, action, success) {
      if (!workspaceMutationAllowed(requiredAccess)) {
        message('Refresh secure access before trying this task.', true);
        return Promise.resolve(null);
      }
      return run(action, success, { lockOnDenied: true });
    }

    function presentSubscription(subscription) {
      const subscriptionView = subscriptionStatusView(subscription);
      doc.getElementById('subscription-state').textContent = subscriptionView.message;
      if (subscriptionView.active) {
        clearCompletedCheckout(subscription, view.sessionStorage);
      }
      checkoutReady(
        subscriptionView.staged_revision,
        subscriptionView.active,
        subscriptionView.approval_pending,
      );
      return subscriptionView;
    }

    async function refresh() {
      clearRevokedWorkspace();
      const access = await run(() => request('/access'), 'Workspace access checked.');
      if (access) {
        const verifiedAccess = validatedAccessStatus(access);
        renderAccessStatus(doc, access);
        setWorkspaceMutationAccess(verifiedAccess);
        setAssistantAccess(true);
      }
      const dashboard = await run(() => request('/dashboard'), 'Workspace updated.');
      if (dashboard) {
        const values = dashboardSummaryValues(dashboard);
        doc.querySelectorAll('#dashboard strong').forEach((node, index) => {
          node.textContent = String(values[index] ?? '—');
        });
      }
      stagedRevision = null;
      clearSubscriptionPresentation(doc);
      const subscription = await run(() => request('/subscription'), 'Workspace updated.');
      if (subscription) presentSubscription(subscription);
    }


    assistantLoad.addEventListener('click', loadAssistantSettings);
    assistantForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (assistantSavePending || !workspaceVerified
        || !Number.isInteger(assistantRevision)) return;
      assistantSavePending = true;
      assistantControls.disabled = true;
      assistantStatus.textContent = 'Saving update settings…';
      const expectedRevision = assistantRevision;
      const body = {
        expected_revision: expectedRevision,
        enabled: assistantEnabled.checked,
        frequency: assistantFrequency.value,
        timezone: assistantTimezone.value.trim(),
        topics: [...doc.querySelectorAll('input[name="assistant-topic"]:checked')]
          .map(input => input.value),
      };
      try {
        renderAssistantSettings(await request('/assistant/preferences', {
          method: 'PATCH',
          body,
        }));
        assistantStatus.textContent =
          'Settings saved. No email, AI task, scheduler, or delivery was started.';
      } catch (error) {
        const denied = error && (error.status === 401 || error.status === 403);
        if (denied) {
          clearRevokedWorkspace();
          assistantStatus.textContent =
            'Your access or active subscription does not allow these settings.';
        } else if (error && error.status === 409) {
          clearAssistantSettings(
            'These settings changed elsewhere. Load the latest settings before trying again.');
        } else {
          clearAssistantSettings(
            'Update settings were not saved. Load the latest settings before trying again.');
        }
      } finally {
        assistantSavePending = false;
      }
    });

    doc.getElementById('refresh').addEventListener('click', refresh);
    doc.getElementById('clock-in').addEventListener('click', () =>
      runWorkspaceMutation('employee',
        () => request('/clock-in', { method: 'POST', body: {} }),
        'Clocked in.'));
    doc.getElementById('clock-out').addEventListener('click', () =>
      runWorkspaceMutation('employee',
        () => request('/clock-out', { method: 'POST', body: {
          punch_id: doc.getElementById('punch-id').value.trim(),
        } }),
        'Clocked out.'));

    doc.getElementById('leave-form').addEventListener('submit', event => {
      event.preventDefault();
      runWorkspaceMutation('employee', () => request('/leave', {
        method: 'POST', body: {
          kind: doc.getElementById('leave-kind').value,
          date: doc.getElementById('leave-date').value,
        },
      }), 'Time-off request sent.');
    });

    const leaveReviewLoad = doc.getElementById('leave-review-load');
    const leaveReviewStatus = doc.getElementById('leave-review-status');
    const leaveReviewList = doc.getElementById('leave-review-list');
    const leaveReviewEmpty = doc.getElementById('leave-review-empty');
    const leaveReviewTruncated = doc.getElementById('leave-review-truncated');

    function clearPendingLeaveQueue() {
      leaveReviewList.replaceChildren();
      leaveReviewList.hidden = true;
      leaveReviewEmpty.hidden = true;
      leaveReviewTruncated.hidden = true;
    }

    async function loadPendingLeaveQueue(successPrefix = '') {
      leaveReviewLoad.disabled = true;
      clearPendingLeaveQueue();
      leaveReviewStatus.textContent = 'Loading requests to review…';
      try {
        const queue = renderPendingLeaveQueue(
          doc,
          await request('/leave/pending'),
          reviewPendingLeave,
        );
        leaveReviewEmpty.hidden = queue.returned !== 0;
        leaveReviewTruncated.hidden = !queue.truncated;
        leaveReviewStatus.textContent = successPrefix
          ? successPrefix + ' ' + queue.returned + ' request(s) waiting.'
          : queue.returned + ' request(s) waiting for review.';
        leaveReviewLoad.textContent = 'Refresh requests to review';
        return queue;
      } catch (error) {
        clearPendingLeaveQueue();
        leaveReviewStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow manager review.'
          : 'Requests to review are not available yet. Try again later.';
        return null;
      } finally {
        leaveReviewLoad.disabled = false;
      }
    }

    async function reviewPendingLeave(requestId, approve) {
      leaveReviewList.querySelectorAll('button').forEach(button => {
        button.disabled = true;
      });
      leaveReviewStatus.textContent = approve
        ? 'Approving this request…'
        : 'Denying this request…';
      try {
        await request('/leave/review', {
          method: 'POST',
          body: { request_id: requestId, approve },
        });
        await loadPendingLeaveQueue(approve
          ? 'Time off approved.'
          : 'Time off denied.');
      } catch (error) {
        clearPendingLeaveQueue();
        leaveReviewStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow manager review.'
          : 'The review was not confirmed. Load requests again before trying another action.';
      }
      leaveReviewStatus.focus();
    }

    leaveReviewLoad.addEventListener('click', () => loadPendingLeaveQueue());

    const workQueueLoad = doc.getElementById('work-queue-load');
    const workQueueStatus = doc.getElementById('work-queue-status');
    const workQueueList = doc.getElementById('work-queue-list');
    const workQueueEmpty = doc.getElementById('work-queue-empty');
    const workQueueTruncated = doc.getElementById('work-queue-truncated');

    function clearAssignedWorkQueue() {
      workQueueList.replaceChildren();
      workQueueList.hidden = true;
      workQueueEmpty.hidden = true;
      workQueueTruncated.hidden = true;
    }

    async function loadAssignedWorkQueue(successPrefix = '') {
      workQueueLoad.disabled = true;
      clearAssignedWorkQueue();
      workQueueStatus.textContent = 'Loading your work…';
      try {
        const queue = renderAssignedWorkQueue(
          doc,
          await request('/work-orders'),
          completeAssignedWork,
        );
        workQueueEmpty.hidden = queue.returned !== 0;
        workQueueTruncated.hidden = !queue.truncated;
        workQueueStatus.textContent = successPrefix
          ? successPrefix + ' ' + queue.returned + ' open work order(s).'
          : queue.returned + ' open work order(s) assigned to you.';
        workQueueLoad.textContent = 'Refresh my work';
        return queue;
      } catch (error) {
        clearAssignedWorkQueue();
        workQueueStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow this work list.'
          : 'Your work orders are not available yet. Try again later.';
        return null;
      } finally {
        workQueueLoad.disabled = false;
      }
    }

    async function completeAssignedWork(workOrderId) {
      workQueueList.querySelectorAll('button').forEach(button => {
        button.disabled = true;
      });
      workQueueStatus.textContent = 'Marking this work complete…';
      try {
        await request('/work-orders/complete', {
          method: 'POST',
          body: { item_id: workOrderId },
        });
        await loadAssignedWorkQueue('Work marked complete.');
      } catch (error) {
        clearAssignedWorkQueue();
        workQueueStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow this work list.'
          : 'Completion was not confirmed. Load your work again before trying another action.';
      }
      workQueueStatus.focus();
    }

    workQueueLoad.addEventListener('click', () => loadAssignedWorkQueue());

    doc.getElementById('work-form').addEventListener('submit', event => {
      event.preventDefault();
      runWorkspaceMutation('manager', () => request('/work-orders', {
        method: 'POST', body: {
          title: doc.getElementById('work-title').value.trim(),
          assigned_principal_id: doc.getElementById('assignee').value.trim(),
        },
      }), 'Work order assigned.');
    });

    doc.getElementById('invoice-form').addEventListener('submit', event => {
      event.preventDefault();
      let cents;
      try { cents = dollarsToCents(doc.getElementById('amount').value); } catch (error) {
        message(error.message, true);
        return;
      }
      run(() => request('/invoices', { method: 'POST', body: {
        invoice_id: doc.getElementById('invoice-id').value.trim(),
        customer_name: doc.getElementById('customer-name').value.trim(),
        amount_cents: cents,
      } }), 'Invoice draft saved.');
    });

    const invoiceListLoad = doc.getElementById('invoice-list-load');
    const invoiceListStatus = doc.getElementById('invoice-list-status');
    const invoiceListItems = doc.getElementById('invoice-list-items');
    const invoiceListEmpty = doc.getElementById('invoice-list-empty');
    const invoiceListTruncated = doc.getElementById('invoice-list-truncated');

    function clearInvoiceSummaries() {
      invoiceListItems.replaceChildren();
      invoiceListItems.hidden = true;
      invoiceListEmpty.hidden = true;
      invoiceListTruncated.hidden = true;
    }

    invoiceListLoad.addEventListener('click', async () => {
      invoiceListLoad.disabled = true;
      clearInvoiceSummaries();
      invoiceListStatus.textContent = 'Loading invoice records…';
      try {
        const page = renderInvoiceSummaries(doc, await request('/invoices'));
        invoiceListEmpty.hidden = page.returned !== 0;
        invoiceListTruncated.hidden = !page.truncated;
        invoiceListStatus.textContent = page.returned === 0
          ? 'No invoice tracking records available.'
          : page.returned + ' invoice tracking record(s) loaded.';
        invoiceListLoad.textContent = 'Refresh invoice list';
      } catch (error) {
        clearInvoiceSummaries();
        invoiceListStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow this invoice list.'
          : 'The invoice list is not available yet. Try again later.';
      } finally {
        invoiceListLoad.disabled = false;
      }
      invoiceListStatus.focus();
    });

    const assetStatus = doc.getElementById('asset-status');
    const assetPreview = doc.getElementById('asset-preview');
    const assetSummary = doc.getElementById('asset-preview-summary');
    const assetErrors = doc.getElementById('asset-errors');
    const assetErrorDownload = doc.getElementById('asset-error-download');
    const assetCommit = doc.getElementById('asset-commit');
    const assetConfirm = doc.getElementById('asset-confirm');
    const assetImport = doc.getElementById('asset-import');
    const assetInventoryLoad = doc.getElementById('asset-inventory-load');
    const assetInventoryStatus = doc.getElementById('asset-inventory-status');
    const assetInventoryTable = doc.getElementById('asset-inventory-table');
    const assetInventoryRows = doc.getElementById('asset-inventory-rows');
    const assetInventoryTruncated = doc.getElementById('asset-inventory-truncated');
    const assetInventoryFilters = doc.getElementById('asset-inventory-filters');
    const assetInventorySearch = doc.getElementById('asset-inventory-search');
    const assetInventoryStatusFilter = doc.getElementById('asset-inventory-status-filter');
    const assetInventoryClear = doc.getElementById('asset-inventory-clear');
    const assetInventoryCount = doc.getElementById('asset-inventory-count');
    const assetInventoryEmpty = doc.getElementById('asset-inventory-empty');

    async function assetRun(action, success) {
      try {
        assetStatus.textContent = 'Checking…';
        const value = await action();
        assetStatus.textContent = success;
        return value;
      } catch (error) {
        assetReceipt = null;
        assetWorkbook = null;
        assetPreviewReady = false;
        assetCommitPending = false;
        clearAssetPreview(doc, { focus: true });
        assetStatus.textContent = assetFailureMessage(error);
        return null;
      }
    }

    doc.getElementById('asset-template').addEventListener('click', () =>
      assetRun(async () => {
        const result = await assetRequest('/imports/assets/template', {
          download: true,
        });
        saveDownload(doc, result.blob, 'nexus-assets-v1.xlsx');
        return result;
      }, 'Blank spreadsheet downloaded.'));

    doc.getElementById('asset-workbook').addEventListener('change', () => {
      if (assetCommitPending) return;
      assetReceipt = null;
      assetWorkbook = null;
      assetPreviewReady = false;
      clearAssetPreview(doc, { clearFile: false });
      assetStatus.textContent = 'Spreadsheet changed. Check it again before importing.';
    });

    doc.getElementById('asset-preview-form').addEventListener('submit', event => {
      event.preventDefault();
      if (assetCommitPending) return;
      const selected = doc.getElementById('asset-workbook').files[0];
      assetReceipt = null;
      assetWorkbook = null;
      assetPreviewReady = false;
      assetCommitPending = false;
      clearAssetPreview(doc, { clearFile: false });
      assetRun(async () => {
        assetWorkbook = validateAssetWorkbook(selected);
        const preview = await assetRequest('/imports/assets/preview', {
          method: 'POST', file: assetWorkbook,
        });
        assetReceipt = preview.receipt_id;
        assetPreviewReady = canCommitAssetPreview(preview);
        assetCommit.hidden = !assetPreviewReady;
        assetConfirm.checked = false;
        assetImport.disabled = true;
        assetPreview.hidden = false;
        assetSummary.textContent = preview.error_count
          ? preview.error_count + ' problem(s) found. No assets were saved.'
          : preview.accepted_rows + ' row(s) ready. No assets were saved.';
        assetErrors.replaceChildren();
        for (const item of preview.errors || []) {
          const row = doc.createElement('li');
          row.textContent = 'Row ' + item.row + ', ' + item.column
            + ': ' + item.code;
          assetErrors.appendChild(row);
        }
        assetErrorDownload.hidden = !(preview.error_count > 0);
        return preview;
      }, 'Spreadsheet check finished.');
    });

    assetErrorDownload.addEventListener('click', () =>
      assetRun(async () => {
        if (!assetWorkbook || !assetReceipt) {
          throw new Error('Spreadsheet check has expired');
        }
        const result = await assetRequest('/imports/assets/errors', {
          method: 'POST',
          file: assetWorkbook,
          receipt: assetReceipt,
          download: true,
        });
        saveDownload(doc, result.blob, 'nexus-assets-v1-errors.csv');
        return result;
      }, 'Error list downloaded.'));

    assetConfirm.addEventListener('change', () => {
      assetImport.disabled = !assetPreviewReady
        || !assetConfirm.checked || assetCommitPending;
    });

    assetImport.addEventListener('click', () => {
      if (!assetPreviewReady || !assetConfirm.checked || !assetReceipt
        || !assetWorkbook || assetCommitPending || assetImport.disabled) return;
      assetCommitPending = true;
      assetImport.disabled = true;
      assetRun(async () => {
        const imported = await assetRequest('/imports/assets/commit', {
          method: 'POST',
          file: assetWorkbook,
          receipt: assetReceipt,
        });
        if (!imported || !Number.isInteger(imported.total_rows)
          || imported.total_rows < 1) {
          throw new Error('The import confirmation was not available');
        }
        assetReceipt = null;
        assetWorkbook = null;
        assetPreviewReady = false;
        clearAssetPreview(doc);
        await refresh();
        loadedAssetInventory = null;
        assetInventoryRows.replaceChildren();
        assetInventoryTable.hidden = true;
        assetInventoryTruncated.hidden = true;
        assetInventoryFilters.hidden = true;
        assetInventoryCount.hidden = true;
        assetInventoryEmpty.hidden = true;
        assetInventorySearch.value = '';
        assetInventoryStatusFilter.value = 'all';
        assetInventoryClear.disabled = true;
        assetInventoryStatus.textContent = 'Assets changed. Load the list again.';
        return imported;
      }, 'New assets added. Dashboard refreshed.')
        .finally(() => { assetCommitPending = false; });
    });



    function applyAssetInventoryFilters() {
      if (!loadedAssetInventory) return;
      const filtered = filterAssetItems(
        loadedAssetInventory.items,
        assetInventorySearch.value,
        assetInventoryStatusFilter.value,
      );
      renderAssetRows(doc, filtered);
      assetInventoryTable.hidden = filtered.length === 0;
      assetInventoryEmpty.hidden = filtered.length !== 0
        || loadedAssetInventory.returned === 0;
      assetInventoryCount.hidden = false;
      assetInventoryCount.textContent = filtered.length + ' of '
        + loadedAssetInventory.returned + ' loaded asset(s) shown.';
      assetInventoryClear.disabled = !assetInventorySearch.value.trim()
        && assetInventoryStatusFilter.value === 'all';
    }

    assetInventorySearch.addEventListener('input', applyAssetInventoryFilters);
    assetInventoryStatusFilter.addEventListener('change', applyAssetInventoryFilters);
    assetInventoryClear.addEventListener('click', () => {
      if (!loadedAssetInventory || assetInventoryClear.disabled) return;
      clearAssetFilters(
        assetInventorySearch,
        assetInventoryStatusFilter,
        assetInventoryClear,
        applyAssetInventoryFilters,
      );
    });

    assetInventoryLoad.addEventListener('click', async () => {
      assetInventoryLoad.disabled = true;
      assetInventoryStatus.textContent = 'Loading imported assets…';
      assetInventoryTable.hidden = true;
      assetInventoryTruncated.hidden = true;
      assetInventoryRows.replaceChildren();
      loadedAssetInventory = null;
      assetInventoryFilters.hidden = true;
      assetInventoryClear.disabled = true;
      assetInventoryCount.hidden = true;
      assetInventoryEmpty.hidden = true;
      try {
        const inventory = renderAssetInventory(doc, await request('/assets'));
        loadedAssetInventory = inventory;
        assetInventorySearch.value = '';
        assetInventoryStatusFilter.value = 'all';
        assetInventoryFilters.hidden = inventory.returned === 0;
        assetInventoryStatus.textContent = inventory.returned === 0
          ? 'No imported assets yet.'
          : inventory.returned + ' imported asset(s) loaded.';
        assetInventoryLoad.textContent = 'Refresh imported assets';
        applyAssetInventoryFilters();
      } catch (error) {
        assetInventoryStatus.textContent = error && (error.status === 401 || error.status === 403)
          ? 'Your secure session does not allow this asset list.'
          : 'The asset list is not available yet. Try again later.';
      } finally {
        assetInventoryLoad.disabled = false;
      }
    });

    doc.getElementById('subscription-form').addEventListener('submit', event => {
      event.preventDefault();
      const modules = [...doc.querySelectorAll('input[name="module"]:checked')]
        .map(input => input.value);
      stagedRevision = null;
      clearSubscriptionPresentation(doc);
      run(() => request('/subscription', { method: 'POST', body: {
        bundle: doc.getElementById('bundle').value,
        selected_module_ids: modules,
        licensed_user_limit: Number(doc.getElementById('users').value),
      } }), 'Subscription request completed.').then(value => {
        if (!value) return;
        view.sessionStorage.removeItem(INTENT_KEY);
        view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
        presentSubscription(value);
      });
    });

    checkoutButton.addEventListener('click', async () => {
      if (checkoutPending) return;
      checkoutPending = true;
      checkoutButton.disabled = true;
      checkoutState.textContent = 'Preparing secure checkout…';
      const checkoutRevision = stagedRevision;
      const intent = await run(async () => {
        if (checkoutRevision === null) throw new Error('Save a selection first');
      let intent;
      let persistIntent = false;
      let recoveredIdempotencyKey = null;
      const savedIntent = view.sessionStorage.getItem(INTENT_KEY);
      if (savedIntent) {
        const savedStatus = await request('/subscription/checkout-intent/status', {
          method: 'POST', body: { intent_id: savedIntent },
        });
        try {
          intent = validatedCheckoutIntent(savedStatus, null, savedIntent);
        } catch (error) {
          view.sessionStorage.removeItem(INTENT_KEY);
          view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
          throw error;
        }
        if (!checkoutIntentIsCurrent(intent, checkoutRevision)) {
          view.sessionStorage.removeItem(INTENT_KEY);
          view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
          const key = idempotencyKey(view.crypto.getRandomValues.bind(view.crypto));
          view.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
          intent = validatedCheckoutIntent(
            await request('/subscription/checkout-intent', {
              method: 'POST', body: {
                expected_selection_revision: checkoutRevision,
                idempotency_key: key,
              },
            }),
            checkoutRevision,
          );
          persistIntent = true;
        } else {
          const recovery = await retryExpiredCheckout(intent, savedIntent, request,
            view.crypto.getRandomValues.bind(view.crypto));
          intent = validatedCheckoutIntent(
            recovery.intent,
            checkoutRevision,
            savedIntent,
          );
          if (recovery.idempotency_key) {
            recoveredIdempotencyKey = recovery.idempotency_key;
          }
        }
      } else {
        let key = view.sessionStorage.getItem(IDEMPOTENCY_KEY);
        if (!key) {
          key = idempotencyKey(view.crypto.getRandomValues.bind(view.crypto));
          view.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
        }
        intent = validatedCheckoutIntent(
          await request('/subscription/checkout-intent', {
            method: 'POST', body: {
              expected_selection_revision: checkoutRevision,
              idempotency_key: key,
            },
          }),
          checkoutRevision,
        );
        persistIntent = true;
      }
      if (stagedRevision !== checkoutRevision) {
        view.sessionStorage.removeItem(INTENT_KEY);
        view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
        if (checkoutLockReason) return null;
        throw new Error('Secure checkout selection changed');
      }
      if (recoveredIdempotencyKey) {
        view.sessionStorage.setItem(IDEMPOTENCY_KEY, recoveredIdempotencyKey);
      }
      if (persistIntent) {
        view.sessionStorage.setItem(INTENT_KEY, intent.intent_id);
      }
      if (intent.checkout_url) {
        navigateToCheckout(view, intent.checkout_url);
      } else {
        checkoutState.textContent = 'Secure checkout is being prepared. Try again later.';
      }
        return intent;
      }, 'Checkout request saved.');
      checkoutPending = false;
      if (checkoutLockReason) {
        checkoutButton.disabled = true;
        message(checkoutLockReason === 'active'
          ? 'Subscription access is active.'
          : 'Billing is verified. Access approval is pending.');
        return;
      }
      if (!intent) {
        checkoutState.textContent = 'Secure checkout was not started. Try again later.';
      }
      if (!intent || !intent.checkout_url) {
        checkoutButton.disabled = stagedRevision === null;
      }
    });

    checkoutReady(null);
    refresh();
  }

  return { API, csrfToken, dollarsToCents, idempotencyKey,
    validatedCheckoutUrl, navigateToCheckout,
    checkoutNeedsRetry, checkoutIntentIsCurrent,
    validatedCheckoutIntent,
    subscriptionIsVerifiedActive, subscriptionStatusView,
    clearSubscriptionPresentation, clearCompletedCheckout,
    retryExpiredCheckout, validateAssetWorkbook, assetRequest, saveDownload,
    clearAssetPreview, canCommitAssetPreview, assetFailureMessage,
    dashboardSummaryValues, clearDashboardSummary,
    validatedAccessStatus, renderAccessStatus, clearAccessStatus,
    validatedAssetInventory, filterAssetItems,
    validatedAssistantPreference, validatedAssistantDigestPreview,
    renderAssistantDigestPreview, validatedAssistantEmailReadiness,
    assistantUnsubscribeRequest, validatedAssistantUnsubscribeResult,
    validatedAssistantAuditPage,
    validatedPendingLeaveQueue, renderPendingLeaveQueue,
    validatedAssignedWorkQueue, renderAssignedWorkQueue,
    formatInvoiceAmount, validatedInvoiceSummaries, renderInvoiceSummaries,
    clearAssetFilters, renderAssetRows, renderAssetInventory, request, init };
});
