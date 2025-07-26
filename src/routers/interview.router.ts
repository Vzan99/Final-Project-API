import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  createInterviewHandler,
  getAllInterviewsByAdminHandler,
  getInterviewsByJobHandler,
  updateInterviewHandler,
  deleteInterviewHandler,
  updateInterviewStatusHandler,
} from "../controllers/interview.controller";
import {
  createInterviewSchema,
  updateInterviewSchema,
} from "../schema/interview.schema";

const router = Router();

router.post(
  "/",
  VerifyToken,
  AdminGuard,
  ReqValidator(createInterviewSchema),
  createInterviewHandler
);
router.get("/all", VerifyToken, AdminGuard, getAllInterviewsByAdminHandler);
router.get("/", VerifyToken, AdminGuard, getInterviewsByJobHandler);
router.patch(
  "/:id",
  VerifyToken,
  AdminGuard,
  ReqValidator(updateInterviewSchema),
  updateInterviewHandler
);
router.delete("/:id", VerifyToken, AdminGuard, deleteInterviewHandler);
router.patch(
  "/:id/status",
  VerifyToken,
  AdminGuard,
  updateInterviewStatusHandler
);

export default router;
