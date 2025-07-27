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
exports.createInterview = createInterview;
exports.getAllInterviewsByAdmin = getAllInterviewsByAdmin;
exports.getInterviewsByJob = getInterviewsByJob;
exports.updateInterviewById = updateInterviewById;
exports.deleteInterviewById = deleteInterviewById;
exports.updateInterviewStatus = updateInterviewStatus;
const prisma_1 = __importDefault(require("../lib/prisma"));
const nodemailer_1 = require("../utils/nodemailer");
function createInterview(adminId, input) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: input.jobId },
            include: {
                company: {
                    include: {
                        admin: true,
                    },
                },
            },
        });
        if (!job || job.companyId !== company.id)
            throw new Error("Unauthorized to schedule for this job");
        const interview = yield prisma_1.default.interviewSchedule.create({
            data: Object.assign(Object.assign({}, input), { dateTime: new Date(input.dateTime) }),
            include: {
                user: true,
                job: true,
            },
        });
        const subject = `Interview Scheduled for ${job.title}`;
        const html = `
    <div style="font-family: sans-serif; padding: 16px;">
      <h2>Interview Scheduled</h2>
      <p>Hello ${interview.user.name},</p>
      <p>You have been scheduled for an interview for the position:</p>
      <ul>
        <li><strong>Job Title:</strong> ${job.title}</li>
        <li><strong>Company:</strong> ${job.company.admin.name}</li>
        <li><strong>Date & Time:</strong> ${interview.dateTime.toLocaleString()}</li>
        ${interview.location
            ? `<li><strong>Location:</strong> ${interview.location}</li>`
            : ""}
      </ul>
      ${interview.notes
            ? `<p><strong>Note from recruiter:</strong> ${interview.notes}</p>`
            : ""}
      <p>Please prepare and be on time. Good luck!</p>
      <br/>
      <p style="font-size: 13px; color: #888;">This is an automated email from Precise Job Board.</p>
    </div>
  `;
        yield (0, nodemailer_1.sendEmail)({
            to: interview.user.email,
            subject,
            html,
        });
        console.log(`Interview email sent to ${interview.user.email}`);
        return interview;
    });
}
function getAllInterviewsByAdmin(adminId, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
            include: { jobs: true },
        });
        if (!company)
            throw new Error("Company not found");
        const jobIds = company.jobs.map((job) => job.id);
        const status = query.status;
        const sort = query.sort === "dateTime_desc" ? "desc" : "asc";
        const page = parseInt(query.page) || 1;
        const limit = parseInt(query.limit) || 10;
        const where = Object.assign({ jobId: { in: jobIds } }, (status ? { status: status } : {}));
        const [data, total] = yield prisma_1.default.$transaction([
            prisma_1.default.interviewSchedule.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true, email: true } },
                    job: { select: { id: true, title: true } },
                },
                orderBy: { dateTime: sort },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma_1.default.interviewSchedule.count({ where }),
        ]);
        return {
            data,
            total,
            page,
            limit,
        };
    });
}
function getInterviewsByJob(jobId, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company)
            throw new Error("Company not found");
        const job = yield prisma_1.default.job.findUnique({
            where: { id: jobId },
        });
        if (!job || job.companyId !== company.id)
            throw new Error("Unauthorized access to this job");
        const interviews = yield prisma_1.default.interviewSchedule.findMany({
            where: { jobId },
            orderBy: { dateTime: "asc" },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
        return interviews;
    });
}
function updateInterviewById(id, adminId, data) {
    return __awaiter(this, void 0, void 0, function* () {
        const interview = yield prisma_1.default.interviewSchedule.findUnique({
            where: { id },
            include: {
                job: true,
            },
        });
        if (!interview)
            throw new Error("Interview not found");
        const job = interview.job;
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company || job.companyId !== company.id) {
            throw new Error("Unauthorized access");
        }
        const updated = yield prisma_1.default.interviewSchedule.update({
            where: { id },
            data: Object.assign(Object.assign({}, data), { dateTime: data.dateTime ? new Date(data.dateTime) : undefined }),
        });
        return updated;
    });
}
function deleteInterviewById(id, adminId) {
    return __awaiter(this, void 0, void 0, function* () {
        const interview = yield prisma_1.default.interviewSchedule.findUnique({
            where: { id },
            include: { job: true },
        });
        if (!interview)
            throw new Error("Interview not found");
        const job = interview.job;
        const company = yield prisma_1.default.company.findUnique({
            where: { adminId },
        });
        if (!company || job.companyId !== company.id) {
            throw new Error("Unauthorized access");
        }
        yield prisma_1.default.interviewSchedule.delete({
            where: { id },
        });
        return { id };
    });
}
function updateInterviewStatus(interviewId, adminId, status) {
    return __awaiter(this, void 0, void 0, function* () {
        const interview = yield prisma_1.default.interviewSchedule.findUnique({
            where: { id: interviewId },
            include: {
                job: {
                    include: {
                        company: {
                            select: {
                                adminId: true,
                            },
                        },
                    },
                },
            },
        });
        if (!interview) {
            throw new Error("Interview not found");
        }
        if (interview.job.company.adminId !== adminId) {
            throw new Error("Not authorized to update this interview");
        }
        const updated = yield prisma_1.default.interviewSchedule.update({
            where: { id: interviewId },
            data: { status },
        });
        return updated;
    });
}
