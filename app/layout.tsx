import type { Metadata } from "next";
import "./globals.css";
import { Vazirmatn } from "next/font/google";
import { cn } from "@/lib/utils";

const vazirmatn = Vazirmatn({
  subsets: ["arabic"],
  variable: "--font-vazirmatn-variable",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hasti`s World",
  description: "Find the auther ...",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fa"
      dir="rtl"
      className={cn("h-full", "antialiased", vazirmatn.variable)}
    >
      <body className="min-h-full font-vazirmatn flex flex-col">
        {children}
      </body>
    </html>
  );
}
