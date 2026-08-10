export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed?: string;
  last_updated?: string;
  attributes: {
    friendly_name?: string;
    unit_of_measurement?: string;
    device_class?: string;
    icon?: string;
    [key: string]: unknown;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  callApi<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    path: string,
    parameters?: unknown
  ): Promise<T>;
  locale?: {
    language?: string;
    number_format?: string;
    time_format?: string;
  };
  language?: string;
  config?: {
    unit_system?: {
      temperature?: string;
    };
  };
}

export interface TemperatureHumidityCardConfig {
  type: string;
  temperature_entity: string;
  humidity_entity: string;
  battery_entity?: string;
  title?: string;
  icon?: string;
  history_hours?: number;
  show_history?: boolean;
  cold_threshold?: number;
  warm_threshold?: number;
  dry_threshold?: number;
  humid_threshold?: number;
  low_battery_threshold?: number;
}

export interface HistoryPoint {
  timestamp: number;
  temperature?: number;
  humidity?: number;
}

export type ComfortKey =
  | "comfortable"
  | "cold"
  | "warm"
  | "dry"
  | "humid"
  | "mixed"
  | "unavailable";

export interface ComfortStatus {
  label: string;
  key: ComfortKey;
}

declare global {
  interface Window {
    customCards?: Array<{
      type: string;
      name: string;
      preview?: boolean;
      description?: string;
      documentationURL?: string;
    }>;
  }

  interface HTMLElementTagNameMap {
    "temperature-humidity-card": HTMLElement;
  }
}
