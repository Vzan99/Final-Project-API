import { Router } from "express";
import { GetProfileController } from "../controllers/profile.controller";
import { VerifyToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", VerifyToken, GetProfileController);

export default router;
