# GCS Combined Customer Portal Checkpoint — 2026-10-28

## Completed bounded increment

Website draft PR #58 now includes a mobile-first, low-literacy Nexus workspace
shell for the combined `/api/nexus` contract in founder draft PR #130. One page
covers dashboard status, clock in/out, leave requests, work-order assignment,
invoice drafts, subscription module/user selection, and direct How To help.

The browser client uses same-origin credentials and the existing double-submit
CSRF cookie for state-changing requests. It does not accept tenant, actor, role,
provider, or billing-reference fields. Expected failures produce short,
non-technical messages.

## Truthful boundary

The portal is a development preview and is not linked to a live backend, IdP,
hosted tenant database, checkout, payroll system, or customer account. It has a
`noindex,nofollow` directive and explicit in-page preview/billing boundaries.
Production Netlify remains unchanged.

## Review and release gate

Keep PR #58 draft until independent accessibility, content, privacy, and
security review plus a protected deploy-preview check. The backend PRs #129 and
#130 must also be independently reviewed and production provider/database gates
must pass before this page can become a working customer workspace.

## Validation evidence

- Local JavaScript syntax and static boundary checks passed.
- Initial CI #88 failed only because the shared site acceptance suite still
  required the superseded `See Nexus` homepage button while this branch already
  contains the current `Explore Business Software` entry.
- The acceptance check now permits either truthful current product entry; all
  new portal tests had already passed in the failed run.
- Repair head `5245150eb5ccb0c1deb06c09e08b94cc83fb21b9` passed CI #89:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40666848450
- Draft PR: https://github.com/BuildbetterwithGCS/gcs-website/pull/58
- Independent reviews recorded on PR #58: none at this checkpoint.
- Merge and production deployment: not performed.

## Exact next action

After review, connect a protected deploy preview to the selected runtime adapter
and synthetic tenant, then verify keyboard/touch flows, screen-reader status
updates, session expiry, CSRF failure, role denial, and responsive layout. Do
not expose production customer access until IdP, hosted database, billing
provider, access controls, backup/restore, and rollback are verified.
