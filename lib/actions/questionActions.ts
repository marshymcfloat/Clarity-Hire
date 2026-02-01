// lib/actions/questionActions.ts

"use server";

import { getServerSession } from "next-auth";
import {
  createQuestionSchema,
  CreateQuestionValues,
} from "../zod schemas/questionSchema";
import { authOptions } from "../auth";
import { prisma } from "@/prisma/prisma";
import { QuestionTypeEnum } from "../generated/prisma/enums";

import { verifyCompanyAccess, JOB_MANAGEMENT_ROLES } from "../security";

export async function createNewQuestionAction(values: CreateQuestionValues) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session?.user ||
      !session.user.activeCompanyId ||
      !session.user.activeCompanySlug
    ) {
      return { success: false, error: "Please Login First" };
    }

    // Security Fix: Verify Access vs Database
    const accessCheck = await verifyCompanyAccess(
      session.user.id,
      session.user.activeCompanySlug,
      JOB_MANAGEMENT_ROLES,
    );

    if (!accessCheck.authorized || !accessCheck.company) {
      return { success: false, error: accessCheck.error || "Access Denied" };
    }

    const validationResult = createQuestionSchema.safeParse(values);

    if (!validationResult.success) {
      return { success: false, error: "Input Validation Error" };
    }

    const { options, question, type } = validationResult.data;
    const newQuestion = await prisma.question.create({
      data: {
        question,
        type: type as QuestionTypeEnum,
        options: options as string[],
        Company: {
          connect: {
            id: accessCheck.company.id, // Use verified ID
          },
        },
      },
    });

    if (!newQuestion) {
      return { success: false, error: "Creation Unsuccessful" };
    }

    return {
      success: true,
      data: newQuestion,
      message: "Created Successfully",
    };
  } catch (err) {
    console.error("There is an unexpected error occured", err);
    return { success: false, error: "There is an unexpected error occured" };
  }
}
