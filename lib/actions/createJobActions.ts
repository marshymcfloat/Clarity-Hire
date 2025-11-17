"use server";
import { z } from "zod";
import { GoogleGenAI } from "@google/genai";
import { createJobSchema, CreateJobValues } from "../zod schemas/jobSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth";
import { prisma } from "@/prisma/prisma";
import { revalidatePath } from "next/cache";

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
  payload: GenerateSummaryPayload
) {
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

    console.log(values);

    if (!session?.user) {
      return { success: false, error: "Please Login First" };
    }

    const validationResult = createJobSchema.safeParse(values);

    if (!validationResult.success) {
      return { success: false, error: "Invalid Input" };
    }

    const { questions, ...jobData } = validationResult.data;

    await prisma.$transaction(async (tx) => {
      const createdJob = await tx.job.create({
        data: {
          ...jobData,
          status: "PUBLISHED",
          Company: {
            connect: {
              id: session.user.activeCompanyId,
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
  } catch (err) {
    console.error("There is an unexpected error occured");
    return { success: false, error: "There is an unexpected error occured" };
  }
}

export async function updateJobAction(payload: {
  id: string; // The ID of the job to update
  values: CreateJobValues;
}) {
  console.log("Updating job with ID:", payload.id);
  console.log("With data:", payload.values);
  await new Promise((res) => setTimeout(res, 1000));
  return { success: true, message: "Job updated successfully!" };
}
