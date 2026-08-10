import { mdiBedKingOutline, mdiHomeThermometerOutline, mdiSofaOutline } from "@mdi/js";
import "../src/temperature-humidity-card";
import type { TemperatureHumidityCard } from "../src/temperature-humidity-card";
import type {
  HassEntity,
  HomeAssistant,
  TemperatureHumidityCardConfig
} from "../src/types";
import "./styles.css";

const roomIcons: Record<string, string> = {
  "mdi:sofa-outline": mdiSofaOutline,
  "mdi:bed-king-outline": mdiBedKingOutline,
  "mdi:home-thermometer-outline": mdiHomeThermometerOutline
};

class PromoHaIcon extends HTMLElement {
  static get observedAttributes() {
    return ["icon"];
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(): void {
    this.render();
  }

  private render(): void {
    const path = roomIcons[this.getAttribute("icon") ?? ""] ?? mdiHomeThermometerOutline;
    const root = this.shadowRoot ?? this.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        :host { display: inline-grid; place-items: center; }
        svg { display: block; width: 100%; height: 100%; fill: currentColor; }
      </style>
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>
    `;
  }
}

if (!customElements.get("ha-icon")) customElements.define("ha-icon", PromoHaIcon);

interface PromoRoom {
  slug: string;
  title: string;
  icon: string;
  temperature: number;
  humidity: number;
  minimum: number;
  maximum: number;
  phase: number;
}

const rooms: PromoRoom[] = [
  {
    slug: "living",
    title: "Living room",
    icon: "mdi:sofa-outline",
    temperature: 21.2,
    humidity: 45,
    minimum: 20.8,
    maximum: 21.5,
    phase: 0.3
  },
  {
    slug: "bedroom",
    title: "Bedroom",
    icon: "mdi:bed-king-outline",
    temperature: 13.2,
    humidity: 59,
    minimum: 11.7,
    maximum: 13.2,
    phase: 1.2
  }
];

function sensor(
  entityId: string,
  state: string | number,
  friendlyName: string,
  unit: string,
  deviceClass: string,
  time = new Date()
): HassEntity {
  return {
    entity_id: entityId,
    state: String(state),
    last_changed: time.toISOString(),
    attributes: {
      friendly_name: friendlyName,
      unit_of_measurement: unit,
      device_class: deviceClass
    }
  };
}

const states: Record<string, HassEntity> = {};
for (const room of rooms) {
  states[`sensor.${room.slug}_temperature`] = sensor(
    `sensor.${room.slug}_temperature`,
    room.temperature,
    `${room.title} temperature`,
    "°C",
    "temperature"
  );
  states[`sensor.${room.slug}_humidity`] = sensor(
    `sensor.${room.slug}_humidity`,
    room.humidity,
    `${room.title} humidity`,
    "%",
    "humidity"
  );
}

function historyFor(room: PromoRoom, entityId: string): HassEntity[] {
  const now = Date.now();
  const isHumidity = entityId.endsWith("_humidity");
  return Array.from({ length: 25 }, (_, index) => {
    const progress = index / 24;
    const time = new Date(now - (24 - index) * 60 * 60 * 1000);

    if (isHumidity) {
      const value = room.humidity + Math.sin(progress * Math.PI * 2 + room.phase) * 3;
      return sensor(entityId, value.toFixed(1), `${room.title} humidity`, "%", "humidity", time);
    }

    const center = (room.minimum + room.maximum) / 2;
    const amplitude = (room.maximum - room.minimum) / 2;
    const value =
      index === 24
        ? room.temperature
        : center + Math.sin(progress * Math.PI * 2 + room.phase) * amplitude;
    return sensor(
      entityId,
      value.toFixed(2),
      `${room.title} temperature`,
      "°C",
      "temperature",
      time
    );
  });
}

const hass: HomeAssistant = {
  states,
  locale: {
    language: "en-AU",
    number_format: "language",
    time_format: "12"
  },
  config: {
    unit_system: {
      temperature: "°C"
    }
  },
  async callApi<T>(
    _method: "GET" | "POST" | "PUT" | "DELETE",
    path: string
  ): Promise<T> {
    const url = new URL(path, "http://homeassistant.local/");
    const requested = decodeURIComponent(url.searchParams.get("filter_entity_id") ?? "").split(",");
    return requested.map((entityId) => {
      const room = rooms.find((candidate) => entityId.includes(candidate.slug));
      return room ? historyFor(room, entityId) : [];
    }) as T;
  }
};

for (const room of rooms) {
  const card = document.querySelector<TemperatureHumidityCard>(
    `temperature-humidity-card[data-room="${room.slug}"]`
  );
  if (!card) continue;

  const config: TemperatureHumidityCardConfig = {
    type: "custom:temperature-humidity-card",
    title: room.title,
    icon: room.icon,
    temperature_entity: `sensor.${room.slug}_temperature`,
    humidity_entity: `sensor.${room.slug}_humidity`,
    history_hours: 24,
    show_history: true,
    cold_threshold: 16,
    warm_threshold: 26,
    dry_threshold: 35,
    humid_threshold: 65
  };
  card.setConfig(config);
  card.hass = hass;
}

