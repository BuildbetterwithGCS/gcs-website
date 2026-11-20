# GCS Assistant Preview How To Checkpoint — 2026-11-20

## Outcome

The noindex GCS Business How To center now contains a direct guide for reviewing a future synthetic assistant update preview. The guide is intentionally review-only and does not expose or claim a customer-visible preview screen.

## Evidence-backed inventory

Before this increment, the How To center explained assistant update preferences, opt-in state, cadence, timezone, topics, stale revisions, entitlement loss, and the fact that saving preferences does not send email. It did not provide a direct procedure for inspecting preview evidence or separating that inspection from consequential actions.

## Bounded implementation

- Added `assistant-review-preview-guide` after the assistant-settings guide.
- Requires the reviewer to confirm synthetic/test labeling and stop if real customer or employee data appears.
- Requires review of topic, title, action label, freshness label, and source evidence.
- Treats stale or unknown freshness as an explicit source-verification stop.
- Treats every item as evidence to review, not an instruction or completed action.
- Forbids using the preview to send email, approve time or leave, submit a bid, contact a lead, issue an invoice, collect payment, or activate access.
- Requires secure workspace recovery and forbids copying data into another tenant.
- Preserves the existing `noindex,nofollow` development-preview boundary.

## Commits and verification

- Help guide: `2afb90c3dc5e67422e3a00ad5db5d7f942934fa3`
- Regression test: `b0341619bd1aa7a2514e51d417fe84f2a121745b`
- Search-test correction: `bf4c5e45470807ff0930a3e978bac0f67a68e23d`
- CI #351 correctly failed because the intentionally broader new guide made an older generic “email delivery” query match two guides.
- The old settings-specific query was narrowed to “settings daily weekly” without removing or weakening a product boundary.
- Exact-head CI #352 passed: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/44697154721

## Release boundary

This change adds static development guidance and regression coverage only. It does not mount the detached assistant preview client, run AI, call an email provider, send a digest, approve a record, submit a bid, contact a lead, send an invoice, collect or settle payment, activate an entitlement, ingest Coastal data, or prove provider delivery or source freshness.

Website PR #60 still requires independent review. Founder PR #130 still requires independent security/privacy review. No merge or production deployment is authorized until the applicable review and release gates are satisfied.

## Exact next action

Keep the assistant preview unmounted while PR #60 and founder PR #130 lack independent review. Advance the next unblocked synthetic workstream by inventorying the Coastal pilot acceptance checklist for a traceable employee clock → manager review → dashboard/assistant reminder cross-module flow, and add evidence only where the existing synthetic journeys support it.
