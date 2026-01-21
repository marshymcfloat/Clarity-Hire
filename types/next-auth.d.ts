// next-auth.d.ts

import { TeamRole } from "@prisma/client";
import { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

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
      activeCompanyId: string;
      activeCompanySlug: string;
      activeCompanyRole: TeamRole;
      isRecruiter: boolean;
      memberId: string;
    } & DefaultSession["user"];
  }

  interface User {
    activeCompanyId: string;
    activeCompanySlug: string;
    activeCompanyRole: TeamRole;
    isRecruiter: boolean;
    memberId: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * The JWT token object that is created in the `jwt` callback.
   */
  interface JWT {
    id: string;
    activeCompanyId: string;
    activeCompanySlug: string;
    activeCompanyRole: TeamRole;
    isRecruiter: boolean;
    memberId: string;
  }
}
