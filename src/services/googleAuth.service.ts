import { OAuth2Client } from "google-auth-library";
import prisma from "../lib/prisma";
import { googleClient } from "../config"; // adjust path if needed

export async function loginWithGoogle(idToken: string) {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();
  if (!payload || !payload.email) {
    throw new Error("Invalid Google token");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    return existingUser;
  }

  // Register new user if not exist
  const newUser = await prisma.user.create({
    data: {
      email: payload.email,
      name: payload.name || "Unknown",
      isVerified: true,
      socialLoginProvider: "GOOGLE",
    },
  });

  return newUser;
}
