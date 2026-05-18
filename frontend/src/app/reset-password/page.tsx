"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { resetPassword } from "@/app/actions/authActions";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordMismatch = password !== "" && confirmPassword !== "" && password !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }
    if (passwordMismatch) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await resetPassword(token, password);
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-6">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/10 border border-rose-400/30 flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-rose-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-2">Invalid Link</h3>
        <p className="text-slate-400 text-sm mb-6">
          This password reset link is invalid or has expired.
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm transition-colors w-full"
        >
          Request new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: "spring", bounce: 0.6 }}
          className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
        >
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </motion.div>
        <h3 className="text-lg font-bold text-white mb-2">Password Reset!</h3>
        <p className="text-slate-400 text-sm mb-6">
          Your password has been successfully updated. You can now log in with your new password.
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-colors w-full shadow-[0_0_20px_rgba(6,182,212,0.3)]"
        >
          Go to Login
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5 group">
        <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
          New Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className="w-full h-10 bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-10 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)] transition-all text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5 group">
        <label htmlFor="confirmPassword" className={`text-xs font-bold uppercase tracking-wider transition-colors ${passwordMismatch ? 'text-rose-400' : 'text-slate-400 group-focus-within:text-cyan-400'}`}>
          Confirm New Password
        </label>
        <div className="relative">
          <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-cyan-400 ${passwordMismatch ? 'text-rose-400' : 'text-slate-500'}`} />
          <input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            required
            minLength={8}
            className={`w-full h-10 bg-slate-950/50 border rounded-xl pl-10 pr-10 text-white placeholder:text-slate-600 focus:outline-none transition-all text-sm ${
              passwordMismatch
                ? 'border-rose-500/60 focus:border-rose-500 focus:shadow-[0_0_0_2px_rgba(239,68,68,0.1)]'
                : 'border-white/5 focus:border-cyan-500/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)]'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {(error || passwordMismatch) && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2"
          >
            {error || "Passwords do not match."}
          </motion.p>
        )}
      </AnimatePresence>

      <button
        type="submit"
        disabled={loading || passwordMismatch || password.length < 8}
        className="w-full h-10 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group mt-2"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <span className="text-sm tracking-wide">Save New Password</span>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* ── Fluid AI Background ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        {/* Animated Orbs */}
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-cyan-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ x: ["10%", "-10%", "10%"], y: ["10%", "-10%", "10%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[10%] right-[20%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-violet-600/10 rounded-full blur-[120px]"
        />
      </div>

      {/* ── Content ── */}
      <div className="w-full max-w-md px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-5 flex flex-col items-center"
        >
          <Logo className="w-12 h-12 mb-6" showText={false} />
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">
            Set New Password
          </h1>
          <p className="text-slate-400 text-sm">
            Enter your new password below.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)] relative"
        >
          <Suspense fallback={
            <div className="py-12 flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          }>
            <ResetPasswordForm />
          </Suspense>
        </motion.div>
      </div>
    </div>
  );
}
