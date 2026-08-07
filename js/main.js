/**
 * GCS — General Contractor Solutions LLC
 * main.js — Site interactions
 */

(function () {
  'use strict';

  /* ============================================================
     UTILITIES
     ============================================================ */

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.from((context || document).querySelectorAll(selector));
  }

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  var yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     NAVIGATION — scroll state
     ============================================================ */
  var header = $('.site-header');

  function updateHeader() {
    if (!header) return;
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();

  /* ============================================================
     NAVIGATION — mobile toggle
     ============================================================ */
  var toggle = $('.nav__toggle');
  var navMenu = document.getElementById('nav-menu');

  if (toggle && navMenu) {
    toggle.addEventListener('click', function () {
      var expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      navMenu.classList.toggle('open', !expanded);
    });

    // Close menu when a nav link is clicked
    $$('.nav__link', navMenu).forEach(function (link) {
      link.addEventListener('click', function () {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navMenu.classList.contains('open')) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
        toggle.focus();
      }
    });

    // Close menu if clicking outside
    document.addEventListener('click', function (e) {
      if (
        navMenu.classList.contains('open') &&
        !navMenu.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        toggle.setAttribute('aria-expanded', 'false');
        navMenu.classList.remove('open');
      }
    });
  }

  /* ============================================================
     ACTIVE NAV LINK — intersection observer
     ============================================================ */
  var navLinks = $$('.nav__link[href^="#"]');
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href').slice(1);
      return document.getElementById(id);
    })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var id = entry.target.id;
        navLinks.forEach(function (link) {
          var matches = link.getAttribute('href') === '#' + id;
          link.classList.toggle('active', matches);
        });
      });
    }, observerOptions);

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }


  /* ============================================================
     SCROLL ANIMATIONS — fade-in on scroll
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var animateEls = $$(
      '.service-card, .industry-card, .value-card, .nexus-module, .reference-card, .founder-card'
    );

    // Add initial state
    animateEls.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease ' + (i % 3) * 80 + 'ms, transform 0.5s ease ' + (i % 3) * 80 + 'ms';
    });

    var fadeObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            fadeObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateEls.forEach(function (el) {
      fadeObserver.observe(el);
    });
  }

  /* ============================================================
     REVEAL ON SCROLL — .reveal elements
     ============================================================ */
  if ('IntersectionObserver' in window) {
    var revealEls = $$('.reveal');
    if (revealEls.length) {
      var revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
      );
      revealEls.forEach(function (el) { revealObserver.observe(el); });
    }
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ============================================================
     TABS — Nexus dashboard and any [data-tabs] component
     ============================================================ */
  $$('[data-tabs]').forEach(function (root) {
    var tabs   = Array.prototype.slice.call(root.querySelectorAll('.tabs__tab'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('.tabs__panel'));
    if (!tabs.length) return;

    function activate(index, setFocus) {
      tabs.forEach(function (tab, i) {
        var selected = i === index;
        tab.setAttribute('aria-selected', selected ? 'true' : 'false');
        tab.setAttribute('tabindex', selected ? '0' : '-1');
        tab.classList.toggle('is-active', selected);
      });
      panels.forEach(function (panel, i) {
        if (i === index) {
          panel.removeAttribute('hidden');
          panel.classList.add('is-active');
        } else {
          panel.setAttribute('hidden', '');
          panel.classList.remove('is-active');
        }
      });
      if (setFocus && tabs[index]) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activate(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) {
          e.preventDefault();
          activate(next, true);
        }
      });
    });

    var initial = tabs.findIndex
      ? tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; })
      : -1;
    activate(initial > -1 ? initial : 0, false);
  });

  /* ============================================================
     MAP INTELLIGENCE — layer toggles, filters, pin selection
     ============================================================ */
  var mapStage = $('.map-stage');

  if (mapStage) {
    var layerInputs = $$('.layer-toggle input[data-layer]');
    var pins        = $$('.map-pin');
    var detailRoot  = $('[data-map-detail]');
    var detailEmpty = $('[data-detail-empty]');
    var records     = $$('[data-detail]');
    var filters     = $$('[data-filter]');
    var resetBtn    = $('[data-map-reset]');

    // Map a pin kind to the condition band shown on its chip
    var conditionOf = {};
    records.forEach(function (rec) {
      var chip = rec.querySelector('.chip');
      var band = 'good';
      if (chip) {
        if (chip.classList.contains('chip--risk')) band = 'risk';
        else if (chip.classList.contains('chip--warn')) band = 'warn';
      }
      conditionOf[rec.getAttribute('data-detail')] = band;
    });

    function setLayer(key, on) {
      $$('[data-layer-group="' + key + '"]').forEach(function (group) {
        if (on) group.removeAttribute('hidden');
        else group.setAttribute('hidden', '');
      });
      // Zones layer follows the risk switch
      if (key === 'risk') {
        $$('[data-layer-group="zones"]').forEach(function (group) {
          if (on) group.removeAttribute('hidden');
          else group.setAttribute('hidden', '');
        });
      }
    }

    layerInputs.forEach(function (input) {
      setLayer(input.getAttribute('data-layer'), input.checked);
      input.addEventListener('change', function () {
        setLayer(input.getAttribute('data-layer'), input.checked);
      });
    });

    function applyFilters() {
      var condition = 'all';
      var category  = 'all';
      filters.forEach(function (sel) {
        if (sel.getAttribute('data-filter') === 'condition') condition = sel.value;
        if (sel.getAttribute('data-filter') === 'category') category = sel.value;
      });

      pins.forEach(function (pin) {
        var id   = pin.getAttribute('data-pin');
        var kind = pin.getAttribute('data-kind');
        var band = conditionOf[id] || 'good';
        var match = (condition === 'all' || condition === band) &&
                    (category === 'all' || category === kind);
        pin.classList.toggle('is-dimmed', !match);
      });
    }

    filters.forEach(function (sel) { sel.addEventListener('change', applyFilters); });

    function showRecord(id) {
      records.forEach(function (rec) {
        if (rec.getAttribute('data-detail') === id) rec.removeAttribute('hidden');
        else rec.setAttribute('hidden', '');
      });
      if (detailEmpty) detailEmpty.setAttribute('hidden', '');
      pins.forEach(function (pin) {
        pin.classList.toggle('is-active', pin.getAttribute('data-pin') === id);
      });
    }

    function clearRecord() {
      records.forEach(function (rec) { rec.setAttribute('hidden', ''); });
      if (detailEmpty) detailEmpty.removeAttribute('hidden');
      pins.forEach(function (pin) { pin.classList.remove('is-active'); });
    }

    pins.forEach(function (pin) {
      pin.addEventListener('click', function () {
        var id = pin.getAttribute('data-pin');
        if (pin.classList.contains('is-active')) clearRecord();
        else showRecord(id);
      });
    });

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        layerInputs.forEach(function (input) {
          var on = input.getAttribute('data-layer') !== 'fiber';
          input.checked = on;
          setLayer(input.getAttribute('data-layer'), on);
        });
        filters.forEach(function (sel) { sel.value = 'all'; });
        applyFilters();
        clearRecord();
      });
    }

    applyFilters();
  }

  /* ============================================================
     COMMAND CENTER — local-only queue actions
     ============================================================ */
  $$('[data-queue]').forEach(function (queue) {
    queue.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-queue-action]');
      if (!btn) return;

      var item = btn.closest('.queue__item');
      if (!item || item.classList.contains('is-resolved')) return;

      var action = btn.getAttribute('data-queue-action');
      item.classList.add('is-resolved');

      var actions = item.querySelector('.queue__actions');
      if (actions) actions.setAttribute('hidden', '');

      var result = document.createElement('p');
      result.className = 'queue__result';
      result.setAttribute('role', 'status');
      result.textContent = action + ' — recorded in this browser only. This demonstration does not transmit anything.';
      item.appendChild(result);
    });
  });

  /* ============================================================
     HONEST FORMS — client-side validation, no server submission
     ============================================================ */
  function labelFor(field, form) {
    var id = field.id;
    var lbl = id ? form.querySelector('label[for="' + id + '"]') : null;
    if (!lbl) return field.name || 'Field';
    return lbl.textContent.replace(/\*/g, '').replace(/\(optional\)/gi, '').trim();
  }

  function isEmail(val) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  $$('[data-honest-form]').forEach(function (form) {
    var result    = form.parentNode.querySelector('[data-form-result]');
    var summaryEl = result ? result.querySelector('[data-form-summary]') : null;
    var mailtoEl  = result ? result.querySelector('[data-form-mailto]') : null;
    var copyBtn   = result ? result.querySelector('[data-form-copy]') : null;
    var editBtn   = result ? result.querySelector('[data-form-reset]') : null;
    var kind      = form.getAttribute('data-form-kind') || 'Inquiry';

    function setError(field, message) {
      var errEl = field.getAttribute('aria-describedby');
      var target = null;
      if (errEl) {
        errEl.split(/\s+/).forEach(function (id) {
          var el = document.getElementById(id);
          if (el && el.classList.contains('form-error')) target = el;
        });
      }
      if (message) {
        field.classList.add('error');
        field.setAttribute('aria-invalid', 'true');
        if (target) target.textContent = message;
      } else {
        field.classList.remove('error');
        field.removeAttribute('aria-invalid');
        if (target) target.textContent = '';
      }
    }

    function validate() {
      var firstBad = null;
      $$('[required]', form).forEach(function (field) {
        var value = (field.value || '').trim();
        var message = '';
        if (!value) {
          message = 'Please complete this field.';
        } else if (field.type === 'email' && !isEmail(value)) {
          message = 'Please enter a valid email address.';
        } else if (field.tagName === 'TEXTAREA' && value.length < 20) {
          message = 'Please add a little more detail — at least a sentence or two.';
        }
        setError(field, message);
        if (message && !firstBad) firstBad = field;
      });
      return firstBad;
    }

    $$('[required]', form).forEach(function (field) {
      field.addEventListener('blur', function () {
        var value = (field.value || '').trim();
        if (!value) return;
        if (field.type === 'email' && !isEmail(value)) {
          setError(field, 'Please enter a valid email address.');
        } else {
          setError(field, '');
        }
      });
      field.addEventListener('input', function () {
        if (field.classList.contains('error') && (field.value || '').trim()) setError(field, '');
      });
    });

    function buildSummary() {
      var lines = [kind + ' — prepared from buildbetterwithgcs.com', ''];

      $$('input, select, textarea', form).forEach(function (field) {
        if (field.type === 'checkbox' || field.type === 'radio') return;
        var value = (field.value || '').trim();
        if (!value) return;
        lines.push(labelFor(field, form) + ': ' + value);
      });

      var checked = $$('input[type="checkbox"]:checked', form).map(function (cb) {
        var span = cb.parentNode.querySelector('span');
        return span ? span.textContent.trim() : cb.value;
      });
      if (checked.length) lines.push('Areas of interest: ' + checked.join(', '));

      var radio = form.querySelector('input[type="radio"]:checked');
      if (radio) lines.push('Timing: ' + radio.value);

      return lines.join('\n');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var firstBad = validate();
      if (firstBad) {
        firstBad.focus();
        if (result) result.setAttribute('hidden', '');
        return;
      }

      var summary = buildSummary();
      if (summaryEl) summaryEl.textContent = summary;

      if (mailtoEl) {
        mailtoEl.setAttribute(
          'href',
          'mailto:info@buildbetterwithgcs.com?subject=' +
            encodeURIComponent('GCS — ' + kind) +
            '&body=' + encodeURIComponent(summary)
        );
      }

      if (result) {
        result.removeAttribute('hidden');
        result.focus();
        if (typeof result.scrollIntoView === 'function') {
          result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });

    if (copyBtn) {
      copyBtn.addEventListener('click', function () {
        var text = summaryEl ? summaryEl.textContent : '';
        var done = function () {
          var original = copyBtn.textContent;
          copyBtn.textContent = 'Copied';
          setTimeout(function () { copyBtn.textContent = original; }, 1800);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, function () {});
        } else {
          var ta = document.createElement('textarea');
          ta.value = text;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand('copy'); done(); } catch (err) {}
          document.body.removeChild(ta);
        }
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', function () {
        if (result) result.setAttribute('hidden', '');
        var first = form.querySelector('input, select, textarea');
        if (first) first.focus();
      });
    }
  });

})();
