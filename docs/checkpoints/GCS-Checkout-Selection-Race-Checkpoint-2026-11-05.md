# GCS Checkout Selection Race Checkpoint — 2026-11-05

## Bounded increment completed

The checkout click flow now captures the exact saved subscription revision at activation and treats it as an immutable request boundary.

Before any response-derived intent, recovered idempotency key, or provider URL can be stored or used, the browser compares the current saved revision with that captured revision. If the customer has started or completed saving a newer selection, the old response:

- removes stale checkout intent and idempotency state
- fails closed before intent persistence
- fails closed before provider navigation
- leaves checkout eligibility governed by the newly validated subscription response

Response-derived storage is deferred until this final revision check passes.

## Runtime validation

A synthetic DOM race test:

1. begins a checkout for revision 7 and delays its response
2. submits and validates a newer pending-billing selection at revision 8
3. verifies checkout stays disabled while the old request is pending
4. releases the valid-but-stale revision 7 response
5. verifies the request body was bound to revision 7
6. verifies no intent or idempotency key remains
7. verifies browser location is unchanged
8. verifies the revision 8 selection becomes eligible only after its save response was validated
9. presents a truthful retry/error state instead of checkout success

## Traceability

- implementation: `dd30272f6bad3f06a439d65a1f69634f83ea941c`
- runtime race test: `d63c84d796494941e6bfdf85a27e0980efc8c05c`
- source-boundary assertion repair: `2f05bf0cdcce884b4fcfed68c54f06222c28a828`
- final website CI #242: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42057772467
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58

CI #241 correctly failed because an older source assertion expected the mutable `stagedRevision` in the request body. The repaired assertion now requires the captured `checkoutRevision` and the final live-revision comparison.

## Truthful boundary

This is synthetic browser/runtime validation. It does not prove a live provider session, payment collection, settlement, entitlement activation, payroll compliance, or production customer access.

## Release gates

PR #58 remains draft pending independent accessibility, content, privacy, and security review. Founder PR #130 retains separate identity, database, provider-sandbox, billing-evidence, rollback, and platform-access gates. Green synthetic CI is not independent approval.

## Exact next action

Add the companion race test where saving the newer selection fails while the older checkout response is still in flight. Prove the old response remains rejected, checkout stays locked with no persisted intent or navigation, and only a later authenticated subscription refresh can restore eligibility.
