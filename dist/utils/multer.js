"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Multer = Multer;
const multer_1 = __importStar(require("multer"));
function Multer() {
    return (0, multer_1.default)({
        storage: multer_1.default.memoryStorage(),
        limits: {
            fileSize: 1024 * 1024,
        },
        fileFilter(req, file, cb) {
            if (file.fieldname === "photo" ||
                file.fieldname === "banner" ||
                file.fieldname === "paymentProof") {
                const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
                if (!allowed.includes(file.mimetype)) {
                    return cb(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
                }
                return cb(null, true);
            }
            if (file.fieldname === "resume") {
                const allowedDocs = [
                    "application/pdf",
                    "application/msword",
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                    "image/jpeg",
                    "image/png",
                    "image/jpg",
                    "image/webp",
                ];
                if (!allowedDocs.includes(file.mimetype)) {
                    return cb(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", "resume"));
                }
                return cb(null, true);
            }
            return cb(new multer_1.MulterError("LIMIT_UNEXPECTED_FILE", file.fieldname));
        },
    });
}
