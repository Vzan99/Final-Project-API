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
exports.initInterviewReminderCron = initInterviewReminderCron;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("../lib/prisma")); // path ke prisma kamu
const dayjs_1 = __importDefault(require("dayjs"));
const nodemailer_1 = require("../utils/nodemailer"); // asumsi file nodemailer kamu
function initInterviewReminderCron() {
    // Setiap hari jam 07:00 pagi
    node_cron_1.default.schedule("0 7 * * *", () => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        console.log("Running interview reminder cron...");
        const tomorrowStart = (0, dayjs_1.default)().add(1, "day").startOf("day").toDate();
        const tomorrowEnd = (0, dayjs_1.default)().add(1, "day").endOf("day").toDate();
        const interviews = yield prisma_1.default.interviewSchedule.findMany({
            where: {
                dateTime: {
                    gte: tomorrowStart,
                    lt: tomorrowEnd,
                },
                reminderSent: false,
            },
            include: {
                user: true,
                job: {
                    include: {
                        company: {
                            include: {
                                admin: true,
                            },
                        },
                    },
                },
            },
        });
        for (const interview of interviews) {
            const { user, job, dateTime, location } = interview;
            // Kirim ke pelamar
            yield (0, nodemailer_1.sendEmail)({
                to: user.email,
                subject: `Reminder: Interview for ${job.title} - Tomorrow`,
                html: `
          <p>Hi ${user.name},</p>
          <p>This is a friendly reminder that you have an interview scheduled for:</p>
          <ul>
            <li><strong>Job:</strong> ${job.title}</li>
            <li><strong>Company:</strong> ${(_a = job.company) === null || _a === void 0 ? void 0 : _a.admin.name}</li>
            <li><strong>Date & Time:</strong> ${(0, dayjs_1.default)(dateTime).format("DD MMM YYYY [at] HH:mm")}</li>
            ${location ? `<li><strong>Location:</strong> ${location}</li>` : ""}
          </ul>
          <p>Please make sure you're prepared and available on time.</p>
          <p>Good luck!</p>
          <br/>
          <p style="font-size: 13px; color: #888;">Precise Job Board • This is an automated reminder</p>
        `,
            });
            console.log(`Reminder sent to applicant: ${user.email}`);
            // Kirim ke admin
            const admin = yield prisma_1.default.user.findUnique({
                where: { id: ((_b = job.company) === null || _b === void 0 ? void 0 : _b.adminId) || "" },
            });
            if (admin) {
                yield (0, nodemailer_1.sendEmail)({
                    to: admin.email,
                    subject: `Reminder: Interview scheduled for ${user.name}`,
                    html: `
            <p>Hello ${admin.name},</p>
            <p>This is a reminder that <strong>${user.name}</strong> has an interview scheduled:</p>
            <ul>
              <li><strong>Job:</strong> ${job.title}</li>
              <li><strong>Date & Time:</strong> ${(0, dayjs_1.default)(dateTime).format("DD MMM YYYY [at] HH:mm")}</li>
              ${location
                        ? `<li><strong>Location:</strong> ${location}</li>`
                        : ""}
            </ul>
            <p>Keep in touch with the candidate if any changes are needed.</p>
            <br/>
            <p style="font-size: 13px; color: #888;">Precise Job Board • Automated reminder</p>
          `,
                });
                console.log(`Reminder sent to admin: ${admin.email}`);
            }
            // Update reminderSent agar tidak dikirim ulang
            yield prisma_1.default.interviewSchedule.update({
                where: { id: interview.id },
                data: { reminderSent: true },
            });
        }
        console.log(`${interviews.length} interview reminder(s) sent`);
    }));
}
