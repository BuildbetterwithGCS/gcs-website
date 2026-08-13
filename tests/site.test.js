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
