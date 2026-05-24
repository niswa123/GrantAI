"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import {
  CheckCircle2, XCircle, ChevronLeft, ChevronDown, ChevronUp,
  Copy, Check, Mail, Sparkles, TrendingUp, BarChart3, Shield,
  ThumbsUp, ThumbsDown, Brain, AlertTriangle, Lightbulb, FileText,
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
  // Rich fields from sessionStorage (full API response)
  chainOfThought?: Record<string, string>;
  criteriaScores?: Record<string, { score: number; justification: string }>;
  keyInnovations?: string[];
  disqualifyingFactors?: string[];
  riskFlags?: string[];
  recommendedEvidence?: string[];
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
function AccordionItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-white/5 rounded-xl overflow-hidden bg-white/2 hover:bg-white/3 transition-colors duration-200">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center px-4 py-3 text-left text-xs font-semibold text-slate-300 hover:text-white transition-colors select-none touch-manipulation"
      >
        <span>{title}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="px-4 pb-4 pt-1 text-xs text-slate-400 leading-relaxed border-t border-white/5 bg-slate-950/20">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ResultClient({ result: initialResult }: { result: ClaimResult }) {
  const [result, setResult] = useState<ClaimResult>(initialResult);
  const [claimExpanded, setClaimExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState<"rd" | "not_rd" | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const animatedRefund = useAnimatedNumber(result.estimatedRefund, 2.0);

  // Hydrate rich fields from sessionStorage (available on fresh calculation redirect)
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(`result:${initialResult.id}`);
      if (cached) {
        const api = JSON.parse(cached);
        setResult((prev) => ({
          ...prev,
          draftClaim: api.draftClaim || prev.draftClaim,
          classification: api.classification || prev.classification,
          confidenceScore: api.confidenceScore ?? prev.confidenceScore,
          estimatedRefund: api.estimatedRefund ?? prev.estimatedRefund,
          chainOfThought: api.chainOfThought,
          criteriaScores: api.criteriaScores,
          keyInnovations: api.keyInnovations,
          disqualifyingFactors: api.disqualifyingFactors,
          riskFlags: api.riskFlags,
          recommendedEvidence: api.recommendedEvidence,
        }));
        // Clear after use — it's single-use
        sessionStorage.removeItem(`result:${initialResult.id}`);
      }
    } catch {
      // sessionStorage unavailable — non-fatal
    }
  }, [initialResult.id]);

  const isRd = result.classification === "R&D";
  const confidencePct = Math.round((result.confidenceScore || 0) * 100);
  const creditRatePct = Math.round((result.creditRate || 0) * 100);

  const handleCopy = () => {
    const cleanClaim = result.draftClaim.replace(/\n\n<!-- GRANT_AI_METADATA:[\s\S]*?-->/g, "");
    navigator.clipboard.writeText(cleanClaim).then(() => {
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
    const cleanClaim = result.draftClaim.replace(/\n\n<!-- GRANT_AI_METADATA:[\s\S]*?-->/g, "");
    const body = encodeURIComponent(
      `Hello,\n\nI would like to proceed with my R&D tax credit application.\n\nEstimated refund: €${result.estimatedRefund.toFixed(2)}\n\nDraft claim:\n${cleanClaim}`
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

          {/* AI Analysis Dashboard */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 p-4 sm:p-5 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">AI Technical Analysis</h2>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed">{result.explanation}</p>

            {/* Criteria Scores Grid */}
            {result.criteriaScores && Object.keys(result.criteriaScores).length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">R&D Core Eligibility Criteria</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(result.criteriaScores).map(([key, item]: [string, any]) => {
                    const labelMap: Record<string, string> = {
                      novelty: "Technological Novelty",
                      technical_uncertainty: "Technological Uncertainty",
                      systematic_approach: "Systematic Approach",
                      transferability: "Transferability & Generality",
                      creative_element: "Creative & Experimental Element"
                    };
                    const label = labelMap[key] || key.replace(/_/g, ' ');
                    const pctScore = Math.round(item.score * 100);
                    
                    return (
                      <div 
                        key={key} 
                        className="p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 hover:bg-white/5 transition-all duration-300 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-xs font-semibold text-slate-300">{label}</span>
                            <span className={`text-xs font-mono font-bold ${item.score >= 0.5 ? "text-cyan-400" : "text-rose-400"}`}>
                              {pctScore}%
                            </span>
                          </div>
                          
                          {/* Progress bar container */}
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden mb-2">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${pctScore}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className={`h-full rounded-full ${item.score >= 0.5 ? "bg-cyan-500" : "bg-rose-500"}`}
                            />
                          </div>
                        </div>
                        
                        <p className="text-[11px] text-slate-400 leading-normal line-clamp-2 hover:line-clamp-none transition-all duration-300 mt-1">
                          {item.justification}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Chain of Thought Reasoning */}
            {result.chainOfThought && Object.keys(result.chainOfThought).length > 0 && (
              <div className="space-y-3 pt-3 border-t border-white/5">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Step-by-Step Technical Reasoning</h3>
                
                <div className="space-y-2">
                  {Object.entries(result.chainOfThought).map(([key, val]: [string, any], index) => {
                    const stepTitleMap: Record<string, string> = {
                      "1_identify_baseline": "1. Industry Technological Baseline",
                      "2_identify_advance": "2. Claimed Technological Advance",
                      "3_identify_uncertainty": "3. Core Technological Uncertainty",
                      "4_evaluate_methodology": "4. Systematic Investigation & Methodology",
                      "identify_baseline": "1. Industry Technological Baseline",
                      "identify_advance": "2. Claimed Technological Advance",
                      "identify_uncertainty": "3. Core Technological Uncertainty",
                      "evaluate_methodology": "4. Systematic Investigation & Methodology"
                    };
                    const label = stepTitleMap[key] || `Step ${index + 1}: ${key.replace(/_/g, ' ')}`;
                    
                    return (
                      <AccordionItem key={key} title={label} content={val} />
                    );
                  })}
                </div>
              </div>
            )}
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
                    Was the AI classification <strong className="text-white">&quot;{result.classification}&quot;</strong> correct?
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

          {/* Key Innovations (R&D) or Disqualifying Factors (Not R&D) */}
          {result.keyInnovations && result.keyInnovations.length > 0 && isRd && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
              className="rounded-xl sm:rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs sm:text-sm font-bold text-emerald-300 uppercase tracking-wider">Key Innovations Identified</h2>
              </div>
              <ul className="space-y-2">
                {result.keyInnovations.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {result.disqualifyingFactors && result.disqualifyingFactors.length > 0 && !isRd && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}
              className="rounded-xl sm:rounded-2xl bg-rose-500/5 border border-rose-500/15 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4 text-rose-400" />
                <h2 className="text-xs sm:text-sm font-bold text-rose-300 uppercase tracking-wider">Why It Does Not Qualify</h2>
              </div>
              <ul className="space-y-2">
                {result.disqualifyingFactors.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-rose-400 mt-0.5 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Recommended Evidence */}
          {result.recommendedEvidence && result.recommendedEvidence.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.38 }}
              className="rounded-xl sm:rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-white/8 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">
                  {isRd ? "Evidence to Prepare" : "What You Need to Strengthen the Claim"}
                </h2>
              </div>
              <ul className="space-y-2">
                {result.recommendedEvidence.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-amber-400 mt-0.5 shrink-0">→</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Risk Flags */}
          {result.riskFlags && result.riskFlags.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.40 }}
              className="rounded-xl sm:rounded-2xl bg-amber-500/5 border border-amber-500/15 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs sm:text-sm font-bold text-slate-300 uppercase tracking-wider">Risk Flags</h2>
              </div>
              <ul className="space-y-2">
                {result.riskFlags.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                    <span className="text-amber-400 mt-0.5 shrink-0">⚠</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Draft claim */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.42 }}
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
              <motion.div
                animate={{ height: claimExpanded ? "auto" : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden relative"
              >
                {result.draftClaim
                  ? <MarkdownRenderer content={result.draftClaim.replace(/\n\n<!-- GRANT_AI_METADATA:[\s\S]*?-->/g, "")} />
                  : (
                    <div className="text-center py-6">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      <p className="text-slate-500 text-sm">No draft claim generated.</p>
                      <p className="text-slate-600 text-xs mt-1">Improve your project description and try again.</p>
                    </div>
                  )
                }
                {!claimExpanded && result.draftClaim && (
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/90 to-transparent pointer-events-none" />
                )}
              </motion.div>
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
