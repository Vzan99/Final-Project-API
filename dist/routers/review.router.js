"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const review_controller_1 = require("../controllers/review.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const review_schema_1 = require("../schema/review.schema");
const reqValidator_middleware_1 = __importDefault(require("../middlewares/reqValidator.middleware"));
const queryValidator_middleware_1 = __importDefault(require("../middlewares/queryValidator.middleware"));
const router = express_1.default.Router();
router.post("/", auth_middleware_1.VerifyToken, auth_middleware_1.UserGuard, (0, reqValidator_middleware_1.default)(review_schema_1.createReviewSchema), review_controller_1.createReviewHandler);
router.get("/company/:id", (0, queryValidator_middleware_1.default)(review_schema_1.reviewQuerySchema), review_controller_1.getCompanyReviewsHandler);
router.patch("/:id/verify", auth_middleware_1.VerifyToken, auth_middleware_1.AdminGuard, review_controller_1.verifyReviewHandler);
exports.default = router;
