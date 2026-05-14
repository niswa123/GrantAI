"use client";

import { motion } from "framer-motion";
import { Clock, FileText, CheckCircle, ShieldCheck } from "lucide-react";

export interface ActivityLog {
  id: string;
  date: string;
  originalText: string;
  justification: string;
  value: number;
  confidence: number;
}

interface ActivityFeedProps {
  logs: ActivityLog[];
}

export function ActivityFeed({ logs }: ActivityFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="w-full space-y-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-slate-400" />
        <h3 className="text-xl font-bold text-white tracking-tight">Recent Activity Feed</h3>
      </div>

      <div className="space-y-4">
        {logs.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/20 rounded-3xl border border-slate-800 border-dashed">
            <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500">No logs yet. Start by logging your daily work above.</p>
          </div>
        ) : (
          logs.map((log, index) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="bg-slate-900/50 hover:bg-slate-900/80 transition-colors backdrop-blur-md border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 group"
            >
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1 space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                    <div className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-xs font-semibold">
                      {log.date}
                    </div>
                    <div className="flex items-center gap-1 text-emerald-400/80 text-xs font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Confidence: {Math.round(log.confidence * 100)}%
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">Original Log</h4>
                    <p className="text-slate-300 text-xs sm:text-sm leading-relaxed border-l-2 border-slate-700 pl-3 sm:pl-4 py-1 italic">
                      "{log.originalText}"
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">AI Justification</h4>
                    <p className="text-white text-xs sm:text-sm leading-relaxed bg-slate-950/50 p-3 sm:p-4 rounded-xl border border-slate-800">
                      {log.justification}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-start sm:gap-6 pt-3 border-t border-slate-800">
                  <div>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">R&D Value</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-base sm:text-xl font-bold text-cyan-400">€</span>
                      <span className="text-2xl sm:text-3xl font-black text-white">{log.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-emerald-400 bg-emerald-500/10 px-2.5 py-1.5 rounded-md text-xs font-medium">
                    <CheckCircle className="w-3 h-3" /> Qualified
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  );
}
