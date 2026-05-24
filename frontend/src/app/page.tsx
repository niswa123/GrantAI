"use client";

import React, { useEffect, useRef, useState } from "react";
import { MainLayout } from "@/components/main-layout";
import { Hero } from "@/components/hero";
import { AppleStyleStickyScroll } from "@/components/apple-scroll";
import { ZoomThroughTransition } from "@/components/zoom-through";
import { HorizontalScrollSection } from "@/components/horizontal-scroll";
import { BeforeAfterSection } from "@/components/before-after";
import { motion, useMotionValue, useTransform, animate, useInView, useScroll, AnimatePresence } from "framer-motion";
import { ArrowRight, Clock, FileText, AlertCircle, Brain, Zap, ShieldCheck, Cpu, Sparkles, Database, Activity, Terminal, GitBranch, GitCommit, Cloud, LayoutGrid, ListTodo, Server, CreditCard, Bitcoin, X, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Logo } from "@/components/ui/logo";
import { SiteFooter } from "@/components/site-footer";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

function AnimatedCounter({ from, to, duration = 2, delay = 0, isDecimal = false }: { from: number, to: number, duration?: number, delay?: number, isDecimal?: boolean }) {
  const count = useMotionValue(from);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const display = useTransform(count, (latest) => 
    isDecimal ? latest.toFixed(1) : Math.round(latest).toString()
  );

  useEffect(() => {
    if (isInView) {
      animate(count, to, { duration, delay, ease: "easeOut" });
    }
  }, [count, to, duration, delay, isInView]);

  return <motion.span ref={ref}>{display}</motion.span>;
}

const integrationData = {
  GitHub: {
    name: "GitHub",
    icon: GitBranch,
    color: "text-slate-100 border-white/10 bg-slate-900/40 hover:bg-slate-900/80",
    selectedColor: "border-white/40 bg-slate-900 text-white shadow-[0_0_15px_rgba(255,255,255,0.05)]",
    accent: "rgba(255,255,255,0.08)",
    status: "ACTIVE [SECURE_SYNC]",
    ping: "4ms",
    desc: "Synchronizes repository commits, pulls code branches, and monitors AST differential changes for high-fidelity compliance tracing.",
    logs: [
      "[GITHUB] Active synchronization via webhook pipeline...",
      "[GITHUB] Ingested commit: 8e2a14 [Author: core-dev-alpha]",
      "[GITHUB] Parsing AST structures... 14 logic blocks identified",
      "[GITHUB] Differential trace calculated: +142 -12 lines",
      "[GITHUB] Technical uncertainty index: 0.84 (High Congruence)"
    ]
  },
  Jira: {
    name: "Jira",
    icon: LayoutGrid,
    color: "text-blue-400 border-blue-500/20 bg-blue-950/10 hover:bg-blue-950/20",
    selectedColor: "border-blue-500/40 bg-blue-950/30 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    accent: "rgba(59,130,246,0.08)",
    status: "ACTIVE [COMPLIANT]",
    ping: "8ms",
    desc: "Connects project Epics, issues, and developer logs directly to R&D activities, verifying hours and technical descriptions against tax rules.",
    logs: [
      "[JIRA] Ingesting sprint tasks from Epic: GRANT-2026-RND...",
      "[JIRA] Loaded issue: GRANT-412 - Implement high-temp thermodynamics",
      "[JIRA] Verified developer work log: 42.5 cumulative hours",
      "[JIRA] Classifying descriptions under R&D statutory rules...",
      "[JIRA] Mapping to Frascati Section 4(a) -> COMPLIANT"
    ]
  },
  AWS: {
    name: "AWS",
    icon: Cloud,
    color: "text-amber-500 border-amber-500/20 bg-amber-950/10 hover:bg-amber-950/20",
    selectedColor: "border-amber-500/40 bg-amber-950/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    accent: "rgba(245,158,11,0.08)",
    status: "ACTIVE [VERIFIED]",
    ping: "12ms",
    desc: "Monitors CloudWatch compute metrics, serverless execution invocations, and database cluster costs for direct R&D capital capitalization.",
    logs: [
      "[AWS] Querying cost allocation matrices (Region: eu-west-1)...",
      "[AWS] Ingested instance: i-0fa39281bc89a (EC2 GPU-Accelerated)",
      "[AWS] Computed CPU resource coefficient: 98.4% allocation",
      "[AWS] Finalized direct compute expense calculation: €3,240.50",
      "[AWS] Syncing cloud resource allocations to tax ledger workbook"
    ]
  },
  Linear: {
    name: "Linear",
    icon: ListTodo,
    color: "text-purple-400 border-purple-500/20 bg-purple-950/10 hover:bg-purple-950/20",
    selectedColor: "border-purple-500/40 bg-purple-950/30 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]",
    accent: "rgba(168,85,247,0.08)",
    status: "ACTIVE [SYNCD]",
    ping: "6ms",
    desc: "Streams development task histories, milestones, and cycles, mapping software goals to tax-creditable engineering challenges.",
    logs: [
      "[LINEAR] Received Webhook Event: Task LIN-892 marked COMPLETED",
      "[LINEAR] Title: 'Optimize AST compiler memory cache structure'",
      "[LINEAR] Ingested Cycle 42 (Research & Validation Phase)",
      "[LINEAR] Core Team: R&D Core Engineering Group",
      "[LINEAR] Logged compliance record linked to Tax credit workbook"
    ]
  },
  Azure: {
    name: "Azure",
    icon: Server,
    color: "text-blue-400 border-blue-400/20 bg-blue-900/10 hover:bg-blue-900/20",
    selectedColor: "border-blue-400/40 bg-blue-950/30 text-blue-300 shadow-[0_0_15px_rgba(96,165,250,0.1)]",
    accent: "rgba(96,165,250,0.08)",
    status: "ACTIVE [COMPLIANT]",
    ping: "10ms",
    desc: "Integrates Azure DevOps pipeline metrics, virtual machine runtimes, and cognitive services deployment bills to compile valid cost records.",
    logs: [
      "[AZURE] Fetching resource utilization logs for subscription: SUB-GRANT-AI...",
      "[AZURE] Ingested pipeline run: build_and_assert_model (SUCCESS)",
      "[AZURE] Parsed VM core hours: 142.4 (Virtual CPU Core Compute)",
      "[AZURE] Validated financial liability: €1,142.30",
      "[AZURE] Sync state: 100% compliant"
    ]
  },
  GitLab: {
    name: "GitLab",
    icon: GitCommit,
    color: "text-orange-500 border-orange-500/20 bg-orange-950/10 hover:bg-orange-950/20",
    selectedColor: "border-orange-500/40 bg-orange-950/30 text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    accent: "rgba(249,115,22,0.08)",
    status: "ACTIVE [SECURE]",
    ping: "7ms",
    desc: "Synchronizes merge requests and GitLab CI/CD execution trails, tracking automated tests that assert technical research criteria.",
    logs: [
      "[GITLAB] Webhook: Merge request #104 merged into master branch",
      "[GITLAB] Code additions parsed: +2,401 lines (Compiler speed)",
      "[GITLAB] CI/CD pipeline validated (Duration: 4m 12s)",
      "[GITLAB] Mathematical models assertions verified (100% accuracy)",
      "[GITLAB] Pushed compliance trace to centralized audit vault"
    ]
  }
};

