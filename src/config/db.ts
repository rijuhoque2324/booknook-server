
import {
  MongoClient,
  ServerApiVersion,
  Db,
} from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || "booknook";

if (!uri) {
  throw new Error("MONGODB_URI is missing from environment variables!");
}

if (
  !uri.startsWith("mongodb://") &&
  !uri.startsWith("mongodb+srv://")
) {
  throw new Error("Invalid MongoDB connection string format!");
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

let connectionPromise: Promise<MongoClient> | null = null;

export async function connectDB(): Promise<Db> {
  try {
    if (!connectionPromise) {
      connectionPromise = client.connect().catch((error) => {
        connectionPromise = null;
        throw error;
      });
    }

    await connectionPromise;

    const db = client.db(dbName);

    // Verify database connection
    await db.command({ ping: 1 });

    return db;
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    throw error;
  }
}

// Reusable database access
export async function getDB(): Promise<Db> {
  return connectDB();
}

// Export MongoDB client if needed
export { client };
