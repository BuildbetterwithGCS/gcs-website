# GCS single-flight checkout handoff checkpoint — 2026-11-05

## Bounded increment completed

The Nexus workspace preview now permits only one checkout handoff request at a time.

On the first click, the browser:

- sets an in-memory checkout-pending lock;
- disables **Continue to secure checkout** immediately;
- announces `Preparing secure checkout…`;
- continues to reuse the existing tenant-selection revision and durable browser idempotency key.

Repeated clicks while the first request is pending return without starting another status, create, or retry request. Refresh/presentation updates also keep the control disabled while the lock is active. When the request completes without navigation, the control is re-enabled only if the same saved selection remains checkout-eligible.

## Defect closed

Previously, rapid repeated clicks could start concurrent status/create/retry sequences. The server-side idempotency contract limited duplicate intent creation, but the browser could still issue overlapping requests and race local intent/idempotency storage or customer messaging.

## Traceability

- implementation commit: `c138da2ee58d4f0985962d0e149de8a7500b0be4`
- regression-test commit: `4e5a7505ec49555fbe85b71b9bfed78c30a34fbb`
- first CI #213 failed because one older source assertion still expected the pre-lockout disable expression; no product behavior failure was reported
- assertion repair: `e0be1d1ed176da0c72f3ffe78fb1b8f02d489a24`
- repaired CI #214: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41988919818
- repaired CI result: completed successfully
- exact-head preview: `6aec32fca4cb6328df1bd411`
- preview URL: https://6aec32fca4cb6328df1bd411--buildbetterwithgcs.netlify.app/
- preview commit reference: `e0be1d1ed176da0c72f3ffe78fb1b8f02d489a24`
- preview state: ready; non-production remains protected by Netlify team SSO
- production remains unchanged and ready on deploy `6ae0b30c050624f6d7a81d67`

## Validation

The Jest suite verifies:

1. the pending lock is checked before any checkout request;
2. the button is disabled and status announced before request dispatch;
3. checkout presentation cannot re-enable the button while pending;
4. the lock is released after completion;
5. the control is re-enabled only when no navigation occurs and the saved revision remains eligible;
6. the existing idempotency key and exact staged-selection revision remain in the request contract.

## Truthful boundary

This is browser-side duplicate-request prevention. It does not establish a live provider session, charge, settlement, verified billing, entitlement activation, hosted runtime, or production subscription. Server-side idempotency and tenant authorization remain mandatory.

## Review and release status

PR #58 remains draft with no submitted independent review. Founder PRs #129 and #130 likewise remain draft with no submitted independent reviews. No merge or production deployment was performed.

## Exact next action

After independent frontend/security/privacy review, use the SSO-protected synthetic runtime to:

1. double-click and keyboard-repeat the checkout control under delayed status/create/retry responses;
2. verify exactly one request sequence begins and the control remains disabled;
3. verify a failed/no-URL response can be retried only after completion with the same eligible staged revision;
4. verify navigation occurs only for the validated current provider-session URL;
5. verify server idempotency, private/no-store handling, and tenant authorization remain enforced.

Keep the PR protected and unmerged until those checks and the existing provider/security gates pass.