const hotspotData = {
  github: {
    category: "SOURCE CHANNEL",
    title: "SOURCE: GITHUB",
    description: "Performs continuous extraction of commit hashes, mathematical logic adjustments, and differential PR code changes. Asserts compliance against Frascati tax R&D criteria directly at the code level.",
    metricName: "INGEST_RATE",
    metricVal: "99.98% REALTIME",
    top: 15.8,
    left: 8.1,
    width: 19.4,
    height: 18.2,
    flowchart: [
      { label: "Git Webhook", shape: "document" },
      { label: "AST Parser", shape: "process" },
      { label: "Diff Ledger", shape: "document" }
    ],
    details: "Repository Stream: github.com/api/v3; Processing: AST node extraction, differential line telemetry; Outputs: Commit streams, metadata indices"
  },
  jira: {
    category: "SOURCE CHANNEL",
    title: "SOURCE: JIRA",
    description: "Extracts technical task complexity, historical developer hours, and project milestones. Establishes robust correlation models to justify engineering R&D allocations for auditing authorities.",
    metricName: "SYNC_STATUS",
    metricVal: "100% PARSED",
    top: 39.8,
    left: 8.1,
    width: 19.4,
    height: 18.2,
    flowchart: [
      { label: "API Sync", shape: "process" },
      { label: "Milestones", shape: "document" },
      { label: "Hour Mapper", shape: "process" }
    ],
    details: "Task Sync Access: jira-rest-v3; Processing: Sprint progress estimation, task hour matching; Outputs: Hour grids, activity logs"
  },
  aws: {
    category: "SOURCE CHANNEL",
    title: "SOURCE: AWS",
    description: "Parses AWS CloudWatch logs, active EC2 runtime, and serverless Lambda triggers. Directly traces infrastructure and computing costs back to R&D activities with granular mathematical accuracy.",
    metricName: "OVERHEAD_CAP",
    metricVal: "SECURE [14ms]",
    top: 63.8,
    left: 8.1,
    width: 19.4,
    height: 18.2,
    flowchart: [
      { label: "CloudWatch API", shape: "process" },
      { label: "EC2 Metering", shape: "process" },
      { label: "Tax Ledger", shape: "document" }
    ],
    details: "Metric Sync Access: aws-cloudwatch; Processing: Compute cost isolation, overhead matching; Outputs: Bill ledgers, capital sheets"
  },
  ingestion: {
    category: "COMPLIANCE CORE",
    title: "DATA INGESTION & NORMALIZATION",
    description: "Receives raw multi-channel logs and normalizes heterogeneous data schemas into consistent, time-aligned chronological arrays for deep validation.",
    metricName: "NORMALIZATION",
    metricVal: "99.9% ACCURATE",
    top: 36.2,
    left: 44.5,
    width: 18.0,
    height: 5.5,
    flowchart: [
      { label: "Raw Feeds", shape: "document" },
      { label: "Schema Map", shape: "process" },
      { label: "Normalized Stream", shape: "document" }
    ],
    details: "Ingestion Ports: Webhook/REST; Processing: JSON sanitization, timestamp alignment; Outputs: Normalized activity arrays"
  },
  validation: {
    category: "COMPLIANCE CORE",
    title: "VALIDATION LOGIC & RULES ENGINE",
    description: "Evaluates normalized logs against static tax rules, user-defined thresholds, and regulatory constraints. Identifies qualified activities and flags potential compliance anomalies.",
    metricName: "RULES_APPLIED",
    metricVal: "48 TAX RULES",
    top: 43.2,
    left: 44.5,
    width: 18.0,
    height: 7.5,
    flowchart: [
      { label: "Rule Set v2.1", shape: "document" },
      { label: "Logic Evaluator", shape: "process" },
      { label: "Pass / Fail", shape: "text" },
      { label: "Result Gen", shape: "process" }
    ],
    details: "Rule Repository Access: rules.json, custom_metrics.v2; Processing: If/Else evaluation, threshold checks; Outputs: Log entries, anomaly flags"
  },
  modeling: {
    category: "COMPLIANCE CORE",
    title: "MATHEMATICAL MODELING (NumPy/SciPy)",
    description: "Executes high-dimensional vector analysis, statistical significance modeling, and confidence interval scaling on normalized developer activities.",
    metricName: "MATH_KERNEL",
    metricVal: "SciPy/NumPy 2.1",
    top: 52.2,
    left: 44.5,
    width: 18.0,
    height: 7.5,
    flowchart: [
      { label: "Activity Vec", shape: "document" },
      { label: "SciPy Kernel", shape: "process" },
      { label: "Conf Index", shape: "document" }
    ],
    details: "Analysis Kernel: NumPy/SciPy Matrix; Processing: Vector space alignment, probability indexing; Outputs: Confidence intervals"
  },
  consistency: {
    category: "COMPLIANCE CORE",
    title: "CONSISTENCY CHECKING",
    description: "Runs cross-channel verification to check for double-booking of hours or overlaps in R&D resources across multiple simultaneous projects.",
    metricName: "VERIFICATION",
    metricVal: "CONFLICTS: 0",
    top: 61.2,
    left: 44.5,
    width: 18.0,
    height: 5.5,
    flowchart: [
      { label: "Ledger State", shape: "document" },
      { label: "Overlap Detector", shape: "process" },
      { label: "Alert Flag", shape: "process" }
    ],
    details: "Verification Library: resource_check.bin; Processing: Cross-project resource matching, double-booking detection; Outputs: Conflict charts"
  },
  generation: {
    category: "COMPLIANCE CORE",
    title: "RESULT GENERATION",
    description: "Compiles validated ledger entries into formal reports. Formats audit trails with cryptographic hash chains to guarantee data integrity.",
    metricName: "SECURE_HASH",
    metricVal: "SHA-256 BLOCK",
    top: 68.2,
    left: 44.5,
    width: 18.0,
    height: 5.5,
    flowchart: [
      { label: "Ledger Stream", shape: "document" },
      { label: "SHA-256 Signer", shape: "process" },
      { label: "Audit Docs", shape: "document" }
    ],
    details: "Signer Engine: SHA-256 hash chains; Processing: Block sealing, cryptographic signing; Outputs: Validated ledger files"
  },
  datalake: {
    category: "COMPLIANT OUTPUT",
    title: "OUTPUT: VALIDATED DATALAKE",
    description: "Produces immutable, audit-ready calculations formatted as validated.json ledgers and metrics.csv reports. Instantly consumable by CFOs and tax regulators.",
    metricName: "DATA_FORMAT",
    metricVal: "JSON / CSV",
    top: 41.6,
    left: 80.6,
    width: 11.2,
    height: 7.6,
    flowchart: [
      { label: "JSON/CSV Ledgers", shape: "document" },
      { label: "S3 / Parquet", shape: "process" },
      { label: "Query API", shape: "process" }
    ],
    details: "Storage Format: Parquet database; Access: Amazon Athena secure API; Outputs: Read-only compliance tables, CFO exports"
  },
  dashboard: {
    category: "EXECUTIVE VIEW",
    title: "OUTPUT: REAL-TIME DASHBOARD",
    description: "Visualizes estimated tax credit accrual vectors, audit exposure risk metrics, and compliance confidence indexes via live cryptographically secured views.",
    metricName: "REFRESH_RATE",
    metricVal: "SUB-SECOND [0.2s]",
    top: 58.6,
    left: 80.6,
    width: 11.2,
    height: 6.2,
    flowchart: [
      { label: "Live Stream", shape: "process" },
      { label: "WebSocket Push", shape: "process" },
      { label: "HUD Interface", shape: "document" }
    ],
    details: "View Portal: WebSocket Stream; Processing: Telemetry aggregation, graph drawing; Outputs: Dynamic real-time HUD"
  }
};

const FlowchartArrow = () => (
  <svg width="10" height="8" viewBox="0 0 16 12" fill="none" className="text-cyan-500/60 flex-shrink-0">
    <path d="M1 6H13M13 6L9 2M13 6L9 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const getPopoverPositionNumeric = (key: keyof typeof hotspotData) => {
  // Left blocks -> Popover on the right
  if (key === "github" || key === "jira" || key === "aws") {
    return { left: 48, top: 67, width: 44.5, height: 28.5 };
  }
  // Right blocks -> Popover on the left
  if (key === "datalake" || key === "dashboard") {
    return { left: 8.5, top: 67, width: 38, height: 28.5 };
  }
  // Middle validator blocks -> Popover on the left-bottom, leaving middle/right completely visible
  return { left: 8.5, top: 67, width: 32, height: 28.5 };
};

const getHotspotRadiusClass = (key: keyof typeof hotspotData) => {
  if (key === "github" || key === "jira" || key === "aws") {
    return "rounded-[8px]";
  }
  if (key === "datalake" || key === "dashboard") {
    return "rounded-[3px]";
  }
  return "rounded-[3px]";
};


