"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserCircle, Save, CheckCircle2, AlertCircle, Eye, EyeOff,
  KeyRound, User, Shield, Loader2, RefreshCcw, Upload,
} from "lucide-react";
import { getUserProfile, updateUserProfile, changePassword } from "@/app/actions/userActions";
import { TwoFactorModal } from "@/components/settings/two-factor-modal";

// ── Shared UI components ──────────────────────────────────────────────────

function Section({ title, description, icon: Icon, children }: {
  title: string; description?: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-slate-900/40 border border-white/8 rounded-xl sm:rounded-2xl p-4 sm:p-6"
    >
      <div className="flex items-center gap-3 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-white/5">
        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-800 border border-white/8 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
        </div>
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-white">{title}</h2>
          {description && <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="space-y-3 sm:space-y-4">{children}</div>
    </motion.div>
  );
}

function TextField({ id, label, value, onChange, type = "text", placeholder, autoComplete, disabled }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; autoComplete?: string; disabled?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <input
        id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} autoComplete={autoComplete} disabled={disabled}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all disabled:opacity-50"
      />
    </div>
  );
}

function PasswordField({ id, label, value, onChange, placeholder, autoComplete }: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
      <div className="relative">
        <input
          id={id} type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder} autoComplete={autoComplete}
          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all"
        />
        <button type="button" onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function SaveRow({ dirty, saving, saved, error, label = "Save" }: {
  dirty: boolean; saving: boolean; saved: boolean; error?: string; label?: string;
}) {
  return (
    <div className="space-y-2">
      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-300 text-xs">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex items-center justify-end gap-4 pt-2">
        <AnimatePresence mode="wait">
          {saved && !error && (
            <motion.span key="ok" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved
            </motion.span>
          )}
          {dirty && !saved && !error && (
            <motion.span key="dirty" initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-1.5 text-xs text-amber-400/80">
              <AlertCircle className="w-3.5 h-3.5" /> Unsaved changes
            </motion.span>
          )}
        </AnimatePresence>
        <button type="submit" disabled={!dirty || saving}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          {saving
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</>
            : <><Save className="w-3.5 h-3.5" />{label}</>}
        </button>
      </div>
    </div>
  );
}

// ── Profile section ───────────────────────────────────────────────────────

function ProfileSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [initialName, setInitialName] = useState("");
  const [initialEmail, setInitialEmail] = useState("");
  const [initialAvatar, setInitialAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile) {
        setName(profile.displayName);
        setEmail(profile.email);
        const fetchedAvatar = profile.avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${profile.email}&backgroundColor=06b6d4`;
        setAvatarUrl(fetchedAvatar);
        setInitialName(profile.displayName);
        setInitialEmail(profile.email);
        setInitialAvatar(fetchedAvatar);
        // We trigger an event so other components (like SecuritySection) can read the 2FA status
        document.dispatchEvent(new CustomEvent('profileLoaded', { detail: profile }));
      }
      setLoading(false);
    });
  }, []);

  const generateNewAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/9.x/shapes/svg?seed=${randomSeed}&backgroundColor=06b6d4`);
    setSaved(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Image must be under 2 MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarUrl(result);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const dirty = name !== initialName || email !== initialEmail || avatarUrl !== initialAvatar;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dirty) return;
    setSaving(true);
    setError("");
    setSaved(false);
    const result = await updateUserProfile(name, email, avatarUrl);
    setSaving(false);
    if ("error" in result) {
      setError(result.error ?? "");
    } else {
      setInitialName(name);
      setInitialEmail(email);
      setInitialAvatar(avatarUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Section title="Profile Information" description="Your public display name, contact email, and avatar." icon={User}>
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar block */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.08)]">
              <img
                src={avatarUrl || `https://api.dicebear.com/9.x/shapes/svg?seed=${email}&backgroundColor=06b6d4`}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Overlay buttons */}
            <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
              {/* Upload own photo */}
              <label
                title="Upload photo"
                className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} disabled={loading} />
              </label>
              {/* Generate random */}
              <button
                type="button"
                onClick={generateNewAvatar}
                title="Generate random avatar"
                className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all"
              >
                <RefreshCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <div className="text-base font-bold text-white">{name || "Your Name"}</div>
            <div className="text-sm text-slate-400">{email || "your@email.com"}</div>
            <div className="text-xs text-slate-600 mt-1">Hover avatar to change or generate</div>
          </div>
        </div>
        <TextField id="display-name" label="Display Name" value={name} onChange={(v) => { setName(v); setSaved(false); }}
          placeholder="Jane Smith" autoComplete="name" disabled={loading} />
        <TextField id="email" label="Email Address" value={email} onChange={(v) => { setEmail(v); setSaved(false); }}
          type="email" placeholder="jane@company.com" autoComplete="email" disabled={loading} />
        <SaveRow dirty={dirty} saving={saving} saved={saved} error={error} label="Save Profile" />
      </Section>
    </form>
  );
}

// ── Password section ──────────────────────────────────────────────────────

