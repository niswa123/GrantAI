import { classifyWorkLog } from "../src/lib/llm/classifier";

// ─── ТЕСТОВЫЙ ДАТАСЕТ (50 логов) ──────────────────────────────────────────

const DATASET = [
  // --- ЯВНЫЙ R&D (High Complexity, Technical Uncertainty) ---
  {
    expected: "R&D",
    text: "Implemented a custom polyhedral compilation pass to fuse variable-length tensor operations on the edge TPU. Existing LLVM passes couldn't handle the dynamic control flow without catastrophic memory spilling. Achieved 40% speedup after 3 weeks of algorithmic iterations.",
  },
  {
    expected: "R&D",
    text: "Developed a differential privacy preserving federated learning aggregator. The core uncertainty was reducing the noise impact on the global model convergence rate. Designed a novel adaptive noise calibration heuristic.",
  },
  {
    expected: "R&D",
    text: "Researched and built a distributed lock manager over a lossy network protocol for IoT devices. Standard Raft/Paxos implementations required too much bandwidth. We created a custom lightweight consensus algorithm with probabilistic guarantees.",
  },
  {
    expected: "R&D",
    text: "Investigated electrochemical sensor degradation in high-salinity environments. Synthesized 15 novel polymer coatings to prevent bio-fouling while maintaining ion permeability. Iteration 12 showed a 5x lifespan increase.",
  },
  {
    expected: "R&D",
    text: "Created a real-time ray-tracing denoiser for mobile GPUs. Since hardware acceleration isn't available, we designed a temporal accumulation algorithm combined with a lightweight neural network. Solved the ghosting artifact problem in high-motion scenes.",
  },
  {
    expected: "R&D",
    text: "Designed a new biometric hashing function to securely store fingerprint templates without revealing the original minutiae points. Standard cryptographic hashes cannot handle the fuzzy matching requirement. Developed a custom locality-sensitive hashing variant.",
  },
  {
    expected: "R&D",
    text: "Built a predictive maintenance model for wind turbine gearboxes using acoustic emission data. The challenge was filtering out the background noise of the wind itself, which overlaps with the early-stage failure frequencies. Developed a custom wavelet transform approach.",
  },
  {
    expected: "R&D",
    text: "Researched a novel method for zero-knowledge proofs (ZK-SNARKs) aggregation to reduce gas costs on Ethereum by a factor of 10. The underlying mathematical challenge was optimizing the polynomial commitment scheme for our specific circuit structure.",
  },
  {
    expected: "R&D",
    text: "Developed a new algorithm for autonomous drone swarm navigation in GPS-denied environments. Used a decentralized visual-inertial SLAM approach where drones share partial maps. Addressed the challenge of loop closure across different drone perspectives.",
  },
  {
    expected: "R&D",
    text: "Investigated using quantum annealing to optimize complex logistics routing problems. The uncertainty was formulating our specific constraint set into a Quadratic Unconstrained Binary Optimization (QUBO) model that fits on current quantum hardware.",
  },

  // --- ПОГРАНИЧНЫЕ СЛУЧАИ (Borderline - often false positives) ---
  {
    expected: "Not R&D", // Performance tuning, but using standard methods
    text: "Optimized Postgres database performance by adding composite indexes and materialized views. Rewrote the slowest 5 queries using window functions. Reduced p99 latency from 2s to 150ms.",
  },
  {
    expected: "Not R&D", // Complex integration, but no scientific uncertainty
    text: "Integrated the legacy SOAP billing system with the new microservices architecture. Built an anti-corruption layer in Node.js to translate the XML payloads to JSON and handle connection retries and circuit breaking.",
  },
  {
    expected: "Not R&D", // Standard ML application
    text: "Trained a churn prediction model using XGBoost on our customer interaction data. Performed feature engineering, tuned hyperparameters using grid search, and deployed the model via a FastAPI endpoint.",
  },
  {
    expected: "Not R&D", // Infrastructure scaling
    text: "Migrated our monolithic backend to Kubernetes. Set up horizontal pod autoscaling based on CPU metrics. Configured Prometheus for monitoring and Grafana for dashboards. Solved several networking issues with the ingress controller.",
  },
  {
    expected: "Not R&D", // Routine bug fix of a complex issue
    text: "Investigated and fixed a race condition in the payment processing webhook handler. Requests were sometimes arriving out of order, causing double billing. Added a distributed Redis lock around the transaction block.",
  },

  // --- ЯВНАЯ РУТИНА (Routine / Commercial - should NEVER be R&D) ---
  { expected: "Not R&D", text: "Added a new 'Forgot Password' flow to the mobile app. Created the UI screens, wired up the Firebase Auth API, and added unit tests." },
  { expected: "Not R&D", text: "Updated the React Native app to version 0.72. Fixed several breaking changes in the navigation library and updated third-party dependencies." },
  { expected: "Not R&D", text: "Changed the primary button color from blue to green across the entire web application based on the new branding guidelines. Updated CSS variables." },
  { expected: "Not R&D", text: "Fixed a typo in the user onboarding email template. 'Welcom' -> 'Welcome'." },
  { expected: "Not R&D", text: "Attended sprint planning meeting, backlog grooming, and daily standups. Reviewed 3 pull requests from junior developers." },
  { expected: "Not R&D", text: "Created a CRUD API for managing blog posts in the admin panel. Added routes for create, read, update, and delete using Express and Prisma." },
  { expected: "Not R&D", text: "Integrated Stripe Checkout for the new subscription tier. Handled the success and cancel callbacks." },
  { expected: "Not R&D", text: "Wrote end-to-end tests using Cypress for the login and registration flows. Set up GitHub Actions to run the tests on every pull request." },
  { expected: "Not R&D", text: "Updated the documentation in the README file to include instructions on how to set up the local development environment." },
  { expected: "Not R&D", text: "Refactored the User component to use React Hooks instead of class lifecycle methods. No changes to business logic." },
  { expected: "Not R&D", text: "Added Google Analytics tracking scripts to the landing page to measure conversion rates." },
  { expected: "Not R&D", text: "Exported a database dump from the production environment, anonymized the user data, and loaded it into the staging environment for testing." },
  { expected: "Not R&D", text: "Created a new Jira epic for the upcoming Q3 marketing campaign features and broke it down into 15 individual user stories." },
  { expected: "Not R&D", text: "Resized and compressed the hero images on the homepage to improve the Google Lighthouse performance score." },
  { expected: "Not R&D", text: "Deployed the latest hotfix to the production servers using our standard Jenkins pipeline." },

  // --- ДОПОЛНИТЕЛЬНЫЕ ПРИМЕРЫ (СМЕШАННЫЕ) ---
  { expected: "R&D", text: "Researched a new NLP approach for summarizing legal contracts using a custom sparse attention mechanism, as standard Transformers hit memory limits on 100k+ token documents. Validation showed 15% better ROUGE scores." },
  { expected: "Not R&D", text: "Used the OpenAI API to add a 'Summarize' button to the text editor. Passed the user's text to the gpt-4 model and displayed the result." },
  { expected: "R&D", text: "Developed a novel video compression heuristic tailored specifically for surgical laparoscopy streams, reducing bandwidth by 30% without losing diagnostic-critical high-frequency details. Standard h.265 profiles were insufficient." },
  { expected: "Not R&D", text: "Configured FFmpeg to transcode user-uploaded videos into multiple resolutions (1080p, 720p, 480p) for adaptive bitrate streaming." },
  { expected: "R&D", text: "Investigated causes of early delamination in 3D-printed composite materials. Designed a systematic series of experiments varying extruder temperature, cooling rate, and fiber volume fraction. Discovered a non-linear relationship affecting layer adhesion." },
  { expected: "Not R&D", text: "Calibrated the 3D printer and replaced the worn-out extruder nozzle. Printed 50 plastic casings for the new hardware prototypes." },
  { expected: "R&D", text: "Designed a custom low-power wake-up radio circuit for wildlife tracking collars. Existing commercial chips consumed too much idle current. Achieved 500nA standby power through a novel passive envelope detector architecture." },
  { expected: "Not R&D", text: "Designed the PCB layout for the wildlife tracking collar using Altium Designer, integrating standard components according to their datasheet reference designs." },
  { expected: "R&D", text: "Created a new rendering algorithm for volumetric clouds in our game engine that calculates multiple scattering of light in real-time. Traditional raymarching was too slow; we developed a stochastic approximation technique based on temporal reprojection." },
  { expected: "Not R&D", text: "Imported 3D cloud assets from the Unreal Marketplace into our level. Placed them around the environment and adjusted the lighting to match the time of day." }
];

