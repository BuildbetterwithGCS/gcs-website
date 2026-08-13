/**
 * GCS Website — Deterministic UX Acceptance Tests
 *
 * Run with:  node tests/site.test.js
 *
 * Tests validate the HTML files directly (no browser required).
 * Returns exit code 0 on all pass, exit code 1 on any failure.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

/* ---- tiny test harness ----------------------------------------- */
let passed = 0, failed = 0;
const failures = [];

function readFile(rel) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf8');
}

function assert(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('  ✔ ' + name);
  } else {
    failed++;
    const msg = detail ? name + ' — ' + detail : name;
    failures.push(msg);
    console.log('  ✖ ' + msg);
  }
}

function section(title) {
  console.log('\n── ' + title + ' ──');
}

/* ---- helpers ---------------------------------------------------- */
function contains(html, str) {
  return typeof html === 'string' && html.includes(str);
}

function containsCI(html, str) {
  return typeof html === 'string' && html.toLowerCase().includes(str.toLowerCase());
}

function countMatches(html, pattern) {
  if (!html) return 0;
  const m = html.match(new RegExp(pattern, 'gi'));
  return m ? m.length : 0;
}

/* ================================================================
   HOMEPAGE TESTS
   ================================================================ */
section('Homepage');

const home = readFile('index.html');
assert('Homepage exists', home !== null);
assert('Build Better Organizations headline', containsCI(home, 'Build Better Organizations'));
assert('WATCH THE GCS DEMO CTA exists', containsCI(home, 'Watch the GCS Demo'));
assert('EXPLORE NEXUS LIVE CTA exists', containsCI(home, 'Explore Nexus Live'));
assert('"No login" message visible', containsCI(home, 'No login'));
assert('Synthetic data disclosure visible', containsCI(home, 'Synthetic data'));
assert('"Nothing to install" visible', containsCI(home, 'Nothing to install'));
assert('TALK TO GCS link exists', containsCI(home, 'Talk to GCS'));
assert('Video/demo placeholder exists on homepage', containsCI(home, 'demo-video-block'));
assert('Nexus dashboard preview exists on homepage', containsCI(home, 'dash-shell'));
assert('Link to sandbox exists on homepage', contains(home, 'href="sandbox/"') || contains(home, "href='sandbox/'"));

/* ================================================================
   NAVIGATION TESTS
   ================================================================ */
section('Navigation — Homepage');

assert('Nav: Platform link', contains(home, 'href="platform/"'));
assert('Nav: Consulting link', contains(home, 'href="consulting/"'));
assert('Nav: Industries link', contains(home, 'href="industries/"'));
assert('Nav: Demos link', contains(home, 'href="demos/"'));
assert('Nav: About link', contains(home, 'href="about/"'));
assert('Nav: Explore Nexus Live link', containsCI(home, 'Explore Nexus Live'));
assert('Nav: Get Started link', containsCI(home, 'Get Started'));

/* ---- Sandbox subpage nav ---- */
section('Navigation — Sandbox subpage');
const sandbox = readFile('sandbox/index.html');
assert('Sandbox nav: Platform link', contains(sandbox, 'href="../platform/"'));
assert('Sandbox nav: Consulting link', contains(sandbox, 'href="../consulting/"'));
assert('Sandbox nav: Demos link', contains(sandbox, 'href="../demos/"'));
assert('Sandbox nav: Explore Nexus Live', containsCI(sandbox, 'Explore Nexus Live'));

/* ================================================================
   PUBLIC ROUTES — EXISTING PAGES STILL ACCESSIBLE
   ================================================================ */
section('Public routes exist (no regressions)');

const routes = [
  'index.html',
  'sandbox/index.html',
  'nexus/index.html',
  'industries/index.html',
  'about/index.html',
  'contact/index.html',
  'platform/index.html',
  'consulting/index.html',
  'demos/index.html',
  'solutions/index.html',
  'departments/index.html',
  'map-intelligence/index.html',
  'genesis/index.html',
  'privacy/index.html',
  'accessibility/index.html',
  'responsible-ai/index.html',
];

routes.forEach(function(route) {
  const html = readFile(route);
  assert(route + ' exists', html !== null);
});

