/**
 * Pure game logic for Number Cut ("ตัดหัว ตัดหาง").
 *
 * The range is progressively trimmed from the high or low end, alternating
 * direction each round. The final round picks the integer nearest to a random
 * position within the remaining range. All functions here are side-effect free
 * (except where a random source is explicitly passed/used) so they can be
 * unit-tested without rendering.
 */

export type CutDirection = "high" | "low";

export interface NumberCutState {
  /** Original configured bounds (the Number Bar scale never changes). */
  configMin: number;
  configMax: number;
  /** Current active range. */
  currentMin: number;
  currentMax: number;
  /** 1-based round counter. */
  currentRound: number;
  totalRounds: number;
  /** Direction for the CURRENT round. */
  direction: CutDirection;
  /** The most recent cut point (integer), or null before any cut. */
  lastCutPoint: number | null;
  /** The random position used in the final round, or null. */
  finalPosition: number | null;
  /** The resolved final answer, or null until the game ends. */
  finalAnswer: number | null;
  finished: boolean;
}

/** A random source returning a float in [0, 1). Injectable for tests. */
export type RandomFn = () => number;

const defaultRandom: RandomFn = Math.random;

/** Random integer in [min, max] inclusive. */
export function randomIntInclusive(min: number, max: number, rand: RandomFn = defaultRandom): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}

/** The opposite direction. */
export function getNextDirection(dir: CutDirection): CutDirection {
  return dir === "high" ? "low" : "high";
}

/** Randomly pick a starting direction. */
export function pickStartingDirection(rand: RandomFn = defaultRandom): CutDirection {
  return rand() < 0.5 ? "high" : "low";
}

/**
 * Generate a safe cut point for the given direction that never empties the
 * range (always leaves at least one number on the active side).
 *
 *  - high: cutPoint in [currentMin, currentMax - 1]; removes numbers > cutPoint
 *  - low:  cutPoint in [currentMin + 1, currentMax]; removes numbers < cutPoint
 */
export function generateCutPoint(
  currentMin: number,
  currentMax: number,
  direction: CutDirection,
  rand: RandomFn = defaultRandom
): number {
  if (direction === "high") {
    return randomIntInclusive(currentMin, currentMax - 1, rand);
  }
  return randomIntInclusive(currentMin + 1, currentMax, rand);
}

/** Apply a high cut: keep [currentMin, cutPoint]. (currentMax is removed.) */
export function applyHighCut(
  currentMin: number,
  _currentMax: number,
  cutPoint: number
): { currentMin: number; currentMax: number } {
  return { currentMin, currentMax: cutPoint };
}

/** Apply a low cut: keep [cutPoint, currentMax]. (currentMin is removed.) */
export function applyLowCut(
  _currentMin: number,
  currentMax: number,
  cutPoint: number
): { currentMin: number; currentMax: number } {
  return { currentMin: cutPoint, currentMax };
}

/** Nearest integer to a float position, clamped into the active range. */
export function getNearestNumber(
  finalPosition: number,
  currentMin: number,
  currentMax: number
): number {
  return Math.max(currentMin, Math.min(currentMax, Math.round(finalPosition)));
}

/** A random float position within [currentMin, currentMax]. */
export function generateFinalPosition(
  currentMin: number,
  currentMax: number,
  rand: RandomFn = defaultRandom
): number {
  return currentMin + rand() * (currentMax - currentMin);
}

/** Create a fresh game state from config, with a random starting direction. */
export function createInitialState(
  min: number,
  max: number,
  rounds: number,
  rand: RandomFn = defaultRandom
): NumberCutState {
  return {
    configMin: min,
    configMax: max,
    currentMin: min,
    currentMax: max,
    currentRound: 1,
    totalRounds: rounds,
    direction: pickStartingDirection(rand),
    lastCutPoint: null,
    finalPosition: null,
    finalAnswer: null,
    finished: false,
  };
}

/** True if the current round is the final (nearest-number) round. */
export function isFinalRound(state: NumberCutState): boolean {
  return state.currentRound >= state.totalRounds;
}

/** True when only a single number remains in the active range. */
export function isSingleNumber(state: NumberCutState): boolean {
  return state.currentMin === state.currentMax;
}

/**
 * Advance the game by one step (one CUT press). Returns the next state.
 *
 *  - If only one number remains, finish immediately with that number.
 *  - If on the final round, resolve via nearest-number.
 *  - Otherwise perform a normal directional cut and alternate direction.
 */
export function performCut(state: NumberCutState, rand: RandomFn = defaultRandom): NumberCutState {
  if (state.finished) return state;

  // Early completion: a single number remains.
  if (isSingleNumber(state)) {
    return {
      ...state,
      finalAnswer: state.currentMin,
      finished: true,
    };
  }

  // Final round: pick nearest number to a random position.
  if (isFinalRound(state)) {
    const finalPosition = generateFinalPosition(state.currentMin, state.currentMax, rand);
    const finalAnswer = getNearestNumber(finalPosition, state.currentMin, state.currentMax);
    return {
      ...state,
      finalPosition,
      finalAnswer,
      finished: true,
    };
  }

  // Normal cut round.
  const cutPoint = generateCutPoint(state.currentMin, state.currentMax, state.direction, rand);
  const next =
    state.direction === "high"
      ? applyHighCut(state.currentMin, state.currentMax, cutPoint)
      : applyLowCut(state.currentMin, state.currentMax, cutPoint);

  return {
    ...state,
    currentMin: next.currentMin,
    currentMax: next.currentMax,
    lastCutPoint: cutPoint,
    direction: getNextDirection(state.direction),
    currentRound: state.currentRound + 1,
  };
}

/** Map an absolute value onto a 0..100 percentage of the fixed config scale. */
export function toPercent(value: number, configMin: number, configMax: number): number {
  if (configMax === configMin) return 0;
  return ((value - configMin) / (configMax - configMin)) * 100;
}
