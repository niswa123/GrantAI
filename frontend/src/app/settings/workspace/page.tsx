"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, Save, CheckCircle2, AlertCircle, ChevronDown, Upload, 
  RefreshCcw, Calculator, Globe, ChevronRight, ShieldCheck 
} from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { 
  JURISDICTION_REGISTRY, 
  calculateTaxBenefit, 
  getJurisdictionByCountry 
} from "@/lib/rd-engine/tax-engine";

const COUNTRIES = JURISDICTION_REGISTRY.map(j => j.country);

interface WorkspaceData {
  legalName: string;
  registrationNumber: string;
  vatNumber: string;
  country: string;
  city: string;
  address: string;
  defaultHourlyRate: number;
  taxCreditRate: number;
  logoUrl: string;
  taxScheme: string;
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
    logoUrl: "",
    taxScheme: "AUTO",
  });
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [countryOpen, setCountryOpen] = useState(false);
  
  // Live calculator R&D Cost test input state
  const [calcCost, setCalcCost] = useState<number>(150000);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Sync with active workspace initially
  useEffect(() => {
    setData((d) => ({
      ...d,
      legalName: activeWorkspace?.name || "",
      country: activeWorkspace?.country || "Netherlands",
      defaultHourlyRate: activeWorkspace?.defaultHourlyRate ?? 50.0,
      taxCreditRate: activeWorkspace?.taxCreditRate ?? 0.14,
      logoUrl: activeWorkspace?.logoUrl || "",
      taxScheme: activeWorkspace?.taxScheme || "AUTO",
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
  }, [activeWorkspace?.id, activeWorkspace?.name, activeWorkspace?.country, activeWorkspace?.defaultHourlyRate, activeWorkspace?.taxCreditRate, activeWorkspace?.logoUrl, activeWorkspace?.taxScheme]);

  const update = <K extends keyof WorkspaceData>(field: K) => (value: WorkspaceData[K]) => {
    setData((d) => {
      const next = { ...d, [field]: value };
      
      // If country is updated, set default taxScheme to AUTO
      if (field === "country") {
        next.taxScheme = "AUTO";
        const jur = getJurisdictionByCountry(value as string);
        if (jur) {
          next.taxCreditRate = jur.schemes[0] ? jur.schemes[0].ratePct / 100 : 0.14;
        }
      }
      return next;
    });
    setDirty(true);
    setSaved(false);
  };

  const generateNewAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setData(d => ({ ...d, logoUrl: `https://api.dicebear.com/9.x/shapes/svg?seed=${randomSeed}&backgroundColor=06b6d4` }));
    setDirty(true);
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
      setData(d => ({ ...d, logoUrl: result }));
      setDirty(true);
      setSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace?.id) return;
    setSaving(true);
    
    // Update local storage for extra fields
    localStorage.setItem(`${STORAGE_KEY}_${activeWorkspace.id}`, JSON.stringify(data));
    
    // Update global state and DB for the fields the provider cares about
    await updateWorkspace(activeWorkspace.id, {
      name: data.legalName,
      country: data.country,
      defaultHourlyRate: data.defaultHourlyRate,
      taxCreditRate: data.taxCreditRate,
      logoUrl: data.logoUrl,
      taxScheme: data.taxScheme,
    });
    
    setSaving(false);
    setSaved(true);
    setDirty(false);
    setTimeout(() => setSaved(false), 3000);
  };

  // Find active jurisdiction and scheme details
  const activeJur = getJurisdictionByCountry(data.country) || JURISDICTION_REGISTRY.find(j => j.code === "MANUAL")!;
  const activeSchemes = activeJur.schemes;
  const currentSchemeCode = data.taxScheme === "AUTO" ? activeSchemes[0]?.code || "MANUAL" : data.taxScheme;
  const activeScheme = activeSchemes.find(s => s.code === currentSchemeCode) || activeSchemes[0];

  // Dynamic Live Calculator Calculation
  const estimatedBenefit = calculateTaxBenefit({
    jurisdictionCode: activeJur.code,
    scheme: currentSchemeCode,
    rdCostEur: calcCost,
    isStartup: false,
    isProfitable: true,
    taxCreditRateFallback: data.taxCreditRate,
  });

  const benefitPercentage = calcCost > 0 ? (estimatedBenefit / calcCost) * 100 : 0;

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
        <p className="text-xs sm:text-sm text-slate-400 ml-11 sm:ml-12">Manage your legal entity information and R&amp;D tax configuration.</p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        onSubmit={handleSave}
        className="space-y-8"
      >
        {/* Workspace Profile */}
        <Section title="Workspace Profile" description="Your workspace's visual identity.">
          <div className="flex items-center gap-4 mb-2">
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.08)] flex items-center justify-center text-xl font-bold text-slate-400">
                {data.logoUrl ? (
                  <img src={data.logoUrl} alt="Workspace Logo" className="w-full h-full object-cover" />
                ) : (
                  data.legalName.charAt(0).toUpperCase() || "?"
                )}
              </div>
              <div className="absolute inset-0 rounded-2xl bg-slate-950/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                <label title="Upload logo" className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 cursor-pointer transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} />
                </label>
                <button type="button" onClick={generateNewAvatar} title="Generate random logo" className="p-1.5 bg-slate-900 border border-white/10 rounded-lg text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">
                  <RefreshCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div>
              <div className="text-base font-bold text-white">{data.legalName || "Your Workspace"}</div>
              <div className="text-xs text-slate-600 mt-1">Hover avatar to change or generate</div>
            </div>
          </div>
        </Section>

        {/* Legal Identity */}
        <Section title="Legal Identity" description="Details of your registered legal entity.">
          <FormField id="legalName" label="Legal Entity Name" value={data.legalName}
            onChange={update("legalName")} placeholder="Acme Technologies B.V." />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField id="regNumber" label="Registration Number" value={data.registrationNumber}
              onChange={update("registrationNumber")} placeholder="KVK 12345678"
              hint="Chamber of Commerce or business registration code" />
            <FormField id="vatNumber" label="VAT Number" value={data.vatNumber}
              onChange={update("vatNumber")} placeholder="NL123456789B01" />
          </div>

          {/* Country dropdown */}
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Country / Jurisdiction</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setCountryOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-white/8 text-white text-sm focus:outline-none focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/15 transition-all hover:border-white/15"
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{activeJur.flag}</span>
                  <span>{data.country}</span>
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${countryOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {countryOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute top-full mt-1.5 left-0 right-0 z-30 bg-slate-900 border border-white/10 rounded-xl shadow-2xl max-h-56 overflow-y-auto"
                  >
                    {JURISDICTION_REGISTRY.map((j) => (
                      <button
                        key={j.code}
                        type="button"
                        onClick={() => { update("country")(j.country); setCountryOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-white/5 flex items-center gap-2.5 ${j.country === data.country ? "text-cyan-400 font-semibold" : "text-slate-300"}`}
                      >
                        <span className="text-lg">{j.flag}</span>
                        <span>{j.country}</span>
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

        {/* R&D Jurisdiction & Tax Scheme Selector */}
        <Section title="R&D Tax Calculator & Scheme" description="Configure active tax credits and qualified deductions.">
          <div className="p-5 rounded-2xl bg-slate-950/40 border border-white/5 space-y-5">
            {/* Active Jurisdiction Info */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-white/8 flex items-center justify-center text-2xl flex-shrink-0">
                {activeJur.flag}
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">{activeJur.country} Jurisdiction</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Tax schemes and calculations are automatically loaded according to standard national regulations.
                </p>
              </div>
            </div>

            {/* Scheme selector (if more than 1 scheme) */}
            {activeSchemes.length > 1 && (
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-400">Available Tax Schemes</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => update("taxScheme")("AUTO")}
                    className={`px-4 py-3 rounded-xl border text-left transition-all ${data.taxScheme === "AUTO" ? "bg-cyan-500/10 border-cyan-500/50 text-white font-semibold" : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10"}`}
                  >
                    <div className="text-xs font-bold text-cyan-400 mb-0.5">AUTO</div>
                    <div className="text-xs truncate">{activeSchemes[0]?.name} (Default)</div>
                  </button>
                  {activeSchemes.map((scheme) => (
                    <button
                      key={scheme.code}
                      type="button"
                      onClick={() => update("taxScheme")(scheme.code)}
                      className={`px-4 py-3 rounded-xl border text-left transition-all ${data.taxScheme === scheme.code ? "bg-cyan-500/10 border-cyan-500/50 text-white font-semibold" : "bg-slate-900/50 border-white/5 text-slate-400 hover:border-white/10"}`}
                    >
                      <div className="text-xs font-bold text-cyan-400 mb-0.5">{scheme.code}</div>
                      <div className="text-xs truncate">{scheme.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Scheme Details */}
            {activeScheme && (
              <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">{activeScheme.name}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{activeScheme.description}</p>
                <div className="text-[11px] font-semibold text-cyan-400/80">
                  Formula: {activeScheme.formulaDescription}
                </div>
              </div>
            )}

            {/* Live Interactive R&D Benefit Calculator */}
            <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950 to-slate-900 border border-cyan-500/15 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Tax Benefit Estimator</span>
                </div>
                <span className="text-[10px] text-cyan-500 bg-cyan-500/10 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Instant Preview</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-slate-400 font-semibold">Qualifying R&D Expenses</label>
                  <span className="text-xs text-slate-200 font-bold">€{calcCost.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="10000"
                  max="1000000"
                  step="5000"
                  value={calcCost}
                  onChange={(e) => setCalcCost(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Estimated Benefit</div>
                  <div className="text-lg font-black text-cyan-400">
                    €{estimatedBenefit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="text-right space-y-0.5">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Effective Benefit %</div>
                  <div className="text-sm font-bold text-slate-300">
                    {benefitPercentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced rates collapsible */}
          <div className="border border-white/5 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-900/40 hover:bg-slate-900/60 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Advanced Financial Rates</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showAdvanced ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {showAdvanced && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-5 bg-slate-950/20 border-t border-white/5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      id="defaultHourlyRate"
                      label="Default Hourly Rate (€)"
                      type="number"
                      value={data.defaultHourlyRate.toString()}
                      onChange={(v) => update("defaultHourlyRate")(parseFloat(v) || 0)}
                      placeholder="50"
                      hint="Default fallback rate per engineering hour"
                    />
                    <FormField
                      id="taxCreditRate"
                      label="Manual Tax Credit Rate"
                      type="number"
                      value={data.taxCreditRate.toString()}
                      onChange={(v) => update("taxCreditRate")(parseFloat(v) || 0)}
                      placeholder="0.14"
                      hint="Fallback multiplier (used in manual mode)"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