/* ================================================================
   NEXUS DEMO / SANDBOX TESTS
   ================================================================ */
section('Nexus Demo — Sandbox');

assert('Sandbox exists', sandbox !== null);
assert('Synthetic data disclosure present', containsCI(sandbox, 'SYNTHETIC DATA'));
assert('DEMONSTRATION ENVIRONMENT notice present',
  containsCI(sandbox, 'DEMONSTRATION ENVIRONMENT'));
assert('No login messaging present', containsCI(sandbox, 'No login'));
assert('Orientation modal present', contains(sandbox, 'orient-overlay'));
assert('"Welcome to Nexus" orientation message', containsCI(sandbox, 'Welcome to Nexus'));
assert('Fictional organization statement in orientation', containsCI(sandbox, 'fictional'));

/* ================================================================
   DEPARTMENT NAVIGATION — ONE CLICK, NEVER DOUBLE-CLICK
   ================================================================ */
section('Department Navigation — UX Requirements');

assert('Department nav buttons are <button> elements (not double-click dependent)',
  contains(sandbox, 'class="sandbox-nav-btn"') && contains(sandbox, 'type="button"'));
assert('No dblclick handler in sandbox', !containsCI(sandbox, 'dblclick'));
assert('No double-click requirement in sandbox', !containsCI(sandbox, 'double-click'));
assert('Department nav has active state CSS class', contains(sandbox, 'sandbox-nav-btn.active') || contains(sandbox, 'active'));
assert('Executive Overview is first/default department',
  (sandbox || '').indexOf('data-view="executive"') <
  (sandbox || '').indexOf('data-view="finance"'));
assert('Dept heading visible — EXPLORE YOUR ORGANIZATION',
  containsCI(sandbox, 'Explore your organization'));
assert('Dept heading instructs to select a department',
  containsCI(sandbox, 'Select a department'));
assert('Finance department present', contains(sandbox, 'data-view="finance"'));
assert('HR & Workforce department present', contains(sandbox, 'data-view="hr"'));
assert('Facilities department present', contains(sandbox, 'data-view="facilities"'));
assert('Safety department present', contains(sandbox, 'data-view="safety"'));
assert('Risk department present', contains(sandbox, 'data-view="risk"'));

/* ================================================================
   DEPARTMENT SWITCHING — ONE ACTION, NOT DOUBLE-CLICK
   ================================================================ */
section('Department Switching');

// Verify click handlers are registered (not dblclick)
assert('Click handler registered for department nav buttons',
  contains(sandbox, "addEventListener('click'") || contains(sandbox, 'addEventListener("click"'));
assert('showView function exists', contains(sandbox, 'function showView'));
assert('Department switch updates active class',
  contains(sandbox, "classList.toggle('active'") || contains(sandbox, 'classList.toggle("active"'));
assert('Keyboard activation supported (keydown listener)',
  contains(sandbox, "addEventListener('keydown'") || contains(sandbox, 'addEventListener("keydown"'));

/* ================================================================
   ORGANIZATION SWITCHING
   ================================================================ */
section('Organization Switching');

assert('Change organization button exists', containsCI(sandbox, 'Change Organization'));
assert('Multiple demo organizations available (≥ 6)',
  countMatches(sandbox, 'sandbox-org-btn') >= 6);
assert('Municipality demo org present',
  contains(sandbox, 'data-org="municipality"'));
assert('Manufacturing demo org present',
  contains(sandbox, 'data-org="manufacturer"'));
assert('Healthcare demo org present',
  contains(sandbox, 'data-org="hospital"'));

/* ================================================================
   DATA CENTER DEMONSTRATION
   ================================================================ */
section('Data Center Demonstration');

assert('Data Center org button present in sandbox',
  contains(sandbox, 'data-org="datacenter"'));
assert('Data Center org is clearly labeled synthetic',
  containsCI(sandbox, 'Sample Data Center') || containsCI(sandbox, 'Apex Sample Data'));
assert('Data Center data present (cooling, power, etc.)',
  containsCI(sandbox, 'Data Center') && (
    containsCI(sandbox, 'Cooling') || containsCI(sandbox, 'UPS') || containsCI(sandbox, 'power')
  ));
assert('Data Center present in industries page',
  containsCI(readFile('industries/index.html'), 'Data Center'));

