"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, Loader2, CheckCircle2 } from "lucide-react";

interface DailyLoggerProps {
  onAnalyze: (text: string) => Promise<void>;
}

export function DailyLogger({ onAnalyze }: DailyLoggerProps) {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setIsSuccess(false);
    setError(null);
    
    try {
      await onAnalyze(text);
      setIsSuccess(true);
      setText("");
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to analyze. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="w-full bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden group focus-within:border-cyan-500/50 transition-colors duration-500"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-700 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
            <Brain className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Daily Logger</h2>
            <p className="text-sm text-slate-400">Describe what you worked on today (e.g., Standup notes)</p>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="e.g., Refactored the authentication module to support OAuth2.0, fixing the memory leak in the token refresh loop..."
            className="w-full h-40 bg-slate-950/50 border border-slate-800 rounded-2xl p-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent resize-none transition-all duration-300"
            disabled={isAnalyzing}
          />
          
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
              >
                <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-400 text-xs font-bold">!</span>
                </div>
                <p className="text-sm text-red-300">{error}</p>
              </motion.div>
            )}
            
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 rounded-2xl bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-20"
              >
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full blur-md bg-cyan-500/40 animate-pulse" />
                    <Loader2 className="w-10 h-10 text-cyan-400 animate-spin relative z-10" />
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ repeat: Infinity, duration: 1.5, repeatType: "reverse" }}
                    className="text-cyan-400 font-medium tracking-wide"
                  >
                    AI is analyzing R&D value...
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleAnalyze}
            disabled={!text.trim() || isAnalyzing || isSuccess}
            className={`relative overflow-hidden px-8 py-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
              isSuccess 
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50"
                : text.trim() 
                  ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                  : "bg-slate-800 text-slate-500 cursor-not-allowed"
            }`}
          >
            <div className="flex items-center gap-2">
              {isSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Analyzed!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Analyze R&D Value</span>
                </>
              )}
            </div>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
