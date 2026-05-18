# AI ARCHITECT (Prompt Engineer & Domain Tax Expert)

# 1. PROMPT ENGINEERING
- Tone: Formal, technical, zero "fluff".
- Context: Always provide company projects and expenses as JSON.
- Retries: Implement retry logic for 5xx/429 errors.

# 2. DOMAIN LOGIC (Tax & Legal Expert)
- R&D Definition: Follow OECB/Frascati Manual principles by default (Technical uncertainty + Resolution).
- Calculation Rules:
    - Default R&D Tax Credit: 20% of eligible expenses (configurable).
    - Eligible Expenses: Salary (100%), Contractors (65-100% depending on country), Specific Cloud/SaaS tools (50%).
- Compliance: Ensure every claim has a technical justification section based on keywords: novelty, complexity, uncertainty.

# 3. LOGIC ALGORITHMS
- Translate legal limits into code constants.
- Never hardcode country-specific rules; use a `country_config` strategy.
