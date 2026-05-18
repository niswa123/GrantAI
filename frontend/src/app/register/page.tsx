"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ArrowRight, Lock, Mail, Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/app/actions/authActions";
import { Logo } from "@/components/ui/logo";
import { Turnstile } from "@/components/turnstile";

// ── Icons ─────────────────────────────────────────────────────────────────

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

// ── Main Page ─────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch {
      setError("An unexpected error occurred with Google Sign-Up.");
      setGoogleLoading(false);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      setGithubLoading(true);
      await signIn("github", { callbackUrl: "/onboarding" });
    } catch {
      setError("An unexpected error occurred with GitHub Sign-Up.");
      setGithubLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Client-side password match check
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      return;
    }
    setPasswordMismatch(false);

    // Captcha check (only if NEXT_PUBLIC_TURNSTILE_SITE_KEY is configured)
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (siteKey && !captchaToken) {
      setError("Please complete the CAPTCHA before submitting.");
      return;
    }
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    if (captchaToken) {
      formData.set('cf-turnstile-response', captchaToken);
    }
    
    try {
      // 1. Create the user
      const result = await registerUser(formData);
      
      if (result.error) {
        setError(result.error);
        setLoading(false);
        return;
      }

      // 2. Log them in using CredentialsProvider
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;

      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError(res.error);
        setLoading(false);
      } else {
        // Send user to verify their email before onboarding
        router.push("/check-email");
      }
    } catch {
      setError("Registration failed. Please try again.");
      setLoading(false);
    }
  };

  if (!mounted) return null;

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
            Create an account
          </h1>
          <p className="text-slate-400 text-sm">
            Start automating your R&D tax credits today.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-5 sm:p-6 shadow-[0_0_80px_-20px_rgba(6,182,212,0.15)] relative"
        >
          {/* OAuth Buttons */}
          <div className="flex flex-col gap-2.5 mb-5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading || githubLoading || loading}
              className="w-full h-10 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {googleLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <GoogleIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />}
              <span className="text-sm">Sign up with Google</span>
            </button>

            <button
              type="button"
              onClick={handleGitHubSignIn}
              disabled={googleLoading || githubLoading || loading}
              className="w-full h-10 rounded-xl bg-slate-950/50 hover:bg-slate-800 border border-white/5 hover:border-white/10 text-white font-medium flex items-center justify-center gap-3 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {githubLoading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <GitHubIcon className="w-4 h-4 text-slate-300 group-hover:scale-110 group-hover:text-white transition-all" />}
              <span className="text-sm">Sign up with GitHub</span>
            </button>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/5" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-slate-900/40 px-3 text-slate-500 font-bold tracking-widest backdrop-blur-xl">Or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5 group">
              <label htmlFor="email" className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="w-full h-10 bg-slate-950/50 border border-white/5 rounded-xl pl-10 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:shadow-[0_0_0_2px_rgba(6,182,212,0.1)] transition-all text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5 group">
              <label htmlFor="password" className="text-xs font-bold text-slate-400 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordMismatch(false); }}
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
              <label htmlFor="confirmPassword" className={`text-xs font-bold uppercase tracking-wider transition-colors group-focus-within:text-cyan-400 ${passwordMismatch ? 'text-rose-400' : 'text-slate-400'}`}>
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors group-focus-within:text-cyan-400 ${passwordMismatch ? 'text-rose-400' : 'text-slate-500'}`} />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordMismatch(false); }}
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
              <AnimatePresence>
                {passwordMismatch && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-xs text-rose-400 font-medium pt-1"
                  >
                    Passwords do not match
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Captcha — only renders when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set */}
            {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
              <div className="flex flex-col items-center gap-2">
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  onError={() => { setCaptchaToken(null); }}
                  className="rounded-xl overflow-hidden"
                />
                {!captchaToken && (
                  <p className="text-xs text-slate-500 text-center">
                    Complete the verification above to continue
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || googleLoading || githubLoading || (!!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken)}
              className="w-full h-10 mt-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none group"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span className="text-sm tracking-wide">
                    {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && !captchaToken
                      ? "Verify captcha first"
                      : "Create Account"}
                  </span>
                  {(!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || captchaToken) && (
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  )}
                </>
              )}
            </button>

            
            <p className="text-[10px] text-slate-500 text-center font-medium pt-2">
              By registering, you agree to our Terms of Service and Privacy Policy.
            </p>
          </form>
        </motion.div>

        {/* Footer */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-5 text-sm text-slate-500 font-medium"
        >
          Already have an account?{" "}
          <Link href="/login" className="text-white hover:text-cyan-400 transition-colors">
            Sign in instead
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
