"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Check, AlertCircle, Loader2 } from "lucide-react";
import { useSyncContext } from "@/contexts/SyncContext";

export function SyncToast() {
  const { isSyncing, statusMessage, progress, stopSync, error } = useSyncContext();
  const isDone = progress === 100 && !error;

  return (
    <AnimatePresence>
      {isSyncing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          {/* Backdrop click to close only if sync is done or failed */}
          {(isDone || error) && (
            <div className="absolute inset-0" onClick={stopSync} />
          )}

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative w-full max-w-sm bg-slate-900/90 border border-white/10 rounded-2xl p-6 shadow-[0_30px_70px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Close button in top-right */}
            <button
              onClick={stopSync}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Syncing State */}
            {!isDone && !error && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full border border-violet-500/20 flex items-center justify-center mb-4 relative">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
                
                <h3 className="text-white font-bold text-base tracking-tight mb-1">
                  Data Synchronization
                </h3>
                
                <p className="text-xs text-slate-400 max-w-[240px] min-h-[32px] mb-6 line-clamp-2">
                  {statusMessage}
                </p>

                {/* Elegant Minimal Progress Bar */}
                <div className="w-full space-y-2 mb-4">
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-violet-500 rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>ANALYZING & COLLECTING DATA</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                </div>

                <button
                  onClick={stopSync}
                  className="mt-2 text-xs font-bold text-slate-400 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
                >
                  Run in Background
                </button>
              </div>
            )}

            {/* Success State */}
            {isDone && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4">
                  <Check className="w-6 h-6 text-emerald-400" />
                </div>

                <h3 className="text-white font-bold text-base tracking-tight mb-2">
                  Sync Complete
                </h3>

                <p className="text-xs text-slate-400 max-w-[260px] mb-6">
                  All engineering logs have been successfully imported and analyzed. Your reports are ready for review.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full">
                  <button
                    onClick={stopSync}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                  >
                    Later
                  </button>
                  <button
                    onClick={() => {
                      stopSync();
                      window.location.reload();
                    }}
                    className="py-2.5 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white shadow-[0_4px_20px_rgba(124,58,237,0.25)] transition-all"
                  >
                    View Report
                  </button>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4">
                  <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>

                <h3 className="text-white font-bold text-base tracking-tight mb-2">
                  Sync Failed
                </h3>

                <p className="text-xs text-rose-300/90 max-w-[260px] mb-6 break-words">
                  {error}
                </p>

                <button
                  onClick={stopSync}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-800 border border-white/5 text-slate-300 hover:text-white hover:bg-slate-700 transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
