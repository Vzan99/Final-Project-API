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
exports.initSubscriptionCron = initSubscriptionCron;
const node_cron_1 = __importDefault(require("node-cron"));
const prisma_1 = __importDefault(require("./prisma"));
const dayjs_1 = __importDefault(require("dayjs"));
const nodemailer_1 = require("../utils/nodemailer");
function initSubscriptionCron() {
    // Setiap hari jam 8 pagi
    node_cron_1.default.schedule("0 8 * * *", () => __awaiter(this, void 0, void 0, function* () {
        const tomorrow = (0, dayjs_1.default)().add(1, "day").startOf("day").toDate();
        const dayAfter = (0, dayjs_1.default)(tomorrow).add(1, "day").toDate();
        const expiringSoon = yield prisma_1.default.subscription.findMany({
            where: {
                endDate: {
                    gte: tomorrow,
                    lt: dayAfter,
                },
                isApproved: true,
                paymentStatus: "PAID",
            },
            include: {
                user: true,
            },
        });
        for (const sub of expiringSoon) {
            try {
                yield (0, nodemailer_1.sendReminderEmail)(sub.user.email, sub.user.name, sub.endDate);
            }
            catch (err) {
                console.error(`Failed to send email to ${sub.user.email}`, err);
            }
        }
    }));
}
