import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getJobs } from "./actions";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

export default async function Page() {
  const jobs = await getJobs();

  return (
    <div>
      <h1 className="text-xl font-bold pb-4">Jobs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {jobs.map((job) => (
          <Card key={job._id.toString()}>
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
                {(job.min_industry_and_role_yoe !== null ||
                  job.salary_min ||
                  job.salary_max !== null) && (
                  <div className="flex flex-wrap gap-2 items-center pt-1">
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
                              : "",
                          )
                          .join("-")}
                      </Badge>
                    )}
                    {job.workplace_type && (
                      <Badge variant="secondary">{job.workplace_type}</Badge>
                    )}
                    {job.commitment &&
                      job.commitment.length > 0 &&
                      job.commitment.map((commitment) => (
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
                <div className="flex flex-wrap gap-2 items-center">
                  {job.technical_tools.map((tool) => (
                    <Badge variant="outline" key={tool}>
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col gap-2 items-end">
              <p className="text-sm text-muted-foreground">
                Search Source:{" "}
                <span className="font-bold">{job.search_state}</span>
              </p>
              <div className="flex flex-row gap-2">
                <Button variant="outline">View Job Description</Button>
                <Button asChild>
                  <Link
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Apply
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
