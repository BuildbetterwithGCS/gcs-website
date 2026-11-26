# GCS contractor pilot acceptance How To checkpoint — 2026-11-25

## Scope

This bounded website increment mirrors the versioned founder acceptance contract in an inactive browser fixture and now fails CI if the fixture drifts from its provenance-stamped contract snapshot. It does not expose a route, navigation item, customer control, provider call, or production capability.

- Repository: `BuildbetterwithGCS/gcs-website`
- Branch: `feature/assistant-digest-preview-client-20261111`
- Pull request: #60
- Source contract: `gcs-contractor-pilot-acceptance-v1`
- Source repository: `BuildbetterwithGCS/gcs-founder`
- Source commit: `cce95c7b92d416949c2ace80aa60dbcab2dc1c3c`
- Classification: `INTERNAL_SYNTHETIC_NONPRODUCTION`
- Internal runner status mirrored: `PASS_INTERNAL_STEPS`
- External stage status mirrored: `BLOCKED_EXTERNAL`

## Implementation

- `tests/fixtures/contractor-pilot-acceptance-how-to.html`
  - `noindex,nofollow`
  - no links, form controls, scripts, or network path
  - seven exact internal step identifiers and acceptance arrays
  - explicit allowlisted synthetic-source, radius/freshness/deadline, viewer-exclusion, tenant-denial, restart, deduplication, no-contact, and no-submission criteria
  - six exact blocked prerequisite identifiers
  - source commit and path provenance
  - synthetic-only and no-customer-action boundary
- `tests/fixtures/gcs-contractor-pilot-acceptance-v1.snapshot.json`
  - bounded machine-readable founder contract snapshot
  - exact classification, statuses, steps, acceptance criteria, gates, onboarding phases, and prohibited claims
  - commit `ef3be990f284c7fbc3c42cc04a2487c22fce9de5`
- `tests/contractor-pilot-acceptance-how-to.test.js`
  - compares rendered step IDs, statuses, and every acceptance criterion against the snapshot
  - compares every blocked prerequisite against the snapshot
  - verifies source provenance, classification, onboarding phases, and prohibited claims
  - verifies noindex and inactive behavior
  - verifies tenant, payroll, billing, email, bid, and onboarding boundaries
  - rejects unsupported affirmative live claims and contact details
  - drift-guard commit `9bb129726ff8e8292576f7a2709469f903987a0c`

## Radius-bid contract synchronization

- snapshot commit: `6806e94bf50c6285fa79d5128c946d7eb9ad346e`
- inactive noindex How To commit: `f11de9851bd07165b92d3ec82be4a26ae3ac0160`
- drift-guard commit: `63a89ef63fe29671a991b1b58eaf6c16dbe88f4d`
- exact founder source head: `cce95c7b92d416949c2ace80aa60dbcab2dc1c3c`
- founder Genesis Tests #1551 passed before capture
- website CI #362 (run `45756716674`) passed on the exact drift-guard head
- fixture remains noindex, script-free, form-free, network-free, unlinked, and nonproduction
- live source/provider/runtime validation remains blocked
- no customer contact, Coastal data, email, payment, or bid submission occurred

## Byte-for-byte source provenance

The website snapshot now pins the exact founder acceptance payload from commit `cce95c7b92d416949c2ace80aa60dbcab2dc1c3c`:

- source path: `reports/gcs-contractor-pilot-acceptance-v1.json`
- exact UTF-8 payload size: `5,834` bytes
- SHA-256: `2443c0a8579f6d520bc0425c6a7e7221b023107565ddfc6cd92cd3103a0ff623`
- snapshot commit: `bc136d9ec8012ade2693f35fc5d4f7cd7a45260b`
- inactive HTML provenance commit: `09649aadbd5362d8a6d91a793090c37936212cd4`
- drift-test commit: `97e45a3213544030f4c571bc2305fcae5945d606`
- website CI #364 (run `45762784311`) passed on the exact test head

This pin is reviewer evidence only. It does not fetch the founder repository at runtime, expose a route, authorize a live source, or convert synthetic acceptance into production readiness.

## Verification evidence

Exact drift-guard head `9bb129726ff8e8292576f7a2709469f903987a0c` passed website CI #360 (run `45730680295`):

- unit and acceptance tests passed
- contractor pilot acceptance How To drift suite passed
- public-exposure guard passed
- internal-link check passed

Earlier implementation head `607bb9b7562eb25efe0bc2d6bcc5f5d691acb8e1` passed website CI #356 with 9 of 9 suites and 186 of 186 Jest tests.

## Release boundary

This increment does not modify production content and must remain unexposed. It does not establish provider verification, hosted-runtime readiness, billing activation, delivery, customer onboarding, payroll, or bid submission.

PR #60 remains draft, open, unmerged, and without independent review. Founder PR #130 remains open, unmerged, and without independent review. No merge or deployment was performed. Netlify production remains deploy `6af4b56535ac62fbe639b2c6` in ready state.

## Contractor cost acceptance synchronization — 2026-11-26

