"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { 
  Code2, 
  BarChart3, 
  Banknote, 
  Gauge, 
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

/**
 * HORIZONTAL SCROLL SECTION
 * Vertical scroll triggers horizontal card movement
 * Breaks user pattern and forces attention
 * 
 * Cards represent USE CASES / AUDIENCES (not pricing tiers)
 * since pricing is now a single SaaS plan ($29/mo)
 */

interface Card {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  gradient: string;
  accentColor: string;
  stats: { label: string; value: string }[];
  features: string[];
}

const cards: Card[] = [
  {
    title: "For Engineers",
    subtitle: "Track your R&D impact daily",
    description: "Log what you built today in 30 seconds. Our AI scores R&D eligibility instantly — so you can see how your work translates into financial value.",
    icon: Code2,
    gradient: "from-slate-900 to-slate-950",
    accentColor: "cyan",
    stats: [
      { label: "Daily Logs", value: "30 sec" },
      { label: "AI Score", value: "Instant" }
    ],
    features: [
      "One-click daily R&D logging",
      "Instant AI classification",
      "Confidence score per entry",
      "Personal R&D value tracker"
    ]
  },
  {
    title: "For CTOs",
    subtitle: "Real-time engineering capital",
    description: "See your team's R&D output as a financial metric. Know exactly how much qualifying R&D value your engineers produce — every single day.",
    icon: BarChart3,
    gradient: "from-slate-900 to-slate-950",
    accentColor: "emerald",
    stats: [
      { label: "Dashboard", value: "Live" },
      { label: "R&D Rate", value: "73%" }
    ],
    features: [
      "Real-time value dashboard",
      "Team R&D contribution metrics",
      "Daily value accumulation chart",
      "Exportable reports for board",
      "Automated R&D classification"
    ]
  },
  {
    title: "For Finance",
    subtitle: "Continuous compliance data",
    description: "No more end-of-year scramble. R&D tax credit documentation builds itself daily. When it's time to file, everything is already there.",
    icon: Banknote,
    gradient: "from-slate-900 to-slate-950",
    accentColor: "amber",
    stats: [
      { label: "Compliance", value: "Auto" },
      { label: "Audit-Ready", value: "Always" }
    ],
    features: [
      "Automated Frascati classification",
      "Daily audit trail generation",
      "Cumulative R&D value tracking",
      "One-click annual report export",
      "Multi-country tax rules (WBSO, CIR, RDEC)"
    ]
  },
  {
    title: "Product Demo",
    subtitle: "See value in 60 seconds",
    description: "Paste any standup note or daily log. Watch our AI score it for R&D eligibility and calculate the tax credit value — in real time.",
    icon: Gauge,
    gradient: "from-slate-900 to-slate-950",
    accentColor: "purple",
    stats: [
      { label: "Try It", value: "Free" },
      { label: "No Setup", value: "0 min" }
    ],
    features: [
      "Paste any work description",
      "See R&D score instantly",
      "Understand AI reasoning",
      "Calculate potential value"
    ]
  },
  {
    title: "Compliance",
    subtitle: "Built for real audits",
    description: "Every classification follows OECD Frascati Manual criteria. Every log entry has a full justification chain. Your auditors will love it.",
    icon: ShieldCheck,
    gradient: "from-slate-900 to-slate-950",
    accentColor: "cyan",
    stats: [
      { label: "Framework", value: "OECD" },
      { label: "Trail", value: "100%" }
    ],
    features: [
      "Frascati Manual methodology",
      "4-criteria scoring per entry",
      "Full justification audit trail",
      "GDPR & SOC 2 ready"
    ]
  }
];

