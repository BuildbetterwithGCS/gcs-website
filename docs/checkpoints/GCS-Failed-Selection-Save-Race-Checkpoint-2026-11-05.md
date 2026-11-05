# GCS Failed Selection Save Race Checkpoint — 2026-11-05

## Bounded increment completed

The companion checkout race now has executable DOM coverage for a failed newer subscription save while an older checkout request remains in flight.

The test proves:

1. checkout begins for saved revision 7 and its response is delayed
2. the customer submits a newer selection
3. the newer save returns HTTP 503
4. subscription status is cleared to an unverified state
5. checkout remains disabled while the old response is pending
6. the valid-but-stale revision 7 response is rejected
7. no intent or idempotency key is persisted
8. browser location remains unchanged
9. checkout remains locked after both failures
10. a new page lifecycle performs an authenticated subscription refresh
11. only the validated saved subscription response restores checkout eligibility

## Traceability

- runtime test: `573548c02ccb77a51d8a16084fc82141d9756ee6`
- subscription-copy assertion repair: `d7af0ff8f129976593789b4938011f0bc36bf3ce`
- checkout-copy assertion repair: `263c2fbf7b2c942cb8a5e8d8cabc7dc7641e2d43`
- final website CI #246: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42067522023
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58

CI #244 and #245 reached successive final refresh assertions and exposed stale expected strings in the new test. Both assertions were aligned to the existing customer-facing copy; the behavioral safeguards passed in the final full suite.

## Truthful boundary

This is synthetic browser/runtime validation. It does not prove live provider checkout, payment collection, settlement, entitlement activation, payroll compliance, or production customer access.

## Release gates

PR #58 remains draft pending independent accessibility, content, privacy, and security review. Founder PR #130 retains separate identity, database, provider-sandbox, billing-evidence, rollback, and platform-access gates. Green synthetic CI is not independent approval.

## Exact next action

Add the entitlement-transition race: while checkout for a pending selection is in flight, an authenticated subscription response becomes billing-verified and access-granted. Prove the local checkout state is cleared, the stale response cannot persist or navigate, and the active workspace remains locked against another checkout.
