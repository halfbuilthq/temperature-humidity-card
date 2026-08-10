import {
  mdiBatteryAlertVariantOutline,
  mdiFire,
  mdiSnowflake,
  mdiThermometerAlert,
  mdiWaterPercent,
  mdiWaterPercentAlert,
  mdiWeatherWindy
} from "@mdi/js";
import { LitElement, html, nothing, svg, type PropertyValues } from "lit";
import {
  getConfigForm,
  getStubConfig,
  normalizeConfig,
  validateConfig
} from "./config";
import { CHART_HEIGHT, CHART_WIDTH, sparklinePath } from "./chart";
import { fetchRoomHistory } from "./history";
import { cardStyles } from "./styles";
import type {
  ComfortKey,
  HistoryPoint,
  HomeAssistant,
  TemperatureHumidityCardConfig
} from "./types";
import {
  comfortStatus,
  entity,
  formatNumber,
  gaugeProgress,
  lowBattery,
  numericState,
  temperatureUnit
} from "./values";

const HISTORY_REFRESH_MS = 10 * 60 * 1000;
const GAUGE_CENTER_X = 126;
const GAUGE_CENTER_Y = 116;
const GAUGE_RADIUS = 95;
const GAUGE_START_DEGREES = 140;
const GAUGE_SWEEP_DEGREES = 260;

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function statusIcon(key: ComfortKey): string {
  switch (key) {
    case "cold":
      return mdiSnowflake;
    case "warm":
      return mdiFire;
    case "dry":
      return mdiWeatherWindy;
    case "humid":
    case "mixed":
      return mdiWaterPercentAlert;
    case "unavailable":
      return mdiThermometerAlert;
    default:
      return mdiWaterPercent;
  }
}

function markerPoint(progress: number): { x: number; y: number } {
  const boundedProgress = Math.min(100, Math.max(0, progress));
  const angle = degreesToRadians(
    GAUGE_START_DEGREES + (boundedProgress / 100) * GAUGE_SWEEP_DEGREES
  );
  return {
    x: GAUGE_CENTER_X + GAUGE_RADIUS * Math.cos(angle),
    y: GAUGE_CENTER_Y + GAUGE_RADIUS * Math.sin(angle)
  };
}

function tick(index: number): { x1: number; y1: number; x2: number; y2: number } {
  const angle = degreesToRadians(
    GAUGE_START_DEGREES + (index / 8) * GAUGE_SWEEP_DEGREES
  );
  return {
    x1: GAUGE_CENTER_X + 85 * Math.cos(angle),
    y1: GAUGE_CENTER_Y + 85 * Math.sin(angle),
    x2: GAUGE_CENTER_X + 92 * Math.cos(angle),
    y2: GAUGE_CENTER_Y + 92 * Math.sin(angle)
  };
}

function fallbackHistory(
  temperature: number | undefined,
  humidity: number | undefined,
  hours: number
): HistoryPoint[] {
  const now = Date.now();
  return Array.from({ length: 25 }, (_, index) => ({
    timestamp: now - ((24 - index) / 24) * hours * 60 * 60 * 1000,
    temperature,
    humidity
  }));
}

export class TemperatureHumidityCard extends LitElement {
  static properties = {
    hass: { attribute: false },
    _config: { state: true },
    _history: { state: true },
    _historyLoading: { state: true },
    _historyFailed: { state: true }
  };

  static styles = cardStyles;

  hass?: HomeAssistant;
  private _config?: TemperatureHumidityCardConfig;
  private _history: HistoryPoint[] = [];
  private _historyLoading = false;
  private _historyFailed = false;
  private _lastHistoryKey = "";
  private _lastHistoryFetch = 0;

  static getConfigForm() {
    return getConfigForm();
  }

  static getStubConfig(hass?: HomeAssistant) {
    return getStubConfig(hass);
  }

  setConfig(config: TemperatureHumidityCardConfig): void {
    validateConfig(config);
    this._config = normalizeConfig({ ...config });
  }

