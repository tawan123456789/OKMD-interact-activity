import fs from "node:fs/promises";
import path from "node:path";
import { CONFIG_DIR, CONFIG_FILES, IMAGES_DIR, type ConfigKey } from "./paths.js";
import type {
  RandomNumberConfig,
  GuessWordConfig,
  GuessPictureConfig,
} from "./types.js";

export const DEFAULT_CONFIGS = {
  "random-number": { min: 1, max: 100 } satisfies RandomNumberConfig,
  "guess-word": {
    words: ["KNOWLEDGE", "CREATIVITY", "OPPORTUNITY"],
  } satisfies GuessWordConfig,
  "guess-picture": { pictures: [] } satisfies GuessPictureConfig,
} as const;

/** Ensure config/ and storage/images/ directories exist and seed default config files. */
export async function ensureStorage(): Promise<void> {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.mkdir(IMAGES_DIR, { recursive: true });

  for (const key of Object.keys(CONFIG_FILES) as ConfigKey[]) {
    const file = CONFIG_FILES[key];
    try {
      await fs.access(file);
    } catch {
      await writeConfigFile(key, DEFAULT_CONFIGS[key]);
    }
  }
}

export async function readConfig<T>(key: ConfigKey): Promise<T> {
  const file = CONFIG_FILES[key];
  try {
    const raw = await fs.readFile(file, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    // If the file is missing or corrupt, fall back to defaults and repair it.
    const fallback = DEFAULT_CONFIGS[key];
    await writeConfigFile(key, fallback);
    return fallback as unknown as T;
  }
}

/**
 * Atomic write: write to a temporary file then rename over the target so an
 * interrupted process never leaves a partially-written config file.
 */
export async function writeConfigFile(key: ConfigKey, data: unknown): Promise<void> {
  const file = CONFIG_FILES[key];
  const dir = path.dirname(file);
  await fs.mkdir(dir, { recursive: true });
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`);
  const json = JSON.stringify(data, null, 2);
  await fs.writeFile(tmp, json, "utf-8");
  await fs.rename(tmp, file);
}
