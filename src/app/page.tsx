import Link from "next/link";
import { getAllNews } from "@/lib/news";
import NewsCard from "@/components/news/NewsCard";

export const revalidate = 60;

const highlights = [
  {
    title: "Flux de stiri filtrat",
    body: "Selectie manuala din cele mai credibile surse internationale, tradusa pe intelesul investitorilor locali.",
  },
  {
    title: "Context de piata",
    body: "Analizam rapid trendurile majore, evenimentele macro si impactul asupra token-urilor principale.",
  },
  {
    title: "Instrumente pentru decizii",
    body: "Calculator de arbitraj, monitorizare burse si resurse educationale in continua extindere.",
  },
];

const quickLinks = [
  { href: "/stiri", label: "Flux complet de stiri" },
  { href: "/burse", label: "Compara bursele populare" },
  { href: "/instrumente", label: "Instrumente si resurse" },
  { href: "/calculator", label: "Calculator de funding" },
];

export default async function HomePage() {
  const latestNews = (await getAllNews()).slice(0, 3);

  return (
    <div className="container-site space-y-16 pb-16 pt-16">
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_minmax(0,1fr)]">
        <div className="space-y-8">
          <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm text-teal-200">
            Platforma crypto pentru Romania
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Informatii crypto credibile, structurate pentru decizii rapide.
          </h1>
          <p className="max-w-xl text-lg text-neutral-200/90">
            CryptoHub Pro centralizeaza stirile, miscarile pietei si instrumentele esentiale ca tu sa poti reactiona fara zgomot. Totul intr-o experienta rapida, responsiva si gata de partajat cu echipa ta.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/stiri" className="btn btn-primary">
              Vezi stirile de azi
            </Link>
            <Link href="/burse" className="btn">
              Top burse
            </Link>
            <Link href="/instrumente" className="btn">
              Descopera instrumentele
            </Link>
          </div>
        </div>

        <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Actualizare flux</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">la fiecare 60 de minute</p>
            <p className="mt-3 text-sm text-neutral-400">
              ISR activ: noile articole sunt disponibile in cateva minute, fara a reincarca serverul.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Surse verificate</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">20+ publicatii</p>
            <p className="mt-3 text-sm text-neutral-400">
              Monitorizam principalele outlet-uri internationale si proiecte on-chain emergente.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 p-5">
            <p className="text-sm text-neutral-300">Instrumente incluse</p>
            <p className="mt-2 text-3xl font-semibold text-teal-200">4 module si in crestere</p>
            <p className="mt-3 text-sm text-neutral-400">
              De la monitorizarea burselor pana la calcule de funding si arbitraj de piata.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-teal-200/40 hover:bg-white/10"
          >
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="text-sm leading-relaxed text-neutral-300">{item.body}</p>
          </div>
        ))}
      </section>

      {latestNews.length > 0 && (
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-white">Ultimele stiri</h2>
              <p className="text-sm text-neutral-300">
                Selectie scurta din fluxul complet. Acceseaza pagina de stiri pentru toate titlurile.
              </p>
            </div>
            <Link href="/stiri" className="text-sm font-medium text-teal-200 hover:text-teal-100">
              Vezi toate stirile →
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
        <h2 className="text-xl font-semibold text-white">Navigare rapida</h2>
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
    </div>
  );
}
