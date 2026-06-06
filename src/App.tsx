import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, LoanDetails, InvestmentDetails } from "./types";
import FinancialHealthCheck from "./components/FinancialHealthCheck";
import SalaryPlanner from "./components/SalaryPlanner";
import SIPCalculator from "./components/SIPCalculator";
import RetirementPlanner from "./components/RetirementPlanner";
import GoalPlanner from "./components/GoalPlanner";
import TaxPlanner from "./components/TaxPlanner";
import NetWorthTracker from "./components/NetWorthTracker";
import AICoach from "./components/AICoach";
import ProfileManager from "./components/ProfileManager";
import AuthScreen from "./components/AuthScreen";
import CibilCheck from "./components/CibilCheck";
import ArticlesColumn from "./components/ArticlesColumn";
import { FooterSections } from "./components/FooterSections";
// @ts-ignore
import paisaLogo from "./assets/images/deep_paisa_logo_1780484307855.png";

import { 
  HeartPulse, 
  Landmark, 
  TrendingUp, 
  Compass, 
  Scale, 
  Wallet, 
  Bot, 
  Coins, 
  Sliders, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Award,
  Users,
  LogOut,
  UserCheck,
  RefreshCw,
  User,
  ChevronDown,
  Edit2,
  Check,
  CreditCard,
  Sun,
  Moon,
  Network,
  Folder,
  FolderOpen,
  Activity,
  Plus,
  Trash2
} from "lucide-react";

// Default profile setup
const initialLoans: LoanDetails = {
  homeLoan: 0,
  personalLoan: 0,
  carLoan: 0,
  otherLoan: 0,
};

const initialInvestments: InvestmentDetails = {
  mutualFunds: 350000,
  stocks: 120000,
  gold: 150000,
  epf: 180000,
  ppf: 50000,
  nps: 60000,
  realEstate: 0,
};

const defaultProfile: UserProfile = {
  name: "Deepak Kumar (Scenario Model)",
  age: 32,
  retirementAge: 60,
  salary: 75000, // Monthly general base
  city: "tier2", // e.g. Patna
  maritalStatus: "dependents",
  dependentsCount: 2,
  currentSavings: 120000, // emergency fund savings
  loans: initialLoans,
  investments: initialInvestments,
  monthlyExpenses: 350000 * 0.1, // general estimation
  healthInsuranceCover: 500000,
  termInsuranceCover: 5000000,
};

type ActiveWidget = 
  | "profiles"
  | "health" 
  | "salary" 
  | "sip" 
  | "retirement" 
  | "goals" 
  | "tax" 
  | "networth" 
  | "coach"
  | "cibil";

