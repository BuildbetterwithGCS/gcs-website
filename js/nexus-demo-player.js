/**
 * nexus-demo-player.js
 * GCS Nexus — Narrated Demo Player
 *
 * Adds a "Watch Demo" experience to the Nexus sandbox.
 * Uses Web Speech API for narration — no external audio files or API keys required.
 * Structured so pre-recorded MP3 narration can replace speech synthesis later.
 *
 * All data is synthetic. No real organizations or individuals represented.
 */
(function () {
  'use strict';

  /* ============================================================
     DEMO SCENES
     Each scene: { id, title, dept, narration, caption, duration, action, highlight }
     dept: data-view value to activate that tab, or null to stay on current
     action: function(done) — called at scene start, call done() when UI action completes
     highlight: CSS selector of element to pulse-highlight, or null
     duration: milliseconds to display this scene (narration takes precedence)
  ============================================================ */

  var SCENES = [
    // ── Introduction ──────────────────────────────────────────────
    {
      id: 'intro',
      title: 'Welcome to Nexus',
      dept: 'executive',
      narration: 'Welcome to GCS Nexus — the operational intelligence platform built for local government and public-sector organizations. In the next few minutes, you\'ll see how Nexus connects every department, surfaces the issues that matter most, and turns operational information into action and measurable value.',
      caption: 'Welcome to GCS Nexus — operational intelligence for local government.',
      duration: 9000,
      action: null,
      highlight: null
    },

    // ── Executive Overview ────────────────────────────────────────
    {
      id: 'exec-kpis',
      title: 'Executive Overview — KPIs',
      dept: 'executive',
      narration: 'The Executive Dashboard opens to a single view across the entire organization. Budget utilization, open work orders, workforce capacity, and risk items — all in one place, always current.',
      caption: 'Executive Dashboard: organization-wide KPIs at a glance.',
      duration: 7000,
      action: null,
      highlight: '.dash-kpi-grid'
    },
    {
      id: 'exec-drill',
      title: 'Executive Overview — KPI Drill-Down',
      dept: 'executive',
      narration: 'A leader notices 31 open risk items, four rated high priority. One tap opens the drill-down. Nexus shows which risks have been open the longest, names the recommended action, and estimates the financial exposure if left unaddressed.',
      caption: 'Tap any KPI to see the full picture — context, cause, and recommended action.',
      duration: 8000,
      action: function (done) {
        var card = document.querySelector('[data-kpi-key="risk-open"]');
        if (card) {
          highlightElement(card);
          setTimeout(function () {
            if (window.NexusInteractive) window.NexusInteractive.renderKpiDetail('risk-open');
            done();
          }, 900);
        } else { done(); }
      },
      highlight: null
    },
    {
      id: 'exec-alerts',
      title: 'Executive Overview — Priority Alerts',
      dept: 'executive',
      narration: 'Below the KPIs, Nexus surfaces the four items currently requiring executive attention. Instead of searching through separate systems, leaders drill directly into the underlying operational record, understand the cause, assign action, and track the outcome.',
      caption: 'Priority alerts let executives act without leaving the dashboard.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        setTimeout(function () {
          var row = document.querySelector('#view-executive .dash-expand-row');
          if (row) {
            highlightElement(row);
            setTimeout(function () { row.click(); done(); }, 700);
          } else { done(); }
        }, 400);
      },
      highlight: null
    },

    // ── Finance ───────────────────────────────────────────────────
    {
      id: 'finance-overview',
      title: 'Finance — Budget & Revenue',
      dept: 'finance',
      narration: 'The Finance view shows the full budget picture. Revenue collected is running six percent above prior year. Accounts payable has fourteen invoices past thirty days — two of them flagging strategic vendors. Nexus identifies the risk before it affects contract negotiations.',
      caption: 'Finance: budget utilization, revenue, and AP aging in one view.',
      duration: 8000,
      action: function (done) {
        switchTab('finance', done);
      },
      highlight: '[data-kpi-key="fin-ap"]'
    },
    {
      id: 'finance-ap',
      title: 'Finance — AP Drill-Down',
      dept: 'finance',
      narration: 'Opening the Accounts Payable KPI reveals the six invoices that are forty-five or more days overdue. Nexus recommends immediate processing and notes that timely payment protects fourteen thousand dollars in annual preferred-vendor discounts.',
      caption: 'AP drill-down: overdue invoices, vendor risk, and recommended action.',
      duration: 7000,
      action: function (done) {
        var card = document.querySelector('[data-kpi-key="fin-ap"]');
        if (card) {
          highlightElement(card);
          setTimeout(function () {
            if (window.NexusInteractive) window.NexusInteractive.renderKpiDetail('fin-ap');
            done();
          }, 700);
        } else { done(); }
      },
      highlight: null
    },

    // ── HR / Workforce ────────────────────────────────────────────
    {
      id: 'hr-overview',
      title: 'HR & Workforce',
      dept: 'hr',
      narration: 'HR and Workforce shows total headcount at three hundred eighty-four, with twenty-seven open positions — nine of them critical. Average time to fill is fifty-two days. Nexus estimates that filling the five most critical roles reduces overtime exposure by twenty-two thousand dollars per month.',
      caption: 'HR & Workforce: headcount, open positions, and capacity pressure.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('hr', done);
      },
      highlight: '[data-kpi-key="hr-openpos"]'
    },
    {
      id: 'hr-filter',
      title: 'HR — Critical Items Filter',
      dept: 'hr',
      narration: 'Using the filter, a manager narrows the list to critical and overdue items only. Nexus instantly surfaces the three issues that require immediate action — compliance filings, outstanding performance reviews, and training renewals.',
      caption: 'One-click filters surface only what needs your attention.',
      duration: 7000,
      action: function (done) {
        var btn = document.querySelector('.nx-filter-btn[data-filter-val="critical"]');
        if (btn) {
          highlightElement(btn);
          setTimeout(function () { btn.click(); done(); }, 700);
        } else { done(); }
      },
      highlight: null
    },

    // ── Safety / Risk ─────────────────────────────────────────────
    {
      id: 'safety-overview',
      title: 'Safety & Risk',
      dept: 'safety',
      narration: 'Safety shows seven recordable incidents year-to-date — a forty-two percent reduction from the prior year. But fourteen near-miss reports are open, and three remain unresolved in Building 3. Near misses are leading indicators. Nexus flags them before they become incidents.',
      caption: 'Safety: incidents, near misses, and corrective actions.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        resetFilter();
        switchTab('safety', done);
      },
      highlight: '[data-kpi-key="safety-nearmiss"]'
    },
    {
      id: 'risk-overview',
      title: 'Risk & Compliance',
      dept: 'risk',
      narration: 'The Risk and Compliance view shows thirty-one open items. Two rated high have been open more than thirty days without a named owner or mitigation plan. A water main segment at critical condition and a data privacy compliance gap. Both require executive action this week.',
      caption: 'Risk & Compliance: unmitigated risks, compliance gaps, open items.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('risk', done);
      },
      highlight: null
    },

    // ── Facilities ────────────────────────────────────────────────
    {
      id: 'facilities-overview',
      title: 'Facilities',
      dept: 'facilities',
      narration: 'Facilities manages twenty-three buildings. Three have condition scores below forty out of a hundred — the threshold for emergency capital consideration. All three have been deferred from the capital plan for over two years.',
      caption: 'Facilities: building conditions, work orders, and capital needs.',
      duration: 7000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('facilities', done);
      },
      highlight: '[data-kpi-key="fac-total"]'
    },
    {
      id: 'facilities-wo',
      title: 'Facilities — Work Order Action',
      dept: 'facilities',
      narration: 'Building 4 has a roof condition score of twenty-eight. Nexus recommends advancing it to capital priority and estimates that early intervention saves three hundred forty thousand dollars compared to emergency replacement. A work order can be created and assigned directly from this view.',
      caption: 'From insight to action: create a work order without leaving Nexus.',
      duration: 8000,
      action: function (done) {
        var row = document.querySelector('#view-facilities .dash-expand-row');
        if (row) {
          highlightElement(row);
          setTimeout(function () {
            row.click();
            setTimeout(function () {
              var woBtn = document.querySelector('.nx-action-btn[data-action="create-wo"]');
              if (woBtn) {
                highlightElement(woBtn);
                setTimeout(function () { woBtn.click(); done(); }, 600);
              } else { done(); }
            }, 800);
          }, 700);
        } else { done(); }
      },
      highlight: null
    },

    // ── Fleet ─────────────────────────────────────────────────────
    {
      id: 'fleet-overview',
      title: 'Fleet & Assets',
      dept: 'fleet',
      narration: 'Fleet shows eighty-seven units. Eight are currently down for maintenance. Unit A-14 has been in repair for eighteen days — parts delay. Nexus has already run a lease-versus-purchase analysis and flagged the vehicle for replacement review, projecting forty-two hundred dollars in annual savings.',
      caption: 'Fleet: unit status, maintenance costs, and replacement recommendations.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('fleet', done);
      },
      highlight: '[data-kpi-key="fleet-serviceable"]'
    },

    // ── Projects ──────────────────────────────────────────────────
    {
      id: 'projects-overview',
      title: 'Capital Projects',
      dept: 'projects',
      narration: 'Projects tracks twenty-four active capital and operational projects. The community center renovation is three weeks behind schedule. A subcontractor staffing shortage is the root cause. Nexus shows the recovery plan adds forty-two thousand dollars to the budget and recommends executive sponsor escalation this week.',
      caption: 'Projects: schedule, budget, root cause, and escalation paths.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('projects', done);
      },
      highlight: '[data-kpi-key="proj-active"]'
    },
    {
      id: 'projects-drill',
      title: 'Projects — Delayed Project',
      dept: 'projects',
      narration: 'Opening the community center record shows the full project context — schedule status, cost to date, root cause analysis, and the recommended next action. The executive can assign an escalation directly from Nexus without opening a separate project management system.',
      caption: 'Project drill-down: status, cost, cause, and corrective action.',
      duration: 8000,
      action: function (done) {
        var delayRow = document.querySelector('#view-projects .dash-expand-row');
        if (delayRow) {
          highlightElement(delayRow);
          setTimeout(function () {
            delayRow.click();
            setTimeout(function () {
              var escalateBtn = document.querySelector('.nx-action-btn[data-action="escalate"]');
              if (escalateBtn) highlightElement(escalateBtn);
              done();
            }, 800);
          }, 700);
        } else { done(); }
      },
      highlight: null
    },

    // ── Procurement ───────────────────────────────────────────────
    {
      id: 'procurement-overview',
      title: 'Procurement',
      dept: 'procurement',
      narration: 'Procurement shows sixty-eight active purchase orders and eight point seven million in year-to-date spend. Nexus highlights three contracts expiring within sixty days and two that have compliance documentation gaps. Procurement staff can resolve issues before they become delays.',
      caption: 'Procurement: POs, spend, contract compliance, and expiring agreements.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('procurement', done);
      },
      highlight: '[data-kpi-key="proc-pos"]'
    },

    // ── IT & Data ─────────────────────────────────────────────────
    {
      id: 'it-overview',
      title: 'IT & Data',
      dept: 'it',
      narration: 'IT and Data surfaces a cybersecurity training gap affecting forty-three percent of staff — flagged as in-progress. Open work orders total fourteen. Nexus tracks data privacy compliance alongside operational IT issues in the same unified view.',
      caption: 'IT & Data: security posture, compliance gaps, and open tickets.',
      duration: 7000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('it', done);
      },
      highlight: null
    },

    // ── Map Intelligence ─────────────────────────────────────────
    {
      id: 'map-overview',
      title: 'Map Intelligence',
      dept: 'map',
      narration: 'Map Intelligence places every facility, project, risk item, and fleet asset on a live operational map. Leaders see Building 4 flagged in red — condition critical. The water main risk is pinned on the street where failure is most likely. Every item is clickable for full operational context.',
      caption: 'Map Intelligence: spatial view of facilities, projects, risks, and fleet.',
      duration: 8000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        switchTab('map', function () {
          setTimeout(function () {
            var pin = document.querySelector('.nx-map-pin[data-id="bldg-4"]');
            if (pin) {
              highlightElement(pin);
              setTimeout(function () { pin.click(); done(); }, 900);
            } else { done(); }
          }, 600);
        });
      },
      highlight: null
    },
    {
      id: 'map-risk',
      title: 'Map Intelligence — Risk Layer',
      dept: 'map',
      narration: 'Selecting the risk layer isolates infrastructure risk items. The water main segment at thirty-one out of a hundred condition is visible exactly where it runs. Nexus calculates that a planned replacement at one hundred eighty thousand dollars avoids an emergency response costing four hundred twenty thousand.',
      caption: 'Risk layer: see infrastructure risk geospatially with cost context.',
      duration: 8000,
      action: function (done) {
        var riskPin = document.querySelector('.nx-map-pin[data-id="risk-water"]');
        if (riskPin) {
          highlightElement(riskPin);
          setTimeout(function () { riskPin.click(); done(); }, 900);
        } else { done(); }
      },
      highlight: null
    },

    // ── Ask Nexus ────────────────────────────────────────────────
    {
      id: 'ask-nexus-open',
      title: 'Ask Nexus — AI Assistant',
      dept: null,
      narration: 'Ask Nexus is the organization\'s intelligence assistant. Available across every department, it answers plain-language questions about priorities, risks, financials, and operations — drawing on everything connected to the platform.',
      caption: 'Ask Nexus: natural language access to operational intelligence.',
      duration: 7000,
      action: function (done) {
        if (window.NexusInteractive) window.NexusInteractive.closeDrawer();
        setTimeout(function () {
          if (window.NexusInteractive) window.NexusInteractive.openAskNexus();
          done();
        }, 400);
      },
      highlight: null
    },
    {
      id: 'ask-nexus-question',
      title: 'Ask Nexus — Sample Question',
      dept: null,
      narration: 'A leader asks: what needs my attention today? Nexus responds within seconds with a prioritized summary drawn from every connected department — no search, no report, no waiting for a briefing.',
      caption: '"What needs my attention today?" — Nexus responds with a cross-department summary.',
      duration: 9000,
      action: function (done) {
        setTimeout(function () {
          var suggestBtn = document.querySelector('.nx-chat-suggest');
          if (suggestBtn) {
            highlightElement(suggestBtn);
            setTimeout(function () { suggestBtn.click(); done(); }, 800);
          } else {
            var input = document.querySelector('.nx-chat-input');
            var sendBtn = document.querySelector('.nx-chat-send');
            if (input && sendBtn) {
              input.value = 'What needs my attention today?';
              input.dispatchEvent(new Event('input'));
              setTimeout(function () { sendBtn.click(); done(); }, 700);
            } else { done(); }
          }
        }, 600);
      },
      highlight: null
    },

    // ── Cross-Department Intelligence ────────────────────────────
    {
      id: 'cross-dept',
      title: 'Cross-Department Intelligence',
      dept: 'executive',
      narration: 'Nexus connects every department in a single intelligence layer. When Facilities defers a capital repair, it surfaces in Safety as a near-miss risk, in Finance as a potential budget variance, and in Risk as an open item. Leadership sees the full picture — not department silos.',
      caption: 'Connected intelligence: one issue, every implication, one platform.',
      duration: 9000,
      action: function (done) {
        if (window.NexusInteractive) {
          window.NexusInteractive.closeDrawer();
          // Close Ask Nexus if open
          var panel = document.getElementById('ask-nexus-panel');
          if (panel && panel.classList.contains('open')) {
            var closeBtn = panel.querySelector('.nx-chat-close');
            if (closeBtn) closeBtn.click();
          }
        }
        switchTab('executive', done);
      },
      highlight: '.dash-kpi-grid'
    },

    // ── Know → Prove → Value ─────────────────────────────────────
    {
      id: 'value-framework',
      title: 'Know → Verify → Decide → Do → Prove → Value',
      dept: 'executive',
      narration: 'GCS Nexus is built around a single principle: operational information should produce intelligence, action, accountability, and measurable value. Know what is happening. Verify the facts. Decide what to do. Execute. Prove the outcome. Deliver value. That is what Nexus is built to do.',
      caption: 'Know → Verify → Decide → Do → Prove → Value. That is what Nexus is built to do.',
      duration: 10000,
      action: null,
      highlight: null
    },

    // ── Close ────────────────────────────────────────────────────
    {
      id: 'close',
      title: 'Explore Nexus Live',
      dept: 'executive',
      narration: 'That concludes the narrated walkthrough. The sandbox you see is fully interactive. Click any KPI, open any drill-down, use the filters, try Ask Nexus, or explore any department. No login, no account, and no email required. Thank you for your time.',
      caption: 'The sandbox is fully interactive. Explore freely — no login required.',
      duration: 9000,
      action: null,
      highlight: null
    }
  ];

  /* ============================================================
     PLAYER STATE
  ============================================================ */

  var state = {
    active: false,
    playing: false,
    currentIndex: 0,
    muted: false,
    captionsOn: true,
    speechSupported: false,
    utterance: null,
    sceneTimer: null,
    advanceTimer: null
  };

  /* ============================================================
     SPEECH SYNTHESIS
  ============================================================ */

  function initSpeech() {
    state.speechSupported = !!(window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined');
  }

  function getVoice() {
    if (!state.speechSupported) return null;
    var voices = window.speechSynthesis.getVoices();
    // Prefer natural US English
    var preferred = [
      'Samantha', 'Alex', 'Karen', 'Susan', 'Google US English',
      'Microsoft Aria Online (Natural)', 'Microsoft Guy Online (Natural)'
    ];
    for (var i = 0; i < preferred.length; i++) {
      for (var j = 0; j < voices.length; j++) {
        if (voices[j].name === preferred[i]) return voices[j];
      }
    }
    // Fall back to any en-US voice
    for (var k = 0; k < voices.length; k++) {
      if (voices[k].lang && voices[k].lang.indexOf('en') === 0) return voices[k];
    }
    return voices[0] || null;
  }

  function speak(text, onEnd) {
    if (!state.speechSupported || state.muted) {
      if (onEnd) onEnd();
      return;
    }
    try {
      window.speechSynthesis.cancel();
    } catch (e) { /* ignore */ }

    var utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.92;
    utter.pitch = 1.0;
    utter.volume = 1.0;

    var voice = getVoice();
    if (voice) utter.voice = voice;

    utter.onend = function () {
      if (state.playing && onEnd) onEnd();
    };
    utter.onerror = function (e) {
      // 'interrupted' is expected on cancel/pause — ignore
      if (e && e.error !== 'interrupted' && e.error !== 'canceled') {
        if (onEnd) onEnd();
      }
    };

    state.utterance = utter;

    // iOS Safari requires speech on the same tick as a user gesture.
    // We work around this by calling speak() only from user-initiated
    // playback flow. An initial no-op utterance is spoken on first Play.
    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      if (onEnd) onEnd();
    }
  }

  function stopSpeech() {
    state.utterance = null;
    if (state.speechSupported) {
      try { window.speechSynthesis.cancel(); } catch (e) { /* ignore */ }
    }
  }

  function pauseSpeech() {
    if (state.speechSupported) {
      try { window.speechSynthesis.pause(); } catch (e) { /* ignore */ }
    }
  }

  function resumeSpeech() {
    if (state.speechSupported) {
      try { window.speechSynthesis.resume(); } catch (e) { /* ignore */ }
    }
  }

  /* ============================================================
     HELPERS
  ============================================================ */

  function switchTab(viewKey, done) {
    var btn = document.querySelector('[data-view="' + viewKey + '"]');
    if (btn) {
      btn.click();
      setTimeout(done || function () {}, 300);
    } else {
      if (done) done();
    }
  }

  function resetFilter() {
    var allBtn = document.querySelector('.nx-filter-btn[data-filter-val="all"]');
    if (allBtn && !allBtn.classList.contains('active')) allBtn.click();
  }

  function highlightElement(el) {
    if (!el) return;
    el.classList.add('ndp-highlight');
    setTimeout(function () { el.classList.remove('ndp-highlight'); }, 2200);
  }

  /* ============================================================
     SCENE ENGINE
  ============================================================ */

  function clearTimers() {
    if (state.sceneTimer) { clearTimeout(state.sceneTimer); state.sceneTimer = null; }
    if (state.advanceTimer) { clearTimeout(state.advanceTimer); state.advanceTimer = null; }
  }

  function runScene(index) {
    if (index < 0 || index >= SCENES.length) return;
    clearTimers();
    stopSpeech();

    state.currentIndex = index;
    var scene = SCENES[index];

    // Switch department tab
    if (scene.dept) {
      var targetView = document.getElementById('view-' + scene.dept);
      var isActive = targetView && targetView.classList.contains('active');
      if (!isActive) {
        switchTab(scene.dept, function () { executeSceneContent(scene); });
      } else {
        executeSceneContent(scene);
      }
    } else {
      executeSceneContent(scene);
    }
  }

  function executeSceneContent(scene) {
    updatePlayerUI();

    // Scroll sandbox into view
    var sandboxEl = document.getElementById('sandbox-section') || document.querySelector('.sandbox-shell') || document.querySelector('.sandbox-dept-heading');
    if (sandboxEl) {
      sandboxEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Run the scene action
    if (scene.action) {
      scene.action(function () { afterAction(scene); });
    } else {
      afterAction(scene);
    }
  }

  function afterAction(scene) {
    if (!state.playing) return;

    // Highlight target element
    if (scene.highlight) {
      var el = document.querySelector(scene.highlight);
      if (el) highlightElement(el);
    }

    // Show caption
    showCaption(scene.caption);

    // Speak narration
    if (!state.muted && state.speechSupported) {
      speak(scene.narration, function () {
        if (state.playing) scheduleAdvance(800);
      });
      // Safety: advance after duration even if speech doesn't fire onend
      state.sceneTimer = setTimeout(function () {
        if (state.playing) scheduleAdvance(0);
      }, Math.max(scene.duration, 5000));
    } else {
      // No audio: advance after duration
      state.sceneTimer = setTimeout(function () {
        if (state.playing) scheduleAdvance(0);
      }, scene.duration);
    }
  }

  function scheduleAdvance(delay) {
    clearTimers();
    state.advanceTimer = setTimeout(function () {
      if (!state.playing) return;
      var next = state.currentIndex + 1;
      if (next < SCENES.length) {
        runScene(next);
      } else {
        // Demo finished
        state.playing = false;
        updatePlayerUI();
        showCaption('Demo complete. Tap Replay to watch again or Exit to explore Nexus interactively.');
      }
    }, delay);
  }

  /* ============================================================
     PLAYER CONTROLS
  ============================================================ */

  function play() {
    if (!state.active) return;
    state.playing = true;
    updatePlayerUI();

    // Warm up speech synthesis (required for iOS Safari first-gesture constraint)
    if (state.speechSupported && !state.muted) {
      try {
        var warmup = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(warmup);
      } catch (e) { /* ignore */ }
    }

    runScene(state.currentIndex);
  }

  function pause() {
    if (!state.active || !state.playing) return;
    state.playing = false;
    clearTimers();
    pauseSpeech();
    updatePlayerUI();
  }

  function resume() {
    if (!state.active || state.playing) return;
    state.playing = true;
    updatePlayerUI();

    // If speech was mid-utterance on iOS it may not resume reliably.
    // Re-run the current scene from scratch.
    resumeSpeech();
    if (!state.speechSupported || !window.speechSynthesis.speaking) {
      runScene(state.currentIndex);
    }
  }

  function replay() {
    state.playing = true;
    state.currentIndex = 0;
    clearTimers();
    stopSpeech();
    updatePlayerUI();

    // Reset UI state
    if (window.NexusInteractive) {
      window.NexusInteractive.closeDrawer();
      window.NexusInteractive.resetFilters();
    }
    // Close Ask Nexus if open
    var panel = document.getElementById('ask-nexus-panel');
    if (panel && panel.classList.contains('open')) {
      var closeBtn = panel.querySelector('.nx-chat-close');
      if (closeBtn) closeBtn.click();
    }

    play();
  }

  function prevScene() {
    var prev = state.currentIndex - 1;
    if (prev < 0) prev = 0;
    state.playing = true;
    clearTimers();
    stopSpeech();
    updatePlayerUI();
    runScene(prev);
  }

  function nextScene() {
    var next = state.currentIndex + 1;
    if (next >= SCENES.length) next = SCENES.length - 1;
    state.playing = true;
    clearTimers();
    stopSpeech();
    updatePlayerUI();
    runScene(next);
  }

  function toggleMute() {
    state.muted = !state.muted;
    if (state.muted) {
      stopSpeech();
    } else if (state.playing) {
      // Re-run current scene so narration starts
      runScene(state.currentIndex);
    }
    updatePlayerUI();
  }

  function toggleCaptions() {
    state.captionsOn = !state.captionsOn;
    var captionEl = document.getElementById('ndp-caption');
    if (captionEl) captionEl.style.display = state.captionsOn ? '' : 'none';
    updatePlayerUI();
  }

  function enterDemoMode() {
    if (state.active) return;
    state.active = true;
    state.playing = false;
    state.currentIndex = 0;
    state.muted = false;
    state.captionsOn = true;

    // Show player UI
    var player = document.getElementById('ndp-player');
    if (player) player.setAttribute('aria-hidden', 'false');
    if (player) player.classList.add('ndp-player--visible');

    // Hide Watch Demo button, show Exit
    var watchBtn = document.getElementById('ndp-watch-btn');
    if (watchBtn) watchBtn.style.display = 'none';

    // Scroll to sandbox
    var sandboxEl = document.querySelector('.sandbox-shell') || document.querySelector('.sandbox-dept-heading') || document.getElementById('sandbox-section');
    if (sandboxEl) sandboxEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    updatePlayerUI();
    showCaption('Tap Play to start the narrated walkthrough.');
  }

  function exitDemoMode() {
    state.active = false;
    state.playing = false;
    clearTimers();
    stopSpeech();

    // Hide player
    var player = document.getElementById('ndp-player');
    if (player) {
      player.setAttribute('aria-hidden', 'true');
      player.classList.remove('ndp-player--visible');
    }

    // Show Watch Demo button
    var watchBtn = document.getElementById('ndp-watch-btn');
    if (watchBtn) watchBtn.style.display = '';

    // Clear caption
    showCaption('');

    // Reset sandbox state
    if (window.NexusInteractive) {
      window.NexusInteractive.closeDrawer();
      window.NexusInteractive.resetFilters();
    }
    var panel = document.getElementById('ask-nexus-panel');
    if (panel && panel.classList.contains('open')) {
      var closeBtn = panel.querySelector('.nx-chat-close');
      if (closeBtn) closeBtn.click();
    }
    switchTab('executive', function () {});
  }

  /* ============================================================
     UI RENDERING
  ============================================================ */

  function showCaption(text) {
    var el = document.getElementById('ndp-caption-text');
    if (el) el.textContent = text || '';
    var wrap = document.getElementById('ndp-caption');
    if (wrap) {
      wrap.style.display = state.captionsOn && text ? '' : 'none';
    }
  }

  function updatePlayerUI() {
    var scene = SCENES[state.currentIndex] || {};

    // Scene title
    var titleEl = document.getElementById('ndp-scene-title');
    if (titleEl) titleEl.textContent = scene.title || '';

    // Progress
    var progEl = document.getElementById('ndp-progress-fill');
    var progLabel = document.getElementById('ndp-progress-label');
    var pct = SCENES.length > 1 ? (state.currentIndex / (SCENES.length - 1)) * 100 : 0;
    if (progEl) progEl.style.width = pct + '%';
    if (progLabel) progLabel.textContent = (state.currentIndex + 1) + ' / ' + SCENES.length;

    // Play/Pause button
    var playBtn = document.getElementById('ndp-btn-play');
    var pauseBtn = document.getElementById('ndp-btn-pause');
    var resumeBtn = document.getElementById('ndp-btn-resume');
    var replayBtn = document.getElementById('ndp-btn-replay');

    var demoFinished = !state.playing && state.currentIndex >= SCENES.length - 1 && state.active;

    if (playBtn) playBtn.style.display = (!state.playing && state.currentIndex === 0 && !demoFinished) ? '' : 'none';
    if (pauseBtn) pauseBtn.style.display = state.playing ? '' : 'none';
    if (resumeBtn) resumeBtn.style.display = (!state.playing && state.currentIndex > 0 && !demoFinished) ? '' : 'none';
    if (replayBtn) replayBtn.style.display = demoFinished ? '' : 'none';

    // Mute button
    var muteBtn = document.getElementById('ndp-btn-mute');
    if (muteBtn) {
      muteBtn.setAttribute('aria-label', state.muted ? 'Unmute narration' : 'Mute narration');
      muteBtn.title = state.muted ? 'Unmute' : 'Mute';
      muteBtn.textContent = state.muted ? '🔇' : '🔊';
    }

    // Captions button
    var capBtn = document.getElementById('ndp-btn-captions');
    if (capBtn) {
      capBtn.setAttribute('aria-pressed', state.captionsOn ? 'true' : 'false');
      capBtn.title = state.captionsOn ? 'Hide captions' : 'Show captions';
      capBtn.classList.toggle('ndp-btn--active', state.captionsOn);
    }

    // Prev/Next
    var prevBtn = document.getElementById('ndp-btn-prev');
    var nextBtn = document.getElementById('ndp-btn-next');
    if (prevBtn) prevBtn.disabled = state.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = state.currentIndex >= SCENES.length - 1;

    // Speech status note
    var speechNote = document.getElementById('ndp-speech-note');
    if (speechNote) {
      speechNote.style.display = (!state.speechSupported && state.active) ? '' : 'none';
    }
  }

  /* ============================================================
     PLAYER HTML INJECTION
  ============================================================ */

  function injectPlayer() {
    // Watch Demo button — injected near sandbox header
    var watchBtnContainer = document.getElementById('ndp-watch-btn-container');
    if (!watchBtnContainer) {
      watchBtnContainer = document.createElement('div');
      watchBtnContainer.id = 'ndp-watch-btn-container';
      watchBtnContainer.className = 'ndp-watch-btn-container';

      var watchBtn = document.createElement('button');
      watchBtn.type = 'button';
      watchBtn.id = 'ndp-watch-btn';
      watchBtn.className = 'ndp-watch-btn';
      watchBtn.setAttribute('aria-label', 'Watch narrated Nexus demo');
      watchBtn.innerHTML = '<span class="ndp-watch-btn__icon" aria-hidden="true">▶</span> Watch Demo';
      watchBtn.addEventListener('click', function () { enterDemoMode(); });

      watchBtnContainer.appendChild(watchBtn);

      // Insert after sandbox dept heading
      var heading = document.querySelector('.sandbox-dept-heading');
      if (heading && heading.parentNode) {
        heading.parentNode.insertBefore(watchBtnContainer, heading.nextSibling);
      } else {
        var sandboxNav = document.getElementById('sandbox-nav');
        if (sandboxNav && sandboxNav.parentNode) {
          sandboxNav.parentNode.insertBefore(watchBtnContainer, sandboxNav);
        }
      }
    }

    // Demo player bar
    if (document.getElementById('ndp-player')) return;

    var player = document.createElement('div');
    player.id = 'ndp-player';
    player.className = 'ndp-player';
    player.setAttribute('role', 'region');
    player.setAttribute('aria-label', 'Narrated Nexus Demo Player');
    player.setAttribute('aria-hidden', 'true');

    player.innerHTML = [
      /* Caption */
      '<div id="ndp-caption" class="ndp-caption" role="status" aria-live="polite" aria-atomic="true" style="display:none;">',
      '  <span id="ndp-caption-text" class="ndp-caption__text"></span>',
      '</div>',

      /* Speech unavailable note */
      '<div id="ndp-speech-note" class="ndp-speech-note" style="display:none;" aria-live="polite">',
      '  <span>🔇 Narration unavailable in this browser — captions are on.</span>',
      '</div>',

      /* Controls bar */
      '<div class="ndp-controls" role="toolbar" aria-label="Demo playback controls">',

      '  <div class="ndp-controls__left">',
      '    <button type="button" id="ndp-btn-play"   class="ndp-btn ndp-btn--primary" aria-label="Play demo"   title="Play">▶ Play</button>',
      '    <button type="button" id="ndp-btn-pause"  class="ndp-btn ndp-btn--primary" aria-label="Pause demo"  title="Pause" style="display:none;">⏸ Pause</button>',
      '    <button type="button" id="ndp-btn-resume" class="ndp-btn ndp-btn--primary" aria-label="Resume demo" title="Resume" style="display:none;">▶ Resume</button>',
      '    <button type="button" id="ndp-btn-replay" class="ndp-btn ndp-btn--primary" aria-label="Replay demo" title="Replay" style="display:none;">↺ Replay</button>',
      '    <button type="button" id="ndp-btn-prev"   class="ndp-btn" aria-label="Previous scene" title="Previous scene" disabled>&#8592;</button>',
      '    <button type="button" id="ndp-btn-next"   class="ndp-btn" aria-label="Next scene"     title="Next scene">&#8594;</button>',
      '  </div>',

      '  <div class="ndp-controls__center">',
      '    <div class="ndp-progress" aria-label="Demo progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">',
      '      <div class="ndp-progress__track">',
      '        <div id="ndp-progress-fill" class="ndp-progress__fill"></div>',
      '      </div>',
      '      <span id="ndp-progress-label" class="ndp-progress__label" aria-hidden="true">1 / ' + SCENES.length + '</span>',
      '    </div>',
      '    <div id="ndp-scene-title" class="ndp-scene-title"></div>',
      '  </div>',

      '  <div class="ndp-controls__right">',
      '    <button type="button" id="ndp-btn-mute"     class="ndp-btn" aria-label="Mute narration" title="Mute">🔊</button>',
      '    <button type="button" id="ndp-btn-captions" class="ndp-btn ndp-btn--active" aria-label="Toggle captions" aria-pressed="true" title="Captions">CC</button>',
      '    <button type="button" id="ndp-btn-exit"     class="ndp-btn ndp-btn--exit"  aria-label="Exit demo, return to interactive sandbox" title="Exit Demo">✕ Exit</button>',
      '  </div>',

      '</div>'
    ].join('');

    document.body.appendChild(player);

    // Wire events
    document.getElementById('ndp-btn-play').addEventListener('click',     function () { play(); });
    document.getElementById('ndp-btn-pause').addEventListener('click',    function () { pause(); });
    document.getElementById('ndp-btn-resume').addEventListener('click',   function () { resume(); });
    document.getElementById('ndp-btn-replay').addEventListener('click',   function () { replay(); });
    document.getElementById('ndp-btn-prev').addEventListener('click',     function () { prevScene(); });
    document.getElementById('ndp-btn-next').addEventListener('click',     function () { nextScene(); });
    document.getElementById('ndp-btn-mute').addEventListener('click',     function () { toggleMute(); });
    document.getElementById('ndp-btn-captions').addEventListener('click', function () { toggleCaptions(); });
    document.getElementById('ndp-btn-exit').addEventListener('click',     function () { exitDemoMode(); });

    // Keyboard shortcuts while player is active
    document.addEventListener('keydown', function (e) {
      if (!state.active) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (state.playing) pause(); else resume();
          break;
        case 'ArrowRight': e.preventDefault(); nextScene(); break;
        case 'ArrowLeft':  e.preventDefault(); prevScene(); break;
        case 'm': case 'M': e.preventDefault(); toggleMute(); break;
        case 'c': case 'C': e.preventDefault(); toggleCaptions(); break;
        case 'Escape': e.preventDefault(); exitDemoMode(); break;
      }
    });
  }

  /* ============================================================
     INIT
  ============================================================ */

  function init() {
    initSpeech();

    // Voices may load asynchronously
    if (state.speechSupported && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = function () { /* voices now available */ };
    }

    injectPlayer();
    updatePlayerUI();

    // Auto-enter demo mode when ?watchdemo=1 query parameter is present.
    // Note: speech still requires a user gesture before playing; the player
    // will open in paused state ready for the visitor to tap Play.
    if (window.location.search && window.location.search.indexOf('watchdemo=1') !== -1) {
      setTimeout(function () { enterDemoMode(); }, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ============================================================
     PUBLIC API
  ============================================================ */

  window.NexusDemoPlayer = {
    enter: enterDemoMode,
    exit: exitDemoMode,
    play: play,
    pause: pause,
    resume: resume,
    replay: replay,
    prevScene: prevScene,
    nextScene: nextScene,
    toggleMute: toggleMute,
    toggleCaptions: toggleCaptions
  };

})();
