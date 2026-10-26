const fs = require('fs');
const path = require('path');

describe('homepage claim boundaries', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  test('identifies the public Nexus experience as synthetic rather than a live integration', () => {
    expect(html).toContain('available today as a synthetic-data demonstration');
    expect(html).toContain('no customer system or live integration is represented');
    expect(html).not.toContain('Nexus connects the systems and information your organization already uses');
  });

  test('gates implementation work behind written scope and approvals', () => {
    expect(html).toContain('written scope, data-access approval, and agreement on paid additional work');
    expect(html).toContain('After written approval, configure Nexus and connect agreed information within the paid scope.');
  });
});
