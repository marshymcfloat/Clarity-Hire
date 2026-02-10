import { z } from "zod";

export const ExperienceLevelEnum = z.enum([
  "INTERNSHIP",
  "ENTRY_LEVEL",
  "ASSOCIATE",
  "MID_LEVEL",
  "SENIOR",
  "STAFF",
  "PRINCIPAL",
]);

export const JobStatusEnum = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const JobTypeEnum = z.enum([
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
]);

export const WorkArrangementEnum = z.enum(["ON_SITE", "HYBRID", "REMOTE"]);

const baseJobSchema = z.object({
  title: z
    .string()
    .min(3, { message: "Title should be at least 3 characters long" })
    .max(100, { message: "Title should not exceed 100 characters" }),
  summary: z
    .string()
    .min(10, { message: "Summary should be at least 10 characters long" })
    .max(1000, { message: "Summary should not exceed 1000 characters" }),
  department: z
    .string()
    .min(2, { message: "Department name should be at least 2 characters" }),
  experienceLevel: ExperienceLevelEnum,
  status: JobStatusEnum,
  jobType: JobTypeEnum,
  workArrangement: WorkArrangementEnum,
  location: z.string().min(2, { message: "Location is required" }),

  salaryMin: z.coerce.number().int().nonnegative().optional(),
  salaryMax: z.coerce.number().int().nonnegative().optional(),

  benefits: z.array(z.string()).optional(),
  qualifications: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  workSchedule: z.string().optional(),

  questions: z
    .array(
      z.object({
        questionId: z.string(),
        required: z.boolean(),
      }),
    )
    .optional(),
});

export const createJobSchema = baseJobSchema.refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  {
    message: "Minimum salary cannot exceed maximum salary",
    path: ["salaryMin"],
  },
);

export const updateJobSchema = baseJobSchema.partial().refine(
  (data) => {
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMin <= data.salaryMax;
    }
    return true;
  },
  {
    message: "Minimum salary cannot exceed maximum salary",
    path: ["salaryMin"],
  },
);

export type CreateJobValues = z.infer<typeof createJobSchema>;
export type UpdateJobValues = z.infer<typeof updateJobSchema>;
