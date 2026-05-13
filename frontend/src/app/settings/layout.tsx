"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Users,
  UserCircle,
  CreditCard,
  LayoutDashboard,
  ChevronLeft,
  Plug,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";

const settingsNav = [
  { href: "/settings/workspace", label: "Workspace Settings", icon: Building2 },
  { href: "/settings/members",   label: "Members",            icon: Users },
  { href: "/settings/integrations", label: "Integrations",    icon: Plug },
  { href: "/settings/account",   label: "Account Preferences",icon: UserCircle },
  { href: "/settings/billing",   label: "Billing",            icon: CreditCard },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeWorkspace } = useWorkspace();

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      {/* ── Left Sidebar ── */}
      <aside className="w-60 border-r border-white/8 bg-slate-900/30 hidden md:flex flex-col shrink-0 sticky top-14 h-[calc(100vh-3.5rem)]">
        {/* Back to app */}
        <div className="px-3 pt-5 pb-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-xs font-semibold transition-all group"
          >
            <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <LayoutDashboard className="w-3.5 h-3.5" />
            Back to Dashboard
          </Link>
          <div className="h-px bg-white/5 mt-3 mb-2" />
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-3 py-1">
            Settings
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5">
          {settingsNav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all duration-200 text-sm group ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 transition-colors ${active ? "text-cyan-400" : "group-hover:text-cyan-400"}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Active workspace badge */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-xl bg-slate-900/60 border border-white/5">
            <div className={`w-6 h-6 rounded-lg ${activeWorkspace.color} flex items-center justify-center font-bold text-xs text-white flex-shrink-0`}>
              {activeWorkspace.initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-300 truncate">{activeWorkspace.name}</div>
              <div className="text-[10px] text-slate-500">Free Plan</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-30 bg-slate-950/90 backdrop-blur-xl border-b border-white/8 flex items-center gap-2 px-4 py-2 overflow-x-auto">
        {settingsNav.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                  : "text-slate-400 hover:text-white border border-transparent"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </Link>
          );
        })}
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 overflow-auto">
        <div className="md:pt-0 pt-12">
          {children}
        </div>
      </main>
    </div>
  );
}