- verified founder source head: `f10dc7609cec781426fd6a779fb80c509a5428ae`
- verified founder Genesis Tests #1564: passed (run `45776953724`)
- exact UTF-8 source payload: `6,171` bytes
- exact source SHA-256: `169a5db462fe256dd7f3aa6913715db498a441bf1b3f87a3a09a7b36460a70e3`
- snapshot update commit: `8215f9c6c6f57f9573fe979b9d7acc5c30c3895f`
- inactive noindex How To update commit: `825823a3491feeefecf8de417de80a9f2cc821d7`
- drift-test update commit: `59f3548eac2d21cefbc952e9f8261cacd5d550b8`
- exact website branch head verified: `825823a3491feeefecf8de417de80a9f2cc821d7`
- website CI #366 passed on that exact head (run `45785299186`)
- mirrored acceptance now verifies tenant-scoped manager counts, employee self-scoping, bounded MATERIAL/EXPENSE counts, invalid PAYMENT rejection, and no amount/description exposure
- fixture remains noindex, script-free, form-free, network-free, unlinked, and nonproduction

No customer contact, Coastal data, email delivery, payment, banking action, bid submission, merge, or production deployment occurred. PR #60 and founder PR #130 remain unreviewed and unmerged. Netlify production remains deploy `6af4b56535ac62fbe639b2c6` in ready state.

## Cost-document acceptance synchronization — 2026-11-26

- verified founder source head: `d656355da9ce04ce85b0e033b732554ceec3dc3b`
- verified founder Genesis Tests #1576: passed (run `45793928068`)
- exact UTF-8 source payload: `6,614` bytes
- exact source SHA-256: `88150d16612056f75f54f806f0555cebd335b4d890161272c7fde9df51f0598d`
- snapshot update commit: `e89086060fba9842bfd566e930fb3f752e3660f5`
- inactive noindex How To update commit: `62cf85735da48574d13b8693a1f740df1017ea08`
- initial drift-test commit: `f544f5979a119446eeb92f4169708ddb7e80b14a`
- CI #368 correctly failed on the stale expected capture date only; no acceptance or release gate was weakened
- capture-date repair commit: `a3052b8a78e074c2105502ae8b64eb6524778e74`
- website CI #369 passed on the exact repaired head (run `45794365499`)
- mirrored acceptance covers visible-cost binding, cross-tenant cost/receipt denial, restart-safe manager audit, and absence of bytes, filename, path, URL, vendor, bank, or payment data
- fixture remains noindex, script-free, form-free, network-free, unlinked, and nonproduction

No customer contact, Coastal data, upload, storage-provider action, email, payment, banking action, bid submission, merge, or production deployment occurred.

## Document-dashboard acceptance synchronization — 2026-11-26

- verified founder source head: `3262bd24db57cfb08e722be6fdca9ceda615df1f`
- verified founder Genesis Tests #1592: passed (run `45813070860`)
- exact UTF-8 source payload: `7,107` bytes
- exact source SHA-256: `0af89e3986151f96f7b1b2957af54b2239d8b8a8f8498deb1429f6ccf70a0ddb`
- snapshot update commit: `7fd5facb125529327d595d7ee1eaf68b9d7b793b`
- inactive noindex How To update commit: `b110fb4c7de7676401b1e61018b24720362a8b43`
- drift-guard update commit: `07c14f965531e68d7ab1d85afecc3a14cb69a051`
- CI #371 correctly failed on an exact wording regression: the prior “invalid PAYMENT denial” phrase had been combined with new denial text
- wording repair commit: `21b5d53ad1d51dcf53121a5ca242ed8552ea1f89`
- website CI #372 passed on the exact repaired head (run `45813327977`)
- mirrored acceptance covers manager tenant scope, employee self scope, total plus PDF/JPEG/PNG counts only, invalid/unbounded source denial, and absence of IDs, hashes, bytes, actors, amounts, descriptions, vendor, or payment data
- fixture remains noindex, script-free, form-free, network-free, unlinked, and nonproduction

No customer contact, Coastal data, upload, storage-provider action, email, payment, banking action, bid submission, merge, or production deployment occurred.

## Low-literacy cost and receipt How To — 2026-11-26

- `bec5d8ad2abd89dc431b605ec432677c1e11e714` — add a noindex preview guide explaining manager tenant-wide and employee self-scoped MATERIAL/EXPENSE counts, fixed PDF/JPEG/PNG receipt counts, role-change visibility loss, and the difference between aggregate counts and source records.
- The guide contains no action control and states that receipt upload, document storage, reimbursement, payment, payroll, accounting posting, email delivery, and customer use are not live.
- It instructs readers not to enter or upload real customer, employee, banking, or receipt data from the guide.
- `edc3823b1d7b49dca962da5a6de0b316f0fbaa3e` — add deterministic content, noindex, no-control, privacy, and unsupported-live-claim tests.
- Website CI #374 (run `45860360285`) passed on the exact test head: 9 of 9 suites and 187 of 187 tests passed; public-exposure guard and internal-link check also passed.

This is preview guidance only. It does not expose a receipt upload, source record, reimbursement, payment, payroll, accounting, delivery, customer-data, provider, or production capability.

## Exact next action

Return to founder PR #130 and inventory the next missing synthetic Coastal-like contractor operation after materials/expenses. Implement the highest-impact bounded tenant-scoped gap—prefer a subcontractor directory with manager-only write access and employee-safe read boundaries—only if existing services do not already cover it. Require cross-tenant denial, restart persistence, privacy-minimized fields, and explicit no-invitation/no-payment/no-customer-contact evidence before composing it into the pilot.
