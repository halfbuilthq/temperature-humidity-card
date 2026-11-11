import { describe, expect, it } from "vitest";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "../src/config";
import type { HomeAssistant, TemperatureHumidityCardConfig } from "../src/types";

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
      gauge_min_temperature: 5,
      gauge_max_temperature: 35,
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
  expect(normalizeConfig({ ...minimal, cold_color: "red; display:none" }).cold_color)
    .toBeUndefined();
  expect(() => validateConfig({ ...minimal, cold_label: 7 as unknown as string }))
    .toThrow("Cold text must be a string");
});

const colorFields = [
  "comfortable_color", "cold_color", "warm_color", "dry_color",
  "humid_color", "mixed_color", "unavailable_color"
] as const;

it.each(colorFields)("keeps %s editable through typing and deletion", (field) => {
  const form = getConfigForm();
  const full = "#55d5df";
  const sequence = Array.from({ length: full.length + 1 }, (_, length) => full.slice(0, length));
  for (const value of [...sequence, ...[...sequence].reverse(), "#nothex", "red; display:none"]) {
    const config: TemperatureHumidityCardConfig = { ...minimal, [field]: value };
    expect(() => form.assertConfig(config)).not.toThrow();
    expect(() => validateConfig(config)).not.toThrow();
    const expected = value === "#55d" || value === full ? value : undefined;
    expect(normalizeConfig(config)[field]).toBe(expected);
    expect(config[field]).toBe(value);
  }
  expect(normalizeConfig({ ...minimal, [field]: " #AbC " })[field]).toBe("#AbC");
  expect(() => form.assertConfig({ ...minimal, [field]: {} as unknown as string })).toThrow();
});

it("keeps entity selectors editable while cleared or partially selected", () => {
  const form = getConfigForm();
  for (const field of ["temperature_entity", "humidity_entity", "battery_entity"]) {
    for (const value of [undefined, "", "s", "sensor.", "sensor.room_temperature"]) {
      expect(() => form.assertConfig({ ...minimal, [field]: value })).not.toThrow();
    }
  }
  expect(() => validateConfig({ ...minimal, temperature_entity: "" })).toThrow("Temperature is required");
});

it("keeps number fields editable through clearing and temporary range errors", () => {
  const form = getConfigForm();
  for (const field of ["history_hours", "gauge_min_temperature", "gauge_max_temperature", "cold_threshold", "warm_threshold", "dry_threshold", "humid_threshold", "low_battery_threshold"]) {
    // HA's number selector emits undefined for empty or incomplete numeric input.
    for (const value of [undefined, -1, 0, 1, 1.5, 200]) {
      expect(() => form.assertConfig({ ...minimal, [field]: value })).not.toThrow();
    }
    for (const invalid of ["oops", NaN, Infinity, -Infinity]) {
      expect(() => form.assertConfig({ ...minimal, [field]: invalid })).toThrow();
      expect(() => validateConfig({ ...minimal, [field]: invalid })).toThrow();
    }
  }
  expect(() => validateConfig({ ...minimal, history_hours: 0 })).toThrow("Trend period");
  expect(() => validateConfig({ ...minimal, cold_threshold: 30, warm_threshold: 26 })).toThrow("Cold threshold");
  expect(() => validateConfig({
    ...minimal,
    gauge_min_temperature: 10,
    gauge_max_temperature: -10
  })).toThrow("Temperature scale minimum");
  expect(() => validateConfig({ ...minimal, dry_threshold: 70, humid_threshold: 65 })).toThrow("Dry threshold");
});

it("keeps free text and toggles editable but rejects unsupported data shapes", () => {
  const form = getConfigForm();
  for (const field of ["title", "icon", "cold_label", "warm_label", "dry_label", "humid_label", "unavailable_label"]) {
    for (const value of [undefined, "", "m", "mdi:", "Cold"]) {
      expect(() => form.assertConfig({ ...minimal, [field]: value })).not.toThrow();
    }
    expect(() => form.assertConfig({ ...minimal, [field]: ["unsupported"] })).toThrow();
  }
  for (const value of [undefined, false, true]) {
    expect(() => form.assertConfig({ ...minimal, show_history: value })).not.toThrow();
  }
  expect(() => form.assertConfig({ ...minimal, show_history: "true" as unknown as boolean })).toThrow();
});

it("shows colour format hints only on colour fields", () => {
  const form = getConfigForm();
  const colours = form.schema.find((section) => section.title === "Comfort colours")!;
  const labels = form.schema.find((section) => section.title === "Warning text")!;
  for (const field of colours.schema.filter((field) => field.name.endsWith("_color"))) {
    const text = (field as unknown as { selector: { text: { pattern: string; validation_message: string } } }).selector.text;
    const pattern = new RegExp(text.pattern);
    for (const valid of ["", "  ", "#AbC", " #55d5df "]) expect(pattern.test(valid)).toBe(true);
    for (const invalid of ["#", "#55", "#55d5", "#invalid"]) expect(pattern.test(invalid)).toBe(false);
    expect(text.validation_message).toContain("complete hex colour");
  }
  for (const field of labels.schema) expect(field).not.toHaveProperty("selector.text.pattern");
});


it("offers optional gradient mode without disabling the editor on intermediate values", () => {
  expect(normalizeConfig(minimal).color_mode).toBe("state");
  const form = getConfigForm();
  const section = form.schema.find((section) => section.title === "Comfort colours")!;
  const mode = section.schema.find((field) => field.name === "color_mode");
  expect(mode).toMatchObject({ selector: { select: { options: [
    { value: "state" }, { value: "gradient" }
  ] } } });
  expect(() => form.assertConfig({ ...minimal, color_mode: "" as "state" })).not.toThrow();
  expect(() => validateConfig({ ...minimal, color_mode: "gradient" })).not.toThrow();
  expect(() => validateConfig({ ...minimal, color_mode: "other" as "state" })).toThrow("Colour mode");
  expect(() => form.assertConfig({ ...minimal, color_mode: {} as "state" })).toThrow();
});
