"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Lightbulb,
  Briefcase,
  Code2,
  AlertCircle,
  Loader2,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

import { useWorkspace } from "@/providers/workspace-provider";

const EXAMPLE_DESCRIPTIONS = [
  "We built a novel ML pipeline to detect anomalies in manufacturing sensor data. The approach combined transformer-based architectures with time-series forecasting — a technically uncertain problem with no existing off-the-shelf solution. Multiple iterations were required to overcome gradient vanishing and real-time inference constraints.",
  "Our team developed a new compression algorithm for medical imaging that achieves 40% better lossless compression than the current DICOM standard. This required systematic experimentation with novel entropy coding schemes and hardware-aware optimization techniques.",
  "We conducted systematic research into applying reinforcement learning for adaptive supply chain routing. No existing solution addressed our constraint set, so we designed and validated a custom reward shaping methodology through 200+ experimental runs.",
];

function CurrencyInput({
  id,
  label,
  icon: Icon,
  value,
  onChange,
  placeholder,
  hint,
}: {
  id: string;
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  hint: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-2">
        <Icon className="w-4 h-4 text-cyan-400" />
        {label}
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-lg select-none">
          €
        </span>
        <input
          id={id}
          type="number"
          min={0}
          step={100}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-8 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-600 font-mono text-base sm:text-lg focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all touch-manipulation [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        />
      </div>
      <p className="mt-1.5 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function InputPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [description, setDescription] = useState("");
  const [salaryCosts, setSalaryCosts] = useState("");
  const [devCosts, setDevCosts] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  const totalCosts =
    (parseFloat(salaryCosts) || 0) + (parseFloat(devCosts) || 0);
  const isValid =
    description.trim().length >= 20 && totalCosts > 0;

  const handleFillExample = () => {
    setDescription(EXAMPLE_DESCRIPTIONS[exampleIdx % EXAMPLE_DESCRIPTIONS.length]);
    setExampleIdx((i) => i + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          salaryCosts: parseFloat(salaryCosts) || 0,
          devCosts: parseFloat(devCosts) || 0,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Calculation failed. Please try again.");
      }

      // Cache the full API response in sessionStorage so result page can
      // display rich data (draftClaim, criteriaScores, chainOfThought) without
      // losing it after a DB read that only stores a subset of fields.
      try {
        sessionStorage.setItem(`result:${data.id}`, JSON.stringify(data));
      } catch {
        // sessionStorage may be unavailable (private mode etc.) — non-fatal
      }

      router.push(`/result?id=${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-cyan-500/6 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 pt-8 pb-20">
        {/* Back */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-6 sm:mb-8 group touch-manipulation"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-400/30 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="text-xs font-bold text-cyan-400 tracking-widest uppercase">
                New Calculation
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Describe Your{" "}
              <span className="text-cyan-400">
                R&amp;D Project
              </span>
            </h1>
            <p className="mt-2 text-base text-slate-400">
              Calculation for <span className="text-white font-medium">{activeWorkspace?.name || "your workspace"}</span>. Tell us what you built, enter your costs, and we&apos;ll estimate your eligible R&amp;D tax credit instantly.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-semibold text-slate-300"
                >
                  <Lightbulb className="w-4 h-4 text-cyan-400" />
                  Project Description
                </label>
                <button
                  type="button"
                  onClick={handleFillExample}
                  className="text-xs text-cyan-500 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Fill example
                </button>
              </div>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={6}
                placeholder="Describe the technical uncertainty, novel approaches, and systematic research or experimentation in your project. Be specific about what made this R&D work — what problem you were solving and why existing solutions weren't sufficient…"
                className="w-full px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl bg-slate-900/80 border border-white/10 text-white placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 transition-all"
              />
              <div className="mt-1.5 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Minimum 20 characters. More detail = better accuracy.
                </p>
                <span
                  className={`text-xs font-mono ${
                    description.length >= 20 ? "text-emerald-500" : "text-slate-600"
                  }`}
                >
                  {description.length} chars
                </span>
              </div>
            </div>

            {/* Cost Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <CurrencyInput
                id="salary-costs"
                label="Salary Costs"
                icon={Briefcase}
                value={salaryCosts}
                onChange={setSalaryCosts}
                placeholder="50000"
                hint="Total staff salaries for R&D work (annual or project)"
              />
              <CurrencyInput
                id="dev-costs"
                label="Development Costs"
                icon={Code2}
                value={devCosts}
                onChange={setDevCosts}
                placeholder="20000"
                hint="Tools, cloud, subcontractors, hardware, etc."
              />
            </div>

            {/* Total preview */}
            <AnimatePresence>
              {totalCosts > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/60 border border-white/8">
                    <span className="text-sm text-slate-400 font-medium">Total eligible costs</span>
                    <span className="text-lg font-black text-white font-mono">
                      €{totalCosts.toLocaleString("en-EU")}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-3 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              type="submit"
              id="calculate-rd-button"
              disabled={!isValid || loading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-bold text-base transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-950 shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:shadow-[0_0_50px_rgba(6,182,212,0.5)] hover:scale-[1.01] active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>AI is analysing…</span>
                </>
              ) : (
                <>
                  <span>Calculate R&amp;D Credit</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            <p className="text-center text-xs text-slate-600">
              Powered by custom LLM built by the GrantAI Team · Results are estimates only, not legal tax advice.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
