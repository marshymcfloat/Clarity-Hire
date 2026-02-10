import { prisma } from "@/lib/prisma";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

// Access environment variables securely
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined in environment variables");
}

const google = createGoogleGenerativeAI({
  apiKey,
});

// Define the detailed schema for the match report
// This matches the UI component requirements
export const matchReportSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall match score 0-100"),
  executiveSummary: z
    .string()
    .describe("Client-facing executive summary of the candidate's fit"),
  skillsMatch: z.object({
    matched: z
      .array(z.string())
      .describe(
        "List of skills from the job description that the candidate possesses",
      ),
    missing: z
      .array(z.string())
      .describe(
        "List of skills from the job description that the candidate is missing",
      ),
    score: z.number().min(0).max(100).describe("0-100 score for skills match"),
  }),
  experienceMatch: z.object({
    score: z.number().min(0).max(100),
    summary: z.string().describe("Analysis of experience relevance"),
    relevantRoles: z
      .array(z.string())
      .describe("List of candidate's past roles that are relevant"),
  }),
  educationMatch: z.object({
    isMet: z.boolean().describe("Does candidate meet education requirements?"),
    details: z.string().describe("Details about education fit or gaps"),
  }),
  culturalFit: z.object({
    score: z.number().min(0).max(100),
    analysis: z
      .string()
      .describe("Inferred cultural fit based on resume tone and background"),
  }),
  salaryFit: z
    .object({
      analysis: z
        .string()
        .describe(
          "Analysis of salary expectations if mentioned, otherwise general market fit note",
        ),
    })
    .optional(),
  interviewQuestions: z
    .array(z.string())
    .describe("5 suggested interview questions"),
});

export type MatchReportResult = z.infer<typeof matchReportSchema>;

export interface MatchReportOptions {
  companyId?: string;
}

/**
 * Generates a match report for a candidate and a job using Gemini.
 * @param candidateId ID of the user (candidate)
 * @param jobId ID of the job
 */
export async function generateMatchReport(
  candidateId: string,
  jobId: string,
  options: MatchReportOptions = {},
) {
  try {
    // 1. Fetch validated application context (candidate + job + resume)
    const application = await prisma.application.findFirst({
      where: {
        userId: candidateId,
        jobId,
      },
      include: {
        User: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Resume: {
          include: {
            ParsedDocument: true,
          },
        },
        Job: {
          include: {
            Company: true,
          },
        },
      },
    });

    if (!application) {
      throw new Error("Candidate has not applied to this job");
    }

    if (options.companyId && application.Job.companyId !== options.companyId) {
      throw new Error("Unauthorized access to match report context");
    }

    if (!application.Resume?.ParsedDocument) {
      throw new Error("Candidate resume is not processed for analysis yet");
    }

    const resumeText = application.Resume.ParsedDocument.rawText;
    const job = application.Job;
    const jobDetails = `
      Title: ${job.title}
      Company: ${job.Company.name}
      Description: ${job.summary}
      Requirements: ${job.qualifications.join(", ")}
      Responsibilities: ${job.responsibilities.join(", ")}
      Skills: ${job.skills.join(", ")}
    `;

    // 2. Construct Prompt for Gemini
    const systemPrompt = `
      You are an expert technical recruiter. 
      Analyze the candidate's resume against the job description.
      Provide a structured object matching the schema.
      
      Score 0-100 based on:
      - Skills match (40%)
      - Experience relevance (30%)
      - Education (10%)
      - Overall fit (20%)

      Be strict but fair.
    `;

    const userPrompt = `
      JOB DETAILS:
      ${jobDetails}

      CANDIDATE RESUME:
      ${resumeText}
    `;

    // 3. Call Gemini
    const startTime = Date.now();
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: matchReportSchema,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.2,
    });

    const endTime = Date.now();
    const latency = endTime - startTime;
    const { object: report } = result;

    // 4. Save to Database
    // We map the detailed report to 'evidence' JSON field
    // We also populate legacy fields for easier querying if needed

    const matchRecord = await prisma.candidateJobMatch.upsert({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId,
        },
      },
      update: {
        matchScore: report.score,
        fitSummary: report.executiveSummary,
        pros: report.skillsMatch.matched.slice(0, 5), // Generic map
        cons: report.skillsMatch.missing.slice(0, 5),
        missingReqs: report.skillsMatch.missing,
        interviewKit: { questions: report.interviewQuestions },
        evidence: report as any, // Store full detailed report
        scoringVersion: "v2-detailed",
        updatedAt: new Date(),
      },
      create: {
        candidateId,
        jobId,
        matchScore: report.score,
        fitSummary: report.executiveSummary,
        pros: report.skillsMatch.matched.slice(0, 5),
        cons: report.skillsMatch.missing.slice(0, 5),
        missingReqs: report.skillsMatch.missing,
        interviewKit: { questions: report.interviewQuestions },
        evidence: report as any,
        scoringVersion: "v2-detailed",
      },
    });

    // 5. Log Metrics
    await prisma.rAGMetrics.create({
      data: {
        metricType: "LATENCY_MATCH_GENERATION_MS",
        metricValue: latency,
        metadata: {
          candidateId,
          jobId,
          matchId: matchRecord.id,
          applicationId: application.id,
        },
      },
    });

    if (result.usage) {
      const promptTokens = result.usage.inputTokens ?? 0;
      const completionTokens = result.usage.outputTokens ?? 0;

      // Approximate cost
      const inputCost = (promptTokens / 1_000_000) * 0.1;
      const outputCost = (completionTokens / 1_000_000) * 0.4;
      const totalCost = inputCost + outputCost;

      await prisma.rAGMetrics.create({
        data: {
          metricType: "LLM_GENERATION_COST_USD",
          metricValue: totalCost || 0,
          metadata: {
            candidateId,
            jobId,
            applicationId: application.id,
            model: "gemini-2.5-flash",
            inputTokens: promptTokens,
            outputTokens: completionTokens,
          },
        },
      });
    }

    // Return the detailed report object directly for the UI
    // The UI expects the schema structure, optionally augmented with DB metadata
    return {
      ...report,
      matchId: matchRecord.id,
      updatedAt: matchRecord.updatedAt,
    };
  } catch (error) {
    console.error("Error generating match report:", error);
    throw error;
  }
}
