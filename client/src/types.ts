export interface RandomNumberConfig {
  min: number;
  max: number;
  /** How long the shuffle animation runs before showing the result, in seconds. */
  shuffleSeconds: number;
}

export interface GuessWordConfig {
  words: string[];
}

export interface PictureQuestion {
  id: string;
  image: string;
  answer: string;
  gridRows: number;
  gridColumns: number;
}

export interface GuessPictureConfig {
  pictures: PictureQuestion[];
}

export interface NumberCutConfig {
  min: number;
  max: number;
  /** Total rounds, including the final nearest-number round. */
  rounds: number;
}

export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const GRID_MIN = 2;
export const GRID_MAX = 8;
export const DEFAULT_GRID = 4;

export const SHUFFLE_MIN = 0.2;
export const SHUFFLE_MAX = 10;
export const SHUFFLE_DEFAULT = 0.8;

export const ROUNDS_MIN = 2;
export const ROUNDS_MAX = 20;
