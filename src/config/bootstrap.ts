import { connectDB } from "./db.js";
import { ensureBorrowIndexes } from "../services/borrow.service.js";

// Shared, cached initialization for serverless invocations.
let bootstrap: Promise<void> | null = null;

export function ensureBootstrap(): Promise<void> {
  if (!bootstrap) {
    bootstrap = (async () => {
      await connectDB();

      try {
        await ensureBorrowIndexes();
      } catch (error) {
        // Index creation is an optimization; do not take the API down for it.
        console.error("Unable to ensure borrow indexes:", error);
      }
    })().catch((error) => {
      // Allow a later request to retry after a transient failure.
      bootstrap = null;
      throw error;
    });
  }

  return bootstrap;
}
