# GCS stale-checkout customer recovery checkpoint — 2026-10-28

## Completed increment

- The portal resumes a saved checkout only when the authenticated server explicitly reports that its selection is current and its revision exactly matches the currently staged revision.
- A stale, missing or mismatched signal clears the local intent and idempotency key, creates a fresh cryptographic key and starts one new intent for the current staged terms.
- The browser still sends no tenant, workspace, actor, provider, provider-session or subscription coordinates and stores no payment information.
- Backend draft PR #130 suppresses stale redirects and supplies the customer-safe `selection_current` signal.

## Verification

- JavaScript syntax and focused state checks passed locally.
- Website implementation/test head `e32731c5b8481251020b5687af9724d636f3e9db` passed CI run #101:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40789369755
- Matching founder implementation/test head `aeb02524c4e56e0cd4930ad1a366cd9a05923d05` passed Genesis Tests run #702:
  https://github.com/BuildbetterwithGCS/gcs-founder/actions/runs/40789345900

## Truthful boundary

This remains an inactive frontend preview backed only by a synthetic API contract. It does not create a provider checkout, collect payment information, charge a customer, activate an entitlement, merge code or deploy production.

## Review and release status

- Website PR #58 and founder PRs #129/#130 remain draft and have no independent reviews.
- Netlify production remains on ready deploy `6ae0b30c050624f6d7a81d67`; no deploy occurred.

## Exact next action

After independent security/billing/accessibility review, validate stale replacement, refresh/resume, expiry retry, CSRF denial and allowlisted redirect behavior through the protected synthetic runtime preview. Provider-sandbox and signed-webhook evidence remain required before any live billing or subscription claim.
