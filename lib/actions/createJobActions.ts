"use server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import {
  createJobSchema,
  CreateJobValues,
  updateJobSchema,
} from "../zod schemas/jobSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@/prisma/prisma";
import { revalidatePath } from "next/cache";
import {
  checkRateLimit,
  verifyCompanyAccess,
  JOB_MANAGEMENT_ROLES,
} from "../security";

export type GenerateSummaryPayload = {
  jobTitle: string;
  department?: string;
  experienceLevel?: string;
  jobType?: string;
  location?: string;
  skills?: string[];
};

export type GenerateListPayload = {
  fieldName: "qualifications" | "responsibilities";
  jobTitle: string;
  summary?: string; // The crucial new piece of context
  department?: string;
  experienceLevel?: string;
  jobType?: string;
};

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateJobDescriptionField(
  payload: GenerateSummaryPayload,
) {
  const session = await getServerSession(authOptions);

  // 1. Auth Check (Basic) - Rate limiting is tied to user ID
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Rate Limiting (Phase 1 Security)
  const isAllowed = checkRateLimit(`ai-gen-${session.user.id}`, 5, 60); // 5 request per minute
  if (!isAllowed) {
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
    };
  }

  const { jobTitle, department, experienceLevel, jobType, location, skills } =
    payload;

  if (!jobTitle) {
    return { success: false, error: "Job title is required." };
  }

  const prompt = `
    Generate a professional and concise job summary for the following role.

    **Job Context:**
    - **Title:** "${jobTitle}"
    ${department ? `- **Department:** "${department}"` : ""}
    ${experienceLevel ? `- **Experience Level:** "${experienceLevel}"` : ""}
    ${jobType ? `- **Job Type:** "${jobType}"` : ""}
    ${location ? `- **Location:** "${location}"` : ""}
    ${
      skills && skills.length > 0
        ? `- **Key Skills:** "${skills.join(", ")}"`
        : ""
    }

    **Instructions:**
    - The output must be a single, well-written paragraph.
    - The tone should be professional and engaging for potential candidates.
    - Do NOT include any headings, titles, bullet points, or lists.
    - Write only the text for the job summary itself.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 5000,
        temperature: 1,
      },
    });
    const text = result.text;
    return { success: true, text };
  } catch (error) {
    console.error("Server Action Error (generateJobDescriptionField):", error);
    return { success: false, error: "Failed to generate content." };
  }
}

export async function generateJobDescriptionList(payload: GenerateListPayload) {
  const session = await getServerSession(authOptions);

  // 1. Auth Check
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  // 2. Rate Limiting
  const isAllowed = checkRateLimit(`ai-gen-list-${session.user.id}`, 5, 60);
  if (!isAllowed) {
    return {
      success: false,
      error: "Rate limit exceeded. Please try again later.",
    };
  }

  const { fieldName, jobTitle, summary, experienceLevel, jobType } = payload;

  if (!jobTitle) {
    return { success: false, error: "Job title is required." };
  }

  const prompt = `
    You are an expert HR recruitment assistant. Your task is to generate a list of key ${fieldName} for a job posting.

    **Job Details:**
    - **Title:** "${jobTitle}"
    ${experienceLevel ? `- **Experience Level:** "${experienceLevel}"` : ""}
    ${jobType ? `- **Job Type:** "${jobType}"` : ""}
    ${
      summary
        ? `
    **Job Summary for Context:**
    "${summary}"
    `
        : ""
    }

    **Instructions:**
    1.  Based on all the provided context, generate a list of 5 to 7 key ${fieldName}.
    2.  Each item in the list must be a concise, clear, and professional sentence.
    3.  **The output MUST be a raw JSON array of strings.** For example: ["First item.", "Second item."].
    4.  Do NOT include any other text, comments, or markdown code fences like \`\`\`json.
  `;

  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        maxOutputTokens: 5000,
        temperature: 1,
      },
    });
    const responseText = result.text;

    if (!responseText) {
      return {
        success: false,
        error:
          "Failed to generate list. The AI may be unavailable or returned an invalid format.",
      };
    }
    const cleanedJsonText = responseText
      .replace(/^```json\s*|```$/g, "")
      .trim();
    const parsedList = JSON.parse(cleanedJsonText);

    const listSchema = z.array(z.string());
    const validationResult = listSchema.safeParse(parsedList);

    if (!validationResult.success) {
      throw new Error("AI returned data in an unexpected format.");
    }

    return { success: true, list: validationResult.data };
  } catch (error) {
    console.error("Server Action Error (generateJobDescriptionList):", error);
    return {
      success: false,
      error:
        "Failed to generate list. The AI may be unavailable or returned an invalid format.",
    };
  }
}

