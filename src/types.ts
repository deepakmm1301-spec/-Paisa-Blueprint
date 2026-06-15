export interface LoanDetails {
  homeLoan: number;
  personalLoan: number;
  carLoan: number;
  otherLoan: number;
  homeLoanRate?: number;
  personalLoanRate?: number;
  carLoanRate?: number;
  homeLoanTenure?: number;
  personalLoanTenure?: number;
  carLoanTenure?: number;
}

export interface InvestmentDetails {
  mutualFunds: number;
  stocks: number;
  gold: number;
  epf: number;
  ppf: number;
  nps: number;
  realEstate: number;
}

export interface UserProfile {
  id?: string;
  pin?: string;
  name: string;
  age: number;
  retirementAge: number;
  salary: number; // monthly gross
  city: "tier1" | "tier2" | "tier3"; // tier 1: Metro, tier 2: Town, tier 3: Rural/Semi-urban
  maritalStatus: "single" | "married" | "dependents";
  dependentsCount: number;
  currentSavings: number; // liquid
  loans: LoanDetails;
  investments: InvestmentDetails;
  monthlyExpenses: number;
  customSip?: number;
  healthInsuranceCover?: number;
  termInsuranceCover?: number;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface SalaryStructure {
  basic: number;
  da: number;
  hra: number;
  allowances: number;
  npsPercentage: number;
  npsDeduction: number;
  pfDeduction: number;
  gross: number;
  inHand: number;
  taxDeducted: number;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  yearsLeft: number;
  expectedReturn: number;
  inflationRate: number;
  category: "education" | "marriage" | "house" | "car" | "vacation" | "other";
}

export function getShareableLink(): string {
  try {
    let href = window.location.href;
    if (href && href.startsWith("http")) {
      // If we are on the development environment, rewrite to the public pre-view environments
      if (href.includes("ais-dev-")) {
        href = href.replace("ais-dev-", "ais-pre-");
      }
      if (
        !href.includes("localhost") &&
        !href.includes("127.0.0.1") &&
        !href.includes("about:srcdoc") &&
        !href.includes("about:blank")
      ) {
        return href;
      }
    }
  } catch (e) {
    // suppress
  }
  return "https://ais-pre-smf772g7msspcpbw4nc3rs-109224888067.asia-east1.run.app";
}

