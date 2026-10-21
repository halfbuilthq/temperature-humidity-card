# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.2.1] - 2026-10-21

### Fixed

- Keep the visual editor available while typing or deleting colour overrides,
  clearing entity selections, or adjusting numeric ranges. Partial/invalid hex
  colours use the default preview colour with an inline format hint. Runtime
  configuration checks remain separate from visual-editor compatibility checks.
  Fixes [#7](https://github.com/halfbuilthq/temperature-humidity-card/issues/7),
  reported by [@Semir333](https://github.com/Semir333) in #6.

## [0.2.0] - 2026-10-21

### Added

- Optional humidity sensor for a temperature-only gauge, comfort status and history.
- Custom Cold, Warm, Dry, Humid and Unavailable warning text, including combined warnings.
- Optional hex colour overrides for each comfort state, including Comfortable and mixed.
- Warning text and comfort colour settings in the native visual editor.

### Thanks

- Thanks to [@Semir333](https://github.com/Semir333) for the suggestions in
  [#6](https://github.com/halfbuilthq/temperature-humidity-card/issues/6).

## [0.1.2] - 2026-10-12

### Fixed

- Scale the gauge and readings to the available card width instead of clipping
  them in narrow layouts. Compact cards place the history graph above the
  minimum and maximum readings and keep inspection tooltips inside the card.
- Allow long room names, comfort states, and low-battery warnings to fit compact
  layouts.

### Changed

- Default Sections cards to 12 columns, with a supported minimum of 6 columns
  and automatic height.

### Thanks

- Thanks to [@bushvin](https://github.com/bushvin) for reporting the narrow-layout
  clipping in [#5](https://github.com/halfbuilthq/temperature-humidity-card/issues/5).

## [0.1.1] - 2026-09-02

### Added

- Mouse, touch, and keyboard inspection for the history sparkline.
- Point-in-time temperature and humidity tooltips.

### Changed

- Standardized card, marker, and tooltip backgrounds on Home Assistant's
  current theme variables with legacy fallbacks.

## [0.1.0] - 2026-08-10

### Added

- Sensor-only temperature and humidity comfort card.
- Configurable Cold, Warm, Dry, Humid, mixed, and unavailable states.
- 24-hour minimum, maximum, and temperature sparkline.
- Optional low-battery warning that stays hidden while healthy.
- Native Home Assistant visual configuration form.
- HACS-compatible distribution bundle.
