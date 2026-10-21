# Temperature & Humidity Card for Home Assistant

[![CI](https://github.com/halfbuilthq/temperature-humidity-card/actions/workflows/ci.yml/badge.svg)](https://github.com/halfbuilthq/temperature-humidity-card/actions/workflows/ci.yml)
[![HACS validation](https://github.com/halfbuilthq/temperature-humidity-card/actions/workflows/hacs.yml/badge.svg)](https://github.com/halfbuilthq/temperature-humidity-card/actions/workflows/hacs.yml)
[![GitHub release](https://img.shields.io/github/v/release/halfbuilthq/temperature-humidity-card)](https://github.com/halfbuilthq/temperature-humidity-card/releases)

A sensor-only room-comfort card for Home Assistant dashboards. It combines
temperature, humidity, comfort exceptions, a 24-hour range, and a compact
trend without exposing thermostat or air-conditioning controls. Available directly
in the HACS catalogue.

![Temperature & Humidity Card preview](docs/production-preview.png)

## Features

- Temperature with optional humidity from ordinary sensor entities
- Clear Cold, Warm, Dry, Humid, mixed and unavailable states
- Configurable comfort thresholds, warning text and state colours
- Temperature history with minimum, maximum and sparkline
- Mouse, touch and keyboard chart inspection with temperature and humidity tooltips
- Optional sensor battery warning that stays hidden while healthy
- Native Home Assistant visual configuration
- Responsive sizing for grids and room views
- Keyboard-accessible entity detail actions
- HACS-compatible packaging

## Configuration

```yaml
type: custom:temperature-humidity-card
title: Kitchen
icon: mdi:silverware-fork-knife
temperature_entity: sensor.kitchen_temperature
humidity_entity: sensor.kitchen_humidity
battery_entity: sensor.kitchen_sensor_battery
history_hours: 24
show_history: true
cold_threshold: 16
warm_threshold: 26
dry_threshold: 35
humid_threshold: 65
low_battery_threshold: 25
```

Only `temperature_entity` is required. Omit `humidity_entity` for a temperature-only gauge. The card never
requires or controls a `climate` entity. Battery state is displayed only when
it is at or below `low_battery_threshold`.

### Minimal configuration

```yaml
type: custom:temperature-humidity-card
temperature_entity: sensor.room_temperature
humidity_entity: sensor.room_humidity
```

### Temperature-only gauge

```yaml
type: custom:temperature-humidity-card
title: Study
temperature_entity: sensor.study_temperature
```

Leave Humidity blank in the visual editor, or omit `humidity_entity` in YAML.
The card hides the humidity reading and tooltip row, requests only temperature
history, and evaluates Cold/Warm status from temperature alone. A configured
humidity sensor that goes offline still produces an Unavailable warning.

### Custom warning text and colours

The visual editor includes **Warning text** and **Comfort colours** sections.
All overrides are optional; clearing a field restores its default.

```yaml
type: custom:temperature-humidity-card
temperature_entity: sensor.room_temperature
humidity_entity: sensor.room_humidity
cold_label: Kalt
warm_label: Warm
dry_label: Trocken
humid_label: Feucht
unavailable_label: Nicht verfügbar
comfortable_color: "#55d5df"
cold_color: "#60a9ff"
warm_color: "#f7a55f"
dry_color: "#aab9c7"
humid_color: "#4fb9ff"
mixed_color: "#b48aff"
unavailable_color: "#db5959"
```

Combined warnings join the individual labels, for example `Kalt · Feucht`.
These are manual text overrides; other card and editor text remains English.
The Comfortable state continues to hide its status badge.

Colours accept quoted `#RGB` or `#RRGGBB` hex values and apply to the active
state's accent (gauge, status, trend and tint). `mixed_color` applies whenever
both temperature and humidity are outside their comfort ranges. Without an
override, existing colours and Home Assistant theme fallbacks are preserved.

### Entity requirements

- `temperature_entity`: a sensor with a numeric temperature state and a
  temperature unit such as `°C` or `°F`.
- `humidity_entity`: an optional sensor with a numeric relative-humidity state in `%`.
- `battery_entity`: an optional numeric battery sensor in `%`.

The temperature and humidity sensors do not need to come from the same device.

### Dashboard sizing

In a Sections dashboard, the card defaults to the full 12-column section and
supports resizing down to 6 columns in the Layout tab. For two cards side by
side, set each card to 6 columns:

```yaml
grid_options:
  columns: 6
  rows: auto
```

The gauge and readings scale with the available card width. At compact widths,
the history graph appears above the minimum and maximum readings. Keep rows
set to `auto` so the card can grow when labels wrap. No custom scaling setting
is needed.

## Installation with HACS

The card is available in the default HACS catalogue; no custom repository is needed.

1. Open **HACS** in Home Assistant.
2. Search for **Temperature & Humidity Card**.
3. Open the card and select **Download**.
4. Refresh the browser after installation.

For updates, open the card in HACS and download the latest release when offered,
then refresh your dashboard. HACS may take time to discover a newly published release.

Add the card through Home Assistant's card picker or use the YAML examples
above. The card includes a native visual configuration form.

## Development

```sh
npm install
npm run dev
```

Run all tests and build the production bundle:

```sh
npm run check
```

Open `/demo/customization.html` on the development server to preview the new options.

The bundle is emitted to `dist/temperature-humidity-card.js`.

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution and release guidance.

## Manual installation

1. Copy `dist/temperature-humidity-card.js` to
   `<config>/www/temperature-humidity-card.js`.
2. Add `/local/temperature-humidity-card.js` as a JavaScript module dashboard
   resource.
3. Add **Temperature & Humidity Card** from Home Assistant's card picker.

## License

[MIT](LICENSE)
