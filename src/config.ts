import type {
  HomeAssistant,
  TemperatureHumidityCardConfig
} from "./types";

export const DEFAULT_CONFIG: Partial<TemperatureHumidityCardConfig> = {
  title: "",
  icon: "mdi:home-thermometer-outline",
  history_hours: 24,
  show_history: true,
  cold_threshold: 16,
  warm_threshold: 26,
  dry_threshold: 35,
  humid_threshold: 65,
  low_battery_threshold: 25
};

const LABEL_STATES = ["cold", "warm", "dry", "humid", "unavailable"] as const;
const COLOR_STATES = ["comfortable", "cold", "warm", "dry", "humid", "mixed", "unavailable"] as const;

function stateName(state: string): string {
  return state.charAt(0).toUpperCase() + state.slice(1);
}

const FIELD_LABELS: Record<string, string> = {
  title: "Room name",
  icon: "Room icon",
  temperature_entity: "Temperature",
  humidity_entity: "Humidity",
  battery_entity: "Sensor battery",
  history_hours: "Trend period",
  show_history: "Show trend and daily range",
  cold_threshold: "Cold below",
  warm_threshold: "Warm above",
  dry_threshold: "Dry below",
  humid_threshold: "Humid above",
  low_battery_threshold: "Low battery at or below"
};

const FIELD_HELPERS: Record<string, string> = {
  title: "Optional. The temperature sensor name is used when this is blank.",
  icon: "Optional Material Design icon, for example mdi:bed-outline.",
  temperature_entity: "Required temperature sensor. No climate entity is needed.",
  humidity_entity: "Optional relative-humidity sensor. Leave blank for a temperature-only gauge.",
  battery_entity: "Optional battery sensor. It is shown only when low.",
  history_hours: "Number of hours used for the sparkline and minimum/maximum.",
  show_history: "Hide this for an extra-compact card.",
  low_battery_threshold: "Healthy battery values stay hidden."
};

for (const state of LABEL_STATES) {
  FIELD_LABELS[`${state}_label`] = `${stateName(state)} text`;
  FIELD_HELPERS[`${state}_label`] = `Optional. Defaults to ${stateName(state)}. Combined warnings join the individual texts.`;
}
for (const state of COLOR_STATES) {
  FIELD_LABELS[`${state}_color`] = `${stateName(state)} colour`;
  FIELD_HELPERS[`${state}_color`] = "Optional hex colour, for example #55d5df. Leave blank for the default.";
}

export function getConfigForm() {
  return {
    schema: [
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          { name: "title", selector: { text: {} } },
          { name: "icon", selector: { icon: {} } }
        ]
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          {
            name: "temperature_entity",
            required: true,
            selector: {
              entity: { domain: "sensor", device_class: "temperature" }
            }
          },
          {
            name: "humidity_entity",
            selector: {
              entity: { domain: "sensor", device_class: "humidity" }
            }
          },
          {
            name: "battery_entity",
            selector: {
              entity: { domain: "sensor", device_class: "battery" }
            }
          }
        ]
      },
      {
        type: "grid",
        name: "",
        flatten: true,
        column_min_width: "220px",
        schema: [
          {
            name: "history_hours",
            selector: {
              number: {
                min: 1,
                max: 168,
                step: 1,
                unit_of_measurement: "hours",
                mode: "box"
              }
            }
          },
          { name: "show_history", selector: { boolean: {} } },
          {
            name: "low_battery_threshold",
            selector: {
              number: {
                min: 0,
                max: 100,
                step: 1,
                unit_of_measurement: "%"
              }
            }
          }
        ]
      },
      {
        type: "expandable",
        name: "",
        title: "Comfort ranges",
        flatten: true,
        schema: [
          {
            type: "grid",
            name: "",
            flatten: true,
            column_min_width: "180px",
            schema: [
              { name: "cold_threshold", selector: { number: { step: 0.5 } } },
              { name: "warm_threshold", selector: { number: { step: 0.5 } } },
              { name: "dry_threshold", selector: { number: { min: 0, max: 100 } } },
              { name: "humid_threshold", selector: { number: { min: 0, max: 100 } } }
            ]
          }
        ]
      },
      {
        type: "expandable",
        name: "",
        title: "Warning text",
        flatten: true,
        schema: LABEL_STATES.map((state) => ({
          name: `${state}_label`,
          selector: { text: {} }
        }))
      },
      {
        type: "expandable",
        name: "",
        title: "Comfort colours",
        flatten: true,
        schema: COLOR_STATES.map((state) => ({
          name: `${state}_color`,
          selector: { text: {} }
        }))
      }
    ],
    computeLabel: (schema: { name?: string }) =>
      schema.name ? FIELD_LABELS[schema.name] : undefined,
    computeHelper: (schema: { name?: string }) =>
      schema.name ? FIELD_HELPERS[schema.name] : undefined,
    assertConfig: (config: TemperatureHumidityCardConfig) => validateConfig(config)
  };
}

export function validateConfig(config: TemperatureHumidityCardConfig): void {
  for (const [field, label] of [
    ["temperature_entity", "Temperature"],
    ["humidity_entity", "Humidity"]
  ] as const) {
    const value = config[field];
    if (field === "humidity_entity" && (value === undefined || value === "")) continue;
    if (!value || typeof value !== "string") throw new Error(`${label} is required.`);
    if (!value.startsWith("sensor.")) throw new Error(`${label} must be a sensor entity.`);
  }

  for (const state of LABEL_STATES) {
    const value = config[`${state}_label`];
    if (value !== undefined && typeof value !== "string") {
      throw new Error(`${stateName(state)} text must be a string.`);
    }
  }
  for (const state of COLOR_STATES) {
    const value = config[`${state}_color`];
    if (value !== undefined && (typeof value !== "string" ||
      (value.trim() !== "" && !/^#(?:[\da-f]{3}|[\da-f]{6})$/i.test(value.trim())))) {
      throw new Error(`${stateName(state)} colour must be a hex colour such as #55d5df.`);
    }
  }

  const historyHours = config.history_hours ?? 24;
  if (historyHours < 1 || historyHours > 168) {
    throw new Error("Trend period must be between 1 and 168 hours.");
  }
  if ((config.cold_threshold ?? 16) >= (config.warm_threshold ?? 26)) {
    throw new Error("Cold threshold must be lower than warm threshold.");
  }
  if ((config.dry_threshold ?? 35) >= (config.humid_threshold ?? 65)) {
    throw new Error("Dry threshold must be lower than humid threshold.");
  }
}

export function normalizeConfig(
  config: TemperatureHumidityCardConfig
): TemperatureHumidityCardConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config,
    type: config.type || "custom:temperature-humidity-card"
  } as TemperatureHumidityCardConfig;
}

export function getStubConfig(hass?: HomeAssistant): TemperatureHumidityCardConfig {
  const states = Object.values(hass?.states ?? {});
  const temperature = states.find(
    (state) => state.attributes.device_class === "temperature"
  );
  const humidity = states.find(
    (state) => state.attributes.device_class === "humidity"
  );

  return normalizeConfig({
    type: "custom:temperature-humidity-card",
    temperature_entity: temperature?.entity_id ?? "",
    humidity_entity: humidity?.entity_id ?? ""
  });
}
