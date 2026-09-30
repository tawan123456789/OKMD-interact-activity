import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// server/src (dev, via tsx) or server/dist (prod) -> project root is two levels up.
export const PROJECT_ROOT = path.resolve(__dirname, "..", "..");

export const CONFIG_DIR = path.join(PROJECT_ROOT, "config");
export const STORAGE_DIR = path.join(PROJECT_ROOT, "storage");
export const IMAGES_DIR = path.join(STORAGE_DIR, "images");
export const CLIENT_DIST_DIR = path.join(PROJECT_ROOT, "client", "dist");

export const CONFIG_FILES = {
  "random-number": path.join(CONFIG_DIR, "random-number.json"),
  "guess-word": path.join(CONFIG_DIR, "guess-word.json"),
  "guess-picture": path.join(CONFIG_DIR, "guess-picture.json"),
} as const;

export type ConfigKey = keyof typeof CONFIG_FILES;