function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const dirty = current.length > 0 || next.length > 0 || confirm.length > 0;
  const strength = next.length === 0 ? 0 : next.length < 8 ? 1 : next.length < 12 || !/[A-Z]/.test(next) || !/[0-9]/.test(next) ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-rose-500", "bg-amber-500", "bg-emerald-500"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!current) return setError("Please enter your current password.");
    if (next.length < 8) return setError("New password must be at least 8 characters.");
    if (next !== confirm) return setError("Passwords do not match.");
    setSaving(true);
    const result = await changePassword(current, next);
    setSaving(false);
    if ("error" in result) {
      setError(result.error ?? "");
    } else {
      setSaved(true);
      setCurrent(""); setNext(""); setConfirm("");
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Section title="Change Password" description="Use a strong password you don't use elsewhere." icon={KeyRound}>
        <PasswordField id="current-password" label="Current Password" value={current} onChange={setCurrent} placeholder="••••••••" autoComplete="current-password" />
        <PasswordField id="new-password" label="New Password" value={next} onChange={setNext} placeholder="••••••••" autoComplete="new-password" />

        {next.length > 0 && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((s) => (
                <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-300 ${strength >= s ? strengthColor[strength] : "bg-white/10"}`} />
              ))}
            </div>
            <span className={`text-xs font-semibold ${strength === 1 ? "text-rose-400" : strength === 2 ? "text-amber-400" : "text-emerald-400"}`}>
              {strengthLabel[strength]}
            </span>
          </div>
        )}

        <PasswordField id="confirm-password" label="Confirm New Password" value={confirm} onChange={setConfirm} placeholder="••••••••" autoComplete="new-password" />
        <SaveRow dirty={dirty} saving={saving} saved={saved} error={error} label="Change Password" />
      </Section>
    </form>
  );
}

// ── Security section ──────────────────────────────────────────────────────

function SecuritySection() {
  const [twofaEnabled, setTwofaEnabled] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [disabling, setDisabling] = useState(false);
  const [code, setCode] = useState("");
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const handleProfile = (e: any) => {
      setTwofaEnabled(e.detail.twoFactorEnabled);
    };
    document.addEventListener('profileLoaded', handleProfile);
    // Fetch directly if component mounts later
    getUserProfile().then((p) => {
      if (p) setTwofaEnabled(p.twoFactorEnabled);
    });
    return () => document.removeEventListener('profileLoaded', handleProfile);
  }, []);

  const handleToggleClick = () => {
    if (!twofaEnabled) {
      setShowModal(true);
    } else {
      setShowDisableForm(!showDisableForm);
    }
  };

  const handleDisableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) {
      setErrorMsg("Please enter a 6-digit code.");
      return;
    }
    setDisabling(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/auth/2fa/disable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTwofaEnabled(false);
        setShowDisableForm(false);
        setCode("");
      } else {
        setErrorMsg(data.error || "Invalid code.");
      }
    } catch {
      setErrorMsg("Network error.");
    } finally {
      setDisabling(false);
    }
  };

  return (
    <>
      <Section title="Security" description="Protect your account with additional verification." icon={Shield}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between py-1 gap-4">
          <div>
            <div className="text-sm font-semibold text-white flex items-center gap-2">
              Two-Factor Authentication
              {twofaEnabled && <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">Enabled</span>}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">Require a code from an authenticator app in addition to your password.</div>
          </div>
          <button
            type="button"
            onClick={handleToggleClick}
            className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${twofaEnabled ? "bg-cyan-500" : "bg-slate-700"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${twofaEnabled ? "translate-x-5" : "translate-x-0"}`} />
          </button>
        </div>

        <AnimatePresence>
          {showDisableForm && twofaEnabled && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <form onSubmit={handleDisableSubmit} className="mt-2 p-4 rounded-xl bg-rose-500/5 border border-rose-500/20">
                <p className="text-xs text-rose-300 mb-3">To disable 2FA, please enter the current 6-digit code from your authenticator app.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="000000"
                    className="flex-1 h-10 bg-slate-950/50 border border-white/10 rounded-lg px-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/50 transition-all font-mono tracking-widest"
                  />
                  <button type="submit" disabled={disabling || code.length !== 6} className="px-4 h-10 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center justify-center min-w-[100px] disabled:opacity-50">
                    {disabling ? <Loader2 className="w-4 h-4 animate-spin" /> : "Disable"}
                  </button>
                </div>
                {errorMsg && <p className="text-xs text-rose-400 mt-2">{errorMsg}</p>}
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between py-1 border-t border-white/5 pt-4 mt-2">
          <div>
            <div className="text-sm font-semibold text-white">Active Sessions</div>
            <div className="text-xs text-slate-400 mt-0.5">1 active session · Current device</div>
          </div>
          <button className="px-3 py-1.5 rounded-lg border border-rose-500/30 text-rose-400 text-xs font-semibold hover:bg-rose-500/10 transition-colors">
            Revoke All
          </button>
        </div>
      </Section>

      <TwoFactorModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => setTwofaEnabled(true)}
      />
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function AccountPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <UserCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Account Preferences</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 ml-11 sm:ml-12">Manage your personal profile and security settings.</p>
      </motion.div>

      <div className="space-y-4 sm:space-y-5">
        <ProfileSection />
        <PasswordSection />
        <SecuritySection />
      </div>
    </div>
  );
}
