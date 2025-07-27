"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const certificate_controller_1 = require("../controllers/certificate.controller");
const router = express_1.default.Router();
// Public: anyone can verify certificate
router.get("/verify/:code", certificate_controller_1.verifyCertificateHandler);
router.get("/download/:id", certificate_controller_1.downloadCertificatePdf);
exports.default = router;
