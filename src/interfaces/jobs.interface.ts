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
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "salary";
  sortOrder?: "asc" | "desc";

  listingTime?:
    | "any"
    | "today"
    | "3days"
    | "7days"
    | "14days"
    | "30days"
    | "custom";
  customStartDate?: string;
  customEndDate?: string;
}

export interface PaginatedJobs {
  total: number;
  jobs: JobWithRelations[];
}
