import { z } from "zod";
import { passwordSchema } from "../common";

const DISALLOWED_PUBLIC_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "yahoo.com",
  "outlook.com",
  "hotmail.com",
  "icloud.com",
  "aol.com",
  "proton.me",
  "protonmail.com",
  "gmx.com",
]);

export const authLoginSchema = z.object({
  email: z
    .email({ message: "Please make sure to pass a valid email" })
    .min(1, { message: "Email is required" })
    .max(50, { message: "Email should not exceed of 50 characters" }),
  password: z
    .string({ message: "Please make sure to pass a valid string" })
    .min(1, { message: "Password is required" })
    .max(50, { message: "Password should not exceed 50 characters" }),
});

export const authRegisterSchema = z
  .object({
    email: z
      .email({ message: "Please make sure to pass a valid email" })
      .min(1, { message: "Email is required" })
      .max(50, { message: "Email should not exceed 50 characters" }),
    name: z
      .string({ message: "Please make sure to pass a valid string" })
      .min(1, { message: "Name is  required" })
      .max(100, { message: "Name should not exceed 100 characters" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Password don't match",
  });

export const companyCreationStageOneSchema = z
  .object({
    fullname: z
      .string()
      .min(1, { message: "Name is required" })
      .max(100, { message: "Name should not exceed 100 characters" }),
    workEmail: z
      .email()
      .min(1, { message: "Email is required" })
      .max(100, { message: "Email should not exceed 100 characters" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: "custom",
        message: "Password dont match",
        path: ["confirmPassword"],
      });
    }

    const domain = data.workEmail.split("@")[1]?.toLowerCase();
    if (!domain || DISALLOWED_PUBLIC_EMAIL_DOMAINS.has(domain)) {
      ctx.addIssue({
        code: "custom",
        message:
          "Please use a company domain email address (public email domains are not allowed).",
        path: ["workEmail"],
      });
    }
  });

export const companyCreationStageTwoSchema = z.object({
  companyName: z
    .string()
    .min(1, { message: "Company name is required" })
    .max(100, { message: "Company name should not exceed 100 characters" }),
  companySlug: z
    .string()
    .min(3, { message: "Slug must be at least 3 characters." })
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with words separated by dashes.",
    ),
  companySize: z.string().min(1, { message: "Please select a company size." }),
});

export type AuthLoginValues = z.infer<typeof authLoginSchema>;
export type AuthRegisterValues = z.infer<typeof authRegisterSchema>;
export type CompanyCreationStageOneValues = z.infer<
  typeof companyCreationStageOneSchema
>;
export type CompanyCreationStageTwoValues = z.infer<
  typeof companyCreationStageTwoSchema
>;
