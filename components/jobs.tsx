"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import ReactHtmlParser from "react-html-parser";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  InfiniteData,
} from "@tanstack/react-query";
import {
  getJobsResponseSchema,
  type GetJobsResponse,
  type Job,
  type JobFilter,
  type JobSort,
} from "@/lib/schemas";
import { useMemo } from "react";
import {
  markJobAsRead,
  markJobAsUnread,
  toggleJobArchived,
} from "@/app/actions";
import { Archive, ArchiveX, Eye, EyeOff, ArrowUpDown } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Jobs() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

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

  const markReadMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const result = await markJobAsRead(jobId);
      if (!result.success) {
        throw new Error(result.error || "Failed to mark as read");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const markUnreadMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const result = await markJobAsUnread(jobId);
      if (!result.success) {
        throw new Error(result.error || "Failed to mark as unread");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

  const toggleArchivedMutation = useMutation({
    mutationFn: async ({
      jobId,
      archived,
    }: {
      jobId: string;
      archived: boolean;
    }) => {
      const result = await toggleJobArchived(jobId, archived);
      if (!result.success) {
        throw new Error(result.error || "Failed to update");
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
    onError: (error: Error) => {
      alert(error.message);
    },
  });

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
          <Card
            key={job._id.toString()}
            className={job.read ? "opacity-70" : ""}
          >
            <CardHeader>
              <div className="pb-4 flex flex-row gap-4 items-center">
                {job.company_logo && (
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={job.company_logo}
                      alt={job.company}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1">
                  {job.company_url ? (
                    <Link
                      href={
                        job.company_url.startsWith("http://") ||
                        job.company_url.startsWith("https://")
                          ? job.company_url
                          : `https://${job.company_url}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <p className="font-bold line-clamp-1 hover:underline">
                        {job.company}
                      </p>
                    </Link>
                  ) : (
                    <p className="font-bold line-clamp-1">{job.company}</p>
                  )}
                </div>
                <Badge variant="secondary">
                  {formatDistanceToNow(job.posted_at, { addSuffix: true })}
                </Badge>
              </div>
              <div className="pb-2">
                <CardTitle>{job.title}</CardTitle>
                {job.location && <Badge className="mt-2">{job.location}</Badge>}
                {(job.min_industry_and_role_yoe !== null ||
                  job.salary_min ||
                  job.salary_max !== null) && (
                  <div className="flex flex-wrap gap-1 items-center pt-2">
                    {job.min_industry_and_role_yoe !== null && (
                      <Badge variant="secondary">
                        {job.min_industry_and_role_yoe}+ YOE
                      </Badge>
                    )}
                    {(job.salary_min || job.salary_max !== null) && (
                      <Badge variant="secondary">
                        {[job.salary_min, job.salary_max]
                          .filter(Boolean)
                          .map((salary) =>
                            salary != null
                              ? `$${Math.round(Number(salary) / 1000)}k`
                              : ""
                          )
                          .join("-")}
                      </Badge>
                    )}
                    {job.workplace_type && (
                      <Badge variant="secondary">{job.workplace_type}</Badge>
                    )}
                    {job.commitment &&
                      job.commitment.length > 0 &&
                      job.commitment.map((commitment: string) => (
                        <Badge variant="secondary" key={commitment}>
                          {commitment}
                        </Badge>
                      ))}
                  </div>
                )}
              </div>

              <CardDescription>{job.summary}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              {job.technical_tools && job.technical_tools.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  {job.technical_tools.map((tool: string) => (
                    <Badge variant="outline" key={tool}>
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2 items-center">
                {job.archived && <Badge variant="destructive">Archived</Badge>}
                <p className="text-sm text-muted-foreground ml-auto">
                  Search Source:{" "}
                  <span className="font-bold">{job.search_state}</span>
                </p>
              </div>

              <div className="flex flex-row gap-2 flex-wrap">
                {job.read && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => markUnreadMutation.mutate(job._id)}
                    title="Mark as unread"
                  >
                    <EyeOff className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() =>
                    toggleArchivedMutation.mutate({
                      jobId: job._id,
                      archived: !job.archived,
                    })
                  }
                  title={job.archived ? "Unarchive" : "Archive"}
                >
                  {job.archived ? (
                    <ArchiveX className="h-4 w-4" />
                  ) : (
                    <Archive className="h-4 w-4" />
                  )}
                </Button>

                <div className="flex flex-row gap-2 ml-auto">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline">View Job Description</Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Job Description</DialogTitle>
                        <DialogDescription>{job.title}</DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        {ReactHtmlParser(job.job_description ?? "", {
                          transform: (node) => {
                            if (node.type === "img") return null;
                          },
                        })}
                      </div>
                      <DialogFooter>
                        <Button className="w-full" asChild>
                          <Link
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Apply
                          </Link>
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button asChild>
                    <Link
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => markReadMutation.mutate(job._id)}
                    >
                      Apply
                    </Link>
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
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
