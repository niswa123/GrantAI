"use client";

import { motion } from "framer-motion";
import { CreditCard, Zap, Check } from "lucide-react";

const plans = [
  {
    name: "Free", price: "€0", period: "/month", current: true,
    features: ["3 R&D calculations/month", "CSV export", "1 workspace member", "Basic AI analysis"],
    cta: "Current Plan", ctaDisabled: true,
  },
  {
    name: "Pro", price: "€49", period: "/month", current: false,
    features: ["Unlimited calculations", "PDF export", "Up to 10 members", "Advanced AI + WBSO deep analysis", "Priority support"],
    cta: "Upgrade to Pro", ctaDisabled: false, highlight: true,
  },
  {
    name: "Enterprise", price: "Custom", period: "", current: false,
    features: ["Unlimited everything", "SSO / SAML", "Dedicated account manager", "Custom tax rules", "SLA guarantee"],
    cta: "Contact Sales", ctaDisabled: false,
  },
];

export default function BillingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Billing</h1>
        </div>
        <p className="text-sm text-slate-400 ml-12">Manage your subscription and payment details.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.06 }}
            className={`relative rounded-2xl border p-6 flex flex-col ${
              plan.highlight
                ? "border-cyan-500/30 bg-gradient-to-b from-cyan-500/8 to-slate-900/60 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                : "border-white/8 bg-slate-900/40"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-cyan-500 rounded-full text-xs font-bold text-slate-950">
                <Zap className="w-3 h-3" /> Most Popular
              </div>
            )}
            {plan.current && (
              <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-1 bg-slate-700 border border-white/10 rounded-full text-xs font-bold text-slate-300">
                Current
              </div>
            )}

            <div className="mb-4">
              <h3 className="text-base font-black text-white">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-3xl font-black text-white">{plan.price}</span>
                {plan.period && <span className="text-sm text-slate-400">{plan.period}</span>}
              </div>
            </div>

            <ul className="space-y-2.5 flex-1 mb-6">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              disabled={plan.ctaDisabled}
              className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all ${
                plan.highlight
                  ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                  : plan.ctaDisabled
                  ? "bg-slate-800 text-slate-500 cursor-default border border-white/5"
                  : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:border-white/20"
              }`}
            >
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Current usage */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
        className="mt-8 p-5 rounded-2xl border border-white/8 bg-slate-900/40">
        <h3 className="text-sm font-bold text-white mb-4">Current Usage — Free Plan</h3>
        <div className="space-y-3">
          {[{ label: "Calculations", used: 1, max: 3 }, { label: "Team Members", used: 1, max: 1 }].map(({ label, used, max }) => (
            <div key={label}>
              <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                <span>{label}</span>
                <span className="font-mono">{used} / {max}</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${(used / max) * 100}%` }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                  className={`h-full rounded-full ${used / max >= 1 ? "bg-rose-500" : "bg-cyan-500"}`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
