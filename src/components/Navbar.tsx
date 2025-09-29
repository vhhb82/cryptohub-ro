"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Acasă" },
  { href: "/stiri", label: "Știri" },
  { href: "/burse", label: "Burse" },
  { href: "/calculator", label: "Calculator" },
  { href: "/instrumente", label: "Instrumente" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="supports-[backdrop-filter]:bg-black/40 bg-black/60 sticky top-0 z-60 backdrop-blur border-b border-white/10">
      <nav className="container-site h-18 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="text-white">CryptoHub</span>{" "}
          <span className="text-teal-400">Pro</span>
        </Link>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                className={`px-3 py-1.5 rounded-lg hover:bg-white/10 ${
                  pathname === l.href ? "bg-white/10 text-white" : "text-neutral-200"
                }`}
                href={l.href}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
