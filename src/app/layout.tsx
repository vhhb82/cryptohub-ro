// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import { Inter } from "next/font/google";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin-ext"],
  display: "swap",
  preload: true,
});

const siteTitle = "CryptoHub Pro";
const siteTagline = "Știri, burse și instrumente crypto pentru piața din România";
const siteDescription =
  "Platforma românească cu informații crypto actualizate zilnic: știri filtrate, comparații între burse și instrumente utile pentru investitori.";
const defaultOgImage = "/images/fundal.jpg";

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
        url: defaultOgImage,
        width: 1200,
        height: 630,
        alt: "CryptoHub Pro - știri și instrumente crypto",
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
        url: defaultOgImage,
        alt: "CryptoHub Pro - știri și instrumente crypto",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  category: "technology",
};

const jsonLdOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteTitle,
  url: "https://cryptohub.ro",
  logo: "https://cryptohub.ro/images/fundal.jpg",
};

const jsonLdWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteTitle,
  url: "https://cryptohub.ro",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://cryptohub.ro/stiri?cauta={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ro">
      <body className={`${inter.className} min-h-screen bg-black text-white antialiased`}>
        {/* Fundal: imagine + overlay-uri */}
        <div className="fixed inset-0 -z-10">
          <Image
            src={defaultOgImage}
            alt=""
            fill
            priority
            quality={80}
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,.18),transparent_65%)]" />
          <div className="absolute inset-0 bg-black/15" />
        </div>

        <header className="sticky top-0 z-50 backdrop-blur-md supports-[backdrop-filter]:bg-black/20">
          <Navbar />
        </header>

        <main className="min-h-screen">{children}</main>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLdOrganization, jsonLdWebsite]) }}
        />
      </body>
    </html>
  );
}
