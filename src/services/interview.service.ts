import prisma from "../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateInterviewInput,
  UpdateInterviewInput,
} from "../schema/interview.schema";
import { InterviewStatus } from "@prisma/client";
import { sendEmail } from "../utils/nodemailer";

export async function createInterview(
  adminId: string,
  input: CreateInterviewInput
) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: input.jobId },
    include: {
      company: {
        include: {
          admin: true,
        },
      },
    },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized to schedule for this job");

  const interview = await prisma.interviewSchedule.create({
    data: {
      ...input,
      dateTime: new Date(input.dateTime),
    },
    include: {
      user: true,
      job: true,
    },
  });

  const subject = `Interview Scheduled for ${job.title}`;
  const html = `
    <div style="font-family: sans-serif; padding: 16px;">
      <h2>Interview Scheduled</h2>
      <p>Hello ${interview.user.name},</p>
      <p>You have been scheduled for an interview for the position:</p>
      <ul>
        <li><strong>Job Title:</strong> ${job.title}</li>
        <li><strong>Company:</strong> ${job.company.admin.name}</li>
        <li><strong>Date & Time:</strong> ${interview.dateTime.toLocaleString()}</li>
        ${
          interview.location
            ? `<li><strong>Location:</strong> ${interview.location}</li>`
            : ""
        }
      </ul>
      ${
        interview.notes
          ? `<p><strong>Note from recruiter:</strong> ${interview.notes}</p>`
          : ""
      }
      <p>Please prepare and be on time. Good luck!</p>
      <br/>
      <p style="font-size: 13px; color: #888;">This is an automated email from Precise Job Board.</p>
    </div>
  `;

  await sendEmail({
    to: interview.user.email,
    subject,
    html,
  });

  console.log(`Interview email sent to ${interview.user.email}`);

  return interview;
}

export async function getAllInterviewsByAdmin(adminId: string, query: any) {
  const company = await prisma.company.findUnique({
    where: { adminId },
    include: { jobs: true },
  });

  if (!company) throw new Error("Company not found");

  const jobIds = company.jobs.map((job) => job.id);

  const status = query.status;
  const sort = query.sort === "dateTime_desc" ? "desc" : "asc";
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.limit) || 10;

  const where: Prisma.InterviewScheduleWhereInput = {
    jobId: { in: jobIds },
    ...(status ? { status: status as any } : {}),
  };

  const [data, total] = await prisma.$transaction([
    prisma.interviewSchedule.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        job: { select: { id: true, title: true } },
      },
      orderBy: { dateTime: sort },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.interviewSchedule.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    limit,
  };
}
export async function getInterviewsByJob(jobId: string, adminId: string) {
  const company = await prisma.company.findUnique({
    where: { adminId },
  });
  if (!company) throw new Error("Company not found");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
  });
  if (!job || job.companyId !== company.id)
    throw new Error("Unauthorized access to this job");

  const interviews = await prisma.interviewSchedule.findMany({
    where: { jobId },
    orderBy: { dateTime: "asc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return interviews;
}

export async function updateInterviewById(
  id: string,
  adminId: string,
  data: UpdateInterviewInput
) {
  const interview = await prisma.interviewSchedule.findUnique({
    where: { id },
    include: {
      job: true,
    },
  });

  if (!interview) throw new Error("Interview not found");

  const job = interview.job;
  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company || job.companyId !== company.id) {
    throw new Error("Unauthorized access");
  }

  const updated = await prisma.interviewSchedule.update({
    where: { id },
    data: {
      ...data,
      dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
    },
  });

  return updated;
}

export async function deleteInterviewById(id: string, adminId: string) {
  const interview = await prisma.interviewSchedule.findUnique({
    where: { id },
    include: { job: true },
  });

  if (!interview) throw new Error("Interview not found");

  const job = interview.job;

  const company = await prisma.company.findUnique({
    where: { adminId },
  });

  if (!company || job.companyId !== company.id) {
    throw new Error("Unauthorized access");
  }

  await prisma.interviewSchedule.delete({
    where: { id },
  });

  return { id };
}

export async function updateInterviewStatus(
  interviewId: string,
  adminId: string,
  status: InterviewStatus
) {
  const interview = await prisma.interviewSchedule.findUnique({
    where: { id: interviewId },
    include: {
      job: {
        include: {
          company: {
            select: {
              adminId: true,
            },
          },
        },
      },
    },
  });

  if (!interview) {
    throw new Error("Interview not found");
  }

  if (interview.job.company.adminId !== adminId) {
    throw new Error("Not authorized to update this interview");
  }

  const updated = await prisma.interviewSchedule.update({
    where: { id: interviewId },
    data: { status },
  });

  return updated;
}
