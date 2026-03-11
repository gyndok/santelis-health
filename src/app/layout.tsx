import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Santelis Health — Modern Websites for Medical Practices",
  description:
    "AI-powered website builder for doctors. Get a modern, SEO-optimized practice website live in under 30 minutes. Starting at $29/mo.",
  openGraph: {
    title: "Santelis Health — Modern Websites for Medical Practices",
    description:
      "AI-powered website builder for doctors. Modern, fast, SEO-optimized. Starting at $29/mo.",
    url: "https://santelishealth.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Santelis Health — Modern Websites for Medical Practices",
    description:
      "AI-powered website builder for doctors. Modern, fast, SEO-optimized.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