type createJobActionPayload = CreateJobValues & {
  companySlug: string;
  memberId: string;
};

export async function createJobAction(values: createJobActionPayload) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: "Please Login First" };
    }

    const validationResult = createJobSchema.safeParse(values);

    if (!validationResult.success) {
      return { success: false, error: "Invalid Input" };
    }

    // Phase 1 Security: Verify DB Access (Avoid Stale Session)
    const accessCheck = await verifyCompanyAccess(
      session.user.id,
      values.companySlug,
      JOB_MANAGEMENT_ROLES,
    );

    if (!accessCheck.authorized || !accessCheck.company) {
      return { success: false, error: accessCheck.error || "Access Denied" };
    }

    const { questions, ...jobData } = validationResult.data;

    await prisma.$transaction(async (tx) => {
      const createdJob = await tx.job.create({
        data: {
          ...jobData,
          status: "PUBLISHED",
          Company: {
            connect: {
              id: accessCheck.company.id, // Use verified ID from DB
            },
          },
        },
      });

      if (questions && questions.length > 0) {
        const questionsForJob = questions.map((ques) => ({
          jobId: createdJob.id,
          questionId: ques.questionId,
          isRequired: ques.required,
        }));

        await tx.questionOnJob.createMany({ data: questionsForJob });
      }

      return createdJob;
    });

    revalidatePath(`/${values.companySlug}/${values.memberId}/manage-jobs`);
    return { success: true, message: "Created Job Successfully" };
  } catch {
    console.error("There is an unexpected error occured");
    return { success: false, error: "There is an unexpected error occured" };
  }
}

type UpdateJobActionPayload = {
  id: string;
  values: CreateJobValues & {
    companySlug: string;
    memberId: string;
  };
};

export async function updateJobAction(payload: UpdateJobActionPayload) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return { success: false, error: "Please Login First" };
    }

    const validationResult = updateJobSchema.safeParse(payload.values);

    if (!validationResult.success) {
      return {
        success: false,
        error: validationResult.error.message || "Validation error",
      };
    }

    // Phase 1 Security: Verify DB Access
    const accessCheck = await verifyCompanyAccess(
      session.user.id,
      payload.values.companySlug,
      JOB_MANAGEMENT_ROLES,
    );

    if (!accessCheck.authorized) {
      return { success: false, error: accessCheck.error || "Access Denied" };
    }

    const { questions, ...jobData } = validationResult.data;

    await prisma.$transaction(async (tx) => {
      // Ensure the job actually belongs to the company we authorized
      const existingJob = await tx.job.findFirst({
        where: {
          id: payload.id,
          companyId: accessCheck.company!.id, // Verify ownership
        },
      });

      if (!existingJob) {
        throw new Error("Job not found or access denied.");
      }

      await tx.job.update({
        data: { ...jobData },
        where: { id: payload.id },
      });

      if (questions) {
        await tx.questionOnJob.deleteMany({
          where: { jobId: payload.id },
        });

        if (questions.length > 0) {
          await tx.questionOnJob.createMany({
            data: questions.map((quest, index) => ({
              jobId: payload.id,
              questionId: quest.questionId,
              isRequired: quest.required,
              order: index,
            })),
          });
        }
      }
    });

    revalidatePath(
      `/${payload.values.companySlug}/${payload.values.memberId}/manage-jobs`,
    );
    return { success: true, message: "Job updated successfully!" };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      err.message === "Job not found or access denied."
    ) {
      return {
        success: false,
        error: "Job does not exist or you do not have permission.",
      };
    }
    console.error("Unexpected error:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}
