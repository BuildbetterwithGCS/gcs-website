# GCS expired-checkout UI recovery checkpoint — 2026-10-28

## Completed increment

- Website draft PR #58 now recognizes an expired checkout only when the authenticated server status reports `PROVIDER_SESSION` with a valid expiry at or before the current instant.
- The browser generates a new 192-bit cryptographic idempotency key and calls the existing authenticated `/api/nexus/subscription/checkout-intent/retry` route for the same local intent ID.
- The replacement key is saved only after the server accepts the retry. The tenant, workspace, actor, provider, session and subscription remain server-derived and are never supplied by browser code.
- Ready, unexpired, malformed-expiry and unknown states do not trigger retry. The existing HTTPS handoff validation and pending-entitlement boundary remain unchanged.

## Verification

- JavaScript syntax checks passed for `js/business-app.js` and `tests/business-app.test.js`.
- Focused local checks passed for the exact expiry boundary, wrong-status denial and retry request/key contract.
- Website CI run #98 passed at implementation/test head `1d6c0c1121bd5bcc4387b15530907494b28162db`:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40773533099

## Truthful boundary

This remains an inactive frontend preview. It resets only the durable local handoff through the existing authenticated API contract. It does not create a provider session, collect payment information, charge or settle funds, activate an entitlement, merge code or deploy production.

## Review and release status

- PR #58 remains draft and has no independent review.
- Founder PRs #129 and #130 remain draft and unreviewed dependencies.
- Netlify production project `a4f98a1b-d639-4eb0-8693-c9764b38ca53` remains on ready deploy `6ae0b30c050624f6d7a81d67`; no deploy occurred.

## Exact next action

Obtain independent accessibility/security/billing review for PR #58 and the stacked backend PRs. After approval, exercise create, refresh-resume, expired retry, CSRF denial and allowlisted redirect against the protected synthetic runtime preview. Provider-sandbox checkout and signed-webhook validation remain required before any live billing, subscription or production-access claim.
