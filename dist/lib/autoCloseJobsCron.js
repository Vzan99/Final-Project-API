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
exports.scheduleAutoCloseJobs = scheduleAutoCloseJobs;
const prisma_1 = __importDefault(require("../lib/prisma"));
const node_cron_1 = __importDefault(require("node-cron"));
function scheduleAutoCloseJobs() {
    node_cron_1.default.schedule("0 0 * * *", () => __awaiter(this, void 0, void 0, function* () {
        console.log("[CRON] Menutup job yang sudah deadline...");
        const now = new Date();
        const jobsToClose = yield prisma_1.default.job.findMany({
            where: {
                status: "PUBLISHED",
                deadline: { lt: now },
                applications: { some: {} }, // setidaknya satu pelamar
            },
        });
        const ids = jobsToClose.map((j) => j.id);
        if (ids.length === 0) {
            console.log("[CRON] Tidak ada job yang perlu ditutup.");
            return;
        }
        yield prisma_1.default.job.updateMany({
            where: { id: { in: ids } },
            data: { status: "CLOSED" },
        });
        console.log(`[CRON] Menutup ${ids.length} job yang sudah deadline.`);
    }));
}
