# GCS contextual timekeeping help checkpoint — 2026-11-04

## Bounded increment

Website PR [#58](https://github.com/BuildbetterwithGCS/gcs-website/pull/58) now links the My time panel directly to searchable employee clock guidance and a separate manager time-review guide.

### Employee clock guidance

The guide tells an employee to:

1. sign in using the employee's own identity;
2. clock in once when work begins and retain the displayed open punch number;
3. use that punch number to clock out once;
4. stop and notify a manager rather than guessing or creating a duplicate punch when information is missing or wrong;
5. sign in and review current status after session/access loss, without an automatic clock-action retry.

It states that a punch records a timestamp only. It does not calculate wages, overtime, or payroll, and it does not prove physical or jobsite location.

### Manager time-review guidance

The guide is explicitly conditional on an authorized manager review queue being available. It tells managers to check identity, dates, times, missing entries, and duplicates; withhold approval while discrepancies remain; and use the company's approved correction/documentation process.

It states that a review decision does not calculate pay, establish legal compliance, or prove where an employee worked.

## Verification

- Executable head `4b635a90929cdd03836248ab55fbda6f01c5d5a2`.
- GitHub Actions CI [41918658337](https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41918658337): **passed**.
- Netlify deploy preview `6aeba6e0137be0d868ba430a`: **ready**, exact commit ref `4b635a90929cdd03836248ab55fbda6f01c5d5a2`, context `deploy-preview`, not published.
- Non-production access remains protected by team SSO.
- Published production remains unchanged on ready deploy `6ae0b30c050624f6d7a81d67`.

## Review and release boundary

Website PR #58 and founder PRs #129/#130 remain drafts with zero independent reviews. No merge or production release was performed.

This increment changes guidance and contextual links only. It does not add payroll, wage calculation, overtime calculation, employee location tracking, manager time approval, or compliance certification.

## Exact next action

Obtain independent review of PRs #129, #130, and #58. While review is pending, verify the subscription-selection and checkout help against the existing server contracts, then add contextual recovery guidance that distinguishes saved selections, provider handoff, verified billing, and entitlement activation without claiming a working live subscription.
