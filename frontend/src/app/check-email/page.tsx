"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { resendVerificationEmail } from "@/app/actions/emailActions";

export default function CheckEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // If not logged in, redirect to login
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // If already verified, redirect to onboarding
  useEffect(() => {
    if (session && (session.user as any)?.emailVerified) {
      router.push("/onboarding");
    }
  }, [session, router]);

  const handleResend = async () => {
    if (!session?.user?.email || sending) return;
    setSending(true);
    try {
      await resendVerificationEmail(session.user.email);
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch {
      // silently fail
    } finally {
      setSending(false);
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        <motion.div
          animate={{ x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"
        />
      </div>

      {/* Content */}
      <div className="w-full max-w-md px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-6">
            <Mail className="w-10 h-10 text-cyan-400" />
          </div>

          <h1 className="text-3xl font-black text-white tracking-tight mb-3">
            Check your email
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            We've sent a verification link to
          </p>
          <p className="text-white font-semibold text-sm mb-6">
            {session?.user?.email || "your email"}
          </p>

          <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-2xl p-6 mb-6">
            <div className="space-y-3 text-left text-sm text-slate-400">
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-0.5">1.</span>
                <span>Open your email inbox</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-0.5">2.</span>
                <span>Click the verification link in the email from GrantAI</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-cyan-400 font-bold mt-0.5">3.</span>
                <span>You'll be redirected back to continue setup</span>
              </div>
            </div>
          </div>

          {/* Resend button */}
          <button
            onClick={handleResend}
            disabled={sending || sent}
            className="w-full h-12 rounded-xl bg-slate-900/60 border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : sent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Email sent!</span>
              </>
            ) : (
              <>
                <Mail className="w-4 h-4" />
                Resend verification email
              </>
            )}
          </button>

          {/* Removed Skip for now button */}
        </motion.div>
      </div>
    </div>
  );
}
