"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronDown, ChevronUp,
  Copy, Check, Mail, Sparkles, TrendingUp, BarChart3, Shield,
  ThumbsUp, ThumbsDown, Brain,
} from "lucide-react";

/** Lightweight Markdown renderer — no external deps. Handles: ## h2, **bold**, ---, paragraphs */
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  const renderInline = (text: string, key: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/);
    return (
      <span key={key}>
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={pi} className="text-white font-semibold">{part.slice(2, -2)}</strong>
            : part
        )}
      </span>
    );
  };

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      elements.push(
        <h2 key={i} className="text-sm font-bold text-violet-400 uppercase tracking-wider mt-5 mb-2 first:mt-0">
          {line.slice(3)}
        </h2>
      );
    } else if (line === "---") {
      elements.push(<hr key={i} className="border-white/8 my-4" />);
    } else if (line.trim() === "") {
      // skip blank lines between blocks
    } else {
      elements.push(
        <p key={i} className="text-slate-300 text-sm leading-relaxed mb-2">
          {renderInline(line, `inline-${i}`)}
        </p>
      );
    }
    i++;
  }

  return <div>{elements}</div>;
}

export interface ClaimResult {
  id: string;
  date: string;
  description: string;
  salaryCosts: number;
  devCosts: number;
  totalCosts: number;
  classification: "R&D" | "Not R&D";
  confidenceScore: number;
  explanation: string;
  estimatedRefund: number;
  creditRate: number;
  draftClaim: string;
  model: string;
  status: string;
  companyId?: string;
}

function useAnimatedNumber(target: number, duration = 2.0) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => Math.round(v));
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const ctrl = animate(motionVal, target, { duration, ease: "easeOut" });
    const unsub = rounded.on("change", setDisplay);
    return () => { ctrl.stop(); unsub(); };
  }, [target, duration, motionVal, rounded]);
  return display;
}

function BreakdownRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-3 border-b border-white/5 last:border-0 ${highlight ? "text-white font-bold" : "text-slate-400"}`}>
      <span className="text-sm">{label}</span>
      <span className={`font-mono text-sm ${highlight ? "text-cyan-400 text-base" : ""}`}>{value}</span>
    </div>
  );
}

export default function ResultClient({ result }: { result: ClaimResult }) {
  const [claimExpanded, setClaimExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"rd" | "not_rd" | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const animatedRefund = useAnimatedNumber(result.estimatedRefund, 2.0);

  const isRd = result.classification === "R&D";
  const confidencePct = Math.round((result.confidenceScore || 0) * 100);
  const creditRatePct = Math.round((result.creditRate || 0) * 100);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.draftClaim).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleFeedback = async (userIsRd: boolean) => {
    if (feedbackGiven || feedbackLoading) return;
    setFeedbackLoading(true);
    try {
      await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claimId: result.id, userIsRd }),
      });
      setFeedbackGiven(userIsRd ? "rd" : "not_rd");
    } catch {
      // silent fail
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleContact = () => {
    const subject = encodeURIComponent("GrantAI — R&D Tax Credit Application");
    const body = encodeURIComponent(
      `Hello,\n\nI would like to proceed with my R&D tax credit application.\n\nEstimated refund: €${result.estimatedRefund.toFixed(2)}\n\nDraft claim:\n${result.draftClaim}`
    );
    window.location.href = `mailto:hello@grantai.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient glows */}
      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[140px] pointer-events-none ${isRd ? "bg-cyan-500/8" : "bg-rose-500/6"}`} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-20 sm:pt-24 pb-16 sm:pb-24">
        {/* Back */}
        <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6 sm:mb-8 group touch-manipulation">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Classification badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-bold border ${
              isRd ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-rose-500/10 border-rose-500/30 text-rose-400"
            }`}
          >
            {isRd ? <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            {isRd ? "Qualifies as R&D" : "Does not qualify as R&D"}
          </motion.div>

          {/* Hero refund number */}
          <div>
            <p className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Estimated R&amp;D Refund</p>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 100, damping: 15 }}
            >
              <span className={`text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-none ${
                isRd ? "text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.3)]" : "text-slate-600"
              }`}>
                €{animatedRefund.toLocaleString("en-EU")}
              </span>
            </motion.div>
            {isRd && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-slate-400 text-xs sm:text-sm mt-2 leading-relaxed">
                Based on €{result.totalCosts.toLocaleString("en-EU")} total costs × {confidencePct}% confidence × {creditRatePct}% credit rate
              </motion.p>
            )}
          </div>

          {/* Cost breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-slate-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Calculation Breakdown</h2>
            </div>
            <BreakdownRow label="Salary Costs" value={`€${(result.salaryCosts || 0).toLocaleString("en-EU")}`} />
            <BreakdownRow label="Development Costs" value={`€${(result.devCosts || 0).toLocaleString("en-EU")}`} />
            <BreakdownRow label="Total Eligible Costs" value={`€${(result.totalCosts || 0).toLocaleString("en-EU")}`} />
            <BreakdownRow label="AI Confidence Score" value={`${confidencePct}%`} />
            <BreakdownRow label="Credit Rate" value={`${creditRatePct}%`} />
            <BreakdownRow label="Estimated Refund" value={`€${(result.estimatedRefund || 0).toLocaleString("en-EU", { minimumFractionDigits: 2 })}`} highlight />
          </motion.div>

          {/* AI explanation */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">AI Analysis</h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>
          </motion.div>

          {/* Feedback block */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
            className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-4 h-4 text-violet-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Train the AI</h2>
              <span className="ml-auto text-[10px] text-slate-500 font-medium">Your feedback improves future results</span>
            </div>

            <AnimatePresence mode="wait">
              {feedbackGiven ? (
                <motion.div
                  key="thanks"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-sm text-emerald-400 font-medium py-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Thanks! Your correction has been saved and will improve future classifications.
                </motion.div>
              ) : (
                <motion.div key="buttons" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="text-xs text-slate-400 mb-3">
                    Was the AI classification <strong className="text-white">"{result.classification}"</strong> correct?
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleFeedback(true)}
                      disabled={feedbackLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-sm font-semibold hover:bg-emerald-500/20 transition-all touch-manipulation disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Yes, correct
                    </button>
                    <button
                      onClick={() => handleFeedback(false)}
                      disabled={feedbackLoading}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-400 text-sm font-semibold hover:bg-rose-500/20 transition-all touch-manipulation disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      No, wrong
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Draft claim */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 overflow-hidden">
            <div className="flex items-center justify-between p-4 sm:p-5 pb-0">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Draft Application Text</h2>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/5 touch-manipulation">
                  {copied ? <><Check className="w-3.5 h-3.5 text-emerald-400" /><span className="hidden xs:inline"> Copied!</span></> : <><Copy className="w-3.5 h-3.5" /><span className="hidden xs:inline"> Copy</span></>}
                </button>
                <button onClick={() => setClaimExpanded((v) => !v)}
                  className="flex items-center gap-1 sm:gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors px-2 sm:px-3 py-1.5 rounded-lg hover:bg-white/5 touch-manipulation">
                  {claimExpanded ? <><ChevronUp className="w-3.5 h-3.5" /><span className="hidden xs:inline"> Collapse</span></> : <><ChevronDown className="w-3.5 h-3.5" /><span className="hidden xs:inline"> Expand</span></>}
                </button>
              </div>
            </div>
            <div className="px-4 sm:px-5 py-4">
              <AnimatePresence initial={false}>
                <motion.div key={claimExpanded ? "exp" : "col"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                  <div className={`${!claimExpanded ? "max-h-40 sm:max-h-48 overflow-hidden relative" : ""}`}>
                    {result.draftClaim
                      ? <MarkdownRenderer content={result.draftClaim} />
                      : <p className="text-slate-500 text-sm italic">No draft claim generated.</p>
                    }
                    {!claimExpanded && result.draftClaim && (
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
              {!claimExpanded && result.draftClaim && (
                <button onClick={() => setClaimExpanded(true)} className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors font-semibold touch-manipulation">
                  Show full draft →
                </button>
              )}
            </div>
          </motion.div>

          {/* CTAs */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <button onClick={handleContact} id="contact-cta"
              className="flex items-center justify-center gap-2 sm:gap-2.5 py-3.5 sm:py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 hover:from-cyan-400 hover:to-cyan-300 transition-all duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-[1.01] touch-manipulation">
              <Mail className="w-4 h-4" /> Apply Now — Contact Us
            </button>
            <Link href="/input" id="new-calculation-cta"
              className="flex items-center justify-center gap-2 sm:gap-2.5 py-3.5 sm:py-4 rounded-xl font-bold text-sm border border-white/10 text-slate-300 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-300 touch-manipulation">
              <Sparkles className="w-4 h-4 text-cyan-400" /> New Calculation
            </Link>
          </motion.div>

          {/* Footer */}
          <p className="text-center text-xs text-slate-600">
            Results generated by {result.model} · Not legal or tax advice ·{" "}
            {new Date(result.date).toLocaleDateString("en-EU", { day: "numeric", month: "long", year: "numeric" })}
          </p>
        </motion.div>
      </div>
    </div>
  );
}
