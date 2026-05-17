"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, MailCheck } from "lucide-react";
import { verifyEmail } from "@/app/actions/emailActions";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    verifyEmail(token).then((result) => {
      if (result.error) {
        setStatus("error");
        setMessage(result.error);
      } else {
        setStatus("success");
        setMessage("Your email has been verified! Redirecting to your dashboard...");
        setTimeout(() => router.push("/dashboard"), 2500);
      }
    });
  }, [token, router]);

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <motion.div
        animate={{ x: ["-10%", "10%", "-10%"], y: ["-10%", "10%", "-10%"] }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[10%] left-[20%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="w-full max-w-md px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)]"
        >
          {status === "loading" && (
            <>
              <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mx-auto mb-6">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Verifying your email...</h1>
              <p className="text-slate-400 text-sm">Please wait a moment.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Email confirmed!</h1>
              <p className="text-slate-400 text-sm">{message}</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>
              <h1 className="text-2xl font-black text-white mb-2">Verification failed</h1>
              <p className="text-slate-400 text-sm mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all text-sm"
              >
                Back to Login
              </Link>
            </>
          )}
        </motion.div>

        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-sm"
          >
            <MailCheck className="w-4 h-4" />
            <span>Checking your verification link</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
