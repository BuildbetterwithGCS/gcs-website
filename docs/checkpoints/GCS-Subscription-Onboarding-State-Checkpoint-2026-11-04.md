# GCS subscription onboarding state checkpoint — 2026-11-04

## Scope completed

Draft website PR #58 now presents the authenticated subscription contract without telling a brand-new tenant that a selection was saved when the server reports `selection_required`.

The bounded increment distinguishes:

- `selection_required`: choose and save business tools; no subscription is active;
- `pending_billing` with unverified billing: selection saved; billing verification is still required;
- `pending_billing` with verified billing but no access grant: billing verified; access is still waiting for approval;
- `active` only when billing is verified and access is granted; and
- malformed, contradictory, or unknown responses: status unavailable, no active access, and checkout disabled.

The browser continues to treat server-side billing verification and entitlement grant as separate conditions. It does not infer activation from a saved selection, staged revision, provider return, or status word alone.

No price, provider, entitlement, identity, customer record, production route, or production deploy was changed.

## Commits

- fail-closed subscription onboarding presentation: `2c6b41770bb28475c008e01302367997ed4885e7`
- state-separation and malformed-response regression tests: `120ce35ca67ff4894c64773016b571872ef26b5a`

## Validation evidence

Website CI run #198 passed on head `120ce35ca67ff4894c64773016b571872ef26b5a`:

https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41956629097

The ready Netlify deploy preview `6aebec5fe3a61e9fdcff63bd` reports the exact same commit:

https://deploy-preview-58--buildbetterwithgcs.netlify.app

Non-production Netlify access remains protected by required team SSO. Production remains unchanged and ready on deploy `6ae0b30c050624f6d7a81d67`.

## Truthful boundary

This remains an inactive frontend preview backed only by synthetic contract tests. It does not prove a live checkout, payment, settlement, billing verification, subscription, entitlement, customer account, or production availability.

## Review and release gate

Website PR #58, founder PR #130, and prerequisite founder PR #129 remain draft PRs with no independent review submissions. No merge or production deployment occurred.

## Exact next action

After independent review, exercise the four valid subscription states and contradictory/malformed responses against the SSO-protected synthetic runtime. Verify that checkout remains disabled for selection-required and malformed states, verified billing without approval does not grant access, active display requires both billing verification and access grant, and all authenticated responses remain private/no-store. Complete real provider sandbox and entitlement validation before any production subscription claim.
