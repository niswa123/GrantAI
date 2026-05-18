"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Building2, FolderOpen, Receipt, Brain, FileText, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { company as companyApi, projects as projectsApi, expenses as expensesApi, analysis as analysisApi, claims as claimsApi } from "@/lib/api/client";

interface Step {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  description: string;
}

const STEPS: Step[] = [
  {
    id: "company",
    label: "Setup",
    icon: Building2,
    href: "/company",
    description: "Company profile",
  },
  {
    id: "projects",
    label: "Projects",
    icon: FolderOpen,
    href: "/projects",
    description: "Add R&D projects",
  },
  {
    id: "expenses",
    label: "Expenses",
    icon: Receipt,
    href: "/expenses",
    description: "Track costs",
  },
  {
    id: "analysis",
    label: "Analysis",
    icon: Brain,
    href: "/analysis",
    description: "Run AI analysis",
  },
  {
    id: "claims",
    label: "Claim",
    icon: FileText,
    href: "/claims",
    description: "Generate claim",
  },
];

export function ProgressIndicator() {
  const pathname = usePathname();

  // Fetch data to determine completion status
  const { data: company } = useQuery({
    queryKey: ["company"],
    queryFn: async () => {
      const response = await companyApi.get();
      return response.data;
    },
  });

  const { data: projects } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await projectsApi.list();
      return response.data;
    },
    enabled: !!company,
  });

  const { data: expenses } = useQuery({
    queryKey: ["expenses", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const response = await expensesApi.list(company.id);
      return response.data;
    },
    enabled: !!company?.id,
  });

  const { data: analysisRuns } = useQuery({
    queryKey: ["analysis", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const response = await analysisApi.list(company.id);
      return response.data;
    },
    enabled: !!company?.id,
  });

  const { data: claims } = useQuery({
    queryKey: ["claims", company?.id],
    queryFn: async () => {
      if (!company?.id) return [];
      const response = await claimsApi.list(company.id);
      return response.data;
    },
    enabled: !!company?.id,
  });

  const projectsList = Array.isArray(projects) ? projects : [];
  const expensesList = Array.isArray(expenses) ? expenses : [];
  const analysisRunsList = Array.isArray(analysisRuns) ? analysisRuns : [];
  const claimsList = Array.isArray(claims) ? claims : [];

  // Determine completion status for each step
  const isStepComplete = (stepId: string): boolean => {
    switch (stepId) {
      case "company":
        return !!company;
      case "projects":
        return projectsList.length > 0;
      case "expenses":
        return expensesList.length > 0;
      case "analysis":
        return analysisRunsList.length > 0;
      case "claims":
        return claimsList.length > 0;
      default:
        return false;
    }
  };

  const getCurrentStepIndex = (): number => {
    const currentStep = STEPS.findIndex((step) => pathname.startsWith(step.href));
    return currentStep >= 0 ? currentStep : 0;
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="bg-slate-900/50 border-b border-slate-800">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = isStepComplete(step.id);
            const isCurrent = index === currentStepIndex;
            const isAccessible = index === 0 || isStepComplete(STEPS[index - 1].id);

            return (
              <div key={step.id} className="flex items-center flex-1">
                <Link
                  href={isAccessible ? step.href : "#"}
                  className={`flex flex-col items-center gap-2 group ${
                    !isAccessible ? "pointer-events-none opacity-40" : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                      isComplete
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                        : isCurrent
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-400 ring-4 ring-cyan-500/20"
                        : "bg-slate-800 border-slate-700 text-slate-500 group-hover:border-slate-600"
                    }`}
                  >
                    {isComplete ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-sm font-semibold ${
                        isComplete
                          ? "text-emerald-400"
                          : isCurrent
                          ? "text-cyan-400"
                          : "text-slate-500 group-hover:text-slate-400"
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-xs text-slate-600">{step.description}</p>
                  </div>
                </Link>
                {index < STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-colors ${
                      isComplete ? "bg-emerald-500/30" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
