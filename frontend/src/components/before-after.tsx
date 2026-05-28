import React, { useRef } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { FileText, Clock, AlertCircle, Cpu, ShieldCheck, Zap, Trash2 } from "lucide-react";

export function BeforeAfterSection() {
  return (
    <>
      <div className="hidden md:block">
        <BeforeAfterDesktop />
      </div>
      <div className="block md:hidden">
        <BeforeAfterMobile />
      </div>
    </>
  );
}

// ==========================================
// MOBILE VERSION: One-Shot Trash Can Animation
// ==========================================
function BeforeAfterMobile() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "center center"]
  });
  
  // We trigger the animation only when the card is fully in view
  const isInView = useInView(containerRef, { once: true, margin: "-20% 0px -20% 0px" });

  return (
    <section ref={containerRef} className="relative py-24 sm:py-32 bg-slate-950 overflow-hidden flex flex-col justify-center items-center">
      
      {/* Background ambient mesh */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
      </div>

      {/* Header Text */}
      <div className="text-center mb-8 sm:mb-12 relative z-20 px-2 sm:px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] sm:text-xs text-slate-400 mb-4 sm:mb-6 tracking-wider uppercase backdrop-blur-md"
        >
          [ THE PARADIGM SHIFT ]
        </motion.div>
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter text-white leading-[1.1]"
        >
          Ditch the 25% success fee. <br/>
          <span className="text-cyan-400 drop-shadow-sm">
            Claim R&D autonomously.
          </span>
        </motion.h2>
      </div>

      {/* Cards Container */}
      <div className="relative w-full max-w-[340px] sm:max-w-sm mx-auto h-[480px] sm:h-[500px]">
        
        {/* TRASH CAN ANIMATION ELEMENT */}
        <motion.div
          initial={{ scale: 0, y: 200, opacity: 0 }}
          animate={isInView ? {
            scale: [0, 1.2, 1.4, 0],
            opacity: [0, 1, 1, 0],
            y: [200, 160, 160, 220]
          } : { scale: 0, y: 200, opacity: 0 }}
          transition={{ duration: 1.5, delay: 1.3, times: [0, 0.2, 0.7, 1], ease: "anticipate" }}
          className="absolute bottom-[-40px] left-1/2 -translate-x-1/2 z-30 pointer-events-none"
        >
          <div className="w-20 h-20 rounded-full bg-slate-950 flex items-center justify-center border-2 border-red-500/50 shadow-[0_0_50px_rgba(239,68,68,0.6),inset_0_0_20px_rgba(239,68,68,0.4)]">
            <Trash2 className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
          </div>
        </motion.div>

        {/* THE OLD WAY (Card getting thrown away) */}
        <motion.div 
          initial={{ scale: 1, y: 0, rotate: 0, opacity: 1 }}
          animate={isInView ? {
            scale: [1, 1.05, 0.2, 0],
            y: [0, -30, 200, 250],
            rotate: [0, 5, -35, -90],
            opacity: [1, 1, 0.8, 0],
            filter: ["blur(0px)", "blur(0px)", "blur(5px)", "blur(10px)"]
          } : { scale: 1, y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.0, times: [0, 0.2, 0.8, 1], ease: "easeInOut" }}
          className="absolute inset-0 rounded-[32px] bg-[#060913] p-6 border border-white/10 shadow-xl overflow-hidden flex flex-col z-20 origin-bottom"
        >
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
          <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-red-500/10 blur-3xl rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full pointer-events-none">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-[18px] bg-red-500/10 flex items-center justify-center text-red-500 border border-red-500/30 backdrop-blur-md">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">The Old Way</h3>
                <p className="text-slate-500 font-bold uppercase tracking-[0.15em] text-[10px]">Opaque & Manual</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {[
                { icon: FileText, text: "Grueling interviews: hours wasted on surveys with non-technical accountants" },
                { icon: Clock, text: "25% success fees: thousands of dollars lost to legacy consultancies" },
                { icon: AlertCircle, text: "Audit exposure: weak, manual documentation that tax inspectors easily challenge" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
                    <item.icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <span className="text-slate-300 font-medium text-xs leading-tight text-left">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* EXPLOSION GLARE FOR NEW CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={isInView ? { opacity: [0, 1, 0], scale: [0.5, 2, 3] } : { opacity: 0, scale: 0.5 }}
          transition={{ duration: 1.2, delay: 2.6, ease: "easeOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-cyan-400 rounded-full blur-[80px] z-0 pointer-events-none mix-blend-screen"
        />

        {/* WITH GRANT AI (Springs out like magic) */}
        <motion.div 
          initial={{ scale: 0.5, y: 150, opacity: 0, rotateX: 45 }}
          animate={isInView ? { scale: 1, y: 0, opacity: 1, rotateX: 0 } : { scale: 0.5, y: 150, opacity: 0, rotateX: 45 }}
          transition={{ duration: 0.8, delay: 2.7, type: "spring", bounce: 0.5 }}
          style={{ perspective: "1000px" }}
          className="absolute inset-0 rounded-[32px] bg-[#020617] p-6 border border-cyan-500/30 shadow-[0_20px_80px_rgba(6,182,212,0.3),inset_0_0_30px_rgba(6,182,212,0.1)] overflow-hidden flex flex-col z-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(6,182,212,0.15),transparent_70%)] blur-xl pointer-events-none" />
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_30px_#22d3ee]" />

          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/40 blur-xl rounded-full animate-pulse" />
                <div className="relative w-14 h-14 rounded-[18px] bg-gradient-to-b from-cyan-500/20 to-slate-900/80 flex items-center justify-center text-cyan-400 border border-cyan-400/50 backdrop-blur-xl">
                  <Zap className="w-7 h-7 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight drop-shadow-md">With GrantAI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                  </span>
                  <p className="text-cyan-400 font-bold uppercase tracking-[0.15em] text-[10px]">Code-Level Authority</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mt-auto">
              {[
                { icon: Cpu, text: "Code-level extraction: R&D mapped automatically from commits and PRs" },
                { icon: ShieldCheck, text: "Fixed-fee subscription: keep 100% of your tax credit with zero success fees" },
                { icon: FileText, text: "Audit-proof defense: cryptographically signed reports with full evidence chains" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-slate-900/80 border border-cyan-500/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.05)] relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                  <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center shrink-0 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]">
                    <item.icon className="w-4 h-4 text-cyan-400" />
                  </div>
                  <span className="text-white font-semibold text-xs leading-tight text-left">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

// ==========================================
// DESKTOP VERSION: Scanner Wipe
// ==========================================
function BeforeAfterDesktop() {
  const containerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const clipPathPercent = useTransform(scrollYProgress, [0.2, 0.7], [100, 0]);
  const clipPath = useTransform(clipPathPercent, (val) => `inset(0 0 ${val}% 0)`);
  
  const lineTop = useTransform(scrollYProgress, [0.2, 0.7], ["0%", "100%"]);
  const lineOpacity = useTransform(scrollYProgress, [0.1, 0.2, 0.68, 0.7], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-slate-950 overflow-clip">
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-center items-center bg-slate-950">
        
        {/* Background ambient mesh */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d408_1px,transparent_1px),linear-gradient(to_bottom,#06b6d408_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_60%,transparent_100%)]" />
          <div className="w-[150vw] h-[150vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05),transparent_70%)] rounded-full blur-3xl" />
        </div>

        {/* Header Text */}
        <div className="text-center mb-12 relative z-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-xs text-slate-400 mb-6 sm:mb-8 tracking-wider uppercase backdrop-blur-md"
          >
            [ THE PARADIGM SHIFT ]
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[1.1]"
          >
            Ditch the 25% success fee. <br className="md:hidden"/>
            <span className="text-cyan-400 drop-shadow-sm">
              Claim R&D autonomously.
            </span>
          </motion.h2>
        </div>

        {/* The Comparison Card Container */}
        <div className="relative w-full max-w-5xl mx-auto px-6">
          <div className="relative w-full rounded-[40px] md:rounded-[48px] overflow-hidden border border-white/10 shadow-[0_30px_100px_rgba(0,0,0,0.8),inset_0_0_30px_rgba(255,255,255,0.02)]">
            
            {/* LAYER 1: THE OLD WAY (Dark / Red) */}
            <div className="relative bg-[#060913] p-10 md:p-16 flex flex-col justify-center w-full min-h-[400px]">
              {/* Grid texture for old way */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)] pointer-events-none" />
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-red-500/5 blur-[100px] rounded-full pointer-events-none" />
              
              <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center h-full relative z-10">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-red-500/20 blur-xl rounded-full" />
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[20px] bg-gradient-to-b from-red-500/10 to-red-900/10 flex items-center justify-center text-red-500 border border-red-500/30 backdrop-blur-xl shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]">
                      <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-400" />
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">The Old Way</h3>
                  <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-sm">Opaque & Manual</p>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-5">
                  {[
                    { icon: FileText, text: "Grueling interviews: hours wasted on surveys with non-technical accountants" },
                    { icon: Clock, text: "25% success fees: thousands of dollars lost to legacy consultancies" },
                    { icon: AlertCircle, text: "Audit exposure: weak, manual documentation that tax inspectors easily challenge" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 md:gap-6 p-5 md:p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-red-500/20 transition-colors backdrop-blur-md shadow-[inset_0_0_20px_rgba(255,255,255,0.01)] group w-full">
                      <div className="w-10 h-10 rounded-full bg-slate-800/80 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-red-500/30 transition-colors">
                        <item.icon className="w-5 h-5 text-slate-400 group-hover:text-red-400 transition-colors" />
                      </div>
                      <span className="text-slate-300 font-medium text-base md:text-lg text-left">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LAYER 2: WITH GRANT AI */}
            <motion.div 
              style={{ clipPath }}
              className="absolute inset-0 bg-[#020617] p-10 md:p-16 flex flex-col justify-center z-10 shadow-[0_-20px_50px_rgba(6,182,212,0.15)]"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#06b6d41a_1px,transparent_1px),linear-gradient(to_bottom,#06b6d41a_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_50%,#000_40%,transparent_100%)] opacity-30 pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15),transparent_60%)] blur-2xl pointer-events-none" />

              <div className="flex flex-col md:flex-row gap-12 md:gap-16 items-center h-full relative z-10">
                <div className="w-full md:w-1/3 flex flex-col items-center md:items-start text-center md:text-left">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-cyan-500/40 blur-2xl rounded-full animate-pulse" />
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-[20px] bg-gradient-to-b from-cyan-500/20 to-slate-900/80 flex items-center justify-center text-cyan-400 border border-cyan-400/50 backdrop-blur-xl shadow-[inset_0_0_30px_rgba(6,182,212,0.2)]">
                      <Zap className="w-8 h-8 md:w-10 md:h-10 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                    </div>
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2 drop-shadow-lg">With GrantAI</h3>
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                    </span>
                    <p className="text-cyan-400 font-bold uppercase tracking-[0.2em] text-sm drop-shadow">Code-Level Authority</p>
                  </div>
                </div>

                <div className="w-full md:w-2/3 flex flex-col gap-4 md:gap-5">
                  {[
                    { icon: Cpu, text: "Code-level extraction: R&D mapped automatically from commits and PRs" },
                    { icon: ShieldCheck, text: "Fixed-fee subscription: keep 100% of your tax credit with zero success fees" },
                    { icon: FileText, text: "Audit-proof defense: cryptographically signed reports with full evidence chains" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-5 md:gap-6 p-5 md:p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-slate-900/60 border border-cyan-500/30 backdrop-blur-md shadow-[inset_0_0_20px_rgba(6,182,212,0.05),0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden group w-full">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      <div className="w-10 h-10 rounded-full bg-cyan-950 flex items-center justify-center shrink-0 border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                        <item.icon className="w-5 h-5 text-cyan-400" />
                      </div>
                      <span className="text-white font-semibold text-base md:text-lg tracking-wide text-left">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* THE SCANNER LINE */}
            <motion.div 
              style={{ top: lineTop, opacity: lineOpacity }}
              className="absolute left-0 right-0 h-[3px] bg-cyan-400 z-20 shadow-[0_0_40px_rgba(6,182,212,1),0_0_80px_rgba(6,182,212,0.8)]"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[80px] bg-gradient-to-t from-cyan-500/40 via-cyan-500/10 to-transparent -translate-y-full blur-md pointer-events-none" />
            </motion.div>
            
          </div>
        </div>
      </div>
    </section>
  );
}
