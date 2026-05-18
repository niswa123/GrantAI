"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Fire confetti on load
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults, particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden pt-20 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[80vw] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", bounce: 0.5 }}
          className="relative w-full max-w-lg bg-[#060913]/80 backdrop-blur-xl border border-emerald-500/20 rounded-[32px] p-8 md:p-12 text-center shadow-[0_0_80px_rgba(16,185,129,0.1)]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[60px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", bounce: 0.6 }}
            className="w-24 h-24 mx-auto rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
          >
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Payment <span className="text-emerald-400 drop-shadow-sm">Successful.</span>
          </h1>
          
          <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
            Your account has been upgraded successfully. You now have full access to premium R&D tracking and automated claims.
          </p>

          <button 
            onClick={() => router.push('/dashboard')}
            className="w-full relative group overflow-hidden rounded-full bg-emerald-500 text-slate-950 font-black text-lg py-4 flex items-center justify-center gap-3 transition-transform active:scale-95 hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
          >
            <span className="relative z-10">Go to Dashboard</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
