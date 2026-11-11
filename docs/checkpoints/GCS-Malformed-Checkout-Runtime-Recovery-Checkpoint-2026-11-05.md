# GCS Malformed Checkout Runtime Recovery Checkpoint — 2026-11-05

## Bounded increment completed

The checkout click flow now replaces the pending message with a truthful retry state when the authenticated server returns an invalid checkout response. An otherwise eligible saved subscription selection is re-enabled only after the pending operation ends.

A synthetic DOM test sends a URL-bearing intent with `created_at > updated_at` through the real click handler and verifies:

- exactly one checkout-intent request
- the invalid intent is not persisted
- the browser location remains unchanged
- the eligible checkout control is re-enabled
- the pending message changes to `Secure checkout was not started. Try again later.`
- the general task status remains an error rather than a success claim

## Traceability

- recovery implementation: `d90baf392a526a2f235ed1867e831723c30256ef`
- runtime regression test: `609894eea78b7340043be3c3a76bd18a35768f12`
- assertion repair: `0d14c653c725b1b5025ace039b020e0958d5ea83`
- final website CI #235: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42037657859
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58

CI #234 correctly failed because an older source-order assertion did not include the new recovery-message branch. The assertion was updated to require the recovery branch and subsequent eligibility branch in order; the full suite then passed.

## Truthful boundary

This is synthetic browser/runtime validation. It does not prove a live provider session, payment collection, settled billing, entitlement activation, payroll compliance, or production customer access.

## Release gates

PR #58 remains draft pending independent accessibility, content, privacy, and security review. Founder PR #130 retains its separate identity, database, provider-sandbox, billing-evidence, rollback, and platform-access gates. A green synthetic suite is not independent approval.

## Exact next action

Add saved-intent malformed-status recovery: clear only the corrupted saved intent and its idempotency key after a validated status failure, preserve the eligible saved subscription revision, and prove the next activation creates one fresh exact-revision intent without navigation or stale-state reuse.
