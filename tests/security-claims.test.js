const fs = require('fs');
const path = require('path');

describe('security and public-record claim boundaries', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'security', 'index.html'), 'utf8');

  test('keeps the public demonstration separate from client records', () => {
    expect(html).toContain('The public Nexus experience uses synthetic example data and is separate from client records.');
  });

  test('requires engagement-specific handling controls to be agreed and validated', () => {
    expect(html).toContain('Engagement-specific access, storage, transfer, retention, and incident-response requirements must be agreed in writing and validated for that engagement.');
    expect(html).toContain('A request to perform work outside the agreed record-handling scope requires written approval before the additional paid work begins.');
  });

  test('does not imply unsupported certifications or authorizations', () => {
    expect(html).toContain('GCS does not claim SOC 2, ISO 27001, FedRAMP, HIPAA, or any other security certification or regulated-environment authorization unless a current, verifiable certification or written authorization specifically applies.');
  });
});
