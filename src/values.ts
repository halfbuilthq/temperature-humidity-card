import { DEFAULT_GAUGE_MAX_TEMPERATURE, DEFAULT_GAUGE_MIN_TEMPERATURE } from "./config";
import type {
  ComfortStatus,
  HassEntity,
  HomeAssistant,
  TemperatureHumidityCardConfig
} from "./types";

const UNAVAILABLE_STATES = new Set(["unknown", "unavailable", "none", ""]);

export function entity(
  hass: HomeAssistant | undefined,
  entityId: string | undefined
): HassEntity | undefined {
  return entityId ? hass?.states[entityId] : undefined;
}

export function numericState(state: HassEntity | undefined): number | undefined {
  if (!state || UNAVAILABLE_STATES.has(state.state.toLowerCase())) return undefined;
  const value = Number(state.state);
  return Number.isFinite(value) ? value : undefined;
}

export function temperatureUnit(
  hass: HomeAssistant | undefined,
  temperature: HassEntity | undefined
): string {
  return (
    temperature?.attributes.unit_of_measurement ??
    hass?.config?.unit_system?.temperature ??
    "°C"
  );
}

export function formatNumber(
  value: number | undefined,
  locale?: string,
  maximumFractionDigits = 1
): string {
  if (value === undefined || !Number.isFinite(value)) return "—";
  return new Intl.NumberFormat(locale, {
    maximumFractionDigits
  }).format(value);
}

export function comfortStatus(
  temperature: number | undefined,
  humidity: number | undefined,
  config: TemperatureHumidityCardConfig
): ComfortStatus {
  const hasHumidity = Boolean(config.humidity_entity);
  if (temperature === undefined || (hasHumidity && humidity === undefined)) {
    return { label: config.unavailable_label?.trim() || "Unavailable", key: "unavailable" };
  }

  const labels: string[] = [];
  let temperatureKey: "cold" | "warm" | undefined;
  let humidityKey: "dry" | "humid" | undefined;

  if (temperature < (config.cold_threshold ?? 16)) {
    labels.push(config.cold_label?.trim() || "Cold");
    temperatureKey = "cold";
  } else if (temperature > (config.warm_threshold ?? 26)) {
    labels.push(config.warm_label?.trim() || "Warm");
    temperatureKey = "warm";
  }

  if (hasHumidity && humidity !== undefined && humidity < (config.dry_threshold ?? 35)) {
    labels.push(config.dry_label?.trim() || "Dry");
    humidityKey = "dry";
  } else if (hasHumidity && humidity !== undefined && humidity > (config.humid_threshold ?? 65)) {
    labels.push(config.humid_label?.trim() || "Humid");
    humidityKey = "humid";
  }

  if (labels.length === 0) return { label: "Comfortable", key: "comfortable" };
  if (temperatureKey && humidityKey) {
    return { label: labels.join(" · "), key: "mixed" };
  }
  return {
    label: labels.join(" · "),
    key: temperatureKey ?? humidityKey ?? "comfortable"
  };
}

export function gaugeProgress(
  value: number | undefined,
  minimum = DEFAULT_GAUGE_MIN_TEMPERATURE,
  maximum = DEFAULT_GAUGE_MAX_TEMPERATURE
): number {
  if (value === undefined) return 0;
  if (maximum <= minimum) return 0;
  return Math.min(100, Math.max(0, ((value - minimum) / (maximum - minimum)) * 100));
}

export function lowBattery(
  battery: number | undefined,
  threshold = 25
): boolean {
  return battery !== undefined && battery <= threshold;
}
