import prisma from "../lib/prisma";

async function findUserByEmail(email: string) {
  return await prisma.user.findFirst({
    where: { email },
  });
}

export { findUserByEmail };
