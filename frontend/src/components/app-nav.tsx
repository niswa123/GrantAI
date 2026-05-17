"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import { LayoutDashboard, Calculator, FileOutput, Settings, BrainCircuit } from "lucide-react";
import { Logo } from "./ui/logo";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "New Calculation",
    href: "/input",
    icon: Calculator,
  },
  {
    name: "Results",
    href: "/result",
    icon: FileOutput,
  },
  {
    name: "Neural Processing",
    href: "/dashboard/events",
    icon: BrainCircuit,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppNav() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className={`fixed left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        isScrolled ? "top-4 w-[95%] max-w-5xl" : "top-6 w-[98%] max-w-5xl"
      }`}
    >
      <div
        className={`glass rounded-full flex items-center justify-between transition-all duration-500 ease-out ${
          isScrolled
            ? "px-4 py-2 bg-slate-950/80 backdrop-blur-xl border-white/10"
            : "px-6 py-3 bg-slate-900/30 backdrop-blur-md border-white/5"
        }`}
      >
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 transition-all hover:scale-105 duration-300 flex-shrink-0"
        >
          <Logo className="w-8 h-8" showText textSize={isScrolled ? "text-lg" : "text-xl"} />
        </Link>

        {/* Navigation Links */}
        <div className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm font-medium ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Mobile links */}
        <div className="flex lg:hidden items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`p-2.5 rounded-full transition-all duration-300 ${
                  isActive
                    ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
