// Define enums locally to avoid importing from @prisma/client in client-side code
export const ApplicationStatus = {
  SUBMITTED: "SUBMITTED",
  IN_REVIEW: "IN_REVIEW",
  INTERVIEWING: "INTERVIEWING",
  OFFERED: "OFFERED",
  REJECTED: "REJECTED",
  WITHDRAWN: "WITHDRAWN",
  HIRED: "HIRED",
} as const;
export type ApplicationStatus =
  (typeof ApplicationStatus)[keyof typeof ApplicationStatus];

export const ExperienceLevel = {
  INTERNSHIP: "INTERNSHIP",
  ENTRY_LEVEL: "ENTRY_LEVEL",
  ASSOCIATE: "ASSOCIATE",
  MID_LEVEL: "MID_LEVEL",
  SENIOR: "SENIOR",
  STAFF: "STAFF",
  PRINCIPAL: "PRINCIPAL",
} as const;
export type ExperienceLevel =
  (typeof ExperienceLevel)[keyof typeof ExperienceLevel];

export const JobStatus = {
  DRAFT: "DRAFT",
  PENDING_REVIEW: "PENDING_REVIEW",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
  ARCHIVED: "ARCHIVED",
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const JobType = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  INTERNSHIP: "INTERNSHIP",
} as const;
export type JobType = (typeof JobType)[keyof typeof JobType];

export const QuestionTypeEnum = {
  TEXT: "TEXT",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  NUMBER: "NUMBER",
  CHECKBOX: "CHECKBOX",
  TRUE_OR_FALSE: "TRUE_OR_FALSE",
} as const;
export type QuestionTypeEnum =
  (typeof QuestionTypeEnum)[keyof typeof QuestionTypeEnum];

export const WorkArrangement = {
  ON_SITE: "ON_SITE",
  HYBRID: "HYBRID",
  REMOTE: "REMOTE",
} as const;
export type WorkArrangement =
  (typeof WorkArrangement)[keyof typeof WorkArrangement];

let companyId = 1;
let jobId = 1000;
let questionId = 2000;

export const dummyCompanies = [
  {
    id: companyId++,
    name: "BeautyFeel",
    description:
      "BeautyFeel is a aesthetic company from Puerto Princesa City, Philippines that provides confidence to their clients",
    slug: "beautyfeel",
  },
];

export type QuestionType = {
  id: number;
  question: string;
  options?: string[];
  type: string;
};

export type ExperienceLevelEnum = "ENTRY" | "MID_LEVEL" | "SENIOR" | "MANAGER";
export type JobTypeEnum = "FULLTIME" | "PARTTIME" | "CONTRACTUAL";

export type DummyJobsType = {
  id: number;
  title: string;
  summary: string;
  qualification: string[];
  responsibilities: string[];
  minSalary?: number;
  maxSalary?: number;
  questions: QuestionType[];
  location: string;
  experienceLevel: ExperienceLevelEnum;
  jobType: JobTypeEnum;
};

export const dummyJobs: DummyJobsType[] = [
  {
    id: jobId++,
    title: "Junior Web Developer",
    summary:
      "We seek motivated and talented Junior Software Developers to join our growing team. As a Junior Software Developer at MCSV Inc., you will have the opportunity to work on exciting projects, collaborate with experienced developers, and contribute to the development of software solutions that make a real impact.",
    qualification: [
      "Bachelor's degree in Computer Science, Information Technology, Software Engineering, or a related field (or equivalent experience).",

      "Strong knowledge of programming languages such as C#, Java, Python, C++, or JavaScript.",

      "Excellent problem-solving and critical-thinking skills.",

      "Strong communication and teamwork skills.",

      "Eagerness to learn and adapt to new technologies.",
      "Fresh graduates are welcome to apply.",
    ],

    responsibilities: [
      "Collaborate with senior developers to design, develop, test, and maintain software applications.",
      "Write clean, efficient, and maintainable code.",
      "Assist in troubleshooting and debugging software issues.",

      "Participate in code reviews to ensure code quality and best practices.",

      "Stay up-to-date with the latest industry trends and technologies.",
      "Contribute ideas and innovations to improve our products and processes.",
    ],
    minSalary: 30000,
    maxSalary: 45000,
    questions: [
      {
        id: questionId++,
        question: "Tell me something about yourself",
        type: "TEXT",
        options: [],
      },
      {
        id: questionId++,
        question: "What is your expected salary?",
        options: [],
        type: "NUMBER",
      },
      {
        id: questionId++,
        question: "What tehcnology do you use?",
        type: "CHECKBOX",
        options: ["ReactJS", "NEXTJS", "REDUX"],
      },
    ],
    location: "Makati City, Philippines",
    experienceLevel: "ENTRY",
    jobType: "FULLTIME",
  },
];

