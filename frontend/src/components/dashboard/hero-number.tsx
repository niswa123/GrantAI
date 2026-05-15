"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { TrendingUp, Sparkles } from "lucide-react";

interface HeroNumberProps {
  value: number;
  currency?: string;
}

export function HeroNumber({ value, currency = "€" }: HeroNumberProps) {
  const count = useMotionValue(0);
  
  useEffect(() => {
    const animation = animate(count, value, {
      duration: 1.5,
      ease: "easeOut",
    });
    return animation.stop;
  }, [value, count]);

  const display = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString()
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-black border border-cyan-500/20 p-6 sm:p-8 md:p-12 mb-6 sm:mb-8 group"
    >
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[50%] -left-[10%] w-[70%] h-[150%] bg-cyan-500/10 blur-[120px] rounded-full group-hover:bg-cyan-400/20 transition-colors duration-700" />
        <div className="absolute top-[20%] -right-[20%] w-[60%] h-[120%] bg-purple-500/10 blur-[100px] rounded-full group-hover:bg-purple-400/20 transition-colors duration-700" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs sm:text-sm font-semibold tracking-wide"
        >
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>Total Accumulated R&D Value</span>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.7, type: "spring" }}
          className="flex items-baseline justify-center"
        >
          <span className="text-3xl sm:text-4xl md:text-6xl font-light text-slate-400 mr-1 sm:mr-2">{currency}</span>
          <motion.span className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-500">
            {display}
          </motion.span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="flex items-center gap-2 text-emerald-400 font-medium bg-emerald-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm"
        >
          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
          <span>+{currency}1,240 this week</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
