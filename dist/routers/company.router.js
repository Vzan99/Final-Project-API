"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const queryValidator_middleware_1 = __importDefault(require("../middlewares/queryValidator.middleware"));
const company_controller_1 = require("../controllers/company.controller");
const company_schema_1 = require("../schema/company.schema");
const router = express_1.default.Router();
router.get("/", (0, queryValidator_middleware_1.default)(company_schema_1.companyFilterSchema), company_controller_1.GetAllCompaniesController);
router.get("/:id", company_controller_1.getCompanyByIdController);
router.get("/:id/jobs", company_controller_1.getPublishedJobsByCompanyIdController);
exports.default = router;
