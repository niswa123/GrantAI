"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  Plus, Euro, BarChart3, TrendingUp, Download,
  LayoutList, LayoutGrid, ArrowUpRight, Calendar,
} from "lucide-react";
import {
  type CalculationRecord, type ClaimStatus, type SortCol, type SortDir, type ViewMode,
  getFY, getUniqueFYs, exportToCSV,
} from "@/lib/dashboard-utils";
import { useWorkspace } from "@/providers/workspace-provider";
import { ClaimCard, ClaimTable, EmptyState } from "@/components/dashboard/claim-components";
import { MagicSyncButton } from "@/components/dashboard/magic-sync-button";

// ── Animation Variants ────────────────────────────────────────────────────

const container: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

// ── Stat Card ─────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, icon: Icon, color, glow }: {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; color: string; glow: string;
}) {
  return (
    <div className={`bg-slate-900/50 backdrop-blur-xl border border-white/8 rounded-xl sm:rounded-2xl p-4 sm:p-5 ${glow}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color}`} />
        <span className="text-[10px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-xl sm:text-2xl font-black ${color}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── FY Tab Bar ────────────────────────────────────────────────────────────

function FYTabs({ fyOptions, selected, onSelect }: { fyOptions: string[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div className="flex items-center gap-1 p-1 bg-slate-900/50 border border-white/8 rounded-lg sm:rounded-xl w-full sm:w-fit overflow-x-auto scrollbar-hide">
      {["All Time", ...fyOptions].map((fy) => (
        <button
          key={fy}
          onClick={() => onSelect(fy)}
          className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap touch-manipulation ${
            selected === fy
              ? "bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
              : "text-slate-500 hover:text-white hover:bg-white/5"
          }`}
        >
          {fy !== "All Time" && <Calendar className="w-3 h-3" />}
          {fy}
        </button>
      ))}
    </div>
  );
}

// ── Sticky Summary Bar ────────────────────────────────────────────────────

function StickySummaryBar({ totalRefund, count, show }: { totalRefund: number; count: number; show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.25 }}
          className="sticky top-14 sm:top-16 z-20 -mx-4 px-4 py-2.5 bg-slate-950/90 backdrop-blur-xl border-b border-white/5 flex items-center justify-between"
        >
          <span className="text-xs text-slate-400 font-medium">{count} claim{count !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-1.5 text-sm font-black text-cyan-400">
            <Euro className="w-4 h-4" />
            <span className="hidden xs:inline">{totalRefund.toLocaleString("en-EU", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
            <span className="xs:hidden">{(totalRefund / 1000).toFixed(1)}k</span>
            <span className="text-xs text-slate-500 font-normal hidden sm:inline">total refund</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

import { getDashboardClaims, deleteClaim as dbDeleteClaim, updateClaimStatus as dbUpdateClaimStatus } from "@/app/actions/claimActions";

export default function DashboardPage() {
  const [history, setHistory] = useState<CalculationRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fyFilter, setFyFilter] = useState("All Time");
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [sortCol, setSortCol] = useState<SortCol>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showStickyBar, setShowStickyBar] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  const { activeWorkspace } = useWorkspace();

  // Load history from DB
  const loadClaims = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    try {
      setIsLoaded(false);
      const claims = await getDashboardClaims(activeWorkspace.id);
      setHistory(claims);
    } catch (err) {
      console.error("Failed to load claims", err);
    } finally {
      setIsLoaded(true);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // IntersectionObserver for sticky bar
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyBar(!entry.isIntersecting), { threshold: 0 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [isLoaded]);

  // Derived values
  const workspaceHistory = history; // Already filtered by workspaceId in DB
  const fyOptions = getUniqueFYs(workspaceHistory);
  const filtered = fyFilter === "All Time" ? workspaceHistory : workspaceHistory.filter((r) => getFY(r.date) === fyFilter);
  const totalRefund = filtered.reduce((s, r) => s + (r.estimatedRefund || 0), 0);
  const totalCosts = filtered.reduce((s, r) => s + (r.totalCosts || 0), 0);
  const rdProjects = filtered.filter((r) => r.classification === "R&D").length;
  const effectiveRoi = totalCosts > 0 ? ((totalRefund / totalCosts) * 100).toFixed(1) : "0.0";
  const riskyCount = filtered.filter((r) => (r.confidenceScore || 0) < 0.5).length;

  // Handlers
  const handleStatusChange = useCallback(async (id: string, status: ClaimStatus) => {
    setHistory((prev) => prev.map(r => r.id === id ? { ...r, status } : r));
    await dbUpdateClaimStatus(id, status);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    setHistory((prev) => prev.filter(r => r.id !== id));
    await dbDeleteClaim(id);
  }, []);

  const handleSort = useCallback((col: SortCol) => {
    setSortDir((prev) => (sortCol === col ? (prev === "desc" ? "asc" : "desc") : "desc"));
    setSortCol(col);
  }, [sortCol]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-8 pb-20">
        {/* Sticky summary (appears after scrolling past stats) */}
        <StickySummaryBar totalRefund={totalRefund} count={filtered.length} show={showStickyBar && history.length > 0} />

        <motion.div variants={container} initial="hidden" animate="visible">

          {/* ── Compact Page Header ── */}
          <motion.div variants={item} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  {activeWorkspace?.name || "Loading..."}
                  <span className="text-slate-500 font-normal text-base ml-2">/ R&amp;D Claims</span>
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">Track and manage your R&amp;D tax credit applications</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {history.length > 0 && (
                  <button
                    onClick={() => exportToCSV(filtered)}
                    className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-800/80 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 text-xs sm:text-sm font-semibold transition-all touch-manipulation"
                  >
                    <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">Export CSV</span>
                    <span className="xs:hidden">CSV</span>
                  </button>
                )}
                <MagicSyncButton
                  companyId={activeWorkspace?.id || ""}
                  onSuccess={loadClaims}
                />
                <Link
                  href="/input"
                  id="start-new-calculation"
                  className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] touch-manipulation"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline">New Calculation</span>
                  <span className="xs:hidden">New</span>
                  <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* ── Stats ── */}
          {history.length > 0 && (
            <motion.div ref={statsRef} variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
              <StatCard
                label="Total Refund"
                value={`€${totalRefund.toLocaleString("en-EU", { maximumFractionDigits: 0 })}`}
                sub={fyFilter !== "All Time" ? fyFilter : `${history.length} calc${history.length !== 1 ? "s" : ""}`}
                icon={Euro}
                color="text-cyan-400"
                glow="shadow-[0_0_20px_rgba(6,182,212,0.1)]"
              />
              <StatCard
                label="Effective ROI"
                value={`${effectiveRoi}%`}
                sub="of total dev spend"
                icon={TrendingUp}
                color="text-emerald-400"
                glow="shadow-[0_0_20px_rgba(52,211,153,0.1)]"
              />
              <StatCard
                label="R&D Projects"
                value={rdProjects}
                sub={`of ${filtered.length} total`}
                icon={BarChart3}
                color="text-violet-400"
                glow="shadow-[0_0_20px_rgba(139,92,246,0.1)]"
              />
              {riskyCount > 0 ? (
                <StatCard
                  label="⚠ Risky Claims"
                  value={riskyCount}
                  sub="AI confidence < 50%"
                  icon={BarChart3}
                  color="text-rose-400"
                  glow="shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                />
              ) : (
                <StatCard
                  label="Total Dev Spend"
                  value={`€${totalCosts.toLocaleString("en-EU", { maximumFractionDigits: 0 })}`}
                  sub="eligible costs"
                  icon={BarChart3}
                  color="text-slate-300"
                  glow=""
                />
              )}
            </motion.div>
          )}

          {/* ── CTA (when empty) or Toolbar (when has data) ── */}
          {history.length === 0 ? (
            <motion.div variants={item}>
              <Link
                href="/input"
                id="start-new-calculation"
                className="group block w-full relative overflow-hidden rounded-2xl sm:rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/80 to-violet-500/10 p-6 sm:p-8 md:p-10 hover:border-cyan-400/40 transition-all duration-500 hover:shadow-[0_0_60px_rgba(6,182,212,0.15)]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" />
                <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
                  <div>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-3 sm:mb-4 group-hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-shadow">
                      <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
                    </div>
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white mb-2">Start New R&amp;D Calculation</h2>
                    <p className="text-slate-400 text-sm sm:text-base max-w-md">Describe your project and enter costs — our AI scores R&amp;D eligibility and estimates your refund in seconds.</p>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-cyan-500 rounded-full font-bold text-slate-950 text-sm group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] group-hover:scale-105 transition-all duration-300 touch-manipulation">
                    Get Started <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ) : (
            /* ── Toolbar: FY filter + view toggle ── */
            <motion.div variants={item} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
              <FYTabs fyOptions={fyOptions} selected={fyFilter} onSelect={setFyFilter} />
              <div className="flex items-center gap-1 p-1 bg-slate-900/50 border border-white/8 rounded-xl self-end sm:self-auto">
                {([["cards", LayoutGrid], ["table", LayoutList]] as [ViewMode, React.ElementType][]).map(([mode, Icon]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`p-2 rounded-lg transition-all touch-manipulation ${viewMode === mode ? "bg-white/10 text-white" : "text-slate-500 hover:text-white hover:bg-white/5"}`}
                    title={`${mode} view`}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── History list / table ── */}
          <motion.div variants={item} className="mt-2">
            <AnimatePresence mode="wait">
              {filtered.length === 0 && history.length > 0 ? (
                <motion.p key="no-fy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center text-slate-500 py-12">
                  No calculations for {fyFilter}.
                </motion.p>
              ) : history.length === 0 ? (
                <EmptyState key="empty" />
              ) : viewMode === "cards" ? (
                <motion.div key="cards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  {filtered.map((record, i) => (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <ClaimCard record={record} onStatusChange={handleStatusChange} onDelete={handleDelete} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ClaimTable
                    records={filtered}
                    sortCol={sortCol}
                    sortDir={sortDir}
                    onSort={handleSort}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

        </motion.div>
      </div>
    </div>
  );
}
