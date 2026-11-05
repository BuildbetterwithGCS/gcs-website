# GCS Saved Checkout State Recovery Checkpoint — 2026-11-05

## Bounded increment completed

The saved checkout-intent path now distinguishes transport failure from response-contract failure:

- a successful request with a structurally invalid or mismatched saved-status response clears only the browser's stale checkout intent and associated idempotency key before failing closed
- an HTTP/network failure occurs before response validation and preserves both retry keys
- the saved subscription revision remains unchanged, so an otherwise eligible customer can retry without re-entering the selection

## Runtime validation

Synthetic DOM tests prove:

1. the first activation makes exactly one status request for the saved intent
2. a non-monotonic URL-bearing status is rejected before storage or navigation
3. the corrupted intent and idempotency key are removed
4. the eligible control is re-enabled with a truthful retry state
5. the second activation makes exactly one fresh checkout-intent request
6. the request carries `expected_selection_revision: 7` and a fresh 192-bit browser idempotency key
7. the fresh no-URL intent is stored without changing browser location
8. a 503 status failure preserves the original saved intent/idempotency pair for retry

## Traceability

- implementation: `b2ef15a51daf7b9db4360bd22781569e4fdc105f`
- runtime tests: `706183311d2e663b3a858ee48f4f93e98d8b839c`
- website CI #238: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42047153351
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58

## Truthful boundary

These are synthetic browser/runtime guarantees. They do not prove a live provider session, payment collection, settlement, entitlement activation, payroll compliance, or production customer access.

## Release gates

PR #58 remains draft pending independent accessibility, content, privacy, and security review. Founder PR #130 retains separate identity, database, provider-sandbox, billing-evidence, rollback, and platform-access gates. Green synthetic CI is not independent approval.

## Exact next action

Add a delayed-response race test in which the customer saves a newer subscription revision while an older checkout-intent request is in flight. Prove the stale response is rejected before intent persistence or navigation and checkout stays locked until the newer saved selection has been validated.
