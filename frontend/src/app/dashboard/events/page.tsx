"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Network, BrainCircuit, Play, Loader2, AlertCircle } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import {
  getCompanyEvents,
  analyzeEvent,
  analyzePendingEvents,
} from "@/app/actions/eventActions";
import { EventAnalysisCard, type EventWithAnalysis } from "@/components/event-analysis-card";

export default function EventsPage() {
  const { activeWorkspace } = useWorkspace();
  const [events, setEvents] = useState<EventWithAnalysis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<string>>(new Set());
  const [isBulkAnalyzing, setIsBulkAnalyzing] = useState(false);
  const [bulkResult, setBulkResult] = useState<{ analyzed: number; failed: number } | null>(null);

  const loadEvents = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setIsLoading(true);
    try {
      const res = await getCompanyEvents(activeWorkspace.id, { pageSize: 50 });
      if (res.success && res.data) {
        setEvents(res.data as EventWithAnalysis[]);
      }
    } catch (err) {
      console.error("Failed to load events", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleAnalyzeSingle = async (eventId: string) => {
    setAnalyzingIds((prev) => new Set(prev).add(eventId));
    try {
      const res = await analyzeEvent(eventId);
      if (res.success) {
        // Refresh to get the updated status and analysis log
        await loadEvents();
      } else {
        console.error("Analysis failed:", res.error);
        // Optimistically update status to failed so user sees it
        setEvents((prev) =>
          prev.map((e) => (e.id === eventId ? { ...e, status: "failed" } : e))
        );
      }
    } finally {
      setAnalyzingIds((prev) => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  const handleBulkAnalyze = async () => {
    if (!activeWorkspace?.id) return;
    setIsBulkAnalyzing(true);
    setBulkResult(null);
    try {
      const res = await analyzePendingEvents(activeWorkspace.id);
      if (res.success) {
        setBulkResult({
          analyzed: res.result.analyzed,
          failed: res.result.failed,
        });
        await loadEvents();
      }
    } finally {
      setIsBulkAnalyzing(false);
    }
  };

  const pendingCount = events.filter((e) => e.status === "pending").length;

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 pt-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center">
                  <BrainCircuit className="w-4 h-4 text-cyan-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">
                  Neural Processing Engine
                </h1>
              </div>
              <p className="text-sm text-slate-400">
                AI pipeline evaluating {activeWorkspace.name} engineering events for R&D qualification.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-white/5">
              <div className="px-3 py-1.5 rounded-lg bg-slate-800 text-sm font-medium text-slate-300">
                <span className="text-white font-bold">{pendingCount}</span> pending
              </div>
              <button
                onClick={handleBulkAnalyze}
                disabled={isBulkAnalyzing || pendingCount === 0}
                className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.2)]"
              >
                {isBulkAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Analyze All
              </button>
            </div>
          </div>
        </motion.div>

        {bulkResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 rounded-xl bg-slate-900/50 border border-emerald-500/20 flex items-start gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <CheckSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-400">Batch Processing Complete</h3>
              <p className="text-sm text-slate-300 mt-1">
                Successfully analyzed {bulkResult.analyzed} events.
                {bulkResult.failed > 0 && ` Failed to analyze ${bulkResult.failed} events.`}
              </p>
            </div>
          </motion.div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500 mb-4" />
            <p className="text-slate-400 font-medium">Loading engineering pipeline...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-white/10">
              <Network className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No Engineering Events</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              Connect your GitHub or Jira integration to start analyzing your engineering work for R&D tax credits automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <EventAnalysisCard
                key={event.id}
                event={event}
                onAnalyze={handleAnalyzeSingle}
                isAnalyzing={analyzingIds.has(event.id)}
                onOverrideComplete={loadEvents}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckSquare(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="9 11 12 14 22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  );
}
