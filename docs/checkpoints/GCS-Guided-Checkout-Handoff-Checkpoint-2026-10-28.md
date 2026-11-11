# GCS Guided Checkout Handoff Checkpoint — 2026-10-28

## Completed increment

Draft website PR #58 now includes a low-literacy, resumable checkout action
that matches founder PR #130's authenticated checkout-intent contract.

The portal:

- enables **Continue to secure checkout** only after a saved pending selection
  returns an exact staged revision;
- creates a 192-bit cryptographic browser idempotency key;
- sends only the exact selection revision and idempotency key to the
  tenant-authenticated checkout-intent route;
- saves only the local intent ID and idempotency key in session storage so a
  page refresh can resume the same intent;
- requests status for an existing intent instead of creating duplicates;
- accepts only a plain HTTPS checkout handoff without userinfo, fragments or a
  nonstandard port; and
- leaves the customer on the workspace with a clear pending message when no
  allowlisted provider URL is ready.

Changing the saved subscription selection clears the prior local intent and
idempotency key. An active subscription does not enable a new checkout action.
The browser never accepts provider, tenant, actor, role, bank, card,
provider-session or subscription identifiers from the customer form.

## Verification

- Checkout implementation head:
  `36a7f60a8999b03cf3f5041a4a9cf75f9e544f19`.
- Regression-test head:
  `c15df23a8d5f83bfc6261de27b5e5b452520a170`.
- Final UI head:
  `a47be37e29a3e56adc963ba56782465066e2feb6`.
- Website CI run #93 passed:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40765711106

Tests cover cryptographic key generation, fail-closed randomness, HTTPS-only
handoff validation, userinfo/fragment/alternate-port rejection, the existing
private fetch policy and CSRF behavior.

## Boundary and release state

This is an inactive frontend preview. No provider session is created, no payment
data is collected, no customer is charged and no entitlement is activated.
Website PR #58 and founder PRs #129/#130 still lack independent review. No
merge, deploy preview or production deployment occurred; Netlify production
was unchanged.

## Exact next action

After independent review, connect a protected deploy preview to the reviewed
synthetic runtime and verify the complete browser journey: saved selection,
idempotent intent creation, refresh/resume, pending provider state, allowlisted
sandbox redirect, expired-session retry, session/CSRF denial and no-store
headers on actual HTTPS responses. Live billing remains gated on official
provider sandbox validation and signed-webhook evidence.
