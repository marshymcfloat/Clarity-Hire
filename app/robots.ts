import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/pricing", "/solutions", "/trust", "/book-demo", "/companies"],
        disallow: ["/admin", "/api", "/candidates"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
