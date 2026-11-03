
import "dotenv/config";

import { app } from "./app.js";
import { connectDB, client } from "./config/db.js";
import { ensureBorrowIndexes } from "./services/borrow.service.js";

const PORT = Number(process.env.PORT) || 5000;

async function startServer(): Promise<void> {
  try {
    // Step 1: Connect MongoDB
    await connectDB();

    console.log("MongoDB connected successfully!");    

    await ensureBorrowIndexes();

    // Step 2: Start Express server
    const server = app.listen(PORT, () => {
      console.log(`BookNook API running on port ${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // Step 3: Graceful shutdown
    const shutdown = (signal: string) => {
      console.log(`${signal} received. Shutting down...`);

      server.close(async () => {
        try {
          await client.close();
          console.log("MongoDB connection closed.");
          process.exit(0);
        } catch (error) {
          console.error("Shutdown error:", error);
          process.exit(1);
        }
      });
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));

  } catch (error) {
    console.error("Server startup failed:", error);

    await client.close().catch(() => undefined);

    process.exit(1);
  }
}

startServer();
