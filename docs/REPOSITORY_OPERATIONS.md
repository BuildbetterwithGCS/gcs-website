# Repository Operations Notes

## Automated checks
Pull requests and pushes to `main` run:
- Jest unit/acceptance tests
- public exposure guard
- internal link checker

## Deployment note
This repository currently contains both GitHub Pages metadata (`CNAME`) and a `netlify.toml` configuration used for Netlify-specific behavior such as Forms and headers. Do not change the production hosting path solely from repository metadata; confirm the active production deployment in the hosting account first.

## Human-controlled production actions
The following require explicit human authorization:
- changing the production hosting target
- changing DNS or custom-domain configuration
- enabling/disabling production forms
- changing production secrets or credentials
- publishing a materially changed production site outside the normal approved merge/deploy flow
