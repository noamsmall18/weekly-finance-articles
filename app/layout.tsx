import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import { getBaseUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Next Gen Finance",
    template: "%s | Next Gen Finance",
  },
  description:
    "Financial literacy for the next generation — clear, well-researched coverage of markets, business, and the economy, written by passionate young journalists.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Next Gen Finance",
    title: "Next Gen Finance",
    description:
      "Financial literacy for the next generation — clear, well-researched coverage of markets, business, and the economy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Gen Finance",
    description:
      "Financial literacy for the next generation — clear, well-researched coverage of markets, business, and the economy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${lora.variable} antialiased font-sans`}
      >
        {children}
      </body>
    </html>
  );
}
