"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, Loader2, CheckCircle2 } from "lucide-react";
import { resendVerificationEmail } from "@/app/actions/emailActions";

export function EmailVerificationBanner() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Only show on protected/app routes — never on landing, login, register
  const isAppRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/input') ||
    pathname.startsWith('/company') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/result');

  const isVerified = (session?.user as any)?.emailVerified;

  if (!session || !isAppRoute || isVerified || dismissed) return null;

  const handleResend = async () => {
    if (!session.user?.email) return;
    setSending(true);
    await resendVerificationEmail(session.user.email);
    setSending(false);
    setSent(true);
  };

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3 flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-sm text-amber-200/80 font-medium">
              Please verify your email address to unlock all features.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {sent ? (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Email sent!
              </span>
            ) : (
              <button
                onClick={handleResend}
                disabled={sending}
                className="text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors disabled:opacity-50 flex items-center gap-1"
              >
                {sending && <Loader2 className="w-3 h-3 animate-spin" />}
                Resend email
              </button>
            )}
            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-500 hover:text-white transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
