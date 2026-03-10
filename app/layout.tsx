import type { Metadata } from "next";
import { Geist, Lora } from "next/font/google";
import Script from "next/script";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { getBaseUrl } from "@/lib/site";
import { Providers } from "./providers";
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
    "Financial literacy for the next generation. Clear, thoroughly researched coverage of markets, business, and the economy.",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName: "Next Gen Finance",
    title: "Next Gen Finance",
    description:
      "Financial literacy for the next generation. Clear, thoroughly researched coverage of markets, business, and the economy.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Next Gen Finance",
    description:
      "Financial literacy for the next generation. Clear, thoroughly researched coverage of markets, business, and the economy.",
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${lora.variable} antialiased font-sans`}
      >
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        <Providers>{children}</Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
