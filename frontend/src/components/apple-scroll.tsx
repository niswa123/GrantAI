"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { Terminal, Brain, Activity, ShieldCheck, FileCheck, Sparkles, GitBranch, GitCommit, Search, RefreshCw, Cpu, Layers } from "lucide-react";

/**
 * APPLE-STYLE STICKY SCROLL - PREMIUM PROCESS WORKSPACE REDESIGN
 * Modelled after the high-fidelity laboratory dashboard design in process_redesign.png.
 * Consolidates the 3 steps into a unified, widescreen Cockpit Workstation.
 * Scrolling or clicking highlights specific modules with active indicators and springs.
 */

interface Commit {
  time: string;
  author: string;
  tag: string;
  msg: string;
  hash: string;
  avatar: string;
}

const mockCommits: Commit[] = [
  { time: "03:45:12", author: "@alucas", tag: "FEAT", msg: "Optimized AI scoring model", hash: "a8c309", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=32&h=32&q=80" },
  { time: "03:47:01", author: "@kmason", tag: "FIX", msg: "Resolved race in Step 2 pipeline", hash: "d1f2e9", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32&q=80" },
  { time: "03:47:45", author: "@kmason", tag: "FIX", msg: "AST parser cache boundary mismatch", hash: "d2f2e9", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=32&h=32&q=80" }
];

interface LedgerRow {
  date: string;
  event: string;
  roi: string;
  balance: string;
  positive: boolean;
}

const mockLedger: LedgerRow[] = [
  { date: "18/05/23", event: "ACCUMULATED CAPITAL ROI", roi: "+$13,906", balance: "$1,438.96", positive: true },
  { date: "20/05/23", event: "DEITRANSACTION EXCLUSION", roi: "-1.82%", balance: "$16.08", positive: false },
  { date: "26/05/23", event: "CROREF-BYBON VERIFIER", roi: "+18.23%", balance: "$1,458.00", positive: true },
  { date: "28/05/23", event: "TRANSACT-SEC COMPLETED", roi: "-3.30%", balance: "$31.83", positive: false },
  { date: "23/10/22", event: "DETERMINISTIC LEDGER ACCUM", roi: "+1.35%", balance: "$55.08", positive: true }
];

export function AppleStyleStickyScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 70,
    damping: 24,
    restDelta: 0.001
  });

  // Map scroll progress to the active workflow step (0, 1, or 2)
  useEffect(() => {
    const unsubscribe = smoothProgress.on("change", (latest) => {
      const step = Math.min(Math.floor(latest * 3), 2);
      setActiveStep(Math.max(0, step));
    });
    return unsubscribe;
  }, [smoothProgress]);

  const handleTabClick = (index: number) => {
    if (!containerRef.current) return;
    const elementHeight = containerRef.current.clientHeight;
    // Calculate precise target scroll position based on step bounds
    const targetScrollTop = containerRef.current.offsetTop + (index / 3) * elementHeight + 40;

    window.scrollTo({
      top: targetScrollTop,
      behavior: "smooth"
    });
  };

  return (
    <>
      {/* ========== DESKTOP: Widescreen Sticky Cockpit Workspace ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-[#04060d]" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen flex flex-col justify-between py-8 overflow-hidden select-none">

          <div className="container mx-auto px-6 max-w-7xl flex flex-col h-full justify-between gap-6">

            {/* Top Workspace Header Bar (STELLARIS FLOW Operational Style) */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                <span className="font-mono text-xs font-bold text-white tracking-widest uppercase">
                  GRANT AI v1.4 // OPERATIONAL TERMINAL // [LIVE]
                </span>
              </div>
              <div className="flex items-center gap-6 font-mono text-[10px] text-slate-500">
                <span>SYSTEM STATUS: <span className="text-emerald-400 font-bold">NOMINAL</span></span>
                <span>DATA FLOW: <span className="text-cyan-400 font-bold">1.2 GB/S</span></span>
              </div>
            </div>

            {/* Premium Workflow Chevron Selector Stepper */}
            <div className="max-w-4xl mx-auto w-full border border-white/5 bg-[#070a14]/80 backdrop-blur-xl rounded-xl p-1 flex gap-1 relative z-30 shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
              {[
                { step: "01", title: "Daily Logging", label: "INGESTION PIPELINE" },
                { step: "02", title: "AI Valuation", label: "REAL-TIME SCORING" },
                { step: "03", title: "Value Flow", label: "DETERMINISTIC LEDGER" }
              ].map((tab, idx) => {
                const isActive = activeStep === idx;
                const activeColorClass =
                  idx === 0 ? "text-cyan-400" :
                    idx === 1 ? "text-pink-400" :
                      "text-emerald-400";

                return (
                  <button
                    key={idx}
                    onClick={() => handleTabClick(idx)}
                    className="flex-1 py-3 px-5 rounded-lg flex items-center justify-between transition-all duration-300 relative group font-mono"
                  >
                    {/* Sliding spring layout active background */}
                    {isActive && (
                      <motion.div
                        layoutId="activeWorkspaceTabPill"
                        className="absolute inset-0 rounded-lg bg-slate-900 border border-white/10 z-0 shadow-lg"
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                        style={{
                          boxShadow: "0 4px 14px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.05)"
                        }}
                      />
                    )}

                    {/* Step label text and status */}
                    <div className="relative z-10 flex items-center gap-3">
                      <span
                        className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-bold border transition-colors duration-300"
                        style={{
                          borderColor: isActive ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.03)",
                          backgroundColor: isActive ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                          color: isActive ? "#ffffff" : "#475569"
                        }}
                      >
                        {tab.step}
                      </span>
                      <div className="flex flex-col text-left">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-white" : "text-slate-500"}`}>
                          {tab.title}
                        </span>
                        <span className="text-[7.5px] font-bold text-slate-500/80 tracking-widest">{tab.label}</span>
                      </div>
                    </div>

                    {/* Glowing dot for status flow */}
                    {isActive && (
                      <motion.div
                        layoutId="activeWorkspaceTabDot"
                        className={`w-1.5 h-1.5 rounded-full relative z-10 shrink-0 ${idx === 0 ? "bg-cyan-400" : idx === 1 ? "bg-pink-400" : "bg-emerald-400"
                          }`}
                        transition={{ type: "spring", stiffness: 120, damping: 18 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Widescreen Cockpit 3-Column Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch flex-1 w-full max-h-[62vh] relative">

              {/* === COLUMN 1: Daily Logging (01 // INGESTION PIPELINE) === */}
              <div
                className={`flex flex-col justify-between border rounded-xl p-5 bg-[#070b16]/60 backdrop-blur-xl relative overflow-hidden transition-all duration-500 ${activeStep === 0
                  ? "border-cyan-500/30 shadow-[0_0_30px_rgba(34,211,238,0.08)] scale-[1.01]"
                  : "border-white/5 opacity-30 blur-[0.4px] scale-[0.99]"
                  }`}
              >
                {/* Subtle blueprint background grid lines for inactive modules */}
                {activeStep !== 0 && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />
                )}

                <div className="flex flex-col gap-4">
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="font-mono text-[9px] font-black text-cyan-400 tracking-wider">
                      [ 01 // INGESTION PIPELINE ]
                    </span>
                    <span className="font-mono text-[8px] text-slate-500 font-bold uppercase">INPUT RATE: 1.2 GB/S</span>
                  </div>

                  {/* Text Information block */}
                  <div className="text-left select-text">
                    <h3 className="text-lg font-black text-white tracking-tight mb-1">Daily Logging</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-ch">
                      Engineers simply drop standup notes or commit summaries. Zero formatting required, raw context captured when fresh.
                    </p>
                  </div>

                  {/* SOURCE CODE FEED Terminal Viewport */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-lg p-3 flex flex-col gap-1 w-full text-[9px] leading-tight select-none font-mono">
                    <div className="text-slate-500 uppercase font-bold border-b border-white/5 pb-1 mb-1.5 flex justify-between text-[8px]">
                      <span>FILE: auth_verifier.go</span>
                      <span className="text-cyan-400 font-black">INGEST_COMPLIANT</span>
                    </div>
                    <div className="text-slate-400">func verifyRndScope(ctx Context) &#123;</div>
                    <div className="bg-red-950/30 text-red-400 px-1 py-0.5 rounded flex items-center">-&nbsp;&nbsp;hours := getStandardLogs()</div>
                    <div className="bg-emerald-950/30 text-emerald-400 px-1 py-0.5 rounded flex items-center">+&nbsp;&nbsp;hours := getTraceTelemetry()</div>
                    <div className="bg-emerald-950/30 text-emerald-400 px-1 py-0.5 rounded flex items-center">+&nbsp;&nbsp;// Technical Scope: Compiler optimization and parallel loops</div>
                    <div className="bg-emerald-950/30 text-emerald-400 px-1 py-0.5 rounded flex items-center">+&nbsp;&nbsp;defer metrics.Trace(ctx, "verifyScope", hours)</div>
                    <div className="text-slate-400">&#125;</div>
                  </div>
                </div>

                {/* DEVELOPER COMMITS Realtime Stream */}
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/5">
                  <span className="font-mono text-[8px] font-bold text-slate-500 text-left">DEVELOPER COMMITS SYNCED:</span>
                  <div className="flex flex-col gap-1.5">
                    {mockCommits.map((cmt, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-[8.5px] font-mono bg-slate-950/40 p-1.5 rounded border border-white/5 text-left">
                        <div className="flex items-center gap-2 truncate max-w-[70%]">
                          <img src={cmt.avatar} alt="" className="w-3.5 h-3.5 rounded-full object-cover shrink-0 border border-white/10" />
                          <span className="text-cyan-400 font-bold shrink-0">{cmt.author}</span>
                          <span className="text-slate-300 truncate">{cmt.msg}</span>
                        </div>
                        <span className="text-slate-500 shrink-0 text-[8px]">{cmt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* === COLUMN 2: AI Valuation (02 // REAL-TIME SCORING) === */}
              <div
                className={`flex flex-col justify-between border rounded-xl p-5 bg-[#070b16]/60 backdrop-blur-xl relative overflow-hidden transition-all duration-500 ${activeStep === 1
                  ? "border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.08)] scale-[1.01]"
                  : "border-white/5 opacity-30 blur-[0.4px] scale-[0.99]"
                  }`}
              >
                {/* Blueprint lines */}
                {activeStep !== 1 && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />
                )}

                <div className="flex flex-col gap-4">
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="font-mono text-[9px] font-black text-pink-400 tracking-wider">
                      [ 02 // REAL-TIME SCORING ]
                    </span>
                    <span className="font-mono text-[8px] text-slate-500 font-bold uppercase">LLM KERNEL: ACTIVE</span>
                  </div>

                  {/* Text Info */}
                  <div className="text-left select-text">
                    <h3 className="text-lg font-black text-white tracking-tight mb-1">AI Valuation</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-ch">
                      Our LLM instantly assesses technical uncertainty and assigns a confidence score, translating context into qualified Euro capital value.
                    </p>
                  </div>

                  {/* REAL-TIME SCORING Speedometer SVG Dial */}
                  <div className="flex flex-col items-center justify-center bg-slate-950/60 rounded-lg p-3.5 border border-white/5 relative">
                    <div className="relative w-36 h-20 flex items-center justify-center overflow-hidden">
                      <svg width="144" height="80" viewBox="0 0 144 80" className="overflow-visible">
                        <defs>
                          <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f472b6" />
                            <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                        </defs>
                        {/* Background track path */}
                        <path
                          d="M 12 70 A 60 60 0 0 1 132 70"
                          fill="none"
                          stroke="rgba(255,255,255,0.04)"
                          strokeWidth="8"
                          strokeLinecap="round"
                        />
                        {/* Filled compliance track path */}
                        <path
                          d="M 12 70 A 60 60 0 0 1 132 70"
                          fill="none"
                          stroke="url(#dialGradient)"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray="188"
                          strokeDashoffset={activeStep === 1 ? "134" : "188"}
                          className="transition-all duration-1000 ease-out"
                          style={{ opacity: activeStep === 1 ? 1 : 0 }}
                        />
                        {/* Rotating indicator needle */}
                        <g
                          transform="translate(72, 70)"
                          style={{
                            transform: activeStep === 1 ? "translate(72px, 70px) rotate(-38deg)" : "translate(72px, 70px) rotate(-90deg)",
                            transition: "transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)"
                          }}
                        >
                          <line x1="0" y1="0" x2="0" y2="-56" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />
                          <circle cx="0" cy="0" r="4.5" fill="#070b16" stroke="#ec4899" strokeWidth="2" />
                        </g>
                      </svg>
                    </div>
                    {/* Technical reading centered readout label - Placed below SVG to prevent overlapping */}
                    <div className="flex flex-col items-center select-none font-mono mt-1 z-20">
                      <span className="text-[14px] font-black text-white leading-none">{activeStep === 1 ? "28.4%" : "0.0%"}</span>
                      <span className="text-[7.5px] text-slate-500 font-bold tracking-wider mt-1 uppercase">TECHNICAL UNCERTAINTY</span>
                    </div>
                  </div>
                </div>

                {/* CONFIDENCE INTERVAL and Transaction Ticker */}
                <div className="flex flex-col gap-3 mt-4 pt-3 border-t border-white/5 select-none">
                  <div className="grid grid-cols-2 gap-3 text-[8.5px] font-mono">
                    <div className="flex flex-col items-start bg-slate-950/40 p-2 rounded border border-white/5 text-left w-full">
                      <span className="text-slate-500 font-bold uppercase mb-1">CONFIDENCE:</span>
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-emerald-400 font-black">{activeStep === 1 ? "92.1%" : "0.0%"}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-emerald-400 rounded-full transition-all duration-1000 ${activeStep === 1 ? "w-[92%]" : "w-0"}`} />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-start bg-slate-950/40 p-2 rounded border border-white/5 text-left w-full">
                      <span className="text-slate-500 font-bold uppercase mb-1">UNCERTAINTY:</span>
                      <div className="flex items-center gap-1.5 w-full">
                        <span className="text-pink-400 font-black">{activeStep === 1 ? "7.9%" : "0.0%"}</span>
                        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full bg-pink-400 rounded-full transition-all duration-1000 ${activeStep === 1 ? "w-[8%]" : "w-0"}`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculated Euro Value Generated */}
                  <div className="bg-[#0e0c1b]/80 border border-pink-500/10 rounded-lg p-2.5 flex justify-between items-center select-none shadow-md font-mono">
                    <div className="flex items-center gap-2">
                      <Brain className="w-3.5 h-3.5 text-pink-400" />
                      <span className="text-[9px] font-bold text-white uppercase">CALCULATED VALUE GENERATED:</span>
                    </div>
                    <div className="flex items-baseline gap-0.5 font-bold text-[14px] text-pink-400">
                      <span>{activeStep === 1 ? "€3,240.50" : "€0.00"}</span>
                      <span className="text-[8px] text-slate-500 font-bold uppercase">EUR</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* === COLUMN 3: Value Flow (03 // DETERMINISTIC LEDGER) === */}
              <div
                className={`flex flex-col justify-between border rounded-xl p-5 bg-[#070b16]/60 backdrop-blur-xl relative overflow-hidden transition-all duration-500 ${activeStep === 2
                  ? "border-emerald-500/30 shadow-[0_0_30px_rgba(52,211,153,0.08)] scale-[1.01]"
                  : "border-white/5 opacity-30 blur-[0.4px] scale-[0.99]"
                  }`}
              >
                {/* Blueprint lines */}
                {activeStep !== 2 && (
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none z-10" />
                )}

                <div className="flex flex-col gap-4">
                  {/* Module Header */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="font-mono text-[9px] font-black text-emerald-400 tracking-wider">
                      [ 03 // DETERMINISTIC LEDGER ]
                    </span>
                    <span className="font-mono text-[8px] text-slate-500 font-bold uppercase">CAPITAL ACCUMULATED</span>
                  </div>

                  {/* Text Info */}
                  <div className="text-left select-text">
                    <h3 className="text-lg font-black text-white tracking-tight mb-1">Value Flow</h3>
                    <p className="text-[11px] text-slate-400 leading-relaxed max-w-ch">
                      Watch your engineering ROI accumulate daily. Gain total transparency into your R&D capital, ready for compliance without yearly audits.
                    </p>
                  </div>

                  {/* Ledger Capital ROI Line Chart (Beautiful SVG Area path) */}
                  <div className="bg-slate-950/60 rounded-lg p-3 border border-white/5 relative flex flex-col justify-between select-none">
                    <div className="flex justify-between items-baseline font-mono mb-2">
                      <span className="text-[7.5px] font-bold text-slate-500 uppercase">ACCUMULATED CAPITAL ROI:</span>
                      <span className="text-[13px] font-black text-white">$1,458,720.00 <span className="text-[8.5px] text-emerald-400 font-black">[ROI: 14.8%]</span></span>
                    </div>
                    <div className="relative w-full h-24 overflow-visible mt-1">
                      <svg width="100%" height="100%" viewBox="0 0 200 80" preserveAspectRatio="none" className="overflow-visible">
                        <defs>
                          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor="#34d399" stopOpacity="0.16" />
                            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        {/* Area Fill */}
                        <path
                          d="M 0 80 L 0 70 Q 30 65, 60 72 T 120 45 T 180 20 L 200 10 L 200 80 Z"
                          fill="url(#areaGradient)"
                        />
                        {/* Line Stroke */}
                        <path
                          d="M 0 70 Q 30 65, 60 72 T 120 45 T 180 20 L 200 10"
                          fill="none"
                          stroke="#34d399"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeDasharray="350"
                          strokeDashoffset={activeStep === 2 ? "0" : "350"}
                          className="transition-all duration-[1500ms] ease-out"
                        />
                        {/* Interactive Peak Point */}
                        <circle
                          cx="200"
                          cy="10"
                          r="3.5"
                          fill="#070b16"
                          stroke="#34d399"
                          strokeWidth="1.8"
                          className="transition-all duration-500 ease-out"
                          style={{
                            opacity: activeStep === 2 ? 1 : 0,
                            transform: activeStep === 2 ? "scale(1)" : "scale(0)",
                            transformOrigin: "200px 10px",
                            transitionDelay: activeStep === 2 ? "1200ms" : "0ms"
                          }}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Deterministic Ledger Workbook Table */}
                <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-white/5">
                  <span className="font-mono text-[8px] font-bold text-slate-500 text-left">LEDGER TRANSACTION RECORDS:</span>
                  <div className="flex flex-col gap-1 select-text">
                    {mockLedger.map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-12 gap-1 text-[8px] font-mono p-1 rounded hover:bg-slate-900/30 text-left items-center">
                        <span className="col-span-2 text-slate-500">{row.date}</span>
                        <span className="col-span-6 text-slate-300 truncate font-semibold uppercase">{row.event}</span>
                        <span className={`col-span-2 font-bold text-right ${row.positive ? "text-emerald-400" : "text-amber-500"}`}>{row.roi}</span>
                        <span className="col-span-2 text-slate-400 font-semibold text-right">{row.balance}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Status bar with detail compliance summaries */}
            <div className="flex items-center gap-3 px-5 py-3.5 rounded-xl bg-[#070b16] border border-white/5 font-mono text-[9.5px] text-slate-400 select-none text-left relative overflow-hidden">
              <span className="font-bold text-white uppercase tracking-tight truncate flex-1">
                {activeStep === 0 && "INGESTING COMMITS AND NOTES DIRECTLY FROM GITHUB WEBHOOKS & JIRA EPICS..."}
                {activeStep === 1 && "EVALUATING TECHNICAL UNCERTAINTY INDEXES AND COGNITIVE R&D ELIGIBILITIES..."}
                {activeStep === 2 && "SEALING COMPLIANCE RECORDS IN CRYPTOGRAPHIC DETERMINISTIC FINANCIAL LEDGERS..."}
              </span>
              <div
                className="absolute bottom-0 left-0 h-[2px] transition-all duration-700"
                style={{
                  width: `${(activeStep + 1) * 33.3}%`,
                  backgroundColor: activeStep === 0 ? "#22d3ee" : activeStep === 1 ? "#ec4899" : "#34d399"
                }}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ========== MOBILE: Premium Responsive Timeline Flow ========== */}
      <div className="md:hidden relative bg-[#04060d] py-16 px-4 overflow-hidden">
        {/* Subtle background ambient glows */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[10%] left-[-20%] w-[80vw] h-[80vw] bg-cyan-500/5 rounded-full blur-[90px]" />
          <div className="absolute top-[50%] right-[-20%] w-[80vw] h-[80vw] bg-purple-500/5 rounded-full blur-[90px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[80vw] h-[80vw] bg-emerald-500/5 rounded-full blur-[90px]" />
        </div>

        <div className="relative z-10 w-full flex flex-col items-center">

          {/* Header Block */}
          <div className="mb-14 text-center max-w-lg">
            <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] text-slate-400 tracking-wider uppercase mb-5">
              [ ZERO FRICTION AUTOMATED PIPELINE ]
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter leading-none mb-4">
              The smartest way to track <br />
              <span className="text-cyan-400">Engineering Value</span>
            </h2>
          </div>

          {/* Vertical Responsive Mobile Timeline */}
          <div className="relative w-full max-w-md">

            {/* Timeline Vertical Central Cable */}
            <div className="absolute top-[32px] bottom-[32px] left-[23px] w-[1px] bg-gradient-to-b from-cyan-500/40 via-purple-500/40 to-emerald-500/40" />

            <div className="flex flex-col gap-12 relative z-10">

              {/* Step 1: Ingestion Mobile Card */}
              <div className="relative flex items-start gap-4">
                {/* Visual Step Indicator Ring */}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-cyan-500/20 bg-cyan-500/5 backdrop-blur-xl">
                  <span className="font-mono text-xs font-black text-cyan-400">01</span>
                  <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyan-400 border border-slate-950" />
                </div>

                {/* Step Ingestion Content Card */}
                <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-xl text-left select-text relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 opacity-40 blur-[30px] pointer-events-none" />
                  <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Step 01 // INGESTION PIPELINE</span>
                  <h3 className="text-base font-black text-white mb-0.5">Daily Logging</h3>
                  <div className="text-xs font-bold text-cyan-400 mb-3 font-mono">Capture work in seconds</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    Engineers simply drop their daily standup notes or commit summaries into the log. No formatting required, just raw engineering context captured when it's fresh.
                  </p>

                  {/* Commits block inside mobile view */}
                  <div className="border-t border-white/5 pt-3.5 flex flex-col gap-1.5">
                    <span className="font-mono text-[8px] font-bold text-slate-500 uppercase mb-1">REALTIME SYNCED DEV COMMITS:</span>
                    {mockCommits.slice(0, 2).map((cmt, cIdx) => (
                      <div key={cIdx} className="flex items-center justify-between text-[8px] font-mono bg-slate-950/60 p-1.5 rounded border border-white/5">
                        <div className="flex items-center gap-1.5 truncate max-w-[80%]">
                          <span className="text-cyan-400 font-bold shrink-0">{cmt.author}</span>
                          <span className="text-slate-300 truncate">{cmt.msg}</span>
                        </div>
                        <span className="text-slate-500 text-[7.5px]">{cmt.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Step 2: AI Valuation Mobile Card */}
              <div className="relative flex items-start gap-4">
                {/* Visual Step Indicator Ring */}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-pink-500/20 bg-pink-500/5 backdrop-blur-xl">
                  <span className="font-mono text-xs font-black text-pink-400">02</span>
                  <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-pink-400 border border-slate-950" />
                </div>

                {/* Step Valuation Content Card */}
                <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-xl text-left select-text relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 opacity-40 blur-[30px] pointer-events-none" />
                  <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Step 02 // REAL-TIME SCORING</span>
                  <h3 className="text-base font-black text-white mb-0.5">AI Valuation</h3>
                  <div className="text-xs font-bold text-pink-400 mb-3 font-mono">Real-time scoring</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    Our proprietary LLM instantly assesses technical uncertainty and assigns a confidence score, converting raw text into a quantified Euro value of R&D capital.
                  </p>

                  {/* Premium Typographic Diagnostics Readout (Robust, highly aesthetic) */}
                  <div className="bg-slate-950/60 rounded-lg p-3.5 border border-white/5 flex flex-col gap-3 select-none w-full font-mono">
                    <div className="flex items-center justify-between text-[8px] text-slate-500 border-b border-white/5 pb-1.5 uppercase font-bold">
                      <span>METRIC: TECHNICAL_UNCERTAINTY</span>
                      <span className="text-pink-400">PASSED [0.84]</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col text-left">
                        <span className="text-slate-500 text-[7px] uppercase tracking-wider font-bold">VALUATION SCORE</span>
                        <span className="text-sm font-black text-white mt-0.5 tracking-tight">28.4%</span>
                      </div>
                      <div className="flex flex-col text-right">
                        <span className="text-slate-500 text-[7px] uppercase tracking-wider font-bold">CONFIDENCE INDEX</span>
                        <span className="text-emerald-400 text-[10px] font-bold mt-0.5">92.1% ACC</span>
                      </div>
                    </div>

                    {/* High-Tech Monospaced Segment Bar */}
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between font-mono text-[7px] text-slate-600">
                        <span>0%</span>
                        <span>50% [THRESHOLD]</span>
                        <span>100%</span>
                      </div>
                      <div className="grid gap-0.5 h-1.5 w-full" style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}>
                        {Array.from({ length: 20 }).map((_, i) => {
                          const val = (i + 1) * 5; // each block is 5%
                          const isActive = val <= 30; // 30% is close to 28.4% (6 active blocks)
                          return (
                            <div 
                              key={i} 
                              className={`h-full rounded-[1px] transition-all duration-700 ${
                                isActive 
                                  ? "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.6)]" 
                                  : "bg-white/5"
                              }`}
                            />
                          );
                        })}
                      </div>
                    </div>

                    <div className="text-[7.5px] text-slate-400 leading-normal text-left pt-1 border-t border-white/5 flex justify-between">
                      <span>HASH: SHA-256 [A8C309]</span>
                      <span>SECURED TRACE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Value Flow Mobile Card */}
              <div className="relative flex items-start gap-4">
                {/* Visual Step Indicator Ring */}
                <div className="relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-xl">
                  <span className="font-mono text-xs font-black text-emerald-400">03</span>
                  <div className="absolute -left-[10px] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
                </div>

                {/* Step Ledger Content Card */}
                <div className="flex-1 bg-slate-900/40 border border-white/5 rounded-xl p-5 shadow-xl text-left select-text relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 opacity-40 blur-[30px] pointer-events-none" />
                  <span className="font-mono text-[8px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Step 03 // DETERMINISTIC LEDGER</span>
                  <h3 className="text-base font-black text-white mb-0.5">Value Flow</h3>
                  <div className="text-xs font-bold text-emerald-400 mb-3 font-mono">Dashboard aggregation</div>
                  <p className="text-[11px] text-slate-400 leading-relaxed mb-4">
                    Watch your engineering ROI accumulate daily. Gain total transparency into your R&D capital, ready for compliance without the yearly audit stress.
                  </p>

                  {/* Mini-ledger dashboard for mobile view */}
                  <div className="bg-slate-950/60 rounded-lg p-3.5 border border-white/5 flex flex-col gap-1 select-none">
                    <div className="flex justify-between items-baseline font-mono text-[8px]">
                      <span className="text-slate-500 uppercase font-bold">ACCUMULATED ROI:</span>
                      <span className="text-white font-black">$1,458,720.00</span>
                    </div>
                    <div className="flex justify-between items-baseline font-mono text-[8px]">
                      <span className="text-slate-500 uppercase font-bold">CONVERSION INDEX:</span>
                      <span className="text-emerald-400 font-black">+14.8% (STATUTORY)</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </>
  );
}
