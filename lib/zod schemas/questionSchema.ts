import z from "zod";

export const QuestionTypeEnum = {
  TEXT: "TEXT",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  NUMBER: "NUMBER",
  CHECKBOX: "CHECKBOX",
  TRUE_OR_FALSE: "TRUE_OR_FALSE",
} as const;

export type QuestionTypeEnum =
  (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];

export const createQuestionSchema = z.object({
  question: z
    .string()
    .min(6, { message: "Question should be at least 6 characters long" })
    .max(200, { message: "Question should not exceed 200 characters" }),
  type: z.enum([
    QuestionTypeEnum.CHECKBOX,
    QuestionTypeEnum.MULTIPLE_CHOICE,
    QuestionTypeEnum.NUMBER,
    QuestionTypeEnum.TEXT,
    QuestionTypeEnum.TRUE_OR_FALSE,
  ]),
  options: z.array(z.string()).optional(),
});

export type CreateQuestionValues = z.infer<typeof createQuestionSchema>;
