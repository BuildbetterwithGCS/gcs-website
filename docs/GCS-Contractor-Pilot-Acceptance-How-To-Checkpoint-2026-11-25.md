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

## Exact next action

Confirm this documentation-only exact head is green. Then add a canonical source-contract digest to the website snapshot and drift test so a reviewer can verify the captured founder acceptance payload byte-for-byte against founder head `cce95c7b92d416949c2ace80aa60dbcab2dc1c3c`. Keep both PRs unmerged and production unchanged until independent frontend/security/privacy review is recorded.
