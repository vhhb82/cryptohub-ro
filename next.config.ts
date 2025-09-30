// next.config.ts
import createMDX from '@next/mdx'

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

  // Configure `pageExtensions` to include MDX files
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
};

const withMDX = createMDX({
  // Add markdown plugins here, as desired
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
