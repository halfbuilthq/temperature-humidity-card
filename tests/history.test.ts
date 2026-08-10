import { describe, expect, it } from "vitest";
import { fetchRoomHistory } from "../src/history";
import type { HassEntity, HomeAssistant } from "../src/types";

describe("room sensor history", () => {
  it("interpolates temperature and humidity sensor states", async () => {
    const start = new Date("2026-08-09T00:00:00.000Z");
    const end = new Date("2026-08-10T00:00:00.000Z");
    const state = (
      entityId: string,
      value: number,
      time: Date
    ): HassEntity => ({
      entity_id: entityId,
      state: String(value),
      last_changed: time.toISOString(),
      attributes: {}
    });
    const hass = {
      states: {},
      async callApi<T>() {
        return [
          [
            state("sensor.room_temperature", 18, start),
            state("sensor.room_temperature", 22, end)
          ],
          [
            state("sensor.room_humidity", 40, start),
            state("sensor.room_humidity", 60, end)
          ]
        ] as T;
      }
    } as HomeAssistant;

    const points = await fetchRoomHistory(
      hass,
      "sensor.room_temperature",
      "sensor.room_humidity",
      24,
      end
    );
    expect(points).toHaveLength(25);
    expect(points[0]).toMatchObject({ temperature: 18, humidity: 40 });
    expect(points[12].temperature).toBeCloseTo(20);
    expect(points[12].humidity).toBeCloseTo(50);
    expect(points.at(-1)).toMatchObject({ temperature: 22, humidity: 60 });
  });
});
