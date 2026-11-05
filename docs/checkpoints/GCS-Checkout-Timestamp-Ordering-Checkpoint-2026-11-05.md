# GCS Checkout Timestamp Ordering Checkpoint — 2026-11-05

## Bounded increment completed

The website checkout validator now requires every URL-bearing provider-session intent to have a monotonic server timeline:

- `created_at <= updated_at`
- `updated_at < expires_at`
- `expires_at` remains in the future relative to the client check
- the provider-session lifetime remains capped at 24 hours from `updated_at`

Non-URL intent states retain the existing retry and recovery path. No payment data, provider identity, provider reference, customer identity, bank information, or entitlement claim is introduced.

## Traceability

- implementation commit: `2f30c4b83a2d85294a3848207801f69f4854e4d3`
- regression-test commit: `abdcacb67c9080e3705162999586e51349c1ebf5`
- website CI #231: passed
- CI run: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42029545117
- draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58

## Verified behavior

Synthetic tests cover:

- equal creation and update timestamps as a valid boundary
- creation after update as invalid
- update equal to expiry as invalid
- update after expiry as invalid
- zero navigation calls for every rejected timeline

## Truthful boundary

This validates a browser-side handoff contract only. It does not prove a live provider session, payment collection, settled billing, entitlement activation, payroll compliance, or production customer access.

## Release gates

PR #58 remains draft and requires independent accessibility, content, privacy, and security review. Matching authenticated API work in gcs-founder PR #130 retains its own review, database, identity, provider-sandbox, rollback, and platform-access gates. Production must remain unchanged until those gates and failed-CI checks are clear.

## Exact next action

Add a runtime-level malformed-timestamp response test that verifies the pending checkout lock clears, no intent is stored, navigation is not attempted, and an otherwise eligible saved selection is re-enabled with a truthful retry message.
