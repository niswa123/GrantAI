'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Zap, Check, ExternalLink, Loader2, X, Bitcoin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getUserSubscription } from '@/app/actions/billingActions';
import { useWorkspace } from '@/providers/workspace-provider';

interface BillingClientProps {
  subscription?: {
    tier: string;
    status: string;
    periodEnd: Date | null;
    hasLavaSubscription: boolean;
  };
}

const plansConfig = [
  {
    id: 'FREE',
    name: 'Free',
    price: '$0',
    period: '/month',
    features: ['3 R&D calculations/month', 'CSV export', '1 workspace member', 'Basic AI analysis'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    price: '$29',
    period: '/month',
    features: ['Unlimited calculations', 'PDF export', 'Up to 10 members', 'Advanced AI + WBSO deep analysis', 'Priority support'],
    highlight: true,
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise',
    price: '$99',
    period: '/claim',
    features: ['Unlimited everything', 'SSO / SAML', 'Dedicated account manager', 'Custom tax rules', 'SLA guarantee'],
  },
];

function BillingSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      {/* Header Skeleton */}
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-slate-800/80 animate-pulse border border-white/5" />
            <div className="h-7 w-48 bg-slate-800/80 animate-pulse rounded-lg" />
          </div>
          <div className="h-4 w-64 bg-slate-900/80 animate-pulse rounded-lg ml-11 sm:ml-12" />
        </div>
      </div>

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`relative rounded-xl sm:rounded-2xl border border-white/5 bg-slate-900/20 p-4 sm:p-6 flex flex-col space-y-5 min-h-[350px] ${
              i === 2 ? 'border-cyan-500/20 bg-cyan-500/5 shadow-[0_0_20px_rgba(6,182,212,0.05)]' : ''
            }`}
          >
            <div className="space-y-3 animate-pulse">
              <div className="h-4 w-1/3 bg-slate-800/80 rounded-md" />
              <div className="h-8 w-1/2 bg-slate-800/80 rounded-md" />
            </div>

            <div className="space-y-3 flex-1 animate-pulse">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 rounded-full bg-slate-800/80 flex-shrink-0" />
                  <div className="h-3 bg-slate-800/80 rounded-md flex-1" />
                </div>
              ))}
            </div>

            <div className="h-10 bg-slate-800/80 rounded-xl w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BillingClient({ subscription: initialSubscription }: BillingClientProps) {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [subscription, setSubscription] = useState<any>(initialSubscription || null);
  const [loading, setLoading] = useState(!initialSubscription);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('PRO');

  useEffect(() => {
    if (!initialSubscription) {
      const loadSubscription = async () => {
        try {
          const fetched = await getUserSubscription(activeWorkspace?.id);
          setSubscription(fetched);
        } catch (err) {
          console.error('Failed to load subscription:', err);
        } finally {
          setLoading(false);
        }
      };
      loadSubscription();
    }
  }, [initialSubscription, activeWorkspace?.id]);

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    setIsPaymentModalOpen(true);
  };

  const handleCheckout = async (provider: 'lava' | 'nowpayments') => {
    setLoadingCheckout(provider);
    try {
      const endpoint = provider === 'lava' ? '/api/lava/checkout' : '/api/nowpayments/invoice';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
      
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      alert(error?.message || 'Failed to start checkout. Please try again.');
      setLoadingCheckout(null);
    }
  };

  const handleCryptoRenew = async () => {
    setLoadingPortal(true);
    try {
      const res = await fetch('/api/nowpayments/invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: subscription.tier }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create invoice');
      }
    } catch (error) {
      console.error('Crypto renew error:', error);
      alert('Failed to create crypto invoice. Please try again.');
      setLoadingPortal(false);
    }
  };

  if (loading || !subscription) {
    return <BillingSkeleton />;
  }

  const planOrder = ['FREE', 'PRO', 'ENTERPRISE', 'UNLIMITED'];
  const currentTierIndex = planOrder.indexOf(subscription.tier) >= 0 ? planOrder.indexOf(subscription.tier) : 0;

  const daysRemaining = subscription.periodEnd
    ? Math.max(0, Math.ceil((new Date(subscription.periodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-cyan-400" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Billing & Subscription</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 ml-11 sm:ml-12">
            Current Plan: <span className="text-white font-bold">{subscription.tier}</span>
            {subscription.status !== 'NONE' && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {subscription.status}
              </span>
            )}
          </p>
        </div>

        {subscription.tier !== 'FREE' && subscription.tier !== 'UNLIMITED' && (
          <div className="sm:ml-auto">
            {subscription.hasLavaSubscription ? (
              <div className="flex flex-col items-end gap-2 text-right">
                <span className="text-xs text-slate-400">
                  Subscription managed via <span className="text-cyan-400 font-bold">Lava.top</span>
                </span>
                {daysRemaining !== null && (
                  <span className="text-xs text-slate-500">
                    Next renewal: <span className="text-slate-400 font-medium">{new Date(subscription.periodEnd!).toLocaleDateString()}</span>
                  </span>
                )}
              </div>
            ) : daysRemaining !== null ? (
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs text-slate-400">
                  Time remaining: <span className="text-cyan-400 font-bold">{daysRemaining} days</span>
                </span>
                <button
                  onClick={handleCryptoRenew}
                  disabled={loadingPortal}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-sm font-medium text-cyan-400 rounded-lg border border-cyan-500/30 transition-colors disabled:opacity-50"
                >
                  {loadingPortal ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                  Renew with Crypto
                </button>
              </div>
            ) : null}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        {plansConfig.map((plan, i) => {
          const isCurrent = subscription.tier === plan.id;
          const planIndex = planOrder.indexOf(plan.id);
          const isDowngrade = planIndex < currentTierIndex;
          
          let ctaText = 'Upgrade';
          let ctaDisabled = false;
          
          if (isCurrent) {
            ctaText = 'Current Plan';
            ctaDisabled = true;
          } else if (isDowngrade) {
            ctaText = 'Included';
            ctaDisabled = true;
          }

          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
              className={`relative rounded-xl sm:rounded-2xl border p-4 sm:p-6 flex flex-col ${
                plan.highlight
                  ? "border-cyan-500/30 bg-gradient-to-b from-cyan-500/8 to-slate-900/60 shadow-[0_0_30px_rgba(6,182,212,0.1)]"
                  : "border-white/8 bg-slate-900/40"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 bg-cyan-500 rounded-full text-xs font-bold text-slate-950">
                  <Zap className="w-3 h-3" /> Most Popular
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 left-4 flex items-center gap-1.5 px-3 py-1 bg-slate-700 border border-white/10 rounded-full text-xs font-bold text-slate-300">
                  Current
                </div>
              )}

              <div className="mb-3 sm:mb-4">
                <h3 className="text-sm sm:text-base font-black text-white">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-white">{plan.price}</span>
                  {plan.period && <span className="text-xs sm:text-sm text-slate-400">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-2 sm:space-y-2.5 flex-1 mb-4 sm:mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanSelect(plan.id)}
                disabled={ctaDisabled || loadingCheckout !== null}
                className={`w-full py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all flex justify-center items-center gap-2 ${
                  plan.highlight
                    ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                    : ctaDisabled
                    ? "bg-slate-800 text-slate-500 cursor-default border border-white/5"
                    : "bg-slate-800 hover:bg-slate-700 text-white border border-white/10 hover:border-white/20"
                }`}
              >
                {ctaText}
              </button>
            </motion.div>
          );
        })}
      </motion.div>

      {subscription.tier === 'FREE' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
          className="mt-6 sm:mt-8 p-4 sm:p-5 rounded-xl sm:rounded-2xl border border-white/8 bg-slate-900/40">
          <h3 className="text-xs sm:text-sm font-bold text-white mb-3 sm:mb-4">Current Usage — Free Plan</h3>
          <div className="space-y-3">
            {[
              { label: "Calculations", used: subscription.usage?.calculations ?? 0, max: 3 },
              { label: "Team Members", used: subscription.usage?.members ?? 0, max: 1 }
            ].map(({ label, used, max }) => (
              <div key={label}>
                <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                  <span>{label}</span>
                  <span className="font-mono">{used} / {max}</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.min(100, (used / max) * 100)}%` }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                    className={`h-full rounded-full ${used / max >= 1 ? "bg-rose-500" : "bg-cyan-500"}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Payment Method Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#060913] border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
              <button 
                onClick={() => setIsPaymentModalOpen(false)}
                className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="text-center mb-8 relative z-10">
                <h3 className="text-xl sm:text-2xl font-black text-white mb-2 pr-6 sm:pr-0">Select Payment Method</h3>
                <p className="text-slate-400 text-sm font-medium">Choose how you'd like to pay for the {selectedPlan === "PRO" ? "Pro" : "Enterprise"} plan.</p>
              </div>
              <div className="space-y-4 relative z-10">
                <button 
                  onClick={() => handleCheckout('lava')}
                  disabled={loadingCheckout !== null}
                  className="w-full relative group overflow-hidden rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/50 p-4 flex items-center justify-between transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 group-hover:border-cyan-500/40 transition-colors">
                      <CreditCard className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">Pay with Card / CIS / Crypto</div>
                      <div className="text-slate-400 text-xs font-medium">Powered by Lava.top</div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    {loadingCheckout === 'lava' ? <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /> : <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />}
                  </div>
                </button>
                <button 
                  onClick={() => handleCheckout('nowpayments')}
                  disabled={loadingCheckout !== null}
                  className="w-full relative group overflow-hidden rounded-2xl bg-slate-900 border border-white/10 hover:border-emerald-500/50 p-4 flex items-center justify-between transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 flex items-center justify-center border border-[#F7931A]/20 group-hover:border-[#F7931A]/40 transition-colors">
                      <Bitcoin className="w-6 h-6 text-[#F7931A]" />
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold text-lg">Pay with Crypto</div>
                      <div className="text-slate-400 text-xs font-medium">Powered by NOWPayments</div>
                    </div>
                  </div>
                  <div className="relative z-10">
                    {loadingCheckout === 'nowpayments' ? <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" /> : <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />}
                  </div>
                </button>
              </div>
              <div className="mt-6 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">Secure Encrypted Checkout</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

