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
    default: "Weekly Finance Articles",
    template: "%s | Weekly Finance Articles",
  },
  description:
    "Your weekly source for finance news, market updates, investing tips and personal finance advice.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Weekly Finance Articles",
    title: "Weekly Finance Articles",
    description:
      "Your weekly source for finance news, market updates, investing tips and personal finance advice.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Weekly Finance Articles",
    description:
      "Your weekly source for finance news, market updates, investing tips and personal finance advice.",
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