  getCardSize(): number {
    return this._config?.show_history === false ? 4 : 5;
  }

  getGridOptions() {
    return {
      columns: 3,
      min_columns: 3,
      rows: "auto"
    };
  }

  protected updated(changedProperties: PropertyValues): void {
    if (changedProperties.has("hass") || changedProperties.has("_config")) {
      queueMicrotask(() => void this._loadHistoryIfNeeded());
    }
  }

  private get _locale(): string | undefined {
    return this.hass?.locale?.language ?? this.hass?.language;
  }

  private async _loadHistoryIfNeeded(): Promise<void> {
    const config = this._config;
    const hass = this.hass;
    if (!config || !hass || config.show_history === false) return;

    const hours = config.history_hours ?? 24;
    const key = `${config.temperature_entity}|${config.humidity_entity}|${hours}`;
    const now = Date.now();
    if (
      this._historyLoading ||
      (key === this._lastHistoryKey && now - this._lastHistoryFetch < HISTORY_REFRESH_MS)
    ) {
      return;
    }

    this._historyLoading = true;
    this._historyFailed = false;
    this._lastHistoryKey = key;
    this._lastHistoryFetch = now;

    try {
      this._history = await fetchRoomHistory(
        hass,
        config.temperature_entity,
        config.humidity_entity,
        hours
      );
    } catch {
      this._history = [];
      this._historyFailed = true;
    } finally {
      this._historyLoading = false;
    }
  }

