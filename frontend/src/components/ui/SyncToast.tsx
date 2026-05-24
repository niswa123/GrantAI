"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, X, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { useSyncContext } from "@/contexts/SyncContext";
import { useEffect, useState } from "react";

export function SyncToast() {
  const { isSyncing, statusMessage, progress, stopSync, error } = useSyncContext();
  const isDone = progress === 100 && !error;

  return (
    <AnimatePresence>
      {isSyncing && (
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.9 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            scale: isDone ? [1, 1.04, 1] : 1,
            boxShadow: isDone 
              ? "0 20px 60px rgba(16, 185, 129, 0.25), 0 0 40px rgba(16, 185, 129, 0.15), 0 0 0 1px rgba(16, 185, 129, 0.3)" 
              : "0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(6,182,212,0.15)"
          }}
          exit={{ opacity: 0, y: 80, scale: 0.9 }}
          transition={{ 
            type: "spring", 
            damping: 20, 
            stiffness: 250,
            scale: { duration: 0.5, ease: "easeOut" } 
          }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:bottom-6 sm:right-6 z-[200] sm:w-80 bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 overflow-hidden"
        >
          {/* Neon Shockwave Pulse on completion */}
          {isDone && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{ scale: 1.4, opacity: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="absolute inset-0 rounded-2xl border-2 border-emerald-500 pointer-events-none"
            />
          )}

          {/* High-speed Laser Sweep on completion */}
          {isDone && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.1 }}
              className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent skew-x-12 pointer-events-none z-10"
            />
          )}

          {/* Floating Sparkles Burst on completion */}
          {isDone && (
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: 80 + i * 35, y: 50, scale: 0, opacity: 0 }}
                  animate={{ 
                    y: [-10, -60], 
                    x: [80 + i * 35, 80 + i * 35 + (Math.random() * 40 - 20)],
                    scale: [0.5, 1, 0], 
                    opacity: [0, 1, 0] 
                  }}
                  transition={{ duration: 1.2 + Math.random() * 0.6, delay: i * 0.12, ease: "easeOut" }}
                  className="absolute"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400/80" />
                </motion.div>
              ))}
            </div>
          )}

          {/* Header */}
          <div className="flex items-center gap-3 mb-3 relative z-20">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden transition-all duration-500 ${error ? 'bg-rose-500/10 border border-rose-500/30' : isDone ? 'bg-emerald-500/20 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.4)]' : 'bg-cyan-500/10 border border-cyan-500/30'}`}>
              
              {/* Success Background Pulse */}
              {isDone && (
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-emerald-500/20 rounded-full"
                />
              )}

              {error ? (
                <AlertCircle className="w-5 h-5 text-rose-400" />
              ) : isDone ? (
                <motion.div
                  initial={{ scale: 0, rotate: -45 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </motion.div>
              ) : (
                <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-bold text-white">
                {error ? "Sync Failed" : isDone ? (
                  <span className="text-emerald-400 flex items-center gap-1.5 font-black">
                    Sync Complete! <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </span>
                ) : "Magic Sync"}
              </div>
              <motion.div
                key={statusMessage}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`text-xs text-slate-400 mt-0.5 ${error ? "whitespace-normal break-words" : "truncate"}`}
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
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full ${error ? 'bg-rose-500' : isDone ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-cyan-500'}`}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className={`text-[10px] ${error ? 'text-rose-400/80' : isDone ? 'text-emerald-400/80 font-bold' : 'text-slate-600'}`}>
              {error ? 'Error' : isDone ? 'Deterministic claim sealed' : 'AI Analysis'}
            </span>
            <span className={`text-[10px] font-mono ${isDone ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{error ? 'FAILED' : `${Math.round(progress)}%`}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