// lib/constants.ts (or a similar location)

/**
 * Maps ApplicationStatus enum to human-readable strings.
 */
export const APPLICATION_STATUS_MAP: Record<ApplicationStatus, string> = {
  [ApplicationStatus.SUBMITTED]: "Submitted",
  [ApplicationStatus.IN_REVIEW]: "In Review",
  [ApplicationStatus.INTERVIEWING]: "Interviewing",
  [ApplicationStatus.OFFERED]: "Offer Extended",
  [ApplicationStatus.REJECTED]: "Rejected",
  [ApplicationStatus.WITHDRAWN]: "Withdrawn",
  [ApplicationStatus.HIRED]: "Hired",
};

/**
 * Maps ExperienceLevel enum to human-readable strings.
 */
export const EXPERIENCE_LEVEL_MAP: Record<ExperienceLevel, string> = {
  [ExperienceLevel.INTERNSHIP]: "Internship",
  [ExperienceLevel.ENTRY_LEVEL]: "Entry Level",
  [ExperienceLevel.ASSOCIATE]: "Associate",
  [ExperienceLevel.MID_LEVEL]: "Mid-level / Intermediate",
  [ExperienceLevel.SENIOR]: "Senior Level",
  [ExperienceLevel.STAFF]: "Staff Level",
  [ExperienceLevel.PRINCIPAL]: "Principal Level",
};

/**
 * Maps JobType enum to human-readable strings.
 */
export const JOB_TYPE_MAP: Record<JobType, string> = {
  [JobType.FULL_TIME]: "Full-time",
  [JobType.PART_TIME]: "Part-time",
  [JobType.CONTRACT]: "Contract",
  [JobType.INTERNSHIP]: "Internship",
};

/**
 * Maps QuestionTypeEnum to human-readable strings.
 */
export const QUESTION_TYPE_MAP: Record<QuestionTypeEnum, string> = {
  [QuestionTypeEnum.TEXT]: "Text Input",
  [QuestionTypeEnum.MULTIPLE_CHOICE]: "Multiple Choice",
  [QuestionTypeEnum.NUMBER]: "Number Input",
  [QuestionTypeEnum.CHECKBOX]: "Checkbox (Select multiple)",
  [QuestionTypeEnum.TRUE_OR_FALSE]: "True / False",
};

/**
 * Maps UserRoleEnum to human-readable strings.
 */

/**
 * Maps WorkArrangement enum to human-readable strings.
 */
export const WORK_ARRANGEMENT_MAP: Record<WorkArrangement, string> = {
  [WorkArrangement.ON_SITE]: "On-site",
  [WorkArrangement.HYBRID]: "Hybrid",
  [WorkArrangement.REMOTE]: "Remote",
};

export const JOB_STATUS_MAP: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PENDING_REVIEW: "Pending Review",
  PUBLISHED: "Published",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

export const departments = [
  "Information Technology",
  "Marketing",
  "Finance",
  "Human Resources",
  "Operations",
  "Research and Development",
  "Sales",
  "Procurement",
  "Customer Service",
  "Legal and Compliance",
];
