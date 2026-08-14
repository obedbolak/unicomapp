// lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import type { UserRole } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
        maxAge: 30 * 24 * 60 * 60,
      },
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.trim().toLowerCase() },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            password: true,
            role: true,
            active: true,
            title: true,
            department: true,
          },
        });

        if (!user || !user.password) {
          throw new Error("No account found with this email");
        }
        if (!user.active) {
          throw new Error("This account has been deactivated");
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password,
        );
        if (!isValid) {
          throw new Error("Incorrect password");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
          title: user.title,
          department: user.department,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role as UserRole[];
        token.title = (user as any).title ?? null;
        token.department = (user as any).department ?? null;
      }

      // Refresh role from the DB when the client calls update()
      if (trigger === "update" && token.id) {
        const fresh = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, title: true, department: true, active: true },
        });
        if (fresh) {
          token.role = fresh.role;
          token.title = fresh.title;
          token.department = fresh.department;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole[]) ?? [];
        session.user.title = (token.title as string | null) ?? null;
        session.user.department = (token.department as any) ?? null;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};

/* ── Server-side helpers ──────────────────────────────────────────────────── */

export function getSession() {
  return getServerSession(authOptions);
}

export async function requireUser() {
  const session = await getSession();
  if (!session?.user?.id) return null;
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (!user || !user.role?.includes("ADMIN")) return null;
  return user;
}

export function isAdmin(role?: UserRole[] | null) {
  return !!role?.includes("ADMIN");
}
