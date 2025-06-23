import prisma from "../lib/prisma";
import cron from "node-cron";

export function scheduleAutoCloseJobs() {
  cron.schedule("0 0 * * *", async () => {
    console.log("[CRON] Menutup job yang sudah deadline...");

    const now = new Date();

    const jobsToClose = await prisma.job.findMany({
      where: {
        status: "PUBLISHED",
        deadline: { lt: now },
        applications: { some: {} }, // setidaknya satu pelamar
      },
    });

    const ids = jobsToClose.map((j) => j.id);

    if (ids.length === 0) {
      console.log("[CRON] Tidak ada job yang perlu ditutup.");
      return;
    }

    await prisma.job.updateMany({
      where: { id: { in: ids } },
      data: { status: "CLOSED" },
    });

    console.log(`[CRON] Menutup ${ids.length} job yang sudah deadline.`);
  });
}
