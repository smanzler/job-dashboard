import { NextResponse } from "next/server";
import { getJobs } from "@/lib/jobs";
import { GetJobsResponse } from "@/lib/schemas";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const cursor = searchParams.get("cursor") ?? undefined;
    const limit = Number(searchParams.get("limit") ?? 20);

    const data: GetJobsResponse = await getJobs({ cursor, limit });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "Failed to fetch jobs" },
      { status: 500 },
    );
  }
}
