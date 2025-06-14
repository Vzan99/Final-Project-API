import { OAuth2Client } from "google-auth-library";
import "dotenv/config";

export const {
  PORT,
  SECRET_KEY,
  CLOUDINARY_NAME,
  CLOUDINARY_KEY,
  CLOUDINARY_SECRET,
  NODEMAILER_PASS,
  NODEMAILER_USER,
  FE_URL,
  GOOGLE_CLIENT_ID,
} = process.env;

export const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
