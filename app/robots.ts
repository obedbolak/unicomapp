import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://www.unicomteam.com";

  return {
    rules: {
      userAgent: "*", // Applies to all search engine bots
      allow: "/", // Allows crawling the entire site
      disallow: [
        "/api/", // Blocking backend API routes (good practice)
        "/_next/", // Blocking Next.js internal build files
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`, // Links bots directly to your sitemap
  };
}
