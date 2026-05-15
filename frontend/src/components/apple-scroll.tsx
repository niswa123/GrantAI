"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Brain, Zap, ShieldCheck, TrendingUp, CheckCircle2, FileCheck, Activity, BarChart3, Sparkles } from "lucide-react";

/**
 * APPLE-STYLE STICKY SCROLL
 * Premium storytelling with animated dashboard
 */

interface Feature {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  color: string;
  dashboardState: "analyzing" | "generating" | "approving";
}

const features: Feature[] = [
  {
    title: "Daily Logging",
    subtitle: "Capture work in seconds",
    description: "Engineers simply drop their daily standup notes or commit summaries into the log. No formatting required, just raw engineering context captured when it's fresh.",
    icon: Zap,
    color: "cyan",
    dashboardState: "analyzing"
  },
  {
    title: "AI Valuation",
    subtitle: "Real-time scoring",
    description: "Our proprietary LLM instantly assesses technical uncertainty and assigns a confidence score, converting raw text into a quantified Euro value of R&D capital.",
    icon: Brain,
    color: "purple",
    dashboardState: "generating"
  },
  {
    title: "Value Flow",
    subtitle: "Dashboard aggregation",
    description: "Watch your engineering ROI accumulate daily. Gain total transparency into your R&D capital, ready for compliance without the yearly audit stress.",
    icon: Activity,
    color: "emerald",
    dashboardState: "approving"
  }
];

