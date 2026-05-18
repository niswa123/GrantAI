"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { createCompany } from "@/app/actions/companyActions";
import { ArrowRight, Building2, Globe, Loader2, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";

const COUNTRIES = [
  "Netherlands", "United Kingdom", "France", "Germany",
  "Belgium", "Sweden", "Ireland", "Spain", "United States",
  "Canada", "Australia", "Other",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [country, setCountry] = useState("");

  const userName = session?.user?.name?.split(" ")[0] || "there";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !country) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const result = await createCompany(
        companyName.trim(),
        country,
        undefined,
        registrationNumber.trim() || undefined,
        vatNumber.trim() || undefined
      );
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }
      // Show success step briefly, then redirect
      setStep(3);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Grid texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-[0_0_60px_rgba(6,182,212,0.08)]">

          <AnimatePresence mode="wait">
            {/* ── Step 1: Welcome ── */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Step 1 of 2
                </div>

                <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
                  Welcome, {userName}! 👋
                </h1>
                <p className="text-slate-400 text-base leading-relaxed mb-8">
                  Let's set up your workspace. This takes 30 seconds and helps GrantAI calculate your R&D tax credits accurately.
                </p>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: "🏢", text: "Your company name for claims" },
                    { icon: "🌍", text: "Your country for tax jurisdiction" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-slate-300 text-sm">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-base flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                >
                  Let's Go <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {/* ── Step 2: Company Form ── */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  Step 2 of 2
                </div>

                <h2 className="text-xl font-bold text-white mb-1">
                  Legal Identity
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  Details of your registered legal entity.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-white">
                      Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="CodeChain"
                      required
                      className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                    />
                  </div>

                  {/* Reg Number & VAT */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">
                        Registration Number
                      </label>
                      <input
                        type="text"
                        value={registrationNumber}
                        onChange={(e) => setRegistrationNumber(e.target.value)}
                        placeholder="KVK 12345678"
                        className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                      />
                      <p className="text-xs text-slate-500 mt-1.5">
                        Chamber of Commerce / company registration number
                      </p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-white">
                        VAT Number
                      </label>
                      <input
                        type="text"
                        value={vatNumber}
                        onChange={(e) => setVatNumber(e.target.value)}
                        placeholder="NL123456789B01"
                        className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm"
                      />
                    </div>
                  </div>

                  {/* Country */}
                  <div className="space-y-2 pt-2">
                    <label className="text-sm font-semibold text-white">
                      Country
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      className="w-full h-11 px-4 rounded-xl bg-slate-900/60 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all text-sm appearance-none cursor-pointer"
                    >
                      <option value="" className="bg-slate-900">Select your country...</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c} className="bg-slate-900">{c}</option>
                      ))}
                    </select>
                  </div>

                  {error && (
                    <p className="text-sm text-red-400 font-medium bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
                      {error}
                    </p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="h-12 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 h-12 rounded-2xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-60 disabled:cursor-not-allowed text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)]"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>Create Workspace <ArrowRight className="w-4 h-4" /></>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ── Step 3: Success ── */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", bounce: 0.6 }}
                  className="w-20 h-20 mx-auto rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </motion.div>
                <h2 className="text-2xl font-black text-white tracking-tighter mb-2">
                  Workspace Created!
                </h2>
                <p className="text-slate-400 text-sm">
                  Taking you to your dashboard...
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Subtle branding */}
        <div className="flex flex-col items-center gap-3 mt-6">
          <Logo className="w-6 h-6 opacity-40 hover:opacity-100 transition-opacity" showText textSize="text-sm opacity-50" />
          <p className="text-center text-[10px] text-slate-600 font-bold tracking-widest uppercase">
            Code. Claim. Capital.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
