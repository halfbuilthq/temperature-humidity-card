import {
  mdiAccountCircleOutline,
  mdiBathtubOutline,
  mdiBedKingOutline,
  mdiBedSingleOutline,
  mdiBellOutline,
  mdiCalendar,
  mdiCctv,
  mdiCogOutline,
  mdiConsole,
  mdiDesk,
  mdiFileDocumentOutline,
  mdiFlash,
  mdiFormatListBulleted,
  mdiHammerWrench,
  mdiHomeOutline,
  mdiHomeThermometerOutline,
  mdiLan,
  mdiMagnify,
  mdiMap,
  mdiMenu,
  mdiMessageOutline,
  mdiMusicCircleOutline,
  mdiPencilOutline,
  mdiPlus,
  mdiShowerHead,
  mdiSilverwareForkKnife,
  mdiStoreOutline,
  mdiTablet,
  mdiViewDashboardOutline,
  mdiWashingMachine
} from "@mdi/js";
import "../src/temperature-humidity-card";
import type { TemperatureHumidityCard } from "../src/temperature-humidity-card";
import type {
  HassEntity,
  HomeAssistant,
  TemperatureHumidityCardConfig
} from "../src/types";
import "./styles.css";

const iconPaths: Record<string, string> = {
  menu: mdiMenu,
  tablet: mdiTablet,
  map: mdiMap,
  energy: mdiFlash,
  camera: mdiCctv,
  calendar: mdiCalendar,
  file: mdiFileDocumentOutline,
  tools: mdiHammerWrench,
  store: mdiStoreOutline,
  network: mdiLan,
  terminal: mdiConsole,
  activity: mdiFormatListBulleted,
  dashboard: mdiViewDashboardOutline,
  home: mdiHomeOutline,
  music: mdiMusicCircleOutline,
  settings: mdiCogOutline,
  bell: mdiBellOutline,
  account: mdiAccountCircleOutline,
  plus: mdiPlus,
  search: mdiMagnify,
  message: mdiMessageOutline,
  edit: mdiPencilOutline
};

const roomIconPaths: Record<string, string> = {
  "mdi:silverware-fork-knife": mdiSilverwareForkKnife,
  "mdi:bed-single-outline": mdiBedSingleOutline,
  "mdi:bed-king-outline": mdiBedKingOutline,
  "mdi:bathtub-outline": mdiBathtubOutline,
  "mdi:desk": mdiDesk,
  "mdi:shower-head": mdiShowerHead,
  "mdi:washing-machine": mdiWashingMachine,
  "mdi:home-thermometer-outline": mdiHomeThermometerOutline
};

class MockHaIcon extends HTMLElement {
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
    const path = roomIconPaths[this.getAttribute("icon") ?? ""] ?? mdiHomeThermometerOutline;
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

if (!customElements.get("ha-icon")) customElements.define("ha-icon", MockHaIcon);

for (const slot of document.querySelectorAll<HTMLElement>(".icon-slot")) {
  const path = iconPaths[slot.dataset.icon ?? ""];
  if (path) {
    slot.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"></path></svg>`;
  }
}

interface Room {
  slug: string;
  title: string;
  icon: string;
  temperature: number;
  humidity: number;
  minimum: number;
  maximum: number;
  battery: number;
  phase: number;
}

const rooms: Room[] = [
  { slug: "kitchen", title: "Kitchen", icon: "mdi:silverware-fork-knife", temperature: 21.2, humidity: 45, minimum: 20.8, maximum: 21.5, battery: 83, phase: 0.2 },
  { slug: "bedroom_2", title: "Bedroom 2", icon: "mdi:bed-single-outline", temperature: 13.2, humidity: 59, minimum: 11.7, maximum: 13.2, battery: 77, phase: 1.2 },
  { slug: "bedroom_3", title: "Bedroom 3", icon: "mdi:bed-single-outline", temperature: 13.1, humidity: 60, minimum: 11.4, maximum: 13.1, battery: 70, phase: 2.4 },
  { slug: "bathroom", title: "Bathroom", icon: "mdi:bathtub-outline", temperature: 17.5, humidity: 54, minimum: 15.6, maximum: 17.5, battery: 83, phase: 3.1 },
  { slug: "study", title: "Study", icon: "mdi:desk", temperature: 19.1, humidity: 50, minimum: 14.4, maximum: 19.4, battery: 70, phase: 4.2 },
  { slug: "main_bedroom", title: "Main Bedroom", icon: "mdi:bed-king-outline", temperature: 20.1, humidity: 48, minimum: 18.7, maximum: 20.2, battery: 63, phase: 2.1 },
  { slug: "ensuite", title: "Ensuite", icon: "mdi:shower-head", temperature: 18.3, humidity: 56, minimum: 15.6, maximum: 18.4, battery: 77, phase: 0.8 },
  { slug: "laundry", title: "Laundry", icon: "mdi:washing-machine", temperature: 20.0, humidity: 49, minimum: 17.6, maximum: 20.0, battery: 18, phase: 4.8 }
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
  states[`sensor.${room.slug}_battery`] = sensor(
    `sensor.${room.slug}_battery`,
    room.battery,
    `${room.title} sensor battery`,
    "%",
    "battery"
  );
}

function historyFor(room: Room, kind: "temperature" | "humidity"): HassEntity[] {
  const now = Date.now();
  return Array.from({ length: 25 }, (_, index) => {
    const progress = index / 24;
    const time = new Date(now - (24 - index) * 60 * 60 * 1000);
    if (kind === "humidity") {
      const value = room.humidity + Math.sin(progress * Math.PI * 2 + room.phase) * 3;
      return sensor(
        `sensor.${room.slug}_humidity`,
        value.toFixed(1),
        `${room.title} humidity`,
        "%",
        "humidity",
        time
      );
    }

    const center = (room.minimum + room.maximum) / 2;
    const amplitude = (room.maximum - room.minimum) / 2;
    const wave = center + Math.sin(progress * Math.PI * 2 + room.phase) * amplitude;
    const value = index === 24 ? room.temperature : wave;
    return sensor(
      `sensor.${room.slug}_temperature`,
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
    const response = requested.map((entityId) => {
      const room = rooms.find((candidate) => entityId.includes(candidate.slug));
      if (!room) return [];
      return historyFor(room, entityId.endsWith("_humidity") ? "humidity" : "temperature");
    });
    return response as T;
  }
};

const grid = document.querySelector<HTMLElement>(".climate-grid");
if (!grid) throw new Error("Climate grid not found");

for (const room of rooms) {
  const card = document.createElement("temperature-humidity-card") as TemperatureHumidityCard;
  const config: TemperatureHumidityCardConfig = {
    type: "custom:temperature-humidity-card",
    title: room.title,
    icon: room.icon,
    temperature_entity: `sensor.${room.slug}_temperature`,
    humidity_entity: `sensor.${room.slug}_humidity`,
    battery_entity: `sensor.${room.slug}_battery`,
    history_hours: 24,
    show_history: true,
    cold_threshold: 16,
    warm_threshold: 26,
    dry_threshold: 35,
    humid_threshold: 65,
    low_battery_threshold: 25
  };
  card.setConfig(config);
  card.hass = hass;
  card.addEventListener("hass-more-info", (event) => {
    const entityId = (event as CustomEvent<{ entityId: string }>).detail.entityId;
    document.title = `${room.title} · ${entityId}`;
  });
  grid.append(card);
}
