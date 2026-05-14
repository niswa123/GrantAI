/**
 * Few-Shot Examples Registry
 *
 * Curated real-world R&D classification examples used to guide the LLM.
 * These are injected into the classification prompt to dramatically improve accuracy.
 *
 * Sources: anonymized from real WBSO/HMRC/CIR approved and rejected claims.
 *
 * Format: { description, rd_score, is_rd, key_reason }
 */

export interface FewShotExample {
  description: string;
  rd_score: number;
  is_rd: boolean;
  key_reason: string;
  category: "software" | "hardware" | "ml_ai" | "biotech" | "process" | "routine";
}

// ─── QUALIFYING R&D EXAMPLES ───────────────────────────────────────────────

export const RD_POSITIVE_EXAMPLES: FewShotExample[] = [
  {
    description:
      "We developed a novel real-time anomaly detection system for industrial IoT sensors. Existing off-the-shelf solutions (Isolation Forest, LSTM autoencoders) failed to handle the non-stationary, multivariate time-series data from our manufacturing line due to concept drift and sensor correlation patterns unique to our domain. We designed and validated a hybrid architecture combining adaptive windowing with a custom attention mechanism, requiring 200+ experimental runs to tune the drift detection threshold without triggering false positives that would halt production.",
    rd_score: 0.87,
    is_rd: true,
    key_reason:
      "Genuine technical uncertainty: existing algorithms failed for domain-specific reasons. Systematic experimentation (200+ runs). Novel hybrid architecture not previously published.",
    category: "ml_ai",
  },
  {
    description:
      "Our team researched and implemented a new lossless compression algorithm for medical DICOM imaging data. The challenge was achieving 40%+ better compression than the DICOM standard while maintaining sub-millisecond decompression for real-time surgical imaging. We systematically tested novel entropy coding schemes, including a custom arithmetic coder with context modeling adapted from CABAC, and validated against a benchmark of 10,000 anonymized scans. Three approaches failed before the fourth iteration succeeded.",
    rd_score: 0.91,
    is_rd: true,
    key_reason:
      "Clear advance beyond state-of-the-art (DICOM standard). Multiple failed iterations documented. Novel entropy coding scheme. Specific performance targets that existing solutions could not meet.",
    category: "software",
  },
  {
    description:
      "We investigated applying reinforcement learning to adaptive supply chain routing under stochastic demand and multi-echelon constraints. No existing RL framework handled our constraint set (perishable goods, regulatory compliance windows, multi-modal transport). We designed a custom reward shaping methodology and validated it through simulation against 50 historical demand scenarios. The core uncertainty was whether RL could converge within operational planning cycles — it took 6 months of research to confirm feasibility.",
    rd_score: 0.85,
    is_rd: true,
    key_reason:
      "Fundamental uncertainty about RL convergence in constrained domain. Custom reward shaping methodology. Systematic validation against historical data. 6-month research timeline.",
    category: "ml_ai",
  },
  {
    description:
      "Developed a new compiler optimization pass for our domain-specific language targeting heterogeneous CPU/GPU execution. The challenge was automatic kernel fusion across data-dependent control flow — a problem known to be NP-hard in the general case. We designed a heuristic based on polyhedral analysis and profile-guided feedback, requiring deep research into loop dependency analysis and memory access pattern prediction. Existing LLVM passes could not handle our IR's dynamic dispatch semantics.",
    rd_score: 0.89,
    is_rd: true,
    key_reason:
      "NP-hard problem with no existing solution. Novel polyhedral heuristic. Existing tools (LLVM) explicitly insufficient. Deep technical uncertainty in kernel fusion across dynamic dispatch.",
    category: "software",
  },
  {
    description:
      "We built a novel privacy-preserving federated learning system where model updates are aggregated using homomorphic encryption. The technical challenge was reducing the computational overhead of HE operations from O(n³) to practical training times without sacrificing differential privacy guarantees. We researched and implemented a batched CKKS scheme with custom noise calibration, requiring collaboration with cryptography researchers and 4 prototype iterations.",
    rd_score: 0.93,
    is_rd: true,
    key_reason:
      "Cutting-edge cryptography applied to ML. Fundamental computational complexity challenge. Collaboration with domain experts. Multiple prototype iterations. Novel noise calibration approach.",
    category: "ml_ai",
  },
  {
    description:
      "Researched and developed a new electrochemical sensor for detecting sub-ppb concentrations of PFAS compounds in groundwater. Existing electrochemical methods lacked the sensitivity required by new EU regulations. We synthesized novel molecularly imprinted polymer (MIP) recognition elements and optimized the electrode surface functionalization through 80+ experimental trials, varying monomer ratios, polymerization conditions, and surface treatments.",
    rd_score: 0.94,
    is_rd: true,
    key_reason:
      "Novel material synthesis (MIP). Regulatory-driven performance gap. 80+ experimental trials. Fundamental chemistry uncertainty in polymer recognition selectivity.",
    category: "biotech",
  },
];

