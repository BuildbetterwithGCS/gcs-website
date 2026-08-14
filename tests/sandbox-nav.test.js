'use strict';

/**
 * Acceptance tests for the Nexus sandbox department navigation.
 *
 * Tests verify:
 * 1. All implemented department tabs are present and selectable
 * 2. Only the active department receives the active/aria-selected state
 * 3. Clicking each department tab switches the displayed content
 * 4. Keyboard navigation (ArrowLeft/ArrowRight/Home/End) works
 * 5. Navigation remains present after switching departments
 * 6. Synthetic-data disclosure is present
 */

const { initSandboxNav } = require('../js/sandbox-nav.js');

// All departments implemented in the sandbox
const DEPARTMENTS = [
  'executive',
  'finance',
  'hr',
  'safety',
  'risk',
  'facilities',
  'fleet',
  'projects',
  'procurement',
  'logistics',
  'reports',
];

/**
 * Build a minimal DOM with a tablist and tabpanels matching the sandbox.
 */
function buildDOM() {
  document.body.innerHTML = '';

  // nav wrapper
  const wrap = document.createElement('div');
  wrap.id = 'sandbox-nav-wrap';
  wrap.className = 'sandbox-nav-wrap';

  // nav tablist
  const nav = document.createElement('nav');
  nav.id = 'sandbox-nav';
  nav.setAttribute('role', 'tablist');
  nav.setAttribute('aria-label', 'Nexus department navigation');

  DEPARTMENTS.forEach(function (dept, i) {
    const btn = document.createElement('button');
    btn.className = 'sandbox-nav-btn' + (i === 0 ? ' active' : '');
    btn.type = 'button';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-controls', 'view-' + dept);
    btn.id = 'tab-' + dept;
    btn.setAttribute('tabindex', i === 0 ? '0' : '-1');
    btn.setAttribute('data-view', dept);
    btn.textContent = dept;
    nav.appendChild(btn);
  });

  wrap.appendChild(nav);
  document.body.appendChild(wrap);

  // tabpanels
  const body = document.createElement('div');
  body.className = 'sandbox-body';

  DEPARTMENTS.forEach(function (dept, i) {
    const panel = document.createElement('div');
    panel.className = 'sandbox-view' + (i === 0 ? ' active' : '');
    panel.setAttribute('role', 'tabpanel');
    panel.id = 'view-' + dept;
    panel.setAttribute('aria-labelledby', 'tab-' + dept);
    panel.setAttribute('data-view', dept);
    panel.textContent = dept + ' content';
    body.appendChild(panel);
  });

  document.body.appendChild(body);
}

/** Fire a keyboard event on an element. */
function fireKey(el, key) {
  const e = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  el.dispatchEvent(e);
  return e;
}

// ─────────────────────────────────────────────────────────
// SETUP: rebuild DOM and init nav before each test
// ─────────────────────────────────────────────────────────

beforeEach(function () {
  buildDOM();
  initSandboxNav();
});

