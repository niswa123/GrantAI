import type { MetadataRoute } from "next";

/**
 * Robots.txt — controls crawler access.
 * - Public landing page & auth routes: ALLOW
 * - Internal app, API, user data: DISALLOW
 */
export default function robots(): MetadataRoute.Robots {
  const base = "https://grantai.su";

  return {
    rules: [
      // ── Allow major search engines ─────────────────────────
      {
        userAgent: "*",
        allow: ["/", "/login", "/register", "/onboarding"],
        disallow: [
          "/dashboard/",
          "/api/",
          "/settings/",
          "/result/",
          "/input/",
          "/company/",
          "/invite/",
          "/verify-email/",
          "/reset-password/",
          "/forgot-password/",
          "/check-email/",
          "/payment/",
          "/actions/",
        ],
      },
      // ── Block GPTBot / AI scrapers (protect proprietary data) ──
      {
        userAgent: "GPTBot",
        disallow: ["/"],
      },
      {
        userAgent: "CCBot",
        disallow: ["/"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
