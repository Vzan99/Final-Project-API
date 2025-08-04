import prisma from "../lib/prisma";
import dayjs from "dayjs";

export async function getUserDemographics() {
  const profiles = await prisma.profile.findMany({
    select: {
      birthDate: true,
      gender: true,
      address: true,
    },
  });

  const demographics: {
    ageGroups: {
      "18-24": number;
      "25-34": number;
      "35-44": number;
      "45+": number;
    };
    gender: { [key: string]: number };
    location: { [key: string]: number };
  } = {
    ageGroups: {
      "18-24": 0,
      "25-34": 0,
      "35-44": 0,
      "45+": 0,
    },
    gender: {},
    location: {},
  };

  const now = dayjs();

  for (const profile of profiles) {
    const age = now.diff(profile.birthDate, "year");

    if (age >= 18 && age <= 24) demographics.ageGroups["18-24"]++;
    else if (age <= 34) demographics.ageGroups["25-34"]++;
    else if (age <= 44) demographics.ageGroups["35-44"]++;
    else demographics.ageGroups["45+"]++;

    // Gender count
    const g = profile.gender || "Unknown";
    demographics.gender[g] = (demographics.gender[g] || 0) + 1;

    // Location count
    const loc = profile.address || "Unknown";
    demographics.location[loc] = (demographics.location[loc] || 0) + 1;
  }

  return demographics;
}

export async function getSalaryTrends() {
  const applications = await prisma.application.findMany({
    where: {
      status: {
        in: ["REVIEWED", "INTERVIEW", "ACCEPTED"],
      },
    },
    select: {
      expectedSalary: true,
      job: {
        select: {
          title: true,
          location: true,
        },
      },
    },
  });

  const trends: {
    [key: string]: { totalSalary: number; count: number };
  } = {};

  for (const app of applications) {
    const key = `${app.job.title} | ${app.job.location}`;
    if (!trends[key]) trends[key] = { totalSalary: 0, count: 0 };

    trends[key].totalSalary += app.expectedSalary;
    trends[key].count++;
  }

  const result = Object.entries(trends).map(([key, value]) => {
    const [title, location] = key.split(" | ");
    return {
      title,
      location,
      averageSalary: Math.round(value.totalSalary / value.count),
      count: value.count,
    };
  });

  return result;
}

export async function getApplicantInterests() {
  const applications = await prisma.application.findMany({
    select: {
      job: {
        select: {
          jobCategory: true,
        },
      },
    },
  });

  const interestMap: { [category: string]: number } = {};

  for (const app of applications) {
    const category = app.job?.jobCategory ?? "OTHER";
    const readableCategory = (category as string)
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());

    interestMap[readableCategory] = (interestMap[readableCategory] || 0) + 1;
  }

  const result = Object.entries(interestMap).map(([category, count]) => ({
    category,
    totalApplications: count,
  }));

  result.sort((a, b) => b.totalApplications - a.totalApplications);

  return result;
}

export async function getAnalyticsOverview() {
  // Total user by role
  const users = await prisma.user.groupBy({
    by: ["role"],
    _count: true,
  });

  // Job aktif
  const totalActiveJobs = await prisma.job.count({
    where: { status: "PUBLISHED" },
  });

  // Total aplikasi
  const totalApplications = await prisma.application.count();

  // Rata-rata skor pre-selection test
  const preSelectionAvg = await prisma.preSelectionAnswer.aggregate({
    _avg: {
      score: true,
    },
  });

  // Rata-rata skor skill assessment
  const skillAssessmentAvg = await prisma.userAssessment.aggregate({
    _avg: {
      score: true,
    },
  });

  return {
    userByRole: users.map((u) => ({
      role: u.role,
      total: u._count,
    })),
    totalActiveJobs,
    totalApplications,
    preSelectionAvgScore: Math.round(preSelectionAvg._avg.score || 0),
    skillAssessmentAvgScore: Math.round(skillAssessmentAvg._avg.score || 0),
  };
}
