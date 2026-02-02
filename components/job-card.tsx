import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Archive, ArchiveX, EyeOff } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import ReactHtmlParser from "react-html-parser";
import { Job } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  markJobAsRead,
  markJobAsUnread,
  toggleJobArchived,
} from "@/app/actions";
import { Spinner } from "./ui/spinner";

export default function JobCard({ job }: { job: Job }) {
  const queryClient = useQueryClient();

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
    <Card className={job.read ? "opacity-70" : ""}>
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
            Search Source: <span className="font-bold">{job.search_state}</span>
          </p>
        </div>

        <div className="flex flex-row gap-2 flex-wrap">
          {job.read && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => markUnreadMutation.mutate(job._id)}
              title="Mark as unread"
              disabled={markUnreadMutation.isPending}
            >
              {markUnreadMutation.isPending ? (
                <Spinner className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
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
            disabled={toggleArchivedMutation.isPending}
          >
            {toggleArchivedMutation.isPending ? (
              <Spinner className="h-4 w-4" />
            ) : job.archived ? (
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
                      onClick={() => markReadMutation.mutate(job._id)}
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
  );
}
