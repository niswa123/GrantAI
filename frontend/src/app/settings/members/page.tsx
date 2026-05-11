"use client";

import React, { useState, useEffect, useCallback, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, X, Check, Mail, Shield, ShieldCheck,
  Clock, CheckCircle2, MoreHorizontal, Trash2, ChevronDown, Loader2,
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import {
  getCompanyMembers, inviteMember, updateMemberRole, removeMember,
  type MemberRecord, type MemberRole,
} from "@/app/actions/memberActions";

// ── Config ────────────────────────────────────────────────────────────────

const ROLES: MemberRole[] = ["Admin", "Editor", "Viewer"];

const ROLE_CFG: Record<MemberRole, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Admin:  { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: ShieldCheck },
  Editor: { color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/30",   icon: Shield },
  Viewer: { color: "text-slate-400",  bg: "bg-slate-700/40",  border: "border-slate-600/30",  icon: Shield },
};

const STATUS_CFG: Record<"Active" | "Pending", { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Active:  { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  Pending: { color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/30",   icon: Clock },
};

// ── Sub-components ────────────────────────────────────────────────────────

function RoleDropdown({ role, onChange }: { role: MemberRole; onChange: (r: MemberRole) => void }) {
  const [open, setOpen] = useState(false);
  const cfg = ROLE_CFG[role];
  const Icon = cfg.icon;
  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.color} hover:opacity-80 transition-opacity`}
      >
        <Icon className="w-3 h-3" />
        {role}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full mt-1.5 left-0 z-40 min-w-[130px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onMouseLeave={() => setOpen(false)}
          >
            {ROLES.map((r) => {
              const c = ROLE_CFG[r]; const I = c.icon;
              return (
                <button key={r} onClick={() => { onChange(r); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-white/5 transition-colors text-left ${r === role ? c.color : "text-slate-400"}`}>
                  <I className="w-3.5 h-3.5" />{r}{r === role && <Check className="w-3 h-3 ml-auto" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MemberActionMenu({ onRemove }: { onRemove: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 z-40 min-w-[140px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
            onMouseLeave={() => setOpen(false)}
          >
            <button onClick={() => { onRemove(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left">
              <Trash2 className="w-3.5 h-3.5" /> Remove Member
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function InviteModal({ onClose, onInvite }: {
  onClose: () => void;
  onInvite: (email: string, role: MemberRole) => Promise<void>;
}) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<MemberRole>("Editor");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleInvite = async () => {
    if (!valid) return;
    setLoading(true);
    setError("");
    try {
      await onInvite(email, role);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to send invitation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-black text-white">Invite Team Member</h2>
            <p className="text-xs text-slate-400 mt-0.5">They will be added to your workspace.</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                autoFocus type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                placeholder="colleague@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => {
                const cfg = ROLE_CFG[r]; const Icon = cfg.icon;
                return (
                  <button key={r} type="button" onClick={() => setRole(r)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                      role === r ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-white/8 text-slate-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon className="w-4 h-4" />{r}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-800/50 rounded-xl p-3 border border-white/5">
            <strong className="text-slate-300">Admin</strong>: Full access · <strong className="text-slate-300">Editor</strong>: Can create &amp; edit · <strong className="text-slate-300">Viewer</strong>: Read-only
          </div>

          {error && (
            <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
          )}

          <button
            onClick={handleInvite}
            disabled={!valid || loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.2)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            {loading ? "Inviting…" : "Send Invitation"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

export default function MembersPage() {
  const { activeWorkspace } = useWorkspace();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [justInvited, setJustInvited] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanyMembers(activeWorkspace.id);
      setMembers(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [activeWorkspace.id]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (email: string, role: MemberRole) => {
    const result = await inviteMember(activeWorkspace.id, email, role);
    if ("error" in result) throw new Error(result.error);
    if (result.member) {
      setMembers((m) => [...m, result.member!]);
      setJustInvited(result.member.id);
      setTimeout(() => setJustInvited(null), 3000);
    }
  };

  const handleRoleChange = (memberId: string, role: MemberRole) => {
    setMembers((m) => m.map((mem) => (mem.id === memberId ? { ...mem, role } : mem)));
    startTransition(async () => {
      await updateMemberRole(memberId, role);
    });
  };

  const handleRemove = (memberId: string) => {
    setMembers((m) => m.filter((mem) => mem.id !== memberId));
    startTransition(async () => {
      await removeMember(memberId);
    });
  };

  return (
    <>
      <AnimatePresence>
        {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={handleInvite} />}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Team Members</h1>
              <p className="text-sm text-slate-400">
                {loading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} · ${members.filter((m) => m.status === "Active").length} active`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            id="invite-member-button"
            className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
          >
            <UserPlus className="w-4 h-4" /> Invite Member
          </button>
        </motion.div>

        {/* Table */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/8 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/8 bg-slate-900/60">
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Role</th>
                  <th className="text-center px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="px-5 py-3.5" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {members.map((member) => {
                    const sc = STATUS_CFG[member.status];
                    const StatusIcon = sc.icon;
                    const isNew = justInvited === member.id;
                    return (
                      <motion.tr
                        key={member.id}
                        initial={isNew ? { opacity: 0, backgroundColor: "rgba(6,182,212,0.08)" } : { opacity: 1 }}
                        animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.35 }}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/60 to-violet-500/60 flex items-center justify-center font-bold text-xs text-white flex-shrink-0">
                              {(member.name || member.email)[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-white">{member.name}</div>
                              <div className="text-xs text-slate-500 sm:hidden">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-sm text-slate-400 hidden sm:table-cell">{member.email}</td>
                        <td className="px-5 py-3.5 text-center">
                          <RoleDropdown role={member.role} onChange={(r) => handleRoleChange(member.id, r)} />
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.border} ${sc.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {member.status}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-500 hidden lg:table-cell">
                          {new Date(member.joinedAt).toLocaleDateString("en-EU", { day: "numeric", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex justify-end">
                            <MemberActionMenu onRemove={() => handleRemove(member.id)} />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}

          {!loading && members.length === 0 && (
            <div className="flex flex-col items-center py-16 text-slate-500">
              <Users className="w-10 h-10 mb-3 opacity-30" />
              <p className="font-medium">No team members yet</p>
              <p className="text-sm mt-0.5">Invite your first colleague to get started.</p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
