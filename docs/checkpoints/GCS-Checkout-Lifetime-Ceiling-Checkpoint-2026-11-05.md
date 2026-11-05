# GCS checkout lifetime ceiling checkpoint — 2026-11-05

## Scope

This bounded browser increment mirrors the draft server's existing maximum provider-session lifetime without creating a second provider configuration path. It does not create a provider session, call a billing provider, or expose production customer access.

## Completed

- Added a 24-hour maximum lifetime for any checkout intent that contains a browser navigation URL.
- The lifetime is measured from the server-authored `updated_at` value to `expires_at`, matching the server's provider-session binding timeline.
- The browser clock is still used to reject an already expired URL.
- A customer device clock modestly behind the server does not make an otherwise exact 24-hour session look overlong.
- Exactly 24 hours is accepted, matching founder PR #130.
- Any lifetime over 24 hours, including one millisecond over, fails closed before navigation.
- Provider-session responses without a URL remain available to the existing safe retry path.

## Evidence

- Initial lifetime ceiling: `455c12d04c026a1ef3893cb0186a96907ad4cad4`; CI #225 passed.
- Boundary and zero-navigation tests: `746fb76f7228f088c1465bdaddbf5df821d21551`; CI #226 passed.
- Server-timeline anchoring: `a0f3ce27e02eca15f35152a8174f7f1ed588a95b`; CI #227 passed.
- Client clock-skew regression test: `5130d9694803eb687668c782266ac7766e17ebb9`; CI #228 passed: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/42020191858

## Truthful boundary

The tests use synthetic customer responses. They do not prove provider availability, payment authorization, charge, settlement, entitlement activation, customer identity, or a working production subscription. Founder PR #130 remains the authoritative server boundary for provider adapter authorization, exact-host allowlisting, session lifetime, redirect cleanup, tenant authentication, and private/no-store responses.

## Release state

Website PR #58 and founder PR #130 remain draft, mergeable, and without independent reviews. Production must remain unchanged until the applicable frontend, accessibility, privacy, security, billing, and provider/runtime gates pass.

## Exact next action

Require monotonic checkout timestamps in the minimized browser contract: `created_at <= updated_at < expires_at` whenever a checkout URL is present. Add deterministic negative tests for reversed or equal provider-session timelines and prove rejected responses never reach navigation.
