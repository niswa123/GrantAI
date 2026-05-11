"use client"

import { motion } from "framer-motion"

export function ProcessingLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 p-12">
      <div className="relative w-24 h-24">
        <motion.div
          className="absolute inset-0 border-4 border-cyan-500/20 rounded-full"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          className="absolute inset-2 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-cyan-500 rounded-full shadow-[0_0_15px_rgba(6,182,212,1)]" />
        </div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">Analyzing R&D Projects</h3>
        <p className="text-slate-400 text-sm animate-pulse">Running compliance engine v2.0...</p>
      </div>
    </div>
  )
}
