# GCS contractor pilot acceptance How To checkpoint — 2026-11-25

## Scope

This bounded website increment mirrors the versioned founder acceptance contract in an inactive browser fixture and now fails CI if the fixture drifts from its provenance-stamped contract snapshot. It does not expose a route, navigation item, customer control, provider call, or production capability.

- Repository: `BuildbetterwithGCS/gcs-website`
- Branch: `feature/assistant-digest-preview-client-20261111`
- Pull request: #60
- Source contract: `gcs-contractor-pilot-acceptance-v1`
- Source repository: `BuildbetterwithGCS/gcs-founder`
- Source commit: `9f17202899cee04a2127ecc6ac90a06d3573a3d9`
- Classification: `INTERNAL_SYNTHETIC_NONPRODUCTION`
- Internal runner status mirrored: `PASS_INTERNAL_STEPS`
- External stage status mirrored: `BLOCKED_EXTERNAL`

## Implementation

- `tests/fixtures/contractor-pilot-acceptance-how-to.html`
  - `noindex,nofollow`
  - no links, form controls, scripts, or network path
  - seven exact internal step identifiers and acceptance arrays
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

Confirm this documentation-only exact head is green, then obtain independent frontend/security/privacy review for website PR #60 and the required review set for founder PR #130. Keep the fixture unmerged and unexposed until those gates clear. If review remains unavailable, advance the next isolated workstream: add a tested synthetic radius-qualification contract that requires authorized-source, distance, freshness, and tenant evidence and cannot submit or fabricate a bid.
