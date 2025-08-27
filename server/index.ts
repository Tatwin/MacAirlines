import "dotenv/config"; // <- loads .env automatically
import express, { Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { seedDatabase } from "./seed";

async function createServer() {
  const app = express();

  // Middleware for JSON & URL encoded
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  // API logger
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJson: Record<string, any> | undefined;

    const originalJson = res.json;
    res.json = function (body: any, ...args: any[]) {
      capturedJson = body;
      return originalJson.apply(res, [body, ...args]);
    };

    res.on("finish", () => {
      if (path.startsWith("/api")) {
        const duration = Date.now() - start;
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJson) logLine += ` :: ${JSON.stringify(capturedJson)}`;
        if (logLine.length > 120) logLine = logLine.slice(0, 119) + "…";
        log(logLine);
      }
    });

    next();
  });

  // Database seeding (only if empty)
  const { db } = await import("./db");
  const { users } = await import("@shared/schema");
  const existingUsers = await db.select().from(users).limit(1);

  if (existingUsers.length === 0) {
    log("🌱 Seeding database...");
    await seedDatabase();
  } else {
    log("📊 Database already seeded, skipping...");
  }

  // Register routes
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    res.status(status).json({ message: err.message || "Internal Server Error" });
    log(`❌ Error: ${err.message}`);
  });

  // Development vs Production handling
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = "127.0.0.1"; // force IPv4 loopback on Windows

  server.listen(port, host, () => {
    log(`🚀 Server running at http://${host}:${port}`);
  });
}

// ✅ actually call the function
createServer().catch((err) => {
  log(`❌ Failed to start server: ${err.message}`);
  process.exit(1);
});
