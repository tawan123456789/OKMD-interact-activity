import { describe, it, expect, vi, afterEach } from "vitest";
import { generateId } from "./id";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("generateId", () => {
  it("uses crypto.randomUUID when available", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("falls back to getRandomValues on insecure origins (no randomUUID)", () => {
    // Simulate a plain-HTTP context where randomUUID is missing.
    vi.stubGlobal("crypto", {
      getRandomValues: (arr: Uint8Array) => {
        for (let i = 0; i < arr.length; i++) arr[i] = i;
        return arr;
      },
    });
    const id = generateId();
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("produces unique ids across calls", () => {
    const ids = new Set(Array.from({ length: 500 }, () => generateId()));
    expect(ids.size).toBe(500);
  });
});
