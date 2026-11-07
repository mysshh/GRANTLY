# GRANTLY — Your Future, Funded.

India-first scholarship discovery and student funding companion.

**Live:** https://grantly.hatchable.site  
**Repository:** https://github.com/mysshh/GRANTLY

## Features
- Scholarship directory with 27 curated opportunities, search, filters, providers and official source links.
- SmartMatch profile screening with explainable potential routes, not eligibility guarantees.
- Application tracker for saved opportunities, stages, deadlines and notes.
- Student workspace: Eligibility Decoder, Deadline Radar, Scholarship Passport, Document Vault, Funding Copilot, Compare and Readiness Score.

## Technology
Semantic HTML, CSS, vanilla JavaScript, six frontend modules, Hatchable hosting/authentication, user-scoped Passport API and PostgreSQL student profile table. Automated quality checks use Node's built-in test runner; no npm dependencies.

## Local preview
Python 3: `python -m http.server 4173 --directory public`, then open http://localhost:4173. Account authentication and Passport API require Hatchable.

## Verify
Node.js 20+: `npm run check`.

## Product boundaries
GRANTLY is an independent discovery/planning tool, not a government portal or application-submission service. Catalogue entries are curated, not a live feed. Official notices remain authoritative. SmartMatch is not an eligibility guarantee; Funding Copilot uses templates; tracker, SmartMatch and checklist are browser-local. Do not enter private identity or bank details in free-text fields.
