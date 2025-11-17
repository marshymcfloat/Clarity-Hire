"use server";

import { getServerSession } from "next-auth";
import { prisma } from "@/prisma/prisma";
import { authOptions } from "../auth";
import { createBackendApplicationSchema } from "../zod schemas/auth/jobApplicationSchemas";
import { put, del } from "@vercel/blob";

async function uploadResumeToBlobStore(
  file: File
): Promise<{ url: string; name: string }> {
  const uniqueFilename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;

  const blob = await put(uniqueFilename, file, {
    access: "public",
  });

  return { url: blob.url, name: file.name };
}

export async function SubmitApplicationAction(formData: FormData) {
  let uploadedBlobUrl: string | undefined;

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

    const newResumeFile = formData.get("newResumeFile");
    const existingResumeId = formData.get("resumeId");
    let finalResumeId: string;

    if (newResumeFile instanceof File) {
      const { url, name } = await uploadResumeToBlobStore(newResumeFile);
      uploadedBlobUrl = url;

      const newResume = await prisma.resume.create({
        data: { userId, url, name },
      });
      finalResumeId = newResume.id;
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
    if (!answersString)
      return { success: false, error: "Application answers are missing." };
    const answers = JSON.parse(answersString);

    const questionsOnJob = await prisma.questionOnJob.findMany({
      where: { jobId },
      include: { Question: true },
    });

    const backendSchema = createBackendApplicationSchema(questionsOnJob);
    const validationResult = backendSchema.safeParse({
      jobId,
      resumeId: finalResumeId,
      answers,
    });

    if (!validationResult.success) {
      console.error(
        "Backend Validation Error (Cleanup needed):",
        validationResult.error.format()
      );

      return { success: false, error: "Invalid application data." };
    }

    const { data: validatedData } = validationResult;

    await prisma.$transaction(async (tx) => {
      const application = await tx.application.create({
        data: {
          userId,
          jobId: validatedData.jobId,
          resumeId: validatedData.resumeId,
        },
      });
      const answerData = Object.entries(validatedData.answers).map(
        ([questionId, answerValue]) => ({
          applicationId: application.id,
          questionId,
          answer: Array.isArray(answerValue)
            ? answerValue
            : [String(answerValue)],
        })
      );
      await tx.applicationAnswer.createMany({ data: answerData });
    });

    uploadedBlobUrl = undefined;

    return { success: true, message: "Application submitted successfully!" };
  } catch (err) {
    console.error("SubmitApplicationAction Caught Error:", err);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  } finally {
    if (uploadedBlobUrl) {
      try {
        console.log(`Cleaning up unused blob: ${uploadedBlobUrl}`);
        await del(uploadedBlobUrl);
      } catch (cleanupError) {
        console.error("Failed to delete unused blob:", cleanupError);
      }
    }
  }
}
