// next.config.ts
import { withContentlayer } from "next-contentlayer";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // necesar ca editorul să meargă în Next (SSR/build)
  transpilePackages: ["@mdxeditor/editor"],

  // permite imaginile externe (cover) din sursele tale
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.coindesk.com" },
      { protocol: "https", hostname: "**.cointelegraph.com" },
      { protocol: "https", hostname: "**.decrypt.co" },
      { protocol: "https", hostname: "**.news.bitcoin.com" },
      { protocol: "https", hostname: "**.finbold.com" },
      // adaugă aici alte domenii pe care le folosești la `cover`
      // { protocol: "https", hostname: "**.exemplu.com" },
    ],
  },
};

export default withContentlayer(nextConfig);
