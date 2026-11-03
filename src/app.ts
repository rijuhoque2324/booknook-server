import express from "express";
import cors from "cors";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";

import bookRoutes from "./routes/book.route.js";
import borrowRoutes from "./routes/borrow.route.js";
import { errorHandler } from "./middleware/error.middleware.js";
import { ensureBootstrap } from "./config/bootstrap.js";

export const app = express();

// Running behind Vercel's proxy.
app.set("trust proxy", 1);

// Security
app.use(helmet());

// Frontend connection. CLIENT_URL accepts a comma-separated allowlist so
// production and preview deployments can both talk to the API.
const allowedOrigins = (
  process.env.CLIENT_URL ?? "http://localhost:3000"
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Requests without an Origin header (curl, server-to-server) are allowed.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    // Auth uses bearer tokens, so browsers never need to send cookies here.
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Limit writes per client IP. Reads are exempt because the Next.js server
// fetches books from a shared IP. Counts are per serverless instance.
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 60,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    skip: (req) => ["GET", "HEAD", "OPTIONS"].includes(req.method),
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  })
);

// Middleware
app.use(express.json({ limit: "16kb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Root / health check
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BookNook API is running!",
    endpoints: {
      books: "/books",
      borrows: "/borrows",
      health: "/health",
    },
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BookNook API is running!",
  });
});

// API routes are only reachable once the database is ready.
app.use(async (_req, _res, next) => {
  try {
    await ensureBootstrap();
    next();
  } catch (error) {
    next(error);
  }
});

// API routes
app.use("/books", bookRoutes);
app.use("/borrows", borrowRoutes);

// 404 handler (unknown routes)
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Central error handler (must be registered last).
app.use(errorHandler);

// Vercel's Express preset expects a default export that is a function/server.
export default app;
