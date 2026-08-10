# Publishing and HACS checklist

## GitHub repository settings

- Repository: `halfbuilthq/temperature-humidity-card`
- Visibility: public
- Description: `A sensor-only temperature and humidity comfort card for Home Assistant.`
- Issues: enabled
- Suggested topics: `home-assistant`, `hacs`, `lovelace`, `dashboard`,
  `custom-card`, `temperature`, `humidity`
- Default branch: `main`

## First release

1. Confirm CI and HACS validation pass on `main`.
2. Update `package.json` and `CHANGELOG.md` if the release version changed.
3. Create and push a semantic version tag, for example `v0.1.0`.
4. Confirm the release workflow publishes a full GitHub release with
   `temperature-humidity-card.js` attached.
5. Add the repository to HACS as a custom **Dashboard** repository and test a
   clean installation.

## HACS default submission

Before opening a pull request against `hacs/default`:

- Keep the GitHub repository public, active, and owned by the submitter.
- Confirm HACS validation passes without ignored checks.
- Confirm at least one full GitHub release exists.
- Confirm the README contains an image and complete usage instructions.
- Add the repository alphabetically to the `plugin` list in `hacs/default`.
- Complete the HACS pull-request template accurately and allow maintainer edits.

