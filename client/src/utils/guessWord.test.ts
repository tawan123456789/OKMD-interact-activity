import { describe, it, expect } from "vitest";
import {
  buildCells,
  applyGuess,
  isCorrectGuess,
  isSolved,
} from "./guessWord";

function display(cells: ReturnType<typeof buildCells>): string {
  return cells
    .map((c) => (c.guessable ? (c.revealed ? c.char : "_") : c.char))
    .join(" ");
}

describe("guessWord", () => {
  it("reveals all occurrences of a correct guess (BANANA + A)", () => {
    let cells = buildCells("BANANA");
    cells = applyGuess(cells, "A");
    expect(display(cells)).toBe("_ A _ A _ A");
  });

  it("does not change state on a wrong guess", () => {
    const cells = buildCells("BANANA");
    const before = display(cells);
    const after = applyGuess(cells, "Z");
    expect(display(after)).toBe(before);
  });

  it("repeated correct guess does not corrupt state", () => {
    let cells = buildCells("BANANA");
    cells = applyGuess(cells, "A");
    cells = applyGuess(cells, "A");
    expect(display(cells)).toBe("_ A _ A _ A");
  });

  it("detects a correct guess", () => {
    const cells = buildCells("BANANA");
    expect(isCorrectGuess(cells, "a")).toBe(true);
    expect(isCorrectGuess(cells, "z")).toBe(false);
  });

  it("solves a word once all letters guessed", () => {
    let cells = buildCells("AB");
    cells = applyGuess(cells, "A");
    expect(isSolved(cells)).toBe(false);
    cells = applyGuess(cells, "B");
    expect(isSolved(cells)).toBe(true);
  });

  it("reveals spaces from the start but keeps them non-guessable", () => {
    const cells = buildCells("A B");
    const space = cells.find((c) => c.char === " ");
    expect(space?.guessable).toBe(false);
    expect(space?.revealed).toBe(true);
  });

  it("reveals punctuation from the start", () => {
    const cells = buildCells("A-B");
    const dash = cells.find((c) => c.char === "-");
    expect(dash?.revealed).toBe(true);
    expect(dash?.guessable).toBe(false);
  });

  it("supports Thai words without splitting combining marks", () => {
    const cells = buildCells("ความรู้");
    // Every guessable cell must contain a Thai base letter.
    for (const cell of cells) {
      if (cell.guessable) {
        expect(/[\u0E00-\u0E7F]/.test(cell.char)).toBe(true);
      }
    }
    // Guessing the first base consonant reveals it.
    const revealed = applyGuess(cells, "ค");
    expect(revealed.some((c) => c.revealed && c.char.startsWith("ค"))).toBe(true);
  });
});
