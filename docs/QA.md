# GRANTLY quality assurance

## Automated checks
Requires Node.js 20+. No third-party dependencies:
```bash
npm run build
npm test
npm run check
```
Checks cover page metadata/landmarks, local references, frontend module order, catalogue record presence and authenticated profile API contract. These complement, not replace, browser acceptance tests.

## Browser acceptance checklist
- [ ] All 14 routes load without JavaScript errors.
- [ ] Desktop and mobile layouts have no horizontal overflow.
- [ ] Catalogue search and category/deadline filters update results.
- [ ] Saving a catalogue listing adds it to My Applications.
- [ ] SmartMatch saves a profile and displays caveated potential matches.
- [ ] Tracker adds, edits, filters and deletes opportunities.
- [ ] Deadline Radar reflects tracker deadlines.
- [ ] Document checklist adds/removes metadata.
- [ ] Funding Copilot displays the selected structured template.
- [ ] Compare displays two saved opportunities.
- [ ] Readiness reflects profile, tracker and checklist state.
- [ ] Signed-in Passport loads/saves through the account API.
- [ ] Sign-out and protected API access are tested with a real account.
- [ ] Google OAuth is tested after owner-side provider setup.

## Product boundaries
Catalogue is curated, not a live NSP feed. SmartMatch is a screening aid, not an eligibility engine. Tracker, SmartMatch and checklist are browser-local. Copilot uses templates, not live AI. GRANTLY does not submit applications or decide awards.
