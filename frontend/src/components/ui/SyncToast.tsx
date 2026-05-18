"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, CheckCircle2 } from "lucide-react";
import { useSyncContext } from "@/contexts/SyncContext";

export function SyncToast() {
  const { isSyncing, statusMessage, progress, stopSync } = useSyncContext();
  const isDone = progress === 100;

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="fixed bottom-6 right-6 z-[200] w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(139,92,246,0.15)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-violet-500/10 border border-violet-500/30'}`}>
              {isDone ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <Zap className="w-5 h-5 text-violet-400 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">
                {isDone ? "Sync Complete!" : "Magic Sync"}
              </div>
              <motion.div
                key={statusMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-xs text-slate-400 truncate mt-0.5"
              >
                {statusMessage}
              </motion.div>
            </div>
            {!isDone && (
              <button
                onClick={stopSync}
                className="text-slate-500 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${isDone ? 'bg-emerald-500' : 'bg-gradient-to-r from-violet-500 to-cyan-400'}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-slate-600">AI Analysis</span>
            <span className="text-[10px] text-slate-500 font-mono">{Math.round(progress)}%</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
