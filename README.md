# GCS — Building Better Organizations

Public website for General Contractor Solutions (GCS).

## Production hosting

The verified public production site is hosted on **Netlify** at `https://buildbetterwithgcs.com`. GitHub Pages also has a build/deployment workflow, but its successful run is **not** evidence that GitHub Pages serves the public production domain.

Before declaring a website change live, verify both the GitHub CI result for the exact commit and the Netlify project's **published production deploy** commit, status and URL. A passing GitHub Pages job alone does not confirm the Netlify production release.

## Inquiry handling

The contact and demonstration forms use Netlify Forms. An HTTP success response confirms the website submission request completed; it does **not** independently prove that an email notification reached the business inbox, that a human reviewed the inquiry, or that a response will occur by a particular deadline. Confirm those separately before claiming end-to-end delivery.

Do not send credentials, protected records, financial account information, or confidential customer data through these public intake forms. Paid work, integrations and additional services require an agreed written scope and the appropriate approvals.

## Change control

Make changes on review branches. Require passing applicable CI and human approval before merging or releasing consequential changes. Synthetic Nexus demonstration data must not be represented as live customer or production information.
