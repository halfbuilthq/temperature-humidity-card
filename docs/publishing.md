# Publishing and HACS checklist

## GitHub repository settings

- Repository: `halfbuilthq/temperature-humidity-card`
- Visibility: public
- Description: `A customisable temperature and optional humidity comfort card for Home Assistant, available in HACS.`
- Issues: enabled
- Suggested topics: `home-assistant`, `hacs`, `lovelace`, `dashboard`,
  `custom-card`, `temperature`, `humidity`
- Default branch: `main`

## Release process

1. Run `npm run check` and confirm CI and HACS validation pass on `main`.
2. Update the versions in `package.json` and `package-lock.json`, and add dated
   release notes to `CHANGELOG.md`.
3. Commit the source, documentation and rebuilt `dist/temperature-humidity-card.js`.
4. Push the release commit to `main`, then create and push its semantic version tag.
5. Confirm the release workflow publishes a full GitHub release with
   `temperature-humidity-card.js` attached.
6. Verify the release asset and check that HACS discovers the update.

## HACS availability

The card is included in the default HACS catalogue. Users can search for
**Temperature & Humidity Card** in HACS and download it without adding a custom
repository. HACS update discovery may lag behind GitHub publication.
