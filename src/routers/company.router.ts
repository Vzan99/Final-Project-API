import express from "express";
import QueryValidator from "../middlewares/queryValidator.middleware";
import {
  GetAllCompaniesController,
  getCompanyByIdController,
} from "../controllers/company.controller";
import { companyFilterSchema } from "../schema/company.schema";

const router = express.Router();

router.get("/", QueryValidator(companyFilterSchema), GetAllCompaniesController);

router.get("/:id", getCompanyByIdController);

export default router;
