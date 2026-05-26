import { describe, it, expect } from "vitest";
import { calculateTaxBenefit, getJurisdictionByCountry } from "../lib/rd-engine/tax-engine";

describe("R&D Tax Engine", () => {
  it("should return 0 benefit if R&D cost is <= 0", () => {
    const benefit = calculateTaxBenefit({
      jurisdictionCode: "NL",
      scheme: "WBSO",
      rdCostEur: 0,
    });
    expect(benefit).toBe(0);
  });

  it("should calculate WBSO Standard (NL) correctly", () => {
    // Under 350k: 32%
    const benefitUnder = calculateTaxBenefit({
      jurisdictionCode: "NL",
      scheme: "WBSO",
      rdCostEur: 100000,
    });
    expect(benefitUnder).toBe(32000);

    // Over 350k: 32% of 350k + 16% of excess
    const benefitOver = calculateTaxBenefit({
      jurisdictionCode: "NL",
      scheme: "WBSO",
      rdCostEur: 500000,
    });
    // 350000 * 0.32 = 112000
    // 150000 * 0.16 = 24000
    // Total = 136000
    expect(benefitOver).toBe(136000);
  });

  it("should calculate WBSO Starter (NL) correctly", () => {
    // Under 350k: 40%
    const benefitUnder = calculateTaxBenefit({
      jurisdictionCode: "NL",
      scheme: "WBSO_STARTER",
      rdCostEur: 100000,
    });
    expect(benefitUnder).toBe(40000);
  });

  it("should calculate UK SME scheme correctly", () => {
    // Profitable SME: 21.5%
    const benefitProfitable = calculateTaxBenefit({
      jurisdictionCode: "UK",
      scheme: "UK_SME",
      rdCostEur: 100000,
      isProfitable: true,
    });
    expect(benefitProfitable).toBe(21500);

    // Loss-making SME: 14.5% surrenderable credit
    const benefitLoss = calculateTaxBenefit({
      jurisdictionCode: "UK",
      scheme: "UK_SME",
      rdCostEur: 100000,
      isProfitable: false,
    });
    expect(benefitLoss).toBe(14500);
  });

  it("should calculate German FZulG correctly with €4M cap", () => {
    // Under cap: 25%
    const benefitUnder = calculateTaxBenefit({
      jurisdictionCode: "DE",
      scheme: "DE_FZULG",
      rdCostEur: 2000000,
    });
    expect(benefitUnder).toBe(500000);

    // Over cap: 25% of €4M max (max €1M benefit)
    const benefitOver = calculateTaxBenefit({
      jurisdictionCode: "DE",
      scheme: "DE_FZULG",
      rdCostEur: 6000000,
    });
    expect(benefitOver).toBe(1000000);
  });

  it("should map country names to jurisdictions correctly", () => {
    const jurNL = getJurisdictionByCountry("Netherlands");
    expect(jurNL?.code).toBe("NL");

    const jurDE = getJurisdictionByCountry("Germany");
    expect(jurDE?.code).toBe("DE");

    const jurUS = getJurisdictionByCountry("US");
    expect(jurUS?.code).toBe("US");

    const jurManual = getJurisdictionByCountry("Some Fake Country");
    expect(jurManual?.code).toBe("MANUAL");
  });
});
