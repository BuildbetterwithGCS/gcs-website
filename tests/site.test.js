'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let passed = 0;
let failed = 0;
const failures = [];

function readFile(rel) {
  const full = path.join(ROOT, rel);
  return fs.existsSync(full) ? fs.readFileSync(full, 'utf8') : null;
}

function assert(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('  ✔ ' + name);
  } else {
    failed++;
    failures.push(detail ? name + ' — ' + detail : name);
    console.log('  ✖ ' + (detail ? name + ' — ' + detail : name));
  }
}

function section(title) {
  console.log('\n── ' + title + ' ──');
}

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

const routes = [
  'index.html',
  'nexus/index.html',
  'consulting/index.html',
  'industries/index.html',
  'about/index.html',
  'contact/index.html',
  'request-demo/index.html',
  'demos/index.html',
  'platform/index.html',
  'sandbox/index.html',
  'departments/index.html',
  'map-intelligence/index.html',
  'solutions/index.html',
  'genesis/index.html',
  'privacy/index.html',
  'accessibility/index.html',
  'responsible-ai/index.html',
  'reference/index.html',
  'terms/index.html',
  'founder/index.html',
  'founder-command-center/index.html'
];

const home = readFile('index.html');
const nexus = readFile('nexus/index.html');
const consulting = readFile('consulting/index.html');
const demos = readFile('demos/index.html');
const platform = readFile('platform/index.html');
const sandbox = readFile('sandbox/index.html');
const css = readFile('css/styles.css');
const demoPlayer = readFile('js/nexus-demo-player.js');

section('Routes');
routes.forEach((route) => assert(route + ' exists', readFile(route) !== null));

section('Sitewide navigation and footer');
routes.forEach((route) => {
  const html = readFile(route);
  assert(route + ' nav includes Nexus', containsCI(html, '>Nexus</a>'));
  assert(route + ' nav includes Contact', containsCI(html, '>Contact</a>'));
  assert(route + ' nav includes Request Demo CTA', containsCI(html, 'nav__link nav__link--cta'));
  assert(route + ' footer includes Request Demo', containsCI(html, 'request-demo/') && containsCI(html, '>Request Demo<'));
  assert(route + ' removes old nav labels', !containsCI(html, '>Platform</a></li>') && !containsCI(html, '>Demos</a></li>') && !containsCI(html, 'Explore Nexus Live') && !containsCI(html, 'Get Started'));
});

section('Homepage');
assert('Homepage title updated', contains(home, '<title>GCS | Build Better Organizations</title>'));
assert('Homepage meta description updated', containsCI(home, 'GCS combines operational expertise with Nexus'));
assert('Homepage hero headline', containsCI(home, 'Build Better Organizations.'));
assert('Homepage hero CTA See Nexus', contains(home, 'href="nexus/" class="btn btn--primary btn--lg">See Nexus</a>'));
assert('Homepage hero CTA Talk to GCS', contains(home, 'href="contact/" class="btn btn--ghost btn--lg">Talk to GCS</a>'));
assert('Homepage tertiary request demo link', containsCI(home, 'Request a Demonstration'));
assert('Homepage keeps dashboard preview', containsCI(home, 'dash-shell'));
assert('Homepage capability section present', containsCI(home, 'Four things Nexus enables.'));
assert('Homepage demo section present', containsCI(home, 'See Nexus in Action'));
assert('Homepage consulting section present', containsCI(home, 'Technology and expertise working together.'));
assert('Homepage industries section present', containsCI(home, 'Industries We Serve'));
assert('Homepage final CTA present', containsCI(home, 'See what GCS could do for your organization.'));
assert('Homepage removed entry-point section', !containsCI(home, 'Two Paths In') && !containsCI(home, 'Find your entry point'));
assert('Homepage removed redundant platform section', !containsCI(home, 'The platform that connects it all'));
assert('Homepage removed interactive scenario', !containsCI(home, 'What can GCS do for your organization?'));
assert('Homepage guided modal preserved', contains(home, 'guided-demo-overlay') && contains(home, 'id="open-guided-demo"'));
assert('Homepage guided modal final CTA updated', containsCI(home, 'Explore Nexus &rarr;'));

section('Nexus page');
assert('Nexus hero headline updated', containsCI(nexus, 'The GCS Operations Intelligence Platform.'));
assert('Nexus hero lead updated', containsCI(nexus, 'one operating picture'));
assert('Nexus hero explore CTA', contains(nexus, 'href="../sandbox/" class="btn btn--primary">Explore Nexus</a>'));
assert('Nexus request demonstration CTA', containsCI(nexus, 'Request a Demonstration'));
assert('Nexus disconnected information section', containsCI(nexus, 'Organizations run on disconnected information.'));
assert('Nexus connect existing systems section', containsCI(nexus, 'Connect what you already have.'));
assert('Nexus SEE KNOW ACT PROVE content', containsCI(nexus, 'SEE') && containsCI(nexus, 'KNOW') && containsCI(nexus, 'ACT') && containsCI(nexus, 'PROVE'));
assert('Nexus dashboard remains synthetic', containsCI(nexus, 'SYNTHETIC DEMO DATA'));
assert('Nexus capabilities list includes Ask Nexus and Map Intelligence', containsCI(nexus, 'Ask Nexus') && containsCI(nexus, 'Map Intelligence'));

