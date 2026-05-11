"use client";

import { AppNav } from "./app-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950">
      <AppNav />
      {/* Padding top to account for fixed navbar */}
      <div className="pt-24">
        {children}
      </div>
    </div>
  );
}
