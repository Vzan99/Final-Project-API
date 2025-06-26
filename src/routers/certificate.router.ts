import express from "express";
import {
  verifyCertificateHandler,
  downloadCertificatePdf,
} from "../controllers/certificate.controller";

const router = express.Router();

// Public: anyone can verify certificate
router.get("/verify/:code", verifyCertificateHandler);

router.get("/download/:id", downloadCertificatePdf);

export default router;
