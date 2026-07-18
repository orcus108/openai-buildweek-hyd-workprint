import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workprint | Find the story in your work",
  description: "A private story inbox for builders. Workprint finds moments worth sharing and grounds every claim in the work that made it true.",
  openGraph: {
    title: "Workprint",
    description: "You did enough today. Workprint found the moments worth sharing.",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
