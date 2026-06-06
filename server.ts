import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Persistent server-side accounts database
const ACCOUNTS_FILE = path.join(process.cwd(), "accounts-db.json");

interface ServerUserAccount {
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  profilesList: any[];
  activeProfileId: string;
  createdAt: string;
}

// Initial seed
const DEFAULT_ACCOUNT: ServerUserAccount = {
  email: "advisor@paisa.in",
  name: "Deepak Kumar (Scenario Model)",
  passwordHash: "paisa",
  profilesList: [
    {
      id: "profile-main",
      name: "Deepak Kumar (Scenario Model)",
      age: 32,
      salary: 150000,
      monthlyExpenses: 60000,
      investments: {
        epfMonthly: 8000,
        ppfAnnual: 100005,
        npsMonthly: 5000,
        elssAnnual: 50000,
        healthPremium: 25000,
        rentMonthly: 25000,
        homeLoanInterestAnnual: 120000,
        otherDeductions: 10000,
        directEquitySIP: 25000,
        goldMonthly: 5000
      },
      dependentsCount: 3,
      cityTier: "Metropolitan",
      insurance: {
        termCover: 20000000,
        healthCover: 1000000
      }
    }
  ],
  activeProfileId: "profile-main",
  createdAt: new Date().toISOString()
};

let accountsMemory: ServerUserAccount[] = [];

function loadAccounts() {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      accountsMemory = JSON.parse(data);
    } else {
      accountsMemory = [DEFAULT_ACCOUNT];
      saveAccounts();
    }
  } catch (err) {
    console.error("Error reading accounts DB file, resetting to memory seed", err);
    accountsMemory = [DEFAULT_ACCOUNT];
  }
}

function saveAccounts() {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accountsMemory, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing accounts DB file", err);
  }
}

// Load on start
loadAccounts();

// Lazy-loaded or guarded initialization of Gemini API
let aiInstance: GoogleGenAI | null = null;
function getAIClient(customApiKey?: string): GoogleGenAI {
  if (customApiKey && customApiKey.trim() !== "") {
    return new GoogleGenAI({
      apiKey: customApiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }

  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured in your environment secrets on this server host. To proceed, please provide your own custom Gemini API Key in the Coach settings panel.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiInstance;
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Paisa Blueprint server is fully operational.", totalAccounts: accountsMemory.length });
});

// Authentication API: Check if email is already registered
app.get("/api/auth/check-email", (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: "Missing email parameter" });
      return;
    }
    const emailNorm = (email as string).trim().toLowerCase();
    const found = accountsMemory.some(
      acc => acc.email.toLowerCase() === emailNorm || (acc.phone && acc.phone.toLowerCase() === emailNorm)
    );
    res.json({ registered: found });
  } catch (err: any) {
    console.error("Check email error:", err);
    res.status(500).json({ error: "Internal server error checking account email." });
  }
});

// Authentication API: Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, name, password, defaultProfile, phone } = req.body;
    if ((!email && !phone) || !name || !password) {
      res.status(400).json({ error: "Missing required fields: email/phone, name, or password" });
      return;
    }

    const emailNorm = (email || "").trim().toLowerCase();
    const phoneNorm = (phone || "").trim().toLowerCase();
    const identifier = emailNorm || phoneNorm;
    
    // Check duplication centrally across ALL devices connected
    const existing = accountsMemory.find(
      acc => acc.email.toLowerCase() === identifier || 
             (acc.phone && acc.phone.toLowerCase() === identifier) || 
             (phoneNorm && (acc.email.toLowerCase() === phoneNorm || (acc.phone && acc.phone.toLowerCase() === phoneNorm)))
    );
    if (existing) {
      res.status(409).json({ error: "This email address or phone number is already registered in the Paisa Network. Please use a unique login." });
      return;
    }

    const initialProfile = {
      ...(defaultProfile || {
        age: 30,
        salary: 120000,
        monthlyExpenses: 45000,
        investments: {
          epfMonthly: 5000,
          ppfAnnual: 50000,
          npsMonthly: 5000,
          elssAnnual: 30000,
          healthPremium: 15000,
          rentMonthly: 18000,
          homeLoanInterestAnnual: 0,
          otherDeductions: 0,
          directEquitySIP: 15000,
          goldMonthly: 2000
        },
        dependentsCount: 2,
        cityTier: "Metropolitan",
        insurance: {
          termCover: 15000000,
          healthCover: 500000
        }
      }),
      id: "profile-main",
      name: name.trim() // Instantly seed name
    };

    const newAccount: ServerUserAccount = {
      email: emailNorm || phoneNorm,
      phone: phoneNorm || undefined,
      name: name.trim(),
      passwordHash: password,
      profilesList: [initialProfile],
      activeProfileId: "profile-main",
      createdAt: new Date().toISOString()
    };

    accountsMemory.push(newAccount);
    saveAccounts();

    res.status(201).json({ 
      success: true, 
      message: "Locker successfully registered in the Paisa network.",
      user: {
        name: newAccount.name,
        email: newAccount.email,
        phone: newAccount.phone,
        profilesList: newAccount.profilesList,
        activeProfileId: newAccount.activeProfileId
      }
    });
  } catch (err: any) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Internal server error registering account." });
  }
});

