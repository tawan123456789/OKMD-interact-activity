import { useCallback, useEffect, useState } from "react";
import { randomInt } from "../utils/random";

/**
 * Manages selecting an item from a list with prev/next/random controls.
 * Starts on a random item. Returns the current index and navigation actions.
 */
export function useItemSelection(count: number) {
  const [index, setIndex] = useState(0);

  // Pick a random starting item once the count is known.
  useEffect(() => {
    if (count > 0) {
      setIndex(randomInt(0, count - 1));
    } else {
      setIndex(0);
    }
    // Only reset when the list length changes.
  }, [count]);

  const next = useCallback(() => {
    if (count <= 0) return;
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count <= 0) return;
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  const random = useCallback(() => {
    if (count <= 1) return;
    setIndex((current) => {
      let next = current;
      while (next === current) {
        next = randomInt(0, count - 1);
      }
      return next;
    });
  }, [count]);

  return { index, next, prev, random };
}