// ─── NON-QUALIFYING EXAMPLES ───────────────────────────────────────────────

export const RD_NEGATIVE_EXAMPLES: FewShotExample[] = [
  {
    description:
      "Migrated our backend from REST to GraphQL using Apollo Server. Updated all frontend queries to use the new schema. Fixed several N+1 query issues identified during the migration. Deployed to AWS using our existing CI/CD pipeline.",
    rd_score: 0.08,
    is_rd: false,
    key_reason:
      "Standard technology migration using well-documented tools (Apollo, GraphQL). N+1 fixes are routine optimization. No technical uncertainty — competent engineers follow established migration guides.",
    category: "routine",
  },
  {
    description:
      "Integrated Stripe payment processing into our e-commerce platform. Implemented webhook handling for payment events, added subscription billing logic, and built the checkout UI. Tested with Stripe's test mode and deployed to production.",
    rd_score: 0.05,
    is_rd: false,
    key_reason:
      "Standard API integration using Stripe's comprehensive documentation. No technical uncertainty — Stripe provides SDKs, examples, and support. This is routine commercial development.",
    category: "routine",
  },
  {
    description:
      "Built a CRUD dashboard for managing user accounts and permissions. Implemented role-based access control using an existing library (Casbin). Added audit logging, export to CSV functionality, and email notifications using SendGrid.",
    rd_score: 0.06,
    is_rd: false,
    key_reason:
      "Standard CRUD application. RBAC using existing library (Casbin). All components (audit logging, CSV export, email) are routine implementations with well-known solutions.",
    category: "routine",
  },
  {
    description:
      "Updated our React frontend from version 17 to 18. Migrated class components to functional components with hooks. Fixed breaking changes in the concurrent rendering mode. Updated all dependencies and resolved compatibility issues.",
    rd_score: 0.04,
    is_rd: false,
    key_reason:
      "Routine dependency upgrade following official React migration guide. No technical uncertainty — React provides detailed upgrade documentation. Standard maintenance activity.",
    category: "routine",
  },
  {
    description:
      "Implemented a recommendation engine using collaborative filtering with the Surprise library. Trained on our user interaction data, tuned hyperparameters using grid search, and deployed as a microservice. A/B tested against our existing rule-based system.",
    rd_score: 0.28,
    is_rd: false,
    key_reason:
      "Collaborative filtering is a well-established technique. Using existing library (Surprise). Hyperparameter tuning via grid search is standard practice. No genuine technical uncertainty — competent ML engineer can implement this using published methods.",
    category: "ml_ai",
  },
  {
    description:
      "Set up Kubernetes cluster on AWS EKS for our microservices. Configured auto-scaling, load balancing, and monitoring with Prometheus/Grafana. Migrated 12 services from Docker Compose to Kubernetes manifests. Implemented blue-green deployment strategy.",
    rd_score: 0.07,
    is_rd: false,
    key_reason:
      "Standard DevOps/infrastructure work. Kubernetes, EKS, Prometheus are mature technologies with extensive documentation. Blue-green deployment is a well-known pattern. No technical uncertainty.",
    category: "routine",
  },
];