// Authentication API: Login
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "Missing email or password credentials" });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    const found = accountsMemory.find(
      acc => acc.email.toLowerCase() === emailNorm || (acc.phone && acc.phone.toLowerCase() === emailNorm)
    );

    if (!found || found.passwordHash !== password) {
      res.status(401).json({ error: "Invalid Email address / Phone number or Password. Try checking credentials or register a new account if you are new." });
      return;
    }

    res.json({
      name: found.name,
      email: found.email,
      profilesList: found.profilesList,
      activeProfileId: found.activeProfileId
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Internal server error authenticating" });
  }
});

// Authentication API: Sync profiles/ledgers across devices
app.post("/api/auth/update-profiles", (req, res) => {
  try {
    const { email, profilesList, activeProfileId } = req.body;
    if (!email || !profilesList || !activeProfileId) {
      res.status(400).json({ error: "Missing required core parameters" });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    const index = accountsMemory.findIndex(acc => acc.email.toLowerCase() === emailNorm);

    if (index === -1) {
      res.status(404).json({ error: "Account not found for update" });
      return;
    }

    accountsMemory[index].profilesList = profilesList;
    accountsMemory[index].activeProfileId = activeProfileId;
    saveAccounts();

    res.json({ success: true, message: "Ledger portfolios synchronized centrally." });
  } catch (err: any) {
    console.error("Sync Error:", err);
    res.status(500).json({ error: "Internal server error synchronizing" });
  }
});

// Authentication API: Update account custom name
app.post("/api/auth/update-account-name", (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      res.status(400).json({ error: "Missing email or name core parameters" });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    const index = accountsMemory.findIndex(acc => acc.email.toLowerCase() === emailNorm);

    if (index === -1) {
      res.status(404).json({ error: "Account not found for rename" });
      return;
    }

    accountsMemory[index].name = name.trim();
    saveAccounts();

    res.json({ success: true, message: "Account profile renamed successfully." });
  } catch (err: any) {
    console.error("Account Rename Error:", err);
    res.status(500).json({ error: "Internal server error renaming account" });
  }
});

// Authentication API: Get current portfolios dynamically
app.get("/api/auth/get-profiles", (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      res.status(400).json({ error: "Missing email parameter" });
      return;
    }

    const emailNorm = (email as string).trim().toLowerCase();
    const found = accountsMemory.find(acc => acc.email.toLowerCase() === emailNorm);

    if (!found) {
      res.status(404).json({ error: "Account not found in Central Ledger" });
      return;
    }

    res.json({
      profilesList: found.profilesList,
      activeProfileId: found.activeProfileId
    });
  } catch (err: any) {
    console.error("Get Profiles Error:", err);
    res.status(500).json({ error: "Internal server error fetching profiles" });
  }
});

