import { describe, expect, it } from "vitest";
import {
  CHART_HEIGHT,
  CHART_WIDTH,
  chartPositionPercent,
  nearestChartPointIndex,
  sparklinePath,
  sparklinePoint
} from "../src/chart";

describe("temperature sparkline", () => {
  it("creates a smooth path across the chart dimensions", () => {
    const path = sparklinePath([18, 19, 18.5, 20]);
    expect(path).toMatch(/^M 0 /);
    expect(path).toContain(`, ${CHART_WIDTH} `);
    expect(CHART_HEIGHT).toBe(34);
  });

  it("returns an empty path when history is unavailable", () => {
    expect(sparklinePath([undefined, undefined])).toBe("");
  });

  it("selects the nearest reading and clamps to the sparkline", () => {
    expect(nearestChartPointIndex(100, 100, 240, 25)).toBe(0);
    expect(nearestChartPointIndex(220, 100, 240, 25)).toBe(12);
    expect(nearestChartPointIndex(400, 100, 240, 25)).toBe(24);
  });

  it("positions keyboard selections and inspection markers", () => {
    expect(chartPositionPercent(0, 25)).toBe(0);
    expect(chartPositionPercent(24, 25)).toBe(100);
    expect(sparklinePoint([18, 19, 20], 1)).toEqual([60, 17]);
  });
});
