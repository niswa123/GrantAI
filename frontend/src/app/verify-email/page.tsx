"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { verifyEmail } from "@/app/actions/emailActions";
import { Logo } from "@/components/ui/logo";

// Premium Brand Loader matching the project brand book
function PremiumBrandLoader({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes subtle-glow {
          0%, 100% { opacity: 0.4; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.7; transform: scale(1.08) translate(-50%, -50%); }
        }
        @keyframes shimmer-line {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}} />

      {/* Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Ambient glows */}
      <div 
        className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
        style={{ 
          transformOrigin: "0 0",
          animation: "subtle-glow 6s infinite ease-in-out" 
        }}
      />
      <div className="absolute bottom-[10%] right-[10%] w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-8 max-w-md px-6 text-center">
        {/* Pulsating logo structure */}
        <div className="relative w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-cyan-500/5 border border-cyan-500/20" />
          <div className="absolute inset-[-12px] rounded-full border border-cyan-500/10 animate-ping [animation-duration:2.5s]" />
          <div className="absolute inset-[-6px] rounded-full border border-cyan-500/5 animate-pulse" />
          <Logo className="w-14 h-14" />
        </div>

        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl font-extrabold text-white tracking-tight">{label}</h2>
          
          {/* Brand loading bar */}
          <div className="h-[2px] w-36 bg-slate-800/80 rounded-full overflow-hidden relative mt-1">
            <div 
              className="absolute top-0 bottom-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent" 
              style={{
                animation: "shimmer-line 1.5s infinite ease-in-out"
              }}
            />
          </div>
          
          <p className="text-[10px] text-slate-500 font-black tracking-[0.25em] uppercase mt-4">
            Code. Claim. Capital.
          </p>
        </div>
      </div>
    </div>
  );
}

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update } = useSession();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "waiting" | "error">("loading");
  const [message, setMessage] = useState("");

  // Step 1: verify the token once
  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    verifyEmail(token).then(async (result) => {
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        // Move to "waiting" state — show success/loading UI while session refreshes
        setStatus("waiting");
        // Trigger NextAuth to re-fetch token from DB
        await update();
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Step 2: watch session — redirect only when emailVerified is confirmed
  useEffect(() => {
    if (status !== "waiting") return;
    if ((session?.user as any)?.emailVerified) {
      setStatus("success");
      setTimeout(() => {
        const dest = (session?.user as any)?.needsOnboarding ? "/onboarding" : "/dashboard";
        router.replace(dest);
      }, 1500);
    }
  }, [session, status, router]);

  // Step 3: fallback poll — if session update is slow, re-trigger every 1.2s
  useEffect(() => {
    if (status !== "waiting") return;
    const interval = setInterval(() => {
      update();
    }, 1200);
    return () => clearInterval(interval);
  }, [status, update]);

  return (
    <AnimatePresence mode="wait">
      {/* LOADING — verifying token */}
      {status === "loading" && (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PremiumBrandLoader label="Verifying your email..." />
        </motion.div>
      )}

      {/* WAITING — verified in DB, waiting for session update */}
      {status === "waiting" && (
        <motion.div
          key="waiting"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <PremiumBrandLoader label="Setting up your session..." />
        </motion.div>
      )}

      {/* SUCCESS — session confirmed, final redirect stage */}
      {status === "success" && (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden"
        >
          {/* Grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Glowing background */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center gap-6 max-w-md px-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-2"
            >
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-2xl font-black text-white tracking-tight">Email Verified!</h1>
              <p className="text-slate-400 text-sm">Redirecting to your dashboard...</p>
            </div>

            <div className="h-[2px] w-36 bg-slate-800/80 rounded-full overflow-hidden relative mt-2">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
              />
            </div>
            
            <p className="text-[10px] text-slate-500 font-black tracking-[0.25em] uppercase mt-4">
              Code. Claim. Capital.
            </p>
          </div>
        </motion.div>
      )}

      {/* ERROR */}
      {status === "error" && (
        <motion.div
          key="error"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="w-full max-w-sm px-6 relative z-10 text-center">
            <div className="bg-slate-900/40 backdrop-blur-2xl border border-rose-500/20 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(244,63,94,0.15)]">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2 tracking-tight">Verification failed</h1>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">{message}</p>
              <Link
                href="/login"
                className="w-full h-11 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)]"
              >
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<PremiumBrandLoader label="Verifying your email..." />}>
      <VerifyEmailContent />
    </Suspense>
  );
}