// Helper calculation functions for Local Advisor
function calculateTaxOld(grossAnnual: number, deductions: number = 250000): number {
  const taxable = Math.max(0, grossAnnual - deductions);
  if (taxable <= 500000) return 0;
  
  let tax = 0;
  const s1 = Math.min(250000, Math.max(0, taxable - 250000));
  const s2 = Math.min(500000, Math.max(0, taxable - 500000));
  const s3 = Math.max(0, taxable - 1000000);
  
  tax += s1 * 0.05;
  tax += s2 * 0.20;
  tax += s3 * 0.30;
  
  return tax * 1.04; // 4% cess
}

function calculateTaxNew(grossAnnual: number): number {
  const taxable = Math.max(0, grossAnnual - 75000); // Standard deduction 75,000 under new regime
  if (taxable <= 700000) return 0; 
  
  let tax = 0;
  const s1 = Math.min(300000, Math.max(0, taxable - 300000));
  const s2 = Math.min(300000, Math.max(0, taxable - 600000));
  const s3 = Math.min(300000, Math.max(0, taxable - 900000));
  const s4 = Math.min(300000, Math.max(0, taxable - 1200000));
  const s5 = Math.max(0, taxable - 1500000);
  
  tax += s1 * 0.05;
  tax += s2 * 0.10;
  tax += s3 * 0.15;
  tax += s4 * 0.20;
  tax += s5 * 0.30;
  
  return tax * 1.04; // 4% cess
}

function calculateCompound(monthlyAmount: number, years: number, rate: number): { totalInvested: number, totalValue: number, wealthGained: number } {
  const n = years * 12;
  const r = (rate / 100) / 12;
  const totalValue = monthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r);
  const totalInvested = monthlyAmount * n;
  return {
    totalInvested,
    totalValue,
    wealthGained: Math.max(0, totalValue - totalInvested)
  };
}

