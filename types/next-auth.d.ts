// next-auth.d.ts

import { TeamRole, UserRole } from "@/lib/generated/prisma/client";
import { DefaultSession } from "next-auth";

/**
 * This module declaration extends the built-in NextAuth types.
 */

declare module "next-auth" {
  /**
   * The Session object returned by `useSession`, `getSession`, `getServerSession`, etc.
   */
  interface Session {
    user: {
      id: string;
      activeCompanyId?: string;
      activeCompanySlug?: string;
      activeCompanyRole?: TeamRole;
      isRecruiter: boolean;
      memberId?: string;
      role: UserRole;
      isPlatformAdmin: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    activeCompanyId?: string;
    activeCompanySlug?: string;
    activeCompanyRole?: TeamRole;
    isRecruiter: boolean;
    memberId?: string;
    role: UserRole;
    isPlatformAdmin: boolean;
  }
}

declare module "next-auth/jwt" {
  /**
   * The JWT token object that is created in the `jwt` callback.
   */
  interface JWT {
    id: string;
    activeCompanyId?: string;
    activeCompanySlug?: string;
    activeCompanyRole?: TeamRole;
    isRecruiter: boolean;
    memberId?: string;
    role: UserRole;
    isPlatformAdmin: boolean;
  }
}
