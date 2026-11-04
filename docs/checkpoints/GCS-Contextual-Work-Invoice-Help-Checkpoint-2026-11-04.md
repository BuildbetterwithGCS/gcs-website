# GCS contextual work and invoice help checkpoint — 2026-11-04

## Bounded increment

Website PR [#58](https://github.com/BuildbetterwithGCS/gcs-website/pull/58) now links the protected workspace directly to two searchable, low-literacy How To guides.

### Assigned work

The employee guide explains how to:

1. sign in with the employee's own identity;
2. explicitly load only assigned open work;
3. finish the job before selecting **Mark complete**;
4. use the separate **Yes, mark complete** confirmation or **No, keep open** cancellation;
5. recover from session/access changes by signing in and reloading without an automatic completion retry.

It states that work-order completion is operational tracking only and does not approve time, calculate pay, or run payroll.

### Invoice status

The manager guide explains the fixed Draft, Issued, Paid, and Void tracking labels. It states that Issued is not proof of delivery and Paid is not proof of settlement. It directs managers to separately approved systems for delivery, payment, settlement, and accounting verification.

The guide and workspace repeat that loading or reading the list does not send an invoice, collect payment, confirm settlement, or post an accounting entry.

## Verification

- Executable head `0e9a937b32a4cb043f9a0fb09ff61700121edaea`.
- GitHub Actions CI [41899735183](https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41899735183): **passed**.
- Netlify deploy preview `6aeb8aed15d4e330e10fba13`: **ready**, exact commit ref `0e9a937b32a4cb043f9a0fb09ff61700121edaea`, context `deploy-preview`, not published.
- Non-production Netlify access remains protected by team SSO.
- Published production remains the unchanged ready deploy `6ae0b30c050624f6d7a81d67`.

## Review and release boundary

PR #58 remains a draft with zero independent reviews. Founder PRs #129 and #130 also remain drafts with zero independent reviews. No merge or production release was performed.

This increment adds guidance and contextual links only. It does not prove live payroll, invoice delivery, payment collection, settlement, accounting integration, subscription activation, or production customer access.

## Exact next action

Obtain independent review of founder PRs #129/#130 and website PR #58. While review is pending, the next independent bounded workstream is contextual low-literacy How To guidance for manager leave approvals, including explicit denial wording, identity/access-loss recovery, and the boundary that leave approval does not change payroll or guarantee a paid balance.
