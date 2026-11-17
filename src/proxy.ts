import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

/**
 * Next.js 16 proxy (formerly middleware): protect app routes via Auth.js.
 * Edge-safe — uses auth.config only (no Prisma).
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
