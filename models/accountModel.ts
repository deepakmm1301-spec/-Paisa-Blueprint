import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger";

const ACCOUNTS_FILE = path.join(process.cwd(), "accounts-db.json");

export interface LoginHistoryEntry {
  timestamp: string;
  ip: string;
  device: string;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  monthlyNewsletter: boolean;
}

export interface ServerUserAccount {
  // Existing fields to preserve compatibility
  email: string;
  phone?: string;
  name: string;
  passwordHash: string;
  profilesList: any[];
  activeProfileId: string;
  createdAt: string;

  // New expanded fields for Enterprise Auth
  id: string;
  fullName: string;
  emailVerified: boolean;
  profilePhoto?: string;
  country?: string;
  state?: string;
  occupation?: string;
  salary?: number;
  role: "user" | "admin" | "premium";
  subscription: "free" | "premium";
  updatedAt: string;
  lastLogin?: string;
  loginHistory?: LoginHistoryEntry[];
  notificationPreferences?: NotificationPreferences;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: string;
  refreshTokens?: string[];
}

// Default Seed User Account
const DEFAULT_ACCOUNT: ServerUserAccount = {
  id: "user-anchal",
  email: "advisor@paisa.in",
  phone: "9876543210",
  name: "Anchal Priya",
  fullName: "Anchal Priya",
  // bcypt hash of "paisa" to make default login work out of the box securely
  passwordHash: "$2a$10$9fJ6LzZfH5N7P93Y12W1XODvQ1sT2U6iXfSg3v4fV7O/Yn.2E6SXe", // "paisa"
  emailVerified: true,
  profilePhoto: "",
  country: "India",
  state: "Bihar",
  occupation: "Senior BPSC Teacher",
  salary: 150000,
  role: "admin",
  subscription: "premium",
  profilesList: [
    {
      id: "profile-main",
      name: "Anchal Priya",
      age: 26,
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
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  loginHistory: [],
  notificationPreferences: {
    email: true,
    push: true,
    monthlyNewsletter: true
  },
  refreshTokens: []
};

let accountsMemory: ServerUserAccount[] = [];

export function loadAccounts(): void {
  try {
    if (fs.existsSync(ACCOUNTS_FILE)) {
      const data = fs.readFileSync(ACCOUNTS_FILE, "utf-8");
      accountsMemory = JSON.parse(data);
      
      // Upgrade existing simple accounts if necessary
      let updated = false;
      accountsMemory = accountsMemory.map(acc => {
        let dirty = false;
        if (!acc.id) {
          acc.id = "user-" + Math.random().toString(36).substring(2, 11);
          dirty = true;
        }
        if (!acc.fullName) {
          acc.fullName = acc.name || acc.email.split("@")[0];
          dirty = true;
        }
        if (acc.emailVerified === undefined) {
          acc.emailVerified = true;
          dirty = true;
        }
        if (!acc.role) {
          acc.role = (acc.email === "advisor@paisa.in") ? "admin" : "user";
          dirty = true;
        }
        if (!acc.subscription) {
          acc.subscription = "free";
          dirty = true;
        }
        if (!acc.updatedAt) {
          acc.updatedAt = acc.createdAt || new Date().toISOString();
          dirty = true;
        }
        if (!acc.notificationPreferences) {
          acc.notificationPreferences = { email: true, push: true, monthlyNewsletter: true };
          dirty = true;
        }
        if (!acc.refreshTokens) {
          acc.refreshTokens = [];
          dirty = true;
        }
        if (acc.passwordHash && !acc.passwordHash.startsWith("$2a$") && !acc.passwordHash.startsWith("$2b$") && !acc.passwordHash.startsWith("$2y$")) {
          // If in plain-text, secure it immediately using bcrypt
          acc.passwordHash = bcrypt.hashSync(acc.passwordHash, 10);
          dirty = true;
        }
        if (dirty) updated = true;
        return acc;
      });

      if (updated) {
        saveAccounts();
      }
    } else {
      accountsMemory = [DEFAULT_ACCOUNT];
      saveAccounts();
    }
  } catch (err) {
    logger.error("Error reading accounts DB file, resetting to memory seed", err);
    accountsMemory = [DEFAULT_ACCOUNT];
  }
}

export function saveAccounts(): void {
  try {
    fs.writeFileSync(ACCOUNTS_FILE, JSON.stringify(accountsMemory, null, 2), "utf-8");
  } catch (err) {
    logger.error("Error writing accounts DB file", err);
  }
}

export const accountModel = {
  getAccountsMemory: (): ServerUserAccount[] => {
    return accountsMemory;
  },
  
  findByEmail: (email: string): ServerUserAccount | undefined => {
    const emailNorm = email.trim().toLowerCase();
    return accountsMemory.find(acc => acc.email.toLowerCase() === emailNorm);
  },

  findById: (id: string): ServerUserAccount | undefined => {
    return accountsMemory.find(acc => acc.id === id);
  },

  findByVerificationToken: (token: string): ServerUserAccount | undefined => {
    return accountsMemory.find(acc => acc.verificationToken === token);
  },

  findByResetToken: (token: string): ServerUserAccount | undefined => {
    return accountsMemory.find(acc => acc.resetPasswordToken === token);
  },

  createAccount: (account: ServerUserAccount): void => {
    accountsMemory.push(account);
    saveAccounts();
  },

  updateAccount: (updatedAccount: Partial<ServerUserAccount> & { id: string }): boolean => {
    const idx = accountsMemory.findIndex(acc => acc.id === updatedAccount.id);
    if (idx === -1) return false;
    
    const oldHash = accountsMemory[idx].passwordHash;

    // Filter out undefined properties to prevent replacing existing fields with undefined
    const cleanUpdate: any = {};
    for (const [key, val] of Object.entries(updatedAccount)) {
      if (val !== undefined) {
        cleanUpdate[key] = val;
      }
    }

    accountsMemory[idx] = {
      ...accountsMemory[idx],
      ...cleanUpdate,
      updatedAt: new Date().toISOString()
    };
    
    const newHash = accountsMemory[idx].passwordHash;
    if (oldHash !== newHash) {
      logger.info(`[AUDIT] updateAccount CHANGED passwordHash for user ${accountsMemory[idx].email || accountsMemory[idx].id}! Old prefix: ${oldHash ? oldHash.substring(0, 15) : "undefined"}, New prefix: ${newHash ? newHash.substring(0, 15) : "undefined"}`);
    } else {
      logger.info(`[AUDIT] updateAccount did NOT change passwordHash for user ${accountsMemory[idx].email || accountsMemory[idx].id}. Current prefix: ${oldHash ? oldHash.substring(0, 15) : "undefined"}`);
    }

    saveAccounts();
    return true;
  },

  deleteAccount: (id: string): boolean => {
    const idx = accountsMemory.findIndex(acc => acc.id === id);
    if (idx === -1) return false;
    
    accountsMemory.splice(idx, 1);
    saveAccounts();
    return true;
  },

  updateProfiles: (email: string, profilesList: any[], activeProfileId: string): boolean => {
    const emailNorm = email.trim().toLowerCase();
    const index = accountsMemory.findIndex(acc => acc.email.toLowerCase() === emailNorm);
    if (index === -1) return false;

    accountsMemory[index].profilesList = profilesList;
    accountsMemory[index].activeProfileId = activeProfileId;
    accountsMemory[index].updatedAt = new Date().toISOString();
    saveAccounts();
    return true;
  },

  updateName: (email: string, name: string): boolean => {
    const emailNorm = email.trim().toLowerCase();
    const index = accountsMemory.findIndex(acc => acc.email.toLowerCase() === emailNorm);
    if (index === -1) return false;

    accountsMemory[index].name = name.trim();
    accountsMemory[index].fullName = name.trim();
    accountsMemory[index].updatedAt = new Date().toISOString();
    saveAccounts();
    return true;
  }
};

// Initial load on import
loadAccounts();
