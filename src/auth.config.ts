import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe Auth.js config (no Prisma). Used by `src/proxy.ts`.
 * Credentials + JWT callbacks live in `src/auth.ts`.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = pathname.startsWith("/login");

      if (isLoginPage) {
        if (isLoggedIn) {
          return Response.redirect(new URL("/", request.nextUrl));
        }
        return true;
      }

      // Protect student home and other app routes; unauthenticated → /login
      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
