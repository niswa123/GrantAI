"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, ChevronDown, ChevronRight, FileEdit, Hourglass,
  Send, CheckCircle2, AlertTriangle, MoreHorizontal, ExternalLink,
  Copy, Trash2, Shield, Link2, X, Plus, ArrowUpDown,
} from "lucide-react";
import {
  type CalculationRecord, type ClaimStatus, type SortCol, type SortDir,
  STATUSES, STATUS_CFG,
  getRoi, getPayoutForecast,
} from "@/lib/dashboard-utils";

// ── Utility hook ──────────────────────────────────────────────────────────

function useClickOutside(ref: React.RefObject<HTMLElement | null>, cb: () => void) {
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cb();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, cb]);
}

// ── ConfidenceBadge ───────────────────────────────────────────────────────

export function ConfidenceBadge({ score }: { score: number }) {
  const pct = Math.round((score || 0) * 100);
  const cls =
    pct >= 80 ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
    pct >= 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    "text-rose-400 bg-rose-500/10 border-rose-500/30";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cls}`}>
      {pct}%
    </span>
  );
}

// ── StatusBadge ───────────────────────────────────────────────────────────

const STATUS_ICONS: Record<ClaimStatus, React.ElementType> = {
  Draft: FileEdit,
  "Pending Review": Hourglass,
  Submitted: Send,
  Approved: CheckCircle2,
};

export function StatusBadge({
  status = "Draft",
  onStatusChange,
}: {
  status?: ClaimStatus;
  onStatusChange: (s: ClaimStatus) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));
  const cfg = STATUS_CFG[status];
  const Icon = STATUS_ICONS[status];

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${cfg.bg} ${cfg.border} ${cfg.color} hover:opacity-80`}
      >
        <Icon className="w-3 h-3" />
        {status}
        <ChevronDown className="w-3 h-3 opacity-60" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute top-full mt-1.5 left-0 z-50 min-w-[170px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            {STATUSES.map((s) => {
              const c = STATUS_CFG[s];
              const I = STATUS_ICONS[s];
              return (
                <button
                  key={s}
                  onClick={() => { onStatusChange(s); setOpen(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors text-left ${s === status ? c.color : "text-slate-400"}`}
                >
                  <I className="w-3.5 h-3.5" />
                  {s}
                  {s === status && <span className="ml-auto opacity-50">✓</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── RiskFlag ──────────────────────────────────────────────────────────────

export function RiskFlag() {
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/25 px-1.5 py-0.5 rounded-full"
      title="AI confidence below 50% — consider improving the project description before submission"
    >
      <AlertTriangle className="w-2.5 h-2.5" />
      Low Confidence
    </span>
  );
}

// ── QuickActionsMenu ──────────────────────────────────────────────────────

export function QuickActionsMenu({
  record,
  onDelete,
}: {
  record: CalculationRecord;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  const copyDraft = async () => {
    // Draft text lives in the DB; link to the result page to view/copy it
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/result?id=${record.id}`);
    } catch { /* ignore */ }
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative" onClick={(e) => e.preventDefault()}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="absolute right-0 top-full mt-1 z-50 min-w-[165px] bg-slate-900 border border-white/10 rounded-xl shadow-2xl overflow-hidden"
          >
            <Link
              href={`/result?id=${record.id}`}
              className="flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors"
              onClick={() => setOpen(false)}
            >
              <ExternalLink className="w-3.5 h-3.5" /> View Full Result
            </Link>
            <button
              onClick={copyDraft}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-300 hover:bg-white/5 transition-colors text-left"
            >
              <Copy className="w-3.5 h-3.5" /> Copy Draft Claim
            </button>
            <div className="border-t border-white/5 my-1" />
            <button
              onClick={() => { onDelete(); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── AuditDrawer ───────────────────────────────────────────────────────────

import { getClaimLogs, addClaimLog } from "@/app/actions/logActions";

export function AuditDrawer({ recordId, open, onClose }: { recordId: string; open: boolean; onClose: () => void }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    const res = await getClaimLogs(recordId);
    if (res.success && res.logs) {
      setLogs(res.logs ?? []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (open) {
      fetchLogs();
    }
  }, [open, recordId]);

  const handleAddLink = async () => {
    if (!newUrl.trim()) return;
    const details = JSON.stringify({ url: newUrl.trim(), label: newLabel.trim() || newUrl.trim() });
    const res = await addClaimLog(recordId, "Link Added", details);
    if (res.success) {
      setNewUrl("");
      setNewLabel("");
      fetchLogs();
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    const res = await addClaimLog(recordId, "Note Added", newNote.trim());
    if (res.success) {
      setNewNote("");
      fetchLogs();
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-2 p-4 bg-slate-950/60 rounded-xl border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <Shield className="w-3.5 h-3.5 text-violet-400" /> Audit Trail
          </div>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Existing Logs List */}
        <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {isLoading ? (
            <div className="text-xs text-slate-500">Loading logs...</div>
          ) : logs.length === 0 ? (
            <div className="text-xs text-slate-500">No logs yet.</div>
          ) : (
            logs.map((log) => {
              const isLink = log.action === "Link Added";
              let linkData = null;
              if (isLink && log.details) {
                try { linkData = JSON.parse(log.details); } catch { /* ignore */ }
              }

              return (
                <div key={log.id} className="flex flex-col gap-1 px-3 py-2 bg-slate-900/60 rounded-lg border border-white/5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(log.created_at).toLocaleString("en-EU", { 
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" 
                      })}
                    </span>
                  </div>
                  
                  {isLink && linkData ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Link2 className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <a href={linkData.url} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:underline flex-1 truncate">
                        {linkData.label}
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{log.details}</p>
                  )}
                  {log.user?.display_name && (
                    <span className="text-[9px] text-slate-500 mt-1">
                      by {log.user.display_name}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-white/5 pt-3 space-y-3">
          {/* Add Link */}
          <div className="flex flex-col sm:flex-row gap-2">
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (Jira, GitHub…)" className="flex-1 min-w-0 px-2.5 py-2 text-xs bg-slate-900/80 border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 touch-manipulation" />
            <input value={newUrl} onChange={(e) => setNewUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddLink()} placeholder="https://…" className="flex-1 min-w-0 px-2.5 py-2 text-xs bg-slate-900/80 border border-white/8 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500/50 touch-manipulation" />
            <button onClick={handleAddLink} disabled={!newUrl.trim() || isLoading} className="px-3 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors disabled:opacity-40 touch-manipulation">
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Add Note */}
          <div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              rows={2}
              placeholder="Add reviewer notes, submission details…"
              className="w-full px-2.5 py-1.5 text-xs bg-slate-900/80 border border-white/8 rounded-lg text-white placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/50 mb-2"
            />
            <button 
              onClick={handleAddNote} 
              disabled={!newNote.trim() || isLoading} 
              className="w-full py-1.5 bg-violet-500/10 border border-violet-500/30 rounded-lg text-violet-400 text-xs font-bold hover:bg-violet-500/20 transition-colors disabled:opacity-40"
            >
              Add Note
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── ClaimCard ─────────────────────────────────────────────────────────────

export function ClaimCard({
  record,
  onStatusChange,
  onDelete,
}: {
  record: CalculationRecord;
  onStatusChange: (id: string, s: ClaimStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [auditOpen, setAuditOpen] = useState(false);
  const isRisky = (record.confidenceScore || 0) < 0.5;
  const roi = getRoi(record);

  return (
    <motion.div
      layout
      className={`rounded-2xl border transition-all duration-300 ${
        isRisky
          ? "border-rose-500/20 bg-rose-500/[0.025] hover:border-rose-500/35"
          : "border-white/8 bg-slate-900/40 hover:border-white/15 hover:bg-slate-900/60"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            record.classification === "R&D" ? "bg-violet-500/10 border border-violet-500/20" : "bg-slate-800 border border-white/5"
          }`}>
            <FileText className={`w-4 h-4 ${record.classification === "R&D" ? "text-violet-400" : "text-slate-500"}`} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              <p className="text-white font-semibold text-sm truncate max-w-[340px]">
                {(record.description || "No description").slice(0, 70)}{(record.description || "").length > 70 ? "…" : ""}
              </p>
              {isRisky && <RiskFlag />}
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-1.5">
              <span className="text-xs text-slate-500">{new Date(record.date).toLocaleDateString("en-EU", { day: "numeric", month: "short", year: "numeric" })}</span>
              {/* R&D Classification badge */}
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                record.classification === "R&D"
                  ? "text-violet-400 bg-violet-500/10 border-violet-500/30"
                  : "text-slate-500 bg-slate-800 border-slate-700"
              }`}>
                {record.classification === "R&D" ? "✦ R&D Project" : "Not R&D"}
              </span>
              <ConfidenceBadge score={record.confidenceScore} />
              <span className="text-xs text-slate-600">·</span>
              <span className="text-xs text-slate-500">Payout: <span className="text-slate-400 font-medium">{getPayoutForecast(record)}</span></span>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
            <div className="text-right hidden sm:block">
              <div className={`text-base font-black ${(record.estimatedRefund || 0) > 0 ? "text-cyan-400" : "text-slate-500"}`}>
                €{(record.estimatedRefund || 0).toLocaleString("en-EU", { maximumFractionDigits: 0 })}
              </div>
              <div className="text-[10px] text-slate-500 font-medium">{roi}% ROI</div>
            </div>
            <StatusBadge status={record.status || "Draft"} onStatusChange={(s) => onStatusChange(record.id, s)} />
            <button
              onClick={(e) => { e.preventDefault(); setAuditOpen((v) => !v); }}
              className={`p-1.5 rounded-lg transition-all text-xs hidden sm:block ${auditOpen ? "text-violet-400 bg-violet-500/10" : "text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"}`}
              title="Audit Trail"
            >
              <Shield className="w-4 h-4" />
            </button>
            <QuickActionsMenu record={record} onDelete={() => onDelete(record.id)} />
            <Link href={`/result?id=${record.id}`} className="text-slate-600 hover:text-slate-300 transition-colors p-1 touch-manipulation">
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Mobile: price row */}
        <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-white/5">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => { e.preventDefault(); setAuditOpen((v) => !v); }}
              className={`p-1.5 rounded-lg transition-all text-xs ${auditOpen ? "text-violet-400 bg-violet-500/10" : "text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"}`}
            >
              <Shield className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="text-right">
            <div className={`text-sm font-black ${(record.estimatedRefund || 0) > 0 ? "text-cyan-400" : "text-slate-500"}`}>
              €{(record.estimatedRefund || 0).toLocaleString("en-EU", { maximumFractionDigits: 0 })}
            </div>
            <div className="text-[10px] text-slate-500">{roi}% ROI</div>
          </div>
        </div>

        <AnimatePresence>
          {auditOpen && <AuditDrawer recordId={record.id} open={auditOpen} onClose={() => setAuditOpen(false)} />}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ── ClaimTable ────────────────────────────────────────────────────────────

function SortBtn({ col, current, dir, onSort }: { col: SortCol; current: SortCol; dir: SortDir; onSort: (c: SortCol) => void }) {
  const active = col === current;
  return (
    <button onClick={() => onSort(col)} className={`flex items-center gap-1 hover:text-white transition-colors ${active ? "text-cyan-400" : "text-slate-500"}`}>
      <ArrowUpDown className="w-3 h-3" />
      {active && <span className="text-[9px]">{dir === "asc" ? "↑" : "↓"}</span>}
    </button>
  );
}

export function ClaimTable({
  records,
  sortCol,
  sortDir,
  onSort,
  onStatusChange,
  onDelete,
}: {
  records: CalculationRecord[];
  sortCol: SortCol;
  sortDir: SortDir;
  onSort: (col: SortCol) => void;
  onStatusChange: (id: string, s: ClaimStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [openAuditId, setOpenAuditId] = useState<string | null>(null);

  const sorted = [...records].sort((a, b) => {
    const mul = sortDir === "asc" ? 1 : -1;
    if (sortCol === "date") return mul * (new Date(a.date).getTime() - new Date(b.date).getTime());
    if (sortCol === "totalCosts") return mul * ((a.totalCosts || 0) - (b.totalCosts || 0));
    if (sortCol === "estimatedRefund") return mul * ((a.estimatedRefund || 0) - (b.estimatedRefund || 0));
    if (sortCol === "confidenceScore") return mul * ((a.confidenceScore || 0) - (b.confidenceScore || 0));
    return 0;
  });

  return (
    <div className="rounded-2xl border border-white/8 overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/8 bg-slate-900/60">
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Project</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center gap-1">Date <SortBtn col="date" current={sortCol} dir={sortDir} onSort={onSort} /></div>
            </th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center justify-end gap-1">Cost <SortBtn col="totalCosts" current={sortCol} dir={sortDir} onSort={onSort} /></div>
            </th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <div className="flex items-center justify-end gap-1">Refund <SortBtn col="estimatedRefund" current={sortCol} dir={sortDir} onSort={onSort} /></div>
            </th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">ROI %</th>
            <th className="text-right px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden md:table-cell">
              <div className="flex items-center justify-end gap-1">AI <SortBtn col="confidenceScore" current={sortCol} dir={sortDir} onSort={onSort} /></div>
            </th>
            <th className="text-center px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
            <th className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider hidden lg:table-cell">Payout Est.</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => {
            const isRisky = (r.confidenceScore || 0) < 0.5;
            return (
              <React.Fragment key={r.id}>
                <tr
                  className={`border-b border-white/5 last:border-0 transition-colors ${
                  isRisky ? "bg-rose-500/[0.02] hover:bg-rose-500/[0.04]" : "hover:bg-white/[0.02]"
                }`}
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-xs max-w-[200px] truncate block">
                      {(r.description || "No description").slice(0, 50)}{(r.description || "").length > 50 ? "…" : ""}
                    </span>
                    {isRisky && <span title="AI confidence below 50%"><AlertTriangle className="w-3 h-3 text-rose-400 flex-shrink-0" /></span>}
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                  {new Date(r.date).toLocaleDateString("en-EU", { day: "numeric", month: "short", year: "2-digit" })}
                </td>
                <td className="px-4 py-3 text-xs text-slate-300 text-right font-mono">
                  €{(r.totalCosts || 0).toLocaleString("en-EU", { maximumFractionDigits: 0 })}
                </td>
                <td className={`px-4 py-3 text-xs font-black text-right font-mono ${(r.estimatedRefund || 0) > 0 ? "text-cyan-400" : "text-slate-500"}`}>
                  €{(r.estimatedRefund || 0).toLocaleString("en-EU", { maximumFractionDigits: 0 })}
                </td>
                <td className="px-4 py-3 text-xs text-slate-400 text-right hidden lg:table-cell font-mono">
                  {getRoi(r).toFixed(1)}%
                </td>
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <ConfidenceBadge score={r.confidenceScore} />
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={r.status || "Draft"} onStatusChange={(s) => onStatusChange(r.id, s)} />
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 hidden lg:table-cell">
                  {getPayoutForecast(r)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={(e) => { e.preventDefault(); setOpenAuditId(openAuditId === r.id ? null : r.id); }}
                      className={`p-1.5 rounded-lg transition-all text-xs ${openAuditId === r.id ? "text-violet-400 bg-violet-500/10" : "text-slate-500 hover:text-violet-400 hover:bg-violet-500/10"}`}
                      title="Audit Trail"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                    <QuickActionsMenu record={r} onDelete={() => onDelete(r.id)} />
                  </div>
                </td>
              </tr>
              <AnimatePresence>
                {openAuditId === r.id && (
                  <tr key={`${r.id}-audit`} className="bg-slate-900/60">
                    <td colSpan={9} className="p-0 border-b border-white/5">
                      <div className="px-4 pb-4">
                        <AuditDrawer recordId={r.id} open={true} onClose={() => setOpenAuditId(null)} />
                      </div>
                    </td>
                  </tr>
                )}
              </AnimatePresence>
            </React.Fragment>
          );
        })}
        </tbody>
      </table>
    </div>
  );
}

// ── EmptyState ────────────────────────────────────────────────────────────

export function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative rounded-2xl sm:rounded-3xl border border-dashed border-white/10 bg-slate-900/20 overflow-hidden py-12 sm:py-16 px-4 sm:px-6"
    >
      {/* Blurred demo rows behind */}
      <div className="absolute inset-0 flex flex-col gap-2 p-4 sm:p-6 pt-10 sm:pt-12 pointer-events-none select-none">
        {["Developed novel ML pipeline...", "Built real-time compiler optimizations...", "Designed adaptive routing algorithm..."].map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 blur-sm opacity-30">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex-shrink-0" />
            <div className="flex-1"><div className="h-2.5 bg-slate-600 rounded w-3/4 mb-1.5" /><div className="h-2 bg-slate-700 rounded w-1/2" /></div>
            <div className="h-4 w-16 bg-cyan-500/20 rounded-full" />
          </div>
        ))}
      </div>

      {/* Foreground guide */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          {[
            { step: "1", label: "Describe your R&D", color: "from-cyan-500 to-cyan-400" },
            { step: "2", label: "Enter costs", color: "from-violet-500 to-violet-400" },
            { step: "3", label: "Get your refund estimate", color: "from-emerald-500 to-emerald-400" },
          ].map(({ step, label, color }, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-slate-950 font-black text-base sm:text-lg shadow-lg`}>{step}</div>
              <span className="text-[10px] sm:text-xs text-slate-400 font-medium max-w-[70px] sm:max-w-[90px]">{label}</span>
            </div>
          ))}
        </div>
        <p className="text-slate-500 font-medium text-sm sm:text-base">No calculations yet</p>
        <p className="text-slate-600 text-xs sm:text-sm mt-1">Your first result will appear here.</p>
      </div>
    </motion.div>
  );
}
