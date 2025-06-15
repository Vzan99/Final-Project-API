import prisma from "../lib/prisma";

async function GetProfileService(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        profile: {
          select: {
            birthDate: true,
            gender: true,
            education: true,
            address: true,
            photoUrl: true,
            resumeUrl: true,
            skills: true,
          },
        },
        certificates: {
          select: {
            id: true,
            certificateUrl: true,
            verificationCode: true,
            issuedAt: true,
            expiresAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err) {
    throw err;
  }
}

export { GetProfileService };
