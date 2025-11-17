import type { Metadata } from "next";
import { Geist,  } from 'next/font/google';
import "./globals.css";

const geistSans = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Simulingo Dashboard",
  description: "Learning Management System Admin Panel",
};

export const viewport = {
  themeColor: "#ffffff",
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} bg-background text-foreground`}>
        {children}
      </body>
    </html>
  );
}
