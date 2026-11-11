# GCS/Nexus assistant settings How To checkpoint — 2026-11-11

## Scope

This bounded website PR #58 increment adds low-literacy, contextual help for the tenant-isolated operations assistant preference controls completed in the prior checkpoint.

It adds documentation and browser behavior only. It does not send email, run AI, activate a scheduler, call a provider, collect Coastal data, create bids or leads, merge code, or expose production.

## Implementation

- `f88d020202f086b56f5a4992c56cc9e14ee5f675`: linked the Assistant updates panel to a stable contextual help anchor.
- `986649ad48819eef88c5cbe806804e1ea680f647`: added the assistant settings guide covering:
  - verified access and active-eligible-subscription prerequisites;
  - opt-in/out and paused/daily/weekly choices;
  - IANA timezone and allowlisted topic choices;
  - one-at-a-time save behavior;
  - explicit stale-revision reload with no automatic retry;
  - access/entitlement loss with no automatic retry;
  - the truthful settings-only, no-email boundary;
  - remaining independent review, provider, tenant-isolation, deduplication, unsubscribe/compliance, and end-to-end delivery gates.
- `d4dd95b6eff148a1c6ff5f6505d3e7d05160e318`: added source assertions and browser-DOM coverage for the direct link, multi-word filtering, live guide counts, no-result recovery, and native keyboard access.

## Verification

Website CI #260 passed on executable head `d4dd95b6eff148a1c6ff5f6505d3e7d05160e318`:

- Unit and acceptance tests: passed.
- Public exposure guard: passed.
- Internal link check: passed.
- Run: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/43031338532

## Truthful boundary and release state

- The guide describes settings, not a live digest or delivery capability.
- No email-provider credentials or real message delivery were used or verified.
- No bid, lead, invoice, task, or work-order content is fabricated by this increment.
- No Coastal account, data, invitation, contact, charge, or outreach was used.
- Website PR #58 and founder PR #130 remain draft and require independent frontend/backend security and privacy review.
- Netlify production remains unchanged until reviewed release criteria are met.
- The nonproduction deploy preview must remain protected while synthetic integration validation is pending.

## Exact next action

Independent review is still required before the protected browser and backend branches can be joined or released. While that gate remains open, add the next independent server-side topic projection for assistant digests using only saved tenant evidence: start with manager-visible pending leave actions or invoice-status summaries, enforce role scope and bounded safe fields, replace snapshots atomically, reject cross-tenant identifiers, and add two-tenant negative tests. Do not enable email or provider delivery.
