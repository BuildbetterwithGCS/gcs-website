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
  const PREVIEW_RECEIPT_HEADER = 'X-Nexus-Preview-Receipt';

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

  function subscriptionIsVerifiedActive(subscription) {
    return Boolean(subscription)
      && subscription.status === 'active'
      && subscription.billing_verified === true
      && subscription.grants_access === true;
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

  function init(doc) {
    if (!doc) return;
    const status = doc.getElementById('app-status');
    const checkoutButton = doc.getElementById('continue-checkout');
    const checkoutState = doc.getElementById('checkout-state');
    const view = doc.defaultView;
    let stagedRevision = null;
    let assetReceipt = null;
    let assetWorkbook = null;

    function message(text, error = false) {
      status.textContent = text;
      status.classList.toggle('error', error);
    }

    function checkoutReady(revision, active = false) {
      stagedRevision = Number.isInteger(revision) && revision > 0 ? revision : null;
      checkoutButton.disabled = active || stagedRevision === null;
      checkoutState.textContent = active
        ? 'Subscription access is active. No checkout is needed.'
        : stagedRevision === null
          ? 'Save your business tools before continuing.'
          : 'Your selection is saved. Billing is still unverified.';
    }

    async function run(action, success) {
      try {
        message('Saving…');
        const value = await action();
        message(success);
        return value;
      } catch (error) {
        message(error.status === 403
          ? 'Your secure session does not allow this task.'
          : 'This task is not available yet. Try again later.', true);
        return null;
      }
    }

    async function refresh() {
      const dashboard = await run(() => request('/dashboard'), 'Workspace updated.');
      if (dashboard) {
        const values = [dashboard.open_work, dashboard.completed_work,
          dashboard.pending_leave, dashboard.unapproved_punches];
        doc.querySelectorAll('#dashboard strong').forEach((node, index) => {
          node.textContent = String(values[index] ?? 0);
        });
      }
      const subscription = await run(() => request('/subscription'), 'Workspace updated.');
      if (subscription) {
        const active = subscriptionIsVerifiedActive(subscription);
        doc.getElementById('subscription-state').textContent = active
          ? 'Subscription active.'
          : 'Selection saved; billing verification is still required.';
        if (active) clearCompletedCheckout(subscription, view.sessionStorage);
        checkoutReady(active ? null : subscription.staged_revision, active);
      }
    }

    doc.getElementById('refresh').addEventListener('click', refresh);
    doc.getElementById('clock-in').addEventListener('click', () =>
      run(() => request('/clock-in', { method: 'POST', body: {} }), 'Clocked in.'));
    doc.getElementById('clock-out').addEventListener('click', () =>
      run(() => request('/clock-out', { method: 'POST', body: {
        punch_id: doc.getElementById('punch-id').value.trim(),
      } }), 'Clocked out.'));

    doc.getElementById('leave-form').addEventListener('submit', event => {
      event.preventDefault();
      run(() => request('/leave', { method: 'POST', body: {
        kind: doc.getElementById('leave-kind').value,
        date: doc.getElementById('leave-date').value,
      } }), 'Time-off request sent.');
    });

    doc.getElementById('work-form').addEventListener('submit', event => {
      event.preventDefault();
      run(() => request('/work-orders', { method: 'POST', body: {
        title: doc.getElementById('work-title').value.trim(),
        assigned_principal_id: doc.getElementById('assignee').value.trim(),
      } }), 'Work order assigned.');
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

    const assetStatus = doc.getElementById('asset-status');
    const assetPreview = doc.getElementById('asset-preview');
    const assetSummary = doc.getElementById('asset-preview-summary');
    const assetErrors = doc.getElementById('asset-errors');
    const assetErrorDownload = doc.getElementById('asset-error-download');

    async function assetRun(action, success) {
      try {
        assetStatus.textContent = 'Checking…';
        const value = await action();
        assetStatus.textContent = success;
        return value;
      } catch (error) {
        assetReceipt = null;
        assetWorkbook = null;
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

    doc.getElementById('asset-preview-form').addEventListener('submit', event => {
      event.preventDefault();
      const selected = doc.getElementById('asset-workbook').files[0];
      assetReceipt = null;
      assetWorkbook = null;
      clearAssetPreview(doc, { clearFile: false });
      assetRun(async () => {
        assetWorkbook = validateAssetWorkbook(selected);
        const preview = await assetRequest('/imports/assets/preview', {
          method: 'POST', file: assetWorkbook,
        });
        assetReceipt = preview.receipt_id;
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

    doc.getElementById('subscription-form').addEventListener('submit', event => {
      event.preventDefault();
      const modules = [...doc.querySelectorAll('input[name="module"]:checked')]
        .map(input => input.value);
      run(() => request('/subscription', { method: 'POST', body: {
        bundle: doc.getElementById('bundle').value,
        selected_module_ids: modules,
        licensed_user_limit: Number(doc.getElementById('users').value),
      } }), 'Selection saved. Billing verification is still required.').then(value => {
        if (!value) return;
        doc.getElementById('subscription-state').textContent =
          'Selection saved; billing verification is still required.';
        checkoutReady(value.staged_revision);
        view.sessionStorage.removeItem(INTENT_KEY);
        view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
      });
    });

    checkoutButton.addEventListener('click', () => run(async () => {
      if (stagedRevision === null) throw new Error('Save a selection first');
      let intent;
      const savedIntent = view.sessionStorage.getItem(INTENT_KEY);
      if (savedIntent) {
        intent = await request('/subscription/checkout-intent/status', {
          method: 'POST', body: { intent_id: savedIntent },
        });
        if (!checkoutIntentIsCurrent(intent, stagedRevision)) {
          view.sessionStorage.removeItem(INTENT_KEY);
          view.sessionStorage.removeItem(IDEMPOTENCY_KEY);
          const key = idempotencyKey(view.crypto.getRandomValues.bind(view.crypto));
          view.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
          intent = await request('/subscription/checkout-intent', {
            method: 'POST', body: {
              expected_selection_revision: stagedRevision,
              idempotency_key: key,
            },
          });
          view.sessionStorage.setItem(INTENT_KEY, intent.intent_id);
        } else {
          const recovery = await retryExpiredCheckout(intent, savedIntent, request,
            view.crypto.getRandomValues.bind(view.crypto));
          intent = recovery.intent;
          if (recovery.idempotency_key) {
            view.sessionStorage.setItem(IDEMPOTENCY_KEY, recovery.idempotency_key);
          }
        }
      } else {
        let key = view.sessionStorage.getItem(IDEMPOTENCY_KEY);
        if (!key) {
          key = idempotencyKey(view.crypto.getRandomValues.bind(view.crypto));
          view.sessionStorage.setItem(IDEMPOTENCY_KEY, key);
        }
        intent = await request('/subscription/checkout-intent', {
          method: 'POST', body: {
            expected_selection_revision: stagedRevision,
            idempotency_key: key,
          },
        });
        view.sessionStorage.setItem(INTENT_KEY, intent.intent_id);
      }
      if (intent.checkout_url) {
        view.location.assign(validatedCheckoutUrl(intent.checkout_url));
      } else {
        checkoutState.textContent = 'Secure checkout is being prepared. Try again later.';
      }
      return intent;
    }, 'Checkout request saved.'));

    checkoutReady(null);
    refresh();
  }

  return { API, csrfToken, dollarsToCents, idempotencyKey,
    validatedCheckoutUrl, checkoutNeedsRetry, checkoutIntentIsCurrent,
    subscriptionIsVerifiedActive, clearCompletedCheckout,
    retryExpiredCheckout, validateAssetWorkbook, assetRequest, saveDownload,
    clearAssetPreview, assetFailureMessage, request, init };
});
