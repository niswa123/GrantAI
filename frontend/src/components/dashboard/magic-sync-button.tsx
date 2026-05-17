"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Github, Loader2, CheckCircle2, AlertCircle, X, Zap, DollarSign } from "lucide-react";
import { runGitHubSync } from "@/app/actions/githubSyncActions";

type SyncStage = "idle" | "fetching" | "analyzing" | "done" | "error";

interface MagicSyncModalProps {
  companyId: string;
  onClose: () => void;
  onSuccess: () => void; // refresh dashboard claims after sync
}

function MagicSyncModal({ companyId, onClose, onSuccess }: MagicSyncModalProps) {
  const [stage, setStage] = useState<SyncStage>("idle");
  const [salaryCosts, setSalaryCosts] = useState("50000");
  const [devCosts, setDevCosts] = useState("20000");
  const [claimsCreated, setClaimsCreated] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  const handleStart = async () => {
    setStage("fetching");
    setErrorMsg("");

    const salary = parseFloat(salaryCosts) || 0;
    const dev = parseFloat(devCosts) || 0;

    if (salary + dev <= 0) {
      setStage("error");
      setErrorMsg("Please enter at least one cost value greater than zero.");
      return;
    }

    setStage("analyzing");

    const result = await runGitHubSync({
      companyId,
      salaryCosts: salary,
      devCosts: dev,
      baseUrl: window.location.origin,
    });

    if (result.success) {
      setClaimsCreated(result.claimsCreated);
      setStage("done");
      // Refresh the dashboard list
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2500);
    } else {
      setStage("error");
      setErrorMsg(result.error ?? "Sync failed. Please try again.");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={(e) => e.target === e.currentTarget && stage === "idle" && onClose()}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 bg-gradient-to-br from-violet-500/10 via-slate-900 to-cyan-500/10 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <Github className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">Magic Sync via GitHub</h2>
              <p className="text-slate-400 text-xs mt-0.5">AI analysis of your repositories</p>
            </div>
          </div>
          {stage === "idle" && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-6 space-y-5">
          {/* Idle: cost input form */}
          {stage === "idle" && (
            <>
              <p className="text-slate-400 text-sm">
                GrantAI will scan your GitHub repositories, analyze commit history with AI,
                and automatically create R&D claims on your dashboard. No manual input needed.
              </p>

              <div className="space-y-3">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Annual Salary Costs (€)
                  </span>
                  <div className="relative mt-1.5">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={salaryCosts}
                      onChange={(e) => setSalaryCosts(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                      placeholder="50000"
                      min="0"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Annual Dev / Contractor Costs (€)
                  </span>
                  <div className="relative mt-1.5">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="number"
                      value={devCosts}
                      onChange={(e) => setDevCosts(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/25 transition-all"
                      placeholder="20000"
                      min="0"
                    />
                  </div>
                </label>
              </div>

              <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3.5">
                <p className="text-xs text-slate-400">
                  <span className="text-violet-400 font-semibold">How it works:</span>{" "}
                  We scan your last 90 days of commits across up to 10 repositories
                  and generate one R&D claim per repo. Costs are split equally between repos.
                </p>
              </div>

              <button
                onClick={handleStart}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm hover:shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-all duration-300 active:scale-95"
              >
                <Zap className="w-4 h-4" />
                Start Magic Sync
              </button>
            </>
          )}

          {/* Fetching / Analyzing */}
          {(stage === "fetching" || stage === "analyzing") && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center">
                  <Github className="w-8 h-8 text-violet-400" />
                </div>
                <Loader2 className="absolute -bottom-1 -right-1 w-5 h-5 text-cyan-400 animate-spin" />
              </div>

              <div className="text-center">
                <p className="text-white font-semibold">
                  {stage === "fetching" ? "Connecting to GitHub…" : "AI is analyzing your code…"}
                </p>
                <p className="text-slate-400 text-sm mt-1">
                  {stage === "fetching"
                    ? "Fetching repositories and commit history"
                    : "Running the R&D classification pipeline"}
                </p>
              </div>

              {/* Animated progress dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full bg-cyan-400"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.25 }}
                  />
                ))}
              </div>

              <p className="text-xs text-slate-500 text-center">
                This usually takes 30–60 seconds
              </p>
            </div>
          )}

          {/* Done */}
          {stage === "done" && (
            <div className="flex flex-col items-center py-6 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-lg">Sync Complete! 🎉</p>
                <p className="text-slate-400 text-sm mt-1">
                  Created{" "}
                  <span className="text-emerald-400 font-bold">{claimsCreated}</span>{" "}
                  R&D claim{claimsCreated !== 1 ? "s" : ""} from your GitHub data
                </p>
              </div>
              <p className="text-xs text-slate-500">Refreshing your dashboard…</p>
            </div>
          )}

          {/* Error */}
          {stage === "error" && (
            <div className="flex flex-col items-center py-4 gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-rose-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-bold">Sync Failed</p>
                <p className="text-slate-400 text-sm mt-1">{errorMsg}</p>
              </div>
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => setStage("idle")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-white text-sm font-semibold hover:bg-slate-700 transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 border border-white/10 text-slate-400 text-sm font-semibold hover:text-white transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Exported button + modal container ──────────────────────────────────────────

export function MagicSyncButton({
  companyId,
  onSuccess,
}: {
  companyId: string;
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        id="magic-sync-github"
        className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl bg-slate-800/80 border border-violet-500/30 text-violet-300 hover:text-white hover:bg-violet-500/10 hover:border-violet-400/50 font-bold text-xs sm:text-sm transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)] hover:shadow-[0_0_25px_rgba(139,92,246,0.25)] touch-manipulation"
      >
        <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden xs:inline">Magic Sync</span>
        <span className="xs:hidden">Sync</span>
        <Zap className="w-3 h-3" />
      </button>

      <AnimatePresence>
        {open && (
          <MagicSyncModal
            companyId={companyId}
            onClose={() => setOpen(false)}
            onSuccess={onSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}
