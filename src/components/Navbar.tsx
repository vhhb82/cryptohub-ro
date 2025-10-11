"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/stiri", label: "Știri" },
  { href: "/burse", label: "Burse" },
  { href: "/calculator", label: "Calculator" },
  { href: "/instrumente", label: "Instrumente" },
] as const;

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-60 border-b border-white/10 bg-black/60 backdrop-blur supports-[backdrop-filter]:bg-black/40">
      <nav className="container-site flex h-18 items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight" aria-label="CryptoHub Pro - acasă">
          <span className="text-white">CryptoHub</span>{" "}
          <span className="text-teal-400">Pro</span>
        </Link>

        <ul className="hidden items-center gap-6 text-sm md:flex">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  className={`rounded-lg px-3 py-1.5 transition hover:bg-white/10 ${
                    isActive ? "bg-white/10 text-white" : "text-neutral-200"
                  }`}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
