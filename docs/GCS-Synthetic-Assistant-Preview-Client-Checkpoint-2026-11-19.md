# GCS Synthetic Assistant Preview Client Checkpoint — 2026-11-19

## Outcome

Draft website PR #60 now contains an inactive validator and detached renderer for the backend's explicitly non-deliverable synthetic assistant review preview.

## Evidence

- client implementation: `5ffdc628617e0d141e899931cebb1f9e50508d7c`
- focused tests: `41e152e7619e99c3536c7fcac402bb612d1e9e87`
- CI #343 failed only because one test expected a narrower error prefix from the existing shared timestamp validator
- test-only repair: `1b065dc6c17f56fc58d42fe77ca657bfb7daf741`
- exact-head CI #344: success
- workflow: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/44508494782
- pull request: https://github.com/BuildbetterwithGCS/gcs-website/pull/60

## Verified client contract

- Accepts only schema `assistant-synthetic-review-preview-v1`.
- Requires classification `TEST_DATA_NOT_DELIVERABLE`.
- Requires every item to carry `is_synthetic=true`.
- Rejects unknown top-level, item and evidence fields, including tenant, record, recipient and provider data.
- Enforces bounded item count, timestamps, evidence ordering, duplicate denial and HTTPS source validation.
- Retains strict bid evidence requirements for source URL, known location and verified radius match.
- Renderer writes titles/actions/evidence with `textContent` into a caller-supplied container.
- HTML/script-shaped test strings remain text and create no executable elements.
- Optional source links use `nofollow noopener noreferrer`.
- The functions contain no `fetch`, request path, recipient, provider, send or delivery behavior.
- No visible control, DOM container, initialization hook or route invocation was added.

## Release boundary

This is draft, inactive browser contract code. It does not prove the backend route is mounted, a subscription is live, a provider is configured, email can be delivered, or Coastal data is available. It does not contact or onboard Coastal Concrete Restoration. Independent frontend/security/privacy review is required before any UI or runtime wiring.

Verified production remains Netlify deploy `6af4b56535ac62fbe639b2c6`; this increment was not deployed.

## Blockers

- Website PR #60 has no independent review.
- Founder PR #130 has no independent review.
- Protected runtime and real provider validation remain unavailable.

## Exact next action

Update the synthetic Coastal-like pilot readiness inventory and acceptance checklist to reference the new backend/client test-preview evidence while keeping delivery, provider, live entitlement and customer onboarding statuses blocked. Do not add runtime wiring or a visible control.
