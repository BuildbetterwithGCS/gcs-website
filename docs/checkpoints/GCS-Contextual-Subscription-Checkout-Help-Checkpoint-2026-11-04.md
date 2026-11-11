# GCS contextual subscription checkout help checkpoint — 2026-11-04

## Contract verification

The guide was checked against the subscription, checkout, billing-inbox, reconciliation, and entitlement boundaries in founder PR [#130](https://github.com/BuildbetterwithGCS/gcs-founder/pull/130).

Those contracts distinguish:

1. a versioned saved module/user selection;
2. a local durable checkout handoff bound to that exact selection;
3. an allowlisted HTTPS provider redirect when a trusted adapter supplies one;
4. provider billing evidence accepted only through the signed-event boundary;
5. verified active billing plus server-side access grant after required independent approval.

Synthetic provider tests do not establish a live charge, settlement, subscription, or entitlement.

## Bounded website increment

Website PR [#58](https://github.com/BuildbetterwithGCS/gcs-website/pull/58) now links the subscription panel directly to a searchable low-literacy guide.

The guide explains:

- saving a selection is not a charge and grants no access;
- provider redirect is a handoff, not payment or settlement proof;
- an expired handoff may be retried only after the server reports expiry, using a fresh retry key without an automatic charge;
- a changed package, modules, user limit, or pricing terms makes the old handoff stale;
- returning from checkout does not activate access;
- access requires the authenticated server to report active status, verified billing, granted access, and completed independent approval.

## Verification

- Executable head `7b9e764c7af3db7a9523bc41769cf016ebd3ed3e`.
- GitHub Actions CI [41926530564](https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41926530564): **passed**.
- Netlify deploy preview `6aebb311727c3c25f45e5dee`: **ready**, exact commit ref `7b9e764c7af3db7a9523bc41769cf016ebd3ed3e`, context `deploy-preview`, not published.
- Non-production access remains protected by team SSO.
- Published production remains unchanged on ready deploy `6ae0b30c050624f6d7a81d67`.

## Review and release boundary

Website PR #58 and founder PRs #129/#130 remain drafts with zero independent reviews. No merge or production release was performed.

No official billing provider, signature verifier, settlement evidence, live subscription, production identity, or entitlement activation has been verified.

## Exact next action

Obtain independent review of PRs #129, #130, and #58. While review is pending, inspect the saved-dashboard onboarding state and add a contextual low-literacy guide explaining what is saved, what refreshes, what access loss clears, and which dashboard totals are operational summaries rather than accounting or payroll records.
