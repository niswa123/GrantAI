"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  country: string;
  initials: string;
  color: string; // tailwind bg color class for the avatar
  logoUrl?: string;
  defaultHourlyRate?: number;
  taxCreditRate?: number;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  isLoading: boolean;
  setActiveWorkspace: (ws: Workspace) => void;
  addWorkspace: (ws: Omit<Workspace, "id">) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
}

import { useSession } from "next-auth/react";
import { getUserCompanies, createCompany, updateCompany } from "@/app/actions/companyActions";

const LS_ACTIVE_KEY = "grantai_active_workspace";

// ── Context ────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from DB on mount or auth change
  useEffect(() => {
    async function loadCompanies() {
      if (status === "loading") return;

      if (status === "authenticated") {
        setIsLoading(true);
        try {
          const dbCompanies = await getUserCompanies();
          if (dbCompanies.length > 0) {
            setWorkspaces(dbCompanies);

            // Restore last-used workspace from localStorage (UUID only)
            const savedActiveId = localStorage.getItem(LS_ACTIVE_KEY);
            const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            const isValidUuid = savedActiveId && UUID_REGEX.test(savedActiveId);
            const found = isValidUuid ? dbCompanies.find(c => c.id === savedActiveId) : null;

            if (found) {
              setActiveWorkspaceState(found);
            } else {
              // Clear any stale IDs and default to first real company
              localStorage.removeItem(LS_ACTIVE_KEY);
              setActiveWorkspaceState(dbCompanies[0]);
              localStorage.setItem(LS_ACTIVE_KEY, dbCompanies[0].id);
            }
          } else {
            // User has no companies yet — will be redirected to /onboarding by middleware
            setWorkspaces([]);
            setActiveWorkspaceState(null);
          }
        } catch (e) {
          console.error("[WorkspaceProvider] Failed to load companies from DB:", e);
          setWorkspaces([]);
          setActiveWorkspaceState(null);
        } finally {
          setIsLoading(false);
        }
      } else if (status === "unauthenticated") {
        // Not logged in — clear state
        setWorkspaces([]);
        setActiveWorkspaceState(null);
        setIsLoading(false);
      }
    }

    loadCompanies();
  }, [status]);

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws);
    localStorage.setItem(LS_ACTIVE_KEY, ws.id);
  }, []);

  const addWorkspace = useCallback(async (ws: Omit<Workspace, "id">) => {
    if (status !== "authenticated") return;
    const res = await createCompany(ws.name, ws.country, ws.logoUrl);
    if (res.success && res.company) {
      setWorkspaces((prev) => [...prev, res.company!]);
      setActiveWorkspace(res.company!);
    }
  }, [status, setActiveWorkspace]);

  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    if (status !== "authenticated") return;
    const res = await updateCompany(id, data.name || "", data.country || "", data.defaultHourlyRate, data.taxCreditRate, data.logoUrl);
    if (res.success && res.company) {
      setWorkspaces((prev) => prev.map(w => w.id === id ? res.company! : w));
      setActiveWorkspaceState((prev) => prev?.id === id ? res.company! : prev);
    }
  }, [status]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, isLoading, setActiveWorkspace, addWorkspace, updateWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside WorkspaceProvider");
  return ctx;
}
