"use client";

import React, { createContext, useContext, useState, useCallback, useRef } from "react";

interface SyncState {
  isSyncing: boolean;
  statusMessage: string;
  progress: number; // 0-100
  companyId: string | null;
}

interface SyncContextValue extends SyncState {
  startSync: (companyId: string, runFn: () => Promise<void>) => void;
  stopSync: () => void;
}

const SyncContext = createContext<SyncContextValue | null>(null);

const SYNC_MESSAGES = [
  "Scanning GitHub commits...",
  "Analyzing repository activity...",
  "Evaluating R&D eligibility...",
  "Analyzing Jira sprint tickets...",
  "Matching code changes to payroll data...",
  "Running AI classification pipeline...",
  "Identifying innovation patterns...",
  "Calculating tax credit estimates...",
  "Cross-referencing engineering logs...",
  "Finalizing R&D project list...",
];

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SyncState>({
    isSyncing: false,
    statusMessage: "",
    progress: 0,
    companyId: null,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const msgIndexRef = useRef(0);

  const startSync = useCallback((companyId: string, runFn: () => Promise<void>) => {
    msgIndexRef.current = 0;

    setState({
      isSyncing: true,
      statusMessage: SYNC_MESSAGES[0],
      progress: 5,
      companyId,
    });

    // Cycle through messages to create labour illusion
    intervalRef.current = setInterval(() => {
      msgIndexRef.current = (msgIndexRef.current + 1) % SYNC_MESSAGES.length;
      setState((prev) => ({
        ...prev,
        statusMessage: SYNC_MESSAGES[msgIndexRef.current],
        progress: Math.min(prev.progress + Math.random() * 8 + 4, 90),
      }));
    }, 1800);

    runFn()
      .then(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState((prev) => ({
          ...prev,
          statusMessage: "Sync complete!",
          progress: 100,
        }));
        setTimeout(() => {
          setState({ isSyncing: false, statusMessage: "", progress: 0, companyId: null });
        }, 3000);
      })
      .catch(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setState({ isSyncing: false, statusMessage: "", progress: 0, companyId: null });
      });
  }, []);

  const stopSync = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setState({ isSyncing: false, statusMessage: "", progress: 0, companyId: null });
  }, []);

  return (
    <SyncContext.Provider value={{ ...state, startSync, stopSync }}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSyncContext() {
  const ctx = useContext(SyncContext);
  if (!ctx) throw new Error("useSyncContext must be used within SyncProvider");
  return ctx;
}
