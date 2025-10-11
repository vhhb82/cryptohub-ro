import type { Metadata } from "next";
import Link from "next/link";
import CryptoPriceWidget from "@/components/market/CryptoPriceWidget";
import { getAllNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";

const pageTitle = "Informații crypto verificate și instrumente rapide pentru România";
const pageDescription =
  "CryptoHub Pro oferă știri crypto în limba română, analize de piață și instrumente utile pentru investitorii locali. Totul într-o experiență rapidă și ușor de partajat.";
const heroImage = "/images/fundal.jpg";
const siteUrl = "https://cryptohub.ro";

export const revalidate = 60;

export const metadata: Metadata = {
  title: pageTitle,
  description: pageDescription,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    type: "website",
    url: siteUrl,
    siteName: "CryptoHub Pro",
    images: [
      {
        url: heroImage,
        width: 1200,
        height: 630,
        alt: "CryptoHub Pro - platformă de știri și instrumente crypto pentru România",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: pageTitle,
    description: pageDescription,
    images: [heroImage],
  },
};

const highlights = [
  {
    title: "Flux de știri filtrat",
    body: "Selecție atentă din surse internaționale credibile, tradusă și contextualizată pentru ecosistemul local.",
  },
  {
    title: "Context de piață",
    body: "Analizăm rapid trendurile majore, evenimentele macro și impactul asupra token-urilor importante.",
  },
  {
    title: "Instrumente pentru decizii",
    body: "Calculator de arbitraj, monitorizare burse și resurse educaționale aflate într-o extindere constantă.",
  },
] as const;

const quickLinks = [
  { href: "/stiri", label: "Flux complet de știri" },
  { href: "/burse", label: "Compară bursele populare" },
  { href: "/instrumente", label: "Instrumente și resurse" },
  { href: "/calculator", label: "Calculator de funding" },
] as const;

export default async function HomePage() {
  const latestNews = (await getAllNews()).slice(0, 3);

  const itemListJsonLd = latestNews.length
    ? {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: latestNews.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: `${siteUrl}/stiri/${item.slug}`,
          name: item.title,
        })),
      }
    : null;

  const pageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: pageTitle,
    description: pageDescription,
    url: siteUrl,
  };

  return (
    <main className="container-site space-y-16 pb-16 pt-16">
      <section className="grid items-start gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)_minmax(0,0.95fr)]">
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <CryptoPriceWidget />
        </div>

        <div className="order-1 space-y-6 text-center lg:order-2">
          <p className="mx-auto inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-teal-200">
            Platforma crypto pentru România
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Informații crypto credibile, structurate pentru decizii rapide.
          </h1>
          <p className="mx-auto max-w-xl text-lg text-neutral-200/90">
            CryptoHub Pro centralizează știrile, mișcările pieței și instrumentele esențiale ca tu să poți reacționa fără zgomot. Totul într-o experiență rapidă, responsivă și ușor de partajat.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/stiri" className="btn btn-primary">
              Vezi știrile de azi
            </Link>
            <Link href="/burse" className="btn">
              Top burse
            </Link>
            <Link href="/instrumente" className="btn">
              Descoperă instrumentele
            </Link>
          </div>
        </div>

        <div className="order-3 grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur lg:order-3 lg:ml-auto">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Actualizare flux</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">la fiecare 60 de minute</p>
            <p className="mt-3 text-sm text-neutral-400">
              ISR activ: noile articole sunt publicate în câteva minute, fără a reîncărca serverul.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Surse verificate</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">20+ publicații</p>
            <p className="mt-3 text-sm text-neutral-400">
              Monitorizăm principalele outlet-uri internaționale și proiecte on-chain emergente.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Instrumente incluse</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">4 module și în creștere</p>
            <p className="mt-3 text-sm text-neutral-400">
              De la monitorizarea burselor până la calcule de funding și arbitraj de piață.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <article
            key={item.title}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-teal-200/40 hover:bg-white/10"
          >
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="text-sm leading-relaxed text-neutral-300">{item.body}</p>
          </article>
        ))}
      </section>

      {latestNews.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Ultimele știri</h2>
              <p className="text-sm text-neutral-300">
                Selecție scurtă din fluxul complet. Accesează pagina de știri pentru toate titlurile.
              </p>
            </div>
            <Link href="/stiri" className="text-sm font-medium text-teal-200 hover:text-teal-100">
              Vezi toate știrile →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {latestNews.map((item) => (
              <NewsCard key={item._id} item={item} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-xl font-semibold text-white">Navigare rapidă</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-neutral-200 transition hover:border-teal-200/40 hover:text-white"
            >
              {link.label}
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            itemListJsonLd ? [pageJsonLd, itemListJsonLd] : [pageJsonLd]
          ),
        }}
      />
    </main>
  );
}
