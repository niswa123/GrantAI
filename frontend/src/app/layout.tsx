import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { WorkspaceProvider } from "@/providers/workspace-provider";
import { SessionProvider } from "@/providers/session-provider";
import { AppHeader } from "@/components/app-header";
import { MainLayout } from "@/components/main-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
      <body className="min-h-full flex flex-col bg-[#020617] text-slate-50 selection:bg-cyan-500/30">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SessionProvider>
            <QueryProvider>
              <WorkspaceProvider>
                <AppHeader />
                <MainLayout>
                  {children}
                </MainLayout>
              </WorkspaceProvider>
            </QueryProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

