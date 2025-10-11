import type { Metadata } from "next";
import FundingCalculatorClient from "./FundingCalculatorClient";

const pageTitle = "Calculator arbitraj funding pentru poziții long/short";
const pageDescription =
  "Simulează rapid o strategie de arbitraj pe funding între două burse crypto: introdu capitalul, levierul și ratele de funding pentru a vedea PnL-ul net.";

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/calculator",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: "https://cryptohub.ro/calculator",
    type: "article",
  },
  twitter: {
    title: pageTitle,
    description: pageDescription,
  },
};

const calculatorJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: pageTitle,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  description: pageDescription,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  url: "https://cryptohub.ro/calculator",
};

export default function CalculatorPage() {
  return (
    <main className="container-site space-y-8 pb-14 pt-10">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold text-white md:text-3xl">{pageTitle}</h1>
        <p className="text-sm text-neutral-300">
          {pageDescription} Folosește-l pentru a evalua dacă merită să rulezi un spread între două platforme înainte de
          a executa ordinele.
        </p>
      </header>

      <FundingCalculatorClient />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorJsonLd) }} />
    </main>
  );
}
