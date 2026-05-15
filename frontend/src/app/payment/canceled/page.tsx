"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '@/components/main-layout';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCanceledPage() {
  const router = useRouter();

  return (
    <MainLayout>
      <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden pt-20 pb-20 px-4">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[800px] h-[80vw] max-h-[800px] bg-[radial-gradient(ellipse_at_center,rgba(244,63,94,0.1),transparent_70%)] pointer-events-none rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-lg bg-[#060913]/80 backdrop-blur-xl border border-rose-500/20 rounded-[32px] p-8 md:p-12 text-center shadow-[0_0_80px_rgba(244,63,94,0.05)]"
        >
          <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500/10 blur-[60px] rounded-full pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", bounce: 0.5 }}
            className="w-24 h-24 mx-auto rounded-full bg-rose-500/10 border border-rose-400/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(244,63,94,0.15)]"
          >
            <AlertCircle className="w-12 h-12 text-rose-400" />
          </motion.div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Checkout <span className="text-rose-400 drop-shadow-sm">Canceled.</span>
          </h1>
          
          <p className="text-slate-400 text-lg font-medium mb-10 leading-relaxed">
            Your payment was not completed. No charges were made to your account.
          </p>

          <button 
            onClick={() => router.push('/#pricing')}
            className="w-full relative group overflow-hidden rounded-full bg-white/5 border border-white/10 hover:border-white/20 text-white font-bold text-lg py-4 flex items-center justify-center gap-3 transition-all hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span>Return to Pricing</span>
          </button>
        </motion.div>
      </div>
    </MainLayout>
  );
}
