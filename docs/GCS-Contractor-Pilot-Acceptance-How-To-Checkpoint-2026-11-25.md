# GCS contractor pilot acceptance How To checkpoint — 2026-11-25

## Scope

This bounded website increment mirrors the versioned founder acceptance contract in an inactive browser fixture. It does not expose a route, navigation item, customer control, provider call, or production capability.

- Repository: `BuildbetterwithGCS/gcs-website`
- Branch: `feature/assistant-digest-preview-client-20261111`
- Pull request: #60
- Source contract: `gcs-contractor-pilot-acceptance-v1`
- Classification: `INTERNAL_SYNTHETIC_NONPRODUCTION`
- Internal runner status mirrored: `PASS_INTERNAL_STEPS`
- External stage status mirrored: `BLOCKED_EXTERNAL`

## Implementation

- `tests/fixtures/contractor-pilot-acceptance-how-to.html`
  - `noindex,nofollow`
  - no links, form controls, scripts, or network path
  - seven exact internal step identifiers
  - six exact blocked prerequisite identifiers
  - synthetic-only and no-customer-action boundary
  - commit `d6696a00b57695e667f27519349796434270dd5b`
- `tests/contractor-pilot-acceptance-how-to.test.js`
  - verifies noindex and inactive behavior
  - verifies exact version, classification, and step/gate identifiers
  - verifies tenant, payroll, billing, email, bid, and onboarding boundaries
  - rejects unsupported affirmative live claims and contact details
  - commit `be46662bb4f519ac4413249bb451cc8028f94329`

## Release boundary

This increment does not modify production content and must remain unexposed. It does not establish provider verification, hosted-runtime readiness, billing activation, delivery, customer onboarding, payroll, or bid submission.

No merge or deployment is permitted from this checkpoint without exact-head green CI and the required independent frontend/security/privacy review. The existing production deployment remains unchanged.

## Exact next action

Wait for exact-head website PR #60 CI. If green, record the run and request independent frontend/security/privacy review. Keep this fixture unmerged and unexposed until review clears the material release gates; otherwise fix only the failing bounded check.
