import { describe, it, expect } from "vitest";
import { randomInt } from "./random";

describe("randomInt", () => {
  it("always returns a value within [min, max]", () => {
    for (let i = 0; i < 1000; i++) {
      const r = randomInt(50, 80);
      expect(r).toBeGreaterThanOrEqual(50);
      expect(r).toBeLessThanOrEqual(80);
      expect(Number.isInteger(r)).toBe(true);
    }
  });

  it("handles a single-value range", () => {
    expect(randomInt(7, 7)).toBe(7);
  });
});
