"use client";

import React, { useRef, useState, useEffect } from "react";
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
 * Overhauled into an asymmetric compliance matrix.
 * No identical card grids, no glassmorphism, no hero-metric cliché templates.
 */

interface CardData {
  title: string;
  subtitle: string;
  description: string;
  icon: any;
  accentColor: string;
}

const cards: CardData[] = [
  {
    title: "For Engineers",
    subtitle: "TRACK R&D IMPACT DAILY",
    description: "Log what you built today in 30 seconds. Our AI scores R&D eligibility instantly, so you can see how your work translates into financial value.",
    icon: Code2,
    accentColor: "cyan"
  },
  {
    title: "For CTOs",
    subtitle: "REAL-TIME ENGINEERING CAPITAL",
    description: "See your team's R&D output as a financial metric. Know exactly how much qualifying R&D value your engineers produce, every single day.",
    icon: BarChart3,
    accentColor: "emerald"
  },
  {
    title: "For Finance",
    subtitle: "CONTINUOUS COMPLIANCE DATA",
    description: "No more end-of-year scramble. R&D tax credit documentation builds itself daily. When it's time to file, everything is already there.",
    icon: Banknote,
    accentColor: "amber"
  },
  {
    title: "Product Demo",
    subtitle: "INSTANT COGNITIVE SCORING",
    description: "Paste any standup note or daily log. Watch our AI score it for R&D eligibility and calculate the tax credit value in real time.",
    icon: Gauge,
    accentColor: "purple"
  },
  {
    title: "Compliance",
    subtitle: "OECD FRASCATI METHODOLOGY",
    description: "Every classification follows OECD Frascati Manual criteria. Every log entry has a full justification chain. Your auditors will love it.",
    icon: ShieldCheck,
    accentColor: "cyan"
  }
];

// Asymmetric widths for desktop grid presentation
const cardWidths = [480, 540, 520, 480, 460];
const gap = 32;

