/**
 * Generate a unique id.
 *
 * `crypto.randomUUID()` is only available in secure contexts (HTTPS or
 * localhost). When the app is served over plain HTTP (e.g. a Cloud VM IP),
 * it is undefined and would throw, so we fall back to a manual UUID v4 built
 * from crypto.getRandomValues, and finally to Math.random if needed.
 */
export function generateId(): string {
  const c = globalThis.crypto as Crypto | undefined;

  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }

  if (c && typeof c.getRandomValues === "function") {
    const bytes = new Uint8Array(16);
    c.getRandomValues(bytes);
    // Per RFC 4122 v4.
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0"));
    return (
      hex.slice(0, 4).join("") +
      "-" +
      hex.slice(4, 6).join("") +
      "-" +
      hex.slice(6, 8).join("") +
      "-" +
      hex.slice(8, 10).join("") +
      "-" +
      hex.slice(10, 16).join("")
    );
  }

  // Last-resort fallback (non-cryptographic, still unique enough for ids).
  return (
    "id-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}
