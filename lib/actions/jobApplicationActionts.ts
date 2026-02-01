"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/prisma";
import { authOptions } from "../auth";

import { createBackendApplicationSchema } from "../zod schemas/auth/jobApplicationSchemas";
import { put, del } from "@vercel/blob";

async function uploadResumeToBlobStore(
  file: File,
): Promise<{ url: string; name: string }> {
  const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  const blob = await put(uniqueFilename, file, {
    access: "public",
  });

  return { url: blob.url, name: file.name };
}

export async function SubmitApplicationAction(formData: FormData) {
  const uploadedBlobUrls: string[] = [];

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, error: "Authentication required." };
    }
    const userId = session.user.id;

    const jobId = formData.get("jobId") as string | null;
    if (!jobId) {
      return { success: false, error: "Job ID is missing." };
    }

    const existingApplication = await prisma.application.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId,
        },
      },
    });

    if (existingApplication) {
      return {
        success: false,
        error: "You have already applied for this job.",
      };
    }

    const newResumeFile = formData.get("newResumeFile");
    const existingResumeId = formData.get("resumeId");
    let finalResumeId: string;

    if (newResumeFile instanceof File) {
      const { url, name } = await uploadResumeToBlobStore(newResumeFile);
      uploadedBlobUrls.push(url); // Track for cleanup

      // Check for existing resume with same name for this user
      const existingResume = await prisma.resume.findFirst({
        where: {
          userId,
          name: name,
        },
      });

      if (existingResume) {
        // Update existing resume
        const updatedResume = await prisma.resume.update({
          where: { id: existingResume.id },
          data: { url },
        });
        finalResumeId = updatedResume.id;
      } else {
        // Create new resume
        const newResume = await prisma.resume.create({
          data: { userId, url, name },
        });
        finalResumeId = newResume.id;
      }
    } else if (typeof existingResumeId === "string") {
      const resume = await prisma.resume.findFirst({
        where: { id: existingResumeId, userId },
      });
      if (!resume) return { success: false, error: "Invalid resume selected." };
      finalResumeId = resume.id;
    } else {
      return { success: false, error: "A resume is required." };
    }

    const answersString = formData.get("answers") as string | null;
    const coverLetterRaw = formData.get("coverLetter");
    const coverLetter =
      typeof coverLetterRaw === "string" ? coverLetterRaw : undefined;
    const attachments = formData.getAll("attachments") as File[];

    if (!answersString)
      return { success: false, error: "Application answers are missing." };
    const answers: Record<string, string | string[]> =
      JSON.parse(answersString);

    const questionsOnJob = await prisma.questionOnJob.findMany({
      where: { jobId },
      include: { Question: true },
    });

    const backendSchema = createBackendApplicationSchema(questionsOnJob);
    const validationResult = backendSchema.safeParse({
      jobId,
      resumeId: finalResumeId,

      answers,
      coverLetter,
      attachmentUrls: [], // Placeholder, will be filled after upload
    });

    if (!validationResult.success) {
      console.error(
        "Backend Validation Error:",
        validationResult.error.format(),
      );
      throw new Error("Invalid application data."); // Throw to trigger cleanup
    }

    const { data: validatedData } = validationResult;

    // Upload attachments if any
    const attachmentUrls: string[] = [];
    if (attachments && attachments.length > 0) {
      const uploadPromises = attachments.map(async (file) => {
        const { url } = await uploadResumeToBlobStore(file);
        return url;
      });

      // Wait for all uploads
      const results = await Promise.all(uploadPromises);

      // Push to tracking array immediately
      results.forEach((url) => {
        attachmentUrls.push(url);
        uploadedBlobUrls.push(url);
      });
    }

    await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          userId,
          jobId: validatedData.jobId,
          resumeId: validatedData.resumeId,
          coverLetter: validatedData.coverLetter,
          attachmentUrls: attachmentUrls,
        },
      });
      const answerData = Object.entries(validatedData.answers).map(
        ([questionId, answerValue]) => ({
          applicationId: application.id,
          questionId,
          answer: Array.isArray(answerValue)
            ? answerValue
            : [String(answerValue)],
        }),
      );
      await tx.applicationAnswer.createMany({ data: answerData });
    });

    // Success! No cleanup needed.
    return { success: true, message: "Application submitted successfully!" };
  } catch (err: unknown) {
    console.error("SubmitApplicationAction Caught Error:", err);

    // Cleanup: Delete everyone we uploaded in this attempt
    if (uploadedBlobUrls.length > 0) {
      console.log(`Rolling back ${uploadedBlobUrls.length} file(s)...`);
      await Promise.allSettled(uploadedBlobUrls.map((url) => del(url)));
    }

    const errorMessage =
      err instanceof Error && err.message === "Invalid application data."
        ? "Please check your input and try again."
        : "An unexpected error occurred. Please try again.";

    return {
      success: false,
      error: errorMessage,
    };
  }
}
