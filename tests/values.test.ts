import { describe, expect, it } from "vitest";
import {
  comfortStatus,
  formatNumber,
  gaugeProgress,
  lowBattery,
  numericState
} from "../src/values";
import type { TemperatureHumidityCardConfig } from "../src/types";

const config: TemperatureHumidityCardConfig = {
  type: "custom:temperature-humidity-card",
  temperature_entity: "sensor.room_temperature",
  humidity_entity: "sensor.room_humidity",
  cold_threshold: 16,
  warm_threshold: 26,
  dry_threshold: 35,
  humid_threshold: 65
};

describe("temperature and humidity values", () => {
  it("parses numeric sensor states and rejects unavailable states", () => {
    expect(
      numericState({ entity_id: "sensor.room", state: "21.2", attributes: {} })
    ).toBe(21.2);
    expect(
      numericState({ entity_id: "sensor.room", state: "unavailable", attributes: {} })
    ).toBeUndefined();
  });

  it("classifies comfortable and exception states", () => {
    expect(comfortStatus(21, 50, config)).toEqual({
      label: "Comfortable",
      key: "comfortable"
    });
    expect(comfortStatus(13.2, 59, config)).toEqual({ label: "Cold", key: "cold" });
    expect(comfortStatus(28, 72, config)).toEqual({
      label: "Warm · Humid",
      key: "mixed"
    });
    expect(comfortStatus(undefined, 50, config).key).toBe("unavailable");
  });

  it("maps temperatures to the visual gauge range", () => {
    expect(gaugeProgress(5)).toBe(0);
    expect(gaugeProgress(20)).toBe(50);
    expect(gaugeProgress(35)).toBe(100);
    expect(gaugeProgress(50)).toBe(100);
  });

  it("shows battery only at or below the configured threshold", () => {
    expect(lowBattery(25, 25)).toBe(true);
    expect(lowBattery(26, 25)).toBe(false);
    expect(lowBattery(undefined, 25)).toBe(false);
  });

  it("formats values using the requested precision", () => {
    expect(formatNumber(21.25, "en-AU", 1)).toBe("21.3");
    expect(formatNumber(undefined)).toBe("—");
  });
});

it("classifies temperature alone when humidity is not configured", () => {
  const temperatureOnly = { ...config, humidity_entity: undefined };
  expect(comfortStatus(21, undefined, temperatureOnly).key).toBe("comfortable");
  expect(comfortStatus(13, undefined, temperatureOnly).key).toBe("cold");
  expect(comfortStatus(28, undefined, temperatureOnly).key).toBe("warm");
  expect(comfortStatus(undefined, undefined, temperatureOnly).key).toBe("unavailable");
  expect(comfortStatus(21, undefined, config).key).toBe("unavailable");
  expect(comfortStatus(21, 99, temperatureOnly).key).toBe("comfortable");
  expect(comfortStatus(21, undefined, { ...config, humidity_entity: "" }).key)
    .toBe("comfortable");
});

it("uses translated warnings and composes mixed states without changing classification", () => {
  const translated = {
    ...config, cold_label: " Kalt ", warm_label: "Warm!",
    dry_label: "Trocken", humid_label: "Feucht", unavailable_label: "Nicht verfügbar"
  };
  expect(comfortStatus(13, 30, translated)).toEqual({ label: "Kalt · Trocken", key: "mixed" });
  expect(comfortStatus(28, 80, translated)).toEqual({ label: "Warm! · Feucht", key: "mixed" });
  expect(comfortStatus(21, undefined, translated)).toEqual({ label: "Nicht verfügbar", key: "unavailable" });
  expect(comfortStatus(13, 50, { ...config, cold_label: " " }).label).toBe("Cold");
});
