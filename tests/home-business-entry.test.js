const fs = require('fs');
const path = require('path');
describe('homepage business storefront discovery', () => {
 const home = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
 test('offers a visible direct business software entry', () => {
  expect(home).toMatch(/href="business\/"[^>]*>[^<]*(Business Software|Explore Business Software)/i);
 });
 test('does not misrepresent subscriptions as active', () => {
  expect(home).not.toMatch(/Subscribe Now|Start Free Trial|Pay Now/i);
 });
});
