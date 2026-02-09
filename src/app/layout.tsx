import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dota 2 Counter Pick - Draft & Synergy Analyzer",
  description: "Analyze hero matchups, team composition, and find the best counter picks for your Dota 2 matches using real-time API data.",
  openGraph: {
    title: "Dota 2 Counter Pick - Draft Analyzer",
    description: "Find the best heroes to counter your enemies and balance your team draft. Real-time stats & smart suggestions.",
    url: "https://dota2-counter-pick.vercel.app/",
    siteName: "Dota 2 Counter Pick",
    images: [
      {
        url: "https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/world/roshan.png",
        width: 1200,
        height: 630,
        alt: "Dota 2 Counter Pick",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dota 2 Counter Pick - Draft Analyzer",
    description: "Counter enemy drafts and analyze team balance with real-time Dota 2 stats.",
    images: ["https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/world/roshan.png"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
