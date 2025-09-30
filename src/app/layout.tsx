// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";

const siteTitle = "CryptoHub Pro";
const siteTagline = "Știri, burse și instrumente crypto pentru piața din România";
const siteDescription = "Platformă românească cu informații crypto actualizate zilnic: știri filtrate, comparații între burse și instrumente utile pentru investitori.";

export const metadata: Metadata = {
  metadataBase: new URL("https://cryptohub.ro"),
  title: {
    default: `${siteTitle} | ${siteTagline}`,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  keywords: [
    "stiri crypto",
    "bursa crypto",
    "instrumente crypto",
    "preturi criptomonede",
    "analiza crypto Romania",
  ],
  applicationName: siteTitle,
  authors: [{ name: "CryptoHub Pro" }],
  creator: "CryptoHub Pro",
  publisher: "CryptoHub Pro",
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "https://cryptohub.ro",
    siteName: siteTitle,
    title: `${siteTitle} | ${siteTagline}`,
    description: siteDescription,
    images: [
      {
        url: "/images/fundal.jpg",
        width: 1200,
        height: 630,
        alt: "CryptoHub Pro - Știri și instrumente crypto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cryptohub_ro",
    creator: "@cryptohub_ro",
    title: `${siteTitle} | ${siteTagline}`,
    description: siteDescription,
    images: [
      {
        url: "/images/fundal.jpg",
        alt: "CryptoHub Pro - Știri și instrumente crypto",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className="min-h-screen text-white">
        {/* Fundal: imagine + overlay-uri */}
        <div className="fixed inset-0 -z-10">
          <Image
            src="/images/fundal.jpg"
            alt=""
            fill
            priority
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.18),transparent_65%)]" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <header className="sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
          <Navbar />
        </header>

        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}