export function HorizontalScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const [scrollRange, setScrollRange] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const calculateRange = () => {
      if (contentRef.current) {
        const scrollWidth = contentRef.current.scrollWidth;
        const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1920;
        setScrollRange(Math.max(0, scrollWidth - viewportWidth));
      }
    };

    calculateRange();
    
    // Tiny delay to ensure layout and widths are accurately loaded
    const timer = setTimeout(calculateRange, 100);

    window.addEventListener("resize", calculateRange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateRange);
    };
  }, []);

  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [0, -scrollRange]
  );

  return (
    <>
      {/* ========== DESKTOP: Horizontal Scroll ========== */}
      <div ref={containerRef} className="hidden md:block relative bg-[#03050c]" style={{ height: "240vh" }}>
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
              <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-xs text-slate-400 mb-6 tracking-wider uppercase">
                [ BUILT FOR EVERY ROLE ]
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter">
                Who it&apos;s{" "}
                <span className="text-cyan-400 drop-shadow-sm">
                  built for.
                </span>
              </h2>
              <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
                From daily logging to annual compliance, every role benefits from real-time R&D value tracking
              </p>
            </motion.div>
          </div>

          {/* Horizontal Scrolling Cards */}
          <div className="relative py-12 -my-12">
            <motion.div
              ref={contentRef}
              style={{ x }}
              className="flex gap-8 pl-[10vw] pr-[15vw] w-max"
            >
              {cards.map((card, index) => (
                <Card key={index} card={card} index={index} />
              ))}
            </motion.div>
          </div>

          {/* Scroll Progress Indicator - Brand Blue */}
          <div className="container mx-auto px-4 mt-12">
            <div className="max-w-md mx-auto">
              <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                <motion.div
                  style={{ scaleX: scrollYProgress }}
                  className="h-full bg-cyan-500 origin-left"
                />
              </div>
              <p className="text-center text-slate-500 text-xs uppercase tracking-widest mt-4">
                Scroll to explore roles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== MOBILE: Premium Horizontal Carousel ========== */}
      <div className="md:hidden relative bg-[#03050c] py-16 overflow-hidden">
        <div className="text-center mb-10 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] text-slate-400 mb-4 tracking-wider uppercase"
          >
            [ BUILT FOR EVERY ROLE ]
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-black text-white mb-4 tracking-tight leading-[1.1]"
          >
            Who it&apos;s{" "}
            <span className="text-cyan-400">built for</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-sm text-slate-400 max-w-xs mx-auto font-medium"
          >
            From daily logging to annual compliance, every role benefits from real-time R&D value tracking
          </motion.p>
        </div>

        {/* The Swipe Carousel */}
        <div className="relative w-full">
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-5 pb-8 px-[7.5vw] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {cards.map((card, index) => (
              <motion.div 
                key={index} 
                className="w-[85vw] max-w-[340px] shrink-0 snap-center origin-bottom relative z-10"
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Card card={card} index={index} isMobile={true} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Swipe Hint Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex justify-center items-center gap-3 mt-2 text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold"
        >
          <div className="w-8 h-[1px] bg-slate-800" />
          <span>Swipe</span>
          <div className="w-8 h-[1px] bg-slate-800" />
        </motion.div>
      </div>
    </>
  );
}

// Individual Card Component with Asymmetric Width and Layout Customization
function Card({ card, index, isMobile = false }: { card: CardData; index: number; isMobile?: boolean }) {
  const Icon = card.icon;
  const cardWidth = isMobile ? "w-full" : `${cardWidths[index]}px`;

  return (
    <motion.div
      initial={!isMobile ? { opacity: 0, scale: 0.98, y: 15 } : false}
      whileInView={!isMobile ? { opacity: 1, scale: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      style={{ width: isMobile ? undefined : cardWidth }}
      className={`relative flex-shrink-0 min-w-[280px] md:min-w-0 max-w-full ${isMobile ? 'h-auto' : 'h-[520px] md:h-[580px]'}`}
    >
      <div className="relative h-full bg-[#060913] border border-white/5 rounded-2xl flex flex-col p-6 md:p-8 justify-between select-none overflow-hidden transition-all duration-300 hover:border-cyan-500/20">
        
        {/* Top bar with icon */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-cyan-400">
              <Icon className="w-6 h-6" />
            </div>
            <span className="text-[10px] text-slate-600 font-mono tracking-widest uppercase">
              MODULE // 0{index + 1}
            </span>
          </div>

          {/* Title & Metadata */}
          <h3 className="text-2xl font-black text-white tracking-tight mb-1">
            {card.title}
          </h3>
          <p className="text-cyan-400 font-bold uppercase tracking-[0.1em] text-[10px] mb-4">
            {card.subtitle}
          </p>
          <p className="text-slate-400 text-sm leading-relaxed mb-6 font-medium max-w-[90%]">
            {card.description}
          </p>
        </div>

        {/* Custom Visual Widgets based on Index */}
        {index === 0 && <EngineersWidget />}
        {index === 1 && <CTOWidget />}
        {index === 2 && <FinanceWidget />}
        {index === 3 && <ProductWidget />}
        {index === 4 && <ComplianceWidget />}

      </div>
    </motion.div>
  );
}

// -------------------------------------------------------------
// BESPOKE COMPONENT WIDGETS
// -------------------------------------------------------------

function EngineersWidget() {
  return (
    <div className="mt-auto bg-slate-950/60 border border-white/5 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-400 shadow-[inset_0_0_20px_rgba(6,182,212,0.01)]">
      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-red-500/20" />
          <div className="w-2 h-2 rounded-full bg-yellow-500/20" />
          <div className="w-2 h-2 rounded-full bg-green-500/20" />
        </div>
        <span className="text-[9px] text-slate-600 font-sans tracking-wider uppercase">git-sync-daemon</span>
      </div>
      <div className="space-y-2">
        <div>
          <span className="text-cyan-400">~ /grantai-daemon</span>
          <span className="text-slate-500"> $ </span>
          <span className="text-slate-300">git commit -m "feat: db query index sync"</span>
        </div>
        <div className="text-slate-500 text-[10px]">Parsing standup telemetry...</div>
        <div className="p-2.5 bg-cyan-950/5 border border-cyan-500/10 rounded-lg text-slate-300 space-y-1.5">
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 font-sans">STATUS</span>
            <span className="text-emerald-400 font-bold tracking-wider">[ELIGIBLE]</span>
          </div>
          <div className="flex justify-between text-[10px]">
            <span className="text-slate-500 font-sans">CLASSIFICATION</span>
            <span className="font-sans">Frascati §3.2 (Experimental)</span>
          </div>
          <div className="flex justify-between text-[11px] font-bold text-white border-t border-white/5 pt-1.5 mt-1">
            <span className="font-sans text-slate-400">TAX CREDIT R&D VALUE</span>
            <span className="text-cyan-400 font-mono">€1,240.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function CTOWidget() {
  return (
    <div className="mt-auto bg-slate-950/60 border border-white/5 rounded-xl p-4 flex flex-col justify-between h-[210px] shadow-[inset_0_0_20px_rgba(6,182,212,0.01)]">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-[9px] text-slate-500 font-sans tracking-wider uppercase">R&D Capital Growth</div>
          <div className="text-lg font-black text-white font-mono mt-0.5">€142,850.00</div>
        </div>
        <div className="px-2 py-0.5 rounded bg-emerald-500/5 border border-emerald-500/10 text-[9px] text-emerald-400 font-bold font-mono">
          +24.8% YTD
        </div>
      </div>

      {/* Modern line chart */}
      <div className="relative w-full h-[70px] mt-4 flex items-end">
        <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(6, 182, 212)" stopOpacity="0.1" />
              <stop offset="100%" stopColor="rgb(6, 182, 212)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <line x1="0" y1="20" x2="300" y2="20" stroke="white" strokeOpacity="0.02" strokeWidth="1" strokeDasharray="3,3" />
          <line x1="0" y1="50" x2="300" y2="50" stroke="white" strokeOpacity="0.02" strokeWidth="1" strokeDasharray="3,3" />
          
          <path
            d="M 0 75 Q 40 68 80 52 T 160 38 T 240 22 T 300 10 L 300 80 L 0 80 Z"
            fill="url(#chartGradient)"
          />
          <path
            d="M 0 75 Q 40 68 80 52 T 160 38 T 240 22 T 300 10"
            fill="none"
            stroke="rgb(6, 182, 212)"
            strokeWidth="1.5"
          />
          <circle cx="300" cy="10" r="3" fill="rgb(6, 182, 212)" stroke="white" strokeWidth="1" />
        </svg>
      </div>

      <div className="flex justify-between text-[8px] text-slate-500 font-mono mt-2 uppercase tracking-widest">
        <span>Day 1</span>
        <span>Day 15</span>
        <span>Active Q2</span>
      </div>
    </div>
  );
}

function FinanceWidget() {
  return (
    <div className="mt-auto bg-slate-950/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] h-[210px] overflow-hidden flex flex-col justify-between shadow-[inset_0_0_20px_rgba(6,182,212,0.01)]">
      <div className="text-[9px] text-slate-500 font-sans tracking-wider uppercase mb-2 flex items-center justify-between">
        <span>Compliance Ledger</span>
        <span className="text-emerald-400 font-mono flex items-center gap-1">
          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
          SECURED
        </span>
      </div>
      <div className="flex-grow space-y-2.5">
        <div className="grid grid-cols-4 border-b border-white/5 pb-1 text-[8px] text-slate-500 font-bold uppercase">
          <span>Date</span>
          <span className="col-span-2">Technical Goal</span>
          <span className="text-right">Credit</span>
        </div>
        <div className="space-y-2 text-[9px]">
          <div className="grid grid-cols-4 text-slate-400 leading-tight">
            <span>May 22</span>
            <span className="col-span-2 text-slate-300 truncate">Optimized heavy index latency</span>
            <span className="text-right text-cyan-400">€2,450</span>
          </div>
          <div className="grid grid-cols-4 text-slate-400 leading-tight">
            <span>May 21</span>
            <span className="col-span-2 text-slate-300 truncate">Rebuilt authorization cache</span>
            <span className="text-right text-cyan-400">€1,890</span>
          </div>
          <div className="grid grid-cols-4 text-slate-400 leading-tight">
            <span>May 20</span>
            <span className="col-span-2 text-slate-300 truncate">Tokenizer grammar builder</span>
            <span className="text-right text-cyan-400">€3,120</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductWidget() {
  const [isParsed, setIsParsed] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsParsed(prev => !prev);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-auto bg-slate-950/60 border border-white/5 rounded-xl p-4 h-[210px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(6,182,212,0.01)]">
      <div className="flex items-center justify-between text-[9px] text-slate-500 font-sans tracking-wider uppercase">
        <span>Playground Sandbox</span>
        <span className="text-cyan-400 text-[8px] tracking-widest font-mono animate-pulse">
          {isParsed ? "PARSED RESULT" : "USER INPUT"}
        </span>
      </div>
      
      <div className="relative flex-grow mt-3 overflow-hidden rounded-lg bg-[#04060c] border border-white/5 p-3 flex flex-col justify-center">
        {/* Screen 1: Raw input */}
        <div className={`transition-all duration-700 absolute inset-3 flex flex-col justify-between ${isParsed ? 'opacity-0 scale-95 pointer-events-none' : 'opacity-100 scale-100'}`}>
          <div className="text-[10px] text-slate-400 leading-relaxed font-mono">
            <span className="text-slate-500 font-sans font-bold">Raw standup text:</span><br/>
            "Resolved Postgres database thread lockups to enable faster metadata analytics."
          </div>
          <div className="text-[8px] text-slate-600 font-mono mt-2 uppercase tracking-wider">Evaluating eligibility...</div>
        </div>

        {/* Screen 2: Scored result */}
        <div className={`transition-all duration-700 absolute inset-3 flex flex-col justify-between ${isParsed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[8px] text-slate-500 uppercase tracking-widest font-mono">Frascati §3.1</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[8px] font-mono font-bold">96% Conf</span>
            </div>
            <div className="text-[10px] font-mono text-slate-300 leading-normal">
              <span className="text-slate-500 font-sans font-bold">Justification:</span><br/>
              Overcoming technical limitations of metadata streaming engines.
            </div>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono border-t border-white/5 pt-1.5 mt-1 text-white font-bold">
            <span className="font-sans text-slate-400">ESTIMATED VALUE</span>
            <span className="text-cyan-400">€480.00</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ComplianceWidget() {
  return (
    <div className="mt-auto bg-slate-950/60 border border-white/5 rounded-xl p-4 h-[210px] flex flex-col justify-between shadow-[inset_0_0_20px_rgba(6,182,212,0.01)]">
      <div className="text-[9px] text-slate-500 font-sans tracking-wider uppercase mb-2">
        OECD Frascati Core Criteria
      </div>
      
      <div className="space-y-2 font-mono text-[9px] text-slate-400">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[✓]</span>
          <span className="text-slate-300 uppercase tracking-wider text-[8px]">Novelty</span>
          <span className="text-slate-600">— prior art analyzed</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[✓]</span>
          <span className="text-slate-300 uppercase tracking-wider text-[8px]">Creativity</span>
          <span className="text-slate-600">— hypothesis tested</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[✓]</span>
          <span className="text-slate-300 uppercase tracking-wider text-[8px]">Uncertainty</span>
          <span className="text-slate-600">— limitation documented</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">[✓]</span>
          <span className="text-slate-300 uppercase tracking-wider text-[8px]">Systematic</span>
          <span className="text-slate-600">— logs fully archived</span>
        </div>
      </div>

      <div className="border-t border-white/5 pt-2 flex items-center justify-between text-[8px] text-slate-500 font-mono uppercase tracking-widest mt-2">
        <span>VERDICT</span>
        <span className="text-emerald-400 font-bold">100% COMPLIANT</span>
      </div>
    </div>
  );
}
