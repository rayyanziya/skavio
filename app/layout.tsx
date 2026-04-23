import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Skavio — Website Security Scanner",
  description:
    "Scan any website for security vulnerabilities in 30 seconds. Get a full security report with AI-powered fix suggestions.",
  openGraph: {
    title: "Skavio — Website Security Scanner",
    description: "Paste a URL. Get a full security autopsy in 30 seconds.",
    siteName: "Skavio",
  },
  icons: {
    icon: "/Skavio.png",
    apple: "/Skavio.png",
  },
  verification: {
    google: "EYBN1eaYEQqCFGALQLfFhU89dpKNmvu6E0DJnVLjyIY",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
