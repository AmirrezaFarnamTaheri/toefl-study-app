import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "TOEFL iBT Adaptive Study & Exam Simulator",
  description: "Personal adaptive TOEFL Reading, Listening & Writing practice and ETS Exam Simulator",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
