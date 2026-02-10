import { generateMatchReport } from "@/lib/rag/match-report";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  candidateId: z.string(),
  jobId: z.string(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { candidateId, jobId } = requestSchema.parse(body);

    const matchReport = await generateMatchReport(candidateId, jobId);

    return NextResponse.json(matchReport);
  } catch (error) {
    console.error("Error in match report generation:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request body", details: error.message },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
