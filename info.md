# Temperature & Humidity Card

A sensor-only Home Assistant card for room temperature, humidity, comfort
exceptions, and 24-hour trends. It intentionally provides no thermostat or
air-conditioning controls.

![Temperature & Humidity Card preview](docs/production-preview.png)

## Highlights

- Works with ordinary temperature and humidity sensors.
- Shows Cold, Warm, Dry, Humid, mixed, and unavailable exceptions.
- Displays the 24-hour minimum, maximum, and temperature trend.
- Supports an optional battery sensor while hiding healthy battery states.
- Includes Home Assistant's native visual card configuration form.

## Minimal configuration

```yaml
type: custom:temperature-humidity-card
temperature_entity: sensor.room_temperature
humidity_entity: sensor.room_humidity
```

See the repository README for the complete configuration and threshold options.