// ─── ОЦЕНОЧНЫЙ СКРИПТ ───────────────────────────────────────────────────────

async function evaluate() {
  console.log(`🧪 Запуск оценки AI Pipeline на ${DATASET.length} логах...`);
  console.log("ВНИМАНИЕ: Для точных результатов установите KIE_API_KEY перед запуском!\n");

  let correct = 0;
  let falsePositives = 0;
  let falseNegatives = 0;

  for (let i = 0; i < DATASET.length; i++) {
    const item = DATASET[i];
    try {
      // Имитируем вызов пайплайна
      const result = await classifyWorkLog(item.text);
      const actual = result.classification; // 'R&D' или 'Not R&D'

      if (actual === item.expected) {
        correct++;
        process.stdout.write("✅ ");
      } else {
        process.stdout.write("❌ ");
        if (actual === "R&D" && item.expected === "Not R&D") {
          falsePositives++;
          console.log(`\n[FALSE POSITIVE] Ожидалось: Not R&D, Получено: R&D`);
        } else {
          falseNegatives++;
          console.log(`\n[FALSE NEGATIVE] Ожидалось: R&D, Получено: Not R&D`);
        }
        console.log(`Текст: "${item.text.slice(0, 80)}..."`);
        console.log(`Объяснение LLM: ${result.explanation}\n`);
      }
    } catch (e) {
      console.error(`\nОшибка на логе ${i}:`, (e as any).message);
    }
  }

  const accuracy = (correct / DATASET.length) * 100;
  
  console.log("\n" + "=".repeat(50));
  console.log("📊 РЕЗУЛЬТАТЫ КАЛИБРОВКИ");
  console.log("=".repeat(50));
  console.log(`Всего тестов:     ${DATASET.length}`);
  console.log(`Точность (Accuracy): ${accuracy.toFixed(1)}%`);
  console.log(`False Positives:  ${falsePositives} (Рутина, названная R&D)`);
  console.log(`False Negatives:  ${falseNegatives} (R&D, названный Рутиной)`);
  console.log("=".repeat(50));

  if (falsePositives > 0) {
    console.log("\n⚠️ ВНИМАНИЕ: Найдены False Positives.");
    console.log("Рекомендация: Откройте src/lib/llm/classifier.ts и добавьте более строгие");
    console.log("ограничения в SYSTEM_PROMPT для отсечения рутинных интеграций и багфиксов.");
  }
}

evaluate();
