import { getJobs } from "./actions";

export default async function Page() {
  const jobs = await getJobs();

  return (
    <div>
      <h1>Jobs</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <div key={job._id.toString()}>
            <h2>{job.title}</h2>
            <p dangerouslySetInnerHTML={{ __html: job.job_description }} />
            <p>{job.department}</p>
            <p>{job.posted_at.toISOString()}</p>
            <p>{job.company}</p>
            <p>{job.url}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
