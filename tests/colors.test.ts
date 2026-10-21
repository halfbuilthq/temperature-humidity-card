import { describe, expect, it } from "vitest";
import { comfortAccent } from "../src/colors";
import { normalizeConfig } from "../src/config";
import { comfortStatus } from "../src/values";
import type { TemperatureHumidityCardConfig } from "../src/types";

const config: TemperatureHumidityCardConfig = {
  type: "custom:temperature-humidity-card",
  temperature_entity: "sensor.temperature",
  humidity_entity: "sensor.humidity",
  color_mode: "gradient",
  comfortable_color: "#000000",
  cold_color: "#0000ff",
  warm_color: "#ff0000",
  dry_color: "#00ff00",
  humid_color: "#ffffff",
  mixed_color: "#abcdef"
};

function accent(temperature: number | undefined, humidity: number | undefined,
  options: TemperatureHumidityCardConfig = config) {
  return comfortAccent(temperature, humidity, comfortStatus(temperature, humidity, options).key, options);
}

describe("automatic comfort colours", () => {
  it("preserves fixed state colours and CSS/theme defaults when gradient is off", () => {
    expect(accent(10, 50, { ...config, color_mode: "state" })).toBe("#0000ff");
    expect(accent(30, 80, { ...config, color_mode: undefined })).toBe("#abcdef");
    expect(accent(21, 50, { ...config, color_mode: "state", comfortable_color: undefined })).toBeUndefined();
  });

  it("interpolates temperature endpoints and midpoint, ignoring unconfigured humidity", () => {
    const temperatureOnly = { ...config, humidity_entity: undefined };
    expect(accent(16, undefined, temperatureOnly)).toBe("#0000ff");
    expect(accent(21, undefined, temperatureOnly)).toBe("#000000");
    expect(accent(26, undefined, temperatureOnly)).toBe("#ff0000");
    expect(accent(23.5, 99, temperatureOnly)).toBe("#800000");
    expect(accent(18.5, undefined, temperatureOnly)).toBe("#000080");
    expect(accent(-100, undefined, temperatureOnly)).toBe("#0000ff");
    expect(accent(100, undefined, temperatureOnly)).toBe("#ff0000");
  });

  it("interpolates dry/neutral/humid readings and clamps humidity extremes", () => {
    expect(accent(21, 35)).toBe("#00ff00");
    expect(accent(21, 50)).toBe("#000000");
    expect(accent(21, 65)).toBe("#ffffff");
    expect(accent(21, 42.5)).toBe("#008000");
    expect(accent(21, -5)).toBe("#00ff00");
    expect(accent(21, 150)).toBe("#ffffff");
  });

  it("blends both contributions instead of using the fixed mixed colour", () => {
    expect(accent(30, 80)).toBe("#ff8080");
    expect(accent(10, 20)).toBe("#008080");
    expect(accent(22.25, 53.75)).toBe("#804040");
    expect(accent(26, 50)).toBe("#ff0000");
  });

  it("uses configured thresholds in the same units as the temperature sensor", () => {
    const fahrenheit = { ...config, cold_threshold: 60, warm_threshold: 80, dry_threshold: 20, humid_threshold: 60 };
    expect(accent(70, 40, fahrenheit)).toBe("#000000");
    expect(accent(75, 40, fahrenheit)).toBe("#800000");
    expect(accent(70, 50, fahrenheit)).toBe("#808080");
  });

  it("preserves unavailable colours, including the theme fallback", () => {
    expect(accent(21, undefined)).toBeUndefined();
    expect(accent(undefined, 50, { ...config, unavailable_color: "#aabbcc" })).toBe("#aabbcc");
    expect(accent(undefined, undefined, { ...config, humidity_entity: undefined })).toBeUndefined();
  });

  it("supports short hex colours and safely falls back during partial input", () => {
    expect(accent(26, 50, { ...config, warm_color: "#f00" })).toBe("#ff0000");
    const partial = normalizeConfig({ ...config, warm_color: "#f" });
    expect(accent(26, 50, partial)).toBe("#f7a55f");
    expect(accent(26, 50, { ...config, warm_color: "red;display:none" })).toBe("#f7a55f");
  });

  it("changes continuously through neutral, state thresholds and combined-weight boundaries", () => {
    const channels = (hex: string) => [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16));
    for (const [temperature, humidity] of [[21, 50], [26, 50], [16, 50], [23.5, 57.5]]) {
      const before = channels(accent(temperature - 0.001, humidity)!);
      const after = channels(accent(temperature + 0.001, humidity)!);
      expect(before.every((channel, index) => Math.abs(channel - after[index]) <= 1)).toBe(true);
    }
  });
});