section('Consulting page');
assert('Consulting eyebrow updated', containsCI(consulting, 'GCS Consulting Services'));
assert('Consulting hero headline updated', containsCI(consulting, 'Expertise and technology working together.'));
assert('Consulting lead updated', containsCI(consulting, 'GCS combines operational consulting with Nexus'));
assert('Consulting hero explore CTA updated', contains(consulting, 'href="../sandbox/" class="btn btn--outline">Explore Nexus</a>'));

section('Platform redirect page');
assert('Platform canonical points to /nexus/', contains(platform, 'href="https://buildbetterwithgcs.com/nexus/"'));
assert('Platform has meta refresh redirect', contains(platform, '<meta http-equiv="refresh" content="0;url=/nexus/" />'));
assert('Platform has JavaScript redirect', contains(platform, 'window.location.replace("/nexus/")'));
assert('Platform has moved notice', containsCI(platform, 'This page has moved.') && containsCI(platform, 'View the Nexus platform page'));

section('Demos page');
assert('Demos hero terminology updated', containsCI(demos, 'Watch Nexus Demo or explore for yourself.'));
assert('Demos uses Explore Nexus terminology', containsCI(demos, 'Explore Nexus'));
assert('Demos includes no-login support note', containsCI(demos, 'Interactive demonstration') && containsCI(demos, 'No login'));
assert('Demos keeps guided tour buttons', countMatches(demos, 'open-demo-') >= 5);
assert('Demos does not call tours videos in copy', !containsCI(demos, 'Watch GCS Demo') && !containsCI(demos, 'Explore Nexus Live'));
assert('Demos keeps modal infrastructure', countMatches(demos, 'role="dialog"') >= 5 && contains(demos, 'function openDemo'));

section('Sandbox and demo player');
assert('Sandbox remains synthetic', containsCI(sandbox, 'SYNTHETIC DATA'));
assert('Sandbox still loads demo player', contains(sandbox, 'js/nexus-demo-player.js'));
assert('Demo player uses deterministic clock', contains(demoPlayer, 'performance.now()') && contains(demoPlayer, 'requestAnimationFrame(tick)'));
assert('Demo player uses URLSearchParams', contains(demoPlayer, 'new URLSearchParams(window.location.search)'));
assert('Demo player removes speech synthesis', !contains(demoPlayer, 'speechSynthesis') && !contains(demoPlayer, 'SpeechSynthesisUtterance'));
assert('Demo player includes audio-ready scene fields', countMatches(demoPlayer, 'audioSrc: null') >= 8);
assert('Demo player updates aria-valuenow', contains(demoPlayer, 'aria-valuenow') && contains(demoPlayer, 'setAttribute(\'aria-valuenow\''));
assert('Demo player includes captions-only completion state', containsCI(demoPlayer, 'Demo complete. Explore Nexus interactively or request a real demonstration.') && contains(demoPlayer, 'ndp-player--captions-only'));
assert('Demo player hides unavailable audio button', contains(demoPlayer, 'ndp-btn--audio-unavailable'));
assert('Demo player uses ~10 scenes', countMatches(demoPlayer, 'id: \'') === 10);

section('CSS updates');
assert('CTA nav class styled', contains(css, '.nav__link--cta'));
assert('Legacy get-started class aliased', contains(css, '.nav__link--get-started'));
assert('Captions-only player modifier styled', contains(css, '.ndp-player--captions-only'));
assert('Audio unavailable button hidden', contains(css, '.ndp-btn--audio-unavailable { display: none; }'));

section('Public copy and safety');
const allHtml = routes.map(readFile).filter(Boolean).join('\n');
assert('No Explore Nexus Live remains', !containsCI(allHtml, 'Explore Nexus Live'));
assert('No Get Started remains in site copy', !containsCI(allHtml, 'Get Started'));
assert('Synthetic demo data remains labeled', containsCI(allHtml, 'SYNTHETIC DEMO DATA') || containsCI(allHtml, 'SYNTHETIC DATA'));
assert('No credential-like strings introduced', !(/password\s*[:=]\s*['"][^'"]{3,}/i.test(allHtml)));
assert('No non-public email addresses introduced', !(/[a-z0-9._%+-]+@(?!buildbetterwithgcs\.com)[a-z0-9-]+\.[a-z]{2,}/i.test(allHtml)));

console.log('\n' + '═'.repeat(50));
console.log('GCS Website Acceptance Tests');
console.log('─'.repeat(50));
console.log('Passed: ' + passed);
console.log('Failed: ' + failed);
if (failures.length) {
  console.log('\nFailures:');
  failures.forEach((msg) => console.log('  • ' + msg));
}
console.log('═'.repeat(50));

process.exit(failed > 0 ? 1 : 0);
