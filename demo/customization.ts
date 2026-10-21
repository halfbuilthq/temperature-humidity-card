import { mdiHomeThermometerOutline } from "@mdi/js";
import "../src/temperature-humidity-card";
import type { TemperatureHumidityCard } from "../src/temperature-humidity-card";
import type { HomeAssistant, TemperatureHumidityCardConfig } from "../src/types";

if (!customElements.get("ha-icon")) {
  customElements.define("ha-icon", class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<svg viewBox="0 0 24 24" fill="currentColor"><path d="${mdiHomeThermometerOutline}"></path></svg>`;
    }
  });
}

const examples: Array<{ title: string; temperature: string; humidity?: string; config?: Partial<TemperatureHumidityCardConfig> }> = [
  { title: "Temperature only", temperature: "21.2" },
  { title: "Kalt · Temperature only", temperature: "13.2", config: { cold_label: "Kalt", cold_color: "#b48aff" } },
  { title: "Translated mixed warning", temperature: "28", humidity: "72", config: { warm_label: "Warm", humid_label: "Feucht", mixed_color: "#ffcc66" } },
  { title: "Custom comfortable colour", temperature: "21.2", humidity: "45", config: { comfortable_color: "#89dd9f" } },
  { title: "Configured sensor offline", temperature: "21.2", humidity: "unavailable", config: { unavailable_label: "Nicht verfügbar", unavailable_color: "#ff8096" } },
  { title: "Existing defaults", temperature: "13.2", humidity: "59" }
];

for (const [index, example] of examples.entries()) {
  const temperatureId = `sensor.preview_${index}_temperature`;
  const humidityId = example.humidity === undefined ? undefined : `sensor.preview_${index}_humidity`;
  const states: HomeAssistant["states"] = {
    [temperatureId]: { entity_id: temperatureId, state: example.temperature, attributes: { unit_of_measurement: "°C" } }
  };
  if (humidityId) states[humidityId] = { entity_id: humidityId, state: example.humidity!, attributes: {} };
  const card = document.createElement("temperature-humidity-card") as TemperatureHumidityCard;
  card.setConfig({
    type: "custom:temperature-humidity-card", title: example.title,
    temperature_entity: temperatureId, humidity_entity: humidityId, ...example.config
  });
  card.hass = {
    states, locale: { language: "en-AU" },
    async callApi<T>(_method: string, path: string) {
      const ids = new URL(path, "http://localhost/").searchParams.get("filter_entity_id")!.split(",");
      return ids.map((id) => Array.from({ length: 25 }, (_, point) => ({
        ...states[id],
        state: id === temperatureId
          ? String(Number(example.temperature) + Math.sin(point / 4) * 0.8)
          : states[id].state,
        last_changed: new Date(Date.now() - (24 - point) * 3600000).toISOString()
      }))) as T;
    }
  };
  document.querySelector("main")!.append(card);
}
