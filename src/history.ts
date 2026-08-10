import type { HassEntity, HistoryPoint, HomeAssistant } from "./types";
import { numericState } from "./values";

type HistoryResponse = HassEntity[][];

const BUCKET_COUNT = 25;

function seriesByEntity(response: HistoryResponse, entityId: string): HassEntity[] {
  return response.find((series) => series.some((state) => state.entity_id === entityId)) ?? [];
}

function timestampOf(state: HassEntity): number {
  return Date.parse(state.last_changed ?? state.last_updated ?? "");
}

function valueAt(series: HassEntity[], timestamp: number): number | undefined {
  if (series.length === 0) return undefined;

  let before = series[0];
  let after = series.at(-1) ?? series[0];

  for (const state of series) {
    const stateTime = timestampOf(state);
    if (!Number.isFinite(stateTime)) continue;
    if (stateTime <= timestamp) before = state;
    if (stateTime >= timestamp) {
      after = state;
      break;
    }
  }

  const beforeValue = numericState(before);
  const afterValue = numericState(after);
  if (beforeValue === undefined) return afterValue;
  if (afterValue === undefined) return beforeValue;

  const beforeTime = timestampOf(before);
  const afterTime = timestampOf(after);
  if (!Number.isFinite(beforeTime) || !Number.isFinite(afterTime) || beforeTime === afterTime) {
    return beforeValue;
  }

  const progress = Math.min(1, Math.max(0, (timestamp - beforeTime) / (afterTime - beforeTime)));
  return beforeValue + (afterValue - beforeValue) * progress;
}

export async function fetchRoomHistory(
  hass: HomeAssistant,
  temperatureEntityId: string,
  humidityEntityId: string,
  hours: number,
  now = new Date()
): Promise<HistoryPoint[]> {
  const safeHours = Math.min(168, Math.max(1, hours));
  const start = new Date(now.getTime() - safeHours * 60 * 60 * 1000);
  const entityIds = `${temperatureEntityId},${humidityEntityId}`;
  const path =
    `history/period/${encodeURIComponent(start.toISOString())}` +
    `?end_time=${encodeURIComponent(now.toISOString())}` +
    `&filter_entity_id=${encodeURIComponent(entityIds)}` +
    "&significant_changes_only=0";

  const response = await hass.callApi<HistoryResponse>("GET", path);
  const temperatures = seriesByEntity(response, temperatureEntityId);
  const humidities = seriesByEntity(response, humidityEntityId);

  return Array.from({ length: BUCKET_COUNT }, (_, index) => {
    const timestamp =
      start.getTime() +
      (index / (BUCKET_COUNT - 1)) * (now.getTime() - start.getTime());
    return {
      timestamp,
      temperature: valueAt(temperatures, timestamp),
      humidity: valueAt(humidities, timestamp)
    };
  });
}
