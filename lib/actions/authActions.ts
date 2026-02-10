"use server";

import {
  authRegisterSchema,
  AuthRegisterValues,
  companyCreationStageOneSchema,
  CompanyCreationStageOneValues,
  companyCreationStageTwoSchema,
  CompanyCreationStageTwoValues,
} from "../zod schemas/auth/authSchemas";
import bcrypt, { hash } from "bcryptjs";
import { CompanySize } from "@/lib/generated/prisma/enums";
import { formatToTitleCase } from "../utils";
import { prisma } from "@/prisma/prisma";

// Local types removed, imported from prisma.ts

export async function authRegisterAction(values: AuthRegisterValues) {
  try {
    const validationResult = authRegisterSchema.safeParse(values);

    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation Error",
      };
    }

    const { email, name, password } = validationResult.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return { success: false, error: "User with this email already exists." };
    }

    const hashedPassword = await hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        email,
        name,

        hashedPassword: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { hashedPassword: _hashedPassword, ...user } = newUser;

    return {
      success: true,
      message: "User Created Successfully!",
      data: user,
    };
  } catch (err) {
    console.error("An unexpected error occured in authRegisterAction:", err);
    return { success: false, error: "An unexpected error occured" };
  }
}

type SlugCheckResponse = {
  success: boolean;
  error?: string;
  suggestions?: string[];
};

export async function checkCompanySlug(
  slug: string,
): Promise<SlugCheckResponse> {
  if (!slug || slug.trim().length === 0) {
    return { success: false, error: "Slug cannot be empty." };
  }

  try {
    const isExisted = await prisma.company.findUnique({ where: { slug } });

    if (!isExisted) {
      return { success: true };
    }

    const potentialSlugs = Array.from(
      { length: 3 },
      (_, i) => `${slug}-${i + 1}`,
    );

    const existingSuggestions = await prisma.company.findMany({
      where: {
        slug: {
          in: potentialSlugs,
        },
      },
      select: {
        slug: true,
      },
    });

    const takenSlugs = new Set(
      existingSuggestions.map((s: { slug: string }) => s.slug),
    );

    const availableSuggestions = potentialSlugs.filter(
      (s) => !takenSlugs.has(s),
    );

    return {
      success: false,
      error: "This slug is already taken.",
      suggestions: availableSuggestions,
    };
  } catch (err) {
    console.error("Error in checkCompanySlug:", err);
    return { success: false, error: "An unexpected error occurred." };
  }
}

type CreateCompanyResponse = {
  success: boolean;
  error?: string;
  company?: { slug: string };
};

export async function createCompanyAndUserAction(
  form1Values: CompanyCreationStageOneValues,
  form2Values: CompanyCreationStageTwoValues,
): Promise<CreateCompanyResponse> {
  const fullSchema = companyCreationStageOneSchema.merge(
    companyCreationStageTwoSchema,
  );
  const validationResult = fullSchema.safeParse({
    ...form1Values,
    ...form2Values,
  });

  if (!validationResult.success) {
    console.error("Server-side validation failed:", validationResult.error);
    return { success: false, error: "Invalid form data provided." };
  }

  const { data } = validationResult;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.workEmail },
    });
    if (existingUser) {
      return {
        success: false,
        error: "A user with this email already exists.",
      };
    }

    const existingCompany = await prisma.company.findUnique({
      where: { slug: data.companySlug },
    });
    if (existingCompany) {
      return { success: false, error: "This company slug is already taken." };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const formattedFullName = formatToTitleCase(data.fullname);
    const formattedCompanyName = formatToTitleCase(data.companyName);

    const newCompany = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: formattedFullName,
          email: data.workEmail,
          hashedPassword: hashedPassword,
        },
      });

      const company = await tx.company.create({
        data: {
          name: formattedCompanyName,
          slug: data.companySlug,
          ownerId: newUser.id,
          verificationStatus: "PENDING",
          verificationRequestedAt: new Date(),
          billingStatus: "NONE",
          activePublishedJobsLimit: 1,
          companySize: data.companySize as CompanySize,
          description: "",
          location: "",
        },
      });

      await tx.companyMember.create({
        data: {
          userId: newUser.id,
          companyId: company.id,
          role: "ADMIN",
        },
      });

      return company;
    });

    return { success: true, company: { slug: newCompany.slug } };
  } catch (err) {
    console.error("Error in createCompanyAndUserAction:", err);
    return {
      success: false,
      error:
        "An unexpected error occurred while creating your company. Please try again.",
    };
  }
}
