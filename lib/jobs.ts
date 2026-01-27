import { ObjectId } from "mongodb";
import { client, COLLECTION_NAME, DB_NAME } from "./mongo";
import { jobSchema, type GetJobsResponse } from "./schemas";

type Cursor = {
  posted_at: string;
  id: string;
};

function encodeCursor(cursor: Cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function decodeCursor(cursor: string): Cursor {
  return JSON.parse(Buffer.from(cursor, "base64").toString());
}

export async function getJobs({
  cursor,
  limit = 20,
}: {
  cursor?: string;
  limit?: number;
}): Promise<GetJobsResponse> {
  let query = {};

  if (cursor) {
    const { posted_at, id } = decodeCursor(cursor);

    query = {
      $or: [
        { posted_at: { $lt: new Date(posted_at) } },
        {
          posted_at: new Date(posted_at),
          _id: { $lt: new ObjectId(id) },
        },
      ],
    };
  }

  const results = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .find(query)
    .sort({ posted_at: -1, _id: -1 })
    .limit(limit + 1)
    .toArray();

  const hasNextPage = results.length > limit;
  const items = hasNextPage ? results.slice(0, limit) : results;

  const jobs = items.map((job) =>
    jobSchema.parse({ ...job, _id: job._id.toString() }),
  );

  const last = items[items.length - 1];

  return {
    jobs,
    nextCursor: hasNextPage
      ? encodeCursor({
          posted_at: last.posted_at.toISOString(),
          id: last._id.toString(),
        })
      : null,
  };
}
