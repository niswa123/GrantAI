import type { MetadataRoute } from "next";

/**
 * Dynamic sitemap — submitted automatically to Google Search Console.
 * Priority scale: 1.0 = most important, 0.5 = default, 0.3 = low value.
 *
 * Add new public routes here as the product grows.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://grantai.su";
  const now = new Date();

  return [
    // ── Landing page ──────────────────────────────────────────
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    // ── Auth pages (indexable for brand discovery) ────────────
    {
      url: `${base}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${base}/register`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // ── Onboarding (signals product depth to crawlers) ────────
    {
      url: `${base}/onboarding`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
