import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import bookRoutes from "./routes/book.route.js";
import borrowRoutes from "./routes/borrow.route.js";

export const app = express();

// Security
app.use(helmet());

// Frontend connection
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// Health check
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