"use client";

import React, { useState, useEffect, useCallback, useTransition, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, UserPlus, X, Check, Mail, Shield, ShieldCheck,
  Clock, CheckCircle2, MoreHorizontal, Trash2, ChevronDown, Loader2,
  Search, SlidersHorizontal
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import {
  getCompanyMembers, inviteMember, updateMemberRole, removeMember,
  type MemberRecord, type MemberRole,
} from "@/app/actions/memberActions";

// ── Config ────────────────────────────────────────────────────────────────

const ROLES: MemberRole[] = ["Admin", "Editor", "Viewer"];

const ROLE_CFG: Record<MemberRole, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Admin: { color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/30", icon: ShieldCheck },
  Editor: { color: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/30", icon: Shield },
  Viewer: { color: "text-slate-400", bg: "bg-slate-700/40", border: "border-slate-600/30", icon: Shield },
};

const STATUS_CFG: Record<"Active" | "Pending", { color: string; bg: string; border: string; icon: React.ElementType }> = {
  Active: { color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/30", icon: CheckCircle2 },
  Pending: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/30", icon: Clock },
};

// ── Sub-components ────────────────────────────────────────────────────────

function RoleDropdown({
  role,
  onChange,
  disabled = false,
}: {
  role: MemberRole;
  onChange: (r: MemberRole) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const cfg = ROLE_CFG[role];
  const Icon = cfg.icon;

  const handleOpen = () => {
    if (disabled) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX,
        width: rect.width,
      });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative inline-block">
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={disabled}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${cfg.bg} ${cfg.border} ${cfg.color} ${
          disabled ? "opacity-60 cursor-not-allowed" : "hover:brightness-110 active:scale-95 cursor-pointer"
        } transition-all`}
      >
        <Icon className="w-3 h-3" />
        {role}
        {!disabled && <ChevronDown className="w-3 h-3 opacity-60" />}
      </button>
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.95 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                minWidth: Math.max(pos.width, 130),
              }}
              className="bg-slate-900 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {ROLES.map((r) => {
                const c = ROLE_CFG[r];
                const I = c.icon;
                return (
                  <button
                    key={r}
                    onClick={() => {
                      onChange(r);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-white/5 transition-colors text-left ${
                      r === role ? c.color : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <I className="w-3.5 h-3.5" />
                    {r}
                    {r === role && <Check className="w-3 h-3 ml-auto" />}
                  </button>
                );
              })}
            </motion.div>
          </div>,
          document.body
        )}
    </div>
  );
}

function MemberActionMenu({
  onRemove,
  disabled = false,
}: {
  onRemove: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  const handleOpen = () => {
    if (disabled) return;
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + window.scrollY + 6,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
    setOpen((v) => !v);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={btnRef}
        onClick={handleOpen}
        disabled={disabled}
        className={`p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all ${
          disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer active:scale-95"
        }`}
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[9999]" onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: pos.top,
                right: pos.right,
              }}
              className="min-w-[150px] bg-slate-900 border border-white/10 rounded-xl shadow-[0_12px_40px_rgba(0,0,0,0.5)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  onRemove();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove Member
              </button>
            </motion.div>
          </div>,
          document.body
        )}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm"
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
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${role === r ? `${cfg.bg} ${cfg.border} ${cfg.color}` : "border-white/8 text-slate-500 hover:text-white hover:bg-white/5"
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

function ConfirmDeleteModal({
  member,
  onClose,
  onConfirm,
}: {
  member: MemberRecord;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async () => {
    setLoading(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-955/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 text-rose-400 mb-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">Remove Team Member</h2>
            <p className="text-xs text-slate-400">This action cannot be undone.</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-5 leading-relaxed">
          Are you sure you want to remove <span className="text-white font-semibold">{member.name || member.email}</span> from this workspace? They will immediately lose access to all projects, documents, and reports.
        </p>

        {error && (
          <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2 mb-4">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-white font-bold text-sm transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-sm transition-all disabled:opacity-40 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Yes, Remove Member
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

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState<string>("All");

  // Delete Modal State
  const [deletingMember, setDeletingMember] = useState<MemberRecord | null>(null);

  const load = useCallback(async () => {
    if (!activeWorkspace?.id) return;
    setLoading(true);
    try {
      const data = await getCompanyMembers(activeWorkspace.id);
      setMembers(data);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  }, [activeWorkspace?.id]);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (email: string, role: MemberRole) => {
    if (!activeWorkspace?.id) return;
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

  const handleRemoveConfirm = async () => {
    if (!deletingMember) return;
    const memberId = deletingMember.id;
    setMembers((m) => m.filter((mem) => mem.id !== memberId));
    await removeMember(memberId);
  };

  const filteredMembers = members.filter((member) => {
    const nameMatch = (member.name || "").toLowerCase().includes(search.toLowerCase());
    const emailMatch = (member.email || "").toLowerCase().includes(search.toLowerCase());
    const roleMatch = filterRole === "All" || member.role === filterRole;
    return (nameMatch || emailMatch) && roleMatch;
  });

  return (
    <>
      <AnimatePresence>
        {inviteOpen && <InviteModal onClose={() => setInviteOpen(false)} onInvite={handleInvite} />}
        {deletingMember && (
          <ConfirmDeleteModal
            member={deletingMember}
            onClose={() => setDeletingMember(null)}
            onConfirm={handleRemoveConfirm}
          />
        )}
      </AnimatePresence>

      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between mb-6 sm:mb-8 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Team Members</h1>
              <p className="text-xs sm:text-sm text-slate-400">
                {loading ? "Loading…" : `${members.length} member${members.length !== 1 ? "s" : ""} · ${members.filter((m) => m.status === "Active").length} active`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setInviteOpen(true)}
            id="invite-member-button"
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] touch-manipulation flex-shrink-0 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden xs:inline">Invite Member</span>
            <span className="xs:hidden">Invite</span>
          </button>
        </motion.div>

        {/* Search & Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search members by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/60 border border-white/8 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative min-w-[150px]">
            <SlidersHorizontal className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-slate-900/60 border border-white/8 text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 appearance-none cursor-pointer font-semibold transition-all"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admins</option>
              <option value="Editor">Editors</option>
              <option value="Viewer">Viewers</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          </div>
        </motion.div>

        {/* Table Container */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
          className="rounded-2xl border border-white/8 bg-slate-900/20 backdrop-blur-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/8 bg-slate-900/60">
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Member</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Role</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                    <th className="px-5 py-3.5 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                    <th className="px-5 py-3.5 w-12" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  <AnimatePresence mode="popLayout">
                    {filteredMembers.map((member) => {
                      const sc = STATUS_CFG[member.status];
                      const StatusIcon = sc.icon;
                      const isNew = justInvited === member.id;
                      return (
                        <motion.tr
                          key={member.id}
                          layout
                          initial={isNew ? { opacity: 0, backgroundColor: "rgba(6,182,212,0.08)" } : { opacity: 0.4 }}
                          animate={{ opacity: 1, backgroundColor: "rgba(0,0,0,0)" }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.25 }}
                          className="hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500/60 to-violet-500/60 flex items-center justify-center font-bold text-xs text-white flex-shrink-0 shadow-inner">
                                {(member.name || member.email)[0].toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-white">{member.name || "Pending User"}</div>
                                <div className="text-xs text-slate-500 sm:hidden mt-0.5">{member.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-400 hidden sm:table-cell font-medium">{member.email}</td>
                          <td className="px-5 py-4 text-center">
                            <RoleDropdown role={member.role} onChange={(r) => handleRoleChange(member.id, r)} />
                          </td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${sc.bg} ${sc.border} ${sc.color}`}>
                              <StatusIcon className="w-3 h-3" />
                              {member.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-xs text-slate-500 hidden lg:table-cell font-medium">
                            {new Date(member.joinedAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex justify-end">
                              <MemberActionMenu
                                onRemove={() => setDeletingMember(member)}
                              />
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredMembers.length === 0 && (
            <div className="flex flex-col items-center py-20 text-slate-500">
              <Users className="w-12 h-12 mb-3 opacity-20 text-slate-400 animate-pulse" />
              <p className="font-semibold text-white text-sm">No members found</p>
              <p className="text-xs mt-1 text-slate-400">
                {search || filterRole !== "All" ? "Try clearing your filters or search query" : "Invite your first colleague to get started."}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
