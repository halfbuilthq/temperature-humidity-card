import { describe, expect, it } from "vitest";
import { CHART_HEIGHT, CHART_WIDTH, sparklinePath } from "../src/chart";

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
});
