"use server";

import { getServerSession } from "next-auth";
import {
  createQuestionSchema,
  CreateQuestionValues,
} from "../zod schemas/questionSchema";
import { authOptions } from "../auth";
import { prisma } from "@/prisma/prisma";
import { QuestionTypeEnum } from "@prisma/client";

export async function createNewQuestionAction(values: CreateQuestionValues) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !session.user.activeCompanyId) {
      return { success: false, error: "Please Login First" };
    }

    const { activeCompanyId } = session.user;

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
            id: activeCompanyId,
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
