// Shared configuration types for the OKMD Interactive Activity app.

export interface RandomNumberConfig {
  min: number;
  max: number;
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

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
