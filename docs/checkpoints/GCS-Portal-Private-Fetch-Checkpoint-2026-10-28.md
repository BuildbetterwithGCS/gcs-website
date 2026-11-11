# GCS Portal Private Fetch Checkpoint — 2026-10-28

## Completed increment

Draft website PR #58 now applies an explicit private fetch policy to every
Nexus workspace API request.

The browser client now:

- keeps session credentials same-origin;
- uses `cache: no-store` for dashboard, workforce, invoice, subscription and
  checkout-related API calls;
- uses `mode: same-origin` so the API contract cannot be redirected to a
  cross-origin request;
- uses `redirect: error` so login, proxy or routing redirects fail closed
  instead of silently following; and
- uses `referrerPolicy: no-referrer` to avoid disclosing workspace page URLs.

State-changing requests still require the existing double-submit CSRF token.
The browser payload continues to omit tenant, actor, role, provider, billing,
bank and password fields.

## Verification

- Implementation head: `00519c6f446c84aca1bbfeab088e76cf24cd192a`.
- Regression-test head: `cdb4944472146d603816f3da0a32aa72a6e045fa`.
- Website CI run #91 passed:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40756697906

Tests verify the private fetch policy on both safe reads and state-changing
requests while preserving CSRF enforcement.

## Boundary and release state

This remains an inactive frontend preview. It is not connected to a live
backend, customer identity, hosted tenant database, checkout provider or
billing settlement. PR #58 has no independent accessibility/privacy/security
review. No merge, deploy preview or production deployment occurred; Netlify
production was unchanged.

## Exact next action

After independent review of website PR #58 and founder PRs #129/#130, connect a
protected Netlify deploy preview to a synthetic reviewed runtime. Verify actual
HTTPS no-store headers, redirect failure, session expiry, CSRF denial, role
denial, keyboard/touch behavior and responsive layout before production
customer exposure.
