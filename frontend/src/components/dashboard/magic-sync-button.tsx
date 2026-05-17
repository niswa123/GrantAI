"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Loader2, CheckCircle2, AlertCircle, X, Zap, DollarSign, Layout, Layers } from "lucide-react";
import { runUnifiedSync, getConnectedSources, type SyncSource } from "@/app/actions/unifiedSyncActions";

type SyncStage = "idle" | "fetching" | "analyzing" | "done" | "error";

interface MagicSyncButtonProps {
  companyId: string;
  onSuccess: () => void;
}

export function MagicSyncButton({ companyId, onSuccess }: MagicSyncButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [stage, setStage] = useState<SyncStage>("idle");
  const [salaryCosts, setSalaryCosts] = useState("100000");
  const [devCosts, setDevCosts] = useState("20000");
  const [sources, setSources] = useState<SyncSource[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadSources();
    }
  }, [isOpen]);

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
    setStage("fetching");
    const numSalary = parseInt(salaryCosts.replace(/\D/g, "")) || 0;
    const numDev = parseInt(devCosts.replace(/\D/g, "")) || 0;

    const connectedCount = sources.filter((s) => s.connected).length;
    if (connectedCount === 0) {
      setStage("error");
      setErrorMessage("Please connect at least one integration in Settings.");
      return;
    }

    try {
      const baseUrl = window.location.origin;
      const res = await runUnifiedSync({
        companyId,
        salaryCosts: numSalary,
        devCosts: numDev,
        baseUrl,
      });

      if (res.success) {
        setStage("done");
        setResultMessage(`Analyzed across ${connectedCount} sources. Identified ${res.claimsCreated} R&D projects!`);
        setTimeout(() => {
          setIsOpen(false);
          setStage("idle");
          onSuccess();
        }, 3000);
      } else {
        setStage("error");
        setErrorMessage(res.error || "Failed to identify R&D activities.");
      }
    } catch (err: any) {
      setStage("error");
      setErrorMessage(err.message || "An unexpected error occurred.");
    }
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
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-800/80 border border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-500/10 hover:border-violet-400/50 font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] touch-manipulation"
      >
        <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-violet-400" />
        <span className="hidden xs:inline">Magic Sync</span>
        <span className="xs:hidden">Sync</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
              onClick={() => stage === "idle" && setIsOpen(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 pb-4 bg-gradient-to-br from-violet-500/10 via-slate-900 to-cyan-500/10 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
                    <Zap className="w-5 h-5 text-violet-400" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">Unified Magic Sync</h2>
                    <p className="text-slate-400 text-sm">AI analysis of your engineering tools</p>
                  </div>
                </div>
                {stage === "idle" && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {stage === "idle" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    {/* Data Sources */}
                    <div className="space-y-3">
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
                                  : "bg-slate-900/30 border-white/5 opacity-50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                {sourceIcon(source.provider)}
                                <div>
                                  <div className="text-sm font-semibold text-white">{source.label}</div>
                                  <div className="text-xs text-slate-400">{source.description}</div>
                                </div>
                              </div>
                              <div className="text-xs font-medium px-2 py-1 rounded-md">
                                {source.connected ? (
                                  <span className="text-emerald-400 bg-emerald-400/10 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" /> Connected
                                  </span>
                                ) : (
                                  <span className="text-slate-500 bg-slate-800">Not connected</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Inputs */}
                    <div className="space-y-3">
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

                    <button
                      onClick={handleSync}
                      disabled={!sources.some((s) => s.connected)}
                      className="w-full py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Magic Sync
                    </button>
                  </motion.div>
                )}

                {stage === "fetching" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center text-center space-y-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                        <Zap className="w-8 h-8 text-violet-400 animate-pulse" />
                      </div>
                      <Loader2 className="absolute -bottom-2 -right-2 w-6 h-6 text-cyan-400 animate-spin" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">Analyzing Workspaces...</h3>
                      <p className="text-slate-400 text-sm">Fetching commits, sprints, and issues</p>
                    </div>
                  </motion.div>
                )}

                {stage === "error" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg mb-1">Sync Failed</h3>
                      <p className="text-slate-400 text-sm max-w-[280px]">{errorMessage}</p>
                    </div>
                    <button
                      onClick={() => setStage("idle")}
                      className="px-6 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}

                {stage === "done" && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                      </motion.div>
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-1">Sync Complete!</h3>
                      <p className="text-slate-400 text-sm">{resultMessage}</p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