export default function App() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomePopup(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Lock to prevent overwriting server-side state during profile loading race conditions
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);

  // Session authentication state (Auto-bypassed/Preloaded)
  const [sessionUser, setSessionUser] = useState<{ name: string; email: string } | null>(() => {
    const saved = localStorage.getItem("paisa_active_session");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (err) {
        console.error("Failed to parse active session", err);
      }
    }
    return { name: "Deepak Kumar (Scenario Model)", email: "paisa.mm1301@gmail.com" };
  });

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("paisa_theme") === "dark";
  });

  // Custom dashboard fields active state
  const [showDashboardSettings, setShowDashboardSettings] = useState(false);
  const [dbOptions, setDbOptions] = useState(() => {
    const saved = localStorage.getItem("paisa_active_directory_options");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      name: true,
      age: true,
      grossMonthly: true,
      investments: true,
      monthlySip: true,
    };
  });

  useEffect(() => {
    localStorage.setItem("paisa_active_directory_options", JSON.stringify(dbOptions));
  }, [dbOptions]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("paisa_theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  const [isEditingAccountName, setIsEditingAccountName] = useState(false);
  const [newAccountName, setNewAccountName] = useState("");

  const handleSaveAccountName = async () => {
    if (!newAccountName.trim() || !sessionUser) return;
    
    const updatedUser = { ...sessionUser, name: newAccountName.trim() };
    setSessionUser(updatedUser);
    localStorage.setItem("paisa_active_session", JSON.stringify(updatedUser));
    
    // Update local accounts cache structure
    try {
      const savedAccounts = localStorage.getItem("paisa_user_accounts");
      if (savedAccounts) {
        const accounts = JSON.parse(savedAccounts);
        const index = accounts.findIndex((a: any) => a.email.toLowerCase() === sessionUser.email.toLowerCase());
        if (index > -1) {
          accounts[index].name = newAccountName.trim();
          localStorage.setItem("paisa_user_accounts", JSON.stringify(accounts));
        }
      }
    } catch (err) {
      console.error("Failed to update user accounts renaming cache:", err);
    }

    // Call dynamic backend rename endpoint
    try {
      await fetch("/api/auth/update-account-name", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionUser.email,
          name: newAccountName.trim()
        })
      });
    } catch (err) {
      console.warn("Cloud account renaming failed, synced changes remain local", err);
    }
    
    setIsEditingAccountName(false);
  };

  // Ensure standard session is stored for continuous sync under the hood
  useEffect(() => {
    if (sessionUser) {
      localStorage.setItem("paisa_active_session", JSON.stringify(sessionUser));
    } else {
      localStorage.removeItem("paisa_active_session");
    }
  }, [sessionUser]);

  // Profiles list state scoped to user session OR legacy fallbacks
  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    // Check active session first
    const activeSess = localStorage.getItem("paisa_active_session");
    if (activeSess) {
      try {
        const parsedSess = JSON.parse(activeSess);
        if (parsedSess && parsedSess.email) {
          const userEmail = parsedSess.email.toLowerCase();
          
          // Try user-scoped localStorage key
          const userSpecificList = localStorage.getItem(`paisa_family_profiles_list_${userEmail}`);
          if (userSpecificList) {
            return JSON.parse(userSpecificList);
          }

          // Fallback to matching accounts entry
          const savedAccounts = localStorage.getItem("paisa_user_accounts");
          if (savedAccounts) {
            const accounts = JSON.parse(savedAccounts);
            const match = accounts.find((a: any) => a.email.toLowerCase() === userEmail);
            if (match && match.profilesList && match.profilesList.length > 0) {
              return match.profilesList;
            }
          }
        }
      } catch (err) {
        console.error("Failed to recover user-bound portfolios list", err);
      }
    }

    const listSaved = localStorage.getItem("paisa_family_profiles_list");
    if (listSaved) {
      try {
        return JSON.parse(listSaved);
      } catch (err) {
        console.error("Failed to load profiles list", err);
      }
    }
    
    // Check if single legacy profile is available
    const legacySaved = localStorage.getItem("paisa_profile");
    if (legacySaved) {
      try {
        const parsed = JSON.parse(legacySaved);
        if (!parsed.id) parsed.id = "profile-main";
        return [parsed];
      } catch (e) {
        console.error("Failed to parse legacy profile", e);
      }
    }
    
    // Default fallback
    return [{ ...defaultProfile, id: "profile-main" }];
  });

  // Active Profile ID state
  const [activeProfileId, setActiveProfileId] = useState<string>(() => {
    const activeSess = localStorage.getItem("paisa_active_session");
    if (activeSess) {
      try {
        const parsedSess = JSON.parse(activeSess);
        if (parsedSess && parsedSess.email) {
          const userEmail = parsedSess.email.toLowerCase();

          // Try user-scoped active profile ID
          const userSpecificId = localStorage.getItem(`paisa_active_profile_id_${userEmail}`);
          if (userSpecificId) {
            return userSpecificId;
          }

          const savedAccounts = localStorage.getItem("paisa_user_accounts");
          if (savedAccounts) {
            const accounts = JSON.parse(savedAccounts);
            const match = accounts.find((a: any) => a.email.toLowerCase() === userEmail);
            if (match && match.activeProfileId) {
              return match.activeProfileId;
            }
          }
        }
      } catch (e) {}
    }

    const savedId = localStorage.getItem("paisa_active_profile_id");
    return savedId || "profile-main";
  });

  const [activeWidget, setActiveWidget] = useState<ActiveWidget>("profiles");
  const contentRef = React.useRef<HTMLElement>(null);
  const isFirstMount = React.useRef(true);

  // Deriving the active profile based on selection
  const profile = profiles.find(p => p.id === activeProfileId) || profiles[0] || { ...defaultProfile, id: "profile-main" };

  // Smooth scroll logic on widget selection
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeWidget]);

  // Pull latest central ledger details on load if session is active
  useEffect(() => {
    if (sessionUser && sessionUser.email) {
      setIsLoadingProfiles(true);
      fetch(`/api/auth/get-profiles?email=${encodeURIComponent(sessionUser.email)}`)
        .then(res => {
          if (res.ok) return res.json();
          throw new Error("Response status indicates error");
        })
        .then(data => {
          if (data && data.profilesList && data.profilesList.length > 0) {
            setProfiles(data.profilesList);
            if (data.activeProfileId) {
              setActiveProfileId(data.activeProfileId);
            }
          }
        })
        .catch(err => {
          console.warn("Could not retrieve central ledger portfolios on init, fell back to cache:", err);
        })
        .finally(() => {
          setIsLoadingProfiles(false);
        });
    }
  }, [sessionUser?.email]);

  // Sync profile storage changes & update user's localized locker record
  useEffect(() => {
    // If we're loading profiles, lock synchronization so we don't overwrite server state
    if (isLoadingProfiles) return;

    localStorage.setItem("paisa_family_profiles_list", JSON.stringify(profiles));
    localStorage.setItem("paisa_active_profile_id", activeProfileId);
    // Backward compatibility file link
    localStorage.setItem("paisa_profile", JSON.stringify(profile));

    if (sessionUser && sessionUser.email) {
      const userEmail = sessionUser.email.toLowerCase();
      // Scoped lists as well so page reloads immediately resolve correct profile
      localStorage.setItem(`paisa_family_profiles_list_${userEmail}`, JSON.stringify(profiles));
      localStorage.setItem(`paisa_active_profile_id_${userEmail}`, activeProfileId);

      const savedAccounts = localStorage.getItem("paisa_user_accounts");
      try {
        const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
        const exists = accounts.some((acc: any) => acc.email.toLowerCase() === userEmail);
        
        let updatedAccounts;
        if (exists) {
          updatedAccounts = accounts.map((acc: any) => {
            if (acc.email.toLowerCase() === userEmail) {
              return {
                ...acc,
                profilesList: profiles,
                activeProfileId: activeProfileId
              };
            }
            return acc;
          });
        } else {
          updatedAccounts = [
            ...accounts,
            {
              email: userEmail,
              name: sessionUser.name,
              profilesList: profiles,
              activeProfileId: activeProfileId,
              createdAt: new Date().toISOString()
            }
          ];
        }
        localStorage.setItem("paisa_user_accounts", JSON.stringify(updatedAccounts));
      } catch (e) {
        console.error("Sync user account error", e);
      }

      // Synchronize with Central Server Database dynamically on modification
      fetch("/api/auth/update-profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: sessionUser.email,
          profilesList: profiles,
          activeProfileId
        })
      })
      .then(res => {
        if (!res.ok) console.warn("Failed to update cloud portfolios ledger");
      })
      .catch(err => {
        console.error("Failed to connect with cloud portfolios ledger", err);
      });
    }
  }, [profiles, activeProfileId, profile, sessionUser, isLoadingProfiles]);

  const handleLoginSuccess = (
    user: { name: string; email: string },
    profilesList: UserProfile[],
    activeId: string
  ) => {
    setSessionUser(user);
    localStorage.setItem("paisa_active_session", JSON.stringify(user));
    
    const userEmail = user.email.toLowerCase();
    localStorage.setItem(`paisa_family_profiles_list_${userEmail}`, JSON.stringify(profilesList));
    localStorage.setItem(`paisa_active_profile_id_${userEmail}`, activeId);

    try {
      const savedAccounts = localStorage.getItem("paisa_user_accounts");
      const accounts = savedAccounts ? JSON.parse(savedAccounts) : [];
      const index = accounts.findIndex((a: any) => a.email.toLowerCase() === userEmail);
      const updatedAccount = {
        email: userEmail,
        name: user.name,
        profilesList: profilesList,
        activeProfileId: activeId,
        createdAt: new Date().toISOString()
      };
      if (index > -1) {
        accounts[index] = { ...accounts[index], ...updatedAccount };
      } else {
        accounts.push(updatedAccount);
      }
      localStorage.setItem("paisa_user_accounts", JSON.stringify(accounts));
    } catch (err) {
      console.error("Error setting user accounts list in handleLoginSuccess:", err);
    }

    setProfiles(profilesList);
    setActiveProfileId(activeId);
    setActiveWidget("profiles");
  };

  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your portfolio profiles to default? This cannot be undone.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleCreateProfile = (newProfile: UserProfile) => {
    setProfiles(prev => [...prev, newProfile]);
    setActiveProfileId(newProfile.id!);
  };

  const handleDeleteProfile = (profileId: string) => {
    const remaining = profiles.filter(p => p.id !== profileId);
    if (remaining.length > 0) {
      setProfiles(remaining);
      if (activeProfileId === profileId) {
        setActiveProfileId(remaining[0].id!);
      }
    }
  };

  const handleDuplicateProfile = (profileId: string) => {
    const origin = profiles.find(p => p.id === profileId);
    if (origin) {
      const duplicate: UserProfile = {
        ...origin,
        id: "profile-" + Date.now(),
        name: `${origin.name} (Scenario Model)`,
        pin: undefined // Strip pin from duplicate for instant testing
      };
      setProfiles(prev => [...prev, duplicate]);
      setActiveProfileId(duplicate.id);
    }
  };

  const menuItems = [
    {
      id: "profiles" as ActiveWidget,
      label: "Profiles & Accounts",
      desc: "Manage multiple family files",
      icon: <Users className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      id: "health" as ActiveWidget,
      label: "Health Scorecard",
      desc: "Overall wellness assessment",
      icon: <HeartPulse className="w-5 h-5" />,
      color: "text-bhagwa-600 bg-bhagwa-50 border-bhagwa-100",
    },
    {
      id: "salary" as ActiveWidget,
      label: "Govt / Pay Planner",
      desc: "DA, HRA & scale estimator",
      icon: <Landmark className="w-5 h-5" />,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      id: "sip" as ActiveWidget,
      label: "Step-Up SIP Plan",
      desc: "Compounding wealth growth",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "retirement" as ActiveWidget,
      label: "Retirement Roadmap",
      desc: "Inflation vs longevity cover",
      icon: <Compass className="w-5 h-5" />,
      color: "text-violet-600 bg-violet-50 border-violet-100",
    },
    {
      id: "goals" as ActiveWidget,
      label: "My Goal Planner",
      desc: "Plan weddings, homes, cars",
      icon: <Sparkles className="w-5 h-5" />,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      id: "tax" as ActiveWidget,
      label: "Tax Regime Optimizer",
      desc: "Compare Old vs. New Schemes",
      icon: <Scale className="w-5 h-5" />,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "networth" as ActiveWidget,
      label: "My Wealth Tracker",
      desc: "Map assets against active loans",
      icon: <Wallet className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "cibil" as ActiveWidget,
      label: "CIBIL Credit Score",
      desc: "Check & simulate Credit Health",
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-emerald-650 bg-emerald-50 border-emerald-110",
    },
    {
      id: "coach" as ActiveWidget,
      label: "Paisa AI Coach",
      desc: "Real-time chat & feedback",
      icon: <Bot className="w-5 h-5" />,
      color: "text-bhagwa-600 bg-bhagwa-50 border-bhagwa-100",
    },
  ];

  if (!sessionUser) {
    return (
      <AuthScreen 
        onLoginSuccess={handleLoginSuccess} 
        defaultProfile={defaultProfile} 
      />
    );
  }

  const isDefaultUser = sessionUser.email === "paisa.mm1301@gmail.com";

  // Helper to calculate net worth for active directories dashboard
  const calculateNetWorth = (p: UserProfile) => {
    const assets = (p.investments?.mutualFunds || 0) +
                   (p.investments?.stocks || 0) +
                   (p.investments?.gold || 0) +
                   (p.investments?.epf || 0) +
                   (p.investments?.ppf || 0) +
                   (p.investments?.nps || 0) +
                   (p.investments?.realEstate || 0) +
                   (p.currentSavings || 0);
    const liabilities = (p.loans?.homeLoan || 0) +
                        (p.loans?.carLoan || 0) +
                        (p.loans?.personalLoan || 0) +
                        (p.loans?.otherLoan || 0);
    return assets - liabilities;
  };

  const combinedWealth = profiles.reduce((sum, p) => sum + calculateNetWorth(p), 0);

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col justify-between text-slate-800 antialiased font-sans">
      {/* 2-Second Welcome Note Popup Overlay */}
      <AnimatePresence>
        {showWelcomePopup && (
          <motion.div
            id="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
          >
            <motion.div
              id="welcome-card"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center overflow-hidden"
            >
              {/* Premium Background Glow FX */}
              <div className="absolute -top-16 -left-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

              <div className="relative flex flex-col items-center gap-4">
                {/* Brand Logo & Decorative Accent */}
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-800 flex items-center justify-center shadow-lg border border-slate-700/50">
                  <img
                    src={paisaLogo}
                    alt="Paisa Blueprint"
                    className="w-10 h-10 object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-white tracking-tight uppercase font-display">
                    Paisa Blueprint
                  </h3>
                  <div className="flex items-center justify-center gap-1.5">
                    <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">
                      Salaried 🇮🇳
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      Smart Personal Finance
                    </span>
                  </div>
                </div>

                {/* Core Welcome Announcement */}
                <div className="mt-2 space-y-1">
                  <p className="text-base font-bold text-slate-100">
                    Thank You For Visiting Us!
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Loading your personalized salaried financial workspace. Get ready to compound savings, optimize taxes, and map out your dynamic wealth targets.
                  </p>
                </div>

                {/* 2-Second Linear Animation Progress Indicator bar */}
                <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden mt-3">
                  <motion.div
                    id="welcome-progress"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, ease: "linear" }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-orange-500 to-emerald-500"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Main Navigation Bar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 backdrop-blur-md bg-white/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          
          {/* Branded Logo */}
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl shadow-md bg-slate-950 flex items-center justify-center overflow-hidden">
              <img 
                src={paisaLogo} 
                alt="Paisa Blueprint Logo" 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-black text-slate-900 tracking-tight font-display uppercase">
                  Paisa Blueprint
                </h1>
                <span className="text-[9px] font-extrabold uppercase bg-emerald-500 text-white px-1.5 py-0.5 rounded-sm">
                  Salaried 🇮🇳
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                The Indian salaried personal finance adviser
              </p>
            </div>
          </div>

          {/* Right Area: Stats Bar + Premium Upper Right Sign-In Area */}
          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full sm:w-auto ml-auto">
            
            {/* Quick Stats & Profile parameters bar */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 bg-slate-50 border border-slate-100/80 px-3.5 py-2 rounded-xl text-xs">
              <button 
                onClick={() => setActiveWidget("profiles")}
                title="Click to manage all family accounts"
                className="flex items-center gap-1.5 hover:text-bhagwa-600 transition-colors text-left cursor-pointer font-bold text-slate-700 focus:outline-none"
              >
                <Users className="w-3.5 h-3.5 text-bhagwa-500" />
                <span>{profile.name || "Default user"}</span>
                <span className="text-[9px] uppercase tracking-wider bg-bhagwa-100 text-bhagwa-700 font-extrabold px-1 rounded-sm ml-0.5 animate-pulse">Switch</span>
              </button>
              <div className="h-4 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">Monthly Gross:</span>
                <span className="font-bold text-bhagwa-600 ml-1">₹{profile.salary.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">Age:</span>
                <span className="font-bold text-slate-700 ml-1">{profile.age} yrs</span>
              </div>
            </div>

            {/* Global Theme Toggle Button */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 text-slate-750 dark:text-amber-400 rounded-full cursor-pointer transition-all duration-200 flex items-center justify-center focus:outline-none shadow-3xs"
              title={isDarkMode ? "Switch to Day Light Mode" : "Switch to Night-Time High-Contrast Mode"}
              aria-label="Toggle High Contrast Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Paisabazar style Top-Right Sign In / User Profile Dropdown Menu */}
            <div className="relative">
              {isDefaultUser ? (
                <button
                  onClick={() => setSessionUser(null)}
                  className="flex items-center gap-1.5 bg-gradient-to-r from-bhagwa-500 to-amber-500 hover:from-bhagwa-600 hover:to-amber-600 active:scale-[0.98] text-white font-extrabold px-4 py-2 rounded-full text-xs shadow-xs hover:shadow-md transition-all cursor-pointer select-none focus:outline-none border-0"
                  title="Sign In or Register your custom cloud locker"
                >
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                    <User className="w-3" />
                  </div>
                  <span>Sign In</span>
                </button>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 pr-2.5 pl-1 py-1 rounded-full cursor-pointer select-none focus:outline-none transition-all text-xs shadow-3xs"
                    title="Account Options"
                  >
                    <div className="h-7 w-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black text-xs shrink-0 select-none shadow-xs">
                      {sessionUser.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-slate-700 max-w-[80px] truncate hidden sm:inline">
                      {sessionUser.name.split(" ")[0]}
                    </span>
                    <ChevronDown className={`w-3 h-3 text-slate-450 transition-transform duration-200 ${isProfileDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Menu Overlay */}
                  {isProfileDropdownOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setIsProfileDropdownOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-72 bg-white border border-slate-150 rounded-2xl shadow-xl z-50 py-3.5 px-4 space-y-3 text-xs text-left">
                        <div className="border-b border-slate-100 pb-2.5">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                              LOGGED IN ACCOUNT
                            </span>
                            {!isEditingAccountName && (
                              <button
                                onClick={() => {
                                  setIsEditingAccountName(true);
                                  setNewAccountName(sessionUser.name);
                                }}
                                className="text-bhagwa-600 hover:text-bhagwa-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                              >
                                <Edit2 className="w-2.5 h-2.5" /> Rename
                              </button>
                            )}
                          </div>

                          {isEditingAccountName ? (
                            <div className="flex items-center gap-1.5 mt-1.5">
                              <input
                                type="text"
                                value={newAccountName}
                                onChange={(e) => setNewAccountName(e.target.value)}
                                className="border border-slate-200 rounded-lg px-2 py-1 text-xs focus:ring-1 focus:ring-bhagwa-500 focus:outline-none font-bold text-slate-800 flex-1"
                                placeholder="Customize Name"
                                autoFocus
                              />
                              <button
                                onClick={handleSaveAccountName}
                                className="p-1.5 bg-bhagwa-100 hover:bg-bhagwa-200 text-bhagwa-800 rounded-lg cursor-pointer"
                                title="Save Profile Name"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setIsEditingAccountName(false)}
                                className="text-slate-450 hover:text-slate-600 font-bold px-1.5 py-1 text-xs"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <>
                              <span className="block font-black text-slate-800 text-sm leading-tight">
                                {sessionUser.name}
                              </span>
                              <span className="block font-mono text-[10px] text-slate-500 truncate mt-0.5">
                                {sessionUser.email}
                              </span>
                            </>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 border border-slate-100 rounded-lg p-2">
                            <span className="font-semibold">Data Storage:</span>
                            <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                              Cloud Sync Active
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              setActiveWidget("profiles");
                            }}
                            className="w-full text-left py-2 px-3 hover:bg-slate-50 rounded-xl font-bold text-slate-700 hover:text-slate-900 border border-transparent hover:border-slate-100 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            <Users className="w-3.5 h-3.5 text-bhagwa-500" />
                            <span>Family & Portfolio Profiles</span>
                          </button>
                        </div>

                        <div className="border-t border-slate-100 pt-2.5 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              handleResetData();
                            }}
                            className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 font-bold transition-colors cursor-pointer"
                            title="Reset all settings and data back to defaults"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reset App Data</span>
                          </button>

                          <button
                            onClick={() => {
                              setIsProfileDropdownOpen(false);
                              if (window.confirm("Do you want to sign out of your cloud session? Your active profiles will remain in this browser cache.")) {
                                setSessionUser({ name: "Deepak Kumar (Scenario Model)", email: "paisa.mm1301@gmail.com" });
                              }
                            }}
                            className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-700 font-extrabold text-[11px] rounded-lg transition-all flex items-center gap-1 hover:text-rose-800 cursor-pointer"
                          >
                            <LogOut className="w-3.5 h-3.5 text-rose-500" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col gap-8">
        
        {/* Concept 2: Elegant and futuristic glassmorphic dashboard panel representing directories */}
        <div className="w-full bg-slate-950 text-slate-100 border border-slate-800/90 rounded-3xl p-6 shadow-2xl relative overflow-hidden bg-radial from-slate-900 via-slate-950 to-slate-950">
          {/* Holographic background glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* Header of Concept 2 widget */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-emerald-400 animate-pulse" />
                <h2 className="text-sm font-black tracking-widest uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-emerald-450 to-cyan-400">
                  WEALTH HEALTH / PAISA BLUEPRINT
                </h2>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Active portfolios cockpit with real-time union tax sync & 7th pay appraisals.
              </p>
            </div>

            {/* Panel quick dashboard metrics and view customization controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-slate-900/80 border border-slate-800/50 px-3 py-1.5 rounded-xl font-mono text-[10px] text-slate-300 flex items-center gap-4">
                <div>
                  <span className="text-slate-500 uppercase text-[8px] tracking-wider block">ACTIVE PATHS</span>
                  <span className="font-bold text-white text-xs">{profiles.length} Directories</span>
                </div>
                <div className="h-6 w-px bg-slate-800" />
                <div>
                  <span className="text-slate-500 uppercase text-[8px] tracking-wider block">COLLECTIVE WEALTH</span>
                  <span className="font-bold text-emerald-400 text-xs">₹{combinedWealth.toLocaleString("en-IN")}</span>
                </div>
              </div>

              {/* Action buttons */}
              <button
                type="button"
                onClick={() => {
                  const id = "profile-" + Date.now();
                  const newProfile: UserProfile = {
                    id,
                    name: `Scenario ${profiles.length + 1}`,
                    age: 30,
                    retirementAge: 60,
                    salary: 100000,
                    city: "tier1",
                    maritalStatus: "single",
                    dependentsCount: 0,
                    currentSavings: 150000,
                    loans: { homeLoan: 0, carLoan: 0, personalLoan: 0, otherLoan: 0 },
                    investments: { mutualFunds: 60000, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 },
                    monthlyExpenses: 30000
                  };
                  handleCreateProfile(newProfile);
                }}
                className="py-2 px-3 bg-emerald-500 hover:bg-emerald-600 border border-emerald-400/20 text-white font-bold text-[10px] rounded-xl flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer font-mono"
                title="Create a new family active directory portfolio"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>NEW PATH</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDashboardSettings(!showDashboardSettings)}
                className={`py-2 px-3 rounded-xl transition-all cursor-pointer font-mono font-bold text-[10px] flex items-center gap-1.5 border ${
                  showDashboardSettings 
                    ? "bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.2)]" 
                    : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                }`}
                title="Toggle dashboard view options and edit portfolios"
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>CUSTOMIZE DIRECTORY</span>
              </button>
            </div>
          </div>

          {/* Dropdown Customization Controls Component */}
          {showDashboardSettings && (
            <div className="bg-slate-900/60 border border-slate-800/60 backdrop-blur-md p-4 rounded-2xl text-[11px] text-slate-300 space-y-4 mt-4 font-mono animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/50 pb-3">
                <div className="space-y-0.5">
                  <span className="font-bold text-[10px] text-emerald-400 uppercase tracking-widest block">
                    DIRECTORY VISIBILITY FILTERS
                  </span>
                  <p className="text-[9px] text-slate-400">Toggle which parameters show up on your glass active cards.</p>
                </div>
                <div className="flex flex-wrap gap-4 items-center bg-slate-950/40 p-2 rounded-xl border border-slate-800/30 font-sans font-medium text-xs">
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={dbOptions.name}
                      onChange={() => setDbOptions((prev: any) => ({ ...prev, name: !prev.name }))}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Name</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={dbOptions.age}
                      onChange={() => setDbOptions((prev: any) => ({ ...prev, age: !prev.age }))}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Age</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={dbOptions.grossMonthly}
                      onChange={() => setDbOptions((prev: any) => ({ ...prev, grossMonthly: !prev.grossMonthly }))}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Gross Salary</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={dbOptions.investments}
                      onChange={() => setDbOptions((prev: any) => ({ ...prev, investments: !prev.investments }))}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Investments</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={dbOptions.monthlySip}
                      onChange={() => setDbOptions((prev: any) => ({ ...prev, monthlySip: !prev.monthlySip }))}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-0 focus:ring-offset-0 w-3 h-3 cursor-pointer"
                    />
                    <span>Monthly SIP Target</span>
                  </label>
                </div>
              </div>

              {/* Dynamic Information Customization Form - Write directly to active path! */}
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                  <span className="font-black text-[10px] text-cyan-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                    FILL PORTFOLIO DATA FOR: <span className="text-white underline">{profile.name}</span>
                  </span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const duplicate: UserProfile = {
                          ...profile,
                          id: "profile-" + Date.now(),
                          name: `${profile.name} (Copy)`,
                          pin: undefined
                        };
                        handleCreateProfile(duplicate);
                      }}
                      className="px-2 py-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded text-[9px] hover:bg-slate-850 cursor-pointer font-bold transition-all"
                    >
                      CLONE PATH
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (profiles.length <= 1) {
                          alert("At least one active directory path must exist.");
                          return;
                        }
                        if (window.confirm(`Delete directory '${profile.name}'?`)) {
                          handleDeleteProfile(profile.id!);
                        }
                      }}
                      className="px-2 py-1 bg-rose-950/30 border border-rose-900/60 hover:bg-rose-950/50 hover:border-rose-700 text-rose-300 hover:text-rose-200 rounded text-[9px] cursor-pointer font-bold transition-all"
                    >
                      DELETE PATH
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-450 text-[9px] block uppercase tracking-wider font-extrabold text-emerald-400">Path/Name:</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={(e) => {
                        handleUpdateProfile({
                          ...profile,
                          name: e.target.value
                        });
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-left w-full text-white text-xs font-mono outline-hidden"
                      placeholder="e.g. Scenario Portfolios"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-450 text-[9px] block uppercase tracking-wider font-extrabold text-emerald-400">User Age (yrs):</label>
                    <input
                      type="number"
                      value={profile.age}
                      onChange={(e) => {
                        handleUpdateProfile({
                          ...profile,
                          age: Number(e.target.value) || 0
                        });
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-left w-full text-white text-xs font-mono outline-hidden"
                      placeholder="e.g. 32"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-450 text-[9px] block uppercase tracking-wider font-extrabold text-emerald-400">Gross Monthly (₹):</label>
                    <input
                      type="number"
                      value={profile.salary}
                      onChange={(e) => {
                        handleUpdateProfile({
                          ...profile,
                          salary: Number(e.target.value) || 0
                        });
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-left w-full text-white text-xs font-mono outline-hidden"
                      placeholder="e.g. 150000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-450 text-[9px] block uppercase tracking-wider font-extrabold text-emerald-400">Total Investment Base (₹):</label>
                    <input
                      type="number"
                      value={profile.investments?.mutualFunds || 0}
                      onChange={(e) => {
                        handleUpdateProfile({
                          ...profile,
                          investments: {
                            ...(profile.investments || { mutualFunds: 0, stocks: 0, gold: 0, epf: 0, ppf: 0, nps: 0, realEstate: 0 }),
                            mutualFunds: Number(e.target.value) || 0
                          }
                        });
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-left w-full text-white text-xs font-mono outline-hidden"
                      placeholder="e.g. 500000"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-450 text-[9px] block uppercase tracking-wider font-extrabold text-emerald-400">SIP Target Override (₹):</label>
                    <input
                      type="number"
                      placeholder={`${Math.round(profile.salary * 0.20)} (Auto 20%)`}
                      value={profile.customSip !== undefined ? profile.customSip : ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        handleUpdateProfile({
                          ...profile,
                          customSip: val === "" ? undefined : Number(val)
                        });
                      }}
                      className="bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-1.5 text-left w-full text-white text-xs font-mono outline-hidden placeholder-slate-650"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Directory Active Glass Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {profiles.map((p, idx) => {
              const isActive = p.id === activeProfileId;
              const nw = calculateNetWorth(p);
              
              // Calculate investment base
              const totalInv = (p.investments?.mutualFunds || 0) +
                               (p.investments?.stocks || 0) +
                               (p.investments?.gold || 0) +
                               (p.investments?.epf || 0) +
                               (p.investments?.ppf || 0) +
                               (p.investments?.nps || 0) +
                               (p.investments?.realEstate || 0);

              // Custom monthly SIP or 20% fallback selection
              const sipValue = p.customSip !== undefined ? p.customSip : Math.round(p.salary * 0.20);
              const sipLabel = p.customSip !== undefined ? "SIP TARGET:" : "SIP (20%):";

              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: idx * 0.08, ease: "easeOut" }}
                  onClick={() => setActiveProfileId(p.id!)}
                  className={`relative p-4 rounded-2xl border transition-all duration-300 flex flex-col gap-3 group cursor-pointer ${
                    isActive
                      ? "bg-slate-900/60 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/30"
                      : "bg-slate-950/20 border-slate-850 hover:bg-slate-900/40 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-start justify-between w-full">
                    <div className="flex items-center gap-2 truncate">
                      {isActive ? (
                        <FolderOpen className="w-5 h-5 text-emerald-450 shrink-0" />
                      ) : (
                        <Folder className="w-5 h-5 text-slate-500 shrink-0 group-hover:text-slate-400" />
                      )}
                      
                      <div className="flex flex-col truncate">
                        <span className="text-xs font-black tracking-tight truncate text-slate-200 group-hover:text-white">
                          {p.name}
                        </span>
                        <span className="text-[8px] text-slate-550 uppercase tracking-widest font-mono">
                          {isActive ? "ACTIVE PORTFOLIO" : "INACTIVE PATH"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1.5 self-center">
                      {profiles.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete directory '${p.name}'?`)) {
                              handleDeleteProfile(p.id!);
                            }
                          }}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-850/50 transition-all cursor-pointer"
                          title="Delete active path portfolio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-emerald-450 shadow-[0_0_8px_#10b981]" : "bg-slate-800"}`} />
                    </div>
                  </div>

                  {/* Customizable metrics list */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-850/50 text-[10px] font-mono text-slate-450">
                    <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                      <span className="text-[8.5px] uppercase text-slate-500 font-bold">TOTAL WEALTH:</span>
                      <strong className={nw >= 0 ? "text-emerald-400 font-bold" : "text-rose-450 font-bold"}>
                        ₹{nw.toLocaleString("en-IN")}
                      </strong>
                    </div>

                    {dbOptions.name && (
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                        <span className="text-[8.5px] uppercase text-slate-550">NAME:</span>
                        <span className="text-slate-300 font-extrabold truncate max-w-[120px]">{p.name}</span>
                      </div>
                    )}

                    {dbOptions.age && (
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                        <span className="text-[8.5px] uppercase text-slate-550">AGE:</span>
                        <span className="text-slate-300 font-extrabold">{p.age}y</span>
                      </div>
                    )}

                    {dbOptions.grossMonthly && (
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                        <span className="text-[8.5px] uppercase text-slate-555">GROSS:</span>
                        <span className="text-slate-300 font-extrabold">₹{p.salary.toLocaleString("en-IN")}/m</span>
                      </div>
                    )}

                    {dbOptions.investments && (
                      <div className="flex justify-between items-center pb-1 border-b border-slate-900">
                        <span className="text-[8.5px] uppercase text-slate-550">INVEST:</span>
                        <span className="text-slate-300 font-extrabold">₹{totalInv.toLocaleString("en-IN")}</span>
                      </div>
                    )}

                    {dbOptions.monthlySip && (
                      <div className="flex justify-between items-center">
                        <span className="text-[8.5px] uppercase text-slate-550">{sipLabel}</span>
                        <span className="text-cyan-400 font-extrabold">₹{sipValue.toLocaleString("en-IN")}/m</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Column Layout Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* Left Side Navigation Rails */}
          <section className="lg:col-span-3 space-y-6">

          <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-3xs space-y-2">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider px-3 block mb-1">
              FINANCE SUITE
            </span>
            <nav className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeWidget === item.id;
                return (
                  <button
                    key={item.id}
                    id={`menu-${item.id}`}
                    onClick={() => setActiveWidget(item.id)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl transition-all text-left cursor-pointer ${
                      isActive 
                        ? "bg-bhagwa-600 text-white font-semibold shadow-xs" 
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg transition-colors ${isActive ? "bg-white/10 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {item.icon}
                      </div>
                      <div>
                        <span className="block text-xs font-semibold">{item.label}</span>
                        <span className={`text-[10px] block font-normal ${isActive ? "text-bhagwa-200" : "text-slate-400"}`}>
                          {item.desc}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 opacity-50 ${isActive ? "text-white" : "text-slate-400"}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Discipline Notice Box */}
          <div className="bg-gradient-to-br from-bhagwa-50 to-bhagwa-100/50 border border-bhagwa-100 rounded-2xl p-5 space-y-3.5">
            <h4 className="font-bold text-bhagwa-950 flex items-center gap-1.5 font-display text-sm">
              <ShieldCheck className="w-5 h-5 text-bhagwa-600" /> Prudent Indian Financial Mandates
            </h4>
            <div className="text-[11px] text-slate-600 leading-relaxed space-y-2.5">
              <p>
                🛡️ <strong>Term over Life policies:</strong> Buy plain direct Term Insurance for 20x annual income instead of expensive moneyback ULIP schemes.
              </p>
              <p>
                📈 <strong>Harness direct mutual funds:</strong> Start an automated index SIP with annual step-up. Flat SIPs lose the power of regular wage appraisals.
              </p>
              <p>
                🏦 <strong>NPS Multipliers:</strong> Utilize the exclusive extra Section 80CCD(1B) up to ₹50,000 for efficient 30% slab deductions.
              </p>
            </div>
          </div>
        </section>

        {/* Middle Content Sheet */}
        <section ref={contentRef} className="lg:col-span-6 scroll-mt-24">
          <div className="space-y-6">
            
            {activeWidget === "profiles" && (
              <ProfileManager 
                currentProfile={profile}
                profiles={profiles}
                onSelectProfile={setActiveProfileId}
                onCreateProfile={handleCreateProfile}
                onDeleteProfile={handleDeleteProfile}
                onDuplicateProfile={handleDuplicateProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeWidget === "health" && (
              <FinancialHealthCheck profile={profile} onUpdateProfile={handleUpdateProfile} />
            )}

            {activeWidget === "salary" && (
              <SalaryPlanner profile={profile} />
            )}

            {activeWidget === "sip" && (
              <SIPCalculator />
            )}

            {activeWidget === "retirement" && (
              <RetirementPlanner />
            )}

            {activeWidget === "goals" && (
              <GoalPlanner />
            )}

            {activeWidget === "tax" && (
              <TaxPlanner profile={profile} />
            )}

            {activeWidget === "networth" && (
              <NetWorthTracker profile={profile} />
            )}

            {activeWidget === "cibil" && (
              <CibilCheck profile={profile} />
            )}

            {activeWidget === "coach" && (
              <AICoach profile={profile} />
            )}

          </div>
        </section>

        {/* Right Sidebar: Articles Guidance cabinet */}
        <section className="lg:col-span-3 space-y-6">
          <ArticlesColumn 
            onNavigateToWidget={(widgetId) => {
              setActiveWidget(widgetId);
              if (contentRef.current) {
                contentRef.current.scrollIntoView({ behavior: "smooth" });
              }
            }}
            userMonthlySalary={profile.salary}
          />
        </section>

        </div>
      </main>

      {/* Footer Design Credits Line */}
      <FooterSections />
    </div>
  );
}
