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
  name: string;
  passwordHash: string;
  profilesList: any[];
  activeProfileId: string;
  createdAt: string;
}

// Initial seed
const DEFAULT_ACCOUNT: ServerUserAccount = {
  email: "advisor@paisa.in",
  name: "Deepak Kumar",
  passwordHash: "paisa",
  profilesList: [
    {
      id: "profile-main",
      name: "Deepak Kumar",
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
    const found = accountsMemory.some(acc => acc.email.toLowerCase() === emailNorm);
    res.json({ registered: found });
  } catch (err: any) {
    console.error("Check email error:", err);
    res.status(500).json({ error: "Internal server error checking account email." });
  }
});

// Authentication API: Register
app.post("/api/auth/register", (req, res) => {
  try {
    const { email, name, password, defaultProfile } = req.body;
    if (!email || !name || !password) {
      res.status(400).json({ error: "Missing required fields: email, name, or password" });
      return;
    }

    const emailNorm = email.trim().toLowerCase();
    
    // Check duplication centrally across ALL devices connected
    const existing = accountsMemory.find(acc => acc.email.toLowerCase() === emailNorm);
    if (existing) {
      res.status(409).json({ error: "This email address is already registered on another device in the Paisa Network. Please use a unique Email." });
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
      email: emailNorm,
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
    const found = accountsMemory.find(acc => acc.email.toLowerCase() === emailNorm);

    if (!found || found.passwordHash !== password) {
      res.status(401).json({ error: "Invalid Email address or Password. Try checking credentials or register a new account if you are new." });
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

// AI Financial Coach Chat Endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { messages, userProfile, customApiKey } = req.body;
    if (!messages || !Array.isArray(messages)) {
      res.status(400).json({ error: "Missing or invalid 'messages' array" });
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

    // Filter out the static welcome message to ensure a clean history starting with the user's actual question
    const filtered = messages.filter((m: any) => m.id !== "welcome-msg");
    
    // Map the messages payload to the structure expected by the generateContent API
    // Roles must be "user" or "model" (replaces "assistant")
    const contents = filtered.map((m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

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
    console.error("AI Coach Error:", error);
    res.status(500).json({ 
      error: error.message || "An internal error occurred with the AI Coach.",
      isConfigError: !process.env.GEMINI_API_KEY && !req.body.customApiKey
    });
  }
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
