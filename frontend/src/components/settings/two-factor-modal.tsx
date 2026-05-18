"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShieldCheck, Loader2, Copy, CheckCircle2, AlertCircle } from "lucide-react";

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function TwoFactorModal({ isOpen, onClose, onSuccess }: TwoFactorModalProps) {
  const [step, setStep] = useState<"loading" | "setup" | "success" | "error">("loading");
  const [qrCode, setQrCode] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep("loading");
      setCode("");
      setErrorMsg("");
      fetch("/api/auth/2fa/generate", { method: "POST" })
        .then((res) => res.json())
        .then((data) => {
          if (data.qrCode && data.secret) {
            setQrCode(data.qrCode);
            setSecret(data.secret);
            setStep("setup");
          } else {
            setErrorMsg(data.error || "Failed to generate 2FA secret");
            setStep("error");
          }
        })
        .catch(() => {
          setErrorMsg("Network error occurred.");
          setStep("error");
        });
    }
  }, [isOpen]);

  const handleCopy = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter a 6-digit code.");
      return;
    }

    setVerifying(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStep("success");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        setErrorMsg(data.error || "Invalid code. Please try again.");
      }
    } catch {
      setErrorMsg("Network error occurred.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-white/5 bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <h2 className="text-base font-bold text-white">Enable 2FA</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 sm:p-6">
              {step === "loading" && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
                  <p className="text-sm text-slate-400">Generating secure keys...</p>
                </div>
              )}

              {step === "error" && (
                <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-rose-500" />
                  </div>
                  <p className="text-sm text-rose-400 max-w-[250px]">{errorMsg}</p>
                  <button onClick={onClose} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium rounded-xl transition-colors">
                    Close
                  </button>
                </div>
              )}

              {step === "setup" && (
                <form onSubmit={handleVerify} className="space-y-6">
                  <div>
                    <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                      1. Scan this QR code with your authenticator app (like Google Authenticator or Authy).
                    </p>
                    <div className="flex justify-center bg-white p-4 rounded-xl mx-auto w-fit">
                      {qrCode ? (
                        <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                      ) : (
                        <div className="w-40 h-40 bg-slate-200 animate-pulse rounded-lg" />
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 mb-2">Or enter this setup key manually:</p>
                    <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-950/50 border border-white/5">
                      <code className="text-xs text-cyan-400 font-mono tracking-wider flex-1 break-all">{secret}</code>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-slate-300 mb-2 leading-relaxed">
                      2. Enter the 6-digit code generated by your app to verify.
                    </p>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full h-12 text-center text-2xl tracking-[0.5em] font-mono bg-slate-950/50 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all"
                    />
                    {errorMsg && <p className="text-xs text-rose-400 mt-2 text-center">{errorMsg}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={code.length !== 6 || verifying}
                    className="w-full h-11 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify & Enable"}
                  </button>
                </form>
              )}

              {step === "success" && (
                <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}>
                      <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                    </motion.div>
                  </div>
                  <h3 className="text-white font-bold text-lg">2FA Enabled!</h3>
                  <p className="text-slate-400 text-sm">Your account is now secured.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
