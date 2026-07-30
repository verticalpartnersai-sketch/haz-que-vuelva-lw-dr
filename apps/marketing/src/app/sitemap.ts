import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hazquevuelva.site/quiz",
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
