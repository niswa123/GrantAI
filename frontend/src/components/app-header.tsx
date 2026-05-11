"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
  ChevronDown, Plus, Check, LayoutDashboard, Calculator,
  Settings, LogOut, User, Building2, ChevronRight, X, Loader2
} from "lucide-react";
import { useWorkspace, type Workspace } from "@/providers/workspace-provider";
import { useSession, signOut } from "next-auth/react";

// ── Shared Config ──────────────────────────────────────────────────────────

const COUNTRIES = [
  "Netherlands", "Germany", "France", "United Kingdom", "Belgium",
  "Sweden", "Denmark", "Finland", "Norway", "Spain", "Portugal",
  "Italy", "Austria", "Switzerland", "Poland", "Estonia", "Latvia",
  "Lithuania", "Czech Republic", "Slovakia", "Hungary", "Romania",
  "Ireland", "Luxembourg", "United States", "Canada", "Australia",
  "Other",
];

// ── Country flag emoji helper ──────────────────────────────────────────────

function countryFlag(country: string): string {
  const map: Record<string, string> = {
    Netherlands: "🇳🇱",
    Germany: "🇩🇪",
    "United Kingdom": "🇬🇧",
    France: "🇫🇷",
    Belgium: "🇧🇪",
  };
  return map[country] ?? "🌍";
}

// ── WorkspaceAvatar ────────────────────────────────────────────────────────

function WorkspaceAvatar({ ws, size = "sm" }: { ws: Workspace; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-8 h-8 text-sm" : "w-6 h-6 text-xs";
  return (
    <div className={`${sizeClass} ${ws.color} rounded-lg flex items-center justify-center font-black text-white flex-shrink-0 shadow-sm`}>
      {ws.initials}
    </div>
  );
}

// ── WorkspaceSwitcher Dropdown ─────────────────────────────────────────────

function WorkspaceSwitcher() {
  const { workspaces, activeWorkspace, setActiveWorkspace, addWorkspace } = useWorkspace();
  const [open, setOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Create Modal state
  const [newName, setNewName] = useState("");
  const [newCountry, setNewCountry] = useState("Netherlands");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setIsCreating(true);
    try {
      await addWorkspace({ name: newName.trim(), country: newCountry, initials: newName.charAt(0).toUpperCase(), color: "bg-cyan-500" });
      setCreateOpen(false);
      setNewName("");
      setNewCountry("Netherlands");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all duration-200 group"
      >
        <WorkspaceAvatar ws={activeWorkspace} />
        <span className="text-sm font-semibold text-white hidden sm:block max-w-[140px] truncate">
          {activeWorkspace.name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Workspace list */}
            <div className="p-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2 py-1.5">
                Workspaces
              </p>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => { setActiveWorkspace(ws); setOpen(false); }}
                  className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                >
                  <WorkspaceAvatar ws={ws} size="md" />
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{ws.name}</p>
                    <p className="text-xs text-slate-500">
                      {countryFlag(ws.country)} {ws.country}
                    </p>
                  </div>
                  {ws.id === activeWorkspace.id && (
                    <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="border-t border-white/5 p-2">
              <Link
                href="/settings/workspace"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Workspace Settings
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-50" />
              </Link>
              <button
                onClick={() => { setOpen(false); setCreateOpen(true); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Workspace
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {createOpen && typeof window !== 'undefined' && createPortal(
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setCreateOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-white">Create New Workspace</h2>
                <button onClick={() => setCreateOpen(false)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Workspace Name</label>
                  <input
                    autoFocus type="text" value={newName} onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-1.5">Country</label>
                  <select
                    value={newCountry} onChange={(e) => setNewCountry(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/8 text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15"
                  >
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleCreate}
                  disabled={!newName.trim() || isCreating}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                >
                  {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {isCreating ? "Creating…" : "Create Workspace"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

// ── UserMenu Dropdown ──────────────────────────────────────────────────────

function UserMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  // Fetch fresh data from DB on every route change (JWT may be stale after profile update)
  const [profile, setProfile] = useState<{ displayName: string; email: string; avatarUrl: string } | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      import("@/app/actions/userActions").then(({ getUserProfile }) => {
        getUserProfile().then((p) => {
          if (p) setProfile({
            displayName: p.displayName || session?.user?.email?.split("@")[0] || "User",
            email: p.email,
            avatarUrl: p.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${p.email}&backgroundColor=06b6d4`,
          });
        });
      });
    }
  }, [status, pathname]); // refetch on every navigation

  const displayName = profile?.displayName || session?.user?.name || session?.user?.email?.split("@")[0] || "User";
  const email = profile?.email || session?.user?.email || "";
  const avatarUrl = profile?.avatarUrl || session?.user?.image;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center font-bold text-white text-sm border-2 border-transparent hover:border-cyan-400/30 transition-all bg-slate-800"
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          displayName[0]?.toUpperCase() ?? "U"
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-56 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-3 border-b border-white/5 flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-800 flex-shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="w-full h-full flex items-center justify-center text-xs font-bold text-white">
                    {displayName[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{email}</p>
              </div>
            </div>
            <div className="p-2">
              <Link
                href="/settings/account"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <User className="w-4 h-4" />
                Account Settings
              </Link>
              <Link
                href="/settings/workspace"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Workspace
              </Link>
              <div className="border-t border-white/5 my-1" />
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Nav Links ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/input", label: "New Calc", icon: Calculator },
  { href: "/settings", label: "Settings", icon: Settings },
];

// ── AppHeader ──────────────────────────────────────────────────────────────

export function AppHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 10));

  // Don't render on the landing page
  if (pathname === "/") return null;

  return (
    <motion.header
      initial={{ y: -8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/90 backdrop-blur-xl border-b border-white/[0.06] shadow-[0_1px_20px_rgba(0,0,0,0.4)]"
          : "bg-slate-950/60 backdrop-blur-md border-b border-white/[0.04]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left: Logo + Workspace Switcher */}
        <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 rounded-[8px] bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center group-hover:shadow-[0_0_12px_rgba(6,182,212,0.3)] transition-shadow">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-cyan-400">
                <path d="m12 3-8 4v10l8 4 8-4V7z" />
                <path d="m12 11 8-4" />
                <path d="m12 11-8-4" />
                <path d="m12 11v10" />
              </svg>
            </div>
            <span className="text-sm font-black text-white tracking-tight hidden sm:block">GrantAI</span>
          </Link>

          {/* Divider */}
          <div className="w-px h-5 bg-white/10" />

          {/* Workspace Switcher */}
          <WorkspaceSwitcher />
        </div>

        {/* Center: Nav Links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Right: User Avatar */}
        <div className="flex items-center gap-3">
          {/* Mobile Nav */}
          <nav className="flex md:hidden items-center gap-1">
            {NAV_ITEMS.map(({ href, icon: Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`p-2 rounded-lg transition-all ${active ? "bg-cyan-500/10 text-cyan-400" : "text-slate-500 hover:text-white"}`}
                >
                  <Icon className="w-4 h-4" />
                </Link>
              );
            })}
          </nav>
          <UserMenu />
        </div>
      </div>
    </motion.header>
  );
}
