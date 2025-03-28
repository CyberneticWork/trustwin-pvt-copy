import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ChildRender from "@/components/main/ChildHandling";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "TrustWin | Loan Management System",
  description: "We provide best financial solutions and services to the customers through building strong relationships as a trusted friend to enhancing their quality of life.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
      <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ChildRender>{children}</ChildRender>
      </body>
    </html>
  );
}
