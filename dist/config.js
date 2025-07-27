"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MIDTRANS_CLIENT_KEY = exports.MIDTRANS_SERVER_KEY = exports.SUPABASE_SERVICE_ROLE_KEY = exports.SUPABASE_URL = exports.FE_URL = exports.NODEMAILER_USER = exports.NODEMAILER_PASS = exports.CLOUDINARY_SECRET = exports.CLOUDINARY_KEY = exports.CLOUDINARY_NAME = exports.SECRET_KEY = exports.PORT = void 0;
require("dotenv/config");
_a = process.env, exports.PORT = _a.PORT, exports.SECRET_KEY = _a.SECRET_KEY, exports.CLOUDINARY_NAME = _a.CLOUDINARY_NAME, exports.CLOUDINARY_KEY = _a.CLOUDINARY_KEY, exports.CLOUDINARY_SECRET = _a.CLOUDINARY_SECRET, exports.NODEMAILER_PASS = _a.NODEMAILER_PASS, exports.NODEMAILER_USER = _a.NODEMAILER_USER, exports.FE_URL = _a.FE_URL, exports.SUPABASE_URL = _a.SUPABASE_URL, exports.SUPABASE_SERVICE_ROLE_KEY = _a.SUPABASE_SERVICE_ROLE_KEY, exports.MIDTRANS_SERVER_KEY = _a.MIDTRANS_SERVER_KEY, exports.MIDTRANS_CLIENT_KEY = _a.MIDTRANS_CLIENT_KEY;
