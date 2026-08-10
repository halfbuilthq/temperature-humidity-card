import { describe, expect, it } from "vitest";
import { cardStyles } from "../src/styles";

describe("card styling", () => {
  it("supports Home Assistant theme backgrounds and clear exception states", () => {
    expect(cardStyles.cssText).toContain(
      "var(--ha-card-background, var(--card-background-color, #141a21))"
    );
    expect(cardStyles.cssText).toContain("ha-card.cold");
    expect(cardStyles.cssText).toContain(".battery-warning");
  });
});
