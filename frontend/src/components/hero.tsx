"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Cpu, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  const containerRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.85])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0.1])

  return (
    <section ref={containerRef} className="relative min-h-[110vh] w-full bg-slate-950 overflow-hidden max-w-[100vw]">
      <motion.div 
        style={{ scale, opacity }}
        className="relative w-full flex flex-col items-center justify-start pt-32 md:pt-40"
      >
        {/* Deep Space Grid Background */}
        <div className="absolute inset-0 bg-slate-950 -z-30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_center,rgba(6,182,212,0.15),transparent_60%)] -z-20" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] -z-20 [mask-image:radial-gradient(ellipse_at_top,black_40%,transparent_70%)]" />

        <div className="container mx-auto px-4 relative z-10 text-center flex flex-col items-center">

        {/* Shine Badge */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-white/10 mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
          <span className="text-sm font-medium text-slate-300">GrantAI Engine v2.0 Live</span>
        </motion.div>
        
        {/* Main Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
          className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 sm:mb-8 text-white leading-[1.05] max-w-5xl mx-auto px-4"
        >
          Turn Code into <br />
          <span className="text-cyan-400 drop-shadow-sm">
            Financial Capital.
          </span>
        </motion.h1>
        
        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-400 max-w-3xl mx-auto mb-8 sm:mb-10 leading-relaxed font-medium px-4"
        >
          The most powerful platform to track Continuous R&D Value Flow. 
          Maximize your engineering capital transparently and daily.
        </motion.p>
        
        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 w-full max-w-2xl"
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button size="xl" className="group w-full sm:w-auto px-6 sm:px-10 py-6 sm:py-8 text-base sm:text-lg rounded-full overflow-hidden bg-white hover:bg-slate-100 text-black border border-white shadow-[0_0_30px_rgba(255,255,255,0.2)] touch-manipulation">
              Start Tracking Daily Value
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1.5 transition-transform" />
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button variant="premium" size="xl" className="w-full sm:w-auto px-6 sm:px-10 py-6 sm:py-8 text-base sm:text-lg rounded-full border border-white/10 bg-slate-900/50 hover:bg-slate-800 touch-manipulation">
              See How it Works
            </Button>
          </motion.div>
        </motion.div>

        {/* Hero 3D Dashboard Mockup (The WOW Effect) */}
        <motion.div 
          initial={{ opacity: 0, y: 120, rotateX: 15, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.5, type: "spring", stiffness: 45, damping: 20 }}
          style={{ perspective: 1500 }}
          className="mt-12 sm:mt-16 md:mt-20 w-full max-w-5xl mx-auto relative group px-4"
        >
          {/* Ambient Mockup Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 to-cyan-400/30 rounded-[40px] blur-2xl opacity-40 group-hover:opacity-70 transition-opacity duration-1000" />
          
          <div className="relative rounded-t-2xl sm:rounded-t-3xl md:rounded-t-[40px] border-t border-x border-white/15 bg-slate-950/80 backdrop-blur-2xl p-4 sm:p-6 md:p-10 overflow-hidden shadow-2xl h-[350px] sm:h-[400px] md:h-[450px] flex flex-col transition-transform duration-700 ease-out group-hover:-translate-y-2">
            
            {/* Dashboard Mock Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 sm:pb-6 mb-4 sm:mb-6 gap-3 sm:gap-4">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl sm:rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]">
                  <Cpu className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-cyan-400" />
                </div>
                <div className="text-left">
                  <div className="text-white font-bold text-base sm:text-lg md:text-xl tracking-tight">AI Engine v2.0</div>
                  <div className="text-cyan-400 text-xs sm:text-sm font-medium flex items-center gap-2 mt-0.5 sm:mt-1">
                    <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-400 animate-pulse" /> 
                    <span className="hidden xs:inline">Scanning Jira & GitHub...</span>
                    <span className="xs:hidden">Scanning...</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 sm:gap-3">
                <div className="px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full border border-white/5 bg-white/5 text-xs sm:text-sm font-medium text-slate-300">
                  <span className="hidden xs:inline">Confidence: </span>
                  <span className="text-white font-bold">99.8%</span>
                </div>
              </div>
            </div>

            {/* Dashboard Mock Body - Code & Report side by side */}
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 relative">
              {/* Left: Code Box */}
              <div className="rounded-2xl sm:rounded-3xl bg-black/50 border border-white/5 p-3 sm:p-4 md:p-6 font-mono text-xs sm:text-sm text-slate-400 overflow-hidden relative shadow-inner">
                <div className="absolute top-2 sm:top-3 md:top-4 right-2 sm:right-3 md:right-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-600">Terminal</div>
                <motion.div 
                  initial={{ y: 0 }} 
                  animate={{ y: -60 }} 
                  transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
                  className="space-y-3 opacity-70"
                >
                  <p><span className="text-emerald-400">root@grantai:~#</span> analyze ./repo</p>
                  <p><span className="text-slate-300">commit</span> 8a3f2b1 integration of new AI caching layer...</p>
                  <p><span className="text-cyan-400">feat:</span> build dynamic AST parser for semantic code graph</p>
                  <p><span className="text-slate-500">// Requires extensive trial and error scaling</span></p>
                  <p><span className="text-cyan-400">perf:</span> offload heavy tensor ops to highly parallelized workers</p>
                  <p className="text-yellow-400">Found Technical Uncertainty: 154 instances</p>
                  <p><span className="text-slate-300">commit</span> 2d9a1f5 resolver for cyclic dependency deadlocks...</p>
                </motion.div>
                {/* Floating Analysis Scanner Line */}
                <motion.div 
                  animate={{ top: ["0%", "100%", "0%"] }} 
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute left-0 w-full h-[1px] bg-cyan-500 shadow-[0_0_15px_#06b6d4] z-10"
                />
              </div>

              {/* Right: Generated Claim */}
              <div className="rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-950/30 to-slate-900/50 border border-cyan-500/20 p-3 sm:p-4 md:p-6 relative">
                <div className="absolute top-3 sm:top-4 md:top-6 right-3 sm:right-4 md:right-6">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30">
                    <FileCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-emerald-400" />
                  </div>
                </div>
                <div className="text-white font-bold text-sm sm:text-base md:text-lg mb-4 sm:mb-5 md:mb-6">Real-time Value Dashboard</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total R&D Value Generated</span>
                    <span className="text-emerald-400 font-bold">€1,240</span>
                  </div>
                  <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 3, repeat: Infinity }} className="w-full h-4 rounded bg-cyan-400/20" />
                  <div className="flex items-center justify-between text-sm mt-4">
                    <span className="text-slate-400">AI Confidence</span>
                    <span className="text-white font-bold">99.8%</span>
                  </div>
                  <div className="w-11/12 h-4 rounded bg-cyan-500/10" />
                  <div className="w-full h-4 rounded flex gap-3 mt-8">
                    <div className="w-1/3 h-full bg-emerald-600/40 rounded" />
                    <div className="w-2/3 h-full bg-cyan-500/20 rounded" />
                  </div>
                </div>
              </div>
            </div>
            
              {/* Fade Out Graphic at the bottom */}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-slate-950 to-transparent z-20 pointer-events-none" />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}
