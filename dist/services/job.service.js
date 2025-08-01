"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJob = createJob;
exports.getJobsByAdmin = getJobsByAdmin;
exports.getJobDetailById = getJobDetailById;
exports.updateJobById = updateJobById;
exports.deleteJobById = deleteJobById;
exports.updateJobStatus = updateJobStatus;
exports.getJobsWithFilters = getJobsWithFilters;
exports.getSavedJobsByUser = getSavedJobsByUser;
exports.isJobSavedByUser = isJobSavedByUser;
exports.saveJobService = saveJobService;
exports.removeSavedJob = removeSavedJob;
exports.getJobFiltersMetaService = getJobFiltersMetaService;
exports.GetSuggestedJobService = GetSuggestedJobService;
exports.applyJobService = applyJobService;
exports.getJobDetailsService = getJobDetailsService;
exports.getSavedJobsByUserPaginated = getSavedJobsByUserPaginated;
exports.getNearbyJobsService = getNearbyJobsService;
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
const date_fns_1 = require("date-fns");
function createJob(adminId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const { deadline } = data, rest = __rest(data, ["deadline"]);
        const job = yield prisma_1.default.job.create({
            data: Object.assign(Object.assign({}, rest), { deadline: new Date(deadline), companyId: company.id }),
        });
        return job;
    });
}
function getJobsByAdmin(adminId, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found.");
        const { title, jobCategory, status, sort = "desc", page = 1, limit = 10, } = query;
        const skip = (page - 1) * limit;
        const jobs = yield prisma_1.default.job.findMany({
            where: Object.assign(Object.assign(Object.assign({ companyId: company.id }, (title && { title: { contains: title, mode: "insensitive" } })), (jobCategory &&
                Object.values(client_1.JobCategory).includes(jobCategory) && {
                jobCategory: jobCategory,
            })), (status &&
                Object.values(client_1.JobStatus).includes(status) && {
                status: status,
            })),
            orderBy: { createdAt: sort },
            skip,
            take: limit,
            select: {
                id: true,
                title: true,
                status: true,
                location: true,
                salary: true,
                deadline: true,
                experienceLevel: true,
                employmentType: true,
                jobCategory: true,
                bannerUrl: true,
                hasTest: true,
                createdAt: true,
                _count: {
                    select: { applications: true },
                },
            },
        });
        const total = yield prisma_1.default.job.count({
            where: Object.assign(Object.assign(Object.assign({ companyId: company.id }, (title && { title: { contains: title, mode: "insensitive" } })), (jobCategory &&
                Object.values(client_1.JobCategory).includes(jobCategory) && {
                jobCategory: jobCategory,
            })), (status &&
                Object.values(client_1.JobStatus).includes(status) && {
                status: status,
            })),
        });
        return {
            jobs,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    });
}
function getJobDetailById(jobId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company) {
            throw new Error("Company not found");
        }
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: {
                preSelectionTest: true,
                _count: {
                    select: { applications: true },
                },
            },
        });
        if (!job || job.companyId !== company.id) {
            throw new Error("Job not found or access denied");
        }
        return job;
    });
}
function updateJobById(jobId, adminId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
        });
        if (!job || job.companyId !== company.id) {
            throw new Error("Job not found or access denied");
        }
        const { deadline, bannerUrl } = data, rest = __rest(data, ["deadline", "bannerUrl"]);
        const updated = yield prisma_1.default.job.update({
            where: { id: jobId },
            data: Object.assign(Object.assign(Object.assign({}, rest), (deadline && { deadline: new Date(deadline) })), (bannerUrl && { bannerUrl })),
        });
        return updated;
    });
}
function deleteJobById(jobId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
        });
        if (!job || job.companyId !== company.id) {
            throw new Error("Job not found or access denied");
        }
        yield prisma_1.default.job.delete({
            where: { id: jobId },
        });
        return { id: jobId };
    });
}
function updateJobStatus(jobId, adminId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
        });
        if (!job || job.companyId !== company.id) {
            throw new Error("Job not found or access denied");
        }
        const updated = yield prisma_1.default.job.update({
            where: { id: jobId },
            data: { status: data.status },
        });
        return updated;
    });
}
function getJobsWithFilters(filters) {
    return __awaiter(this, void 0, void 0, function* () {
        const { title, location, employmentType, jobCategory, isRemote, salaryMin, salaryMax, experienceLevel, page = 1, pageSize = 10, sortBy = "createdAt", sortOrder = "desc", listingTime = "any", customStartDate, customEndDate, lat, lng, radiusKm = 100, } = filters;
        const skip = (page - 1) * pageSize;
        const andFilters = [];
        if (title)
            andFilters.push({ title: { contains: title, mode: "insensitive" } });
        if (location)
            andFilters.push({ location: { contains: location, mode: "insensitive" } });
        if (Array.isArray(employmentType) && employmentType.length > 0)
            andFilters.push({ employmentType: { in: employmentType } });
        if (Array.isArray(jobCategory) && jobCategory.length > 0)
            andFilters.push({ jobCategory: { in: jobCategory } });
        if (typeof isRemote === "boolean")
            andFilters.push({ isRemote });
        if (salaryMin !== undefined)
            andFilters.push({ salary: { gte: salaryMin } });
        if (salaryMax !== undefined)
            andFilters.push({ salary: { lte: salaryMax } });
        if (experienceLevel)
            andFilters.push({
                experienceLevel: { contains: experienceLevel, mode: "insensitive" },
            });
        if (listingTime !== "any") {
            let gteDate;
            let lteDate;
            switch (listingTime) {
                case "today":
                    gteDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
                    break;
                case "3days":
                    gteDate = (0, date_fns_1.subDays)(new Date(), 3);
                    break;
                case "7days":
                    gteDate = (0, date_fns_1.subDays)(new Date(), 7);
                    break;
                case "14days":
                    gteDate = (0, date_fns_1.subDays)(new Date(), 14);
                    break;
                case "30days":
                    gteDate = (0, date_fns_1.subDays)(new Date(), 30);
                    break;
                case "custom":
                    if (customStartDate)
                        gteDate = new Date(customStartDate);
                    if (customEndDate)
                        lteDate = new Date(customEndDate);
                    break;
            }
            const createdAtFilter = {};
            if (gteDate)
                createdAtFilter.gte = gteDate;
            if (lteDate)
                createdAtFilter.lte = lteDate;
            if (Object.keys(createdAtFilter).length)
                andFilters.push({ createdAt: createdAtFilter });
        }
        const now = new Date();
        const baseWhere = {
            AND: [
                ...(andFilters.length ? andFilters : []),
                { status: client_1.JobStatus.PUBLISHED },
                { deadline: { gte: now } },
            ],
        };
        const sortField = ["createdAt", "salary"].includes(sortBy)
            ? sortBy
            : "createdAt";
        const sortDir = ["asc", "desc"].includes(sortOrder) ? sortOrder : "desc";
        if (lat !== undefined && lng !== undefined) {
            const allJobs = yield prisma_1.default.job.findMany({
                where: Object.assign(Object.assign({}, baseWhere), { latitude: { not: null }, longitude: { not: null } }),
                include: {
                    company: {
                        include: {
                            admin: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { [sortField]: sortDir },
            });
            const toRadians = (deg) => (deg * Math.PI) / 180;
            const jobsInRadius = allJobs.filter((j) => {
                const dist = 6371 *
                    Math.acos(Math.cos(toRadians(lat)) *
                        Math.cos(toRadians(j.latitude)) *
                        Math.cos(toRadians(j.longitude) - toRadians(lng)) +
                        Math.sin(toRadians(lat)) * Math.sin(toRadians(j.latitude)));
                return dist <= radiusKm;
            });
            const paginated = jobsInRadius.slice(skip, skip + pageSize);
            return {
                total: jobsInRadius.length,
                jobs: paginated,
            };
        }
        const [total, jobs] = yield Promise.all([
            prisma_1.default.job.count({ where: baseWhere }),
            prisma_1.default.job.findMany({
                where: baseWhere,
                orderBy: { [sortField]: sortDir },
                skip,
                take: pageSize,
                include: {
                    company: {
                        include: {
                            admin: { select: { id: true, name: true } },
                        },
                    },
                },
            }),
        ]);
        return { total, jobs };
    });
}
function getSavedJobsByUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const savedJobs = yield prisma_1.default.savedJob.findMany({
            where: { userId },
            include: {
                job: {
                    include: {
                        company: {
                            include: {
                                admin: {
                                    select: {
                                        id: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });
        return savedJobs.map((saved) => saved.job);
    });
}
function isJobSavedByUser(userId, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const savedJob = yield prisma_1.default.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });
        return savedJob !== null;
    });
}
function saveJobService(userId, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const jobExists = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            select: { id: true },
        });
        if (!jobExists) {
            throw new Error("Job not found");
        }
        const alreadySaved = yield prisma_1.default.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });
        if (alreadySaved) {
            throw new Error("Job already saved");
        }
        return prisma_1.default.savedJob.create({
            data: {
                userId,
                jobId,
            },
        });
    });
}
function removeSavedJob(userId, jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        const existing = yield prisma_1.default.savedJob.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });
        if (!existing) {
            throw new Error("Saved job not found.");
        }
        yield prisma_1.default.savedJob.delete({
            where: {
                userId_jobId: {
                    userId,
                    jobId,
                },
            },
        });
    });
}
function getJobFiltersMetaService() {
    return __awaiter(this, void 0, void 0, function* () {
        const employmentTypes = Object.values(client_2.EmploymentType).map((type) => ({
            label: type
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: type,
        }));
        const jobCategories = Object.values(client_1.JobCategory).map((category) => ({
            label: category
                .replace(/_/g, " ")
                .toLowerCase()
                .replace(/\b\w/g, (c) => c.toUpperCase()),
            value: category,
        }));
        const isRemoteOptions = [
            { label: "Remote", value: true },
            { label: "On-site", value: false },
        ];
        const jobTypesRaw = yield prisma_1.default.job.findMany({
            distinct: ["experienceLevel"],
            select: { experienceLevel: true },
        });
        const experienceLevels = jobTypesRaw
            .map((j) => j.experienceLevel)
            .filter((v, i, a) => v && a.indexOf(v) === i);
        return {
            employmentTypes,
            jobCategories,
            isRemoteOptions,
            experienceLevels,
        };
    });
}
function GetSuggestedJobService(companyId, excludeJobId) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield prisma_1.default.job.findMany({
            where: {
                companyId,
                id: excludeJobId ? { not: excludeJobId } : undefined,
                status: "PUBLISHED",
                deadline: {
                    gte: new Date(),
                },
            },
            orderBy: { createdAt: "desc" },
            take: 3,
            include: {
                company: {
                    include: { admin: true },
                },
            },
        });
    });
}
function applyJobService(jobId, userId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: { preSelectionTest: true },
        });
        if (!job)
            throw new Error("Job not found");
        if (job.status !== client_1.JobStatus.PUBLISHED) {
            throw new Error("You cannot apply to this job");
        }
        const now = new Date();
        if (job.deadline && new Date(job.deadline) < now) {
            throw new Error("This job has expired");
        }
        const existing = yield prisma_1.default.application.findFirst({
            where: { jobId, userId },
        });
        if (existing)
            throw new Error("You have already applied to this job");
        let testScore = undefined;
        if (job.hasTest && job.preSelectionTest) {
            const answer = yield prisma_1.default.preSelectionAnswer.findUnique({
                where: {
                    userId_testId: {
                        userId,
                        testId: job.preSelectionTest.id,
                    },
                },
            });
            if (!answer)
                throw new Error("Please complete the pre-selection test before applying");
            testScore = answer.score;
        }
        const newApp = yield prisma_1.default.application.create({
            data: {
                jobId,
                userId,
                expectedSalary: data.expectedSalary,
                cvFile: data.cvFile,
                coverLetter: data.coverLetter,
                testScore,
            },
        });
        return newApp;
    });
}
function getJobDetailsService(jobId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.job.findUnique({
            where: { id: jobId },
            include: {
                company: {
                    include: {
                        admin: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                preSelectionTest: true,
                applications: true,
                interviews: true,
            },
        });
    });
}
function getSavedJobsByUserPaginated(userId, page, pageSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const skip = (page - 1) * pageSize;
        const [total, saved] = yield Promise.all([
            prisma_1.default.savedJob.count({ where: { userId } }),
            prisma_1.default.savedJob.findMany({
                where: { userId },
                skip,
                take: pageSize,
                include: {
                    job: {
                        include: {
                            company: {
                                include: {
                                    admin: { select: { id: true, name: true } },
                                },
                            },
                        },
                    },
                },
            }),
        ]);
        return { total, jobs: saved.map((s) => s.job) };
    });
}
function getNearbyJobsService(lat_1, lng_1) {
    return __awaiter(this, arguments, void 0, function* (lat, lng, radiusKm = 100, page = 1, pageSize = 10) {
        const offset = (page - 1) * pageSize;
        const allJobs = yield prisma_1.default.job.findMany({
            where: {
                status: "PUBLISHED",
                latitude: { not: null },
                longitude: { not: null },
            },
            include: {
                company: {
                    include: {
                        admin: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: pageSize,
        });
        const nearby = allJobs.filter((j) => {
            const radians = (deg) => (deg * Math.PI) / 180;
            const dist = 6371 *
                Math.acos(Math.cos(radians(lat)) *
                    Math.cos(radians(j.latitude)) *
                    Math.cos(radians(j.longitude) - radians(lng)) +
                    Math.sin(radians(lat)) * Math.sin(radians(j.latitude)));
            return dist <= radiusKm;
        });
        return nearby.map((j) => ({
            id: j.id,
            title: j.title,
            description: j.description,
            location: j.location,
            salary: j.salary,
            latitude: j.latitude,
            longitude: j.longitude,
            createdAt: j.createdAt,
            company: {
                id: j.company.id,
                logo: j.company.logo,
                admin: {
                    name: j.company.admin.name,
                },
            },
        }));
    });
}
