# GCS stale subscription refresh cleanup checkpoint — 2026-11-04

## Bounded increment completed

The protected Nexus workspace preview now clears prior subscription presentation before every authenticated status refresh:

- clears the previously rendered subscription message to `Subscription status not verified.`;
- disables **Continue to secure checkout**;
- replaces prior checkout guidance with `Refresh subscription status before continuing.`;
- clears the in-memory staged selection revision before requesting `GET /subscription`;
- restores a checkout-ready or verified-active presentation only from the new validated response.

This prevents a failed, expired, denied, or malformed status refresh from leaving a previously active or checkout-ready state visible and actionable.

## Scope and truthful boundary

This is fail-closed browser presentation and state cleanup only. It does not change provider sessions, payment collection, settlement, billing verification, entitlement activation, tenant authorization, payroll, or production access. It does not prove a live checkout or working subscription.

## Traceability

- implementation commit: `53a5ee4470a8606272480987ad2080ca876a0c8c`
- regression-test commit: `11306e356226079af9c51b2a02b516a0ce5b5830`
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58
- CI run #204: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41969397178
- CI result: completed successfully
- exact-head Netlify deploy preview: `6aec090e4ff6dee671e3752d`
- exact-head preview URL: https://6aec090e4ff6dee671e3752d--buildbetterwithgcs.netlify.app/
- preview commit reference: `11306e356226079af9c51b2a02b516a0ce5b5830`
- preview state: ready; non-production remains protected by Netlify team SSO
- production deploy remains unchanged and ready: `6ae0b30c050624f6d7a81d67`

## Tests added

The Jest/jsdom suite verifies that:

1. an existing active subscription message is replaced with the unverified state;
2. a previously enabled checkout button is disabled;
3. stale checkout guidance is replaced before the request;
4. staged revision cleanup and presentation cleanup occur before the authenticated subscription request.

## Review and release status

PR #58 remains draft. Independent frontend/security/privacy review has not been submitted, so this change is not eligible to merge or publish to production. Production was not changed.

## Exact next action

After independent review, use the SSO-protected synthetic runtime to:

1. load a validated checkout-ready and a validated active state;
2. expire or revoke the session/entitlement;
3. refresh the workspace;
4. verify the previous subscription message and checkout readiness clear before the request completes;
5. verify no checkout request is made from stale state;
6. verify the response remains private/no-store and tenant authorization is enforced server-side.

Keep the PR protected and unmerged until those checks and the existing security/privacy gates pass.