  private _openMoreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent("hass-more-info", {
        detail: { entityId },
        bubbles: true,
        composed: true
      })
    );
  }

  private _renderGauge(progress: number) {
    const marker = markerPoint(progress);
    return svg`
      <svg class="gauge" viewBox="0 0 252 205" aria-hidden="true">
        <path
          class="gauge-track"
          pathLength="100"
          d="M 53 177 A 95 95 0 1 1 199 177"
        ></path>
        <path
          class="gauge-value"
          pathLength="100"
          style=${`--gauge-progress: ${progress}`}
          d="M 53 177 A 95 95 0 1 1 199 177"
        ></path>
        ${Array.from({ length: 9 }, (_, index) => {
          const point = tick(index);
          return svg`
            <line
              class="gauge-tick"
              x1=${point.x1}
              y1=${point.y1}
              x2=${point.x2}
              y2=${point.y2}
            ></line>
          `;
        })}
        <circle class="gauge-marker" cx=${marker.x} cy=${marker.y} r="4.5"></circle>
      </svg>
    `;
  }

  protected render() {
    const config = this._config;
    if (!config) return nothing;

    const temperatureEntity = entity(this.hass, config.temperature_entity);
    const humidityEntity = entity(this.hass, config.humidity_entity);
    const batteryEntity = entity(this.hass, config.battery_entity);
    const temperature = numericState(temperatureEntity);
    const humidity = numericState(humidityEntity);
    const battery = numericState(batteryEntity);
    const status = comfortStatus(temperature, humidity, config);
    const progress = gaugeProgress(temperature);
    const unit = temperatureUnit(this.hass, temperatureEntity);
    const title =
      config.title ||
      temperatureEntity?.attributes.friendly_name?.replace(/ temperature$/i, "") ||
      "Room climate";
    const history =
      this._history.length > 1
        ? this._history
        : fallbackHistory(temperature, humidity, config.history_hours ?? 24);
    const temperatures = history
      .map((point) => point.temperature)
      .filter((value): value is number => value !== undefined);
    const minimum = temperatures.length ? Math.min(...temperatures) : temperature;
    const maximum = temperatures.length ? Math.max(...temperatures) : temperature;
    const path = sparklinePath(history.map((point) => point.temperature));
    const showStatus = status.key !== "comfortable";
    const showLowBattery = lowBattery(battery, config.low_battery_threshold ?? 25);

    return html`
      <ha-card class=${status.key}>
        <article class="card" aria-label=${`${title} temperature and humidity`}>
          <header class="header">
            <button
              class="room"
              type="button"
              @click=${() => this._openMoreInfo(config.temperature_entity)}
              aria-label=${`Open ${title} temperature details`}
            >
              <ha-icon icon=${config.icon || "mdi:home-thermometer-outline"}></ha-icon>
              <h1>${title}</h1>
            </button>
            ${showStatus
              ? html`
                  <span class="status" title=${status.label}>
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d=${statusIcon(status.key)}></path>
                    </svg>
                    ${status.label}
                  </span>
                `
              : nothing}
          </header>

          ${showLowBattery
            ? html`
                <button
                  class="battery-warning"
                  type="button"
                  @click=${() => this._openMoreInfo(config.battery_entity)}
                  aria-label=${`Battery low at ${formatNumber(battery, this._locale, 0)} percent`}
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d=${mdiBatteryAlertVariantOutline}></path>
                  </svg>
                  ${formatNumber(battery, this._locale, 0)}%
                </button>
              `
            : nothing}

          <section class="dial">
            ${this._renderGauge(progress)}
            <div class="metrics">
              <button
                class="temperature"
                type="button"
                @click=${() => this._openMoreInfo(config.temperature_entity)}
                aria-label=${`Temperature ${formatNumber(temperature, this._locale)} ${unit}`}
              >
                ${formatNumber(temperature, this._locale)}<small>${unit}</small>
              </button>
              <button
                class="humidity"
                type="button"
                @click=${() => this._openMoreInfo(config.humidity_entity)}
                aria-label=${`Humidity ${formatNumber(humidity, this._locale, 0)} percent`}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d=${mdiWaterPercent}></path>
                </svg>
                <strong>${formatNumber(humidity, this._locale, 0)}%</strong>
              </button>
              <span class="humidity-label">Humidity</span>
            </div>
          </section>

          ${config.show_history === false
            ? nothing
            : html`
                <footer class="history">
                  ${this._historyLoading && this._history.length === 0
                    ? html`<span class="history-placeholder">Loading history…</span>`
                    : this._historyFailed && this._history.length === 0
                      ? html`<span class="history-placeholder">History unavailable</span>`
                      : html`
                          <span class="range">
                            Min
                            <strong>${formatNumber(minimum, this._locale)}${unit}</strong>
                          </span>
                          <button
                            class="sparkline-button"
                            type="button"
                            @click=${() => this._openMoreInfo(config.temperature_entity)}
                            aria-label=${`Open ${config.history_hours ?? 24} hour temperature history`}
                          >
                            <svg
                              class="sparkline"
                              viewBox="0 0 ${CHART_WIDTH} ${CHART_HEIGHT}"
                              preserveAspectRatio="none"
                              role="img"
                              aria-label="Temperature trend"
                            >
                              <line
                                class="sparkline-baseline"
                                x1="0"
                                y1=${CHART_HEIGHT - 1}
                                x2=${CHART_WIDTH}
                                y2=${CHART_HEIGHT - 1}
                              ></line>
                              <path class="sparkline-path" d=${path}></path>
                            </svg>
                          </button>
                          <span class="range max">
                            Max
                            <strong>${formatNumber(maximum, this._locale)}${unit}</strong>
                          </span>
                        `}
                </footer>
              `}
        </article>
      </ha-card>
    `;
  }
}

if (!customElements.get("temperature-humidity-card")) {
  customElements.define("temperature-humidity-card", TemperatureHumidityCard);
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((card) => card.type === "temperature-humidity-card")) {
  window.customCards.push({
    type: "temperature-humidity-card",
    name: "Temperature & Humidity Card",
    preview: true,
    description: "A sensor-only room comfort card with daily range and trend.",
    documentationURL: "https://github.com/halfbuilthq/temperature-humidity-card"
  });
}

export default TemperatureHumidityCard;