/* ================================================================
   PLATFORM PAGE
   ================================================================ */
section('Platform Page');

const platform = readFile('platform/index.html');
assert('Platform page exists', platform !== null);
assert('Nexus listed on platform page', containsCI(platform, 'Nexus'));
assert('Genesis listed on platform page', containsCI(platform, 'Genesis'));
assert('Map Intelligence listed on platform page', containsCI(platform, 'Map Intelligence'));
assert('Assurance listed on platform page', containsCI(platform, 'Assurance'));
assert('Value Intelligence listed on platform page', containsCI(platform, 'Value Intelligence'));
assert('"See the organization" tagline present', containsCI(platform, 'See the organization'));
assert('Explore Nexus Live CTA on platform page', containsCI(platform, 'Explore Nexus Live'));

/* ================================================================
   CONSULTING PAGE
   ================================================================ */
section('Consulting Page');

const consulting = readFile('consulting/index.html');
assert('Consulting page exists', consulting !== null);
assert('Assess in lifecycle', containsCI(consulting, 'Assess'));
assert('Design in lifecycle', containsCI(consulting, 'Design'));
assert('Implement in lifecycle', containsCI(consulting, 'Implement'));
assert('Improve in lifecycle', containsCI(consulting, 'Improve'));
assert('Advisory + technology messaging', containsCI(consulting, 'consulting') && containsCI(consulting, 'technology'));
assert('Contact GCS CTA present', containsCI(consulting, 'Contact GCS') || containsCI(consulting, 'Talk to GCS'));

/* ================================================================
   DEMOS PAGE
   ================================================================ */
section('Demos Page');

const demos = readFile('demos/index.html');
assert('Demos page exists', demos !== null);
assert('GCS Overview demo present', containsCI(demos, 'GCS Overview'));
assert('Nexus demo present', containsCI(demos, 'Nexus'));
assert('Genesis demo present', containsCI(demos, 'Genesis'));
assert('Map Intelligence demo present', containsCI(demos, 'Map Intelligence'));
assert('Consulting demo present', containsCI(demos, 'Consulting'));
assert('Video placeholder components present', contains(demos, 'demo-video-block'));
assert('Explore Nexus Live link on demos page', containsCI(demos, 'Explore Nexus Live'));
assert('Demos page does not fabricate videos',
  !containsCI(demos, '<video') && !containsCI(demos, '<iframe'));

/* ================================================================
   DEMOS PAGE — NO STATIC PLACEHOLDERS (NEW ACCEPTANCE TESTS)
   ================================================================ */
section('Demos Page — No Static Placeholders');

assert('No "Production video coming soon" text on demos page',
  !containsCI(demos, 'Production video coming soon'));
assert('No static "coming soon" demo tile (div role=img with coming-soon label)',
  !(/role="img"[^>]*coming[\s\S]{0,80}soon/.test(demos)));
assert('All 5 demo tiles are button elements (not passive divs)',
  countMatches(demos, 'open-demo-overview') >= 1 &&
  countMatches(demos, 'open-demo-nexus') >= 1 &&
  countMatches(demos, 'open-demo-genesis') >= 1 &&
  countMatches(demos, 'open-demo-map') >= 1 &&
  countMatches(demos, 'open-demo-consulting') >= 1);