// ─── BORDERLINE EXAMPLES (important for calibration) ──────────────────────

export const RD_BORDERLINE_EXAMPLES: FewShotExample[] = [
  {
    description:
      "Optimized our PostgreSQL database queries to handle 10x more concurrent users. Implemented custom indexing strategies, query plan analysis, and connection pooling. Reduced p99 latency from 2s to 150ms through systematic profiling and iterative optimization.",
    rd_score: 0.35,
    is_rd: false,
    key_reason:
      "Performance optimization using established techniques (indexing, connection pooling, query analysis). Systematic approach present but no genuine technical uncertainty — these are known optimization patterns. The outcome was predictable to a competent DBA.",
    category: "routine",
  },
  {
    description:
      "Developed a custom graph neural network architecture for predicting protein-ligand binding affinity. While GNNs are established, our specific challenge was handling variable-length molecular graphs with chirality-aware message passing — a problem where existing architectures (SchNet, DimeNet) showed systematic errors on our dataset. We designed a novel equivariant layer and validated against 3 benchmark datasets.",
    rd_score: 0.72,
    is_rd: true,
    key_reason:
      "Borderline positive: existing architectures (SchNet, DimeNet) explicitly failed. Novel equivariant layer design. Validation against benchmarks. The chirality-aware message passing represents genuine technical uncertainty beyond standard GNN application.",
    category: "ml_ai",
  },
];

// ─── Formatter for prompt injection ───────────────────────────────────────

/**
 * Format few-shot examples for injection into the classification prompt.
 * Returns a string block ready to be appended to the system or user message.
 */
export function formatFewShotExamples(options: {
  positiveCount?: number;
  negativeCount?: number;
  includeBorderline?: boolean;
} = {}): string {
  const { positiveCount = 3, negativeCount = 3, includeBorderline = true } = options;

  const positives = RD_POSITIVE_EXAMPLES.slice(0, positiveCount);
  const negatives = RD_NEGATIVE_EXAMPLES.slice(0, negativeCount);
  const borderlines = includeBorderline ? RD_BORDERLINE_EXAMPLES : [];

  const allExamples = [
    ...positives.map((e) => ({ ...e, label: "QUALIFIES AS R&D" })),
    ...negatives.map((e) => ({ ...e, label: "DOES NOT QUALIFY" })),
    ...borderlines.map((e) => ({ ...e, label: e.is_rd ? "BORDERLINE — QUALIFIES (with caveats)" : "BORDERLINE — DOES NOT QUALIFY" })),
  ];

  // Shuffle to avoid order bias
  const shuffled = allExamples.sort(() => Math.random() - 0.5);

  const formatted = shuffled.map((ex, i) => `
EXAMPLE ${i + 1}: [${ex.label}] — rd_score: ${ex.rd_score}
Description: "${ex.description.slice(0, 300)}${ex.description.length > 300 ? "..." : ""}"
Key reasoning: ${ex.key_reason}
`).join("\n");

  return `## CALIBRATION EXAMPLES (use these to calibrate your scoring)\n${formatted}\n## END OF EXAMPLES\n`;
}

/**
 * Get a compact few-shot block for shorter prompts (e.g., expense classification).
 */
export function getCompactExamples(count = 2): string {
  const pos = RD_POSITIVE_EXAMPLES.slice(0, count);
  const neg = RD_NEGATIVE_EXAMPLES.slice(0, count);

  return [
    ...pos.map((e) => `R&D (${e.rd_score}): "${e.description.slice(0, 150)}..." → ${e.key_reason}`),
    ...neg.map((e) => `NOT R&D (${e.rd_score}): "${e.description.slice(0, 150)}..." → ${e.key_reason}`),
  ].join("\n");
}
