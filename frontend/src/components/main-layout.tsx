"use client";

import { usePathname } from "next/navigation";

export function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isNoPadding = pathname === "/" || pathname === "/login" || pathname === "/register";

  return (
    <main className={`flex-1 ${isNoPadding ? "" : "pt-14"}`}>
      {children}
    </main>
  );
}
