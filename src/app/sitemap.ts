import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { allToolPaths, siteUrl, toolPath } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = (pathFor: (l: (typeof locales)[number]) => string) =>
    Object.fromEntries(locales.map((l) => [l, `${siteUrl}${pathFor(l)}`]));

  return [
    ...locales.map((l) => ({
      url: `${siteUrl}/${l}`,
      changeFrequency: "weekly" as const,
      priority: 1,
      alternates: { languages: languages((x) => `/${x}`) },
    })),
    ...allToolPaths().map(({ tool, path }) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: languages((x) => toolPath(x, tool)) },
    })),
  ];
}
