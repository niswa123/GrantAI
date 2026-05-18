// ── Types ─────────────────────────────────────────────────────────────────

export type ClaimStatus = "Draft" | "Pending Review" | "Submitted" | "Approved";
export type SortCol = "date" | "totalCosts" | "estimatedRefund" | "confidenceScore";
export type SortDir = "asc" | "desc";
export type ViewMode = "cards" | "table";

export interface CalculationRecord {
  id: string;
  date: string;
  description: string;
  estimatedRefund: number;
  classification: string;
  confidenceScore: number;
  totalCosts: number;
  salaryCosts?: number;
  devCosts?: number;
  status?: ClaimStatus;
  workspaceId?: string;
}

// ── Status Config ─────────────────────────────────────────────────────────

export const STATUSES: ClaimStatus[] = ["Draft", "Pending Review", "Submitted", "Approved"];

export const STATUS_CFG = {
  Draft:            { color: "text-slate-400",   bg: "bg-slate-800",       border: "border-slate-700"      },
  "Pending Review": { color: "text-amber-400",   bg: "bg-amber-500/10",    border: "border-amber-500/30"   },
  Submitted:        { color: "text-blue-400",    bg: "bg-blue-500/10",     border: "border-blue-500/30"    },
  Approved:         { color: "text-emerald-400", bg: "bg-emerald-500/10",  border: "border-emerald-500/30" },
} as const;

// ── Pure Derivation Utilities ─────────────────────────────────────────────

export function getFY(dateStr: string): string {
  return `FY ${new Date(dateStr).getFullYear()}`;
}

export function getRoi(record: CalculationRecord): number {
  if (!record.totalCosts || record.totalCosts === 0) return 0;
  return Math.round(((record.estimatedRefund || 0) / record.totalCosts) * 1000) / 10;
}

export function getPayoutForecast(record: CalculationRecord): string {
  if (record.status === "Approved") return "Received ✓";
  const base = new Date(record.date);
  const months =
    record.status === "Submitted" ? 3 :
    record.status === "Pending Review" ? 6 : 9;
  base.setMonth(base.getMonth() + months);
  return `Q${Math.ceil((base.getMonth() + 1) / 3)} ${base.getFullYear()}`;
}

export function getUniqueFYs(records: CalculationRecord[]): string[] {
  const set = new Set(records.map((r) => getFY(r.date)));
  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

// ── CSV Export (client-side, no storage) ─────────────────────────────────

export function exportToCSV(records: CalculationRecord[]): void {
  const headers = [
    "ID", "Date", "Description", "Salary (€)", "Dev (€)",
    "Total Costs (€)", "Refund (€)", "ROI %",
    "Confidence %", "Classification", "Status", "Expected Payout",
  ];
  const rows = records.map((r) => [
    r.id,
    new Date(r.date).toLocaleDateString("en-EU"),
    `"${(r.description || "").replace(/"/g, '""').slice(0, 120)}"`,
    (r.salaryCosts || 0).toFixed(2),
    (r.devCosts || 0).toFixed(2),
    (r.totalCosts || 0).toFixed(2),
    (r.estimatedRefund || 0).toFixed(2),
    getRoi(r).toFixed(1),
    Math.round((r.confidenceScore || 0) * 100).toString(),
    r.classification || "",
    r.status || "Draft",
    getPayoutForecast(r),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `grantai-claims-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
