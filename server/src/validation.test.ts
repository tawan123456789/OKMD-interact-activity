import { describe, it, expect } from "vitest";
import {
  validateRandomNumber,
  validateGuessWord,
  validateGuessPicture,
  validateNumberCut,
} from "./validation.js";

describe("validateRandomNumber", () => {
  it("accepts a valid range", () => {
    expect(validateRandomNumber({ min: 1, max: 100, shuffleSeconds: 0.8 }).valid).toBe(true);
    expect(validateRandomNumber({ min: 50, max: 50, shuffleSeconds: 3 }).valid).toBe(true);
  });

  it("rejects invalid ranges", () => {
    expect(validateRandomNumber({ min: 100, max: 1 }).valid).toBe(false);
    expect(validateRandomNumber({ min: 1.5, max: 10 }).valid).toBe(false);
    expect(validateRandomNumber({ min: "1", max: 10 }).valid).toBe(false);
    expect(validateRandomNumber({ min: 1 }).valid).toBe(false);
    expect(validateRandomNumber(null).valid).toBe(false);
  });

  it("defaults missing shuffleSeconds to 0.8 (backward compat)", () => {
    const r = validateRandomNumber({ min: 1, max: 10 });
    expect(r.valid).toBe(true);
    expect(r.value?.shuffleSeconds).toBe(0.8);
  });

  it("rejects out-of-range shuffle durations", () => {
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: 0 }).valid).toBe(false);
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: 20 }).valid).toBe(false);
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: "1" }).valid).toBe(false);
  });

  it("accepts fractional shuffle durations within range", () => {
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: 0.2 }).valid).toBe(true);
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: 10 }).valid).toBe(true);
    expect(validateRandomNumber({ min: 1, max: 10, shuffleSeconds: 1.5 }).valid).toBe(true);
  });
});

describe("validateGuessWord", () => {
  it("accepts and trims words", () => {
    const r = validateGuessWord({ words: ["  KNOWLEDGE ", "ความรู้"] });
    expect(r.valid).toBe(true);
    expect(r.value?.words).toEqual(["KNOWLEDGE", "ความรู้"]);
  });

  it("rejects empty configs", () => {
    expect(validateGuessWord({ words: [] }).valid).toBe(false);
    expect(validateGuessWord({ words: ["   "] }).valid).toBe(false);
    expect(validateGuessWord({ words: "nope" }).valid).toBe(false);
  });

  it("rejects duplicates", () => {
    expect(validateGuessWord({ words: ["A", "a"] }).valid).toBe(false);
  });
});

describe("validateGuessPicture", () => {
  const base = { id: "x", image: "/storage/images/a.jpg", answer: "A" };

  it("accepts valid grid sizes", () => {
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 2, gridColumns: 2 }] }).valid).toBe(true);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 3, gridColumns: 4 }] }).valid).toBe(true);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 8, gridColumns: 8 }] }).valid).toBe(true);
  });

  it("defaults missing grid values to 4x4 (backward compat)", () => {
    const r = validateGuessPicture({ pictures: [base] });
    expect(r.valid).toBe(true);
    expect(r.value?.pictures[0].gridRows).toBe(4);
    expect(r.value?.pictures[0].gridColumns).toBe(4);
  });

  it("rejects invalid grid dimensions", () => {
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 1, gridColumns: 4 }] }).valid).toBe(false);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 0, gridColumns: 0 }] }).valid).toBe(false);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 9, gridColumns: 4 }] }).valid).toBe(false);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 4, gridColumns: 20 }] }).valid).toBe(false);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: 3.5, gridColumns: 4 }] }).valid).toBe(false);
    expect(validateGuessPicture({ pictures: [{ ...base, gridRows: -2, gridColumns: 4 }] }).valid).toBe(false);
  });

  it("rejects empty answer", () => {
    expect(validateGuessPicture({ pictures: [{ ...base, answer: "  " }] }).valid).toBe(false);
  });

  it("accepts empty picture list", () => {
    expect(validateGuessPicture({ pictures: [] }).valid).toBe(true);
  });
});

describe("validateNumberCut", () => {
  it("accepts a valid config", () => {
    expect(validateNumberCut({ min: 1, max: 100, rounds: 6 }).valid).toBe(true);
    expect(validateNumberCut({ min: 0, max: 2, rounds: 2 }).valid).toBe(true);
  });

  it("rejects min >= max", () => {
    expect(validateNumberCut({ min: 10, max: 10, rounds: 6 }).valid).toBe(false);
    expect(validateNumberCut({ min: 20, max: 5, rounds: 6 }).valid).toBe(false);
  });

  it("rejects range smaller than 2", () => {
    expect(validateNumberCut({ min: 1, max: 2, rounds: 6 }).valid).toBe(false);
  });

  it("rejects invalid rounds", () => {
    expect(validateNumberCut({ min: 1, max: 100, rounds: 1 }).valid).toBe(false);
    expect(validateNumberCut({ min: 1, max: 100, rounds: 21 }).valid).toBe(false);
    expect(validateNumberCut({ min: 1, max: 100, rounds: 2.5 }).valid).toBe(false);
  });

  it("rejects non-integer bounds", () => {
    expect(validateNumberCut({ min: 1.5, max: 100, rounds: 6 }).valid).toBe(false);
    expect(validateNumberCut({ min: 1, max: "100", rounds: 6 }).valid).toBe(false);
  });
});
