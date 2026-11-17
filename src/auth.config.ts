import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

/**
 * Edge-safe Auth.js config (no Prisma). Used by `src/proxy.ts`.
 * Credentials + password check live in `src/auth.ts`.
 * Session/jwt here map custom claims so middleware can read `role`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
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
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
        session.user.displayName = token.displayName as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = pathname.startsWith("/login");
      const isAdmin = pathname.startsWith("/admin");
      const role = auth?.user?.role;

      if (isLoginPage) {
        if (isLoggedIn) {
          const dest = role === "TEACHER" ? "/admin" : "/";
          return Response.redirect(new URL(dest, request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return false;
      }

      if (isAdmin && role !== "TEACHER") {
        return Response.redirect(new URL("/", request.nextUrl));
      }

      if (!isAdmin && pathname === "/" && role === "TEACHER") {
        return Response.redirect(new URL("/admin", request.nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
