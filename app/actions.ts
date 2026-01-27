"use server";

import { COLLECTION_NAME, client, DB_NAME } from "@/lib/mongo";

export const getJobs = async ({ query }: { query?: any } = {}) => {
  try {
    await client.connect();

    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);
    const result = await collection.find(query).toArray();

    await client.close();

    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
