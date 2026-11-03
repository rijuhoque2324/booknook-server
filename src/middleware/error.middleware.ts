import type { ErrorRequestHandler } from "express";

import { ApiError } from "../utils/api-error.js";

interface MongoError {
  code?: number;
}

interface BodyParserError {
  status?: number;
}

export const errorHandler: ErrorRequestHandler = (
  error,
  _req,
  res,
  _next
) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    (error as MongoError).code === 11000
  ) {
    res.status(409).json({
      success: false,
      message: "A record with these values already exists.",
    });
    return;
  }

  // Malformed or oversized request bodies are client errors.
  const status = (error as BodyParserError | null)?.status;

  if (typeof status === "number" && status >= 400 && status < 500) {
    res.status(status).json({
      success: false,
      message: "Invalid request body.",
    });
    return;
  }

  console.error("UNHANDLED ERROR:", error);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
};
