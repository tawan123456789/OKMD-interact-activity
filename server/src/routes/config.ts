import { Router } from "express";
import { readConfig, writeConfigFile } from "../storage.js";
import {
  validateRandomNumber,
  validateGuessWord,
  validateGuessPicture,
  validateNumberCut,
} from "../validation.js";
import type { ConfigKey } from "../paths.js";

const router = Router();

const validators = {
  "random-number": validateRandomNumber,
  "guess-word": validateGuessWord,
  "guess-picture": validateGuessPicture,
  "number-cut": validateNumberCut,
} as const;

function makeRoutes(key: ConfigKey) {
  router.get(`/${key}`, async (_req, res) => {
    try {
      const data = await readConfig(key);
      res.json({ success: true, data });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: `Unable to read ${key} config`,
      });
    }
  });

  router.put(`/${key}`, async (req, res) => {
    const validator = validators[key];
    const result = validator(req.body);
    if (!result.valid || result.value === undefined) {
      res.status(400).json({ success: false, error: result.error ?? "Invalid config" });
      return;
    }
    try {
      await writeConfigFile(key, result.value);
      res.json({ success: true, data: result.value });
    } catch (err) {
      res.status(500).json({
        success: false,
        error: `Unable to save ${key} config`,
      });
    }
  });
}

(["random-number", "guess-word", "guess-picture", "number-cut"] as ConfigKey[]).forEach(
  makeRoutes
);

export default router;
