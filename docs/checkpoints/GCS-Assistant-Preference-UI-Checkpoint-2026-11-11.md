# GCS/Nexus assistant preference UI checkpoint — 2026-11-11

## Scope

This bounded increment adds settings-only controls for the tenant-isolated Nexus operations assistant to website PR #58. It uses the exact authenticated GET/PATCH `/api/nexus/assistant/preferences` contract supplied by founder PR #130.

It does not send email, run an AI task, activate a scheduler, call a delivery provider, create bids or leads, merge code, or expose production.

## Implementation

- `8a005aaed5bb5c0ce9094a0ec3ebdba79ac3e548`: added low-literacy assistant settings markup, explicit load action, disabled-by-default controls, daily/weekly/paused cadence, IANA timezone input, and allowlisted topics.
- `9eb41e06f15ef534421c4398ed65934bd5fe6d47`: added visible settings-only boundary and accessible checkbox layout.
- `be869786082561bb4b278744d14c6330402e44a7`: added exact response validation, explicit GET, optimistic-revision PATCH, repeated-action suppression, and fail-closed handling for malformed responses, stale revisions, and 401/403 entitlement or access loss.
- `881c886191d2a14ad5fd1084e64931167740a886`: added contract, source, and browser-runtime coverage.

## Security and privacy behavior

- Controls start disabled and can be loaded only after the existing authenticated workspace access check succeeds.
- The browser accepts exactly revision, enabled, frequency, timezone, and topics.
- PATCH sends exactly expected revision, enabled, frequency, timezone, and topics.
- No tenant, actor, role, email address, delivery address, provider, billing, or customer coordinates are accepted or supplied by the UI.
- Unknown response fields fail closed.
- A 409 conflict disables the form and requires an explicit fresh load; there is no automatic retry.
- A 401 or 403 clears verified access, dashboard totals, and assistant settings; no automatic retry is made.
- Repeated load or save activation creates one request while the first is pending.
- Visible copy says that saving does not send email or start AI, scheduler, provider, or delivery behavior.

## Verification

Website CI #257 passed on executable head `881c886191d2a14ad5fd1084e64931167740a886`:

- Unit and acceptance tests: passed.
- Public exposure guard: passed.
- Internal link check: passed.
- Run: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/43022771045

## Release state and boundaries

- Website PR #58 remains draft and requires independent frontend/security/privacy review.
- Founder PR #130 remains draft and requires independent backend/security/privacy review.
- No production deploy was requested.
- Production Netlify remains on its previously verified deploy until reviewed release criteria are met.
- Provider credentials and real email delivery have not been verified, so email delivery is not claimed live.
- No Coastal data, account, invitation, charge, or outreach was used.

## Exact next action

Add a contextual low-literacy How To guide for loading, choosing, pausing, saving, stale-setting recovery, access loss, and the no-email boundary. Add browser search/direct-link tests. In parallel with independent review, keep the protected preview settings-only; after both PRs are reviewed, verify exact GET/PATCH behavior over HTTPS with synthetic active and inactive tenants before any production release or provider-delivery work.
