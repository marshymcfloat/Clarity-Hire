import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import TanstackProvider from "@/components/providers/TanstackProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import TopLoader from "@/components/ui/TopLoader";
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

export const metadata: Metadata = {
  title: "ClarityHire",
  description: "No more uncertainties in job seeking and hiring",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        style={{
          background:
            "radial-gradient(125% 125% at 50% 90%, #fff 40%, #7c3aed 100%)",
        }}
        className={`${geistSans.variable} ${geistMono.variable} antialiased ${inter.className}`}
      >
        <ReduxProvider>
          <TanstackProvider>
            <TopLoader />
            {children}
          </TanstackProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