export default function Home() {
  const parallaxRef = useRef<HTMLElement>(null);
  const zoomPortalRef = useRef<HTMLElement>(null);
  const pricingCarouselRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const scrollToPopularPlan = () => {
      if (typeof window !== "undefined" && window.innerWidth < 768 && pricingCarouselRef.current) {
        const container = pricingCarouselRef.current;
        const cards = container.children;
        if (cards && cards.length > 1) {
          const targetCard = cards[1] as HTMLElement;
          const containerWidth = container.clientWidth;
          const cardWidth = targetCard.clientWidth;
          const offsetLeft = targetCard.offsetLeft;
          container.scrollLeft = offsetLeft - (containerWidth - cardWidth) / 2;
        }
      }
    };
    const timer = setTimeout(scrollToPopularPlan, 200);
    window.addEventListener("resize", scrollToPopularPlan);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", scrollToPopularPlan);
    };
  }, []);
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<keyof typeof integrationData>("GitHub");
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<keyof typeof hotspotData | null>(null);
  const [activeMobileNode, setActiveMobileNode] = useState<keyof typeof hotspotData>("github");
  const [isTestingMobileNode, setIsTestingMobileNode] = useState<string | null>(null);
  const [mobileTestLogs, setMobileTestLogs] = useState<string[]>([]);

  const runMobileNodeTest = (nodeKey: keyof typeof hotspotData) => {
    if (isTestingMobileNode) return;
    setIsTestingMobileNode(nodeKey);
    setMobileTestLogs([]);
    
    const steps = [
      `INITIALIZING COUPLING MATRIX FOR NODE [${nodeKey.toUpperCase()}]...`,
      `ESTABLISHING SECURED SYNC FOR ${hotspotData[nodeKey].metricName}...`,
      `PARSING DATA STREAM PATHS AND SCHEMAS...`,
      `RUNNING INTEGRITY CHECKS: ${hotspotData[nodeKey].details.split(";")[1]?.trim() || "OK"}`,
      `COMPARE_CHECKSUM: SHA-256 [SECURE_OK]`,
      `DIAGNOSTIC VERIFIED: ${hotspotData[nodeKey].metricVal}`
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setMobileTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString('en-US', { hour12: false })}] ${step}`]);
        if (index === steps.length - 1) {
          setIsTestingMobileNode(null);
        }
      }, (index + 1) * 350);
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  const handlePlanSelect = (plan: string) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handleCheckout = async (provider: 'stripe' | 'nowpayments') => {
    setIsLoading(provider);
    try {
      const endpoint = provider === 'stripe' ? '/api/stripe/checkout' : '/api/nowpayments/invoice';
      // Simulating user session/auth check. In production, this goes via API with session token.
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan })
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("No checkout URL returned", data);
        setIsLoading(null);
      }
    } catch (error) {
      console.error("Checkout error:", error);
      setIsLoading(null);
    }
  };
  
  const { scrollYProgress } = useScroll({
    target: parallaxRef,
    offset: ["start end", "end start"]
  });

  // Zoom-Through Portal scroll transforms
  const { scrollYProgress: zoomProgress } = useScroll({
    target: zoomPortalRef,
    offset: ["start end", "end start"]
  });
  const zoomScale = useTransform(zoomProgress, [0, 0.6, 1], [1, 12, 80]);
  const zoomOpacity = useTransform(zoomProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  const portalTextOpacity = useTransform(zoomProgress, [0, 0.25, 0.5], [1, 0.3, 0]);
  const pipelineReveal = useTransform(zoomProgress, [0.6, 1], [0, 1]);
  const curtainY = useTransform(zoomProgress, [0, 1], ["0%", "-110%"]);
  const curtainBgReveal = useTransform(zoomProgress, [0, 1], [0, 1]);

  const yFast = useTransform(scrollYProgress, [0, 1], [-250, 250]);
  const yMedium = useTransform(scrollYProgress, [0, 1], [-150, 150]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 }
    }
  };

  return (
    <MainLayout>
      <Navbar />
      <Hero />

      
      {/* ============================================ */}
      {/* SECTION 1: INTEGRATIONS (Sticky — gets overlapped by Stats) */}
      {/* ============================================ */}
      <div className="relative z-20 w-full bg-slate-950 rounded-t-[24px] sm:rounded-t-[40px] md:rounded-t-[60px] shadow-[0_-40px_80px_rgba(0,0,0,0.8)] border-t border-white/5 overflow-hidden">
        <div className="h-auto md:h-[140vh] relative py-20 md:py-0 overflow-hidden">
          <div className="md:sticky md:top-0 md:h-screen flex flex-col items-center justify-start overflow-visible w-full md:py-4 lg:py-6">
            <section ref={parallaxRef} className="container mx-auto px-4 sm:px-6 relative flex flex-col items-center justify-center max-w-full my-auto">
          
          <div className="w-full max-w-6xl mx-auto z-20 px-4 md:px-6">
            {/* Title Block without slop gradient, clean editorial typographic header */}
            <div className="text-center mb-6 sm:mb-8 md:mb-10 lg:mb-12">
              <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[9px] sm:text-xs text-slate-400 mb-3 tracking-wider uppercase whitespace-nowrap">
                [ CONNECTIVITY & NORMALIZATION ENGINE ]
              </div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-2 tracking-tighter"
              >
                Growing library of <span className="text-cyan-400 font-black">integrations</span>
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-slate-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto"
              >
                Synchronize raw repository metadata, issue logs, and cloud resource metrics directly into the deterministic tax valuation engine.
              </motion.p>
            </div>

            {/* Interactive Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
              {/* Left Column: Asymmetric System Diagnostics & Selector Console */}
              <div className="hidden lg:block lg:col-span-6 w-full">
                <div className="border border-white/10 bg-slate-950/80 rounded-xl overflow-hidden shadow-2xl flex flex-col w-full min-h-[460px] lg:min-h-[500px]">
                  {/* Console Top Header HUD */}
                  <div className="flex items-center justify-between px-4 py-3 bg-slate-900/40 border-b border-white/5 font-mono text-[10px] text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                      <span className="tracking-wider uppercase">SYSTEM_CORE // ACTIVE</span>
                    </div>
                    <span className="text-slate-400 uppercase tracking-widest font-bold">[ INTEGRATION HUB ]</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 flex-1">
                    {/* Left Part: Selector List (Sidebar) */}
                    <div className="sm:col-span-5 border-b sm:border-b-0 sm:border-r border-white/5 p-4 flex flex-col gap-2 bg-slate-900/[0.15]">
                      <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mb-2 px-1">
                        Connectors
                      </div>
                      <div className="flex flex-col gap-1.5">
                        {(Object.keys(integrationData) as Array<keyof typeof integrationData>).map((key) => {
                          const item = integrationData[key];
                          const Icon = item.icon;
                          const isSelected = selectedIntegration === key;
                          return (
                            <motion.button
                              key={key}
                              onClick={() => setSelectedIntegration(key)}
                              whileHover={{ x: 2 }}
                              whileTap={{ scale: 0.98 }}
                              className={`flex items-center justify-between p-3 rounded border font-mono text-xs text-left transition-all duration-300 group relative overflow-hidden ${
                                isSelected 
                                  ? "border-cyan-500/20 bg-cyan-500/[0.05] text-white" 
                                  : "border-white/5 bg-transparent text-slate-400 hover:text-slate-200 hover:border-white/10 hover:bg-white/[0.01]"
                              }`}
                            >
                              {isSelected && (
                                <motion.div
                                  layoutId="activeIntegrationBar"
                                  className="absolute left-0 top-2 bottom-2 w-[3px] bg-cyan-400 rounded-r shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                                />
                              )}
                              <div className="flex items-center gap-2.5 pl-1.5 relative z-10">
                                <Icon className={`w-4 h-4 transition-colors ${isSelected ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-400"}`} />
                                <span className="font-bold uppercase tracking-tight">{item.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5 relative z-10">
                                <span className="text-[9px] opacity-40">{item.ping}</span>
                                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-cyan-400 animate-pulse shadow-[0_0_6px_rgba(6,182,212,0.6)]" : "bg-slate-700"}`} />
                              </div>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right Part: Real-Time Stream Output Terminal */}
                    <div className="sm:col-span-7 p-4 md:p-5 flex flex-col justify-between font-mono text-xs text-slate-300 min-h-[300px]">
                      <div className="flex flex-col flex-1">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3 text-[10px] text-slate-500">
                          <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                            <span>LOGSTREAM://{selectedIntegration.toUpperCase()}_PIPELINE</span>
                          </div>
                        </div>

                        <div className="text-[11px] text-slate-400 leading-relaxed mb-4 pb-3 border-b border-white/5">
                          {integrationData[selectedIntegration].desc}
                        </div>

                        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto scrollbar-hide text-slate-300 max-h-[220px]">
                          <AnimatePresence mode="popLayout">
                            {integrationData[selectedIntegration].logs.map((log, idx) => (
                              <motion.div
                                key={`${selectedIntegration}-${idx}`}
                                initial={{ opacity: 0, x: -8, y: 4 }}
                                animate={{ opacity: 1, x: 0, y: 0 }}
                                exit={{ opacity: 0, x: 8, y: -4 }}
                                transition={{ 
                                  type: "spring", 
                                  stiffness: 240, 
                                  damping: 25, 
                                  delay: idx * 0.04 
                                }}
                                className="flex items-start gap-2 leading-relaxed"
                              >
                                <span className="text-cyan-500/60 select-none font-bold">&rsaquo;</span>
                                <span className="break-all font-mono text-slate-300">{log}</span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/5 text-[9px] text-slate-600 flex justify-between">
                        <span>SYS_SYNC: SECURE_CHANNEL</span>
                        <span>BUFFER: 100% OK</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: High-Fidelity Technical Blueprint viewport */}
              <div className="lg:col-span-6 w-full">
                <div 
                  className="border border-white/10 bg-slate-950/80 backdrop-blur-3xl rounded-lg overflow-hidden relative shadow-2xl flex flex-col items-center justify-center p-3 md:p-4 lg:p-5 group w-full max-w-[640px] lg:max-w-[680px] mx-auto"
                >
                  {/* Desktop-Only Schematic Viewport */}
                  <div className="hidden lg:flex lg:flex-col w-full items-center justify-center">
                    {/* Outer Scanning Overlay with Framer Motion (Laser scanner line) */}
                    <motion.div 
                      animate={{ y: ["0%", "100%", "0%"] }} 
                      transition={{ duration: 10, ease: "linear", repeat: Infinity }}
                      className="absolute left-0 right-0 h-[1.5px] bg-slate-400/40 shadow-[0_0_10px_rgba(255,255,255,0.4)] z-20 pointer-events-none"
                      style={{ top: 0 }}
                    />

                    {/* Top Schematic HUD bar */}
                    <div className="w-full flex items-center justify-between font-mono text-[9px] text-slate-500 border-b border-white/5 pb-2 md:pb-3 mb-2 md:mb-3 lg:mb-4">
                      <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span>SCHEMATIC://CMVE_INT_001</span>
                      </div>
                      <span>SCALE: 1:1 // DEVIATION: 0.00%</span>
                    </div>

                    {/* Blueprint Image Container */}
                    <div className="relative w-full max-w-[440px] md:max-w-[480px] lg:max-w-[520px] aspect-square rounded border border-white/5 bg-slate-900/20 overflow-hidden flex items-center justify-center select-none">
                      <img 
                        src="/integrations_technical_blueprint.png" 
                        alt="Technical architectural integration blueprint flow diagram"
                        className="w-full h-full object-contain opacity-85 group-hover:opacity-100 transition-opacity duration-500 select-none pointer-events-none"
                      />
                      <div className="absolute inset-0 bg-slate-950/10 pointer-events-none mix-blend-overlay" />

                      {/* Interactive Hotspot Bounding Boxes */}
                      {(Object.keys(hotspotData) as Array<keyof typeof hotspotData>).map((key) => {
                        const hotspot = hotspotData[key];
                        const isActive = activeHotspot === key;
                        
                        return (
                          <button
                            key={key}
                            onClick={() => setActiveHotspot(isActive ? null : key)}
                            className={`absolute cursor-pointer focus:outline-none z-25 border-none bg-transparent ${getHotspotRadiusClass(key)}`}
                            style={{ 
                              top: `${hotspot.top}%`, 
                              left: `${hotspot.left}%`,
                              width: `${hotspot.width}%`,
                              height: `${hotspot.height}%`
                            }}
                            title={hotspot.title}
                          />
                        );
                      })}

                      {/* Creative Cyber-Connector SVG Layer linking Hotspot to Popover */}
                      <AnimatePresence>
                        {activeHotspot && (() => {
                          const popoverPos = getPopoverPositionNumeric(activeHotspot);
                          const hotspot = hotspotData[activeHotspot];
                          const isPopoverOnRight = popoverPos.left > hotspot.left;
                          const startX = isPopoverOnRight ? (hotspot.left + hotspot.width) : hotspot.left;
                          const startY = hotspot.top + hotspot.height / 2;
                          const endX = isPopoverOnRight ? popoverPos.left : (popoverPos.left + popoverPos.width);
                          const endY = popoverPos.top + 2;
                          
                          const dx = Math.abs(startX - endX);
                          const hOffset = Math.min(6, dx * 0.45);
                          
                          const controlX1 = startX + (isPopoverOnRight ? hOffset : -hOffset);
                          const controlY1 = startY;
                          const controlX2 = endX + (isPopoverOnRight ? -hOffset : hOffset);
                          const controlY2 = endY;
                          
                          const pathD = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;
                          
                          return (
                            <motion.svg 
                              key={`connector-${activeHotspot}`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="absolute inset-0 w-full h-full pointer-events-none z-20"
                              viewBox="0 0 100 100"
                              preserveAspectRatio="none"
                            >
                              <defs>
                                <linearGradient id="connectorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.8" />
                                </linearGradient>
                                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                                  <feGaussianBlur stdDeviation="0.6" result="blur" />
                                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                </filter>
                              </defs>
                              
                              {/* Glowing Under-layer Track */}
                              <motion.path
                                  d={pathD}
                                  stroke="rgba(34, 211, 238, 0.12)"
                                  strokeWidth="1.2"
                                  fill="none"
                                  initial={{ pathLength: 0, opacity: 0 }}
                                  animate={{ pathLength: 1, opacity: 1 }}
                                  transition={{ duration: 0.4, ease: "easeOut" }}
                              />
                              
                              {/* Sharp Active Signal Line */}
                              <motion.path
                                  d={pathD}
                                  stroke="url(#connectorGradient)"
                                  strokeWidth="0.6"
                                  fill="none"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 0.45, ease: "easeOut" }}
                                  filter="url(#glowFilter)"
                              />
                              
                              {/* Flowing Pulse Dotted Overlay */}
                              <motion.path
                                  d={pathD}
                                  stroke="#22d3ee"
                                  strokeWidth="0.8"
                                  strokeDasharray="3 6"
                                  fill="none"
                                  animate={{ strokeDashoffset: [0, -18] }}
                                  transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                                  opacity="0.6"
                              />

                              {/* Single Glowing Data Packet (Dynamic Point) */}
                              <motion.path
                                  d={pathD}
                                  stroke="#38bdf8"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeDasharray="0.1 100"
                                  fill="none"
                                  animate={{ strokeDashoffset: [100, 0] }}
                                  transition={{ repeat: Infinity, duration: 2.0, ease: "easeInOut" }}
                                  filter="url(#glowFilter)"
                              />
                              
                              {/* Sender Radar Ping */}
                              <g>
                                <circle cx={startX} cy={startY} r="0.6" fill="#22d3ee" />
                                <motion.circle 
                                  cx={startX} 
                                  cy={startY} 
                                  r="1.8" 
                                  stroke="#22d3ee" 
                                  strokeWidth="0.3" 
                                  fill="none"
                                  animate={{ scale: [0.8, 1.8], opacity: [0.6, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                />
                              </g>
                              
                              {/* Receiver Radar Ping */}
                              <g>
                                <circle cx={endX} cy={endY} r="0.6" fill="#3b82f6" />
                                <motion.circle 
                                  cx={endX} 
                                  cy={endY} 
                                  r="1.8" 
                                  stroke="#3b82f6" 
                                  strokeWidth="0.3" 
                                  fill="none"
                                  animate={{ scale: [0.8, 1.8], opacity: [0.6, 0] }}
                                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
                                />
                              </g>
                            </motion.svg>
                          );
                        })()}
                      </AnimatePresence>

                      {/* Integrated Monospaced HUD Popover Card */}
                      <AnimatePresence>
                        {activeHotspot && (() => {
                          const popoverPos = getPopoverPositionNumeric(activeHotspot);
                          return (
                            <motion.div
                              key={`popover-${activeHotspot}`}
                              initial={{ opacity: 0, scale: 0.96, y: 8 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.96, y: 8 }}
                              transition={{ type: "spring", stiffness: 350, damping: 28 }}
                              className="absolute bg-[#070b19]/95 border border-cyan-500/80 rounded-[4px] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.7),0_0_15px_rgba(34,211,238,0.15)] p-2.5 flex flex-col justify-between z-30 font-mono"
                              style={{
                                left: `${popoverPos.left}%`,
                                top: `${popoverPos.top}%`,
                                width: `${popoverPos.width}%`,
                                height: `${popoverPos.height}%`
                              }}
                            >
                              {/* Popover Header */}
                              <div className="border-b border-cyan-500/30 pb-1 flex items-center gap-1.5 flex-shrink-0">
                                <span className="text-[9px] text-cyan-400 font-bold tracking-tight uppercase whitespace-normal">
                                  DETAILED COMPONENT DESCRIPTION: {hotspotData[activeHotspot].title.replace("SOURCE: ", "").replace("OUTPUT: ", "")}
                                </span>
                              </div>

                              {/* Popover Body Content */}
                              <div className="flex-1 my-1 overflow-y-auto scrollbar-hide flex flex-col justify-center">
                                <p className="text-[9px] text-slate-300 leading-relaxed font-mono">
                                  {hotspotData[activeHotspot].details}
                                </p>
                              </div>

                              {/* Custom Flowchart Area */}
                              <div className="border-t border-cyan-500/20 pt-1.5 flex items-center justify-center gap-1.5 flex-shrink-0 overflow-x-auto scrollbar-hide h-8">
                                {hotspotData[activeHotspot].flowchart.map((node, idx) => (
                                  <React.Fragment key={idx}>
                                    {idx > 0 && <FlowchartArrow />}
                                    
                                    {node.shape === "document" ? (
                                      <div 
                                        className="relative border border-cyan-500/60 bg-cyan-950/20 px-1.5 py-0.5 text-[7.5px] font-mono text-cyan-300 flex items-center justify-center min-w-[50px] text-center select-none rounded-none"
                                        style={{ clipPath: "polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 0 100%)" }}
                                      >
                                        <div className="absolute top-0 right-0 w-[4px] h-[4px] bg-cyan-500/40 border-l border-b border-cyan-500/60" />
                                        {node.label}
                                      </div>
                                    ) : node.shape === "text" ? (
                                      <span className="text-[7px] font-mono text-slate-400 px-0.5 py-0.5 whitespace-nowrap select-none font-bold uppercase">
                                        {node.label}
                                      </span>
                                    ) : (
                                      <div className="border border-cyan-500/60 bg-cyan-950/20 px-1.5 py-0.5 text-[7.5px] font-mono text-cyan-300 rounded-none flex items-center justify-center min-w-[50px] text-center select-none">
                                        {node.label}
                                      </div>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                            </motion.div>
                          );
                        })()}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Mobile-Only Interactive Diagnostics Ledger Console (Premium Minimalist, High Interactivity) */}
                  <div className="flex flex-col lg:hidden w-full gap-3">
                    {/* Top HUD bar */}
                    <div className="w-full flex items-center justify-between font-mono text-[9px] text-slate-500 border-b border-white/5 pb-2">
                      <div className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                        <span>SYS_DIAGNOSTICS://NODE_OPERATIONAL</span>
                      </div>
                      <span className="text-emerald-400 font-bold border border-emerald-500/20 px-1.5 py-0.5 rounded bg-emerald-500/5 tracking-wider">ALL SECURED</span>
                    </div>

                    {/* Nodes Ribbon Selector */}
                    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide pb-2 pt-0.5 w-full">
                      {(Object.keys(hotspotData) as Array<keyof typeof hotspotData>).map((key) => {
                        const node = hotspotData[key];
                        const isSelected = activeMobileNode === key;
                        const isSource = node.category === "SOURCE CHANNEL";
                        const isCore = node.category === "COMPLIANCE CORE";
                        
                        let catSymbol = "■";
                        if (isSource) catSymbol = "▲";
                        if (isCore) catSymbol = "◆";
                        
                        return (
                          <button
                            key={key}
                            onClick={() => {
                              setActiveMobileNode(key);
                              setIsTestingMobileNode(null);
                              setMobileTestLogs([]);
                            }}
                            className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 border font-mono text-[9px] uppercase transition-all select-none rounded-[4px] cursor-pointer ${
                              isSelected 
                                ? "border-cyan-500 bg-cyan-500/10 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.2)] font-bold" 
                                : "border-white/5 bg-slate-950/40 text-slate-400 hover:border-white/10 hover:text-slate-200"
                            }`}
                          >
                            <span className={isSelected ? "text-cyan-400" : "text-slate-600"}>{catSymbol}</span>
                            <span>{key.replace("ingestion", "ingest").replace("validation", "validate").replace("consistency", "consistent").replace("generation", "generate")}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Diagnostic Monitor screen */}
                    <div className="border border-white/10 bg-slate-950/50 rounded-md p-3 flex flex-col gap-3 font-mono">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[9px]">
                        <span className="text-slate-500">SYS_NODE: {activeMobileNode.toUpperCase()}_DIAG</span>
                        <div className="flex items-center gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                          </span>
                          <span className="text-emerald-400 font-bold uppercase">ACTIVE</span>
                        </div>
                      </div>

                      {/* Text details */}
                      <div className="flex flex-col gap-1.5">
                        <div className="text-white font-bold text-xs uppercase tracking-tight">
                          {hotspotData[activeMobileNode].title.replace("SOURCE: ", "").replace("OUTPUT: ", "")}
                        </div>
                        <div className="text-slate-400 leading-relaxed text-[9.5px]">
                          {hotspotData[activeMobileNode].description}
                        </div>
                      </div>

                      {/* Telemetry data grid */}
                      <div className="grid grid-cols-2 gap-2.5 border-y border-white/5 py-2.5 my-0.5 text-[9px]">
                        <div className="flex flex-col">
                          <span className="text-slate-600 text-[8px] uppercase tracking-wider font-bold">NODE_CLASS</span>
                          <span className="text-slate-300 font-bold uppercase mt-0.5">{hotspotData[activeMobileNode].category}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-600 text-[8px] uppercase tracking-wider font-bold">METRIC_TYPE</span>
                          <span className="text-slate-300 font-bold uppercase mt-0.5">{hotspotData[activeMobileNode].metricName}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-600 text-[8px] uppercase tracking-wider font-bold">LIVE_METRIC</span>
                          <span className="text-cyan-400 font-bold uppercase mt-0.5">{hotspotData[activeMobileNode].metricVal}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-600 text-[8px] uppercase tracking-wider font-bold">INTEGRATION_END</span>
                          <span className="text-slate-300 font-mono break-all text-[8px] mt-0.5">{hotspotData[activeMobileNode].details.split(";")[0]?.split(": ")[1] || "DIRECT"}</span>
                        </div>
                      </div>

                      {/* Typographic flowchart */}
                      <div className="bg-slate-900/25 border border-white/5 rounded p-2 flex flex-col gap-1.5">
                        <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">[ PIPELINE FLOW ]</span>
                        <div className="flex items-center justify-start gap-1 overflow-x-auto scrollbar-hide py-0.5">
                          {hotspotData[activeMobileNode].flowchart.map((node, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && <span className="text-cyan-500/40 text-[9px] px-0.5 select-none">&gt;</span>}
                              <div className="border border-cyan-500/10 bg-cyan-950/5 px-2 py-0.5 text-[8px] font-mono text-cyan-400 whitespace-nowrap rounded-[3px]">
                                {node.label}
                              </div>
                            </React.Fragment>
                          ))}
                        </div>
                      </div>

                      {/* Simulation suite */}
                      <div className="flex flex-col gap-1.5 mt-0.5">
                        <button
                          onClick={() => runMobileNodeTest(activeMobileNode)}
                          disabled={isTestingMobileNode !== null}
                          className={`w-full py-2 border font-mono text-[9px] font-bold uppercase transition-all select-none rounded-[4px] cursor-pointer text-center ${
                            isTestingMobileNode
                              ? "border-cyan-500/20 bg-slate-900/15 text-cyan-400/50 cursor-not-allowed"
                              : "border-cyan-500/30 bg-cyan-950/20 text-cyan-300 hover:bg-cyan-500/10 active:scale-[0.99] hover:border-cyan-500"
                          }`}
                        >
                          {isTestingMobileNode ? "›› EXECUTING DIAGNOSTIC SYNC..." : "›› VERIFY NODE INTEGRITY"}
                        </button>
                        
                        {/* Live Terminal logs box */}
                        {mobileTestLogs.length > 0 && (
                          <div className="bg-[#040813] border border-cyan-500/15 rounded p-2 text-[8px] font-mono text-cyan-300/80 max-h-[85px] overflow-y-auto flex flex-col gap-1 mt-1 scrollbar-hide">
                            {mobileTestLogs.map((log, idx) => (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="leading-normal whitespace-pre-wrap select-none"
                              >
                                {log}
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Bottom metrics panel */}
                  <div className="w-full grid grid-cols-3 gap-2 mt-2 md:mt-3 pt-2 md:pt-3 border-t border-white/5 font-mono text-[10px] text-center text-slate-400">
                    <div className="flex flex-col gap-1 border-r border-white/5">
                      <span className="text-[9px] text-slate-600">CONGRUENCE</span>
                      <span className="text-white font-bold">99.8% ACC</span>
                    </div>
                    <div className="flex flex-col gap-1 border-r border-white/5">
                      <span className="text-[9px] text-slate-600">LATENCY</span>
                      <span className="text-white font-bold">&lt; 140ms</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] text-slate-600">STATUS</span>
                      <span className="text-emerald-400 font-bold">SECURED</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* APPLE-STYLE STICKY SCROLL SECTION */}
      {/* Premium storytelling with animated dashboard */}
      {/* ============================================ */}
      <AppleStyleStickyScroll />

      {/* ============================================ */}
      {/* ZOOM-THROUGH TRANSITION */}
      {/* Fly into screen effect - immersive portal */}
      {/* ============================================ */}
      <ZoomThroughTransition />

      {/* ============================================ */}
      {/* SECTION 2: STATS (Slides OVER Integrations — Stacking Cards) */}
      {/* ============================================ */}
      <div className="relative z-30 w-full bg-slate-950 rounded-t-[24px] sm:rounded-t-[40px] md:rounded-t-[60px] shadow-[0_-60px_100px_rgba(0,0,0,0.9)] border-t border-white/10 overflow-hidden">
        <section className="py-16 sm:py-20 md:py-24 lg:py-32 container mx-auto px-4 relative overflow-hidden">
          <motion.div 
            className="glass-card rounded-[32px] sm:rounded-[40px] md:rounded-[48px] p-8 sm:p-10 md:p-12 lg:p-16 xl:p-24 relative overflow-hidden group border border-white/10 shadow-[inset_0_0_80px_rgba(255,255,255,0.02)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            whileHover={{ boxShadow: "inset 0 0 80px rgba(6,182,212,0.05), 0 0 80px rgba(6, 182, 212, 0.15)", borderColor: "rgba(6,182,212,0.3)" }}
            transition={{ duration: 0.5 }}
          >
          {/* Animated Magic Gradient Background */}
          <div className="absolute top-[-20%] right-[-10%] w-[120%] lg:w-2/3 h-[140%] bg-[conic-gradient(from_90deg_at_50%_50%,#020617_0%,#06b6d430_50%,#020617_100%)] blur-[80px] sm:blur-[100px] -z-10 group-hover:opacity-100 opacity-60 transition-opacity duration-700 pointer-events-none animate-[spin_10s_linear_infinite]" />
          
          {/* Noise overlay for texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')] opacity-[0.03] mix-blend-overlay -z-10" />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 lg:gap-8 items-center relative z-10">
            {/* Left Content */}
            <div className="max-w-2xl relative">
              
              {/* Live Indicator */}
              <motion.div 
                variants={itemVariants}
                className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-xs text-slate-400 mb-6 sm:mb-8 tracking-wider uppercase backdrop-blur-md"
              >
                [ LIVE SYNC ACTIVE ]
              </motion.div>

              <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 sm:mb-8 text-white tracking-tighter leading-[1.05]">
                Measure engineering <br className="hidden sm:block" />
                <span className="text-cyan-400 drop-shadow-sm">
                  value in real time.
                </span>
              </motion.h2>

              <motion.p variants={itemVariants} className="text-slate-400 text-lg sm:text-xl mb-10 sm:mb-12 leading-relaxed font-medium">
                Every day, your engineers create R&D value that goes unmeasured. GrantAI captures it the moment it happens — turning daily work logs into a continuous financial signal.
              </motion.p>
              
              <motion.div variants={itemVariants} className="border border-white/15 rounded-md bg-white/[0.01] divide-y divide-white/5 pt-2">
                {/* Metric 1 */}
                <div className="p-6 sm:p-8 flex items-center justify-between font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Metric 01 // Value Flow</span>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight mt-1">Qualified daily R&D expenses</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight flex items-baseline justify-end gap-1">
                      <span className="text-cyan-400 text-2xl font-bold">€</span>
                      <AnimatedCounter from={0} to={1240} duration={2.5} delay={0.5} isDecimal={false} />
                    </div>
                  </div>
                </div>

                {/* Metric 2 */}
                <div className="p-6 sm:p-8 flex items-center justify-between font-mono">
                  <div className="text-left">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Metric 02 // Neural Parser</span>
                    <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight mt-1">AST Compliance Confidence</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl sm:text-4xl font-mono font-black text-white tracking-tight flex items-baseline justify-end gap-1">
                      <AnimatedCounter from={0} to={99.8} duration={2.5} delay={0.7} isDecimal={true} />
                      <span className="text-cyan-400 text-2xl font-bold">%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right Holographic Animation — Real-time Value Dashboard */}
            <motion.div 
              variants={itemVariants} 
              className="relative h-[350px] sm:h-[400px] md:h-[450px] w-full items-center justify-center hidden lg:flex perspective-[1500px]"
            >
              {/* Central Glowing Core */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute w-[250px] h-[250px] bg-cyan-500/20 rounded-full blur-[80px] -z-10" 
              />
              
              <div className="relative w-[340px] h-[380px] transform-style-3d">
                
                {/* Back Layer: Raw Daily Logs */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: -60, z: -80, opacity: 0 }}
                  whileInView={{ opacity: 0.4 }}
                  animate={{ y: [0, -15, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", opacity: { duration: 1 } }}
                  className="absolute inset-0 bg-slate-900/50 border border-white/5 rounded-3xl p-8 backdrop-blur-sm"
                >
                  <div className="flex gap-3 items-center mb-5 opacity-40">
                    <div className="w-8 h-8 rounded-lg bg-slate-700/60 flex items-center justify-center">
                      <Terminal className="w-4 h-4 text-slate-500" />
                    </div>
                    <div className="text-xs font-bold text-slate-600 tracking-wider">DAILY LOGS</div>
                  </div>
                  <div className="space-y-3 opacity-30">
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <div className="w-full h-2 bg-slate-700/50 rounded" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/60" />
                      <div className="w-4/5 h-2 bg-slate-700/50 rounded" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-600/60" />
                      <div className="w-3/5 h-2 bg-slate-700/50 rounded" />
                    </div>
                  </div>
                </motion.div>

                {/* Middle Layer: AI Classification */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: -20, z: -40, opacity: 0 }}
                  whileInView={{ opacity: 0.6 }}
                  animate={{ y: [0, 10, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5, opacity: { duration: 1 } }}
                  className="absolute inset-0 border border-cyan-500/10 rounded-3xl p-8 backdrop-blur-md flex items-center justify-center mix-blend-screen"
                >
                  <div className="absolute w-[150px] h-[150px] border border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                  <div className="absolute w-[100px] h-[100px] border border-cyan-400/30 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
                  <Brain className="w-10 h-10 text-cyan-500/40 relative z-10" />
                </motion.div>

                {/* Front Layer: Real-time Value Dashboard */}
                <motion.div
                  initial={{ rotateY: -20, rotateX: 10, x: 20, z: 20, opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  animate={{ y: [0, -5, 0] }}
                  viewport={{ once: true }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1, opacity: { duration: 1 } }}
                  className="absolute inset-0 bg-slate-950/90 border border-cyan-500/40 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.15)] overflow-hidden"
                >
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                        <Activity className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">R&D Value Flow</div>
                        <div className="text-[10px] text-emerald-400/80 font-semibold">● Live</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-white tracking-tight">€4,280</div>
                      <div className="text-[9px] text-emerald-400 font-bold">+€204 today</div>
                    </div>
                  </div>

                  {/* Mini Chart — Animated Bar Chart */}
                  <div className="flex items-end gap-[5px] h-[100px] mb-4 px-1 relative z-10">
                    {[65, 45, 78, 55, 82, 40, 90, 72, 58, 85, 68, 92, 48, 75].map((h, i) => (
                      <motion.div
                        key={i}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.1 * i, ease: "easeOut" }}
                        className={`flex-1 rounded-sm ${h > 60 ? 'bg-gradient-to-t from-emerald-600/80 to-emerald-400/60 shadow-[0_0_6px_rgba(16,185,129,0.3)]' : 'bg-slate-700/60'}`}
                      />
                    ))}
                  </div>

                  {/* Bottom Stats Row */}
                  <div className="grid grid-cols-3 gap-2 relative z-10">
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">Confidence</div>
                      <div className="text-sm font-black text-cyan-400">0.87</div>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-white/5">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">R&D Logs</div>
                      <div className="text-sm font-black text-white">142</div>
                    </div>
                    <div className="bg-slate-900/80 rounded-xl p-2.5 border border-emerald-500/20">
                      <div className="text-[9px] text-slate-500 font-semibold mb-1">R&D Rate</div>
                      <div className="text-sm font-black text-emerald-400">73%</div>
                    </div>
                  </div>

                  {/* Ambient pulse glow */}
                  <motion.div
                    animate={{ opacity: [0.05, 0.15, 0.05] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 via-transparent to-cyan-500/5 pointer-events-none z-0"
                  />
                </motion.div>
                
              </div>
            </motion.div>

          </div>
        </motion.div>
      </section>
      </div>

      {/* ============================================ */}
      {/* ============================================ */}
      {/* SECTION 3: BEFORE VS AFTER (Premium Minimalist) */}
      {/* ============================================ */}
      <BeforeAfterSection />

      {/* ============================================ */}
      {/* CURTAIN LIFT TRANSITION: Paradigm Shift ↑ Pipeline ↓ */}
      {/* The Before/After block is the "curtain" — it lifts away */}
      {/* ============================================ */}
      <section ref={zoomPortalRef} className="hidden md:block h-[80vh] relative bg-slate-950 overflow-hidden">
        {/* Pipeline block sitting beneath, visible as curtain lifts */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            style={{ opacity: zoomProgress }}
            className="text-center pointer-events-none select-none"
          >
            <p className="text-slate-600 text-xs font-bold uppercase tracking-[0.4em] mb-4">How It Works</p>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter text-slate-800">
              The Automated Pipeline
            </h2>
          </motion.div>
        </div>

        {/* The curtain — the card lifting up off screen */}
        <motion.div
          style={{ y: curtainY }}
          className="absolute inset-x-4 md:inset-x-12 top-0 h-full bg-slate-950 rounded-b-[40px] shadow-[0_40px_120px_rgba(0,0,0,1)] z-10 flex items-center justify-center"
        >
          {/* Single thin sweep line at the bottom edge of the curtain */}
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/60 to-transparent" />
        </motion.div>
      </section>

      {/* ============================================ */}
      {/* SECTION 4: HOW IT WORKS - PIPELINE */}
      {/* ============================================ */}
      <section className="py-20 sm:py-24 md:py-28 lg:py-32 container mx-auto px-4 relative overflow-hidden bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center mb-16 sm:mb-20 md:mb-24 relative z-10"
        >
          <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-xs text-slate-400 mb-6 sm:mb-8 tracking-wider uppercase backdrop-blur-md">
            [ HOW IT WORKS ]
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 tracking-tighter text-white px-4">
            The <span className="text-cyan-400 drop-shadow-sm">Automated</span> Pipeline.
          </h2>
          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto font-medium px-4">
            Watch how raw engineering data transforms into a fully compliant tax claim.
          </p>
          </motion.div>

        <div className="relative max-w-6xl mx-auto mt-8 sm:mt-12">
          
          {/* Animated Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[120px] left-[15%] w-[70%] h-[2px] bg-slate-800 -z-10">
            {/* The actual laser beam */}
            <motion.div 
              animate={{ left: ["0%", "100%", "0%"] }} 
              transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
              className="absolute top-1/2 -translate-y-1/2 w-[100px] h-[4px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] rounded-full"
            />
            {/* Particles flowing left to right */}
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ left: ["0%", "100%"], opacity: [0, 1, 0] }}
                transition={{ duration: 3, ease: "linear", repeat: Infinity, delay: i * 0.6 }}
                className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_10px_#fff]"
              />
            ))}
          </div>

          {/* Animated Connecting Line (Mobile Vertical) */}
          <div className="block lg:hidden absolute top-[80px] bottom-[14%] left-1/2 -translate-x-1/2 w-[2px] bg-slate-800/80 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_92%,transparent_100%)]">
            {/* Background nodes for the line */}
            <div className="absolute top-[16.6%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800" />
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800" />
            <div className="absolute top-[83.3%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-slate-800" />
            
            {/* The vertical laser beam */}
            <motion.div 
              animate={{ top: ["-10%", "110%"] }} 
              transition={{ duration: 3, ease: "linear", repeat: Infinity }}
              className="absolute left-1/2 -translate-x-1/2 h-[150px] w-[4px] bg-gradient-to-b from-transparent via-cyan-400 to-transparent shadow-[0_0_20px_#22d3ee] rounded-full"
            />
          </div>

          <div className="relative z-10 flex flex-col gap-24 lg:gap-32 w-full mt-12 sm:mt-16">
            {/* Step 1: Ingestion & Tracking (Left-aligned, offset visual) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center w-full"
            >
              {/* Content Side */}
              <div className="w-full lg:w-1/2 text-left">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80 mb-3 block">
                  Phase 01 // Data Ingestion
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-4 leading-none">
                  Log activity without administrative overhead.
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Simply write your regular engineering notes or connect standard codebases. GrantAI streams Jira tickets, GitHub commits, and pipeline metadata directly in real-time, matching active tasks against strict tax rules.
                </p>
                <div className="flex gap-4 items-center">
                  <div className="flex -space-x-2">
                    <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-mono text-[10px] font-black text-[#0052CC]">Jira</span>
                    <span className="w-8 h-8 rounded-lg bg-slate-900 border border-white/10 flex items-center justify-center font-mono text-[10px] font-black text-[#F05032]">Git</span>
                  </div>
                  <span className="text-xs font-mono text-slate-500">Auto-synced via webhook protocols</span>
                </div>
              </div>

              {/* Visual Terminal Side */}
              <div className="w-full lg:w-1/2 p-[1px] bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden bg-slate-950/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/60">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/40" />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">ingestion_stream.log</span>
                </div>
                <div className="p-5 font-mono text-[11px] sm:text-xs text-slate-400 text-left space-y-2.5 h-[180px] overflow-hidden select-none">
                  <div className="flex items-center justify-between border-b border-white/5 pb-1 text-slate-500">
                    <span>PROTOCOL: SECURE_WEBHOOK</span>
                    <span>STATUS: ACTIVE</span>
                  </div>
                  <div className="flex gap-3 text-cyan-400/80">
                    <span className="shrink-0 text-slate-600">[14:02:11]</span>
                    <span>git commit -m "refactored AST parsing core to prevent infinite loop recursion"</span>
                  </div>
                  <div className="flex gap-3 text-slate-400">
                    <span className="shrink-0 text-slate-600">[14:02:12]</span>
                    <span>└─ File modified: src/interpreter/parser.go (Lines +89, -24)</span>
                  </div>
                  <div className="flex gap-3 text-slate-400">
                    <span className="shrink-0 text-slate-600">[14:03:00]</span>
                    <span>└─ Parsing completed in 24ms. Frascati metric evaluation triggered.</span>
                  </div>
                  <div className="flex gap-3 text-emerald-400/80">
                    <span className="shrink-0 text-slate-600">[14:03:01]</span>
                    <span>jira RD-284 status update: "In Progress" &rarr; "Code Review"</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 2: Two-Pass Verification (Right-aligned, offset visual) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col lg:flex-row-reverse gap-12 lg:gap-16 items-center w-full"
            >
              {/* Content Side */}
              <div className="w-full lg:w-1/2 text-left">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80 mb-3 block">
                  Phase 02 // Cognitive Compliance
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-4 leading-none">
                  Two-pass cognitive verification engine.
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  Our dual-engine model processes raw activity data. The first pass maps tasks directly to strict Frascati Manual standards, and the second pass executes logical verification of technical uncertainty, producing audit-proof justifications.
                </p>
                <div className="inline-block px-3 py-1 bg-slate-900 border border-white/10 rounded font-mono text-[10px] sm:text-xs text-slate-400 tracking-wider uppercase">
                  [ ACCURACY CONFIDENCE SCORE: 99.8% ]
                </div>
              </div>

              {/* Visual Split-Panel Side */}
              <div className="w-full lg:w-1/2 p-[1px] bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden bg-slate-950/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/60">
                  <span className="font-mono text-[10px] text-slate-500">RAW ACTIVITY INPUT</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-mono text-[10px] text-emerald-400">COMPLIANT R&D CLAIM TRANSLATION</span>
                </div>
                <div className="grid grid-cols-2 h-[180px] font-mono text-[10px] sm:text-[11px] select-none text-left">
                  {/* Left Raw Col */}
                  <div className="p-4 border-r border-white/5 text-slate-500 space-y-2">
                    <div className="text-[9px] font-bold text-slate-600 uppercase">Developer Git Log</div>
                    <div className="bg-white/2 p-2 rounded border border-white/5 text-slate-400 leading-normal">
                      "refactored AST parser logic to optimize memory utilization and prevent infinite loop crashes in interpreter execution."
                    </div>
                  </div>
                  {/* Right Compliance Col */}
                  <div className="p-4 text-emerald-400/80 space-y-2">
                    <div className="text-[9px] font-bold text-slate-600 uppercase">Frascati Narrative</div>
                    <div className="bg-emerald-500/5 p-2 rounded border border-emerald-500/10 text-emerald-400/80 leading-normal">
                      "Designed a novel recursive parsing methodology under technical uncertainty to resolve system-critical recursion failures."
                    </div>
                    <div className="text-[9px] font-mono text-slate-500 mt-1 flex items-center justify-between">
                      <span>FRASCATI STAT: EXEMPT</span>
                      <span className="text-emerald-400 font-bold">[VERIFIED]</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Step 3: Real-time Capital Aggregation (Left-aligned, offset visual) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center w-full"
            >
              {/* Content Side */}
              <div className="w-full lg:w-1/2 text-left">
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-cyan-400/80 mb-3 block">
                  Phase 03 // Deterministic Core
                </span>
                <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-4 leading-none">
                  Deterministic math ledger processing.
                </h3>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-6">
                  No guesswork or fuzzy estimations. Qualified hours and R&D capital are computed with a deterministic ledger math engine, generating an audit-ready tax claim compliant with local government guidelines.
                </p>
                <div className="flex gap-4 items-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-mono text-slate-400">Deterministic verification checklist complete</span>
                </div>
              </div>

              {/* Visual Ledger Sheet Side */}
              <div className="w-full lg:w-1/2 p-[1px] bg-white/5 border border-white/10 rounded-2xl relative overflow-hidden bg-slate-950/80 backdrop-blur-xl">
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-slate-900/60">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">ledger_sheet.tbl</span>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-500/10">EUR_BASE</span>
                </div>
                <div className="p-4 font-mono text-[10px] sm:text-xs select-none">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-500 font-bold text-[9px] uppercase tracking-wider">
                        <th className="pb-2">R&D PROJECT_ID</th>
                        <th className="pb-2 text-right">QUAL_HOURS</th>
                        <th className="pb-2 text-right">BASE_SALARY</th>
                        <th className="pb-2 text-right">TAX_CREDIT</th>
                      </tr>
                    </thead>
                    <tbody className="text-slate-400">
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-cyan-400">RD-101 (AST Parser)</td>
                        <td className="py-2.5 text-right">240.0</td>
                        <td className="py-2.5 text-right">€94,500.00</td>
                        <td className="py-2.5 text-right font-bold text-white">€32,450.00</td>
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="py-2.5 text-cyan-400">RD-105 (Dual Engine)</td>
                        <td className="py-2.5 text-right">180.0</td>
                        <td className="py-2.5 text-right">€112,000.00</td>
                        <td className="py-2.5 text-right font-bold text-white">€30,240.00</td>
                      </tr>
                      <tr className="text-white font-bold">
                        <td className="pt-3">CLAIM AGGREGATE</td>
                        <td className="pt-3 text-right text-slate-500">420.0</td>
                        <td className="pt-3 text-right">---</td>
                        <td className="pt-3 text-right text-emerald-400">€62,690.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* HORIZONTAL SCROLL SECTION */}
      {/* Vertical scroll triggers horizontal movement */}
      {/* ============================================ */}
      <HorizontalScrollSection />

      {/* 4. PRICING AESTHETIC - WOW EDITION */}
      <section id="pricing" className="py-32 container mx-auto px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vw] h-[200vw] max-w-[1000px] max-h-[1000px] bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)] -z-10 rounded-full" />
        
        <div className="text-center mb-24 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tighter">
              Transparent <span className="text-cyan-400 drop-shadow-sm">Pricing.</span>
            </h2>
            <p className="text-slate-400 text-xl max-w-xl mx-auto font-medium">
              No hidden fees. Scale as you grow and completely automate your compliance.
            </p>
          </motion.div>
        </div>

        <div className="relative">
          <motion.div 
            ref={pricingCarouselRef}
            className="flex md:grid flex-row md:grid-cols-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory md:snap-none gap-5 md:gap-8 lg:gap-10 max-w-7xl mx-auto items-center pb-8 md:pb-0 px-[7.5vw] md:px-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.2 } }
            }}
          >
            {/* Plan 1: Manual / Free */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -10 }}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center glass-card p-8 sm:p-10 lg:p-12 rounded-[32px] sm:rounded-[40px] border border-white/5 hover:border-white/10 transition-all duration-500 bg-slate-900/40 relative z-10 opacity-80 hover:opacity-100"
            >
              <div className="text-xs sm:text-sm font-bold text-slate-500 mb-3 uppercase tracking-widest">Manual / Free</div>
              <div className="text-5xl sm:text-6xl font-black mb-8 text-white">$0<span className="text-xl sm:text-2xl text-slate-500 font-medium">/mo</span></div>
              <ul className="space-y-4 sm:space-y-5 text-slate-400 mb-10 sm:mb-12 font-medium text-sm sm:text-base">
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600 rounded-full shrink-0"/> Basic project tracking</li>
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600 rounded-full shrink-0"/> Expense logging</li>
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-slate-600 rounded-full shrink-0"/> Final manual calculation</li>
              </ul>
              <button className="w-full py-3.5 sm:py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-colors text-sm sm:text-base">
                Get Started
              </button>
            </motion.div>

            {/* Plan 2: SaaS Subscription (PRO) */}
            <motion.div 
              variants={itemVariants} 
              whileHover={{ y: -10 }}
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center glass-card p-8 sm:p-10 lg:p-12 rounded-[32px] sm:rounded-[40px] border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-500 bg-slate-900/60 relative z-10 group shadow-[0_0_30px_rgba(6,182,212,0.05)] hover:shadow-[0_0_50px_rgba(6,182,212,0.1)] overflow-hidden"
            >
              {/* Premium Floating Badge */}
              <motion.div 
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-0 px-4 sm:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-cyan-400 to-cyan-600 text-white text-xs sm:text-sm font-black tracking-widest rounded-bl-[20px] sm:rounded-bl-3xl shadow-[0_0_20px_rgba(6,182,212,0.5)] border-b border-l border-white/20 uppercase"
              >
                Popular
              </motion.div>
              <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-cyan-500/10 blur-[60px] sm:blur-[80px] rounded-full -z-10 group-hover:bg-cyan-500/20 transition-all duration-500" />
              <div className="text-xs sm:text-sm font-bold text-cyan-400 mb-3 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">SaaS Subscription</div>
              <div className="text-5xl sm:text-6xl font-black mb-6 sm:mb-8 text-white">$29<span className="text-xl sm:text-2xl text-slate-500 font-medium">/mo</span></div>
              <div className="text-xs sm:text-sm text-slate-400 mb-6 sm:mb-8 font-medium -mt-2 sm:-mt-4">Per team, up to 10 engineers</div>
              <ul className="space-y-4 sm:space-y-5 text-slate-300 mb-10 sm:mb-12 font-medium text-sm sm:text-base">
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4] shrink-0"/> Unlimited daily logs </li>
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4] shrink-0"/> Real-time value Dashboard</li>
                <li className="flex items-center gap-3 sm:gap-4"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-cyan-500 rounded-full shadow-[0_0_8px_#06b6d4] shrink-0"/> Priority email support</li>
              </ul>
              <button onClick={() => handlePlanSelect("pro")} className="w-full py-3.5 sm:py-4 rounded-full bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 font-bold transition-all border border-cyan-500/20 group-hover:border-cyan-400 text-sm sm:text-base">
                Start Tracking
              </button>
            </motion.div>

            {/* Plan 3: AI ENTERPRISE (The WOW effect) */}
            <motion.div 
              variants={itemVariants} 
              className="w-[85vw] max-w-[340px] md:w-auto shrink-0 snap-center relative p-[2px] rounded-[34px] sm:rounded-[42px] overflow-hidden group shadow-[0_0_40px_rgba(6,182,212,0.15)] md:shadow-[0_0_80px_rgba(6,182,212,0.2)] md:scale-[1.05] z-20"
            >
              {/* Spinning Border Gradient Beam */}
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0_200deg,rgba(6,182,212,1)_360deg)] animate-[spin_3s_linear_infinite]"
              />
              
              <div className="relative glass-card p-8 sm:p-10 lg:p-12 rounded-[32px] sm:rounded-[40px] bg-slate-950 h-full overflow-hidden flex flex-col justify-between">
                {/* Internal Ambient Glow */}
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.15),transparent_70%)] -z-10 group-hover:bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.3),transparent_70%)] transition-colors duration-700" />
                
                <div>
                  <div className="text-xs sm:text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-white mb-3 uppercase tracking-widest flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400" /> AI Enterprise
                  </div>
                  <div className="text-5xl sm:text-6xl font-black mb-8 text-white drop-shadow-md">$99<span className="text-xl sm:text-2xl text-cyan-400/80 font-medium">/claim</span></div>
                  
                  <ul className="space-y-4 sm:space-y-6 text-white mb-10 sm:mb-12 font-medium text-sm sm:text-base">
                    <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3 sm:gap-4 transition-transform"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45 shrink-0"/> Automated claim filing</motion.li>
                    <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3 sm:gap-4 transition-transform"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45 shrink-0"/> Unlimited daily users</motion.li>
                    <motion.li whileHover={{ x: 5 }} className="flex items-center gap-3 sm:gap-4 transition-transform"><div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-cyan-400 rounded-sm shadow-[0_0_12px_#22d3ee] rotate-45 shrink-0"/> Audit Defense Guarantee</motion.li>
                  </ul>
                </div>
                
                <button onClick={() => handlePlanSelect("enterprise")} className="relative w-full py-4 sm:py-5 rounded-full bg-white text-black font-black text-base sm:text-lg transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:shadow-[0_0_50px_rgba(255,255,255,0.5)] hover:bg-slate-100 active:scale-95 group/btn overflow-hidden mt-6">
                  <span className="relative z-10 flex items-center justify-center gap-2">Automate Now <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover/btn:translate-x-1 transition-transform"/></span>
                </button>
              </div>
            </motion.div>
          </motion.div>

          {/* Swipe Hint Indicator (Mobile Only) */}
          <div className="md:hidden flex justify-center items-center gap-3 mt-4 text-slate-500 text-[10px] uppercase tracking-[0.2em] font-bold">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent to-slate-600" />
            <span className="animate-pulse">Swipe Plans</span>
            <div className="w-8 h-[1px] bg-gradient-to-l from-transparent to-slate-600" />
          </div>
        </div>
      </section>

      {/* 5. FINAL CTA - MINIMALIST PREMIUM EDITION */}
      <section className="py-40 container mx-auto px-4 mb-20 relative flex items-center justify-center min-h-[60vh]">
        {/* Background Ambient Pulse */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120vw] h-[120vw] max-w-[600px] max-h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none"
        />

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative w-full max-w-4xl"
        >
          {/* Logo badge positioned top center, half in and half out */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
            <div className="w-16 h-16 rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center shadow-[0_8px_32px_rgba(0,0,0,0.8)] transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 group">
              <Logo className="w-9 h-9" />
            </div>
          </div>

          <div className="relative w-full rounded-[32px] bg-slate-950 border border-white/10 p-12 md:p-20 overflow-hidden z-10 flex flex-col items-center justify-center shadow-[0_24px_80px_rgba(0,0,0,0.6)]">
            
            {/* Tech Grid Overlay - Very low-key */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] opacity-25 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] pointer-events-none" />

            {/* Floating Holographic Chips - Refined Minimalist Style */}
            <div className="absolute top-6 left-6 px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2 hidden md:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">JIRA CONNECTED</span>
            </div>

            <div className="absolute bottom-6 right-6 px-3.5 py-1.5 rounded-lg bg-white/[0.02] border border-white/5 flex items-center gap-2 hidden md:flex">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-500/80" />
              <span className="text-[9px] font-mono font-bold text-slate-400 tracking-wider">READY FOR AUDIT</span>
            </div>

            {/* Actual Content Area */}
            <div className="relative z-30 max-w-2xl flex flex-col items-center pt-8 pb-4">
              <motion.h2 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1, duration: 0.6 }}
                className="text-4xl md:text-6xl font-black mb-6 tracking-tighter text-white text-center leading-[1.1] font-sans"
              >
                Ready to automate your <br/>
                <span className="text-cyan-400">
                  R&D Claim?
                </span>
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-slate-400 text-lg md:text-xl font-normal max-w-md mx-auto text-center mb-10 leading-relaxed"
              >
                Join elite engineering teams generating their tax credits with zero manual effort.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="relative z-40 w-full sm:w-auto"
              >
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })} 
                  className="group relative px-8 py-4.5 md:px-10 md:py-5 rounded-full bg-white text-slate-950 font-bold text-lg md:text-xl overflow-hidden flex items-center justify-center gap-3 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_24px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.6)] w-full sm:w-auto"
                >
                  <span className="whitespace-nowrap">Start Tracking Daily Value</span>
                  <ArrowRight className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Payment Method Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPaymentModalOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-[#060913] border border-cyan-500/20 rounded-3xl p-8 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden"
          >
            {/* Ambient glow inside modal */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-cyan-500/10 blur-[50px] rounded-full pointer-events-none" />
            
            <button 
              onClick={() => setIsPaymentModalOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-center mb-8 relative z-10">
              <h3 className="text-2xl font-black text-white mb-2">Select Payment Method</h3>
              <p className="text-slate-400 text-sm font-medium">Choose how you'd like to pay for the {selectedPlan === "pro" ? "SaaS Subscription" : "AI Enterprise"} plan.</p>
            </div>

            <div className="space-y-4 relative z-10">
              {/* Stripe Button */}
              <button 
                onClick={() => handleCheckout('stripe')}
                disabled={isLoading !== null}
                className="w-full relative group overflow-hidden rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500/50 p-4 flex items-center justify-between transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 flex items-center justify-center border border-[#635BFF]/20 group-hover:border-[#635BFF]/40 transition-colors">
                    <CreditCard className="w-6 h-6 text-[#635BFF]" />
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold text-lg">Pay with Card</div>
                    <div className="text-slate-400 text-xs font-medium">Powered by Stripe</div>
                  </div>
                </div>
                <div className="relative z-10">
                  {isLoading === 'stripe' ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                  )}
                </div>
              </button>

              {/* Crypto Button */}
              <button 
                onClick={() => handleCheckout('nowpayments')}
                disabled={isLoading !== null}
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
                  {isLoading === 'nowpayments' ? (
                    <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                  )}
                </div>
              </button>
            </div>
            
            <div className="mt-6 text-center text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Secure Encrypted Checkout
            </div>
          </motion.div>
        </div>
      )}

      <SiteFooter />
    </MainLayout>
  );
}
