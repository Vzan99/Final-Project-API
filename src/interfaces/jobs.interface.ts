import { Job, Company, Category, User } from "@prisma/client";

export interface JobWithRelations extends Job {
  company: Company & {
    admin: Pick<User, "id" | "name">;
  };
  category?: Category | null;
}

export interface JobFilters {
  title?: string;
  location?: string;
  jobType?: string;
  isRemote?: boolean | null;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "salary" | "relevance";
  sortOrder?: "asc" | "desc";
  lat?: number;
  lng?: number;
}

export interface PaginatedJobs {
  total: number;
  jobs: JobWithRelations[];
}
