# GCS checkout retry and navigation gate checkpoint — 2026-11-05

## Scope

This bounded increment hardens and tests the browser boundary around saved checkout-intent recovery on draft website PR #58. It does not activate a provider, billing, entitlement, or production customer flow.

## Completed

- Added `navigateToCheckout(view, value)` as the single browser navigation boundary.
- The boundary verifies that a callable location adapter exists, validates the handoff as plain HTTPS with no credentials, nonstandard port, or fragment, and only then calls `location.assign`.
- Routed the existing checkout handoff through that boundary without changing its saved revision, response-contract, or idempotency behavior.
- Added a direct navigation-adapter test proving valid HTTPS assignment occurs once and every rejected address causes zero assignments.
- Added a real initialized-DOM test for a saved checkout intent whose status response is deliberately delayed.
- Verified repeated pointer/keyboard-style activation starts one status request, one expired-session retry, and no new-intent request.
- Verified the same saved intent remains selected, the retry replaces the browser idempotency key, and a retry without a checkout URL safely re-enables the eligible selection.

## Evidence

- Navigation boundary: `f5db3e3b70f7a9db879f5a89dfef7d4245fdce9d`
- CI #219 passed: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42003709541
- Runtime and navigation tests: `8595379c239d3ffbeabd63fbdd1017fb75be2836`
- CI #220 passed: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42003767512

## Truthful boundary

These tests use synthetic responses and an injected location adapter. They do not prove a live provider session, payment authorization, charge, settlement, entitlement activation, customer identity, or working production subscription. Server-side idempotency, tenant authentication, private/no-store responses, provider-domain allowlisting, real provider validation, and independent review remain release gates.

## Release state

PR #58 remains draft and requires independent frontend, accessibility, privacy, and security review. Production must remain unchanged until all applicable review and runtime/provider gates pass.

## Exact next action

Add an allowlisted provider-origin contract to the reviewed server/client boundary so a generic HTTPS URL is not sufficient for navigation. Keep provider configuration server-controlled and avoid exposing provider-session identifiers. Add negative tests for unapproved HTTPS origins and a positive synthetic configured-origin test, then verify the exact head in CI and the SSO-protected preview.
