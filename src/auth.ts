import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        login: { label: "Login", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const login = credentials?.login;
        const password = credentials?.password;

        if (typeof login !== "string" || typeof password !== "string") {
          return null;
        }

        const trimmedLogin = login.trim();
        if (!trimmedLogin || !password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { login: trimmedLogin },
        });

        if (!user) {
          return null;
        }

        const passwordOk = await compare(password, user.passwordHash);
        if (!passwordOk) {
          return null;
        }

        return {
          id: user.id,
          role: user.role,
          displayName: user.displayName,
          name: user.displayName,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role as Role;
        token.displayName = user.displayName;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // JWT also extends Record<string, unknown>; narrow custom claims explicitly.
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
  },
});
