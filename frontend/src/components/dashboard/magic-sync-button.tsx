"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitBranch, Loader2, CheckCircle2, AlertCircle, X, Zap,
  DollarSign, Layout, Layers, ArrowRight, Bolt,
} from "lucide-react";
import { getConnectedSources, type SyncSource } from "@/app/actions/unifiedSyncActions";
import { getCompanySyncDefaults, updateCompanySyncDefaults } from "@/app/actions/companyActions";
import { useSyncContext } from "@/contexts/SyncContext";
import { useRouter } from "next/navigation";

type SyncMode = "quick" | "deep";

interface MagicSyncButtonProps {
  companyId: string;
  onSuccess: () => void;
  fullWidth?: boolean;
}

export function MagicSyncButton({ companyId, onSuccess, fullWidth = false }: MagicSyncButtonProps) {
  const router = useRouter();
  const { startSync, isSyncing: isBackgroundSyncing, companyId: syncingCompanyId } = useSyncContext();

  const [isOpen, setIsOpen] = useState(false);
  const [salaryCosts, setSalaryCosts] = useState("100000");
  const [devCosts, setDevCosts] = useState("20000");
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [syncMode, setSyncMode] = useState<SyncMode>("quick");
  const [error, setError] = useState("");

  const isThisCompanySyncing = isBackgroundSyncing && syncingCompanyId === companyId;

  useEffect(() => {
    if (isOpen) {
      loadSources();
      loadDefaults();
    }
  }, [isOpen]);

  const loadDefaults = async () => {
    const defaults = await getCompanySyncDefaults(companyId);
    setSalaryCosts(String(defaults.salaries));
    setDevCosts(String(defaults.devCosts));
  };

  const loadSources = async () => {
    setIsLoadingSources(true);
    try {
      const data = await getConnectedSources(companyId);
      setSources(data);
    } catch (err) {
      console.error("Failed to load sources", err);
    } finally {
      setIsLoadingSources(false);
    }
  };

  const handleSync = async () => {
    const numSalary = parseInt(salaryCosts.replace(/\D/g, "")) || 0;
    const numDev = parseInt(devCosts.replace(/\D/g, "")) || 0;

    const connectedCount = sources.filter((s) => s.connected).length;
    if (connectedCount === 0) {
      setError("Please connect at least one integration in Settings.");
      return;
    }

    setError("");

    // Close modal instantly for seamless UX
    setIsOpen(false);

    // Save the inputs in the background without blocking the UI transition
    updateCompanySyncDefaults(companyId, numSalary, numDev).catch((err) =>
      console.error("Failed to save sync defaults:", err)
    );

    startSync(companyId, async () => {
      // Use fetch to API route instead of Server Action to avoid timeout
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          salaryCosts: numSalary,
          devCosts: numDev,
          isDeepSync: syncMode === "deep",
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error (${res.status})`);
      }

      const data = await res.json();

      // Always refresh dashboard if any claims were created
      if (data.claimsCreated > 0) {
        onSuccess();
      }

      // Only throw if zero claims and there's an error
      if (!data.success && data.claimsCreated === 0) {
        throw new Error(data.error || "Sync failed");
      }
    });
  };

  const sourceIcon = (provider: string) => {
    switch (provider) {
      case "github":
        return <GitBranch className="w-5 h-5 text-violet-400" />;
      case "linear":
        return <Layers className="w-5 h-5 text-indigo-400" />;
      case "jira":
        return <Layout className="w-5 h-5 text-blue-400" />;
      default:
        return <Zap className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        id="magic-sync-unified"
        disabled={isThisCompanySyncing}
        className={`flex items-center justify-center gap-2 ${
          fullWidth ? "w-full py-3.5 rounded-xl" : "px-3 sm:px-4 py-2 rounded-xl"
        } bg-slate-800/80 border border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-500/10 hover:border-violet-400/50 font-bold text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isThisCompanySyncing ? (
          <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
        ) : (
          <Zap className="w-4 h-4 text-violet-400" />
        )}
        <span className={fullWidth ? "" : "hidden xs:inline"}>
          {isThisCompanySyncing ? "Syncing..." : "Magic Sync"}
        </span>
        {!fullWidth && !isThisCompanySyncing && <span className="xs:hidden">Sync</span>}
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-lg bg-slate-900 border-t md:border border-white/10 rounded-t-[2rem] md:rounded-2xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)] overflow-hidden max-h-[90vh] overflow-y-auto overscroll-none"
            >
              {/* Mobile grab handle */}
              <div className="w-full flex justify-center pt-3 pb-1 md:hidden bg-slate-900 absolute top-0 z-20">
                <div className="w-12 h-1.5 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="relative p-6 pt-10 md:pt-6 pb-4 bg-gradient-to-br from-violet-500/10 via-slate-900 to-cyan-500/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Magic Sync</h2>
                    <p className="text-slate-400 text-sm">AI analysis of your engineering tools</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-5">
                {/* Quick / Deep toggle */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Sync Mode</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSyncMode("quick")}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                        syncMode === "quick"
                          ? "bg-violet-500/10 border-violet-500/40 text-white"
                          : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Zap className="w-3.5 h-3.5 text-violet-400" /> Quick Sync
                      </div>
                      <p className="text-xs opacity-70">New activity since last sync</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSyncMode("deep")}
                      className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all text-left ${
                        syncMode === "deep"
                          ? "bg-cyan-500/10 border-cyan-500/40 text-white"
                          : "bg-slate-800/40 border-white/5 text-slate-400 hover:border-white/10"
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-sm">
                        <Bolt className="w-3.5 h-3.5 text-cyan-400" /> Deep Audit
                      </div>
                      <p className="text-xs opacity-70">Full year re-analysis</p>
                    </button>
                  </div>
                </div>

                {/* Data Sources */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Data Sources</label>
                  {isLoadingSources ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-slate-500 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {sources.map((source) => (
                        <div
                          key={source.provider}
                          className={`flex items-center justify-between p-3 rounded-xl border ${
                            source.connected
                              ? "bg-slate-800/50 border-white/10"
                              : "bg-slate-900/30 border-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {sourceIcon(source.provider)}
                            <div>
                              <div className="text-sm font-semibold text-white">{source.label}</div>
                              <div className="text-xs text-slate-400">{source.description}</div>
                            </div>
                          </div>
                          {source.connected ? (
                            <span className="text-xs font-medium px-2 py-1 rounded-md text-emerald-400 bg-emerald-400/10 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Connected
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                router.push("/settings/integrations");
                              }}
                              className="text-xs font-bold px-2.5 py-1 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-400 hover:bg-violet-500/20 hover:text-violet-300 transition-all flex items-center gap-1"
                            >
                              Connect <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Financial Scope */}
                <div className="space-y-2">
                  <label className="text-xs font-bold tracking-wider text-slate-400 uppercase">Financial Scope</label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-400 mb-1.5 ml-1">Total Salaries (€)</div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={salaryCosts}
                          onChange={(e) => setSalaryCosts(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 mb-1.5 ml-1">Dev Tools & Subs (€)</div>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="text"
                          value={devCosts}
                          onChange={(e) => setDevCosts(e.target.value)}
                          className="w-full bg-slate-950 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* CTA */}
                <button
                  onClick={handleSync}
                  disabled={!sources.some((s) => s.connected)}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                    syncMode === "deep"
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                      : "bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  {syncMode === "deep" ? "Start Deep Audit" : "Start Quick Sync"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
