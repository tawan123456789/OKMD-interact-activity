import { describe, it, expect } from "vitest";
import {
  buildTiles,
  revealTile,
  revealAll,
  pickRandomClosedTile,
  revealedCount,
  allRevealed,
  totalTiles,
} from "./pictureGrid";

describe("pictureGrid - grid generation", () => {
  it.each([
    [2, 2, 4],
    [3, 3, 9],
    [3, 4, 12],
    [4, 4, 16],
    [5, 5, 25],
    [8, 8, 64],
  ])("%i x %i => %i tiles", (rows, cols, expected) => {
    expect(totalTiles(rows, cols)).toBe(expected);
    expect(buildTiles(rows, cols)).toHaveLength(expected);
  });

  it("numbers tiles from 1..N", () => {
    const tiles = buildTiles(3, 3);
    expect(tiles[0].number).toBe(1);
    expect(tiles[8].number).toBe(9);
  });
});

describe("pictureGrid - random reveal", () => {
  it("never returns a tile index beyond the grid (3x3 -> max 8)", () => {
    let tiles = buildTiles(3, 3);
    for (let i = 0; i < 9; i++) {
      const pick = pickRandomClosedTile(tiles);
      expect(pick).not.toBeNull();
      expect(pick!).toBeGreaterThanOrEqual(0);
      expect(pick!).toBeLessThanOrEqual(8);
      tiles = revealTile(tiles, pick!);
    }
  });

  it("never returns index beyond grid (5x5 -> max 24)", () => {
    let tiles = buildTiles(5, 5);
    for (let i = 0; i < 25; i++) {
      const pick = pickRandomClosedTile(tiles);
      expect(pick!).toBeLessThanOrEqual(24);
      tiles = revealTile(tiles, pick!);
    }
  });

  it("never picks an already-revealed tile", () => {
    let tiles = buildTiles(4, 4);
    const seen = new Set<number>();
    for (let i = 0; i < 16; i++) {
      const pick = pickRandomClosedTile(tiles);
      expect(seen.has(pick!)).toBe(false);
      seen.add(pick!);
      tiles = revealTile(tiles, pick!);
    }
    // All revealed now: no more closed tiles.
    expect(pickRandomClosedTile(tiles)).toBeNull();
  });

  it("reports completion when all revealed", () => {
    let tiles = buildTiles(2, 2);
    expect(allRevealed(tiles)).toBe(false);
    tiles = revealAll(tiles);
    expect(allRevealed(tiles)).toBe(true);
    expect(revealedCount(tiles)).toBe(4);
  });
});

describe("pictureGrid - reveal & reset", () => {
  it("revealTile is idempotent", () => {
    let tiles = buildTiles(3, 3);
    tiles = revealTile(tiles, 4);
    tiles = revealTile(tiles, 4);
    expect(revealedCount(tiles)).toBe(1);
  });

  it("rebuilding tiles (reset / next picture) clears revealed state", () => {
    // Simulate Picture A = 3x3, reveal a few, then Next Picture B = 5x5.
    let tiles = buildTiles(3, 3);
    tiles = revealTile(tiles, 0);
    tiles = revealTile(tiles, 1);
    expect(revealedCount(tiles)).toBe(2);

    const rebuilt = buildTiles(5, 5);
    expect(rebuilt).toHaveLength(25);
    expect(revealedCount(rebuilt)).toBe(0);
  });
});
