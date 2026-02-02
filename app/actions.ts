"use server";

import { ObjectId } from "mongodb";
import { client, COLLECTION_NAME, DB_NAME } from "@/lib/mongo";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth";

export async function markJobAsRead(jobId: string) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { read: true } }
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking job as read:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark job as read";
    return { success: false, error: message };
  }
}

export async function markJobAsUnread(jobId: string) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { read: false } }
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error marking job as unread:", error);
    const message =
      error instanceof Error ? error.message : "Failed to mark job as unread";
    return { success: false, error: message };
  }
}

export async function toggleJobArchived(jobId: string, archived: boolean) {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateOne(
      { _id: new ObjectId(jobId) },
      { $set: { archived } }
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error toggling job archived status:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update job";
    return { success: false, error: message };
  }
}

export async function archiveAllUnreadJobs() {
  try {
    await requireAuth();

    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    await collection.updateMany(
      { read: { $ne: true }, archived: { $ne: true } },
      { $set: { archived: true } }
    );

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error archiving all unread jobs:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Failed to archive all unread jobs";
    return { success: false, error: message };
  }
}
