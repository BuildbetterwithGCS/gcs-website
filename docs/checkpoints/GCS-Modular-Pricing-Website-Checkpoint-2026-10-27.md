# GCS Modular Pricing Website Checkpoint — 2026-10-27

## Scope and authority

- Subscription priority: issue #61
- Standing founder authorization: issue #73
- Repository: `BuildbetterwithGCS/gcs-website`
- Base commit: `bdd119ff5ec2f9890ec7403c19e0d92457c30acd`
- Branch: `website/modular-pricing-clean-20261027`
- Draft pull request: #57
- Production deployment: unchanged by this increment

## Verified starting state

- PR #57 was mergeable and had no recorded independent review.
- Its initial CI run #78 failed because three homepage acceptance assertions still expected the superseded title and calls to action.
- The published GCS Netlify deploy remained ready at `6ae0b30c050624f6d7a81d67`.
- No production deployment, checkout, payment activity or customer data was used.

## Bounded executable increment

- Updated homepage acceptance checks to the current business-software positioning and routes.
- Added browser-level regression tests for the proposed modular pricing calculator.
- Covered the proposed Core estimate, selected modules, extra five-user blocks and Complete bundle.
- Covered invalid, fractional and out-of-range user inputs.
- Verified the calculator retains illustrative-pricing language and exposes no checkout or payment action.
- Reused Jest's existing browser environment after an initial test-harness-only `TextEncoder` failure.

## Validation evidence

- CI run #80 correctly exposed the incompatible duplicate jsdom harness.
- CI run #81 passed on implementation head `560419804a854f81760c76a3aba46458a6eefe5a`:
  https://github.com/BuildbetterwithGCS/gcs-website/actions/runs/40533052656
- The final checkpoint-only head must also pass CI.

## Truthful boundary

The page remains a proposed sales and pricing experience. It does not:

- create an account or persistent tenant workspace;
- collect a payment or activate a subscription;
- prove production billing or provider integration;
- grant module entitlements;
- promise that every displayed module is production-ready.

## Review and release gate

Keep PR #57 draft and unmerged until an independent reviewer approves the storefront copy, calculator behavior, accessibility, link targets and truthful subscription boundaries. Green CI does not replace independent review.

## Exact next action

After independent approval, verify the Netlify deploy preview for responsive layout, keyboard/touch interaction and calculator behavior. If that preview and final CI pass, merge PR #57 and confirm the published deploy by commit and deploy ID. Then connect the reviewed frontend choice to authenticated, durable selection persistence from founder PR #124 only after that separate persistence change is independently approved.
