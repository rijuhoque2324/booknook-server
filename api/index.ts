import "dotenv/config";

import type { Request, Response } from "express";

import { app } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { ensureBorrowIndexes } from "../src/services/borrow.service.js";

// Reuse the initialization across invocations of the same warm Lambda.
let initialization: Promise<void> | null = null;

async function initialize(): Promise<void> {
  await connectDB();

  try {
    await ensureBorrowIndexes();
  } catch (error) {
    // Index creation is an optimization; do not take the API down for it.
    console.error("Unable to ensure borrow indexes:", error);
  }
}

export default async function handler(
  req: Request,
  res: Response
): Promise<void> {
  if (!initialization) {
    initialization = initialize().catch((error) => {
      initialization = null;
      throw error;
    });
  }

  try {
    await initialization;
  } catch (error) {
    console.error("API initialization failed:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed.",
    });

    return;
  }

  app(req, res);
}
