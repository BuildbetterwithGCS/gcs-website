'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'tests']);
const deployableExtensions = new Set(['.css', '.html', '.js', '.txt', '.xml']);
const files = [];

function collect(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (excludedDirectories.has(entry.name)) return;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(fullPath);
    if (deployableExtensions.has(path.extname(entry.name))) files.push(fullPath);
  });
}

function phrase(...parts) {
  return parts.join('');
}

const prohibited = [
  phrase('Gen', 'esis'),
  phrase('bot ', 'workforce'),
  phrase('agent ', 'workforce'),
  phrase('Sam ', 'Twin'),
  phrase('founder', '-command-center'),
  phrase('Jefferson ', 'Township'),
  phrase('RI-', '001'),
  phrase('internal ', 'command center'),
  phrase('AI ', 'workforce'),
  phrase('/gen', 'esis/'),
  phrase('/founder/'),
  phrase('/founder', '-command-center/')
];
const prohibitedRoutes = [
  phrase('gen', 'esis'),
  phrase('founder'),
  phrase('founder', '-command-center'),
  phrase('reference')
];

collect(ROOT);
const violations = [];
files.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  prohibited.forEach((term) => {
    if (content.includes(term.toLowerCase())) {
      violations.push(path.relative(ROOT, file) + ': prohibited public content "' + term + '"');
    }
  });
});
prohibitedRoutes.forEach((route) => {
  if (fs.existsSync(path.join(ROOT, route))) violations.push(route + ': prohibited public route exists');
});

const contact = fs.readFileSync(path.join(ROOT, 'contact/index.html'), 'utf8');
const demo = fs.readFileSync(path.join(ROOT, 'request-demo/index.html'), 'utf8');
const main = fs.readFileSync(path.join(ROOT, 'js/main.js'), 'utf8');

function requireMarkup(content, description, markup) {
  if (!content.includes(markup)) violations.push(description);
}

function requireRequiredField(content, description, id) {
  const pattern = new RegExp('<(?:input|select|textarea)\\b[^>]*\\bid="' + id + '"[^>]*\\brequired\\b', 'i');
  if (!pattern.test(content)) violations.push(description);
}

requireMarkup(contact, 'contact form name changed', 'id="contact-form" name="contact" method="POST" data-netlify="true"');
requireMarkup(contact, 'contact form notification attributes changed', 'netlify-honeypot="bot-field" data-contact-form');
['contact-name', 'contact-org', 'contact-email', 'contact-industry', 'contact-interest', 'contact-challenge'].forEach((id) => {
  requireRequiredField(contact, 'contact required field changed: ' + id, id);
});
requireMarkup(contact, 'contact success state changed', 'id="contact-success" hidden aria-live="polite"');
requireMarkup(contact, 'contact submission handler changed', "form.addEventListener('submit', function (e)");
requireMarkup(demo, 'demo form name changed', 'id="demo-form" name="demo-request" method="POST" data-netlify="true"');
requireMarkup(demo, 'demo form notification attributes changed', 'netlify-honeypot="bot-field" data-honest-form data-form-kind="Demonstration request"');
['demo-name', 'demo-email', 'demo-org', 'demo-type', 'demo-goals'].forEach((id) => {
  requireRequiredField(demo, 'demo required field changed: ' + id, id);
});
requireMarkup(demo, 'demo success state changed', 'data-form-result hidden tabindex="-1"');
requireMarkup(main, 'demo submission handler changed', "$$('[data-honest-form]').forEach(function (form)");
requireMarkup(main, 'demo Netlify submission changed', "fetch('/', {");
requireMarkup(demo, 'demo governed-AI notice missing', 'AI-assisted capabilities are available only within governed GCS engagements and are described at the level appropriate to the client’s needs.');

if (violations.length) {
  console.error('Public-exposure guard failed:\n' + violations.map((violation) => '  - ' + violation).join('\n'));
  process.exit(1);
}

console.log('Public-exposure guard passed (' + files.length + ' deployable files scanned).');