function generateLocalAdvisorReply(messages: any[], userProfile: any): string {
  const lastUserMsg = [...messages].reverse().find(m => m.role === "user")?.content || "";
  const query = lastUserMsg.toLowerCase();
  
  const profile = userProfile || {
    name: "Financier",
    age: 32,
    retirementAge: 60,
    salary: 80000,
    city: "tier2",
    maritalStatus: "single",
    dependentsCount: 0,
    currentSavings: 150000,
    monthlyExpenses: 30000,
    loans: { homeLoan: 0, personalLoan: 0, carLoan: 0, otherLoan: 0 },
    investments: { mutualFunds: 50000, stocks: 20000, gold: 10000, epf: 30000, ppf: 15000, nps: 0, realEstate: 0 },
    customSip: 10000,
    healthInsuranceCover: 300000,
    termInsuranceCover: 0
  };

  const name = profile.name || "friend";
  const salary = profile.salary || 0;
  const annualGross = salary * 12;
  const expenses = profile.monthlyExpenses || (salary * 0.4) || 20000;
  const age = profile.age || 30;
  const currentSavings = profile.currentSavings || 0;
  
  // Compute loans
  const loans = profile.loans || {};
  const homeLoan = loans.homeLoan || 0;
  const personalLoan = loans.personalLoan || 0;
  const carLoan = loans.carLoan || 0;
  const otherLoan = loans.otherLoan || 0;
  const totalLoans = homeLoan + personalLoan + carLoan + otherLoan;

  // Compute investments
  const investments = profile.investments || {};
  const mutualFunds = investments.mutualFunds || 0;
  const stocks = investments.stocks || 0;
  const gold = investments.gold || 0;
  const epf = investments.epf || 0;
  const ppf = investments.ppf || 0;
  const nps = investments.nps || 0;
  const realEstate = investments.realEstate || 0;
  const totalInvestments = mutualFunds + stocks + gold + epf + ppf + nps + realEstate;

  // Default / Greeting
  if (query.match(/\b(hello|hi|hey|greetings|namaste|start|get started)\b/) || lastUserMsg.trim() === "") {
    return `### Namaste, **${name}**! 👋 
    
I am your **Paisa Blueprint Local Expert System** 🇮🇳. Since your cloud Gemini API Key is currently unregistered or we are functioning in air-gap local configuration mode, I've booted my high-fidelity rule-based advice bank to guide you instantly!

Here is a quick summary of your financial portfolio markers:
- **Income Base (Gross Monthly):** ₹${salary.toLocaleString('en-IN')}
- **Active Borrowing/Locker Debts:** ₹${totalLoans.toLocaleString('en-IN')}
- **Total Invested Capital:** ₹${totalInvestments.toLocaleString('en-IN')}
- **Monthly Expenses Cushion:** ₹${expenses.toLocaleString('en-IN')}

I am fully operational with local algorithmic financial intelligence! Ask me about:
1. 📊 **Old vs New Tax Regime** comparison for your income bracket (just type **"Tax"**).
2. 📈 **SIP Compounding Wealth Projection** (type **"SIP"**).
3. 🚨 **Emergency Reserve Buffer** assessment (type **"Emergency"**).
4. 🛡️ **Insurance Cover adequacy audit** (type **"Insurance"**).
5. 📉 **Loan paydown strategy** (type **"Loan"**).

How shall we navigate your compounding plan today? Just enter a keyword or ask a customized question!`;
  }

  // TAX / REGIME Slabs calculation
  if (query.match(/\b(tax|regime|old|new|slab|deduction|80c|80d|standard deduction)\b/)) {
    const oldTax = calculateTaxOld(annualGross);
    const newTax = calculateTaxNew(annualGross);
    const taxDiff = Math.abs(oldTax - newTax);
    const recommendation = oldTax < newTax ? "Old Tax Regime" : "New Tax Regime";
    const recommendedRegimeStr = taxDiff === 0 
      ? `Both Old and New regimes yield ₹0 tax liability for you! However, the **New Tax Regime** is typically simpler since you do not need to lock up capital in tax-saving instruments.`
      : `Based on your Gross Salary of ₹${salary.toLocaleString('en-IN')}/mo (₹${annualGross.toLocaleString('en-IN')}/year), the **${recommendation}** will save you approximately **₹${Math.round(taxDiff).toLocaleString('en-IN')}** per year in taxes.`;

    return `### 📊 Indian Income Tax Regime Assessment
    
Let's analyze your personal tax slab for your gross annual salary of **₹${annualGross.toLocaleString('en-IN')}**:

1. **Old Tax Regime Estimates:**
   - **Assumed Deductions & Exemptions:** ₹2,50,000 (Section 80C: ₹1.5L such as EPF/PPF/ELSS, NPS Section 80CCD(1B): ₹50k, Standard Deduction: ₹50k).
   - **Calculated Tax Liability:** ₹${Math.round(oldTax).toLocaleString('en-IN')} per annum.

2. **New Tax Regime Estimates:**
   - **Deductions:** ₹75,000 Section 16(ia) Standard Deduction only. No Section 80C exemptions allowed.
   - **Calculated Tax Liability:** ₹${Math.round(newTax).toLocaleString('en-IN')} per annum.

---

### **💡 Recommendation:**
**${recommendedRegimeStr}**

* **If opting for the Old Regime:** Ensure your Section 80C investments (including your PPF contribution of ₹${ppf.toLocaleString('en-IN')} and EPF contribution of ₹${epf.toLocaleString('en-IN')}) are fully deployed before March 31st to avail of the rebate!
* **If opting for the New Regime:** You enjoy zero filing complexity and higher month-on-month liquidity, which you can redirect into active SIP compounding.`;
  }

  // SIP compounding
  if (query.match(/\b(sip|compound|interest|grow|wealth|future|mutual|fund|invest|stock|gold)\b/)) {
    const defaultSip = profile.customSip || Math.round(salary * 0.20) || 12000;
    
    // Calculate for 10, 15, and 20 years at 12% and 15%
    const sip10_12 = calculateCompound(defaultSip, 10, 12);
    const sip10_15 = calculateCompound(defaultSip, 10, 15);
    const sip15_12 = calculateCompound(defaultSip, 15, 12);
    const sip15_15 = calculateCompound(defaultSip, 15, 15);
    const sip20_12 = calculateCompound(defaultSip, 20, 12);
    const sip20_15 = calculateCompound(defaultSip, 20, 15);

    return `### 📈 Mutual Fund SIP Wealth Accumulation Chart (Local Simulation)
    
Compounding is the 8th wonder of the world! Let's project how your SIP grows over time.
We will assume you start a dedicated Monthly SIP of **₹${defaultSip.toLocaleString('en-IN')}** (about ${Math.round((defaultSip/salary)*100)}% of your monthly gross income):

#### 📅 10-Year Runway
* **Total Invested Cost:** ₹${sip10_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR (Conservative Index):** ₹${Math.round(sip10_12.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip10_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR (Aggressive Mid/Smallcap):** ₹${Math.round(sip10_15.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip10_15.wealthGained).toLocaleString('en-IN')})*

#### 📅 15-Year Runway
* **Total Invested Cost:** ₹${sip15_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR:** ₹${Math.round(sip15_12.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip15_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR:** ₹${Math.round(sip15_15.totalValue).toLocaleString('en-IN')} *(Wealth Gained: +₹${Math.round(sip15_15.wealthGained).toLocaleString('en-IN')})*

#### 📅 20-Year Runway *(Compounding hockey stick curve)*
* **Total Invested Cost:** ₹${sip20_12.totalInvested.toLocaleString('en-IN')}
* **Value at 12% CAGR:** **₹${Math.round(sip20_12.totalValue).toLocaleString('en-IN')}** *(Wealth Gained: +₹${Math.round(sip20_12.wealthGained).toLocaleString('en-IN')})*
* **Value at 15% CAGR:** **₹${Math.round(sip20_15.totalValue).toLocaleString('en-IN')}** *(Wealth Gained: +₹${Math.round(sip20_15.wealthGained).toLocaleString('en-IN')})*

---

### **💡 Action Plan for ${name}:**
1. **Automate It:** Set up automatic monthly NACH mandates on your bank account for mutual fund SIPs as it keeps discipline.
2. **Recommended Basket:** 
   - **50% Core Index:** Nifty 50 Index Mutual Fund for stable compounding.
   - **30% Next Tier:** Nifty LargeMidcap 250 Index Fund or Active Midcap fund.
   - **20% Smallcap Satellite:** Smallcap mutual fund if your retirement run allows a 15+ year timeline.
3. **Step-Up:** Try to step-up your SIP by 10% every year as your salary increases to reach your retirement goals twice as fast!`;
  }

  // EMERGENCY / EXPENSE / SAVINGS
  if (query.match(/\b(emergency|expense|buffer|cushion|savings|liquid|backup|fd)\b/)) {
    const recBuffer = expenses * 6;
    const isAdequate = currentSavings >= recBuffer;
    const diff = recBuffer - currentSavings;

    return `### 🚨 Emergency Reserve Buffer Audit for **${name}**
    
In the blueprint of Indian personal finance, an emergency fund is your primary moat.
- **Your Monthly Cash Outflows:** ₹${expenses.toLocaleString('en-IN')}
- **Ideal 6-Month Emergency Fund size:** **₹${recBuffer.toLocaleString('en-IN')}**
- **Your Enrolled Liquid Cash/Savings Balance:** ₹${currentSavings.toLocaleString('en-IN')}

---

### **⚖️ Safety Adequacy Assessment:**
${isAdequate 
  ? `✔️ **EXCELLENT STABILITY!** Your current liquid reserves of **₹${currentSavings.toLocaleString('en-IN')}** cover approximately **${(currentSavings/expenses).toFixed(1)} months** of complete expenditure. This keeps you safe from job interruptions or temporary pay delays.` 
  : `⚠️ **BUFFERS ARE INSUFFICIENT!** You are short by **₹${diff.toLocaleString('en-IN')}** of the ideal 6-month safety net. Your current cash lasts only **${(currentSavings/expenses).toFixed(1)} months**.`}

---

### **💡 Master Blueprint Recommendations:**
1. **Where to park this reservoir:**
   - **50% in a Sweep-in Fixed Deposit** tied to your primary bank account (earns higher interest than savings, instantly withdrawable).
   - **50% in an Arbitrage/Liquid Mutual Fund** (very low risk, highly tax-efficient compared to normal FDs for high-slab earners).
2. **Immediate Step:** If under-covered, pause or reduce your stock investments temporarily and direct all monthly surplus (Gross income of ₹${salary.toLocaleString('en-IN')} minus ₹${expenses.toLocaleString('en-IN')} expenses) into building this buffer first.`;
  }

  // INSURANCE / TERM / HEALTH
  if (query.match(/\b(insurance|term|health|lic|cover|medical|adequacy|audit)\b/)) {
    const idealTerm = annualGross * 15;
    const pathTerm = profile.termInsuranceCover || 0;
    const pathHealth = profile.healthInsuranceCover || 0;
    
    const isTermAdequate = pathTerm >= idealTerm;
    const isHealthAdequate = pathHealth >= 500000;

    return `### 🛡️ Insurance Cover Adequacy Check
    
Insurance exists to protect dependencies, not to act as investment vehicles. Let's inspect your risk-management boundaries:

#### 1. Term Life Insurance (Pure Protection)
- **Rule of Thumb:** 10x - 15x of Gross Annual Salary. 
- **Your Recommended pure-term cover:** **₹${idealTerm.toLocaleString('en-IN')}**
- **Your Registered pure-term cover:** ₹${pathTerm.toLocaleString('en-IN')}
- **Assessment:** ${isTermAdequate 
  ? `✔️ **Fully Covered!** Your pure term cover of ₹${pathTerm.toLocaleString('en-IN')} shields your family robustly.` 
  : `⚠️ **Under-Covered!** Your active term cover of ₹${pathTerm.toLocaleString('en-IN')} is below the recommended safety cap. If you have dependents, you should purchase a pure-term structure immediately (HDFC Life, Max Life, or ICICI Pru). Avoid LIC endowment or ULIPs, which charge high fees and yield only 5-6% returns!`}

#### 2. Health Medical Insurance
- **Recommended base Cover:** Minimum ₹5,00,000 (5 Lakhs) for yourself, plus dedicated corporate coverage.
- **Your Enrolled Health Cover:** ₹${pathHealth.toLocaleString('en-IN')}
- **Assessment:** ${isHealthAdequate 
  ? `✔️ **Adequate base health insurance!** Keeping a private cover of ₹${pathHealth.toLocaleString('en-IN')} ensures you remain safe even during corporate career shifts.` 
  : `⚠️ **Refine Health Protection:** Your cover of ₹${pathHealth.toLocaleString('en-IN')} might be low for metro hospital expenses. Consider taking a base cover of 5 Lakhs or adding a high-deductible super-top-up helper policy containing a low premium.`}`;
  }

  // LOAN / DEBT
  if (query.match(/\b(loan|debt|emi|borrow|home loan|car loan|personal loan|avalanche|snowball)\b/)) {
    if (totalLoans === 0) {
      return `### 🩺 Debt & Leverage Health Report
      
**Status:** 🎉 **COMPLETE LIABILITY FREEDOM!**
You have registered ₹0 outstanding long-term liabilities! This is an exceptional personal finance feat. With zero monthly EMIs pulling down your cash flow, you should route at least **35% of your income (₹${Math.round(salary*0.35).toLocaleString('en-IN')})** straight into active SIP index mutual funds to let compound interest work for you!`;
    }

    const loanCount = [homeLoan, personalLoan, carLoan, otherLoan].filter(l => l > 0).length;
    return `### 📉 Debt Reduction paydown Strategy (${loanCount} Active Liabilities)
    
Your registered long-term liabilities sum up to **₹${totalLoans.toLocaleString('en-IN')}**:
${homeLoan > 0 ? `- 🏠 **Home Loan Principal:** ₹${homeLoan.toLocaleString('en-IN')}\n` : ""}${personalLoan > 0 ? `- 💳 **High-Risk Personal Loan:** ₹${personalLoan.toLocaleString('en-IN')} *(Urgent Category)*\n` : ""}${carLoan > 0 ? `- 🚗 **Car Loan principal:** ₹${carLoan.toLocaleString('en-IN')}\n` : ""}${otherLoan > 0 ? `- 📂 **Other auxiliary loan:** ₹${otherLoan.toLocaleString('en-IN')}\n` : ""}

---

### **💡 Strategic Leverage Roadmap:**
1. **Nuke High-Interest First (Avalanche Method):**
   - Personal loans typically charge **12% to 18% interest**, car loans **9% to 11%**, home loans **8% to 9%**. 
   - **Immediately prioritize** clearing your ${personalLoan > 0 ? `**Personal Loan of ₹${personalLoan.toLocaleString('en-IN')}**` : "highest interest loan"} by prepaying as much of your monthly gross (₹${salary.toLocaleString('en-IN')}) surplus into it. This is a guaranteed 14% tax-free savings return on your money!
2. **Prepay Home Loan Principle:** 
   - If you have an active Home Loan, make a pledge to prepay **1 extra EMI every year**, or increase your monthly EMI by **5% annually**. This simple step trims a 20-year run down to just **12 to 13 years**, saving you lakhs in interest costs!`;
  }

  // GOVERNMENT / 7th PAY / PAYSCALE / BPSC / KVS
  if (query.match(/\b(7th pay|pay scale|basic|da|hra|allowance|government|salary|salary structure)\b/)) {
    const computedBasic = Math.round(salary * 0.40);
    const computedDA = Math.round(computedBasic * 0.50);
    return `### 🏛️ Government Salary Architecture (7th Pay Commission)
    
Since you are analyzing structured salaried scales (often aligned with Central or State pay rules):

- **Gross registered scale:** ₹${salary.toLocaleString('en-IN')} / month
- **Assumed Basic Pay (typically ~40-50%):** ₹${computedBasic.toLocaleString('en-IN')}
- **Dearness Allowance (current 50% DA):** ₹${computedDA.toLocaleString('en-IN')}
- **HRA Bracket allocation:** Aligned to your city tier (${profile.city === 'tier1' ? 'Metro 27% HRA' : profile.city === 'tier2' ? 'Town 18% HRA' : 'Rural 9% HRA'}).

---

### **💡 Optimizing Government Allowances:**
1. **NPS Under Section 80CCD(2):** 
   - The Employer's NPS contribution (14% of Basic + DA) is fully tax-free under both tax regimes! Ensure your department files this to lower your taxable net.
2. **LTA (Leave Travel Allowance) & Fuel Reimbursements:** Ensure you submit rent receipts (HRA exemption under Old Regime) and other declarations directly to your DDO (Drawing and Disbursing Officer) before January to prevent heavy TDS tax deductions!`;
  }

  // Default Fallback
  return `### 💡 Holistic Paisa Blueprint Advice for **${name}**
  
I have analyzed your entire financial ledger and here is your core optimize path:

1. **Compounding Force:** You have **₹${totalInvestments.toLocaleString('en-IN')}** invested across mutual funds, stocks, and fixed income. Keeping an active Nifty 50 SIP will double this amount dynamically behind the scenes.
2. **Risk Barrier:** Your current liquid savings are **₹${currentSavings.toLocaleString('en-IN')}** against a target emergency buffer of **₹${(expenses * 6).toLocaleString('en-IN')}**. Fill this up before expanding stock operations.
3. **Debt Drag:** Your active liabilities total **₹${totalLoans.toLocaleString('en-IN')}**. Leverage prepayments of the high-rate segments to unlock massive cash flow.
4. **Tax Leakage:** At gross ₹${salary.toLocaleString('en-IN')}/mo, you are likely in a high-bracket. Use the tax tab to compare regimes precisely and maximize direct index funds.

*Feel free to ask me something specific, like **"Compare tax old vs new"** or **"How much will ₹10,000 monthly grow to?"**!*`;
}

