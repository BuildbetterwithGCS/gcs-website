/**
 * nexus-demo-player.js
 * Nexus captions-first demo player.
 *
 * Deterministic timeline with requestAnimationFrame.
 * All demo data is synthetic. No real organizations or individuals represented.
 */
(function () {
  'use strict';

  var state = {
    active: false,
    playing: false,
    paused: false,
    started: false,
    finished: false,
    currentIndex: 0,
    captionsOn: true,
    muted: false,
    volume: 1.0,
    audioEl: null
  };

  var timeline = {
    startTime: 0,
    sceneElapsed: 0,
    rafId: null,
    pauseTime: 0,
    totalPaused: 0
  };

  var SCENES = [
    {
      id: 'welcome',
      title: 'Welcome to Nexus',
      dept: 'executive',
      caption: 'Nexus connects the systems and information your organization already uses into one operating picture.',
      duration: 3600,
      audioSrc: '../assets/audio/nexus-demo/01-welcome.mp3',
      highlight: '#view-executive .dash-row--4',
      events: [
        { at: 600, fn: function () { resetInteractiveState(false); } },
        { at: 1100, fn: function () { highlightElement(document.querySelector('#view-executive .dash-row--4')); } }
      ]
    },
    {
      id: 'executive-dashboard',
      title: 'Executive Dashboard',
      dept: 'executive',
      caption: 'Leaders can see organization-wide KPIs, open work, workforce pressure, and risk in one place.',
      duration: 4200,
      audioSrc: '../assets/audio/nexus-demo/02-executive-dashboard.mp3',
      highlight: '[data-kpi-key="risk-open"]',
      events: [
        { at: 1000, fn: function () { highlightElement(document.querySelector('[data-kpi-key="open-wo"]')); } },
        { at: 2200, fn: function () { highlightElement(document.querySelector('[data-kpi-key="risk-open"]')); } }
      ]
    },
    {
      id: 'problem-detected',
      title: 'Problem Detected',
      dept: 'executive',
      caption: 'Nexus identifies a risk that needs attention and lets leaders drill straight into the issue.',
      duration: 4400,
      audioSrc: '../assets/audio/nexus-demo/03-problem-detected.mp3',
      events: [
        { at: 800, fn: function () { renderKpiDetail('risk-open'); } },
        { at: 1600, fn: function () { highlightElement(document.querySelector('.nx-drawer')); } }
      ]
    },
    {
      id: 'understand-cause',
      title: 'Understand Cause and Risk',
      dept: 'executive',
      caption: 'The detail drawer shows context, recommended action, and the estimated cost of waiting.',
      duration: 4200,
      audioSrc: '../assets/audio/nexus-demo/04-understand-risk.mp3',
      events: [
        { at: 600, fn: function () { renderKpiDetail('risk-open'); } },
        { at: 1400, fn: function () { highlightElement(document.querySelector('.nx-action-btn--primary')); } }
      ]
    },
    {
      id: 'ask-nexus',
      title: 'Ask Nexus',
      dept: 'executive',
      caption: 'Ask Nexus answers plain-language questions using connected operational information.',
      duration: 5200,
      audioSrc: '../assets/audio/nexus-demo/05-ask-nexus.mp3',
      events: [
        { at: 400, fn: function () { closeDrawer(); } },
        { at: 900, fn: function () { openAskNexus(); } },
        { at: 2000, fn: function () { clickElement(document.querySelector('.nx-chat-suggest')); } },
        { at: 3200, fn: function () { highlightElement(document.querySelector('#ask-nexus-panel')); } }
      ]
    },
    {
      id: 'map-context',
      title: 'Map Context',
      dept: 'map',
      caption: 'Map Intelligence adds geographic context so leaders can see where risk, projects, and assets are concentrated.',
      duration: 4800,
      audioSrc: '../assets/audio/nexus-demo/06-map-context.mp3',
      events: [
        { at: 1100, fn: function () { clickElement(document.querySelector('.nx-map-pin[data-id="risk-water"]')) || clickElement(document.querySelector('.nx-map-pin[data-id="bldg-4"]')); } },
        { at: 2200, fn: function () { highlightElement(document.querySelector('.nx-map-pin[data-id="risk-water"]') || document.querySelector('.nx-map-pin[data-id="bldg-4"]')); } }
      ]
    },
    {
      id: 'finance-view',
      title: 'Finance View',
      dept: 'finance',
      caption: 'Finance leaders can move from budget and AP signals to operational context without leaving Nexus.',
      duration: 4500,
      audioSrc: '../assets/audio/nexus-demo/07-finance-view.mp3',
      events: [
        { at: 900, fn: function () { renderKpiDetail('fin-ap'); } },
        { at: 1800, fn: function () { highlightElement(document.querySelector('.nx-drawer')); } }
      ]
    },
    {
      id: 'assign-action',
      title: 'Assign Action',
      dept: 'executive',
      caption: 'Insight becomes action when leaders assign work, escalate issues, and track accountability from the same environment.',
      duration: 4600,
      audioSrc: '../assets/audio/nexus-demo/08-assign-action.mp3',
      events: [
        { at: 400, fn: function () { closeDrawer(); closeAskNexus(); } },
        { at: 1100, fn: function () { renderActionResult('assign', 'Infrastructure failure — Water main'); } },
        { at: 2200, fn: function () { highlightElement(document.querySelector('.nx-drawer')); } }
      ]
    },
    {
      id: 'prove-value',
      title: 'Prove Value',
      dept: 'reports',
      caption: 'Nexus helps teams document outcomes, generate reports, and prove value with measurable results.',
      duration: 4600,
      audioSrc: '../assets/audio/nexus-demo/09-prove-value.mp3',
      events: [
        { at: 1200, fn: function () { renderActionResult('generate-report', 'Quarterly value and ROI scorecard'); } },
        { at: 2600, fn: function () { highlightElement(document.querySelector('.nx-drawer')); } }
      ]
    },
    {
      id: 'explore-next',
      title: 'Explore Nexus',
      dept: 'executive',
      caption: 'The guided walkthrough is almost complete. Next, explore Nexus interactively with synthetic data and no login.',
      duration: 3600,
      audioSrc: '../assets/audio/nexus-demo/10-explore-nexus.mp3',
      events: [
        { at: 400, fn: function () { closeDrawer(); closeAskNexus(); } },
        { at: 1000, fn: function () { switchTab('executive'); } },
        { at: 1700, fn: function () { highlightElement(document.querySelector('#sandbox-nav-wrap')); } }
      ]
    }
  ];

  function cancelFrame() {
    if (timeline.rafId) {
      cancelAnimationFrame(timeline.rafId);
      timeline.rafId = null;
    }
  }

  function stopAudio() {
    if (state.audioEl) {
      try {
        state.audioEl.pause();
      } catch (e) { /* ignore */ }
      state.audioEl = null;
    }
  }

  function clearSceneState() {
    cancelFrame();
    stopAudio();
    timeline.sceneElapsed = 0;
    timeline.pauseTime = 0;
    timeline.totalPaused = 0;
  }

  function switchTab(viewKey, done) {
    var btn = document.querySelector('.sandbox-nav-btn[data-view="' + viewKey + '"]');
    if (!btn) {
      if (done) done();
      return;
    }
    btn.click();
    setTimeout(function () {
      if (done) done();
    }, 280);
  }

  function clickElement(el) {
    if (!el) return false;
    el.click();
    return true;
  }

  function highlightElement(el) {
    if (!el) return;
    el.classList.add('ndp-highlight');
    setTimeout(function () {
      el.classList.remove('ndp-highlight');
    }, 1800);
  }

  function closeDrawer() {
    if (window.NexusInteractive && typeof window.NexusInteractive.closeDrawer === 'function') {
      window.NexusInteractive.closeDrawer();
    }
  }

  function openAskNexus() {
    if (window.NexusInteractive && typeof window.NexusInteractive.openAskNexus === 'function') {
      window.NexusInteractive.openAskNexus();
    }
  }

  function closeAskNexus() {
    var panel = document.getElementById('ask-nexus-panel');
    if (panel && panel.classList.contains('open')) {
      var closeBtn = panel.querySelector('.nx-chat-close');
      if (closeBtn) closeBtn.click();
    }
  }

  function renderKpiDetail(key) {
    if (window.NexusInteractive && typeof window.NexusInteractive.renderKpiDetail === 'function') {
      window.NexusInteractive.renderKpiDetail(key);
    }
  }

  function renderActionResult(action, context) {
    if (window.NexusInteractive && typeof window.NexusInteractive.renderActionResult === 'function') {
      window.NexusInteractive.renderActionResult(action, context);
    }
  }

  function resetInteractiveState(includeTabReset) {
    closeDrawer();
    closeAskNexus();
    if (window.NexusInteractive && typeof window.NexusInteractive.resetFilters === 'function') {
      window.NexusInteractive.resetFilters();
    }
    if (includeTabReset !== false) {
      switchTab('executive');
    }
  }

  function sceneHasAudio(scene) {
    return !!(scene && scene.audioSrc);
  }

  function showCaption(text) {
    var wrap = document.getElementById('ndp-caption');
    var textEl = document.getElementById('ndp-caption-text');
    if (!wrap || !textEl) return;
    textEl.textContent = text || '';
    wrap.style.display = state.captionsOn && text ? '' : 'none';
  }

  function updateCompletionActions(visible) {
    var complete = document.getElementById('ndp-complete');
    if (!complete) return;
    complete.style.display = visible ? '' : 'none';
  }

  function updateProgress(overallPct) {
    var pct = Math.max(0, Math.min(100, overallPct));
    var fill = document.getElementById('ndp-progress-fill');
    var progress = document.getElementById('ndp-progress');
    if (fill) fill.style.width = pct + '%';
    if (progress) progress.setAttribute('aria-valuenow', String(Math.round(pct)));
  }

  function runSceneEvents(scene, elapsed) {
    if (!scene.events) return;
    scene.events.forEach(function (evt) {
      if (!evt._fired && elapsed >= evt.at) {
        evt._fired = true;
        evt.fn();
      }
    });
  }

  function updatePlayerUI() {
    var scene = SCENES[state.currentIndex] || {};
    var titleEl = document.getElementById('ndp-scene-title');
    var labelEl = document.getElementById('ndp-progress-label');
    var playBtn = document.getElementById('ndp-btn-play');
    var pauseBtn = document.getElementById('ndp-btn-pause');
    var resumeBtn = document.getElementById('ndp-btn-resume');
    var replayBtn = document.getElementById('ndp-btn-replay');
    var prevBtn = document.getElementById('ndp-btn-prev');
    var nextBtn = document.getElementById('ndp-btn-next');
    var capBtn = document.getElementById('ndp-btn-captions');
    var muteBtn = document.getElementById('ndp-btn-mute');
    var player = document.getElementById('ndp-player');

    if (titleEl) titleEl.textContent = scene.title || '';
    if (labelEl) labelEl.textContent = (state.currentIndex + 1) + ' / ' + SCENES.length;
    if (player) player.classList.toggle('ndp-player--captions-only', !sceneHasAudio(scene));

    if (playBtn) playBtn.style.display = (!state.started && !state.playing && !state.finished) ? '' : 'none';
    if (pauseBtn) pauseBtn.style.display = state.playing ? '' : 'none';
    if (resumeBtn) resumeBtn.style.display = (state.paused && !state.finished) ? '' : 'none';
    if (replayBtn) replayBtn.style.display = state.finished ? '' : 'none';

    if (prevBtn) prevBtn.disabled = state.currentIndex === 0 && !state.started;
    if (nextBtn) nextBtn.disabled = state.finished || state.currentIndex >= SCENES.length - 1;

    if (capBtn) {
      capBtn.setAttribute('aria-pressed', state.captionsOn ? 'true' : 'false');
      capBtn.classList.toggle('ndp-btn--active', state.captionsOn);
      capBtn.title = state.captionsOn ? 'Hide captions' : 'Show captions';
    }

    if (muteBtn) {
      var hasAudio = sceneHasAudio(scene);
      muteBtn.classList.toggle('ndp-btn--audio-unavailable', !hasAudio);
      muteBtn.setAttribute('aria-hidden', hasAudio ? 'false' : 'true');
      muteBtn.tabIndex = hasAudio ? 0 : -1;
      muteBtn.setAttribute('aria-label', state.muted ? 'Unmute narration' : 'Mute narration');
      muteBtn.title = state.muted ? 'Unmute' : 'Mute';
      muteBtn.textContent = state.muted ? '🔇' : '🔊';
    }

    var volSlider = document.getElementById('ndp-vol');
    if (volSlider) {
      var hasAudio2 = sceneHasAudio(scene);
      volSlider.classList.toggle('ndp-btn--audio-unavailable', !hasAudio2);
      volSlider.style.display = hasAudio2 ? '' : 'none';
      volSlider.value = state.muted ? 0 : state.volume;
    }
  }

  function finishDemo() {
    state.playing = false;
    state.paused = false;
    state.finished = true;
    cancelFrame();
    stopAudio();
    timeline.sceneElapsed = SCENES[SCENES.length - 1].duration;
    updateProgress(100);
    showCaption('Demo complete. Explore Nexus interactively or request a real demonstration.');
    updateCompletionActions(true);
    updatePlayerUI();
  }

  function advanceScene() {
    if (state.currentIndex >= SCENES.length - 1) {
      finishDemo();
      return;
    }
    startScene(state.currentIndex + 1);
  }

  function getSceneElapsed(now, scene) {
    if (state.audioEl && sceneHasAudio(scene) && !state.audioEl.paused) {
      return state.audioEl.currentTime * 1000;
    }
    return now - timeline.startTime - timeline.totalPaused;
  }

  function tick(now) {
    if (!state.playing || state.paused) return;
    var scene = SCENES[state.currentIndex];
    if (!scene) return;

    timeline.sceneElapsed = getSceneElapsed(now, scene);

    runSceneEvents(scene, timeline.sceneElapsed);

    var scenePct = Math.min(100, (timeline.sceneElapsed / scene.duration) * 100);
    var overallPct = ((state.currentIndex + (scenePct / 100)) / SCENES.length) * 100;
    updateProgress(overallPct);

    if (timeline.sceneElapsed >= scene.duration) {
      advanceScene();
      return;
    }

    timeline.rafId = requestAnimationFrame(tick);
  }

  function prepareScene(scene) {
    showCaption(scene.caption || '');
    updateCompletionActions(false);

    if (scene.events) {
      scene.events.forEach(function (evt) {
        evt._fired = false;
      });
    }

    if (sceneHasAudio(scene)) {
      state.audioEl = new Audio(scene.audioSrc);
      state.audioEl.preload = 'auto';
      state.audioEl.muted = state.muted;
      state.audioEl.volume = state.volume;
      state.audioEl.currentTime = 0;
      state.audioEl.addEventListener('ended', function () {
        if (state.playing && !state.paused) advanceScene();
      });
      // Graceful fallback: if the file is absent or fails, continue in captions-only mode
      state.audioEl.addEventListener('error', function () {
        stopAudio();
      });
      state.audioEl.play().catch(function () {
        stopAudio();
      });
    }
  }

  function startScene(index) {
    var scene = SCENES[index];
    if (!scene) return;

    clearSceneState();
    state.currentIndex = index;
    state.started = true;
    state.finished = false;
    state.playing = true;
    state.paused = false;

    var afterSwitch = function () {
      // Start the scene clock only after the tab is visible so events fire at
      // the correct visual time rather than drifting by the tab-switch delay.
      timeline.startTime = performance.now();
      prepareScene(scene);
      if (scene.highlight) highlightElement(document.querySelector(scene.highlight));
      updatePlayerUI();
      timeline.rafId = requestAnimationFrame(tick);
    };

    if (scene.dept) {
      switchTab(scene.dept, afterSwitch);
    } else {
      afterSwitch();
    }
  }

  function play() {
    if (!state.active) return;
    if (state.finished) {
      replay();
      return;
    }
    startScene(state.currentIndex || 0);
  }

  function pause() {
    if (!state.active || !state.playing) return;
    state.playing = false;
    state.paused = true;
    timeline.pauseTime = performance.now();
    cancelFrame();
    if (state.audioEl) {
      try { state.audioEl.pause(); } catch (e) { /* ignore */ }
    }
    updatePlayerUI();
  }

  function resume() {
    if (!state.active || !state.paused || state.finished) return;
    state.playing = true;
    state.paused = false;
    timeline.totalPaused += performance.now() - timeline.pauseTime;
    if (state.audioEl) {
      state.audioEl.play().catch(function () { /* ignore */ });
    }
    updatePlayerUI();
    timeline.rafId = requestAnimationFrame(tick);
  }

  function replay() {
    if (!state.active) return;
    resetInteractiveState(true);
    timeline.sceneElapsed = 0;
    state.currentIndex = 0;
    state.started = false;
    state.finished = false;
    state.paused = false;
    state.playing = false;
    updateCompletionActions(false);
    updateProgress(0);
    updatePlayerUI();
    play();
  }

  function prevScene() {
    if (!state.active) return;
    var prev = Math.max(0, state.currentIndex - 1);
    startScene(prev);
  }

  function nextScene() {
    if (!state.active) return;
    if (state.currentIndex >= SCENES.length - 1) {
      finishDemo();
      return;
    }
    startScene(state.currentIndex + 1);
  }

  function toggleCaptions() {
    state.captionsOn = !state.captionsOn;
    showCaption((SCENES[state.currentIndex] || {}).caption || '');
    updatePlayerUI();
  }

  function toggleMute() {
    state.muted = !state.muted;
    if (state.audioEl) {
      state.audioEl.muted = state.muted;
    }
    updatePlayerUI();
  }

  function setVolume(val) {
    state.volume = Math.max(0, Math.min(1, parseFloat(val) || 1));
    if (state.audioEl) {
      state.audioEl.volume = state.volume;
    }
    // Auto-unmute when volume is raised
    if (state.volume > 0 && state.muted) {
      state.muted = false;
      if (state.audioEl) state.audioEl.muted = false;
    }
    updatePlayerUI();
  }

  function enterDemoMode() {
    if (state.active) return;
    state.active = true;
    state.playing = false;
    state.paused = false;
    state.started = false;
    state.finished = false;
    state.currentIndex = 0;
    clearSceneState();
    resetInteractiveState(true);

    var player = document.getElementById('ndp-player');
    if (player) {
      player.setAttribute('aria-hidden', 'false');
      player.classList.add('ndp-player--visible');
    }

    var watchBtn = document.getElementById('ndp-watch-btn');
    if (watchBtn) watchBtn.style.display = 'none';

    var sandboxEl = document.getElementById('sandbox-section') || document.querySelector('.sandbox-dept-heading');
    if (sandboxEl) sandboxEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

    showCaption('Press Play to start the guided Nexus walkthrough.');
    updateCompletionActions(false);
    updateProgress(0);
    updatePlayerUI();
  }

  function exitDemoMode() {
    if (!state.active) return;
    state.active = false;
    state.playing = false;
    state.paused = false;
    state.started = false;
    state.finished = false;
    state.currentIndex = 0;
    clearSceneState();
    resetInteractiveState(true);
    showCaption('');
    updateCompletionActions(false);
    updateProgress(0);

    var player = document.getElementById('ndp-player');
    if (player) {
      player.setAttribute('aria-hidden', 'true');
      player.classList.remove('ndp-player--visible');
    }

    var watchBtn = document.getElementById('ndp-watch-btn');
    if (watchBtn) watchBtn.style.display = '';

    updatePlayerUI();
  }

  function injectPlayer() {
    var watchBtnContainer = document.getElementById('ndp-watch-btn-container');
    if (!watchBtnContainer) {
      watchBtnContainer = document.createElement('div');
      watchBtnContainer.id = 'ndp-watch-btn-container';
      watchBtnContainer.className = 'ndp-watch-btn-container';

      var watchBtn = document.createElement('button');
      watchBtn.type = 'button';
      watchBtn.id = 'ndp-watch-btn';
      watchBtn.className = 'ndp-watch-btn';
      watchBtn.setAttribute('aria-label', 'Watch Nexus Demo');
      watchBtn.innerHTML = '<span class="ndp-watch-btn__icon" aria-hidden="true">▶</span> Watch Nexus Demo';
      watchBtn.addEventListener('click', enterDemoMode);

      watchBtnContainer.appendChild(watchBtn);

      var heading = document.querySelector('.sandbox-dept-heading');
      if (heading && heading.parentNode) {
        heading.parentNode.insertBefore(watchBtnContainer, heading.nextSibling);
      }
    }

    if (document.getElementById('ndp-player')) return;

    var player = document.createElement('div');
    player.id = 'ndp-player';
    player.className = 'ndp-player ndp-player--captions-only';
    player.setAttribute('role', 'region');
    player.setAttribute('aria-label', 'Nexus demo player');
    player.setAttribute('aria-hidden', 'true');
    player.innerHTML = [
      '<div id="ndp-caption" class="ndp-caption" role="status" aria-live="polite" aria-atomic="true" style="display:none;">',
      '  <span id="ndp-caption-text" class="ndp-caption__text"></span>',
      '</div>',
      '<div id="ndp-complete" class="ndp-complete" style="display:none;">',
      '  <a href="../request-demo/" class="ndp-complete__link">Request a Demonstration</a>',
      '</div>',
      '<div class="ndp-controls" role="toolbar" aria-label="Demo playback controls">',
      '  <div class="ndp-controls__left">',
      '    <button type="button" id="ndp-btn-play" class="ndp-btn ndp-btn--primary" aria-label="Play demo">▶ Play</button>',
      '    <button type="button" id="ndp-btn-pause" class="ndp-btn ndp-btn--primary" aria-label="Pause demo" style="display:none;">⏸ Pause</button>',
      '    <button type="button" id="ndp-btn-resume" class="ndp-btn ndp-btn--primary" aria-label="Resume demo" style="display:none;">▶ Resume</button>',
      '    <button type="button" id="ndp-btn-replay" class="ndp-btn ndp-btn--primary" aria-label="Replay demo" style="display:none;">↺ Replay</button>',
      '    <button type="button" id="ndp-btn-prev" class="ndp-btn" aria-label="Previous scene">&#8592;</button>',
      '    <button type="button" id="ndp-btn-next" class="ndp-btn" aria-label="Next scene">&#8594;</button>',
      '  </div>',
      '  <div class="ndp-controls__center">',
      '    <div id="ndp-progress" class="ndp-progress" aria-label="Demo progress" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">',
      '      <div class="ndp-progress__track"><div id="ndp-progress-fill" class="ndp-progress__fill"></div></div>',
      '      <span id="ndp-progress-label" class="ndp-progress__label" aria-hidden="true">1 / ' + SCENES.length + '</span>',
      '    </div>',
      '    <div id="ndp-scene-title" class="ndp-scene-title"></div>',
      '  </div>',
      '  <div class="ndp-controls__right">',
      '    <button type="button" id="ndp-btn-mute" class="ndp-btn ndp-btn--audio-unavailable" aria-hidden="true" tabindex="-1">🔊</button>',
      '    <input type="range" id="ndp-vol" class="ndp-vol-slider" min="0" max="1" step="0.05" value="1" aria-label="Volume" style="display:none;" />',
      '    <button type="button" id="ndp-btn-captions" class="ndp-btn ndp-btn--active" aria-label="Toggle captions" aria-pressed="true">CC</button>',
      '    <button type="button" id="ndp-btn-exit" class="ndp-btn ndp-btn--exit" aria-label="Exit demo">✕ Exit</button>',
      '  </div>',
      '</div>'
    ].join('');

    document.body.appendChild(player);

    document.getElementById('ndp-btn-play').addEventListener('click', play);
    document.getElementById('ndp-btn-pause').addEventListener('click', pause);
    document.getElementById('ndp-btn-resume').addEventListener('click', resume);
    document.getElementById('ndp-btn-replay').addEventListener('click', replay);
    document.getElementById('ndp-btn-prev').addEventListener('click', prevScene);
    document.getElementById('ndp-btn-next').addEventListener('click', nextScene);
    document.getElementById('ndp-btn-captions').addEventListener('click', toggleCaptions);
    document.getElementById('ndp-btn-mute').addEventListener('click', toggleMute);
    document.getElementById('ndp-btn-exit').addEventListener('click', exitDemoMode);

    var volEl = document.getElementById('ndp-vol');
    if (volEl) {
      volEl.addEventListener('input', function () { setVolume(this.value); });
    }

    document.addEventListener('keydown', function (e) {
      if (!state.active) return;
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      switch (e.key) {
        case ' ':
          e.preventDefault();
          if (state.finished) { replay(); }
          else if (state.playing) { pause(); }
          else if (state.currentIndex === 0 && timeline.sceneElapsed < 100) { play(); }
          else { resume(); }
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextScene();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          prevScene();
          break;
        case 'c':
        case 'C':
          e.preventDefault();
          toggleCaptions();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'Escape':
          e.preventDefault();
          exitDemoMode();
          break;
      }
    });
  }

  function init() {
    injectPlayer();
    updatePlayerUI();

    // iPhone Safari / desktop: when the page becomes hidden, pause the RAF clock
    // so timeline.startTime does not drift when the page returns to focus.
    document.addEventListener('visibilitychange', function () {
      if (!state.active || !state.playing) return;
      if (document.hidden) {
        // Treat as a pause of the clock without changing play state
        timeline.pauseTime = performance.now();
      } else {
        // Absorb the time the page was hidden
        timeline.totalPaused += performance.now() - timeline.pauseTime;
        // Restart RAF if it was cancelled
        if (!timeline.rafId) {
          timeline.rafId = requestAnimationFrame(tick);
        }
      }
    });

    var params = new URLSearchParams(window.location.search);
    if (params.get('watchdemo') === '1') {
      setTimeout(function () {
        enterDemoMode();
      }, 400);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.NexusDemoPlayer = {
    enter: enterDemoMode,
    exit: exitDemoMode,
    play: play,
    pause: pause,
    resume: resume,
    replay: replay,
    prevScene: prevScene,
    nextScene: nextScene,
    toggleCaptions: toggleCaptions,
    toggleMute: toggleMute,
    setVolume: setVolume
  };
})();
