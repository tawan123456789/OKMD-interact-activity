import type {
  RandomNumberConfig,
  GuessWordConfig,
  GuessPictureConfig,
  PictureQuestion,
  NumberCutConfig,
} from "./types.js";

export const GRID_MIN = 2;
export const GRID_MAX = 8;

export const SHUFFLE_MIN = 0.2;
export const SHUFFLE_MAX = 10;
export const SHUFFLE_DEFAULT = 0.8;

export const ROUNDS_MIN = 2;
export const ROUNDS_MAX = 20;

export interface ValidationResult<T> {
  valid: boolean;
  error?: string;
  value?: T;
}

function isInteger(n: unknown): n is number {
  return typeof n === "number" && Number.isInteger(n) && Number.isFinite(n);
}

export function validateRandomNumber(input: unknown): ValidationResult<RandomNumberConfig> {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Config must be an object" };
  }
  const { min, max, shuffleSeconds } = input as Record<string, unknown>;
  if (!isInteger(min)) {
    return { valid: false, error: "min must be an integer" };
  }
  if (!isInteger(max)) {
    return { valid: false, error: "max must be an integer" };
  }
  if (min > max) {
    return { valid: false, error: "min must be less than or equal to max" };
  }

  // Backward compatibility: older configs have no shuffleSeconds.
  const seconds = shuffleSeconds === undefined ? SHUFFLE_DEFAULT : shuffleSeconds;
  if (typeof seconds !== "number" || !Number.isFinite(seconds)) {
    return { valid: false, error: "shuffleSeconds must be a number" };
  }
  if (seconds < SHUFFLE_MIN || seconds > SHUFFLE_MAX) {
    return {
      valid: false,
      error: `Shuffle duration must be between ${SHUFFLE_MIN} and ${SHUFFLE_MAX} seconds.`,
    };
  }

  return { valid: true, value: { min, max, shuffleSeconds: seconds } };
}

export function validateGuessWord(input: unknown): ValidationResult<GuessWordConfig> {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Config must be an object" };
  }
  const { words } = input as Record<string, unknown>;
  if (!Array.isArray(words)) {
    return { valid: false, error: "words must be an array" };
  }
  const trimmed: string[] = [];
  for (const w of words) {
    if (typeof w !== "string") {
      return { valid: false, error: "Each word must be a string" };
    }
    const t = w.trim();
    if (t.length === 0) {
      return { valid: false, error: "Words cannot be empty" };
    }
    trimmed.push(t);
  }
  if (trimmed.length === 0) {
    return { valid: false, error: "At least one word is required" };
  }
  // Detect exact duplicates (case-insensitive for comparison stability).
  const seen = new Set<string>();
  for (const t of trimmed) {
    const key = t.toLowerCase();
    if (seen.has(key)) {
      return { valid: false, error: `Duplicate word: "${t}"` };
    }
    seen.add(key);
  }
  return { valid: true, value: { words: trimmed } };
}

function validatePicture(input: unknown): ValidationResult<PictureQuestion> {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Picture must be an object" };
  }
  const p = input as Record<string, unknown>;
  if (typeof p.id !== "string" || p.id.trim() === "") {
    return { valid: false, error: "Picture id is required" };
  }
  if (typeof p.image !== "string" || p.image.trim() === "") {
    return { valid: false, error: "Image is required" };
  }
  if (typeof p.answer !== "string" || p.answer.trim() === "") {
    return { valid: false, error: "Answer is required" };
  }

  // Backward compatibility: default missing grid values to 4x4.
  const gridRows = p.gridRows === undefined ? 4 : p.gridRows;
  const gridColumns = p.gridColumns === undefined ? 4 : p.gridColumns;

  if (!isInteger(gridRows)) {
    return { valid: false, error: "Rows must be an integer" };
  }
  if (!isInteger(gridColumns)) {
    return { valid: false, error: "Columns must be an integer" };
  }
  if (gridRows < GRID_MIN || gridRows > GRID_MAX) {
    return { valid: false, error: `Rows must be between ${GRID_MIN} and ${GRID_MAX}.` };
  }
  if (gridColumns < GRID_MIN || gridColumns > GRID_MAX) {
    return { valid: false, error: `Columns must be between ${GRID_MIN} and ${GRID_MAX}.` };
  }

  return {
    valid: true,
    value: {
      id: p.id,
      image: p.image,
      answer: p.answer.trim(),
      gridRows,
      gridColumns,
    },
  };
}

export function validateGuessPicture(input: unknown): ValidationResult<GuessPictureConfig> {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Config must be an object" };
  }
  const { pictures } = input as Record<string, unknown>;
  if (!Array.isArray(pictures)) {
    return { valid: false, error: "pictures must be an array" };
  }
  const result: PictureQuestion[] = [];
  for (const pic of pictures) {
    const v = validatePicture(pic);
    if (!v.valid || !v.value) {
      return { valid: false, error: v.error };
    }
    result.push(v.value);
  }
  return { valid: true, value: { pictures: result } };
}

export function validateNumberCut(input: unknown): ValidationResult<NumberCutConfig> {
  if (typeof input !== "object" || input === null) {
    return { valid: false, error: "Config must be an object" };
  }
  const { min, max, rounds } = input as Record<string, unknown>;
  if (!isInteger(min)) {
    return { valid: false, error: "min must be an integer" };
  }
  if (!isInteger(max)) {
    return { valid: false, error: "max must be an integer" };
  }
  if (min >= max) {
    return { valid: false, error: "min must be less than max" };
  }
  if (max - min < 2) {
    return { valid: false, error: "Range (max - min) must be at least 2" };
  }
  if (!isInteger(rounds)) {
    return { valid: false, error: "rounds must be an integer" };
  }
  if (rounds < ROUNDS_MIN || rounds > ROUNDS_MAX) {
    return {
      valid: false,
      error: `Number of rounds must be between ${ROUNDS_MIN} and ${ROUNDS_MAX}.`,
    };
  }
  return { valid: true, value: { min, max, rounds } };
}
