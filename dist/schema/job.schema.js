"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nearbyJobsQuerySchema = exports.PaginationSchema = exports.applyJobSchema = exports.jobFiltersSchema = exports.publishJobSchema = exports.updateJobSchema = exports.createJobSchema = void 0;
const zod_1 = require("zod");
exports.createJobSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    location: zod_1.z.string().min(1),
    salary: zod_1.z.number().int().positive().optional(),
    deadline: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    }),
    isRemote: zod_1.z.boolean().default(false),
    experienceLevel: zod_1.z.string(),
    employmentType: zod_1.z.enum([
        "FULL_TIME",
        "PART_TIME",
        "CONTRACT",
        "INTERNSHIP",
        "TEMPORARY",
        "VOLUNTEER",
        "OTHER",
    ]),
    jobCategory: zod_1.z.enum([
        "FRONTEND_DEVELOPER",
        "BACKEND_DEVELOPER",
        "FULL_STACK_DEVELOPER",
        "MOBILE_APP_DEVELOPER",
        "DEVOPS_ENGINEER",
        "GAME_DEVELOPER",
        "SOFTWARE_ENGINEER",
        "DATA_ENGINEER",
        "SECURITY_ENGINEER",
        "OTHER",
    ]),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
    bannerUrl: zod_1.z.string().optional(),
    hasTest: zod_1.z.boolean().optional().default(false),
    latitude: zod_1.z.number().optional(),
    longitude: zod_1.z.number().optional(),
});
exports.updateJobSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    salary: zod_1.z
        .union([zod_1.z.number().int().positive(), zod_1.z.string().length(0)])
        .transform((val) => (typeof val === "string" ? undefined : val))
        .optional(),
    deadline: zod_1.z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid date format",
    })
        .optional(),
    isRemote: zod_1.z.boolean().optional(),
    experienceLevel: zod_1.z.enum(["Entry", "Mid", "Senior"]).optional(),
    jobType: zod_1.z.enum(["Full-time", "Part-time", "Contract"]).optional(),
    tags: zod_1.z.array(zod_1.z.string()).optional().default([]),
    bannerUrl: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    hasTest: zod_1.z.boolean().optional().default(false),
});
exports.publishJobSchema = zod_1.z.object({
    status: zod_1.z.enum(["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"]),
});
exports.jobFiltersSchema = zod_1.z.object({
    title: zod_1.z.string().optional(),
    location: zod_1.z.string().optional(),
    employmentType: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .transform((val) => {
        if (typeof val === "string") {
            if (val.includes(",")) {
                return val
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
            return [val];
        }
        if (Array.isArray(val)) {
            return val;
        }
        return [];
    }),
    jobCategory: zod_1.z
        .union([zod_1.z.string(), zod_1.z.array(zod_1.z.string())])
        .optional()
        .transform((val) => {
        if (typeof val === "string") {
            if (val.includes(",")) {
                return val
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean);
            }
            return [val];
        }
        if (Array.isArray(val)) {
            return val;
        }
        return [];
    }),
    isRemote: zod_1.z
        .string()
        .optional()
        .transform((val) => {
        if (val === "true")
            return true;
        if (val === "false")
            return false;
        return undefined;
    }),
    salaryMin: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "salaryMin must be a number",
    })
        .transform((val) => (val ? Number(val) : undefined)),
    salaryMax: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "salaryMax must be a number",
    })
        .transform((val) => (val ? Number(val) : undefined)),
    experienceLevel: zod_1.z.string().optional(),
    page: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))), {
        message: "page must be a positive integer",
    })
        .transform((val) => (val ? Number(val) : 1)),
    pageSize: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))), {
        message: "pageSize must be a positive integer",
    })
        .transform((val) => (val ? Number(val) : 10)),
    sortBy: zod_1.z.enum(["createdAt", "salary", "nearby"]).optional(),
    sortOrder: zod_1.z.enum(["asc", "desc"]).optional(),
    lat: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "lat must be a number",
    })
        .transform((val) => (val ? Number(val) : undefined)),
    lng: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "lng must be a number",
    })
        .transform((val) => (val ? Number(val) : undefined)),
    radiusKm: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Number(val)), {
        message: "radiusKm must be a number",
    })
        .transform((val) => (val ? Number(val) : undefined)),
    listingTime: zod_1.z
        .enum(["any", "today", "3days", "7days", "14days", "30days", "custom"])
        .optional()
        .default("any"),
    customStartDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "customStartDate must be a valid date string",
    }),
    customEndDate: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || !isNaN(Date.parse(val)), {
        message: "customEndDate must be a valid date string",
    }),
});
exports.applyJobSchema = zod_1.z.object({
    expectedSalary: zod_1.z
        .number({ required_error: "Expected salary is required" })
        .min(1, "Expected salary must be greater than 0"),
    coverLetter: zod_1.z.string().optional(),
});
exports.PaginationSchema = zod_1.z.object({
    page: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))), {
        message: "page must be a positive integer",
    })
        .transform((val) => (val ? Number(val) : 1)),
    pageSize: zod_1.z
        .string()
        .optional()
        .refine((val) => !val || (Number(val) > 0 && Number.isInteger(Number(val))), {
        message: "pageSize must be a positive integer",
    })
        .transform((val) => (val ? Number(val) : 10)),
});
exports.nearbyJobsQuerySchema = zod_1.z.object({
    lat: zod_1.z.coerce.number({
        required_error: "Latitude is required",
        invalid_type_error: "Latitude must be a number",
    }),
    lng: zod_1.z.coerce.number({
        required_error: "Longitude is required",
        invalid_type_error: "Longitude must be a number",
    }),
    radiusKm: zod_1.z.coerce.number().min(1).max(500).default(50).optional(),
    page: zod_1.z.coerce.number().min(1).default(1).optional(),
    pageSize: zod_1.z.coerce.number().min(1).max(50).default(10).optional(),
});
