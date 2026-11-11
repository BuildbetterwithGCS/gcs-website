# GCS expired checkout handoff lockout checkpoint — 2026-11-05

## Scope

This bounded increment closes a browser fail-closed gap at the already reviewed draft server/client checkout boundary. It does not create a provider session, activate billing, or expose production customer access.

## Existing server boundary verified

Founder PR #130 already implements the authoritative provider redirect allowlist in `CheckoutBindingService`:

- only a trusted provider adapter can bind the redirect;
- the exact lowercase ASCII host must be in the server-configured allowlist;
- HTTPS/default TLS, no credentials, no fragment, and a bounded provider-session lifetime are required;
- expired sessions return no redirect;
- retry and subscription binding delete the redirect; and
- authenticated customer responses omit provider, provider-session, and subscription identifiers.

Evidence already retained in `reports/GCS-Checkout-Redirect-Allowlist-Checkpoint-2026-10-28.md` at implementation head `ff8d61dbe3e55160e3baa89b621734f40263c1e5`, Genesis Tests #679 green.

Duplicating provider configuration in browser code would create a second drifting allowlist and was intentionally avoided.

## Completed browser increment

- `validatedCheckoutIntent` now accepts a clock only for deterministic testing and rejects a non-null checkout URL unless its provider-session expiry is a valid future instant.
- Expiry at the current instant fails closed; expiry must be strictly later.
- Provider-session responses with no checkout URL remain valid so the existing expired-session retry path can inspect and recover them.
- Added deterministic boundary tests for immediately-before, exactly-at, and after-expiry handling.
- Added an end-to-end validation/navigation test proving an expired URL never reaches `location.assign`.

## Evidence

- Browser implementation: `5336d336ecaf130cbb2259142cf0ccfd0b5d91f2`
- CI #222 failed because the existing positive fixture used a timestamp already in the past; this was the expected new fail-closed behavior, not a separate product regression.
- Deterministic fixture and regression tests: `b000471e3be0e116013e18dd5c73b9b178aba5f0`
- CI #223 passed: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42012594895

## Truthful boundary

The browser coverage uses synthetic responses. It does not prove provider availability, payment authorization, charge, settlement, entitlement activation, customer identity, or a working production subscription. The server allowlist, provider adapter, tenant authentication, no-store responses, signed provider evidence, independent review, and real provider validation remain release gates.

## Release state

Website PR #58 and founder PR #130 remain draft, mergeable, and without independent reviews. Production must remain unchanged until the applicable frontend, accessibility, privacy, security, billing, and provider/runtime gates pass.

## Exact next action

Add a maximum future-lifetime guard to the customer response contract so the browser also rejects an implausibly long checkout expiry rather than trusting an arbitrary future instant. Match the server's existing 24-hour maximum, add deterministic boundary tests, and preserve provider-neutral response fields.
