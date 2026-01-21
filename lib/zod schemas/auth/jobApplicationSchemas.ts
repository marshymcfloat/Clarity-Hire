import { Question, QuestionOnJob, QuestionTypeEnum } from "@prisma/client";
import { z } from "zod";

type QuestionOnJobWithQuestion = QuestionOnJob & {
  Question: Question;
};

const generateAnswersSchema = (questions: QuestionOnJobWithQuestion[]) => {
  const shape = questions.reduce(
    (acc, q) => {
      const { Question: question, isRequired } = q;

      switch (question.type) {
        case QuestionTypeEnum.TEXT: {
          let validator = z.string();
          if (isRequired)
            validator = validator.min(1, "This field is required.");
          acc[question.id] = validator;
          break;
        }
        case QuestionTypeEnum.NUMBER: {
          const numberSchema = z.coerce.number();
          if (isRequired) {
            acc[question.id] = numberSchema;
          } else {
            acc[question.id] = z.preprocess(
              (val) => (val === "" ? undefined : val),
              numberSchema.optional(),
            );
          }
          break;
        }
        case QuestionTypeEnum.TRUE_OR_FALSE:
        case QuestionTypeEnum.MULTIPLE_CHOICE: {
          let validator = z.string();
          if (isRequired)
            validator = validator.min(1, "Please make a selection.");
          acc[question.id] = validator;
          break;
        }
        case QuestionTypeEnum.CHECKBOX: {
          let validator = z.array(z.string());
          if (isRequired)
            validator = validator.nonempty(
              "Please select at least one option.",
            );
          acc[question.id] = validator;
          break;
        }
        default:
          acc[question.id] = z.any();
      }
      return acc;
    },
    {} as Record<string, z.ZodTypeAny>,
  );

  return z.object(shape);
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const createApplicationSchema = (
  questions: QuestionOnJobWithQuestion[],
) => {
  return z
    .object({
      resumeSelection: z.enum(["select", "upload"]),
      resumeId: z.string().optional(),
      newResumeFile: z
        .any()
        .optional()
        .refine(
          (file) => !file || file?.size <= MAX_FILE_SIZE,
          `Max file size is 5MB.`,
        )
        .refine(
          (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type),
          "Only .pdf, .doc, and .docx formats are supported.",
        ),
      answers: generateAnswersSchema(questions),
      coverLetter: z.string().optional(),
      attachments: z
        .any()
        .optional()
        .refine((files) => {
          if (!files || files.length === 0) return true;
          return Array.from(files).every(
            (file: any) => file.size <= MAX_FILE_SIZE,
          );
        }, `Max file size is 5MB per file.`)
        .refine((files) => {
          if (!files || files.length === 0) return true;
          return Array.from(files).every((file: any) =>
            ACCEPTED_FILE_TYPES.includes(file.type),
          );
        }, "Only .pdf, .doc, and .docx formats are supported."),
    })
    .superRefine((data, ctx) => {
      if (data.resumeSelection === "select" && !data.resumeId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please select a resume.",
          path: ["resumeId"],
        });
      }
      if (data.resumeSelection === "upload" && !data.newResumeFile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Please upload a resume file.",
          path: ["newResumeFile"],
        });
      }
    });
};

export const createBackendApplicationSchema = (
  questions: QuestionOnJobWithQuestion[],
) => {
  return z.object({
    jobId: z.string().cuid({ message: "Invalid Job ID format." }),
    resumeId: z.string().cuid({ message: "Invalid Resume ID format." }),
    answers: generateAnswersSchema(questions),
    coverLetter: z.string().optional(),
    attachmentUrls: z.array(z.string()).optional(),
  });
};
