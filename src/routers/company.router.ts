import express from "express";
import QueryValidator from "../middlewares/queryValidator.middleware";
import {
  GetAllCompaniesController,
  getCompanyByIdController,
  getPublishedJobsByCompanyIdController,
} from "../controllers/company.controller";
import { companyFilterSchema } from "../schema/company.schema";

const router = express.Router();

router.get("/", QueryValidator(companyFilterSchema), GetAllCompaniesController);

router.get("/:id", getCompanyByIdController);

router.get("/:id/jobs", getPublishedJobsByCompanyIdController);

export default router;
