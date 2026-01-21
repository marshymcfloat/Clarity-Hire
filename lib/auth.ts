import { prisma } from "@/prisma/prisma";
import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { TeamRole } from "@prisma/client";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const userExists = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            memberships: true,
          },
        });

        if (!userExists || !userExists.hashedPassword) {
          throw new Error(
            "No user found with this email and password combination.",
          );
        }

        const isCorrect = await compare(
          credentials.password,
          userExists.hashedPassword,
        );

        if (!isCorrect) {
          throw new Error("Incorrect password. Please try again.");
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return userExists as any;
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENTID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (existingUser) {
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            });
            if (!existingAccount) {
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              });
            }
          } else {
            const newUser = await prisma.user.create({
              data: { email: user.email, name: user.name, image: user.image },
            });
            await prisma.account.create({
              data: {
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            });
          }
          return true;
        } catch (error) {
          console.error("Error during Google signIn callback:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        const dbUserWithMembership = await prisma.user.findUnique({
          where: { email: user.email! },
          include: {
            memberships: {
              include: {
                company: {
                  select: { slug: true },
                },
              },
            },
          },
        });

        if (dbUserWithMembership) {
          token.id = dbUserWithMembership.id;

          const recruiterRoles: TeamRole[] = [
            TeamRole.ADMIN,
            TeamRole.RECRUITER,
            TeamRole.HIRING_MANAGER,
          ];

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const isRecruiter = dbUserWithMembership.memberships.some(
            (membership: any) => recruiterRoles.includes(membership.role),
          );

          token.isRecruiter = isRecruiter;
          if (dbUserWithMembership.memberships.length > 0) {
            const membership = dbUserWithMembership.memberships[0];
            token.activeCompanyId = membership.companyId;
            token.activeCompanyRole = membership.role;
            token.activeCompanySlug = membership.company.slug;
            token.memberId = membership.id;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.activeCompanyId = token.activeCompanyId;
        session.user.activeCompanyRole = token.activeCompanyRole;
        session.user.isRecruiter = token.isRecruiter;
        session.user.memberId = token.memberId;
        session.user.activeCompanySlug = token.activeCompanySlug;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
