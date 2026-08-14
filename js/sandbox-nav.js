/**
 * sandbox-nav.js — Nexus sandbox department tab navigation
 * Initialises tab switching, keyboard navigation, and scroll affordance
 * for the sandbox department nav.
 */
(function () {
  'use strict';

  /**
   * Initialise sandbox navigation.
   * Exported as `window.initSandboxNav` so tests can call it directly.
   *
   * @param {Object} [opts]
   * @param {Element} [opts.navEl]       - the <nav role="tablist"> element
   * @param {Element} [opts.navWrapEl]   - wrapping div with overflow affordance
   * @param {NodeList|Array} [opts.navBtns] - tab buttons
   * @param {NodeList|Array} [opts.views]   - tabpanel elements
   */
  function initSandboxNav(opts) {
    var navEl    = (opts && opts.navEl)    || document.getElementById('sandbox-nav');
    var navWrap  = (opts && opts.navWrapEl)|| document.getElementById('sandbox-nav-wrap');
    var navBtns  = (opts && opts.navBtns)  || document.querySelectorAll('.sandbox-nav-btn');
    var views    = (opts && opts.views)    || document.querySelectorAll('.sandbox-view');

    if (!navEl || !navBtns.length) return;

    /** Show the panel for viewKey, update ARIA and active classes. */
    function showView(viewKey) {
      navBtns.forEach(function (b) {
        var active = b.getAttribute('data-view') === viewKey;
        b.classList.toggle('active', active);
        b.setAttribute('aria-selected', active ? 'true' : 'false');
        b.setAttribute('tabindex', active ? '0' : '-1');
      });
      views.forEach(function (v) {
        v.classList.toggle('active', v.getAttribute('data-view') === viewKey);
      });
    }

    /** Arrow-key / Home / End keyboard navigation. */
    navEl.addEventListener('keydown', function (e) {
      var tabs = Array.prototype.slice.call(navBtns);
      var currentIndex = -1;
      tabs.forEach(function (b, i) {
        if (b.getAttribute('aria-selected') === 'true') currentIndex = i;
      });
      var nextIndex = -1;
      if (e.key === 'ArrowRight') {
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === 'ArrowLeft') {
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === 'Home') {
        nextIndex = 0;
      } else if (e.key === 'End') {
        nextIndex = tabs.length - 1;
      }
      if (nextIndex !== -1) {
        e.preventDefault();
        showView(tabs[nextIndex].getAttribute('data-view'));
        tabs[nextIndex].focus();
      }
    });

    /** Click handler. */
    navBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        showView(btn.getAttribute('data-view'));
      });
    });

    /** Overflow fade affordance — hide when not scrollable. */
    function updateNavOverflow() {
      if (!navWrap || !navEl) return;
      var overflowing = navEl.scrollWidth > navEl.clientWidth;
      navWrap.classList.toggle('no-overflow', !overflowing);
    }
    updateNavOverflow();
    navEl.addEventListener('scroll', updateNavOverflow);
    window.addEventListener('resize', updateNavOverflow);

    return { showView: showView };
  }

  // Auto-init when loaded as a regular script
  if (typeof window !== 'undefined') {
    window.initSandboxNav = initSandboxNav;
  }

  // CommonJS export for Jest tests
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { initSandboxNav: initSandboxNav };
  }
})();
