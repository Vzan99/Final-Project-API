import { Router } from "express";
import {
  getSubscriptions,
  approveSubscription,
  getSubscriptionOptions,
  subscribe,
} from "../controllers/subscription.controller";
import { VerifyToken } from "../middlewares/auth.middleware";
import { requireRole } from "../middlewares/requireRole";
import { Role } from "@prisma/client";
import { Multer } from "../utils/multer";

const upload = Multer();
const router = Router();

router.use(VerifyToken);
router.use(requireRole(Role.DEVELOPER));

router.get("/", getSubscriptions);
router.patch("/:id/approve", approveSubscription);

router.get("/options", getSubscriptionOptions);
router.post(
  "/user/subscribe",
  VerifyToken,
  requireRole(Role.USER),
  upload.single("paymentProof"),
  subscribe
);

export default router;
