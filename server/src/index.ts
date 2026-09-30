import express from "express";
import fs from "node:fs";
import { ensureStorage } from "./storage.js";
import { CLIENT_DIST_DIR, STORAGE_DIR } from "./paths.js";
import configRouter from "./routes/config.js";
import imagesRouter from "./routes/images.js";

const PORT = Number(process.env.PORT ?? 3000);

async function main() {
  await ensureStorage();

  const app = express();
  app.use(express.json({ limit: "1mb" }));

  // Health check.
  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  // Config + image APIs.
  app.use("/api/config", configRouter);
  app.use("/api/images", imagesRouter);

  // Serve uploaded images.
  app.use("/storage", express.static(STORAGE_DIR));

  // In production, serve the built client and fall back to index.html for SPA routes.
  if (fs.existsSync(CLIENT_DIST_DIR)) {
    app.use(express.static(CLIENT_DIST_DIR));
    app.get("*", (req, res, next) => {
      if (req.path.startsWith("/api") || req.path.startsWith("/storage")) {
        next();
        return;
      }
      res.sendFile("index.html", { root: CLIENT_DIST_DIR });
    });
  }

  app.listen(PORT, () => {
    console.log(`OKMD server running on http://localhost:${PORT}`);
  });
}

main().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
