import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Island Habits",
  description: "A cozy 30-day habit tracking game",
  manifest: "/manifest.json",
  themeColor: "#4ECDC4",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Island Habits",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
