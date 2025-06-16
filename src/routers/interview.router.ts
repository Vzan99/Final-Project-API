import { Router } from "express";
import ReqValidator from "../middlewares/reqValidator.middleware";
import { VerifyToken, AdminGuard } from "../middlewares/auth.middleware";
import {
  createInterviewHandler,
  getInterviewsByJobHandler,
  updateInterviewHandler,
  deleteInterviewHandler,
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
router.get("/", VerifyToken, AdminGuard, getInterviewsByJobHandler);
router.patch(
  "/:id",
  VerifyToken,
  AdminGuard,
  ReqValidator(updateInterviewSchema),
  updateInterviewHandler
);
router.delete("/:id", VerifyToken, AdminGuard, deleteInterviewHandler);
export default router;