afterEach(function () {
  document.body.innerHTML = '';
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 1: Every department has a visible tab control
// ─────────────────────────────────────────────────────────

describe('Department tab controls are present', function () {
  DEPARTMENTS.forEach(function (dept) {
    test('tab for "' + dept + '" exists', function () {
      const tab = document.getElementById('tab-' + dept);
      expect(tab).not.toBeNull();
      expect(tab.getAttribute('role')).toBe('tab');
      expect(tab.getAttribute('data-view')).toBe(dept);
    });
  });

  test('tablist role is present on nav element', function () {
    const nav = document.getElementById('sandbox-nav');
    expect(nav).not.toBeNull();
    expect(nav.getAttribute('role')).toBe('tablist');
  });

  test('all ' + DEPARTMENTS.length + ' tabs exist in the tablist', function () {
    const tabs = document.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(DEPARTMENTS.length);
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 2: Only the selected tab receives active state
// ─────────────────────────────────────────────────────────

describe('Active state — only one tab is selected at a time', function () {
  DEPARTMENTS.forEach(function (dept) {
    test('clicking "' + dept + '" makes only that tab active', function () {
      const tab = document.getElementById('tab-' + dept);
      tab.click();

      const selectedTabs = document.querySelectorAll('[aria-selected="true"]');
      expect(selectedTabs.length).toBe(1);
      expect(selectedTabs[0].getAttribute('data-view')).toBe(dept);
    });
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 3: Clicking a tab switches displayed content
// ─────────────────────────────────────────────────────────

describe('Clicking a department tab switches content', function () {
  DEPARTMENTS.forEach(function (dept) {
    test('clicking "' + dept + '" shows its panel', function () {
      const tab = document.getElementById('tab-' + dept);
      tab.click();

      const panel = document.getElementById('view-' + dept);
      expect(panel.classList.contains('active')).toBe(true);
    });

    test('clicking "' + dept + '" hides all other panels', function () {
      const tab = document.getElementById('tab-' + dept);
      tab.click();

      DEPARTMENTS.forEach(function (other) {
        if (other === dept) return;
        const otherPanel = document.getElementById('view-' + other);
        expect(otherPanel.classList.contains('active')).toBe(false);
      });
    });
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 4: Keyboard navigation
// ─────────────────────────────────────────────────────────

describe('Keyboard navigation', function () {
  test('ArrowRight moves to next tab', function () {
    // Start on executive (index 0)
    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'ArrowRight');

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[1]);
  });

  test('ArrowLeft moves to previous tab', function () {
    // Start on executive, move right to finance, then back
    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'ArrowRight'); // → finance
    fireKey(nav, 'ArrowLeft'); // → executive

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[0]);
  });

  test('ArrowLeft on first tab wraps to last tab', function () {
    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'ArrowLeft'); // wrap to last

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[DEPARTMENTS.length - 1]);
  });

  test('ArrowRight on last tab wraps to first tab', function () {
    // Navigate to the last tab first
    const lastTab = document.getElementById('tab-' + DEPARTMENTS[DEPARTMENTS.length - 1]);
    lastTab.click();

    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'ArrowRight'); // wrap to first

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[0]);
  });

  test('Home key moves to first tab', function () {
    // Move to last tab first
    const lastTab = document.getElementById('tab-' + DEPARTMENTS[DEPARTMENTS.length - 1]);
    lastTab.click();

    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'Home');

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[0]);
  });

  test('End key moves to last tab', function () {
    const nav = document.getElementById('sandbox-nav');
    fireKey(nav, 'End');

    const selected = document.querySelector('[aria-selected="true"]');
    expect(selected.getAttribute('data-view')).toBe(DEPARTMENTS[DEPARTMENTS.length - 1]);
  });

  test('active tab has tabindex 0; others have tabindex -1', function () {
    const financeTab = document.getElementById('tab-finance');
    financeTab.click();

    DEPARTMENTS.forEach(function (dept) {
      const tab = document.getElementById('tab-' + dept);
      if (dept === 'finance') {
        expect(tab.getAttribute('tabindex')).toBe('0');
      } else {
        expect(tab.getAttribute('tabindex')).toBe('-1');
      }
    });
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 5: Navigation remains present after switching
// ─────────────────────────────────────────────────────────

describe('Navigation persists after switching departments', function () {
  test('nav element still exists after several tab switches', function () {
    ['finance', 'facilities', 'hr', 'executive'].forEach(function (dept) {
      document.getElementById('tab-' + dept).click();
    });
    const nav = document.getElementById('sandbox-nav');
    expect(nav).not.toBeNull();
    const tabs = document.querySelectorAll('[role="tab"]');
    expect(tabs.length).toBe(DEPARTMENTS.length);
  });
});

// ─────────────────────────────────────────────────────────
// TEST SUITE 6: Synthetic-data disclosure present in HTML
// ─────────────────────────────────────────────────────────

describe('Synthetic-data disclosure', function () {
  test('sandbox HTML contains synthetic data disclosure text', function () {
    const fs = require('fs');
    const path = require('path');
    const html = fs.readFileSync(
      path.join(__dirname, '../sandbox/index.html'),
      'utf8'
    );
    expect(html).toMatch(/SYNTHETIC DATA/i);
    expect(html).toMatch(/fictional/i);
  });
});
