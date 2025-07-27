"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const interview_controller_1 = require("../controllers/interview.controller");
const interview_schema_1 = require("../schema/interview.schema");
const router = (0, express_1.Router)();
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, (0, reqValidator_middleware_1.default)(interview_schema_1.createInterviewSchema), interview_controller_1.createInterviewHandler);
router.get("/all", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, interview_controller_1.getAllInterviewsByAdminHandler);
router.get("/", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, interview_controller_1.getInterviewsByJobHandler);
router.patch("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, (0, reqValidator_middleware_1.default)(interview_schema_1.updateInterviewSchema), interview_controller_1.updateInterviewHandler);
router.delete("/:id", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, interview_controller_1.deleteInterviewHandler);
router.patch("/:id/status", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, interview_controller_1.updateInterviewStatusHandler);
exports.default = router;