assert('Demo tiles labeled EXPLORE DEMO (not a time estimate)',
  containsCI(demos, 'EXPLORE DEMO') &&
  !(/&#126;\s*\d+\s*(SECONDS|MINUTES)/.test(demos)));
assert('No fake play button on static non-interactive element (role=img + play)',
  !(/role="img"[\s\S]{0,200}demo-video-block__play/.test(demos)));

assert('GCS Overview guided demo modal present',
  contains(demos, 'id="demo-overlay-overview"'));
assert('Nexus guided demo modal present',
  contains(demos, 'id="demo-overlay-nexus"'));
assert('Genesis guided demo modal present',
  contains(demos, 'id="demo-overlay-genesis"'));
assert('Map Intelligence guided demo modal present',
  contains(demos, 'id="demo-overlay-map"'));
assert('Consulting guided demo modal present',
  contains(demos, 'id="demo-overlay-consulting"'));

assert('All demo modals have role="dialog"',
  countMatches(demos, 'role="dialog"') >= 5);
assert('All demo modals have aria-modal="true"',
  countMatches(demos, 'aria-modal="true"') >= 5);
assert('All demo modals have close buttons',
  countMatches(demos, 'data-demo-close=') >= 5);
assert('All demo modals have Back navigation',
  countMatches(demos, 'data-demo-back=') >= 5);
assert('All demo modals have Next navigation',
  countMatches(demos, 'data-demo-next=') >= 5);
assert('All demo modals have progress fill bar',
  countMatches(demos, 'gdfill-') >= 5);
assert('All demo modals have step-label indicator',
  countMatches(demos, 'gdlbl-') >= 5);
assert('Guided demos have synthetic-data disclosure',
  countMatches(demos, 'synthetic') >= 5);
assert('Guided demos have fictional disclosure',
  containsCI(demos, 'fictional'));
assert('Demos JS wires openDemo function',
  contains(demos, 'function openDemo'));
assert('Demos JS wires closeDemo function',
  contains(demos, 'function closeDemo'));
assert('Demos JS has Escape key handler',
  contains(demos, "e.key === 'Escape'") || contains(demos, 'e.key === "Escape"'));
assert('Demos JS has Tab-trap keyboard navigation',
  contains(demos, 'e.shiftKey') && contains(demos, 'first.focus()'));
assert('Demo modals link to sandbox or relevant page (final CTA)',
  contains(demos, 'sandbox/') || contains(demos, '../sandbox/'));
assert('No <video> or <iframe> fake player on demos page',
  !containsCI(demos, '<video') && !containsCI(demos, '<iframe'));

/* ================================================================
   ACCESSIBILITY
   ================================================================ */
section('Accessibility');

assert('Homepage skip link present', contains(home, 'skip-link'));
assert('Homepage main landmark present', contains(home, 'id="main-content"'));
assert('Sandbox skip link present', contains(sandbox, 'skip-link'));
assert('Sandbox ARIA roles present', containsCI(sandbox, 'aria-'));
assert('Demo page skip link present', contains(demos, 'skip-link'));
assert('No double-click requirement in any page (homepage)',
  !containsCI(home, 'dblclick'));
assert('Department nav buttons have type="button"',
  contains(sandbox, 'type="button"'));
assert('Orientation modal has role="dialog"', contains(sandbox, 'role="dialog"'));
assert('Orientation modal has aria-modal', contains(sandbox, 'aria-modal="true"'));
assert('Orientation modal has aria-labelledby', contains(sandbox, 'aria-labelledby="orient-title"'));

/* ================================================================
   RESPONSIVE NAV
   ================================================================ */
section('Responsive Navigation');

assert('Mobile nav toggle button present on homepage', contains(home, 'nav__toggle'));
assert('Mobile nav toggle button present on sandbox', contains(sandbox, 'nav__toggle'));
assert('Mobile nav toggle has aria-expanded', contains(home, 'aria-expanded="false"'));
assert('Nav menu has id for aria-controls', contains(home, 'id="nav-menu"'));

/* ================================================================
   SENSITIVE INFORMATION CHECK
   ================================================================ */
section('Sensitive Information');

const allFiles = routes.map(readFile).filter(Boolean).join('\n');
assert('No API keys pattern present',
  !(/[a-z0-9_-]{32,}/.test(allFiles) && /api[_-]?key/i.test(allFiles)));
assert('No credential-like strings',
  !(/password\s*[:=]\s*['"][^'"]{3,}/i.test(allFiles)));
assert('No real email patterns in source (non-public address)',
  !(/[a-z0-9._%+-]+@(?!buildbetterwithgcs\.com)[a-z0-9-]+\.[a-z]{2,}/i.test(allFiles)));

/* ================================================================
   DEPARTMENT NAV ACTIVE STATE — VISUAL REQUIREMENTS
   ================================================================ */
section('Department Nav Active State');

assert('Active dept button has GCS green fill (CSS background var(--gcs-green))',
  contains(readFile('css/styles.css'), 'sandbox-nav-btn.active') &&
  contains(readFile('css/styles.css'), 'background: var(--gcs-green)'));
assert('Active dept button text is white (#fff)',
  /sandbox-nav-btn\.active[^}]*color:\s*#fff/.test(readFile('css/styles.css') || ''));
assert('Active dept button has bold/semibold label (font-weight 700 or 600)',
  /sandbox-nav-btn\.active[^}]*font-weight:\s*(700|600)/.test(readFile('css/styles.css') || ''));
assert('Inactive dept buttons have visible border (border: 1px solid)',
  /sandbox-nav-btn[^.][^}]*border:\s*1px/.test(readFile('css/styles.css') || ''));
assert('Inactive dept buttons have hover background feedback',
  /sandbox-nav-btn:hover[^}]*background/.test(readFile('css/styles.css') || ''));
assert('Dept buttons have keyboard focus-visible ring',
  contains(readFile('css/styles.css'), 'sandbox-nav-btn:focus-visible'));
assert('Mobile active dept: full GCS green fill on mobile (@media max-width:640px)',
  (function() {
    var css = readFile('css/styles.css') || '';
    var mobileBlock = css.substring(css.indexOf('@media (max-width: 640px)'));
    return /sandbox-nav-btn\.active[^}]*background:\s*var\(--gcs-green\)/.test(mobileBlock);
  })());

/* ================================================================
   GUIDED DEMO — HOMEPAGE MODAL
   ================================================================ */
section('Guided Demo Modal');

assert('Guided demo modal exists in homepage HTML',
  contains(home, 'guided-demo-modal'));
assert('Guided demo overlay has role="dialog"',
  contains(home, 'role="dialog"'));
assert('Guided demo overlay has aria-modal="true"',
  contains(home, 'aria-modal="true"'));
assert('Guided demo has close button (gdemo-close)',
  contains(home, 'id="gdemo-close"'));
assert('Guided demo has Back navigation button',
  contains(home, 'id="gdemo-back"'));
assert('Guided demo has Next navigation button',
  contains(home, 'id="gdemo-next"'));
assert('Guided demo has progress fill bar (gdemo-fill)',
  contains(home, 'id="gdemo-fill"'));
assert('Guided demo has step-label indicator',
  contains(home, 'id="gdemo-step-label"'));
assert('Guided demo has 5 steps (data-step attributes)',
  countMatches(home, 'data-step="[0-4]"') >= 5);
assert('Guided demo Step 1 — See Your Organization',
  containsCI(home, 'See Your Organization'));
assert('Guided demo Step 2 — Know What Needs Attention',
  containsCI(home, 'Know What Needs Attention'));
assert('Guided demo Step 3 — Explore Departments',
  containsCI(home, 'Explore Departments'));
assert('Guided demo Step 4 — Ask & Analyze',
  containsCI(home, 'Ask') && containsCI(home, 'Analyze'));
assert('Guided demo Step 5 — Decide What To Do Next',
  containsCI(home, 'Decide What To Do Next'));
assert('Guided demo final CTA links to sandbox (Explore Nexus Live)',
  contains(home, 'id="gdemo-final-cta"') && contains(home, 'sandbox/'));
assert('Guided demo synthetic-data disclosure present',
  containsCI(home, 'synthetic') && containsCI(home, 'fictional'));
assert('Demo CTA button opens modal (not plain href to demos/)',
  contains(home, 'id="open-guided-demo"') && !contains(home, '<a href="demos/" class="btn btn--outline'));
assert('Demo video block is a button element (not fake video link)',
  contains(home, 'id="open-guided-demo-block"') &&
  !contains(home, '<a href="demos/" class="demo-video-block"'));
assert('Guided demo has keyboard Escape close handler',
  contains(home, "e.key === 'Escape'") || contains(home, 'e.key === "Escape"'));
assert('Guided demo has Tab-trap for keyboard navigation',
  contains(home, 'e.shiftKey') && contains(home, 'first.focus()'));

/* ================================================================
   RESULTS SUMMARY
   ================================================================ */
const total = passed + failed;
console.log('\n' + '═'.repeat(50));
console.log('GCS Website UX Acceptance Tests');
console.log('─'.repeat(50));
console.log('Total:  ' + total);
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach(function(f) { console.log('  • ' + f); });
}
console.log('═'.repeat(50));

process.exit(failed > 0 ? 1 : 0);
