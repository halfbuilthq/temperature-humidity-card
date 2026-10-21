import { describe, expect, it } from "vitest";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "../src/config";
import type { HomeAssistant } from "../src/types";

describe("temperature humidity card config", () => {
  it("requires a temperature sensor entity", () => {
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
    const fields = JSON.stringify(form.schema);
    expect(fields).toContain('"name":"cold_label"');
    expect(fields).toContain('"name":"mixed_color"');
    const sensorGrid = form.schema[1];
    expect(sensorGrid.schema.find((field) => field.name === "humidity_entity"))
      .not.toHaveProperty("required", true);
    expect(() =>
      form.assertConfig({
        type: "custom:temperature-humidity-card",
        temperature_entity: "sensor.room_temperature",
        humidity_entity: "sensor.room_humidity"
      })
    ).not.toThrow();
  });
});

const minimal = {
  type: "custom:temperature-humidity-card",
  temperature_entity: "sensor.room_temperature"
};

it("accepts omitted or cleared humidity but rejects a configured non-sensor", () => {
  expect(() => validateConfig(minimal)).not.toThrow();
  expect(() => validateConfig({ ...minimal, humidity_entity: "" })).not.toThrow();
  expect(() => validateConfig({ ...minimal, humidity_entity: "climate.room" }))
    .toThrow("Humidity must be a sensor entity");
});

it("validates optional text and hex colours without requiring overrides", () => {
  expect(() => validateConfig({ ...minimal, cold_label: "Kalt", cold_color: " #AbC " }))
    .not.toThrow();
  expect(() => validateConfig({ ...minimal, cold_label: "", cold_color: " " }))
    .not.toThrow();
  expect(() => validateConfig({ ...minimal, mixed_color: "#123456" })).not.toThrow();
  expect(() => validateConfig({ ...minimal, cold_color: "red; display:none" }))
    .toThrow("Cold colour must be a hex colour");
  expect(() => validateConfig({ ...minimal, cold_label: 7 as unknown as string }))
    .toThrow("Cold text must be a string");
});
