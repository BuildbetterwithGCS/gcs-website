# GCS Manager Time How To Boundary Checkpoint — 2026-11-20

## Inventory result

The existing noindex How To center already contains:

- employee clock-in/clock-out recovery guidance;
- time-off request and manager leave-review guidance;
- manager time-review guidance;
- work-order, invoice-status, assistant-preference, subscription, and asset-import guides.

The missing detail was a truthful distinction between the currently visible dashboard/assistant reminder and an actual punch-approval control. The current customer app shows the `Time punches to review` aggregate and links to the guide, but does not expose a reviewed manager punch-approval panel.

## Bounded update

The manager time-review guide now states:

- the current customer preview does not expose a punch-approval panel;
- dashboard counts and assistant reminders are prompts only and cannot approve or change time;
- a manager must wait for an independently reviewed queue before using an in-app approval workflow;
- missing or disputed time must follow the company's correction process;
- managers must never approve their own punch;
- a later review decision will not calculate pay, establish legal compliance, send email, or prove work location.

No public navigation, production route, API call, or live capability was added.

## Verification

- Guide update: `92de087f757929c14a894e2a85d633b3b9decd9c`.
- Initial CI #347 exposed one older test assertion that expected the superseded sentence.
- Test-only repair: `3f182d28b3c01268305f1fd3a2f73e1cd1c0e1e5`.
- CI #348: success.
- 8 test suites passed; 181 Jest tests passed.
- 318 acceptance checks passed; 0 failed.
- Internal-link check passed across 21 HTML pages.

## Truth and release boundaries

The How To center remains `noindex,nofollow` and explicitly describes development-preview workflows, not a live customer account. It collects no payroll, billing, or employee data.

Website PR #60 remains draft and unreviewed. This update is not deployed and makes no claim of live timekeeping, payroll, email delivery, or manager approval.

## Exact next action

Connect no customer-facing approval control until founder PR #130 and website PR #60 receive independent security/privacy review. While that gate remains unavailable, inventory whether the How To center has a direct guide for reviewing the synthetic assistant preview itself; add one only if it clearly separates evidence review from delivery, approval, bid submission, invoice sending, and payment.
