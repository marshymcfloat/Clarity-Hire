import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/components/providers/TanstackProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import TopLoaderWrapper from "@/components/ui/TopLoaderWrapper";
import "nprogress/nprogress.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({ subsets: ["latin"] });

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClarityHire | Modern Job Board",
    template: "%s | ClarityHire",
  },
  description:
    "Find your dream job with ClarityHire. Explore opportunities from top companies with transparency and ease.",
  keywords: [
    "Job Board",
    "Careers",
    "Hiring",
    "Employment",
    "Tech Jobs",
    "Remote Jobs",
  ],
  authors: [{ name: "ClarityHire Team" }],
  creator: "ClarityHire",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://clarityhire.com",
    title: "ClarityHire | Modern Job Board",
    description:
      "Find your dream job with ClarityHire. Explore opportunities from top companies with transparency and ease.",
    siteName: "ClarityHire",
    images: [
      {
        url: "/og-image.jpg", // Ensure this exists or replace with a valid URL
        width: 1200,
        height: 630,
        alt: "ClarityHire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClarityHire | Modern Job Board",
    description:
      "Find your dream job with ClarityHire. Explore opportunities from top companies with transparency and ease.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
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
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased ${inter.className}`}
      >
        <ReduxProvider>
          <TanstackProvider>
            <TopLoaderWrapper />
            {children}
          </TanstackProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
