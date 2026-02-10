import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/components/providers/TanstackProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import TopLoaderWrapper from "@/components/ui/TopLoaderWrapper";
import "nprogress/nprogress.css";
import NextSessionProvider from "@/components/providers/NextSessionProvider";
import { absoluteUrl, siteConfig } from "@/lib/seo";

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
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "ClarityHire | Hiring OS for Growing Teams",
    template: "%s | ClarityHire",
  },
  description: siteConfig.description,
  keywords: [
    "recruitment software",
    "ATS",
    "hiring platform",
    "applicant tracking",
    "AI recruiting",
    "candidate screening",
    "job board software",
  ],
  authors: [{ name: "ClarityHire Team" }],
  creator: "ClarityHire",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    title: "ClarityHire | Hiring OS for Growing Teams",
    description: siteConfig.description,
    siteName: "ClarityHire",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "ClarityHire",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ClarityHire | Hiring OS for Growing Teams",
    description: siteConfig.description,
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
        <NextSessionProvider>
          <ReduxProvider>
            <TanstackProvider>
              <TopLoaderWrapper />
              {children}
            </TanstackProvider>
          </ReduxProvider>
        </NextSessionProvider>
      </body>
    </html>
  );
}
