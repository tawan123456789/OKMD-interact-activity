import { describe, it, expect } from "vitest";
import {
  applyHighCut,
  applyLowCut,
  getNextDirection,
  generateCutPoint,
  getNearestNumber,
  createInitialState,
  performCut,
  type RandomFn,
} from "./logic";

/** Deterministic random source cycling through given values in [0,1). */
function seq(values: number[]): RandomFn {
  let i = 0;
  return () => values[i++ % values.length];
}

describe("number-cut cuts", () => {
  it("CUT HIGH keeps [min, cut]", () => {
    expect(applyHighCut(1, 100, 73)).toEqual({ currentMin: 1, currentMax: 73 });
  });

  it("CUT LOW keeps [cut, max]", () => {
    expect(applyLowCut(1, 73, 21)).toEqual({ currentMin: 21, currentMax: 73 });
  });
});

describe("alternating direction", () => {
  it("alternates from high", () => {
    const seqDirs: string[] = [];
    let dir: "high" | "low" = "high";
    for (let i = 0; i < 5; i++) {
      seqDirs.push(dir);
      dir = getNextDirection(dir);
    }
    expect(seqDirs).toEqual(["high", "low", "high", "low", "high"]);
  });

  it("alternates from low", () => {
    const seqDirs: string[] = [];
    let dir: "high" | "low" = "low";
    for (let i = 0; i < 5; i++) {
      seqDirs.push(dir);
      dir = getNextDirection(dir);
    }
    expect(seqDirs).toEqual(["low", "high", "low", "high", "low"]);
  });

  it("performCut flips direction each normal round", () => {
    // Start high (rand<0.5), 6 rounds, big range so cuts stay valid.
    const state = createInitialState(1, 100, 6, seq([0.0]));
    expect(state.direction).toBe("high");
    const s1 = performCut(state, seq([0.5]));
    expect(s1.direction).toBe("low");
    const s2 = performCut(s1, seq([0.5]));
    expect(s2.direction).toBe("high");
  });
});

describe("cut safety", () => {
  it("HIGH cut never exceeds max-1 for range 40-50", () => {
    for (let r = 0; r < 1000; r++) {
      const cp = generateCutPoint(40, 50, "high");
      expect(cp).toBeGreaterThanOrEqual(40);
      expect(cp).toBeLessThanOrEqual(49);
    }
  });

  it("LOW cut never goes below min+1 for range 40-50", () => {
    for (let r = 0; r < 1000; r++) {
      const cp = generateCutPoint(40, 50, "low");
      expect(cp).toBeGreaterThanOrEqual(41);
      expect(cp).toBeLessThanOrEqual(50);
    }
  });

  it("range stays valid and within config bounds across a full game", () => {
    let state = createInitialState(1, 100, 8);
    for (let i = 0; i < 8 && !state.finished; i++) {
      state = performCut(state);
      expect(state.currentMin).toBeLessThanOrEqual(state.currentMax);
      expect(state.currentMin).toBeGreaterThanOrEqual(1);
      expect(state.currentMax).toBeLessThanOrEqual(100);
    }
    expect(state.finished).toBe(true);
    expect(state.finalAnswer).not.toBeNull();
    expect(state.finalAnswer!).toBeGreaterThanOrEqual(state.currentMin);
    expect(state.finalAnswer!).toBeLessThanOrEqual(state.currentMax);
  });
});

describe("final nearest number", () => {
  it("rounds 47.63 within 38-54 to 48", () => {
    expect(getNearestNumber(47.63, 38, 54)).toBe(48);
  });

  it("rounds 42.2 within 38-54 to 42", () => {
    expect(getNearestNumber(42.2, 38, 54)).toBe(42);
  });

  it("clamps to range bounds", () => {
    expect(getNearestNumber(60, 38, 54)).toBe(54);
    expect(getNearestNumber(30, 38, 54)).toBe(38);
  });
});

describe("early completion", () => {
  it("finishes immediately when a single number remains", () => {
    const base = createInitialState(42, 44, 6, seq([0.0]));
    // Force a single-number state.
    const single = { ...base, currentMin: 42, currentMax: 42, currentRound: 2 };
    const next = performCut(single);
    expect(next.finished).toBe(true);
    expect(next.finalAnswer).toBe(42);
  });

  it("final round resolves via nearest number", () => {
    // rounds=1 means first cut is already the final round.
    const state = createInitialState(38, 54, 1, seq([0.0]));
    // rand for generateFinalPosition: 0.6 -> 38 + 0.6*16 = 47.6 -> 48
    const next = performCut(state, seq([0.6]));
    expect(next.finished).toBe(true);
    expect(next.finalAnswer).toBe(48);
    expect(next.finalAnswer!).toBeGreaterThanOrEqual(38);
    expect(next.finalAnswer!).toBeLessThanOrEqual(54);
  });
});
