import Link from "next/link";

export default function HomePage() {
  return (
    <section className="container-site pt-16">
      <div className="mx-auto max-w-3xl text-center space-y-6">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Informație crypto, <span className="text-teal-400">curată</span> și
          <span className="text-cyan-400"> rapidă</span>.
        </h1>
        <p className="text-neutral-300">
          Știri esențiale, listă cu cele mai populare burse, instrumente utile și un
          mini-calculator de arbitraj al ratei de finanțare. Totul într-o interfață
          glossy, rapidă și responsivă.
        </p>

        <div className="flex items-center justify-center gap-3 pt-2">
          <Link href="/stiri" className="btn btn-primary">Vezi știrile</Link>
          <Link href="/burse" className="btn">Top burse</Link>
        </div>
      </div>
    </section>
  );
}

