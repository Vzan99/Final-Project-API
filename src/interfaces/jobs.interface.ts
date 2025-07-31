import { Job, Company, User } from "@prisma/client";

export interface JobWithRelations extends Job {
  company: Company & {
    admin: Pick<User, "id" | "name">;
  };
}

export interface JobFilters {
  title?: string;
  location?: string;
  employmentType?: string;
  jobCategory?: string;
  isRemote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  experienceLevel?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "salary";
  sortOrder?: "asc" | "desc";
  lat?: number;
  lng?: number;
  radiusKm?: number;

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
