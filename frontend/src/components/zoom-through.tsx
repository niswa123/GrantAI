"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

/**
 * ZOOM-THROUGH EFFECT
 * Fly into screen with massive scale transformation
 * Creates immersive "portal" effect
 * 
 * Re-designed with a highly creative, ultra-minimalist 
 * Asymmetric Compliance Matrix stats section that completely 
 * replaces the generic card grid, matching the NEURAL.SYNC cockpit aesthetic.
 */

export function ZoomThroughTransition() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Massive scale transformation - from tiny to huge
  const scale = useTransform(
    scrollYProgress,
    [0, 0.4, 0.7, 1],
    [0.2, 1, 10, 18]
  );

  // Screen opacity - fades out as we "enter" it
  const screenOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 0.65, 0.75],
    [1, 1, 0.4, 0]
  );

  // Border radius - becomes 0 as screen fills viewport
  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.4, 0.65],
    [32, 32, 0]
  );

  // Content that appears after zoom
  const contentOpacity = useTransform(
    scrollYProgress,
    [0.6, 0.72, 0.85],
    [0, 0, 1]
  );

  const contentY = useTransform(
    scrollYProgress,
    [0.6, 0.72, 0.85],
    [60, 30, 0]
  );

  // Background blur effect
  const backdropBlur = useTransform(
    scrollYProgress,
    [0, 0.4, 0.65],
    [0, 4, 16]
  );

  return (
    <>
      {/* ========== DESKTOP: Zoom Effect ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-slate-950" style={{ height: "150vh" }}>
        <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        
          {/* Background with blur effect */}
          <motion.div
            style={{
              filter: `blur(${backdropBlur}px)`,
              opacity: useTransform(scrollYProgress, [0, 0.5], [1, 0])
            }}
            className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950"
          >
            {/* Animated particles in background */}
            <div className="absolute inset-0">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                  style={{
                    left: `${(i * 13) % 100}%`,
                    top: `${(i * 27) % 100}%`,
                  }}
                  animate={{
                    y: [0, -30, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [1, 1.5, 1]
                  }}
                  transition={{
                    duration: 3 + ((i * 17) % 100) / 50,
                    repeat: Infinity,
                    delay: ((i * 31) % 100) / 50
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* The Screen/Portal we zoom into */}
          <motion.div
            style={{
              scale,
              opacity: screenOpacity,
              borderRadius
            }}
            className="relative w-[400px] h-[280px] bg-slate-900 border-4 border-cyan-500/50 shadow-[0_0_100px_rgba(6,182,212,0.5)] overflow-hidden"
          >
            {/* Screen Content - Minimalist Linear/Stripe style */}
            <div className="absolute inset-0 bg-slate-950 p-8 flex flex-col justify-between">
              
              {/* Top header - Technical & Futuristic */}
              <div className="flex items-center justify-between w-full border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <div className="relative flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 absolute" />
                    <motion.div 
                      animate={{ scale: [1, 2.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-emerald-400 absolute"
                    />
                  </div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-slate-300 font-mono ml-2">NEURAL.SYNC</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded uppercase tracking-wider border border-emerald-500/20 ml-1">Live</span>
                </div>
                <span className="text-[10px] uppercase tracking-widest text-slate-600 font-mono flex items-center gap-1.5">
                  <span className="w-1 h-1 bg-slate-600 rounded-full" />
                  Model_v4
                </span>
              </div>
              
              {/* Center Core - Dynamic Holographic Display */}
              <div className="flex flex-row items-center justify-between flex-1 mt-2">
                {/* Left side: Value & Status */}
                <div className="flex flex-col items-start justify-center h-full">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="flex flex-col"
                  >
                    <span className="text-[10px] text-cyan-400/70 uppercase tracking-[0.2em] font-mono mb-1">Uncertainty Found</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black tracking-tighter bg-gradient-to-br from-white via-slate-200 to-slate-500 text-transparent bg-clip-text font-mono">
                        99.8
                      </span>
                      <span className="text-2xl font-bold text-cyan-500 font-mono">%</span>
                    </div>
                  </motion.div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-3 flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/[0.05]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest">Processing Commits</span>
                  </motion.div>
                </div>

                {/* Right side: Abstract Animated Scanner */}
                <div className="relative w-28 h-28 flex items-center justify-center -mr-2">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 border-[1px] border-dashed border-cyan-500/30 rounded-full"
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-3 border-[1px] border-white/10 rounded-full flex items-center justify-center"
                  >
                     <div className="w-full h-[1px] bg-white/20 absolute" />
                     <div className="h-full w-[1px] bg-white/20 absolute" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-8 bg-cyan-500/20 rounded-full blur-md"
                  />
                  {/* Central Core Icon */}
                  <div className="z-10 bg-slate-950 p-2 rounded-full border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>
              </div>

              {/* Bottom abstract progress line / Waveform */}
              <div className="w-full h-4 relative flex flex-col justify-end overflow-hidden mt-4 gap-0.5">
                <div className="flex items-end h-full gap-[2px] opacity-40">
                  {[...Array(30)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', '100%', '20%'] }}
                      transition={{ 
                        duration: 1.5, 
                        repeat: Infinity, 
                        delay: i * 0.05,
                        ease: "easeInOut" 
                      }}
                      className="flex-1 bg-cyan-500/50 rounded-t-sm"
                    />
                  ))}
                </div>
                <div className="w-full h-[1px] bg-gradient-to-r from-cyan-500/10 via-cyan-500/60 to-cyan-500/10" />
              </div>
            </div>
          </motion.div>

          {/* Content that appears after zoom */}
          <motion.div
            style={{
              opacity: contentOpacity,
              y: contentY
            }}
            className="absolute inset-0 flex items-center justify-center bg-slate-950/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 text-center max-w-5xl">
              
              {/* Animated badge */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                className="inline-block mb-8"
              >
                <div className="px-6 py-3 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Zap className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                    <span className="text-cyan-400 font-bold uppercase tracking-wider font-mono text-[10px]">
                      LIGHTNING FAST PROCESSING
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main heading */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-6xl md:text-[5.5rem] font-black text-white mb-8 tracking-tighter leading-[1.05]"
              >
                A paradigm shift in{" "}
                <span className="text-cyan-400 drop-shadow-sm">
                  Engineering Capital.
                </span>
              </motion.h2>

              {/* Subheading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                className="text-lg md:text-xl text-slate-400 font-medium max-w-2xl mx-auto mb-14 leading-relaxed"
              >
                Stop losing daily R&D value. Welcome to real-time engineering capitalization.
              </motion.p>

              {/* Asymmetric Compliance Matrix Panel */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="w-full max-w-4xl mx-auto border border-white/5 bg-[#060813]/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative text-left"
              >
                {/* Top status bar */}
                <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-white/[0.01] select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      GRANT_AI // TRANSACTION METRICS // SECURED
                    </span>
                  </div>
                  <span className="font-mono text-[8px] text-slate-500 font-bold uppercase">
                    ACTIVE TELEMETRY
                  </span>
                </div>

                {/* Main panel - 3 asymmetric modules */}
                <div className="grid grid-cols-1 md:grid-cols-10 divide-y md:divide-y-0 md:divide-x divide-white/5">
                  
                  {/* Module 1: Daily Sync (Left - ColSpan 3) */}
                  <div className="md:col-span-3 p-6 flex flex-col justify-between min-h-[160px] relative group hover:bg-white/[0.01] transition-colors duration-300">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-cyan-400">
                        <Clock className="w-4 h-4" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">01 // AUTOMATED FLOW</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl font-black text-white tracking-tight">Daily</span>
                        <span className="text-lg font-black text-cyan-400 font-mono">Sync</span>
                      </div>
                    </div>

                    {/* Micro Log Ticker */}
                    <div className="mt-4 bg-black/40 border border-white/5 rounded-lg p-2.5 font-mono text-[8px] text-slate-400 h-11 overflow-hidden relative select-none">
                      <div className="flex flex-col gap-1 absolute top-2.5 left-2.5 right-2.5">
                        <motion.div 
                          animate={{ y: [0, -14, -28, 0] }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.33, 0.66, 1] }}
                          className="flex flex-col gap-1"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="text-cyan-400 font-bold">[INGEST]</span>
                            <span className="truncate">Webhook synced from @kmason</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-purple-400 font-bold">[SCORE]</span>
                            <span className="truncate">Technical uncertainty: 99.8%</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-emerald-400 font-bold">[LEDGER]</span>
                            <span className="truncate">Transaction sealed #82f1b</span>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Module 2: AI Confidence / Accuracy (Center - ColSpan 4) */}
                  <div className="md:col-span-4 p-6 flex flex-col justify-between min-h-[160px] relative group hover:bg-white/[0.01] transition-colors duration-300">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-pink-400">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">02 // DETERMINISTIC EVAL</span>
                      </div>
                      <div className="flex items-baseline gap-1 mt-1">
                        <span className="text-4xl font-black text-white tracking-tight font-mono">99.8</span>
                        <span className="text-2xl font-black text-pink-400 font-mono">%</span>
                        <span className="text-[9px] text-slate-500 font-mono font-bold uppercase ml-1">AI CONFIDENCE</span>
                      </div>
                    </div>

                    {/* Precision Interval Gauge */}
                    <div className="mt-4 flex flex-col gap-1.5 font-mono text-[8px] select-none">
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>ACCURACY VECTOR</span>
                        <span className="text-pink-400 font-black">99.82% / 100</span>
                      </div>
                      <div className="w-full h-1 bg-white/5 rounded-full relative overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: "99.82%" }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-pink-600 to-pink-400 rounded-full" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Module 3: Real-time Tracker / Accumulator (Right - ColSpan 3) */}
                  <div className="md:col-span-3 p-6 flex flex-col justify-between min-h-[160px] relative group hover:bg-white/[0.01] transition-colors duration-300">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" />
                        <span className="font-mono text-[9px] font-bold uppercase tracking-widest">03 // R&D LEDGER</span>
                      </div>
                      <div className="flex flex-col mt-1">
                        <span className="text-2xl font-black text-white tracking-tight leading-none">Real-time</span>
                        <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-1">Tracker</span>
                      </div>
                    </div>

                    {/* Real-time Ticking Currency Accumulator Counter */}
                    <div className="mt-4 bg-[#0a1112]/50 border border-emerald-500/10 rounded-lg p-2.5 flex justify-between items-center font-mono">
                      <div className="flex flex-col">
                        <span className="text-[7.5px] text-slate-500 font-bold uppercase">CAPITAL TRACKED</span>
                        <RealTimeLedgerTicker />
                      </div>
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold select-none">
                        LIVE ROI
                      </span>
                    </div>
                  </div>

                </div>
              </motion.div>

            </div>
          </motion.div>

          {/* Radial gradient overlay for depth */}
          <motion.div
            style={{
              opacity: useTransform(scrollYProgress, [0, 0.3, 0.5], [0, 0.5, 1])
            }}
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(2,6,23,0.8)_70%)] pointer-events-none"
          />
        </div>
      </div>

    </>
  );
}

/**
 * RealTimeLedgerTicker Component
 * Continuously increments and format currency for compliance matrix
 */
function RealTimeLedgerTicker() {
  const [value, setValue] = useState(1458720.00);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue(prev => prev + parseFloat((Math.random() * 0.12).toFixed(4)));
    }, 850);
    return () => clearInterval(interval);
  }, []);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  return (
    <span className="text-xs font-black text-white select-all">
      {formatter.format(value)}
    </span>
  );
}
