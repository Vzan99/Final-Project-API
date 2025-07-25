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
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  MIDTRANS_SERVER_KEY,
  MIDTRANS_CLIENT_KEY,
} = process.env;
