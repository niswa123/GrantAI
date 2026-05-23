import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { SessionProvider } from "@/providers/session-provider";

import { AppHeader } from "@/components/app-header";
import { MainLayout } from "@/components/main-layout";
import { EmailVerificationBanner } from "@/components/dashboard/email-verification-banner";
import { SyncProvider } from "@/contexts/SyncContext";
import { SyncToast } from "@/components/ui/SyncToast";
import { PostHogPageView } from "@/components/posthog-pageview";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { PostHogProvider } from "@/providers/posthog-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#020617",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://grantai.su"),

  // ── Primary ────────────────────────────────────────────────────
  title: {
    default: "GrantAI – AI-Powered R&D Tax Credit Automation",
    template: "%s | GrantAI",
  },
  description:
    "GrantAI automates R&D tax credit claims with AI. Connect GitHub, Jira, AWS and more. Generate HMRC-compliant reports in minutes, not months. Trusted by finance teams, CTOs and compliance officers.",
  keywords: [
    "R&D tax credit automation",
    "R&D tax relief",
    "HMRC R&D tax credit",
    "research and development tax credit",
    "R&D tax credit software",
    "AI tax credit platform",
    "automated R&D claim",
    "R&D compliance tool",
    "Frascati methodology compliance",
    "tech startup tax credit",
    "RDEC scheme",
    "SME R&D relief",
    "R&D tax credit UK",
    "R&D expenditure credit",
    "software company R&D tax",
    "GrantAI",
    "grant ai platform",
  ],

  // ── Canonical & Alternates ──────────────────────────────────────
  alternates: {
    canonical: "https://grantai.su",
  },

  // ── Robots ─────────────────────────────────────────────────────
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // ── OpenGraph ──────────────────────────────────────────────────
  openGraph: {
    title: "GrantAI – AI-Powered R&D Tax Credit Automation",
    description:
      "Stop leaving money on the table. GrantAI connects to your dev tools and generates audit-ready R&D tax credit reports automatically.",
    url: "https://grantai.su",
    siteName: "GrantAI",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "GrantAI – Automate your R&D tax credit claims with AI",
        type: "image/png",
      },
    ],
  },

  // ── Twitter / X Card ──────────────────────────────────────────
  twitter: {
    card: "summary_large_image",
    site: "@grantai",
    creator: "@grantai",
    title: "GrantAI – AI-Powered R&D Tax Credit Automation",
    description:
      "Connect your dev tools. Let AI do the heavy lifting. Get your R&D tax credit claim done in minutes.",
    images: ["/og-image.png"],
  },

  // ── Icons ──────────────────────────────────────────────────────
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },

  // ── Verification (add your actual verification tokens here) ────
  verification: {
    google: "3FI6B7bJUSZto_U_AHfEx_VcbyWixqWJayUML57pTlI",
  },

  // ── Misc ───────────────────────────────────────────────────────
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* ── JSON-LD: SoftwareApplication ─────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "GrantAI",
              url: "https://grantai.su",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "AI-powered R&D tax credit automation platform. Connect GitHub, Jira, AWS and more to generate HMRC-compliant R&D tax credit reports automatically.",
              offers: [
                {
                  "@type": "Offer",
                  name: "Free",
                  price: "0",
                  priceCurrency: "USD",
                  description: "Get started with GrantAI for free.",
                },
                {
                  "@type": "Offer",
                  name: "SaaS",
                  price: "29",
                  priceCurrency: "USD",
                  billingIncrement: "1",
                  description: "Full AI automation for growing teams.",
                },
                {
                  "@type": "Offer",
                  name: "Enterprise",
                  price: "99",
                  priceCurrency: "USD",
                  billingIncrement: "1",
                  description:
                    "Unlimited claims, dedicated compliance support, and API access.",
                },
              ],
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.9",
                reviewCount: "128",
                bestRating: "5",
                worstRating: "1",
              },
              featureList: [
                "Automated R&D tax credit claim generation",
                "HMRC Frascati methodology compliance",
                "GitHub, Jira, AWS, Azure, Linear, GitLab integrations",
                "Audit-ready report export",
                "Real-time cost allocation tracking",
                "SME and RDEC scheme support",
              ],
            }),
          }}
        />

        {/* ── JSON-LD: Organization ────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "GrantAI",
              url: "https://grantai.su",
              logo: "https://grantai.su/favicon.ico",
              sameAs: [],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                availableLanguage: ["English"],
              },
            }),
          }}
        />

        {/* ── JSON-LD: FAQPage ─────────────────────────────────── */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              mainEntity: [
                {
                  "@type": "Question",
                  name: "What is GrantAI?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "GrantAI is an AI-powered platform that automates R&D tax credit claims by connecting to your existing developer tools like GitHub, Jira, and AWS, then generating HMRC-compliant reports automatically.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How does GrantAI help with R&D tax credits?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "GrantAI ingests data from your code repositories, project management tools, and cloud infrastructure. Its AI engine classifies activities against Frascati methodology criteria and produces audit-ready documentation to support your R&D tax credit claim.",
                  },
                },
                {
                  "@type": "Question",
                  name: "Does GrantAI support HMRC SME and RDEC schemes?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "Yes. GrantAI supports both the SME R&D Relief scheme and the Research and Development Expenditure Credit (RDEC) scheme, producing documentation tailored to each scheme's requirements.",
                  },
                },
                {
                  "@type": "Question",
                  name: "What integrations does GrantAI support?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "GrantAI integrates with GitHub, GitLab, Jira, Linear, AWS, and Azure out of the box, with more integrations on the roadmap.",
                  },
                },
                {
                  "@type": "Question",
                  name: "How much does GrantAI cost?",
                  acceptedAnswer: {
                    "@type": "Answer",
                    text: "GrantAI offers a free plan to get started, a SaaS plan at $29/month for growing teams, and an Enterprise plan at $99/month with unlimited claims and dedicated support.",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#020617] text-slate-50 selection:bg-cyan-500/30">

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <PostHogProvider>
            <SessionProvider>
              <QueryProvider>
                <SyncProvider>
                  <WorkspaceProvider>
                    <div className="flex flex-col min-h-[100dvh] w-full relative">
                      <Suspense fallback={null}>
                        <PostHogPageView />
                      </Suspense>
                      <AppHeader />
                      <EmailVerificationBanner />
                      <MainLayout>
                        {children}
                      </MainLayout>
                    </div>
                    <SyncToast />
                  </WorkspaceProvider>
                </SyncProvider>
              </QueryProvider>
            </SessionProvider>
          </PostHogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

