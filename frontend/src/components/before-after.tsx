"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { FileText, Clock, AlertCircle, Cpu, ShieldCheck, Zap } from "lucide-react";

export function BeforeAfterSection() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate the wipe effect for the new state
  // 0 to 0.3: hold
  // 0.3 to 0.7: wipe down
  // 0.7 to 1: hold
  const clipPathPercent = useTransform(scrollYProgress, [0.2, 0.7], [100, 0]);
  const clipPath = useTransform(clipPathPercent, (val) => `inset(0 0 ${val}% 0)`);
  
  // A glowing line that follows the wipe
  const lineTop = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);
  const lineOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.68, 0.7], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-slate-950">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center bg-slate-950">
        
        {/* Background glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)] rounded-full blur-3xl" />
        </div>

        {/* Header Text */}
        <div className="text-center mb-12 relative z-20">
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
            <span className="text-slate-300 text-xs font-bold uppercase tracking-[0.2em]">The Paradigm Shift</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-white">
            Transform your <span className="text-brand-primary">Engineering Capital.</span>
          </h2>
        </div>

        {/* The Comparison Card Container */}
        <div className="relative w-full max-w-5xl mx-auto px-4">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-[32px] overflow-hidden border border-white/5 shadow-2xl">
            
            {/* ======================================================= */}
            {/* LAYER 1: THE OLD WAY (Base Layer) */}
            {/* ======================================================= */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl p-8 md:p-12 flex flex-col justify-center">
              <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] -z-10" />
              
              <div className="flex flex-col md:flex-row gap-12 items-center h-full relative z-10">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/20 mb-6">
                    <AlertCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-bold text-white tracking-tight mb-2">The Old Way</h3>
                  <p className="text-slate-500 font-medium uppercase tracking-widest text-sm">Blind & Unquantified</p>
                </div>

                <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                  {[
                    { icon: FileText, text: "No visibility into daily R&D capital accumulation" },
                    { icon: Clock, text: "Code is seen as a cost center, not an asset" },
                    { icon: AlertCircle, text: "Impossible to prove R&D value objectively" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                      <item.icon className="w-6 h-6 text-red-400/70" />
                      <span className="text-slate-400 font-medium text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* LAYER 2: WITH GRANT AI (Revealed Layer) */}
            {/* ======================================================= */}
            <motion.div 
              style={{ clipPath }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl p-8 md:p-12 flex flex-col justify-center z-10"
            >
              {/* Ambient Cyan Glow inside the card */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_60%)] -z-10" />

              <div className="flex flex-col md:flex-row gap-12 items-center h-full relative z-10">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="w-16 h-16 rounded-2xl bg-brand-primary/20 flex items-center justify-center text-brand-primary border border-brand-primary/40 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <Zap className="w-8 h-8" />
                  </div>
                  <h3 className="text-4xl font-bold text-white tracking-tight mb-2">With GrantAI</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse shadow-[0_0_10px_#06b6d4]" />
                    <p className="text-brand-primary font-bold uppercase tracking-widest text-sm">Daily Transparency</p>
                  </div>
                </div>

                <div className="w-full md:w-2/3 grid grid-cols-1 gap-6">
                  {[
                    { icon: Cpu, text: "AI quantifies engineering value instantly" },
                    { icon: ShieldCheck, text: "Real-time dashboard of your R&D capital" },
                    { icon: FileText, text: "100% transparent and compliance-ready" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 rounded-2xl bg-brand-primary/[0.05] border border-brand-primary/20 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-primary/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <item.icon className="w-6 h-6 text-brand-primary" />
                      <span className="text-white font-medium text-lg">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* ======================================================= */}
            {/* THE SCANNER LINE */}
            {/* ======================================================= */}
            <motion.div 
              style={{ top: lineTop, opacity: lineOpacity }}
              className="absolute left-0 right-0 h-[2px] bg-brand-primary z-20 shadow-[0_0_30px_#06b6d4]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-gradient-to-t from-brand-primary/30 to-transparent -translate-y-full blur-sm" />
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
