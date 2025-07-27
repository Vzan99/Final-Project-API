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
exports.approveSubscriptionById = exports.getAllSubscriptions = void 0;
const prisma_1 = __importDefault(require("../lib/prisma"));
const dayjs_1 = __importDefault(require("dayjs"));
const getAllSubscriptions = () => __awaiter(void 0, void 0, void 0, function* () {
    return prisma_1.default.subscription.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true },
            },
        },
    });
});
exports.getAllSubscriptions = getAllSubscriptions;
const approveSubscriptionById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const startDate = new Date();
    const endDate = (0, dayjs_1.default)(startDate).add(30, "day").toDate();
    return prisma_1.default.subscription.update({
        where: { id },
        data: {
            isApproved: true,
            paymentStatus: "PAID",
            startDate,
            endDate,
        },
    });
});
exports.approveSubscriptionById = approveSubscriptionById;
