"use client";

import { Button } from "@/components/ui/button";
import { useInfiniteQuery, InfiniteData } from "@tanstack/react-query";
import {
  getJobsResponseSchema,
  type GetJobsResponse,
  type Job,
  type JobFilter,
  type JobSort,
} from "@/lib/schemas";
import { useMemo } from "react";
import { ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import JobCard from "./job-card";

export default function Jobs() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const filter = useMemo<JobFilter>(() => {
    const f = searchParams.get("filter");
    if (f === "unread" || f === "read" || f === "archived") {
      return f;
    }
    return "all";
  }, [searchParams]);

  const sort = useMemo<JobSort>(() => {
    const s = searchParams.get("sort");
    if (
      s === "posted_newest" ||
      s === "posted_oldest" ||
      s === "company_az" ||
      s === "company_za"
    ) {
      return s;
    }
    return "posted_newest";
  }, [searchParams]);

  const setFilter = (newFilter: JobFilter) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newFilter === "all") {
      params.delete("filter");
    } else {
      params.set("filter", newFilter);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setSort = (newSort: JobSort) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newSort === "posted_newest") {
      params.delete("sort");
    } else {
      params.set("sort", newSort);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<
      GetJobsResponse,
      Error,
      InfiniteData<GetJobsResponse>,
      readonly unknown[],
      string | undefined
    >({
      queryKey: ["jobs", filter, sort],
      queryFn: async ({ pageParam }) => {
        const params = new URLSearchParams({ limit: "20" });

        if (filter !== "all") {
          params.set("filter", filter);
        }

        if (sort !== "posted_newest") {
          params.set("sort", sort);
        }

        if (pageParam) {
          params.set("cursor", pageParam);
        }

        const res = await fetch(`/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to fetch jobs");

        const data = await res.json();
        return getJobsResponseSchema.parse(data);
      },
      initialPageParam: undefined,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    });

  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];

  return (
    <div>
      <div className="flex flex-col gap-4 pb-4">
        <h1 className="text-xl font-bold">Jobs</h1>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex gap-2">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "default" : "outline"}
              onClick={() => setFilter("unread")}
            >
              Unread
            </Button>
            <Button
              variant={filter === "read" ? "default" : "outline"}
              onClick={() => setFilter("read")}
            >
              Read
            </Button>
            <Button
              variant={filter === "archived" ? "default" : "outline"}
              onClick={() => setFilter("archived")}
            >
              Archived
            </Button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="posted_newest">Newest First</SelectItem>
                <SelectItem value="posted_oldest">Oldest First</SelectItem>
                <SelectItem value="company_az">Company A-Z</SelectItem>
                <SelectItem value="company_za">Company Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {jobs.map((job: Job) => (
          <JobCard key={job._id.toString()} job={job} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            variant="outline"
            size="lg"
          >
            {isFetchingNextPage ? "Loading..." : "Load More Jobs"}
          </Button>
        </div>
      )}
    </div>
  );
}
