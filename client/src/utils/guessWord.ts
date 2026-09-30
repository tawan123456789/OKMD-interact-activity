/**
 * Guess-the-word logic with proper Unicode / Thai support.
 *
 * We split words into grapheme-like segments so Thai combining marks stay
 * attached to their base character. Uses Intl.Segmenter when available,
 * falling back to Array.from (code-point split).
 */

export interface WordCell {
  /** The full segment (base char + any combining marks). */
  char: string;
  /** True if this cell is a guessable letter (not space/punctuation). */
  guessable: boolean;
  /** True if revealed (guessed correctly, or non-guessable revealed from start). */
  revealed: boolean;
}

function segment(word: string): string[] {
  const AnyIntl = Intl as unknown as {
    Segmenter?: new (
      locale?: string,
      opts?: { granularity: "grapheme" | "word" | "sentence" }
    ) => { segment(input: string): Iterable<{ segment: string }> };
  };
  if (typeof AnyIntl.Segmenter === "function") {
    const seg = new AnyIntl.Segmenter("th", { granularity: "grapheme" });
    return Array.from(seg.segment(word), (s) => s.segment);
  }
  return Array.from(word);
}

/** A segment is guessable if it contains at least one letter (any script). */
export function isGuessable(segmentText: string): boolean {
  // \p{L} = any letter, \p{M} = combining mark. Space and punctuation are not.
  return /\p{L}/u.test(segmentText);
}

/** Build the initial hidden cell array for a word. */
export function buildCells(word: string): WordCell[] {
  return segment(word).map((char) => {
    const guessable = isGuessable(char);
    return { char, guessable, revealed: !guessable };
  });
}

/** Normalize a character for comparison (case-insensitive). */
export function normalizeChar(c: string): string {
  return c.toLocaleLowerCase();
}

/**
 * Apply a guess to the cells. Returns new cells with every matching guessable
 * cell revealed. Non-matching guesses leave cells unchanged.
 */
export function applyGuess(cells: WordCell[], guess: string): WordCell[] {
  const g = normalizeChar(guess);
  return cells.map((cell) => {
    if (cell.guessable && !cell.revealed && normalizeChar(cell.char) === g) {
      return { ...cell, revealed: true };
    }
    return cell;
  });
}

/** True if a guess matches at least one hidden guessable cell. */
export function isCorrectGuess(cells: WordCell[], guess: string): boolean {
  const g = normalizeChar(guess);
  return cells.some(
    (cell) => cell.guessable && normalizeChar(cell.char) === g
  );
}

/** True when all guessable cells are revealed. */
export function isSolved(cells: WordCell[]): boolean {
  return cells.every((cell) => cell.revealed);
}

/** The set of distinct guessable characters in a word (normalized). */
export function guessableChars(word: string): Set<string> {
  const set = new Set<string>();
  for (const cell of buildCells(word)) {
    if (cell.guessable) set.add(normalizeChar(cell.char));
  }
  return set;
}

export const ENGLISH_KEYBOARD = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/**
 * A practical Thai character set for the on-screen keyboard: consonants,
 * vowels and tone marks commonly needed to spell Thai words.
 */
export const THAI_KEYBOARD = [
  "ก","ข","ค","ฆ","ง","จ","ฉ","ช","ซ","ฌ","ญ","ฎ","ฏ","ฐ","ฑ","ฒ","ณ",
  "ด","ต","ถ","ท","ธ","น","บ","ป","ผ","ฝ","พ","ฟ","ภ","ม","ย","ร","ล",
  "ว","ศ","ษ","ส","ห","ฬ","อ","ฮ",
  "ะ","ั","า","ำ","ิ","ี","ึ","ื","ุ","ู","เ","แ","โ","ใ","ไ",
  "่","้","๊","๋","็","์","ๆ","ฯ",
];

/** True if the word contains any Thai characters. */
export function hasThai(word: string): boolean {
  return /[\u0E00-\u0E7F]/.test(word);
}
