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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createJobHandler = createJobHandler;
exports.getJobsByAdminHandler = getJobsByAdminHandler;
exports.getJobDetailHandler = getJobDetailHandler;
exports.updateJobHandler = updateJobHandler;
exports.deleteJobHandler = deleteJobHandler;
exports.updateJobStatusHandler = updateJobStatusHandler;
exports.getJobsHandler = getJobsHandler;
exports.getSavedJobsController = getSavedJobsController;
exports.checkIsJobSavedHandler = checkIsJobSavedHandler;
exports.saveJobHandler = saveJobHandler;
exports.removeSavedJobHandler = removeSavedJobHandler;
exports.getJobFiltersMetaHandler = getJobFiltersMetaHandler;
exports.GetSuggestedJobsController = GetSuggestedJobsController;
exports.applyJobHandler = applyJobHandler;
exports.getJobDetailViewController = getJobDetailViewController;
exports.getSavedJobsPaginatedController = getSavedJobsPaginatedController;
exports.getNearbyJobsController = getNearbyJobsController;
const cloudinary_1 = require("../utils/cloudinary");
const job_service_1 = require("../services/job.service");
const job_schema_1 = require("../schema/job.schema");
const client_1 = require("@prisma/client");
function createJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const raw = Object.assign(Object.assign({}, req.body), { salary: req.body.salary ? Number(req.body.salary) : undefined, isRemote: req.body.isRemote === "true", hasTest: req.body.hasTest === "true", tags: req.body.tags
                    ? Array.isArray(req.body.tags)
                        ? req.body.tags
                        : [req.body.tags]
                    : [], latitude: req.body.latitude ? Number(req.body.latitude) : undefined, longitude: req.body.longitude ? Number(req.body.longitude) : undefined });
            const parsed = job_schema_1.createJobSchema.parse(raw);
            let bannerUrl = undefined;
            if (req.file) {
                const upload = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "image");
                bannerUrl = `${upload.public_id}.${upload.format}`;
            }
            const job = yield (0, job_service_1.createJob)(adminId, Object.assign(Object.assign({}, parsed), { bannerUrl }));
            res.status(201).json({
                success: true,
                message: "Job created successfully",
                data: job,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getJobsByAdminHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const adminId = req.user.id;
            const { title, categoryId, status, sort = "desc", page = "1", limit = "10", } = req.query;
            const pageNumber = Math.max(1, parseInt(page) || 1);
            const limitNumber = Math.max(1, parseInt(limit) || 10);
            const query = {
                title: typeof title === "string" ? title : undefined,
                categoryId: typeof categoryId === "string" ? categoryId : undefined,
                status: typeof status === "string" ? status : undefined,
                sort: sort === "asc" || sort === "desc" ? sort : undefined,
                page: pageNumber,
                limit: limitNumber,
            };
            const result = yield (0, job_service_1.getJobsByAdmin)(adminId, query);
            res.status(200).json(Object.assign({ success: true }, result));
        }
        catch (err) {
            next(err);
        }
    });
}
function getJobDetailHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rawId = req.params.id;
            const jobId = rawId.slice(0, 36);
            const adminId = req.user.id;
            const job = yield (0, job_service_1.getJobDetailById)(jobId, adminId);
            res.json({
                success: true,
                data: job,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.id;
            const adminId = req.user.id;
            let raw = typeof req.body.data === "string" ? JSON.parse(req.body.data) : req.body;
            const parsed = Object.assign(Object.assign({}, raw), { salary: raw.salary ? Number(raw.salary) : undefined, isRemote: raw.isRemote === "true" || raw.isRemote === true, hasTest: raw.hasTest === "true" || raw.hasTest === true, tags: Array.isArray(raw.tags) ? raw.tags : raw.tags ? [raw.tags] : [], latitude: raw.latitude ? Number(raw.latitude) : undefined, longitude: raw.longitude ? Number(raw.longitude) : undefined });
            let bannerUrl;
            if (req.file) {
                const uploaded = yield (0, cloudinary_1.cloudinaryUpload)(req.file, "image");
                bannerUrl = `${uploaded.public_id}.${uploaded.format}`;
            }
            const updated = yield (0, job_service_1.updateJobById)(jobId, adminId, Object.assign(Object.assign({}, parsed), (bannerUrl && { bannerUrl })));
            res.status(200).json({
                success: true,
                message: "Job updated successfully",
                data: updated,
            });
            return;
        }
        catch (err) {
            next(err);
        }
    });
}
function deleteJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.id;
            const adminId = req.user.id;
            const result = yield (0, job_service_1.deleteJobById)(jobId, adminId);
            res.json({
                success: true,
                message: "Job deleted successfully",
                data: result,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function updateJobStatusHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.id;
            const adminId = req.user.id;
            const data = req.body;
            const updated = yield (0, job_service_1.updateJobStatus)(jobId, adminId, data);
            res.json({
                success: true,
                message: "Job status updated",
                data: updated,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getJobsHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const filters = req.validatedQuery;
            const data = yield (0, job_service_1.getJobsWithFilters)(filters);
            res.status(200).json({
                success: true,
                total: data.total,
                jobs: data.jobs,
            });
        }
        catch (err) {
            next(err);
        }
    });
}
function getSavedJobsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            const savedJobs = yield (0, job_service_1.getSavedJobsByUser)(userId);
            res.status(200).json(savedJobs);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function checkIsJobSavedHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const jobId = req.params.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            if (!jobId) {
                throw new Error("Job ID is required");
            }
            const isSaved = yield (0, job_service_1.isJobSavedByUser)(userId, jobId);
            res.status(200).json({ isSaved });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function saveJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            const jobId = req.params.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            if (!jobId)
                throw new Error("Job ID is required");
            yield (0, job_service_1.saveJobService)(userId, jobId);
            res.json({ success: true, message: "Job saved successfully" });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function removeSavedJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = req.user.id;
            const jobId = req.params.id;
            if (!jobId) {
                throw new Error("Job ID is required.");
            }
            yield (0, job_service_1.removeSavedJob)(userId, jobId);
            res.json({ success: true, message: "Job removed from saved list." });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function getJobFiltersMetaHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const meta = yield (0, job_service_1.getJobFiltersMetaService)();
            res.status(200).json({ success: true, data: meta });
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function GetSuggestedJobsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { companyId } = req.params;
            const excludeJobId = req.query.excludeJobId;
            if (!companyId) {
                throw new Error("Company ID is required");
            }
            const jobs = yield (0, job_service_1.GetSuggestedJobService)(companyId, excludeJobId);
            res.status(200).json(jobs);
        }
        catch (err) {
            next(err);
        }
    });
}
function applyJobHandler(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.id;
            const userId = req.user.id;
            const { expectedSalary, coverLetter } = req.body;
            const parsed = job_schema_1.applyJobSchema.safeParse({
                expectedSalary: Number(expectedSalary),
                cvFile: "placeholder",
                coverLetter,
            });
            if (!parsed.success) {
                res.status(400).json({ error: parsed.error.flatten().fieldErrors });
                return;
            }
            const file = req.file;
            if (!file) {
                res.status(400).json({ error: "Resume (CV) file is required" });
                return;
            }
            const result = yield (0, cloudinary_1.cloudinaryUpload)(file, "raw");
            const cvFileUrl = result.secure_url;
            const application = yield (0, job_service_1.applyJobService)(jobId, userId, {
                expectedSalary: parsed.data.expectedSalary,
                coverLetter,
                cvFile: cvFileUrl,
            });
            res.status(201).json({ success: true, data: application });
        }
        catch (err) {
            next(err);
        }
    });
}
function getJobDetailViewController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const jobId = req.params.id;
            const job = yield (0, job_service_1.getJobDetailsService)(jobId);
            if (!job) {
                res.status(404).json({ message: "Job not found" });
            }
            const now = new Date();
            const isExpired = (job === null || job === void 0 ? void 0 : job.deadline) ? new Date(job.deadline) < now : false;
            const isClosed = (job === null || job === void 0 ? void 0 : job.status) === client_1.JobStatus.CLOSED ||
                (job === null || job === void 0 ? void 0 : job.status) === client_1.JobStatus.DRAFT ||
                (job === null || job === void 0 ? void 0 : job.status) === client_1.JobStatus.ARCHIVED;
            res.status(200).json(Object.assign(Object.assign({}, job), { isExpired,
                isClosed }));
        }
        catch (err) {
            next(err);
        }
    });
}
function getSavedJobsPaginatedController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw new Error("User not authenticated");
            }
            const { page, pageSize } = req.validatedQuery;
            const result = yield (0, job_service_1.getSavedJobsByUserPaginated)(userId, page, pageSize);
            res.status(200).json(result);
        }
        catch (err) {
            res.status(400).json({ message: err.message });
        }
    });
}
function getNearbyJobsController(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { lat, lng, radiusKm = 100, page = 1, pageSize = 10 } = req.query;
            const numericRadiusKm = radiusKm !== undefined && !isNaN(Number(radiusKm))
                ? Number(radiusKm)
                : 100;
            const numericLat = Number(lat);
            const numericLng = Number(lng);
            const numericPage = Number(page);
            const numericPageSize = Number(pageSize);
            const jobs = yield (0, job_service_1.getNearbyJobsService)(numericLat, numericLng, numericRadiusKm, numericPage, numericPageSize);
            res.json({ jobs });
        }
        catch (err) {
            next(err);
        }
    });
}
