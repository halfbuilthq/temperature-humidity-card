# Contributing

Contributions are welcome. Please keep the card focused on displaying room
temperature and humidity from sensor entities; thermostat and air-conditioning
controls are intentionally outside its scope.

## Development

1. Install Node.js 20.19 or newer.
2. Run `npm ci`.
3. Run `npm run dev` for the local Home Assistant-style preview.
4. Run `npm run check` before opening a pull request.

Visual changes should include a 1280 × 800 screenshot. Configuration changes
should include updated README examples and tests.

## Releases

Releases use semantic version tags such as `v0.1.0`. Pushing a `v*` tag runs
the full test/build workflow and creates a GitHub release containing
`temperature-humidity-card.js` for HACS.

