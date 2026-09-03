'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const excludedDirectories = new Set(['.git', 'node_modules', 'tests']);
const htmlFiles = [];
const failures = [];

function collect(directory) {
  fs.readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    if (excludedDirectories.has(entry.name)) return;
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return collect(fullPath);
    if (path.extname(entry.name) === '.html') htmlFiles.push(fullPath);
  });
}

function targetExists(pathname) {
  const relativePath = pathname.replace(/^\/+/, '');
  const target = path.join(ROOT, relativePath);
  return fs.existsSync(target) ||
    fs.existsSync(target + '.html') ||
    fs.existsSync(path.join(target, 'index.html'));
}

collect(ROOT);
htmlFiles.forEach((file) => {
  const html = fs.readFileSync(file, 'utf8');
  const hrefPattern = /\bhref=(["'])(.*?)\1/gi;
  let match;
  while ((match = hrefPattern.exec(html))) {
    const href = match[2];
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;
    const resolved = new URL(href, 'https://buildbetterwithgcs.com/' + path.relative(ROOT, file).replace(/index\.html$/, ''));
    if (resolved.hostname !== 'buildbetterwithgcs.com') continue;
    if (!targetExists(resolved.pathname)) failures.push(path.relative(ROOT, file) + ': ' + href);
  }
});

if (failures.length) {
  console.error('Internal-link check failed:\n' + failures.map((failure) => '  - ' + failure).join('\n'));
  process.exit(1);
}

console.log('Internal-link check passed (' + htmlFiles.length + ' HTML pages scanned).');