// AI Financial Coach Chat Endpoint
app.post("/api/chat", async (req, res) => {
  const { messages, userProfile, customApiKey } = req.body;
  try {
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array" });
      return;
    }

    const serverKey = process.env.GEMINI_API_KEY;
    const hasAnyKey = (serverKey && serverKey.trim() !== "") || (customApiKey && customApiKey.trim() !== "");

    // If no key is configured, instantly output high-fidelity local advice
    if (!hasAnyKey) {
      const content = generateLocalAdvisorReply(messages, userProfile);
      res.json({
        role: "assistant",
        content: content
      });
      return;
    }

    const ai = getAIClient(customApiKey);

    // Inject profile and guidelines as a strong system instruction
    const systemInstruction = `You are "Paisa Blueprint AI Coach", an expert personal financial adviser specializing in Indian personal finance, salaried employees, and government salary structures.
Your tone is encouraging, objective, smart, and financially prudent. You think like a typical middle-class or wealthy Indian household optimizer (minimizing taxes, maximizing safe compounding via Mutual Funds/SIP, buying Term over ULIP, keeping a solid emergency fund).

Use Indian Rupees (₹, Lakhs, Crores) for all numbers.
Where relevant, consider Indian tax schemes:
- Old Tax Regime deductions (Section 80C up to 1.5L, NPS Section 80CCD(1B) up to 50k, Standard Deduction 50k, Section 80D health insurance, HRA exempt).
- New Tax Regime (Standard deduction 75k, no major deductions, lower overall slab rates).
- High priority to safe compounding, NPS, PPF, EPF, and direct/regular mutual fund SIP schemes.

User Context:
${userProfile ? JSON.stringify(userProfile, null, 2) : "No specific profile shared yet. Ask them details if needed."}

Follow these instructions strictly:
1. Always give concrete, real Indian financial recommendations, never vague generalities.
2. If given salary figures, analyze their savings potential using the 50/30/20 rule adjusted for Indian scenarios.
3. Suggest clear action items (e.g., "Park 6 months of expenses in an arbitrage fund or sweep-in FD for emergency").
4. Keep answers concise, highly structured using markdown bolding and lists, and very action-oriented. Never write massive unbroken paragraphs.`;

    // Map the messages payload to the structure expected by the generateContent API
    // Roles must be "user" or "model" (replaces "assistant")
    const contents = messages.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // Ensure the conversation starts with a "user" message by shifting out any leading model/assistant messages
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }

    // If history is empty for any reason, provide a baseline fallback prompt
    if (contents.length === 0) {
      contents.push({
        role: "user",
        parts: [{ text: "Hello, I want to talk about personal finance." }]
      });
    }

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    const responseText = result.text || "I was unable to formulate a response. Please try again.";

    res.json({
      role: "assistant",
      content: responseText
    });
  } catch (error: any) {
    console.error("AI Coach Error - Fallback to Local Expert:", error);
    try {
      const content = generateLocalAdvisorReply(messages || [], userProfile);
      res.json({
        role: "assistant",
        content: `*(Fallback Local Advisory Enabled)*\n\n${content}`
      });
    } catch (fallbackErr) {
      res.status(500).json({ error: "Internal server error during chat fallback" });
    }
  }
});

