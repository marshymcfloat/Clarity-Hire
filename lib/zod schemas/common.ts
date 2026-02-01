import { z } from "zod";

export const passwordSchema = z
  .string({ message: "Please make sure to pass a valid string" })
  .min(6, { message: "Password should be at least 6 characters long" })
  .max(50, { message: "Password should not exceed 50 characters" })
  .regex(/[a-z]/, {
    message: "Password should have at least one lowercase character",
  })
  .regex(/[A-Z]/, {
    message: "Password should have at least one uppercase character",
  })
  .regex(/[0-9]/, {
    message: "Password should have at least one number character",
  })
  .regex(/[^a-zA-Z0-9]/, {
    message: "Password should have at least one special character",
  });

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const fileSchema = z
  .any()
  .refine(
    (file) => !file || file?.size <= MAX_FILE_SIZE,
    `Max file size is 5MB.`,
  )
  .refine(
    (file) => !file || ACCEPTED_FILE_TYPES.includes(file?.type),
    "Only .pdf, .doc, and .docx formats are supported.",
  );
