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
exports.ProfessionalOnly = exports.SubscriberGuard = exports.DeveloperGuard = exports.AdminGuard = exports.UserGuard = void 0;
exports.VerifyToken = VerifyToken;
const jsonwebtoken_1 = require("jsonwebtoken");
const config_1 = require("../config");
const prisma_1 = __importDefault(require("../lib/prisma"));
const client_1 = require("@prisma/client");
const client_2 = require("@prisma/client");
// Token verification
function VerifyToken(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const authHeader = req.header("Authorization");
            const cookieToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.access_token;
            const token = ((authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) && authHeader.split(" ")[1]) ||
                cookieToken;
            if (!token) {
                res.status(401).json({ message: "Unauthorized: Token missing" });
                return;
            }
            const verifyUser = (0, jsonwebtoken_1.verify)(token, String(config_1.SECRET_KEY));
            req.user = verifyUser;
            next();
        }
        catch (err) {
            res.status(401).json({ message: "Unauthorized: Invalid token" });
        }
    });
}
// Role guards
const UserGuard = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_2.Role.USER) {
        res.status(403).json({ message: "Access restricted: User only" });
        return;
    }
    next();
};
exports.UserGuard = UserGuard;
const AdminGuard = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_2.Role.ADMIN) {
        res.status(403).json({ message: "Access restricted: Admin only" });
        return;
    }
    next();
};
exports.AdminGuard = AdminGuard;
const DeveloperGuard = (req, res, next) => {
    var _a;
    if (((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) !== client_2.Role.DEVELOPER) {
        res.status(403).json({ message: "Access restricted: Developer only" });
        return;
    }
    next();
};
exports.DeveloperGuard = DeveloperGuard;
// Subscription access check (STANDARD or PROFESSIONAL)
const SubscriberGuard = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const sub = yield prisma_1.default.subscription.findFirst({
        where: {
            userId,
            isApproved: true,
            paymentStatus: "PAID",
            endDate: { gte: new Date() },
        },
    });
    if (!sub) {
        res
            .status(403)
            .json({ message: "Subscription required to access this feature" });
        return;
    }
    req.subscription = sub;
    next();
});
exports.SubscriberGuard = SubscriberGuard;
// Only for PROFESSIONAL
const ProfessionalOnly = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const sub = yield prisma_1.default.subscription.findFirst({
        where: {
            userId,
            isApproved: true,
            paymentStatus: "PAID",
            endDate: { gte: new Date() },
            type: client_1.SubscriptionType.PROFESSIONAL,
        },
    });
    if (!sub) {
        res.status(403).json({ message: "Professional subscription required" });
        return;
    }
    next();
});
exports.ProfessionalOnly = ProfessionalOnly;
