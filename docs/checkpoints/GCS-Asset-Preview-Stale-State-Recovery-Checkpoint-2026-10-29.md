# GCS asset preview stale-state recovery checkpoint — 2026-10-29

## Scope completed

Draft website PR #58 now fails closed in the browser when an asset preview receipt expires or the authenticated session/entitlement no longer authorizes the request.

On any preview or error-report failure, the panel now:

- clears the in-memory workbook reference;
- clears the opaque preview receipt;
- removes the selected file from the file chooser;
- hides the entire prior preview result;
- removes the prior summary and row/column/error-code list;
- hides the error-report download action;
- returns keyboard focus to the file chooser; and
- announces a short actionable message through the existing polite status region.

A 401 or 403 response tells the user that the check expired or access changed and directs them to choose the file again. The browser does not automatically retry a denied receipt or retain stale validation state.

Starting a new preview also clears the prior result before sending the newly selected workbook, while preserving the newly chosen file for that request.

## Validation evidence

- recovery implementation: `268cfbf17905c952b995e8830e35ec95f7769b1b`
- focused accessibility and denial tests: `6182c58997333fec357a654adecb853e7a0d7b47`
- website CI #113: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40967436975

Regression coverage verifies keyboard focus recovery, removal of every stale rendered coordinate and download action, polite status semantics, actionable 401/403 wording, no retry after denial, and preservation of the noindex/real-data warning boundary.

## Current release state

- Website PR #58 remains draft and independently unreviewed.
- Founder PRs #129 and #130 remain draft and independently unreviewed.
- The matching backend remains unexposed.
- Netlify production was not changed.
- No customer data, live identity, live billing, charge, merge, or production publication occurred.

## Truthful boundary

This is browser-state and synthetic accessibility regression coverage. It does not prove a hosted session, settlement-verified entitlement, on-wire response headers, hosted customer-data controls, malware scanning, database backup/restore, or complete assistive-technology compatibility.

## Exact next action

Add an explicit administrator-controlled import confirmation that is available only after a zero-error preview. Require the exact in-memory workbook and opaque receipt, clearly state that the action inserts new assets only, call the existing authenticated commit contract once, clear all workbook/receipt state after success or denial, and refresh the privacy-minimized dashboard summary. Keep it protected, noindex, unmerged, and unavailable to production pending independent frontend/security/privacy review.
