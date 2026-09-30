import { pickRandom } from "./random";

export interface Tile {
  index: number;
  number: number;
  revealed: boolean;
}

/** Total tiles is always derived from grid dimensions, never hard-coded. */
export function totalTiles(gridRows: number, gridColumns: number): number {
  return gridRows * gridColumns;
}

/** Build a fresh (all-closed) tile array for the given grid. */
export function buildTiles(gridRows: number, gridColumns: number): Tile[] {
  const count = totalTiles(gridRows, gridColumns);
  return Array.from({ length: count }, (_, index) => ({
    index,
    number: index + 1,
    revealed: false,
  }));
}

/** Reveal a single tile by index. No-op if already revealed. */
export function revealTile(tiles: Tile[], index: number): Tile[] {
  return tiles.map((t) => (t.index === index ? { ...t, revealed: true } : t));
}

/** Reveal every tile (used by Reveal Answer). */
export function revealAll(tiles: Tile[]): Tile[] {
  return tiles.map((t) => ({ ...t, revealed: true }));
}

/** Pick a random still-closed tile index, or null when none remain. */
export function pickRandomClosedTile(tiles: Tile[]): number | null {
  const closed = tiles.filter((t) => !t.revealed);
  const chosen = pickRandom(closed);
  return chosen ? chosen.index : null;
}

export function revealedCount(tiles: Tile[]): number {
  return tiles.filter((t) => t.revealed).length;
}

export function allRevealed(tiles: Tile[]): boolean {
  return tiles.length > 0 && tiles.every((t) => t.revealed);
}
