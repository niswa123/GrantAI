"use client";

import React, { useEffect, useRef } from "react";
import { MainLayout } from "@/components/main-layout";
import { Hero } from "@/components/hero";
import { AppleStyleStickyScroll } from "@/components/apple-scroll";
import { ZoomThroughTransition } from "@/components/zoom-through";
import { HorizontalScrollSection } from "@/components/horizontal-scroll";
import { BeforeAfterSection } from "@/components/before-after";
import { motion, useMotionValue, useTransform, animate, useInView, useScroll } from "framer-motion";
import { ArrowRight, Clock, FileText, AlertCircle, Brain, Zap, ShieldCheck, Cpu, Sparkles, Database, Activity, Terminal, GitBranch, GitCommit, Cloud, LayoutGrid, ListTodo, Server } from "lucide-react";
import { Navbar } from "@/components/navbar";

function AnimatedCounter({ from, to, duration = 2, delay = 0, isDecimal = false }: { from: number, to: number, duration?: number, delay?: number, isDecimal?: boolean }) {
  const count = useMotionValue(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const display = useTransform(count, (latest) => 
    isDecimal ? Number(latest.toFixed(1)) : Math.round(latest)
  );

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration, delay, ease: "easeOut" });
    }
  }, [count, to, duration, delay, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

export default function Home() {
  const parallaxRef = useRef<HTMLElement>(null);
  const zoomPortalRef = useRef<HTMLElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });

  // Zoom-Through Portal scroll transforms
  const { scrollYProgress: zoomProgress } = useScroll({
    target: zoomPortalRef,
    offset: ["start end", "end start"]
  });
  const zoomScale = useTransform(zoomProgress, [0, 0.6, 1], [1, 12, 80]);
  const zoomOpacity = useTransform(zoomProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const portalTextOpacity = useTransform(zoomProgress, [0, 0.25, 0.5], [1, 0.3, 0]);
  const pipelineReveal = useTransform(zoomProgress, [0.6, 1], [0, 1]);
  const curtainY = useTransform(zoomProgress, [0, 1], ["0%", "-110%"]);
  const curtainBgReveal = useTransform(zoomProgress, [0, 1], [0, 1]);

  const yFast = useTransform(scrollYProgress, [0, 1], [-250, 250]);
  const yMedium = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 }
    }
  };

  return (
    <MainLayout>
      <Navbar />
      <Hero />

      
      {/* ============================================ */}
      {/* SECTION 1: INTEGRATIONS (Sticky — gets overlapped by Stats) */}
      {/* ============================================ */}
      <div className="relative z-20 w-full bg-slate-950 rounded-t-[40px] md:rounded-t-[60px] shadow-[0_-40px_80px_rgba(0,0,0,0.8)] border-t border-white/5">
        <div className="h-[140vh] relative">
          <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
            <section ref={parallaxRef} className="container mx-auto px-4 relative flex flex-col items-center justify-center">
          
          <div className="text-center z-20 mb-20 md:mb-32 relative">
            <motion.h2 
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white"
            >
              A growing library of <span className="text-cyan-400">Integrations</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium"
            >
              We plug directly into your engineering ecosystem. No manual data entry ever again.
            </motion.p>
          </div>

          <div className="relative w-full max-w-6xl h-[550px] flex items-center justify-center">
            {/* Center Core */}
            <motion.div 
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="absolute z-10 w-44 h-44 rounded-full bg-slate-950/80 border border-cyan-500/30 flex items-center justify-center shadow-[0_0_80px_rgba(6,182,212,0.3)] backdrop-blur-3xl"
            >
              {/* Radar spin */}
              <div className="absolute inset-[-80px] border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-150px] border border-cyan-500/5 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed" />
              <div className="absolute inset-[-220px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center animate-[pulse_3s_ease-in-out_infinite] shadow-[inset_0_0_30px_rgba(255,255,255,0.4)] relative">
                <span className="text-white font-black text-3xl tracking-tighter drop-shadow-lg relative z-10">GrantAI</span>
                <div className="absolute inset-0 bg-white/20 rounded-full blur-md" />
              </div>
            </motion.div>

            {/* Background Radial */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.08),transparent_60%)] -z-10" />

            {/* Orbiting / Floating Tech Nodes */}
            <motion.div style={{ y: yFast }} className="absolute top-[8%] left-[5%] md:left-[12%] group">
              <div className="absolute inset-0 bg-blue-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl group-hover:-translate-y-2 group-hover:border-blue-500/50 transition-all duration-500 cursor-default">
                <LayoutGrid className="w-6 h-6 text-blue-400" />
                <span className="text-white font-bold text-lg tracking-wide">Jira</span>
              </div>
            </motion.div>
            
            <motion.div style={{ y: ySlow }} className="absolute bottom-[15%] left-[2%] md:left-[8%] group">
              <div className="absolute inset-0 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl group-hover:-translate-y-2 group-hover:border-white/40 transition-all duration-500 cursor-default">
                <GitBranch className="w-6 h-6 text-white" />
                <span className="text-white font-bold text-lg tracking-wide">GitHub</span>
              </div>
            </motion.div>

            <motion.div style={{ y: yMedium }} className="absolute top-[20%] right-[2%] md:right-[12%] group">
              <div className="absolute inset-0 bg-orange-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl group-hover:-translate-y-2 group-hover:border-orange-500/50 transition-all duration-500 cursor-default">
                <GitCommit className="w-6 h-6 text-orange-500" />
                <span className="text-white font-bold text-lg tracking-wide">GitLab</span>
              </div>
            </motion.div>

            <motion.div style={{ y: yFast }} className="absolute bottom-[8%] right-[8%] md:right-[18%] group">
              <div className="absolute inset-0 bg-amber-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-6 py-4 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-3 shadow-2xl group-hover:-translate-y-2 group-hover:border-amber-500/50 transition-all duration-500 cursor-default">
                <Cloud className="w-6 h-6 text-amber-500" />
                <span className="text-white font-bold text-lg tracking-wide">AWS</span>
              </div>
            </motion.div>

            <motion.div style={{ y: ySlow }} className="absolute top-[2%] left-[35%] md:left-[42%] group">
              <div className="absolute inset-0 bg-purple-500/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-5 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-2xl group-hover:-translate-y-2 group-hover:border-purple-500/50 transition-all duration-500 cursor-default">
                <ListTodo className="w-5 h-5 text-purple-400" />
                <span className="text-white font-bold text-md tracking-wide">Linear</span>
              </div>
            </motion.div>

            <motion.div style={{ y: yMedium }} className="absolute bottom-[22%] right-[28%] md:right-[33%] group">
              <div className="absolute inset-0 bg-blue-400/30 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative px-5 py-3 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-full flex items-center gap-2 shadow-2xl group-hover:-translate-y-2 group-hover:border-blue-400/50 transition-all duration-500 cursor-default">
                <Server className="w-5 h-5 text-blue-400" />
                <span className="text-white font-bold text-md tracking-wide">Azure</span>
              </div>
            </motion.div>
          </div>
        </section>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* APPLE-STYLE STICKY SCROLL SECTION */}
      {/* Premium storytelling with animated dashboard */}
      {/* ============================================ */}
      <AppleStyleStickyScroll />

      {/* ============================================ */}
      {/* ZOOM-THROUGH TRANSITION */}
      {/* Fly into screen effect - immersive portal */}
      {/* ============================================ */}
      <ZoomThroughTransition />

      {/* ============================================ */}
      {/* SECTION 2: STATS (Slides OVER Integrations — Stacking Cards) */}
      {/* ============================================ */}
      <div className="relative z-30 w-full bg-slate-950 rounded-t-[40px] md:rounded-t-[60px] shadow-[0_-60px_100px_rgba(0,0,0,0.9)] border-t border-white/10">
        <section className="py-24 md:py-32 container mx-auto px-4 relative overflow-hidden">
          <motion.div 
            className="glass-card rounded-[40px] p-12 md:p-16 lg:p-24 relative overflow-hidden group border-white/5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          whileHover={{ boxShadow: "0 0 80px rgba(6, 182, 212, 0.15)", borderColor: "rgba(255,255,255,0.1)" }}
          transition={{ duration: 0.5 }}
        >
          {/* Animated Magic Gradient Background */}
          <div className="absolute top-0 right-0 w-full lg:w-2/3 h-full bg-gradient-to-l from-blue-600/10 via-cyan-500/5 to-transparent blur-[80px] -z-10 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="max-w-2xl">
              <motion.h2 variants={itemVariants} className="text-4xl md:text-6xl font-bold mb-6 text-gradient tracking-tight leading-[1.1]">
                Measure engineering <br /> value in real time.
              </motion.h2>
              <motion.p variants={itemVariants} className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed">
                Every day, your engineers create R&D value that goes unmeasured. GrantAI captures it the moment it happens — turning daily work logs into a continuous financial signal.
              </motion.p>
              
              <motion.div variants={itemVariants} className="grid grid-cols-2 gap-10 pt-10 border-t border-white/5">
                <motion.div whileHover={{ y: -8, scale: 1.05 }} className="transition-all duration-300 relative">
                  {/* Glowing spark behind the number */}
                  <div className="absolute top-1/2 left-0 w-24 h-24 bg-emerald-500/15 blur-2xl -translate-y-1/2 -z-10 rounded-full" />
                  
                  <div className="text-5xl md:text-6xl font-black mb-3 tracking-tighter text-white">
                    <span className="text-cyan-500">€</span>
                    <AnimatedCounter from={0} to={1240} duration={2.5} delay={0.5} isDecimal={false} />
                  </div>
                  <div className="text-sm md:text-base text-slate-500 uppercase tracking-[0.2em] font-semibold">Daily Value Tracked</div>
                </motion.div>
                <motion.div whileHover={{ y: -8, scale: 1.05 }} className="transition-all duration-300 relative">
                  {/* Glowing spark behind the number */}
                  <div className="absolute top-1/2 left-0 w-20 h-20 bg-cyan-500/20 blur-2xl -translate-y-1/2 -z-10 rounded-full" />
                  
                  <div className="text-5xl md:text-6xl font-black mb-3 tracking-tighter text-white">
                    <AnimatedCounter from={0} to={99.8} duration={2.5} delay={0.7} isDecimal={true} />
                    <span className="text-cyan-500">%</span>
                  </div>
                  <div className="text-sm md:text-base text-slate-500 uppercase tracking-[0.2em] font-semibold">AI Confidence Score</div>
                </motion.div>
              </motion.div>
            </div>

            {/* Right Holographic Animation — Real-time Value Dashboard */}
            <motion.div 
              variants={itemVariants} 
              className="relative h-[450px] w-full flex items-center justify-center hidden md:flex perspective-[1500px]"
            >
              {/* Central Glowing Core */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-[250px] h-[250px] bg-cyan-500/20 rounded-full blur-[80px] -z-10" 
              />
              
              <div className="relative w-[340px] h-[380px] transform-style-3d">
                
                {/* Back Layer: Raw Daily Logs */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: -60, z: -80, opacity: 0 }}
                  whileInView={{ opacity: 0.4 }}
                  animate={{ y: [0, -15, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", opacity: { duration: 1 } }}
                  className="absolute inset-0 bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="flex gap-3 items-center mb-5 opacity-40">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-600 tracking-wider">DAILY LOGS</div>
                  </div>
                  <div className="space-y-3 opacity-30">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <div className="w-full h-2 bg-slate-700/50 rounded" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <div className="w-4/5 h-2 bg-slate-700/50 rounded" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600/60" />
                      <div className="w-3/5 h-2 bg-slate-700/50 rounded" />
                    </div>
                  </div>
                </motion.div>

                {/* Middle Layer: AI Classification */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: -20, z: -40, opacity: 0 }}
                  whileInView={{ opacity: 0.6 }}
                  animate={{ y: [0, 10, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5, opacity: { duration: 1 } }}
                  className="absolute inset-0 border border-cyan-500/10 rounded-3xl p-8 backdrop-blur-md flex items-center justify-center mix-blend-screen"
                >
                  <div className="absolute w-[150px] h-[150px] border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-[100px] h-[100px] border border-cyan-400/30 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
                  <Brain className="w-10 h-10 text-cyan-500/40 relative z-10" />
                </motion.div>

                {/* Front Layer: Real-time Value Dashboard */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: 20, z: 20, opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  animate={{ y: [0, -5, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1, opacity: { duration: 1 } }}
                  className="absolute inset-0 bg-slate-950/90 border border-cyan-500/40 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
                >
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R&D Value Flow</div>
                        <div className="text-[10px] text-emerald-400/80 font-semibold">● Live</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white tracking-tight">€4,280</div>
                      <div className="text-[9px] text-emerald-400 font-bold">+€204 today</div>
                    </div>
                  </div>

                  {/* Mini Chart — Animated Bar Chart */}
                  <div className="flex items-end gap-[5px] h-[100px] mb-4 px-1 relative z-10">
                    {[65, 45, 78, 55, 82, 40, 90, 72, 58, 85, 68, 92, 48, 75].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                        className={`flex-1 rounded-sm ${h > 60 ? 'bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'bg-slate-700/60'}`}
                      />
                    ))}
                  </div>

                  {/* Bottom Stats Row */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">Confidence</div>
                      <div className="text-sm font-black text-cyan-400">0.87</div>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">R&D Logs</div>
                      <div className="text-sm font-black text-white">142</div>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-emerald-500/20">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">R&D Rate</div>
                      <div className="text-sm font-black text-emerald-400">73%</div>
                    </div>
                  </div>

                  {/* Ambient pulse glow */}
                  <motion.div
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-cyan-500/5 pointer-events-none z-0"
                  />
                </motion.div>
                
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>
      </div>

      {/* ============================================ */}
      {/* ============================================ */}
      {/* SECTION 3: BEFORE VS AFTER (Premium Minimalist) */}
      {/* ============================================ */}
      <BeforeAfterSection />

      {/* ============================================ */}
      {/* CURTAIN LIFT TRANSITION: Paradigm Shift ↑ Pipeline ↓ */}
      {/* The Before/After block is the "curtain" — it lifts away */}
      {/* ============================================ */}
      <section ref={zoomPortalRef} className="h-[80vh] relative bg-slate-950 overflow-hidden">
        {/* Pipeline block sitting beneath, visible as curtain lifts */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ opacity: zoomProgress }}
            className="text-center pointer-events-none select-none"
          >
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.4em] mb-4">How It Works</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800">
              The Automated Pipeline
            </h2>
          </motion.div>
        </div>

        {/* The curtain — the card lifting up off screen */}
        <motion.div
          style={{ y: curtainY }}
          className="absolute inset-x-4 md:inset-x-12 top-0 h-full bg-slate-950 rounded-b-[40px] shadow-[0_40px_120px_rgba(0,0,0,1)] z-10 flex items-center justify-center"
        >
          {/* Single thin sweep line at the bottom edge of the curtain */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: HOW IT WORKS - PIPELINE */}
      {/* ============================================ */}
      <section className="py-32 container mx-auto px-4 relative overflow-hidden bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-24 relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-primary animate-pulse" />
            <span className="text-brand-primary">How It Works</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white">
            The <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">Automated</span> Pipeline
          </h2>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto font-medium">
            Watch how raw engineering data transforms into a fully compliant tax claim.
          </p>
          </motion.div>

        <div className="relative max-w-6xl mx-auto">
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[120px] left-[15%] w-[70%] h-[2px] bg-slate-800 -z-10">
            {/* The actual laser beam */}
            <motion.div 
              animate={{ left: ["0%", "100%", "0%"] }} 
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="absolute top-1/2 -translate-y-1/2 w-[100px] h-[4px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] rounded-full"
            />
            {/* Particles flowing left to right */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity, delay: i * 0.6 }}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Step 1: Data Ingestion */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative p-[1px] rounded-[32px] group/card hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute inset-[-2px] bg-cyan-500/20 blur-md opacity-0 group-hover/card:opacity-100 transition-opacity rounded-[32px]" />
              <div className="relative h-full bg-slate-950 border border-white/5 rounded-[31px] p-8 md:p-10 flex flex-col items-center text-center transform-style-3d shadow-xl group-hover/card:shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 mb-8 flex items-center justify-center relative shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]">
                  <Database className="w-10 h-10 text-slate-400 group-hover/card:text-cyan-400 transition-colors" />
                  <motion.div 
                    animate={{ rotate: -360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-[-4px] rounded-full border-2 border-dashed border-cyan-500/30 group-hover/card:border-cyan-400/60 transition-colors"
                  />
                  {/* Floating source nodes */}
                  <motion.div animate={{ y: [-5, 5, -5] }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">Jira</motion.div>
                  <motion.div animate={{ y: [5, -5, 5] }} transition={{ duration: 4, repeat: Infinity }} className="absolute -bottom-3 -left-3 w-8 h-8 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">Git</motion.div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">1. Log Daily Activity</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Simply describe what you built today. No extra context needed, just your raw engineering notes.</p>
              </div>
            </motion.div>

            {/* Step 2: AI Neural Processing */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative p-[1px] rounded-[32px] group/card hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute inset-[-2px] bg-cyan-500/40 blur-lg opacity-30 group-hover/card:opacity-100 transition-opacity rounded-[32px]" />
              <div className="relative h-full bg-slate-950 border border-cyan-500/20 rounded-[31px] p-8 md:p-10 flex flex-col items-center text-center transform-style-3d shadow-[0_0_40px_rgba(6,182,212,0.1)] group-hover/card:shadow-[0_0_60px_rgba(6,182,212,0.25)]">
                <div className="w-24 h-24 rounded-full bg-cyan-500/10 border border-cyan-400/40 mb-8 flex items-center justify-center relative shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <Cpu className="w-10 h-10 text-cyan-400 group-hover/card:scale-110 transition-transform" />
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 rounded-full bg-cyan-500/20"
                  />
                  {/* Neural nodes */}
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-[-10px]">
                    <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute top-0 left-1/2 -translate-x-1/2" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute bottom-2 right-2" />
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute bottom-2 left-2" />
                  </motion.div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">2. AI Value Assessment</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Our proprietary LLM analyzes the dataset to identify qualified technical uncertainty and R&D capital instantly.</p>
              </div>
            </motion.div>

            {/* Step 3: Claim Generation */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="relative p-[1px] rounded-[32px] group/card hover:-translate-y-2 transition-transform duration-500"
            >
              <div className="absolute inset-[-2px] bg-cyan-500/20 blur-md opacity-0 group-hover/card:opacity-100 transition-opacity rounded-[32px]" />
              <div className="relative h-full bg-slate-950 border border-white/5 rounded-[31px] p-8 md:p-10 flex flex-col items-center text-center transform-style-3d shadow-xl group-hover/card:shadow-[0_0_40px_rgba(6,182,212,0.15)]">
                <div className="w-24 h-24 rounded-full bg-slate-900 border border-white/10 mb-8 flex items-center justify-center relative overflow-hidden">
                  <ShieldCheck className="w-10 h-10 text-white relative z-10 group-hover/card:scale-110 transition-transform" />
                  {/* Scanning paper effect */}
                  <motion.div 
                    animate={{ top: ["-10%", "110%"] }} 
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] z-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-cyan-900/20 to-slate-900 z-0" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">3. Real-time Aggregation</h3>
                <p className="text-slate-400 font-medium leading-relaxed">Watch your R&D value accumulate daily. Total transparency into your engineering ROI, ready for compliance.</p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HORIZONTAL SCROLL SECTION */}
      {/* Vertical scroll triggers horizontal movement */}
      {/* ============================================ */}
      <HorizontalScrollSection />

      {/* 4. PRICING AESTHETIC - WOW EDITION */}
      <section id="pricing" className="py-32 container mx-auto px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] -z-10 rounded-full" />
        
        <div className="text-center mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter">
              Transparent <span className="text-cyan-400">Pricing</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium">
              No hidden fees. Scale as you grow and completely automate your compliance.
            </p>
          </motion.div>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto items-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.2 } }
          }}
        >
          {/* Plan 1: Manual / Free */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -10 }}
            className="glass-card p-10 lg:p-12 rounded-[40px] border border-white/5 hover:border-white/10 transition-all duration-500 bg-slate-900/40 relative z-10 opacity-80 hover:opacity-100"
          >
            <div className="text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">Manual / Free</div>
            <div className="text-6xl font-black mb-8 text-white">$0<span className="text-2xl text-slate-500 font-medium">/mo</span></div>
            <ul className="space-y-5 text-slate-400 mb-12 font-medium">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-slate-600 rounded-full"/> Basic project tracking</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-slate-600 rounded-full"/> Expense logging</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-slate-600 rounded-full"/> Final manual calculation</li>
            </ul>
            <button className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors">
              Get Started
            </button>
          </motion.div>

          {/* Plan 2: NEW PRO PLAN */}
          <motion.div 
            variants={itemVariants} 
            whileHover={{ y: -10 }}
            className="glass-card p-10 lg:p-12 rounded-[40px] border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 bg-slate-900/60 relative z-10 group shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:shadow-[0_0_50px_rgba(6,182,212,0.1)]"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full -z-10 group-hover:bg-cyan-500/20 transition-all duration-500" />
            <div className="text-sm font-bold text-cyan-400 mb-3 uppercase tracking-widest">SaaS Subscription</div>
            <div className="text-6xl font-black mb-8 text-white">$29<span className="text-2xl text-slate-500 font-medium">/mo</span></div>
            <div className="text-sm text-slate-400 mb-8 font-medium -mt-4">Per team, up to 10 engineers</div>
            <ul className="space-y-5 text-slate-300 mb-12 font-medium">
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"/> Unlimited daily logs </li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"/> Real-time value Dashboard</li>
              <li className="flex items-center gap-4"><div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4]"/> Priority email support</li>
            </ul>
            <button className="w-full py-4 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-all border border-cyan-500/20 group-hover:border-cyan-400">
              Start Tracking
            </button>
          </motion.div>

          {/* Plan 3: AI ENTERPRISE (The WOW effect) */}
          <motion.div 
            variants={itemVariants} 
            className="relative p-[2px] rounded-[42px] overflow-hidden group shadow-[0_0_80px_rgba(6,182,212,0.2)] md:scale-[1.05] z-20"
          >
            {/* Spinning Border Gradient Beam */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_200deg,rgba(6,182,212,1)_360deg)] animate-[spin_3s_linear_infinite]"
            />
            
            <div className="relative glass-card p-10 lg:p-12 rounded-[40px] bg-slate-950 h-full overflow-hidden flex flex-col justify-between">
              {/* Internal Ambient Glow */}
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.15),transparent_70%)] -z-10 group-hover:bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.3),transparent_70%)] transition-colors duration-700" />
              
              {/* Premium Floating Badge */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 px-6 py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white text-sm font-black tracking-widest rounded-bl-3xl shadow-[0_0_20px_rgba(6,182,212,0.5)] border-b border-l border-white/20 uppercase"
              >
                Popular
              </motion.div>
              
              <div>
                <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white mb-3 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> AI Enterprise
                </div>
                <div className="text-6xl font-black mb-8 text-white drop-shadow-md">$99<span className="text-2xl text-cyan-400/80 font-medium">/claim</span></div>
                
                <ul className="space-y-6 text-white mb-12 font-medium">
                  <motion.li whileHover={{ x: 5 }} className="flex items-center gap-4 transition-transform"><div className="w-2.5 h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45"/> Automated claim filing</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="flex items-center gap-4 transition-transform"><div className="w-2.5 h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45"/> Unlimited daily users</motion.li>
                  <motion.li whileHover={{ x: 5 }} className="flex items-center gap-4 transition-transform"><div className="w-2.5 h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45"/> Audit Defense Guarantee</motion.li>
                </ul>
              </div>
              
              <button className="relative w-full py-5 rounded-full bg-white text-black font-black text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:bg-slate-100 active:scale-95 group/btn overflow-hidden mt-6">
                <span className="relative z-10 flex items-center justify-center gap-2">Automate Now <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform"/></span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 5. FINAL CTA - INTERACTIVE HOLOGRAPHIC EDITION */}
      <section className="py-40 container mx-auto px-4 mb-20 relative flex items-center justify-center min-h-[60vh]">
        {/* Background Ambient Pulse */}
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/20 rounded-full blur-[120px] pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          className="relative w-full max-w-5xl rounded-[40px] p-[1px] group perspective-[1000px]"
        >
          {/* Animated Edge Glow */}
          <div className="absolute inset-[-2px] rounded-[40px] bg-gradient-to-r from-cyan-500 to-cyan-400 opacity-30 group-hover:opacity-70 blur-xl transition-opacity duration-1000 -z-10 animate-pulse" />
          
          <div className="relative w-full rounded-[40px] bg-slate-950/80 backdrop-blur-3xl border border-white/10 p-16 md:p-24 overflow-hidden z-10 flex flex-col items-center justify-center transform-style-3d shadow-2xl transition-transform duration-700">
            
            {/* Tech Grid Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:30px_30px] opacity-20 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />

            {/* Floating Holographic Chips */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-12 left-12 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] hidden md:flex"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="text-xs font-bold text-slate-300 tracking-wider">JIRA CONNECTED</span>
            </motion.div>

            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-16 right-12 px-5 py-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center gap-3 shadow-[0_0_15px_rgba(6,182,212,0.15)] hidden md:flex"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-ping" />
              <span className="text-xs font-bold text-slate-300 tracking-wider">READY FOR AUDIT</span>
            </motion.div>

            {/* Scanline Sweep effect running across the card */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_20px_#06b6d4] z-20 pointer-events-none opacity-50"
            />
            {/* Scanline gradient tail */}
            <motion.div
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[100px] bg-gradient-to-b from-transparent to-cyan-500/10 z-10 pointer-events-none -translate-y-full opacity-50"
            />

            {/* Actual Content Area */}
            <div className="relative z-30 max-w-3xl flex flex-col items-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
                className="w-20 h-20 rounded-[24px] bg-gradient-to-tr from-cyan-500 to-cyan-400 mb-10 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)] border border-white/20"
              >
                <Zap className="w-10 h-10 text-white drop-shadow-md" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-white text-center leading-[1.1]"
              >
                Ready to automate your <br/>
                <span className="text-cyan-400 pointer-events-none">
                  R&D Claim?
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.8 }}
                className="text-slate-400 text-xl md:text-2xl font-medium mb-14 max-w-2xl mx-auto text-center"
              >
                Join elite engineering teams generating their tax credits with zero manual effort.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6, type: "spring", stiffness: 100 }}
                className="relative group/btn mt-4 z-40"
              >
                {/* Concentric Pulse Rings */}
                <div className="absolute inset-0 rounded-full border border-cyan-400/0 group-hover/btn:border-cyan-400/50 scale-100 group-hover/btn:scale-[1.8] opacity-100 group-hover/btn:opacity-0 transition-all duration-[1500ms] delay-0 ease-out pointer-events-none" />
                <div className="absolute inset-0 rounded-full border border-cyan-400/0 group-hover/btn:border-cyan-400/30 scale-100 group-hover/btn:scale-[2.5] opacity-100 group-hover/btn:opacity-0 transition-all duration-[2000ms] delay-150 ease-out pointer-events-none" />
                <div className="absolute inset-0 rounded-full border border-cyan-400/0 group-hover/btn:border-cyan-400/20 scale-100 group-hover/btn:scale-[3.5] opacity-100 group-hover/btn:opacity-0 transition-all duration-[2500ms] delay-300 ease-out pointer-events-none" />

                {/* Floating Orbiting Data Nodes */}
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute inset-[-40px] pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity duration-700">
                  <div className="w-3 h-3 rounded-full bg-white shadow-[0_0_15px_#fff] absolute top-10 left-0" />
                  <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] absolute bottom-0 right-10" />
                </motion.div>

                {/* Button Glow Aura */}
                <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-cyan-400 to-cyan-600 opacity-60 blur-xl group-hover/btn:opacity-100 group-hover/btn:blur-2xl transition-all duration-500 animate-pulse" />
                
                <button className="relative px-12 py-6 rounded-full bg-white text-slate-950 font-black text-2xl overflow-hidden flex items-center gap-4 transition-transform active:scale-95 group-hover/btn:shadow-[0_0_50px_rgba(255,255,255,1)] border border-white/50">
                  <span className="relative z-10">Start Tracking Daily Value</span>
                  <ArrowRight className="w-7 h-7 relative z-10 group-hover/btn:translate-x-2 group-hover/btn:scale-110 transition-transform" />
                  
                  {/* Intense Hover Flare/Flash */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover/btn:opacity-20 transition-opacity duration-200 pointer-events-none" />
                  
                  {/* Sweeping Metallic Beam */}
                  <div className="absolute top-0 -left-[100%] w-[50%] h-full bg-gradient-to-r from-transparent via-slate-300/80 to-transparent skew-x-[30deg] group-hover/btn:left-[200%] transition-all duration-1000 ease-in-out pointer-events-none" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

    </MainLayout>
  );
}
