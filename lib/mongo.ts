import { MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI;
export const DB_NAME = "jobNotifier";
export const COLLECTION_NAME = "seenJobs";

if (!MONGO_URI) {
  throw new Error("MONGO_URI is not set");
}

export const client = new MongoClient(MONGO_URI);
