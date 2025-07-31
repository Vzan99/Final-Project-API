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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetAllCompaniesService = GetAllCompaniesService;
exports.getCompanyByIdService = getCompanyByIdService;
exports.getPublishedJobsByCompanyIdService = getPublishedJobsByCompanyIdService;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../lib/prisma"));
function GetAllCompaniesService(params) {
    return __awaiter(this, void 0, void 0, function* () {
        const { name, location, sortBy = "name", sortOrder = "asc", page = 1, pageSize = 10, } = params;
        const where = Object.assign(Object.assign({}, (location && {
            location: {
                contains: location,
                mode: "insensitive",
            },
        })), (name && {
            admin: {
                name: {
                    contains: name,
                    mode: "insensitive",
                },
            },
        }));
        const total = yield prisma_1.default.company.count({
            where,
        });
        const skip = (page - 1) * pageSize;
        const companies = yield prisma_1.default.company.findMany({
            where,
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: sortBy === "name"
                ? {
                    admin: {
                        name: sortOrder,
                    },
                }
                : {
                    location: sortOrder,
                },
            skip,
            take: pageSize,
        });
        return {
            total,
            page,
            pageSize,
            companies,
        };
    });
}
function getCompanyByIdService(companyId) {
    return __awaiter(this, void 0, void 0, function* () {
        return prisma_1.default.company.findUnique({
            where: { id: companyId },
            include: {
                admin: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
            },
        });
    });
}
function getPublishedJobsByCompanyIdService(companyId_1) {
    return __awaiter(this, arguments, void 0, function* (companyId, page = 1, pageSize = 5) {
        const now = new Date();
        const [jobs, total] = yield Promise.all([
            prisma_1.default.job.findMany({
                where: {
                    companyId,
                    status: client_1.JobStatus.PUBLISHED,
                    deadline: {
                        gt: now,
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
                skip: (page - 1) * pageSize,
                take: pageSize,
                include: {
                    company: true,
                    applications: true,
                },
            }),
            prisma_1.default.job.count({
                where: {
                    companyId,
                    status: client_1.JobStatus.PUBLISHED,
                    deadline: {
                        gt: now,
                    },
                },
            }),
        ]);
        const totalPages = Math.ceil(total / pageSize);
        return {
            jobs,
            total,
            totalPages,
            page,
            pageSize,
        };
    });
}
