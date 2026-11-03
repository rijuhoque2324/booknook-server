import "dotenv/config";

import type { Request, Response } from "express";

import { app } from "../src/app.js";
import { ensureBootstrap } from "../src/config/bootstrap.js";

export default async function handler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    await ensureBootstrap();
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
