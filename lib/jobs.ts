import { ObjectId } from "mongodb";
import { client, COLLECTION_NAME, DB_NAME } from "./mongo";
import { jobSchema, type GetJobsResponse } from "./schemas";

type Cursor = {
  posted_at?: string;
  company?: string;
  id: string;
  sort: string;
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
  filter = "all",
  sort = "posted_newest",
}: {
  cursor?: string;
  limit?: number;
  filter?: string;
  sort?: string;
}): Promise<GetJobsResponse> {
  const queryConditions: any[] = [];

  if (cursor) {
    const decoded = decodeCursor(cursor);

    // Only use cursor if sort hasn't changed
    if (decoded.sort === sort) {
      const { posted_at, company, id } = decoded;

      if (sort === "posted_oldest" || sort === "posted_newest") {
        const compareOp = sort === "posted_newest" ? "$lt" : "$gt";
        queryConditions.push({
          $or: [
            { posted_at: { [compareOp]: new Date(posted_at!) } },
            {
              posted_at: new Date(posted_at!),
              _id: { [compareOp]: new ObjectId(id) },
            },
          ],
        });
      } else if (sort === "company_az" || sort === "company_za") {
        const compareOp = sort === "company_az" ? "$gt" : "$lt";
        queryConditions.push({
          $or: [
            { company: { [compareOp]: company } },
            {
              company: company,
              _id: { $lt: new ObjectId(id) },
            },
          ],
        });
      }
    }
  }

  switch (filter) {
    case "unread":
      queryConditions.push({
        $or: [{ read: { $ne: true } }, { read: { $exists: false } }],
      });
      queryConditions.push({
        $or: [{ archived: { $ne: true } }, { archived: { $exists: false } }],
      });
      break;
    case "read":
      queryConditions.push({ read: true });
      queryConditions.push({
        $or: [{ archived: { $ne: true } }, { archived: { $exists: false } }],
      });
      break;
    case "archived":
      queryConditions.push({ archived: true });
      break;
    case "all":
    default:
      queryConditions.push({
        $or: [{ archived: { $ne: true } }, { archived: { $exists: false } }],
      });
      break;
  }

  const query = queryConditions.length > 0 ? { $and: queryConditions } : {};

  let sortOrder: any;
  switch (sort) {
    case "posted_oldest":
      sortOrder = { posted_at: 1, _id: 1 };
      break;
    case "company_az":
      sortOrder = { company: 1, _id: -1 };
      break;
    case "company_za":
      sortOrder = { company: -1, _id: -1 };
      break;
    case "posted_newest":
    default:
      sortOrder = { posted_at: -1, _id: -1 };
      break;
  }

  const results = await client
    .db(DB_NAME)
    .collection(COLLECTION_NAME)
    .find(query)
    .sort(sortOrder)
    .limit(limit + 1)
    .toArray();

  const hasNextPage = results.length > limit;
  const items = hasNextPage ? results.slice(0, limit) : results;

  const jobs = items.map((job) =>
    jobSchema.parse({ ...job, _id: job._id.toString() })
  );

  const last = items[items.length - 1];

  return {
    jobs,
    nextCursor: hasNextPage
      ? encodeCursor({
          posted_at: last.posted_at?.toISOString(),
          company: last.company,
          id: last._id.toString(),
          sort,
        })
      : null,
  };
}
