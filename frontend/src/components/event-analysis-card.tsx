"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  GitCommit,
  GitPullRequest,
  CheckSquare
} from "lucide-react";
import { overrideClassification } from "@/app/actions/eventActions";

function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffInSeconds = (date.getTime() - Date.now()) / 1000;
  
  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(Math.round(diffInSeconds), "second");
  } else if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(Math.round(diffInSeconds / 60), "minute");
  } else if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(Math.round(diffInSeconds / 3600), "hour");
  } else {
    return rtf.format(Math.round(diffInSeconds / 86400), "day");
  }
}

export interface EventWithAnalysis {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  event_timestamp: Date;
  status: string;
  analyzed_log: {
    id: string;
    is_rd: boolean;
    confidence_score: number;
    complexity_weight: number;
    justification: string | null;
    user_override: boolean | null;
  } | null;
}

interface EventAnalysisCardProps {
  event: EventWithAnalysis;
  onAnalyze: (id: string) => void;
  isAnalyzing: boolean;
  onOverrideComplete: () => void;
}

export function EventAnalysisCard({
  event,
  onAnalyze,
  isAnalyzing,
  onOverrideComplete,
}: EventAnalysisCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [isOverriding, setIsOverriding] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

  const analysis = event.analyzed_log;
  const hasOverride = analysis?.user_override !== null;
  const isRd = analysis?.is_rd;

  const handleOverride = async (newIsRd: boolean) => {
    if (!analysis) return;
    setIsOverriding(true);
    setOverrideError(null);
    try {
      const res = await overrideClassification(analysis.id, newIsRd);
      if (res.success) {
        onOverrideComplete();
      } else {
        setOverrideError(res.error || "Failed to override");
      }
    } catch (err: any) {
      setOverrideError(err.message || "An error occurred");
    } finally {
      setIsOverriding(false);
    }
  };

  const Icon =
    event.event_type === "commit"
      ? GitCommit
      : event.event_type === "pr_merged"
      ? GitPullRequest
      : CheckSquare;

  return (
    <div className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-4 sm:p-5 transition-all hover:border-white/20">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-start gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center border border-white/5 flex-shrink-0">
            <Icon className="w-5 h-5 text-slate-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-base">
              {event.title}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-slate-400">
              <span className="capitalize">{event.event_type.replace("_", " ")}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700" />
              <span>{getRelativeTime(new Date(event.event_timestamp))}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          {event.status === "pending" ? (
            <button
              onClick={() => onAnalyze(event.id)}
              disabled={isAnalyzing}
              className="w-full sm:w-auto px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Brain className="w-4 h-4" />
              )}
              Analyze
            </button>
          ) : event.status === "failed" ? (
            <div className="flex items-center gap-2 text-rose-400 text-sm font-medium px-3 py-1.5 bg-rose-500/10 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              Failed
            </div>
          ) : analysis ? (
            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${
                  isRd
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-slate-800 text-slate-400 border border-white/5"
                }`}
              >
                {isRd ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {isRd ? "R&D" : "Routine"}
              </div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              >
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {expanded && analysis && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-white/5 space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                      AI Justification
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {analysis.justification || "No justification provided."}
                    </p>
                  </div>
                  {event.description && (
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                        Original Event Text
                      </span>
                      <p className="text-sm text-slate-400 leading-relaxed font-mono bg-slate-950 p-3 rounded-xl border border-white/5">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>

                <div className="sm:w-64 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-500 font-medium mb-1">Confidence</div>
                      <div className="text-lg font-mono text-white">
                        {Math.round(analysis.confidence_score * 100)}%
                      </div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-white/5">
                      <div className="text-xs text-slate-500 font-medium mb-1">Complexity</div>
                      <div className="text-lg font-mono text-cyan-400">
                        {analysis.complexity_weight.toFixed(2)}x
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/50 p-3 rounded-xl border border-cyan-500/10 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
                    <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider block mb-2 pl-2">
                      Auto-Tuning Feedback
                    </span>
                    <p className="text-xs text-slate-400 mb-3 pl-2">
                      Correct the AI to tune future classifications.
                    </p>
                    <div className="flex items-center gap-2 pl-2">
                      <button
                        onClick={() => handleOverride(true)}
                        disabled={isOverriding || (hasOverride && isRd)}
                        className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
                          hasOverride && isRd
                            ? "bg-emerald-500/20 text-emerald-400"
                            : "bg-slate-800 text-slate-300 hover:bg-emerald-500/10 hover:text-emerald-400"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        Is R&D
                      </button>
                      <button
                        onClick={() => handleOverride(false)}
                        disabled={isOverriding || (hasOverride && !isRd)}
                        className={`flex-1 py-2 px-2 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors ${
                          hasOverride && !isRd
                            ? "bg-slate-700 text-slate-300"
                            : "bg-slate-800 text-slate-300 hover:bg-rose-500/10 hover:text-rose-400"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5" />
                        Not R&D
                      </button>
                    </div>
                    {overrideError && (
                      <p className="text-xs text-rose-400 mt-2 pl-2">{overrideError}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
