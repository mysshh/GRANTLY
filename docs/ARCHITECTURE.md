# GRANTLY architecture

## Student journey
1. Browse the scholarship directory.
2. Enter a study profile in SmartMatch.
3. Review potential routes and reasons to investigate or exclude.
4. Save opportunities to the application tracker.
5. Organise deadlines, documents and next steps.
6. Maintain a Scholarship Passport and review preparation progress.

## Frontend
Static HTML pages share `public/styles.css`. `public/app.js` loads six modules in order: `site.js` (navigation), `catalogue.js` (search/filter/save), `smartmatch.js` (profile screening), `tracker.js` (application CRUD), `student-hub.js` (student tools), and `account.js` (account-aware navigation).

## Persistence and authentication
SmartMatch, application tracker and document checklist currently use browser local storage. Scholarship Passport can be saved to the signed-in student's account through `GET/PUT /api/profile`; the API is user-scoped and `student_profiles.user_id` is the primary key. Hatchable manages email authentication and the declared Google provider. Google remains inactive until the owner verifies a custom domain and supplies Google OAuth client credentials in Hatchable.

## Matching and guidance boundaries
SmartMatch applies transparent rules to curated catalogue records. Results are potential routes to investigate, not official eligibility decisions or award guarantees. Funding Copilot uses structured templates, not live generative AI. Document Vault stores checklist metadata only, not uploaded identity or bank documents.

## Data provenance
Entries identify a provider and source link, generally NSP or the relevant official institution. Some links point to a portal directory rather than a scheme-specific notice. Confirm deadlines, course/institution restrictions and eligibility in the current official notification.
