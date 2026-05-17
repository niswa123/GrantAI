"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, Save, CheckCircle2, AlertCircle, ChevronDown } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";

const COUNTRIES = [
  "Netherlands", "Germany", "France", "United Kingdom", "Belgium",
  "Sweden", "Denmark", "Finland", "Norway", "Spain", "Portugal",
  "Italy", "Austria", "Switzerland", "Poland", "Estonia", "Latvia",
  "Lithuania", "Czech Republic", "Slovakia", "Hungary", "Romania",
  "Ireland", "Luxembourg", "United States", "Canada", "Australia",
  "Other",
];

interface WorkspaceData {
  legalName: string;
  registrationNumber: string;
  vatNumber: string;
  country: string;
  city: string;
  address: string;
  defaultHourlyRate: number;
  taxCreditRate: number;
}

const STORAGE_KEY = "grantai_workspace";

function FormField({
  id, label, value, onChange, placeholder, hint, type = "text",
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; hint?: string; type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-semibold text-slate-300 mb-1.5">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/8 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all"
      />
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="pb-8 border-b border-white/5 last:border-0 last:pb-0">
      <div className="mb-5">
        <h2 className="text-base font-bold text-white">{title}</h2>
        {description && <p className="text-sm text-slate-400 mt-0.5">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, updateWorkspace } = useWorkspace();
  
  const [data, setData] = useState<WorkspaceData>({
    legalName: "", registrationNumber: "", vatNumber: "",
    country: "Netherlands", city: "", address: "",
    defaultHourlyRate: 50.0, taxCreditRate: 0.14,
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);

  // Sync with active workspace initially
  useEffect(() => {
    setData((d) => ({
      ...d,
      legalName: activeWorkspace?.name || "",
      country: activeWorkspace?.country || "Netherlands",
      defaultHourlyRate: activeWorkspace?.defaultHourlyRate ?? 50.0,
      taxCreditRate: activeWorkspace?.taxCreditRate ?? 0.14,
    }));
    
    // Merge any other local storage data we had for this workspace (optional)
    try {
      if (!activeWorkspace?.id) return;
      const raw = localStorage.getItem(`${STORAGE_KEY}_${activeWorkspace.id}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        setData(prev => ({ ...prev, ...parsed }));
      }
    } catch { /* ignore */ }
  }, [activeWorkspace?.id, activeWorkspace?.name, activeWorkspace?.country]);

  const update = <K extends keyof WorkspaceData>(field: K) => (value: WorkspaceData[K]) => {
    setData((d) => ({ ...d, [field]: value }));
    setDirty(true);
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Update local storage for extra fields
    localStorage.setItem(`${STORAGE_KEY}_${activeWorkspace.id}`, JSON.stringify(data));
    
    // Update global state and DB for the fields the provider cares about
    if (activeWorkspace?.id) {
      await updateWorkspace(activeWorkspace.id, {
        name: data.legalName,
        country: data.country,
        defaultHourlyRate: data.defaultHourlyRate,
        taxCreditRate: data.taxCreditRate,
      });
    }
    
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Building2 className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Workspace Settings</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 ml-11 sm:ml-12">Manage your legal entity information for R&amp;D claims.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSave}
        className="space-y-8"
      >
        {/* Legal Identity */}
        <Section title="Legal Identity" description="Details of your registered legal entity.">
          <FormField id="legalName" label="Legal Entity Name" value={data.legalName}
            onChange={update("legalName")} placeholder="Acme Technologies B.V." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="regNumber" label="Registration Number" value={data.registrationNumber}
              onChange={update("registrationNumber")} placeholder="KVK 12345678"
              hint="Chamber of Commerce / company registration number" />
            <FormField id="vatNumber" label="VAT Number" value={data.vatNumber}
              onChange={update("vatNumber")} placeholder="NL123456789B01" />
          </div>

          {/* Country dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Country</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/8 text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all hover:border-white/15"
              >
                {data.country || "Select country"}
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {countryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-52 overflow-y-auto"
                  >
                    {COUNTRIES.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => { update("country")(c); setCountryOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5 ${c === data.country ? "text-cyan-400 font-semibold" : "text-slate-300"}`}
                      >
                        {c}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </Section>

        {/* Address */}
        <Section title="Office Address" description="Used for correspondence and tax filings.">
          <FormField id="city" label="City" value={data.city} onChange={update("city")} placeholder="Amsterdam" />
          <div>
            <label htmlFor="address" className="block text-sm font-semibold text-slate-300 mb-1.5">Street Address</label>
            <textarea
              id="address"
              value={data.address}
              onChange={(e) => { update("address")(e.target.value); }}
              rows={2}
              placeholder="Herengracht 1, 1017 BN Amsterdam"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/8 text-white placeholder-slate-600 text-sm resize-none focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all"
            />
          </div>
        </Section>

        {/* Financial Settings */}
        <Section title="Financial Settings" description="Default rates used for calculating R&D claim value.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField 
              id="defaultHourlyRate" 
              label="Default Hourly Rate (€)" 
              type="number"
              value={data.defaultHourlyRate.toString()} 
              onChange={(v) => update("defaultHourlyRate")(parseFloat(v) || 0)} 
              placeholder="50" 
              hint="Average cost per engineering hour" 
            />
            <FormField 
              id="taxCreditRate" 
              label="Tax Credit Rate" 
              type="number"
              value={data.taxCreditRate.toString()} 
              onChange={(v) => update("taxCreditRate")(parseFloat(v) || 0)} 
              placeholder="0.14" 
              hint="E.g. 0.14 for WBSO (14%) or 0.32 for UK SME" 
            />
          </div>
        </Section>

        {/* Save bar */}
        <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3 pt-2">
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div key="saved" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" /> Saved successfully
              </motion.div>
            ) : dirty ? (
              <motion.div key="dirty" initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-xs sm:text-sm text-amber-400/80">
                <AlertCircle className="w-4 h-4" /> Unsaved changes
              </motion.div>
            ) : (
              <div key="clean" className="text-xs sm:text-sm text-slate-600">All changes saved</div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={!dirty || saving}
            className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] touch-manipulation"
          >
            {saving ? (
              <><div className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> Saving…</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
