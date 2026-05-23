"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Cpu, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePostHog } from "posthog-js/react"

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const posthog = usePostHog()
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1])

  return (
    <section ref={containerRef} className="relative min-h-[100dvh] w-full bg-slate-950 overflow-hidden">
      <motion.div 
        style={{ scale, opacity }}
        className="relative w-full h-full flex flex-col items-center justify-start pt-24 sm:pt-32 md:pt-40 pb-10 overflow-hidden"
      >
        {/* Deep Space Grid Background */}
        <div className="absolute inset-0 bg-slate-950 -z-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(6,182,212,0.15),transparent_60%)] -z-20" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] -z-20 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_70%)]" />

        <div className="container mx-auto px-4 sm:px-6 relative z-10 text-center flex flex-col items-center max-w-full">

        {/* Shine Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] sm:text-xs text-slate-400 mb-4 sm:mb-8 tracking-wider uppercase"
        >
          [ COMPLIANCE ENGINE // V2.0.DETERMINISTIC ]
        </motion.div>
        
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl leading-[1.1] sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-4 sm:mb-8 text-white max-w-5xl mx-auto px-4 sm:px-6 break-words"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          Turn Code into<br />
          <span className="text-cyan-400">
            Financial Capital.
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-400 max-w-2xl mx-auto mb-6 sm:mb-10 leading-relaxed font-medium px-4 sm:px-6"
          style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
        >
          Continuous OECD Frascati R&D valuation. Turn your engineering logs into a verified, audit-ready financial asset.
        </motion.p>
        
        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 px-4 sm:px-6 w-full max-w-md"
        >
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:flex-1">
            <Button
              size="xl"
              onClick={() => posthog?.capture('Clicked Start Tracking', { location: 'hero' })}
              className="group w-full px-5 sm:px-8 py-3.5 sm:py-5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm bg-white hover:bg-slate-100 text-black border border-white transition-all shadow-[0_4px_20px_rgba(255,255,255,0.08)] whitespace-nowrap"
            >
              Start Tracking
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} className="w-full sm:flex-1">
            <Button
              variant="premium"
              size="xl"
              onClick={() => posthog?.capture('Clicked How it Works', { location: 'hero' })}
              className="w-full px-5 sm:px-8 py-3.5 sm:py-5 text-xs sm:text-sm font-bold uppercase tracking-wider rounded-sm border border-white/10 bg-slate-900/50 hover:bg-slate-800 transition-all whitespace-nowrap"
            >
              How it Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero 3D Dashboard Mockup (Terminal-Native precision) */}
        <motion.div 
          initial={{ opacity: 0, y: 60, rotateX: 5, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.4, ease: "easeOut" }}
          style={{ perspective: 1200 }}
          className="mt-12 sm:mt-20 w-full max-w-5xl mx-auto relative group px-2 sm:px-4 flex-grow flex flex-col justify-end"
        >
          <div className="relative rounded-t-xl border-t border-x border-white/10 bg-slate-950/90 p-4 sm:p-6 md:p-8 overflow-hidden shadow-2xl h-[300px] sm:h-[400px] md:h-[420px] flex flex-col">
            
            {/* Dashboard Mock Header */}
            <div className="flex flex-row items-center justify-between border-b border-white/5 pb-4 mb-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-sm bg-white/[0.02] flex items-center justify-center border border-white/10 text-slate-400">
                  <Cpu className="w-4 h-4" />
                </div>
                <div className="text-left font-mono">
                  <div className="text-white font-bold text-xs sm:text-sm tracking-tight uppercase">Claims Inspector</div>
                  <div className="text-cyan-400 text-[10px] sm:text-xs font-semibold flex items-center gap-2 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" /> 
                    <span>Sync Mode: ACTIVE // Tracking repository streams</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="px-3 py-1 rounded-sm border border-white/5 bg-white/[0.02] text-[10px] sm:text-xs font-mono text-slate-400">
                  CONFIDENCE: <span className="text-white font-bold">99.8%</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mock Body - Code & Report side by side */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
              {/* Left: Code Box */}
              <div className="min-w-0 rounded-lg bg-black/60 border border-white/5 p-4 sm:p-5 font-mono text-[10px] sm:text-xs text-slate-400 overflow-hidden relative">
                <div className="absolute top-2 right-3 text-[9px] font-bold uppercase tracking-widest text-slate-600">AST Parser</div>
                <motion.div 
                  initial={{ y: 0 }} 
                  animate={{ y: -50 }} 
                  transition={{ duration: 15, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  className="space-y-3 opacity-90 break-all sm:break-words whitespace-pre-wrap text-left"
                >
                  <p className="text-slate-500">// ANALYZING: commit/8a3f2b1 [Frascati compliance evaluation]</p>
                  <p><span className="text-slate-300">class</span> ComplianceAnalyzer {"{"}</p>
                  <p className="pl-4"><span className="text-cyan-400">evaluateUncertainty</span>(ast) {"{"}</p>
                  <p className="pl-8 text-slate-500">// Searching for system design deadlocks / algorithm constraints</p>
                  <p className="pl-8 text-emerald-400">STATUS: True (Algorithmic Uncertainty Identified)</p>
                  <p className="pl-8 text-slate-400">confidence_score: 0.998</p>
                  <p className="pl-8 text-slate-400">overhead_ratio: 0.43 (French Code General Impôts)</p>
                  <p className="pl-4">{"}"}</p>
                  <p>{"}"}</p>
                </motion.div>
                {/* Clean monospaced scanner scanbar */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }} 
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[1px] bg-cyan-400/40 pointer-events-none"
                />
              </div>

              {/* Right: Generated Claim */}
              <div className="rounded-lg bg-slate-900/40 border border-white/5 p-4 sm:p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                    <span className="text-xs font-mono uppercase text-slate-400">R&D Capital Asset Log</span>
                    <span className="text-emerald-400 text-xs font-mono">VERIFIED</span>
                  </div>
                  <div className="space-y-3 text-left">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Total Capital Tracked</span>
                      <span className="text-lg font-mono font-black text-white">€1,240.00</span>
                    </div>
                    <div className="w-full bg-white/5 h-[3px] rounded-full overflow-hidden">
                      <div className="bg-cyan-400 w-[73%] h-full" />
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Tax Credit Qualified</span>
                      <span className="text-sm font-mono font-bold text-emerald-400">€533.20</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-left pt-4">
                  <div className="bg-black/30 rounded-sm p-2 border border-white/5">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">OECD Cat</div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">Software</div>
                  </div>
                  <div className="bg-black/30 rounded-sm p-2 border border-white/5">
                    <div className="text-[9px] text-slate-500 font-mono uppercase">Jurisdiction</div>
                    <div className="text-xs font-bold text-white uppercase tracking-tight">EU (Frascati)</div>
                  </div>
                </div>
              </div>
            </div>
            
              {/* Fade Out Graphic at the bottom */}
              <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