// Endpoint to check server-side Gemini API key status
app.get("/api/chat/status", (req, res) => {
  res.json({ hasApiKey: typeof process.env.GEMINI_API_KEY === "string" && process.env.GEMINI_API_KEY.trim() !== "" });
});

// Persistent Visitors Database
const VISITORS_FILE = path.join(process.cwd(), "visitors-db.json");

function getVisitorCount(): number {
  try {
    if (fs.existsSync(VISITORS_FILE)) {
      const data = fs.readFileSync(VISITORS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      return typeof parsed.count === "number" ? parsed.count : 1420;
    } else {
      fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count: 1420 }), "utf-8");
      return 1420;
    }
  } catch (err) {
    console.error("Error reading visitors file:", err);
    return 1420;
  }
}

function incrementVisitorCount(): number {
  try {
    const current = getVisitorCount();
    const nextVal = current + 1;
    fs.writeFileSync(VISITORS_FILE, JSON.stringify({ count: nextVal }), "utf-8");
    return nextVal;
  } catch (err) {
    console.error("Error writing visitors file:", err);
    return 1421;
  }
}

// Visitors API
app.get("/api/visitors", (req, res) => {
  res.json({ count: getVisitorCount() });
});

app.post("/api/visitors/hit", (req, res) => {
  res.json({ count: incrementVisitorCount() });
});

// Configure Vite or Serve Static Files
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Joined Vite dev middlewares.");
  } else {
    // Production mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log(`Serving static files from ${distPath}`);
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Paisa Blueprint running on http://localhost:${PORT}`);
  });
}

startServer();
