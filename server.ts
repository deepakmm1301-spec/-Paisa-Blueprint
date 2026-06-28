import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { createServer as createViteServer } from "vite";
import { env, validateEnv } from "./config/env";
import { logger } from "./utils/logger";
import { helmetMiddleware, corsMiddleware, sanitizeRequestMiddleware } from "./middleware/security";
import { requestLogger, notFoundHandler, globalErrorHandler } from "./middleware/errorHandler";
import apiRouter from "./routes/index";

const app = express();
const PORT = env.PORT;

// Configure Express to trust proxy headers from Nginx reverse proxy
app.set("trust proxy", 1);

// 1. Run environment variables validation and central logging startup messages
validateEnv();

// 2. Request logger to log every api call with latency metrics
app.use(requestLogger);

// 3. Apply secure headers & CORS settings
app.use(helmetMiddleware);
app.use(corsMiddleware);

// 4. Parse cookies for HttpOnly JWT tokens
app.use(cookieParser());

// 5. Set payload size limits to protect against denial of service
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// 6. Input sanitization to prevent persistent/reflected XSS injection
app.use(sanitizeRequestMiddleware);

// 6. Mount decoupled and structured API routes
app.use("/api", apiRouter);

// 7. Initialize assets pipelines & serve index files
async function startServer() {
  if (env.NODE_ENV !== "production") {
    // Development Mode: Mount Vite's connect server in middlewareMode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    logger.info("Joined Vite dev asset pipeline and middlewares successfully.");
  } else {
    // Production Mode: Serve static build output cleanly
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    logger.info(`Serving pre-compiled static assets from production folder: ${distPath}`);
  }

  // 8. 404 handler for unmatched routes
  app.use(notFoundHandler);

  // 9. Centralized Error handling to catch and safely log uncaught controller exceptions
  app.use(globalErrorHandler);

  app.listen(PORT, "0.0.0.0", () => {
    logger.info(`Paisa Blueprint Backend booted successfully. Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
export default app;
