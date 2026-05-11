"use client";

import React, { useState, useEffect } from "react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("EUR");
  const [rate, setRate] = useState("500");
  const [savedStatus, setSavedStatus] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("grantai_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currency) setCurrency(parsed.currency);
        if (parsed.rate) setRate(parsed.rate.toString());
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem("grantai_settings", JSON.stringify({
      currency,
      rate: Number(rate)
    }));
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Settings</h2>
        <p className="text-slate-400">Configure your team variables to accurately calculate R&D value.</p>
      </div>

      <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="relative z-10">
          <label className="block text-sm font-medium text-slate-300 mb-2">Currency</label>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none"
          >
            <option value="EUR">€ Euro (EUR)</option>
            <option value="USD">$ US Dollar (USD)</option>
            <option value="GBP">£ British Pound (GBP)</option>
          </select>
        </div>

        <div className="relative z-10">
          <label className="block text-sm font-medium text-slate-300 mb-2">Average Engineering Daily Rate</label>
          <div className="relative">
            <span className="absolute left-4 top-3 text-slate-500 font-medium">
              {currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£'}
            </span>
            <input 
              type="number" 
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              className="w-full bg-slate-950/80 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>
          <p className="text-xs text-slate-500 mt-2">This is used as the base to calculate the daily R&D value from logs.</p>
        </div>
        
        <div className="pt-6 border-t border-white/5 relative z-10 flex items-center gap-4">
          <button 
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-95"
          >
            Save Configuration
          </button>
          {savedStatus && (
            <span className="text-emerald-400 font-medium animate-pulse">
              Saved successfully!
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
