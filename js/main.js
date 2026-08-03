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
     CONTACT FORM — validation & submission
     ============================================================ */
  var form = document.getElementById('contact-form');

  if (form) {
    var nameInput    = document.getElementById('contact-name');
    var emailInput   = document.getElementById('contact-email');
    var messageInput = document.getElementById('contact-message');
    var submitBtn    = form.querySelector('[type="submit"]');
    var btnText      = form.querySelector('.btn-text');
    var btnLoading   = form.querySelector('.btn-loading');
    var successMsg   = document.getElementById('form-success');

    function showError(input, errorId, message) {
      var errorEl = document.getElementById(errorId);
      if (input) input.classList.add('error');
      if (errorEl) errorEl.textContent = message;
    }

    function clearError(input, errorId) {
      var errorEl = document.getElementById(errorId);
      if (input) input.classList.remove('error');
      if (errorEl) errorEl.textContent = '';
    }

    function validateEmail(val) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    }

    function validateForm() {
      var valid = true;

      clearError(nameInput, 'contact-name-error');
      clearError(emailInput, 'contact-email-error');
      clearError(messageInput, 'contact-message-error');

      if (!nameInput.value.trim()) {
        showError(nameInput, 'contact-name-error', 'Please enter your name.');
        valid = false;
      }

      if (!emailInput.value.trim()) {
        showError(emailInput, 'contact-email-error', 'Please enter your email address.');
        valid = false;
      } else if (!validateEmail(emailInput.value.trim())) {
        showError(emailInput, 'contact-email-error', 'Please enter a valid email address.');
        valid = false;
      }

      if (!messageInput.value.trim()) {
        showError(messageInput, 'contact-message-error', 'Please tell us about your organization.');
        valid = false;
      }

      return valid;
    }

    // Real-time validation on blur
    [nameInput, emailInput, messageInput].forEach(function (input) {
      if (!input) return;
      input.addEventListener('blur', function () {
        validateForm();
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!validateForm()) {
        // Focus first error field
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Simulate submission (no backend yet — show success state)
      submitBtn.disabled = true;
      if (btnText) btnText.hidden = true;
      if (btnLoading) btnLoading.hidden = false;

      setTimeout(function () {
        submitBtn.disabled = false;
        if (btnText) btnText.hidden = false;
        if (btnLoading) btnLoading.hidden = true;

        form.reset();
        if (successMsg) {
          successMsg.hidden = false;
          successMsg.focus();
        }
      }, 1200);
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

})();
