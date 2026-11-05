# GCS checkout-intent response validation checkpoint — 2026-11-05

## Bounded increment completed

The Nexus workspace preview now validates the complete authenticated checkout-intent response before it can be persisted, retried, or used for navigation.

The validator requires the exact minimized customer contract:

- format-bounded intent ID;
- positive selection revision;
- boolean current-selection signal;
- one of `READY_FOR_PROVIDER`, `PROVIDER_SESSION`, or `SUBSCRIPTION_BOUND`;
- valid bounded created/updated timestamps;
- null or valid bounded expiry timestamp;
- null or plain HTTPS checkout URL;
- no extra provider, subscription, tenant, workspace, actor, billing, or credential fields.

A checkout URL is accepted only when the response is for the current selection and the status is `PROVIDER_SESSION`. New-intent responses must match the staged selection revision. Status and retry responses must match the saved intent ID, and retry responses must also match the staged revision.

## Defect closed

Previously, checkout responses were stored and could drive retry/navigation logic before the complete response shape was validated. A malformed response could persist an invalid intent identifier, carry an unexpected selection revision, over-share internal fields, or present a URL in an inconsistent state.

## Traceability

- implementation commit: `62dc2214fcf1d739943b87cf5a425a4b7d54e88f`
- regression-test commit: `94801fa5ef6fc1cd085c6531780f0da1109d4080`
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58
- CI #210: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41982385387
- CI result: completed successfully
- exact executable-head preview: `6aec25aa88af000b0b077aa2`
- preview URL: https://6aec25aa88af000b0b077aa2--buildbetterwithgcs.netlify.app/
- preview commit reference: `94801fa5ef6fc1cd085c6531780f0da1109d4080`
- preview state: ready; non-production remains protected by Netlify team SSO
- production remains unchanged and ready on deploy `6ae0b30c050624f6d7a81d67`

## Validation

The Jest/jsdom suite verifies:

1. the exact minimized ready/provider-session shapes are accepted;
2. unexpected internal fields are rejected;
3. invalid intent IDs, revisions, booleans, statuses, timestamps, expiries, and URL/state combinations are rejected;
4. mismatched expected intent IDs and staged revisions are rejected;
5. every status, create, and retry response passes through the validator before browser intent storage.

## Truthful boundary

This validates browser handling of synthetic response contracts only. It does not establish a live provider session, charge, settlement, billing verification, entitlement activation, hosted runtime, or production subscription.

## Review and release status

PR #58 remains draft with no submitted independent review. Founder PRs #129 and #130 likewise remain draft with no submitted independent reviews. No merge or production deployment was performed.

## Exact next action

After independent frontend/security/privacy review, exercise the validator against the SSO-protected synthetic runtime:

1. create an exact current-selection ready intent;
2. bind an authorized provider-session redirect and verify only the allowlisted HTTPS handoff navigates;
3. return stale revision, mismatched intent ID, over-shared internal field, invalid timestamp, and inconsistent URL/status responses and verify no storage or navigation;
4. expire a provider session and verify one fresh-key retry remains bound to the same intent and staged revision;
5. verify private/no-store response handling and server-side tenant authorization.

Keep the PR protected and unmerged until those checks and the existing provider/security review gates pass.
