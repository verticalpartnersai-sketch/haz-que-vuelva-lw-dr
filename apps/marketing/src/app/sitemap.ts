import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://hazquevuelva.site/quiz",
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: "https://hazquevuelva.site/politica-de-privacidad",
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: "https://hazquevuelva.site/terminos-de-uso",
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];
}
