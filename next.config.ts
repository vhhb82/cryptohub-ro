// next.config.ts
import type { NextConfig } from "next"
import { withContentlayer } from "next-contentlayer2";
const nextConfig: NextConfig = {
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
