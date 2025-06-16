import { Router } from "express";
import {
  getSubscriptions,
  approveSubscription,
  getSubscriptionOptions,
  subscribe,
} from "../controllers/subscription.controller";
import {
  VerifyToken,
  DeveloperGuard,
  UserGuard,
} from "../middlewares/auth.middleware";
import { Multer } from "../utils/multer";

const upload = Multer();
const router = Router();

// Routes khusus developer
router.use(VerifyToken);
router.use(DeveloperGuard);

router.get("/", getSubscriptions);
router.patch("/:id/approve", approveSubscription);

// Routes untuk user (beli subscription)
router.get("/options", VerifyToken, UserGuard, getSubscriptionOptions);
router.post(
  "/user/subscribe",
  VerifyToken,
  UserGuard,
  upload.single("paymentProof"),
  subscribe
);

export default router;
