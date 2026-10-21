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

const examples = [
  { title: "Live reading", temperature: 15, humidity: 50 },
  { title: "Neutral · temperature only", temperature: 21, humidity: undefined },
  { title: "Warm · temperature only", temperature: 29, humidity: undefined },
  { title: "Dry", temperature: 21, humidity: 25 },
  { title: "Humid", temperature: 21, humidity: 75 },
  { title: "Warm + humid · blended", temperature: 29, humidity: 75 }
];

const cards: TemperatureHumidityCard[] = [];
const configurations: TemperatureHumidityCardConfig[] = [];
function sensor(entity_id: string, state: number): HomeAssistant["states"][string] {
  return { entity_id, state: String(state), attributes: { unit_of_measurement: entity_id.endsWith("temperature") ? "°C" : "%" } };
}

for (const [index, example] of examples.entries()) {
  const temperature = `sensor.gradient_${index}_temperature`;
  const humidity = example.humidity === undefined ? undefined : `sensor.gradient_${index}_humidity`;
  const states = { [temperature]: sensor(temperature, example.temperature) };
  if (humidity) states[humidity] = sensor(humidity, example.humidity!);
  const config: TemperatureHumidityCardConfig = {
    type: "custom:temperature-humidity-card", title: example.title,
    temperature_entity: temperature, humidity_entity: humidity,
    color_mode: "gradient", show_history: false
  };
  const card = document.createElement("temperature-humidity-card") as TemperatureHumidityCard;
  card.setConfig(config);
  card.hass = { states, locale: { language: "en-AU" }, async callApi<T>() { return [] as T; } };
  cards.push(card);
  configurations.push(config);
  document.querySelector("main")!.append(card);
}

document.querySelector<HTMLSelectElement>("#mode")!.addEventListener("change", (event) => {
  const mode = (event.target as HTMLSelectElement).value as "state" | "gradient";
  for (const [index, card] of cards.entries()) {
    configurations[index] = { ...configurations[index], color_mode: mode };
    card.setConfig(configurations[index]);
  }
});

for (const kind of ["temperature", "humidity"] as const) {
  document.querySelector<HTMLInputElement>(`#${kind}`)!.addEventListener("input", (event) => {
    const value = Number((event.target as HTMLInputElement).value);
    const card = cards[0];
    const id = kind === "temperature" ? configurations[0].temperature_entity : configurations[0].humidity_entity!;
    card.hass = { ...card.hass!, states: { ...card.hass!.states, [id]: sensor(id, value) } };
    document.querySelector<HTMLOutputElement>(`#${kind}-value`)!.value = `${value}${kind === "temperature" ? " °C" : "%"}`;
  });
}
