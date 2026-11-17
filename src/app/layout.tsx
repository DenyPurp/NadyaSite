import type { Metadata } from "next";
import { Alegreya, Manrope } from "next/font/google";
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
  title: "NadyaSite",
  description: "Учебный кабинет: вход и занятия",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ru"
      className={`${alegreya.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
