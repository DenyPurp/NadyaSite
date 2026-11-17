import type { Metadata } from "next";
import { Suspense } from "react";
import { Alegreya, Manrope } from "next/font/google";
import { SeasonShell, SeasonShellFallback } from "@/components/season-shell";
import "./globals.css";

const alegreya = Alegreya({
  variable: "--font-display",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-body",
  subsets: ["cyrillic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Cozy English with Nadya",
  description: "Уютный кабинет английского: занятия, календарь и задания",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${alegreya.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Suspense fallback={<SeasonShellFallback>{children}</SeasonShellFallback>}>
          <SeasonShell>{children}</SeasonShell>
        </Suspense>
      </body>
    </html>
  );
}
