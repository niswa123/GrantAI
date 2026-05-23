"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptInvite } from "@/app/actions/memberActions";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AcceptInviteButtonProps {
  token: string;
  userId: string;
}

export default function AcceptInviteButton({ token, userId }: AcceptInviteButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAccept = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await acceptInvite(token, userId);
      if (res.success && res.companyId) {
        router.push(`/dashboard?ws=${res.companyId}`);
        router.refresh();
      } else {
        setError(res.error || "An unexpected error occurred.");
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect to the server.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs text-left"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">Error:</span>
              <p className="mt-0.5 text-rose-300">{error}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleAccept}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-70 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.35)] active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Accepting Invitation...
          </>
        ) : (
          <>
            <Check className="w-5 h-5" />
            Accept Invitation
          </>
        )}
      </button>
    </div>
  );
}
