import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import bookRoutes from "./routes/book.route.js";
import borrowRoutes from "./routes/borrow.route.js";
import { errorHandler } from "./middleware/error.middleware.js";

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
    credentials: true,
  })
);

// Middleware
app.use(express.json());
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
