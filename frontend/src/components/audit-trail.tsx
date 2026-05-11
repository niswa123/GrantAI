"use client"

import { motion } from "framer-motion"
import { CheckCircle2, Search, FileText, Calculator } from "lucide-react"

interface AuditStep {
  id: string
  title: string
  description: string
  status: 'completed' | 'processing' | 'pending'
  icon: any
}

export function AuditTrail({ steps }: { steps: AuditStep[] }) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <motion.div
          key={step.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex gap-4 relative"
        >
          {index !== steps.length - 1 && (
            <div className="absolute left-[19px] top-10 bottom-[-24px] w-[2px] bg-white/10" />
          )}
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${
            step.status === 'completed' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-500'
          }`}>
            <step.icon className="w-5 h-5" />
          </div>
          
          <div className="pt-1">
            <h4 className="text-sm font-bold text-white mb-1">{step.title}</h4>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{step.description}</p>
          </div>
          
          {step.status === 'completed' && (
            <div className="ml-auto">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
