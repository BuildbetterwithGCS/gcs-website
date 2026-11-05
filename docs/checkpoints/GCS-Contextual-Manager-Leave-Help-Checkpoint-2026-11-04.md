# GCS contextual manager leave help checkpoint — 2026-11-04

## Bounded increment

Website PR [#58](https://github.com/BuildbetterwithGCS/gcs-website/pull/58) now links the manager leave-review panel directly to a searchable, low-literacy How To guide.

The guide tells an authorized manager to:

1. sign in with the manager's own identity;
2. explicitly load requests waiting for review;
3. verify the employee, leave type, and date;
4. approve only under the company's approved policy;
5. use Deny when the request should not be approved and follow the company's normal communication and recordkeeping process;
6. sign in and reload after session/access loss, without an automatic approval or denial retry.

The guide states that approval records a manager decision only. It does not change payroll, guarantee a paid balance, calculate overtime, or prove policy compliance.

## Verification

- Executable head `94150a3de296ee4d74925d32b756680d5237e1a1`.
- GitHub Actions CI [41908006188](https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41908006188): **passed**.
- Netlify deploy preview `6aeb96fc26983065fc9be608`: **ready**, exact commit ref `94150a3de296ee4d74925d32b756680d5237e1a1`, context `deploy-preview`, not published.
- Non-production access remains protected by team SSO.
- Published production remains unchanged on ready deploy `6ae0b30c050624f6d7a81d67`.

## Review and release boundary

Website PR #58 and founder PRs #129/#130 remain drafts with zero independent reviews. No merge or production release was performed.

This increment changes guidance and contextual links only. It does not add authority, alter leave balances, calculate payroll/overtime, guarantee paid leave, or prove legal/policy compliance.

## Exact next action

Obtain independent review of PRs #129, #130, and #58. While review is pending, the next independent bounded workstream is contextual How To guidance for employee time-clock recovery and manager time-review boundaries, without making payroll, wage, location-tracking, or compliance claims.