export function AppleStyleStickyScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Smooth spring animation for buttery scrolling
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <>
      {/* ========== DESKTOP: Sticky Scroll ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-slate-950" style={{ height: "400vh" }}>
        <div className="sticky top-0 h-screen flex items-center pt-20 pb-10 overflow-hidden">
          <div className="container mx-auto px-4 lg:px-8 mt-12 md:mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
              {/* LEFT: Scrolling Text Content */}
              <div className="relative z-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mb-12"
                >
                  <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-cyan-400">Zero Friction</span>
                  </div>
                  <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[1.1] mb-6">
                    The smartest way to track{" "}
                    <span className="text-cyan-400 drop-shadow-sm">
                      Engineering Value.
                    </span>
                  </h2>
                </motion.div>

                {/* Feature Cards that fade in/out */}
                <div className="space-y-8 relative" style={{ minHeight: "300px" }}>
                  {features.map((feature, index) => {
                    const start = index / features.length;
                    const end = (index + 1) / features.length;
                    
                    const opacity = useTransform(
                      smoothProgress,
                      [start - 0.1, start - 0.05, start, end, end + 0.05, end + 0.1],
                      [0, 0, 1, 1, 0, 0]
                    );
                    
                    const y = useTransform(
                      smoothProgress,
                      [start - 0.05, start, end, end + 0.05],
                      [30, 0, 0, -30]
                    );

                    const scale = useTransform(
                      smoothProgress,
                      [start - 0.05, start, end, end + 0.05],
                      [0.98, 1, 1, 0.98]
                    );

                    const Icon = feature.icon;

                    return (
                      <motion.div
                        key={index}
                        style={{ opacity, y, scale }}
                        className="absolute inset-0"
                      >
                        <div className="flex items-start gap-6 mb-6">
                          <div 
                            className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 relative"
                            style={{
                              backgroundColor: feature.color === 'cyan' ? 'rgba(6,182,212,0.15)' : 
                                             feature.color === 'purple' ? 'rgba(168,85,247,0.15)' : 
                                             'rgba(16,185,129,0.15)',
                              borderWidth: '1px',
                              borderColor: feature.color === 'cyan' ? 'rgba(6,182,212,0.3)' : 
                                          feature.color === 'purple' ? 'rgba(168,85,247,0.3)' : 
                                          'rgba(16,185,129,0.3)'
                            }}
                          >
                            <Icon 
                              className="w-8 h-8"
                              style={{
                                color: feature.color === 'cyan' ? '#22d3ee' : 
                                      feature.color === 'purple' ? '#c084fc' : 
                                      '#34d399'
                              }}
                            />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                              Step {index + 1}
                            </div>
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-2 tracking-tight">
                              {feature.title}
                            </h3>
                            <div 
                              className="text-xl font-bold mb-4"
                              style={{
                                color: feature.color === 'cyan' ? '#22d3ee' : 
                                      feature.color === 'purple' ? '#c084fc' : 
                                      '#34d399'
                              }}
                            >
                              {feature.subtitle}
                            </div>
                          </div>
                        </div>
                        <p className="text-xl text-slate-400 leading-relaxed pl-[88px]">
                          {feature.description}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: Sticky Animated Dashboard — hidden on mobile */}
              <div className="hidden lg:block relative">
                <AnimatedDashboard progress={smoothProgress} features={features} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE: Static Timeline ========== */}
      <div className="md:hidden relative bg-slate-950 py-20 px-4 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[10%] left-[-20%] w-[60vw] h-[60vw] bg-cyan-500/8 rounded-full blur-[80px]" />
          <div className="absolute top-[50%] right-[-20%] w-[60vw] h-[60vw] bg-purple-500/8 rounded-full blur-[80px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[60vw] h-[60vw] bg-emerald-500/8 rounded-full blur-[80px]" />
        </div>

        <div className="relative z-10">
          <div className="mb-14 text-center">
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-cyan-400">Zero Friction</span>
            </div>
            <h2 className="text-4xl font-black text-white tracking-tighter leading-[1.15]">
              The smartest way to track<br />
              <span className="text-cyan-400 drop-shadow-sm">Engineering Value.</span>
            </h2>
          </div>

          {/* Timeline */}
          <div className="relative">
            <div className="absolute top-[40px] bottom-[40px] left-[31px] w-[2px] bg-gradient-to-b from-cyan-500/50 via-purple-500/50 to-emerald-500/50" />

            <div className="flex flex-col gap-8 relative z-10">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                const colorHex = feature.color === 'cyan' ? '#22d3ee' : 
                                 feature.color === 'purple' ? '#c084fc' : '#34d399';
                const bgClass = feature.color === 'cyan' ? 'bg-cyan-500/10 border-cyan-500/30' : 
                                feature.color === 'purple' ? 'bg-purple-500/10 border-purple-500/30' : 
                                'bg-emerald-500/10 border-emerald-500/30';

                return (
                  <div key={index} className="relative">
                    <div className="flex items-start gap-5">
                      <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border backdrop-blur-xl shadow-lg mt-1 ${bgClass}`}>
                        <Icon className="w-7 h-7" style={{ color: colorHex }} />
                        <div className="absolute -left-[18px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-[3px] border-slate-950 z-20" style={{ backgroundColor: colorHex, boxShadow: `0 0 10px ${colorHex}` }} />
                      </div>
                      <div className="flex-1 bg-slate-900/60 backdrop-blur-md border border-white/5 rounded-[20px] p-5 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-28 h-28 opacity-15 blur-[40px] pointer-events-none" style={{ backgroundColor: colorHex }} />
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Step 0{index + 1}</div>
                        <h3 className="text-xl font-black text-white mb-1 tracking-tight">{feature.title}</h3>
                        <div className="text-sm font-bold mb-3" style={{ color: colorHex }}>{feature.subtitle}</div>
                        <p className="text-[14px] text-slate-400 leading-relaxed">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Animated Dashboard Component
function AnimatedDashboard({ progress, features }: { progress: any, features: Feature[] }) {
  // Determine active feature
  const activeFeatureIndex = useTransform(progress, (p: number) => {
    return Math.min(Math.floor(p * features.length), features.length - 1);
  });

  // Background color transition
  const bgGradient = useTransform(progress, (p: number) => {
    const colors = [
      'rgba(6,182,212,0.1)',   // cyan
      'rgba(168,85,247,0.1)',  // purple
      'rgba(16,185,129,0.1)'   // emerald
    ];
    const index = Math.min(Math.floor(p * 3), 2);
    return `radial-gradient(ellipse at top right, ${colors[index]}, transparent 70%)`;
  });

  return (
    <motion.div 
      className="relative w-full aspect-[4/3] rounded-3xl bg-slate-900/80 border border-white/10 p-8 backdrop-blur-xl shadow-2xl overflow-hidden"
      style={{ 
        boxShadow: "0 0 80px rgba(6,182,212,0.15), inset 0 0 80px rgba(0,0,0,0.5)"
      }}
    >
      {/* Animated Background */}
      <motion.div
        style={{ background: bgGradient }}
        className="absolute inset-0 -z-10 transition-all duration-1000"
      />

      {/* Dashboard Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h4 className="text-2xl font-bold text-white flex items-center gap-3">
            <Activity className="w-6 h-6 text-cyan-400" />
            R&D Value Flow
          </h4>
          <p className="text-slate-400 text-sm mt-1">Real-time Capitalization Dashboard</p>
        </div>
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold uppercase tracking-widest backdrop-blur-md"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400">Live</span>
        </motion.div>
      </div>

      {/* Animated Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <AnimatedStat 
          label="Daily Logs" 
          value={247}
          progress={progress}
          color="cyan"
          delay={0}
        />
        <AnimatedStat 
          label="Confidence" 
          value={99.8}
          suffix="%"
          progress={progress}
          color="purple"
          delay={0.1}
        />
        <AnimatedStat 
          label="R&D Value" 
          value={12}
          suffix="k"
          progress={progress}
          color="emerald"
          delay={0.2}
        />
      </div>

      {/* Animated Chart Area */}
      <div className="relative h-48 bg-slate-950/50 rounded-2xl p-6 border border-white/5 overflow-hidden mb-6">
        <div className="flex items-end justify-between h-full gap-2">
          {[...Array(12)].map((_, i) => {
            const height = useTransform(
              progress,
              [0, 0.3, 0.6, 1],
              [10, ((i * 23) % 60) + 20, ((i * 37) % 80) + 30, ((i * 41) % 100) + 40]
            );
            
            return (
              <motion.div
                key={i}
                style={{ height: `${height}%` }}
                className="flex-1 bg-gradient-to-t from-cyan-500 to-cyan-400 rounded-t-lg relative overflow-hidden"
                initial={{ height: "10%" }}
              >
                <motion.div
                  animate={{ y: ["-100%", "100%"] }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.1 }}
                  className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent"
                />
              </motion.div>
            );
          })}
        </div>
        
        {/* Grid Lines */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(4)].map((_, i) => (
            <div 
              key={i}
              className="absolute left-0 right-0 border-t border-white/5"
              style={{ top: `${(i + 1) * 20}%` }}
            />
          ))}
        </div>
      </div>

      {/* Status Indicator */}
      <StatusIndicator activeIndex={activeFeatureIndex} />

      {/* Scanning Laser Effect */}
      <motion.div
        style={{
          top: useTransform(progress, [0, 1], ['-10%', '110%'])
        }}
        className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_30px_#22d3ee] pointer-events-none opacity-50"
      />
      <motion.div
        style={{
          top: useTransform(progress, [0, 1], ['-10%', '110%'])
        }}
        className="absolute left-0 w-full h-24 bg-gradient-to-b from-cyan-500/20 to-transparent pointer-events-none -translate-y-24"
      />
    </motion.div>
  );
}

// Animated Stat Card
function AnimatedStat({ 
  label, 
  value, 
  suffix = "", 
  progress, 
  color,
  delay = 0
}: { 
  label: string, 
  value: number, 
  suffix?: string, 
  progress: any,
  color: string,
  delay?: number
}) {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const unsubscribe = progress.on('change', (latest: number) => {
      const adjustedProgress = Math.max(0, (latest - delay * 0.1));
      const animatedValue = value * adjustedProgress;
      setDisplayValue(Math.round(animatedValue * 10) / 10);
    });
    return unsubscribe;
  }, [progress, value, delay]);

  const colorMap: Record<string, string> = {
    cyan: '#22d3ee',
    purple: '#c084fc',
    emerald: '#34d399'
  };

  return (
    <motion.div 
      className="bg-slate-950/50 rounded-xl p-4 border border-white/5 relative overflow-hidden"
      whileHover={{ scale: 1.05, borderColor: 'rgba(255,255,255,0.2)' }}
      transition={{ duration: 0.2 }}
    >
      <div className="text-slate-500 text-xs uppercase tracking-wider mb-2 font-bold">
        {label}
      </div>
      <div 
        className="text-3xl font-black"
        style={{ color: colorMap[color] }}
      >
        {displayValue}
        {suffix}
      </div>
      
      {/* Shimmer effect */}
      <motion.div
        animate={{ x: ['-100%', '200%'] }}
        transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
        style={{ width: '50%' }}
      />
    </motion.div>
  );
}

// Status Indicator
function StatusIndicator({ activeIndex }: { activeIndex: any }) {
  const [currentStatus, setCurrentStatus] = React.useState({
    text: 'Awaiting daily log...',
    icon: Zap,
    color: '#22d3ee'
  });

  React.useEffect(() => {
    const unsubscribe = activeIndex.on('change', (latest: number) => {
      const states = [
        { text: 'Awaiting daily log...', icon: Zap, color: '#22d3ee' },
        { text: 'Scoring daily activity...', icon: Brain, color: '#c084fc' },
        { text: 'Aggregating capital flow...', icon: Activity, color: '#34d399' }
      ];
      setCurrentStatus(states[latest] || states[0]);
    });
    return unsubscribe;
  }, [activeIndex]);

  const StatusIcon = currentStatus.icon;

  return (
    <motion.div
      className="flex items-center gap-3 px-6 py-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm relative overflow-hidden"
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <StatusIcon className="w-5 h-5" style={{ color: currentStatus.color }} />
      </motion.div>
      <span className="text-white font-semibold">{currentStatus.text}</span>
      
      {/* Progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500"
        animate={{ width: ['0%', '100%'] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
}
