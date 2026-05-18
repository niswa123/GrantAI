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
  title: "GrantAI | R&D Tax Credit Automation",
  description: "Convert R&D projects into tax credits with AI-powered precision. Simple, fast, and compliant.",
  openGraph: {
    title: "GrantAI",
    description: "AI-powered R&D tax credit platform.",
    url: "https://grantai.com",
    siteName: "GrantAI",
    locale: "en_US",
    type: "website",
  },
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
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#020617] text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
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
                    <div className="flex flex-col min-h-screen w-full max-w-[100vw] overflow-x-hidden md:overflow-x-clip relative">
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

