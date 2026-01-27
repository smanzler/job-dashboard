import { z } from "zod";

export const jobSchema = z.object({
  _id: z.string(),
  id: z.string(),
  title: z.string(),
  company: z.string(),
  company_url: z.string().nullable(),
  company_logo: z.string().nullable(),
  min_industry_and_role_yoe: z.number().nullable(),
  technical_tools: z.array(z.string()).nullable(),
  url: z.string(),
  summary: z.string().nullable(),
  job_description: z.string().nullable(),
  department: z.string().nullable(),
  location: z.string().nullable(),
  salary_min: z.number().nullable(),
  salary_max: z.number().nullable(),
  workplace_type: z.string().nullable(),
  commitment: z.array(z.string()).nullable(),
  posted_at: z.coerce.date(),
  search_state: z.string(),
});

export type Job = z.infer<typeof jobSchema>;
