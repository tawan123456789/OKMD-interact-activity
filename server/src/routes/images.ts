import { Router } from "express";
import multer from "multer";
import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { IMAGES_DIR } from "../paths.js";

const router = Router();

const ALLOWED_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);
const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, IMAGES_DIR);
  },
  filename: (_req, file, cb) => {
    // Never trust the client filename: use a generated UUID + validated extension.
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : ".jpg";
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(ext)) {
      cb(new Error("Only .jpg, .jpeg, .png, .webp images are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post("/", (req, res) => {
  upload.single("image")(req, res, (err: unknown) => {
    if (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      res.status(400).json({ success: false, error: message });
      return;
    }
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image file provided" });
      return;
    }
    const url = `/storage/images/${req.file.filename}`;
    res.json({ success: true, data: { image: url, filename: req.file.filename } });
  });
});

router.delete("/:filename", async (req, res) => {
  const { filename } = req.params;
  // Guard against path traversal: only allow a bare filename.
  if (filename.includes("/") || filename.includes("\\") || filename.includes("..")) {
    res.status(400).json({ success: false, error: "Invalid filename" });
    return;
  }
  const target = path.join(IMAGES_DIR, filename);
  try {
    await fs.unlink(target);
    res.json({ success: true, data: { filename } });
  } catch {
    // Deleting a non-existent file is not treated as a hard error.
    res.json({ success: true, data: { filename } });
  }
});

export default router;
