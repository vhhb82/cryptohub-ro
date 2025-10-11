// next.config.ts
import createMDX from '@next/mdx'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // necesar ca editorul sÄƒ meargÄƒ Ã®n Next (SSR/build)
  transpilePackages: ["@mdxeditor/editor"],

  // permite imaginile externe (cover) din sursele tale
  images: {
    formats: ["image/avif", "image/webp"] as Array<"image/avif" | "image/webp">,
    remotePatterns: [
      { protocol: "https" as const, hostname: "**.coindesk.com" },
      { protocol: "https" as const, hostname: "**.cointelegraph.com" },
      { protocol: "https" as const, hostname: "**.decrypt.co" },
      { protocol: "https" as const, hostname: "**.news.bitcoin.com" },
      { protocol: "https" as const, hostname: "**.finbold.com" },
      // adaugÄƒ aici alte domenii pe care le foloseÈ™ti la `cover`
      // { protocol: "https" as const, hostname: "**.exemplu.com" },
    ],
  },

  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)


console.log("Next config loaded: prefer AVIF/WebP");
