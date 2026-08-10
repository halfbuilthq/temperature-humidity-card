import { describe, expect, it } from "vitest";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "../src/config";
import type { HomeAssistant } from "../src/types";

describe("temperature humidity card config", () => {
  it("requires temperature and humidity sensor entities", () => {
    expect(() =>
      validateConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "",
        humidity_entity: "sensor.room_humidity"
      })
    ).toThrow("Temperature is required");
    expect(() =>
      validateConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "climate.room",
        humidity_entity: "sensor.room_humidity"
      })
    ).toThrow("Temperature must be a sensor entity");
  });

  it("rejects inverted comfort thresholds", () => {
    expect(() =>
      validateConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity",
        cold_threshold: 27,
        warm_threshold: 26
      })
    ).toThrow("Cold threshold must be lower");
  });

  it("applies sensor-only defaults", () => {
    expect(
      normalizeConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity"
      })
    ).toMatchObject({
      history_hours: 24,
      show_history: true,
      cold_threshold: 16,
      warm_threshold: 26,
      dry_threshold: 35,
      humid_threshold: 65,
      low_battery_threshold: 25
    });
  });

  it("finds temperature and humidity sensors for the preview", () => {
    const hass = {
      states: {
        "sensor.room_temperature": {
          entity_id: "sensor.room_temperature",
          state: "21",
          attributes: { device_class: "temperature" }
        },
        "sensor.room_humidity": {
          entity_id: "sensor.room_humidity",
          state: "50",
          attributes: { device_class: "humidity" }
        }
      },
      async callApi<T>() {
        return [] as T;
      }
    } as HomeAssistant;

    expect(getStubConfig(hass)).toMatchObject({
      temperature_entity: "sensor.room_temperature",
      humidity_entity: "sensor.room_humidity"
    });
  });

  it("exposes the native Home Assistant configuration schema", () => {
    const form = getConfigForm();
    expect(form.schema).toHaveLength(4);
    expect(() =>
      form.assertConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity"
      })
    ).not.toThrow();
  });
});
