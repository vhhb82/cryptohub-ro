// src/app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "CryptoHub Pro",
  description:
    "Știri crypto esențiale, top burse, instrumente utile și un mini-calculator de arbitraj/funding într-o temă glossy, rapidă și responsivă.",
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



