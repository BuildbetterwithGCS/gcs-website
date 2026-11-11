# GCS validated subscription save response checkpoint — 2026-11-05

## Bounded increment completed

The Nexus workspace preview no longer trusts a subscription save response's `staged_revision` by itself.

Before every save request, the browser now:

- clears the in-memory staged revision;
- disables **Continue to secure checkout**;
- replaces prior subscription/checkout guidance with a not-verified state.

After a successful authenticated save response, the browser now routes the complete response through the same fail-closed `subscriptionStatusView` used by refresh. It restores checkout readiness only for a recognized saved selection with unverified billing. It keeps checkout disabled when billing is verified but approval is pending, when access is already active, or when the response is contradictory/malformed. The prior local checkout intent and idempotency key are cleared after the server accepts a new selection response.

## Defect closed

Previously, the save handler called `checkoutReady(value.staged_revision)` directly. A response that reported billing verified and approval pending could therefore re-enable another provider handoff, and a contradictory response with a positive revision could bypass the validated state model.

## Traceability

- implementation commit: `dca59fe4ba1d4ca4dff4a8b5783d1c111e8180dd`
- regression-test commit: `be20831f128ff49c797d0bf40ed76ae3c45f60fb`
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58
- CI #207: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41975076808
- CI result: completed successfully
- exact executable-head preview: `6aec15daf1a95f5380917096`
- preview URL: https://6aec15daf1a95f5380917096--buildbetterwithgcs.netlify.app/
- preview commit reference: `be20831f128ff49c797d0bf40ed76ae3c45f60fb`
- preview state: ready; non-production remains protected by Netlify team SSO
- production remains unchanged and ready on deploy `6ae0b30c050624f6d7a81d67`

## Validation

The Jest/jsdom suite verifies that the save handler:

1. clears staged checkout state and presentation before the POST;
2. uses neutral request-completed wording instead of claiming unverified billing;
3. calls the shared validated subscription presentation;
4. no longer calls `checkoutReady(value.staged_revision)` directly;
5. shares approval-pending and active lockout behavior plus verified-active checkout cleanup with refresh.

## Truthful boundary

This is browser-side fail-closed onboarding state handling. It does not validate a live billing provider, charge, settlement, entitlement activation, hosted database, customer subscription, or production readiness. It changes no provider, billing, entitlement, legal, payroll, or account configuration.

## Review and release status

PR #58 remains draft and has no submitted independent review. Founder PRs #129 and #130 likewise have no submitted independent reviews. No merge or production deployment was performed.

## Exact next action

After independent frontend/security/privacy review, use the SSO-protected synthetic runtime to submit and observe:

1. a saved selection with unverified billing — checkout becomes ready only for the exact positive revision;
2. verified billing awaiting approval — checkout remains disabled and no staged revision is retained;
3. verified active access — checkout remains disabled and completed local checkout state is cleared;
4. contradictory or malformed response — status remains unavailable and checkout remains disabled;
5. request denial/session expiry — prior checkout readiness remains cleared and no checkout request can be started.

Also verify private/no-store response handling and tenant authorization on the reviewed runtime. Keep the PR protected and unmerged until those checks and independent review pass.
