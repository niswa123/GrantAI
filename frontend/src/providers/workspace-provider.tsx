"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Workspace {
  id: string;
  name: string;
  country: string;
  initials: string;
  color: string; // tailwind bg color class for the avatar
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (ws: Workspace) => void;
  addWorkspace: (ws: Omit<Workspace, "id">) => Promise<void>;
  updateWorkspace: (id: string, data: Partial<Workspace>) => Promise<void>;
}

import { useSession } from "next-auth/react";
import { getUserCompanies, createCompany, updateCompany } from "@/app/actions/companyActions";

// ── Default Mocked Data ────────────────────────────────────────────────────

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "ws_1",
    name: "My Workspace",
    country: "Netherlands",
    initials: "M",
    color: "bg-violet-500",
  },
];

const LS_KEY = "grantai_workspaces";
const LS_ACTIVE_KEY = "grantai_active_workspace";

// ── Context ────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(DEFAULT_WORKSPACES);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(DEFAULT_WORKSPACES[0]);

  // Hydrate from DB on mount or auth change
  useEffect(() => {
    async function loadCompanies() {
      if (status === "loading") return; // Wait for auth to resolve

      if (status === "authenticated") {
        try {
          const dbCompanies = await getUserCompanies();
          if (dbCompanies.length > 0) {
            setWorkspaces(dbCompanies);
            
            // Try to restore active from local storage — but ONLY if it's a real UUID
            const savedActiveId = localStorage.getItem(LS_ACTIVE_KEY);
            const isRealUuid = savedActiveId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(savedActiveId);
            const found = isRealUuid ? dbCompanies.find(c => c.id === savedActiveId) : null;
            
            if (found) {
              setActiveWorkspaceState(found);
            } else {
              // Clear any stale mock IDs (ws_1, etc.)
              localStorage.removeItem(LS_ACTIVE_KEY);
              localStorage.removeItem(LS_KEY);
              setActiveWorkspaceState(dbCompanies[0]);
              localStorage.setItem(LS_ACTIVE_KEY, dbCompanies[0].id);
            }
          }
        } catch (e) {
          console.error("Failed to load DB companies");
        }
      } else if (status === "unauthenticated") {
        try {
          const savedWs = localStorage.getItem(LS_KEY);
          const savedActiveId = localStorage.getItem(LS_ACTIVE_KEY);
          const list: Workspace[] = savedWs ? JSON.parse(savedWs) : DEFAULT_WORKSPACES;
          setWorkspaces(list);
          if (savedActiveId) {
            const found = list.find((w) => w.id === savedActiveId);
            if (found) setActiveWorkspaceState(found);
          }
        } catch {
          setWorkspaces(DEFAULT_WORKSPACES);
          setActiveWorkspaceState(DEFAULT_WORKSPACES[0]);
        }
      }
    }
    
    loadCompanies();
  }, [status]);

  const setActiveWorkspace = useCallback((ws: Workspace) => {
    setActiveWorkspaceState(ws);
    localStorage.setItem(LS_ACTIVE_KEY, ws.id);
  }, []);

  const addWorkspace = useCallback(async (ws: Omit<Workspace, "id">) => {
    if (status === "authenticated") {
      const res = await createCompany(ws.name, ws.country);
      if (res.success && res.company) {
        setWorkspaces((prev) => [...prev, res.company!]);
        setActiveWorkspace(res.company!);
      }
    } else {
      const newWs: Workspace = { ...ws, id: `ws_${Date.now()}` };
      setWorkspaces((prev) => {
        const next = [...prev, newWs];
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
      setActiveWorkspace(newWs);
    }
  }, [status, setActiveWorkspace]);

  const updateWorkspace = useCallback(async (id: string, data: Partial<Workspace>) => {
    if (status === "authenticated") {
      const res = await updateCompany(id, data.name || "", data.country || "");
      if (res.success && res.company) {
        setWorkspaces((prev) => prev.map(w => w.id === id ? res.company! : w));
        setActiveWorkspaceState((prev) => prev.id === id ? res.company! : prev);
      }
    } else {
      const updatedData = {
        ...data,
        initials: data.name ? data.name.charAt(0).toUpperCase() : undefined,
      };
      setWorkspaces((prev) => {
        const next = prev.map(w => w.id === id ? { ...w, ...updatedData, initials: updatedData.initials ?? w.initials } : w);
        localStorage.setItem(LS_KEY, JSON.stringify(next));
        return next;
      });
      setActiveWorkspaceState((prev) => {
        const next = prev.id === id ? { ...prev, ...updatedData, initials: updatedData.initials ?? prev.initials } : prev;
        return next;
      });
    }
  }, [status]);

  return (
    <WorkspaceContext.Provider value={{ workspaces, activeWorkspace, setActiveWorkspace, addWorkspace, updateWorkspace }}>
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
