import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { PrototypeBanner } from "@/components/PrototypeBanner";

const openSans = Open_Sans({
  subsets: ["latin"],
  variable: "--font-open-sans",
});

export const metadata: Metadata = {
  title: "MinneAnalytics – Conference Planning Demo",
  description:
    "Twin Cities Big Data, Data Science and Analytics Community — prototype conference planning extension",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={openSans.variable}>
      <body className="min-h-screen font-sans flex flex-col">
        <PrototypeBanner />
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
