"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sparkles, Zap, TrendingUp, Clock, CheckCircle2 } from "lucide-react";

/**
 * ZOOM-THROUGH EFFECT
 * Fly into screen with massive scale transformation
 * Creates immersive "portal" effect
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
    [0, 0.3, 0.5, 0.7, 1],
    [0.1, 1, 15, 25, 30]
  );

  // Screen opacity - fades out as we "enter" it
  const screenOpacity = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.6],
    [1, 1, 0.5, 0]
  );

  // Border radius - becomes 0 as screen fills viewport
  const borderRadius = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5],
    [32, 32, 0]
  );

  // Content that appears after zoom
  const contentOpacity = useTransform(
    scrollYProgress,
    [0.5, 0.65, 0.8],
    [0, 0, 1]
  );

  const contentY = useTransform(
    scrollYProgress,
    [0.5, 0.65, 0.8],
    [100, 50, 0]
  );

  // Background blur effect
  const backdropBlur = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5],
    [0, 5, 20]
  );

  return (
    <>
      {/* ========== DESKTOP: Zoom Effect ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-slate-950" style={{ height: "300vh" }}>
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
              
              {/* Top header - technical/clean */}
              <div className="flex items-center justify-between w-full border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                  <span className="text-xs uppercase tracking-[0.2em] text-slate-400 font-mono">Engine.Active</span>
                </div>
                <span className="text-xs uppercase tracking-widest text-slate-600 font-mono">v2.4.0</span>
              </div>
              
              {/* Center metric - pure typography */}
              <div className="flex flex-col items-start justify-center flex-1">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-7xl font-light tracking-tighter text-white font-mono">24</span>
                  <span className="text-2xl text-slate-500 font-mono">h</span>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mt-2 text-sm text-cyan-400/80 uppercase tracking-widest font-semibold"
                >
                  Avg. Processing
                </motion.div>
              </div>

              {/* Bottom abstract progress line */}
              <div className="w-full h-[1px] bg-white/5 relative overflow-hidden">
                <motion.div
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                />
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
                    <span className="text-cyan-400 font-bold uppercase tracking-wider">
                      Lightning Fast Processing
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Main heading */}
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[1.1]"
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
                className="text-2xl md:text-3xl text-slate-400 font-medium max-w-3xl mx-auto mb-12"
              >
                Stop losing daily R&D value. Welcome to real-time engineering capitalization.
              </motion.p>

              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
              >
                <StatCard
                  icon={Clock}
                  value="Daily"
                  label="Sync"
                  color="cyan"
                />
                <StatCard
                  icon={TrendingUp}
                  value="99.8%"
                  label="AI Confidence"
                  color="purple"
                />
                <StatCard
                  icon={CheckCircle2}
                  value="Real-time"
                  label="Tracker"
                  color="emerald"
                />
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

      {/* ========== MOBILE: Premium Animated Stats ========== */}
      <div className="md:hidden relative bg-slate-950 py-20 px-4 overflow-hidden border-t border-white/5">
        
        {/* Animated Background Mesh & Grid */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d41a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d41a_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[150vw] h-[60vh] bg-gradient-to-b from-cyan-500/10 via-purple-500/5 to-transparent blur-3xl" />
          <motion.div 
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-[80px]" 
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          
          {/* Glowing Premium Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400">Lightning Fast</span>
          </motion.div>

          {/* Typography Shift */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[2.5rem] font-black text-white text-center mb-5 tracking-tighter leading-[1.05]"
          >
            A paradigm shift in <br/>
            <span className="text-cyan-400 drop-shadow-sm">
              Engineering Capital.
            </span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 text-center mb-12 max-w-[280px] font-medium leading-relaxed"
          >
            Stop losing daily R&D value. Welcome to real-time capitalization.
          </motion.p>

          {/* Premium Vertical Glass Cards */}
          <div className="w-full max-w-sm flex flex-col gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden p-[1px] rounded-2xl bg-gradient-to-b from-cyan-500/30 to-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-transparent" />
              <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">Daily</div>
                  <div className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Sync</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="relative overflow-hidden p-[1px] rounded-2xl bg-gradient-to-b from-purple-500/30 to-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-l from-purple-500/10 to-transparent" />
              <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">99.8%</div>
                  <div className="text-sm font-medium text-purple-400 uppercase tracking-wider">AI Confidence</div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="relative overflow-hidden p-[1px] rounded-2xl bg-gradient-to-b from-emerald-500/30 to-white/5"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
              <div className="relative bg-slate-950/80 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <div className="text-2xl font-black text-white tracking-tight">Real-time</div>
                  <div className="text-sm font-medium text-emerald-400 uppercase tracking-wider">Tracker</div>
                </div>
              </div>
            </motion.div>
          </div>

        </div>
      </div>
    </>
  );
}

// Stat Card Component
function StatCard({ 
  icon: Icon, 
  value, 
  label, 
  color 
}: { 
  icon: any, 
  value: string, 
  label: string, 
  color: string 
}) {
  const colorMap: Record<string, { bg: string, border: string, text: string, glow: string }> = {
    cyan: {
      bg: 'rgba(6,182,212,0.1)',
      border: 'rgba(6,182,212,0.3)',
      text: '#22d3ee',
      glow: 'rgba(6,182,212,0.5)'
    },
    purple: {
      bg: 'rgba(168,85,247,0.1)',
      border: 'rgba(168,85,247,0.3)',
      text: '#c084fc',
      glow: 'rgba(168,85,247,0.5)'
    },
    emerald: {
      bg: 'rgba(16,185,129,0.1)',
      border: 'rgba(16,185,129,0.3)',
      text: '#34d399',
      glow: 'rgba(16,185,129,0.5)'
    }
  };

  const colors = colorMap[color];

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative p-8 rounded-2xl backdrop-blur-xl"
      style={{
        backgroundColor: colors.bg,
        borderWidth: '1px',
        borderColor: colors.border
      }}
    >
      {/* Glow effect */}
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: colors.glow }}
      />
      
      <div className="relative z-10">
        <Icon className="w-12 h-12 mx-auto mb-4" style={{ color: colors.text }} />
        <div className="text-5xl font-black mb-2" style={{ color: colors.text }}>
          {value}
        </div>
        <div className="text-slate-400 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}
