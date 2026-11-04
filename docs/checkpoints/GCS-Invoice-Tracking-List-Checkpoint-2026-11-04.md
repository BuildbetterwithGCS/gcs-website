# GCS invoice tracking list checkpoint — 2026-11-04

## Bounded increment

PR [#58](https://github.com/BuildbetterwithGCS/gcs-website/pull/58) now contains a manager-facing, explicit-load invoice tracking panel that consumes the tenant-scoped invoice summary contract from `gcs-founder` PR #130.

The panel:

- performs one read-only `GET /api/nexus/invoices` request only after the manager chooses **Load invoice list**;
- accepts only the exact bounded response fields `invoice_id`, `customer_label`, `amount_cents`, `due_date`, and `status`;
- rejects extra metadata, malformed dates, invalid amounts, unrecognized statuses, mismatched counts, and lists over 100 entries;
- renders customer labels with text nodes rather than HTML;
- labels every state as tracking-only and explicitly states that the panel does not send invoices, collect payment, confirm settlement, or post accounting entries;
- clears stale invoice data after access loss or request failure.

The repair commits `bf9c6868ab0a9bcb1670decaa5444f8d514f1d29` and `3134bfbeb13036361ec2a6227235110be0ced678` restore the existing assigned-work validator and remove a duplicate insertion tail found by CI.

## Verification

- GitHub Actions CI run [41890141236](https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/41890141236): **passed** at commit `3134bfbeb13036361ec2a6227235110be0ced678`.
- Netlify deploy preview `6aeb7d152f0d1b88d825c807`: **ready**, commit ref `3134bfbeb13036361ec2a6227235110be0ced678`, context `deploy-preview`.
- Preview URL: https://deploy-preview-58--buildbetterwithgcs.netlify.app
- The verified Netlify project continues to require team SSO for non-production deploys.
- Published production deploy remains `6ae0b30c050624f6d7a81d67` and was not changed by this increment.

## Review and release boundary

PR #58 remains a draft with no independent review. This checkpoint does not claim live invoicing, payment collection, settlement verification, accounting integration, or a released subscription capability. No production deployment or merge was performed.

## Exact next action

Obtain independent review of the stacked tenant-contract PRs (#129/#130) and website PR #58. While review is pending, the next independent bounded workstream is a plain-language **How To** path for managers covering assigned work completion and invoice-status interpretation without creating payroll, accounting, or payment claims.
