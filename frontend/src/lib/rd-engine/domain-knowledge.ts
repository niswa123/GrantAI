import { getTaxRules } from "./legal_rules/tax-rules.registry";

export function getDomainKnowledge(countryCode: string): string {
  const rules = getTaxRules(countryCode);

  let specificKnowledge = "";

  if (countryCode === "NL") {
    specificKnowledge = `
WBSO (NETHERLANDS) SPECIFIC RULES:
- "Technically uncertain" means the outcome was genuinely unknown BEFORE the project start.
- De Belastingdienst specifically rejects: UI development, bug fixes, routine data migration, and integrating standard APIs (like Stripe, OpenAI, Salesforce).
- De Belastingdienst specifically accepts: novel algorithms, new software architectures bridging incompatible systems, custom ML models trained from scratch, and hardware-software co-design.
- The applicant must maintain a technical logbook (S&O-administratie).`;
  } else if (countryCode === "UK") {
    specificKnowledge = `
HMRC (UNITED KINGDOM) SPECIFIC RULES:
- The project must seek to achieve an advance in science or technology, not just in the company's own state of knowledge.
- The advance must be over the "baseline" of the whole industry.
- Routine analysis, copying, or adaptation of an existing product or process is explicitly excluded.
- System uncertainty (how components interact in a complex architecture) can qualify, even if individual components are known.`;
  } else if (countryCode === "FR") {
    specificKnowledge = `
CIR (FRANCE) SPECIFIC RULES:
- The DGFiP requires a very rigorous distinction between "innovation" (commercial) and "R&D" (technological).
- The project must overcome a "verrou technologique" (technological lock/hurdle).
- Merely improving performance using known optimization techniques does NOT overcome a verrou technologique.
- Extensive prototyping and testing must be documented to prove systematic experimentation.`;
  }

  return `## JURISDICTIONAL DOMAIN KNOWLEDGE (${rules.countryName}):
${specificKnowledge}
- General Rule: High complexity does NOT equal technical uncertainty.
`;
}
