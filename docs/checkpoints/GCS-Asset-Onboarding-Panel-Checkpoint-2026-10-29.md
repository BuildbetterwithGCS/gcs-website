# GCS asset onboarding panel checkpoint — 2026-10-29

## Scope completed

Draft website PR #58 now includes an inactive, low-literacy asset onboarding panel matching the reviewed-later framework-neutral contracts in founder PR #130.

The panel provides three bounded customer steps:

1. download the fixed `assets-v1` XLSX template;
2. choose one completed XLSX file and request a validation preview; and
3. when validation errors exist, download the value-free CSV error list.

Previewing never commits, overwrites, deletes, or synchronizes assets. The page remains `noindex,nofollow` and explicitly warns that this is a development preview and real customer data must not be used.

## Browser safeguards

- template, preview, and error-report requests stay on the fixed same-origin `/api/nexus` base;
- requests use same-origin credentials, no-store caching, redirect rejection, and no-referrer policy;
- state-changing requests use the existing exact CSRF cookie/header contract;
- XLSX upload requires the exact macro-free XLSX media type, a non-empty body, and a 5 MiB client cap;
- the browser sends the original file bytes rather than JSON or base64;
- the browser supplies no tenant, actor, role, provider, billing, path, schema, mode, or overwrite fields;
- the error download accepts only a format-bounded opaque preview receipt;
- rendered errors contain row, column, and code only, using `textContent`;
- fixed client filenames are used for the template and error report.

## Validation evidence

- panel markup: `b9dcc7136a56caeeb19e349f4c9dc1cd2aae7c5c`
- private browser contract: `24d9c9293be4076f17b42f48bc135ebf548adb29`
- focused styling: `63aee93143a9c6636844d33f8d9d262a43da2c12`
- browser-policy regression tests: `3760c4beda75ec74d88bca3c5bf2fe28c12201a6`
- website CI #110: passed
- CI: https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40959955048

Tests verify exact XLSX validation, byte-preserving upload, private fetch controls, CSRF, absence of identity/tenant/provider fields, bounded receipt forwarding, and error-download behavior.

## Current release state

- Website PR #58 remains a draft with zero independent reviews.
- Founder PRs #129 and #130 also remain drafts with zero independent reviews.
- The matching backend routes remain unexposed in founder PR #130.
- Netlify production was not changed.
- No customer data, live identity, live billing evidence, charge, merge, or production deployment occurred.

## Truthful boundary

This is browser code and synthetic CI, not a working subscription or deployed customer import. It does not prove on-wire runtime headers, hosted body-size/time/memory limits, hosted malware scanning, production identity, settlement-verified entitlement, durable hosted storage, backup/restore, accessibility, or customer-data retention/deletion.

## Exact next action

Add explicit browser handling for receipt expiry and entitlement/session revocation that clears the selected workbook and rendered errors without retrying or retaining stale preview state. Verify keyboard and screen-reader status behavior in tests. Keep the preview protected and unmerged pending independent frontend/security/privacy review.
