"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plug, CheckCircle2, AlertCircle, Loader2, Trash2, ExternalLink } from "lucide-react";
import { useWorkspace } from "@/providers/workspace-provider";
import { useSearchParams } from "next/navigation";

interface Integration {
  id: string;
  provider: "github" | "jira" | "linear";
  status: string;
  created_at: string;
  updated_at: string;
}

const PROVIDERS = [
  {
    id: "github",
    name: "GitHub",
    description: "Connect repositories to automatically analyze PRs and commits.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
    ),
    color: "from-slate-700 to-slate-900",
  },
  {
    id: "jira",
    name: "Jira",
    description: "Sync Jira issues to identify R&D value in your sprint tasks.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#0052CC]">
        <path d="M11.53 2c0 2.4-1.97 4.35-4.4 4.35H2V2h9.53zm-4.7 6.08c2.4 0 4.35 1.97 4.35 4.4V22H1.64v-9.57h5.18zm9.53 4.7c-2.4 0-4.35-1.97-4.35-4.4V2h9.53v6.38h-5.18zm4.7 6.08c-2.4 0-4.35-1.97-4.35-4.4v-9.53H22V22h-6.38z" />
      </svg>
    ),
    color: "from-blue-900/40 to-[#0052CC]/10",
  },
  {
    id: "linear",
    name: "Linear",
    description: "Connect Linear to track engineering cycles and project completion.",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#5E6AD2]">
        <path d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12zm0-2.316c5.348 0 9.684-4.336 9.684-9.684S17.348 2.316 12 2.316 2.316 6.652 2.316 12 6.652 21.684 12 21.684zM11.368 5.684H12.63v12.632h-1.262V5.684z" />
      </svg>
    ),
    color: "from-indigo-900/40 to-[#5E6AD2]/10",
  },
];


function IntegrationsContent() {
  const { activeWorkspace, isLoading: workspaceLoading } = useWorkspace();
  const searchParams = useSearchParams();
  
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [initialLoad, setInitialLoad] = useState(true); // true only on first mount
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Ready only when we have a real workspace loaded from DB
  const workspaceReady = !workspaceLoading && !!activeWorkspace;

  useEffect(() => {
    // Show toast from OAuth redirects
    const error = searchParams?.get("error");
    const success = searchParams?.get("success");
    if (error) setMessage({ type: "error", text: `Integration failed: ${error.replace(/_/g, ' ')}` });
    if (success) setMessage({ type: "success", text: `${success.charAt(0).toUpperCase() + success.slice(1)} successfully connected!` });
  }, [searchParams]);

  useEffect(() => {
    if (workspaceLoading) {
      return;
    }

    if (!activeWorkspace) {
      setInitialLoad(false);
      return;
    }

    async function fetchIntegrations() {
      // Don't reset to loading skeleton if we already have data — prevents flicker
      try {
        const res = await fetch(`/api/integrations?companyId=${activeWorkspace!.id}`);
        if (res.ok) {
          const data = await res.json();
          setIntegrations(data.integrations || []);
        }
      } catch (err) {
        console.error("Failed to fetch integrations", err);
      } finally {
        setInitialLoad(false);
      }
    }

    fetchIntegrations();
  }, [activeWorkspace?.id, workspaceLoading]);

  const handleConnect = (providerId: string) => {
    if (!workspaceReady || !activeWorkspace) return;
    setActionLoading(providerId);
    window.location.href = `/api/integrations/${providerId}/connect?companyId=${activeWorkspace.id}`;
  };

  const handleDisconnect = async (providerId: string) => {
    if (!activeWorkspace?.id) return;
    if (!confirm(`Are you sure you want to disconnect ${providerId}?`)) return;
    
    setActionLoading(providerId);
    try {
      const res = await fetch(`/api/integrations/${providerId}/disconnect?companyId=${activeWorkspace.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIntegrations(prev => prev.filter(i => i.provider !== providerId));
        setMessage({ type: "success", text: `${providerId} disconnected` });
      } else {
        setMessage({ type: "error", text: "Failed to disconnect" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
            <Plug className="w-4 h-4 text-cyan-400" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Data Integrations</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 ml-11 sm:ml-12">
          Connect your engineering tools to automatically track and analyze R&amp;D activities.
        </p>
      </motion.div>

      {/* Messages */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`mb-6 p-4 rounded-xl border flex items-start gap-3 ${
              message.type === "error" 
                ? "bg-red-500/10 border-red-500/20 text-red-400" 
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            {message.type === "error" ? <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />}
            <div>
              <p className="font-semibold text-sm">{message.text}</p>
              {message.type === "error" && (
                <p className="text-xs mt-1 opacity-80">Make sure your OAuth app is correctly configured in your environment variables.</p>
              )}
            </div>
            <button onClick={() => setMessage(null)} className="ml-auto opacity-50 hover:opacity-100">×</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Integrations List */}
      <div className="space-y-4">
        {PROVIDERS.map((provider, i) => {
          const integration = integrations.find((inv) => inv.provider === provider.id);
          const isConnected = !initialLoad && !!integration;
          const isLoading = actionLoading === provider.id;

          return (
            <motion.div
              key={provider.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border transition-all duration-300 gap-4 ${
                isConnected 
                  ? "bg-slate-900/60 border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.05)]" 
                  : "bg-slate-900/40 border-white/5"
              }`}
            >
              <div className="flex gap-3 sm:gap-4 items-start sm:items-center w-full">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${provider.color} border border-white/10`}>
                  {provider.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                    <h3 className="text-sm sm:text-base font-bold text-white">{provider.name}</h3>
                    {isConnected && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wide animate-fade-in">
                        Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md">{provider.description}</p>
                  
                  {isConnected && integration.updated_at && (
                    <p className="text-xs text-slate-500 mt-1.5">
                      Last synced: {new Date(integration.updated_at).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              <div className="ml-13 sm:ml-4 shrink-0 self-start sm:self-auto">
                {initialLoad ? (
                  <div className="w-24 h-9 sm:w-28 rounded-xl bg-white/5 border border-white/10 animate-pulse flex items-center justify-center">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500 opacity-50" />
                  </div>
                ) : isConnected ? (
                  <button
                    onClick={() => handleDisconnect(provider.id)}
                    disabled={isLoading}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 bg-white/5 border border-white/10 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all disabled:opacity-50 touch-manipulation"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(provider.id)}
                    disabled={isLoading || !workspaceReady}
                    title={!workspaceReady ? "Loading workspace..." : undefined}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold text-slate-950 bg-white hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ExternalLink className="w-3.5 h-3.5" />}
                    {workspaceReady ? "Connect" : "Loading..."}
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        <p className="text-sm">Loading integrations...</p>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
