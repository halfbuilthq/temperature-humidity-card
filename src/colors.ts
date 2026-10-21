import type { ComfortKey, TemperatureHumidityCardConfig } from "./types";

type GradientKey = "comfortable" | "cold" | "warm" | "dry" | "humid";
type RGB = [number, number, number];

const DEFAULT_COLORS: Record<GradientKey, string> = {
  comfortable: "#55d5df",
  cold: "#60a9ff",
  warm: "#f7a55f",
  dry: "#aab9c7",
  humid: "#4fb9ff"
};

function rgb(color: string | undefined): RGB | undefined {
  const value = color?.trim();
  if (!value || !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value)) return undefined;
  const hex = value.length === 4
    ? [...value.slice(1)].map((digit) => digit + digit).join("")
    : value.slice(1);
  return [0, 2, 4].map((index) => parseInt(hex.slice(index, index + 2), 16)) as RGB;
}

function position(value: number, low: number, high: number): number {
  const halfRange = (high - low) / 2;
  if (halfRange <= 0) return 0;
  return Math.max(-1, Math.min(1, (value - (low + halfRange)) / halfRange));
}

/** Undefined leaves the existing state/theme CSS in charge. */
export function comfortAccent(
  temperature: number | undefined,
  humidity: number | undefined,
  status: ComfortKey,
  config: TemperatureHumidityCardConfig
): string | undefined {
  if (config.color_mode !== "gradient" || status === "unavailable") {
    return config[`${status}_color`];
  }
  if (temperature === undefined || !Number.isFinite(temperature) ||
    (config.humidity_entity && (humidity === undefined || !Number.isFinite(humidity)))) {
    return config.unavailable_color;
  }

  const anchor = (key: GradientKey): RGB =>
    rgb(config[`${key}_color`]) ?? rgb(DEFAULT_COLORS[key])!;
  const temperaturePosition = position(
    temperature, config.cold_threshold ?? 16, config.warm_threshold ?? 26
  );
  const humidityPosition = config.humidity_entity && humidity !== undefined
    ? position(humidity, config.dry_threshold ?? 35, config.humid_threshold ?? 65)
    : 0;
  const temperatureWeight = Math.abs(temperaturePosition);
  const humidityWeight = Math.abs(humidityPosition);
  const total = temperatureWeight + humidityWeight;
  const divisor = Math.max(1, total);
  const neutral = anchor("comfortable");
  const temperatureColor = anchor(temperaturePosition < 0 ? "cold" : "warm");
  const humidityColor = anchor(humidityPosition < 0 ? "dry" : "humid");

  // Keep the neutral contribution while the combined distance is below one;
  // stronger combined conditions blend their endpoints in proportion instead.
  const channels = neutral.map((channel, index) => Math.round(
    channel * (1 - Math.min(1, total)) +
    temperatureColor[index] * temperatureWeight / divisor +
    humidityColor[index] * humidityWeight / divisor
  ));
  return `#${channels.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}
