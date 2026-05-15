"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, ExternalLink, Calendar, Zap, AlertCircle, Bitcoin } from "lucide-react";

export default function SettingsPage() {
  const [currency, setCurrency] = useState("EUR");
  const [rate, setRate] = useState("500");
  const [savedStatus, setSavedStatus] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  // Mock subscription data for demonstration (this would come from API)
  const mockSubscription = {
    tier: "ENTERPRISE",
    provider: "nowpayments", // 'stripe' or 'nowpayments'
    status: "ACTIVE",
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
  };

  const handlePortalRedirect = async () => {
    setIsLoadingPortal(true);
    try {
      // API call to get Stripe Customer Portal URL
      // const res = await fetch('/api/stripe/portal', { method: 'POST' });
      // const data = await res.json();
      // window.location.href = data.url;
      
      // Simulate API delay
      setTimeout(() => setIsLoadingPortal(false), 1500);
    } catch (error) {
      console.error(error);
      setIsLoadingPortal(false);
    }
  };

  const handleCryptoRenew = async () => {
    setIsLoadingPortal(true);
    try {
      // API call to create new NOWPayments invoice
      // const res = await fetch('/api/nowpayments/invoice', { method: 'POST', body: JSON.stringify({ plan: 'enterprise' }) });
      // const data = await res.json();
      // window.location.href = data.url;
      
      // Simulate API delay
      setTimeout(() => setIsLoadingPortal(false), 1500);
    } catch (error) {
      console.error(error);
      setIsLoadingPortal(false);
    }
  };

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

      <div className="pt-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Billing & Subscription</h2>
          <p className="text-slate-400 mb-6">Manage your plan, payment methods, and invoices.</p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/50 border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-lg ${
                mockSubscription.provider === 'stripe' 
                  ? 'bg-[#635BFF]/10 border-[#635BFF]/20 text-[#635BFF]' 
                  : 'bg-[#F7931A]/10 border-[#F7931A]/20 text-[#F7931A]'
              }`}>
                {mockSubscription.provider === 'stripe' ? (
                  <CreditCard className="w-7 h-7" />
                ) : (
                  <Bitcoin className="w-7 h-7" />
                )}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-white">
                    {mockSubscription.tier === 'ENTERPRISE' ? 'AI Enterprise' : 'SaaS Pro'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                    {mockSubscription.status}
                  </span>
                </div>
                <div className="text-sm text-slate-400 font-medium">
                  {mockSubscription.provider === 'stripe' ? 'Managed via Stripe' : 'Paid with Crypto (NOWPayments)'}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10 mb-8">
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
              <Calendar className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Current Period Ends</div>
                <div className="text-white font-medium">
                  {new Date(mockSubscription.currentPeriodEnd).toLocaleDateString(undefined, {
                    year: 'numeric', month: 'long', day: 'numeric'
                  })}
                </div>
                {mockSubscription.provider === 'nowpayments' && (
                  <div className="text-xs text-amber-400 font-medium mt-1">
                    ~ {Math.ceil((new Date(mockSubscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-slate-950/80 rounded-2xl p-5 border border-white/5 flex items-start gap-4">
              <Zap className="w-5 h-5 text-emerald-400 mt-0.5" />
              <div>
                <div className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Plan Features</div>
                <div className="text-white font-medium text-sm">
                  Unlimited users, automated claims, audit defense guarantee.
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/5 relative z-10">
            {mockSubscription.provider === 'stripe' ? (
              <button 
                onClick={handlePortalRedirect}
                disabled={isLoadingPortal}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
              >
                <span>Manage in Stripe Portal</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <button 
                  onClick={handleCryptoRenew}
                  disabled={isLoadingPortal}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#F7931A] hover:bg-[#F7931A]/90 text-slate-950 font-bold transition-all shadow-[0_0_20px_rgba(247,147,26,0.3)] hover:shadow-[0_0_30px_rgba(247,147,26,0.5)] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Bitcoin className="w-5 h-5" />
                  <span>Renew with Crypto</span>
                </button>
                <p className="text-xs text-slate-500">
                  Crypto subscriptions do not auto-renew.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