export function HorizontalScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Calculate horizontal movement
  // Total width = number of cards * card width + gaps
  const cardWidth = 450; // px
  const gap = 32; // px
  const totalWidth = cards.length * (cardWidth + gap);
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  
  // Calculate how much to scroll: total width minus viewport, plus some padding
  // This ensures the last card is fully visible with some space after
  const maxScroll = totalWidth - viewportWidth + (viewportWidth * 0.2); // 20vw padding at end
  
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -maxScroll]
  );

  return (
    <>
      {/* ========== DESKTOP: Horizontal Scroll ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-slate-950" style={{ height: "300vh" }}>
        <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden">
        
          {/* Header */}
          <div className="container mx-auto px-4 mb-12 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest mb-6 sm:mb-8 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-cyan-400">
                  Built for every role →
                </span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                Who it&apos;s{" "}
                <span className="text-cyan-400 drop-shadow-sm">
                  built for.
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                From daily logging to annual compliance — every role benefits from real-time R&D value tracking
              </p>
            </motion.div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="relative py-12 -my-12">
            <motion.div
              style={{ x }}
              className="flex gap-8 pl-[10vw] pr-[10vw]"
            >
              {cards.map((card, index) => (
                <Card key={index} card={card} index={index} />
              ))}
            </motion.div>
          </div>

          {/* Scroll Progress Indicator - Brand Blue */}
          <div className="container mx-auto px-4 mt-12">
            <div className="max-w-md mx-auto">
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  style={{ scaleX: scrollYProgress }}
                  className="h-full bg-cyan-500 origin-left shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
              </div>
              <p className="text-center text-slate-500 text-sm mt-4">
                Keep scrolling to see more
              </p>
            </div>
          </div>

          {/* Background Effects */}
          <div className="absolute inset-0 pointer-events-none -z-10">
            <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-900/10 to-transparent" />
            <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-purple-900/10 to-transparent" />
          </div>
        </div>
      </div>

      {/* ========== MOBILE: Premium Horizontal Carousel ========== */}
      <div className="md:hidden relative bg-slate-950 py-16 overflow-hidden">
        <div className="text-center mb-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest mb-4 sm:mb-6 backdrop-blur-md"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-cyan-400">
              Built for every role →
            </span>
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white mb-4 tracking-tight leading-[1.1]"
          >
            Who it&apos;s{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">built for</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-400 max-w-xs mx-auto font-medium"
          >
            From daily logging to annual compliance — every role benefits from real-time R&D value tracking
          </motion.p>
        </div>

        {/* The Swipe Carousel */}
        <div className="relative w-full">
          {/* Ambient glow behind carousel */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[200px] bg-cyan-500/10 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 px-[7.5vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {cards.map((card, index) => (
              <motion.div 
                key={index} 
                className="w-[85vw] max-w-[340px] shrink-0 snap-center origin-bottom relative z-10"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5, delay: index * 0.05, type: "spring", bounce: 0.4 }}
              >
                <Card card={card} index={index} isMobile={true} />
              </motion.div>
            ))}
          </div>
          
          {/* Edge gradients to hint at scrolling */}
          <div className="absolute top-0 bottom-0 left-0 w-[5vw] bg-gradient-to-r from-slate-950 to-transparent pointer-events-none z-20" />
          <div className="absolute top-0 bottom-0 right-0 w-[5vw] bg-gradient-to-l from-slate-950 to-transparent pointer-events-none z-20" />
        </div>

        {/* Swipe Hint Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex justify-center items-center gap-3 mt-2 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-600" />
          <span className="animate-pulse">Swipe</span>
          <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-600" />
        </motion.div>
      </div>
    </>
  );
}

// Individual Card Component
function Card({ card, index, isMobile = false }: { card: Card; index: number; isMobile?: boolean }) {
  const Icon = card.icon;

  return (
    <motion.div
      initial={!isMobile ? { opacity: 0, scale: 0.9 } : false}
      whileInView={!isMobile ? { opacity: 1, scale: 1 } : undefined}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.1 }}
      whileHover={!isMobile ? { y: -10 } : undefined}
      className={`relative flex-shrink-0 w-full md:w-[450px] min-w-[280px] md:min-w-[450px] max-w-[450px] group ${isMobile ? 'h-auto cursor-default' : 'h-[500px] md:h-[600px] cursor-pointer'}`}
    >
      {/* Premium glass card with subtle glow */}
      <div className="relative h-full p-[1px] rounded-[32px] overflow-hidden md:overflow-visible">
        {/* Subtle border glow on hover */}
        <div className="absolute inset-[-2px] bg-cyan-500/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px]" />
        
        {/* Main card */}
        <div className={`relative h-full bg-[#060913] border border-cyan-500/20 rounded-[31px] flex flex-col backdrop-blur-xl shadow-[0_0_40px_rgba(6,182,212,0.1)] group-hover:shadow-[0_0_60px_rgba(6,182,212,0.25)] transition-all duration-500 ${isMobile ? 'p-6 sm:p-8' : 'p-8'}`}>
          
          {/* Subtle gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-[31px] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-500" />
          {/* Top edge highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50" />
          
          {/* Icon - Premium glowing style */}
          <div className={`relative rounded-[20px] bg-cyan-500/10 border border-cyan-400/40 mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.3)] ${isMobile ? 'w-16 h-16' : 'w-20 h-20'}`}>
            <Icon className={`text-cyan-400 transition-transform ${isMobile ? 'w-8 h-8' : 'w-10 h-10 group-hover:scale-110'}`} />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[20px] bg-cyan-500/20"
            />
            {/* Rotating ring around the square border */}
            <div className="absolute inset-[-6px] overflow-hidden rounded-[26px]">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute top-1/2 left-1/2 w-[150%] h-[20px] bg-cyan-500/40 blur-[8px] -translate-x-1/2 -translate-y-1/2"
              />
            </div>
            <div className="absolute inset-0 bg-[#060913]/50 rounded-[20px] backdrop-blur-sm" />
            <Icon className={`absolute text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)] z-10 ${isMobile ? 'w-8 h-8' : 'w-10 h-10'}`} />
          </div>

          {/* Title */}
          <h3 className={`font-black text-white mb-1 tracking-tight relative z-10 ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            {card.title}
          </h3>
          <p className="text-cyan-400 font-bold uppercase tracking-[0.1em] text-[10px] sm:text-xs mb-3 relative z-10">
            {card.subtitle}
          </p>
          <p className={`text-slate-400 leading-relaxed mb-6 relative z-10 font-medium ${isMobile ? 'text-sm' : 'text-sm'}`}>
            {card.description}
          </p>

          {/* Stats - premium style */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 relative z-10">
            {card.stats.map((stat, i) => (
              <div 
                key={i} 
                className="bg-slate-900/80 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-cyan-500/20 shadow-[inset_0_0_20px_rgba(6,182,212,0.05)]"
              >
                <div className={`font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 mb-1 drop-shadow-md ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                  {stat.value}
                </div>
                <div className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Features - clean checkmarks */}
          <div className="flex-grow relative z-10">
            <div className="space-y-3">
              {card.features.map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                  </div>
                  <span className={`text-slate-300 font-medium ${isMobile ? 'text-xs sm:text-sm' : 'text-sm'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Scanning laser effect on hover (Desktop only) */}
          {!isMobile && (
            <motion.div 
              initial={{ top: "-10%" }}
              animate={{ top: "110%" }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_#22d3ee] opacity-0 group-hover:opacity-30 pointer-events-none"
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
