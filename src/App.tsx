import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { UserProfile, LoanDetails, InvestmentDetails, getShareableLink } from "./types";
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
import PensionCalculator from "./components/PensionCalculator";
import DebtPlanner from "./components/DebtPlanner";
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
  Trash2,
  Share2,
  TrendingDown
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
  | "cibil"
  | "pension"
  | "debt";

export default function App() {
  const [showWelcomePopup, setShowWelcomePopup] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcomePopup(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Automatic client-side cache migration to ensure "Scenario Model" label changes are rendered instantly
  useEffect(() => {
    try {
      const activeSess = localStorage.getItem("paisa_active_session");
      if (activeSess) {
        const parsed = JSON.parse(activeSess);
        if (parsed && parsed.email) {
          let updated = false;
          if (parsed.name === "Deepak Kumar" || parsed.name === "Scenario Model") {
            parsed.name = "Deepak Kumar (Scenario Model)";
            updated = true;
          } else if (parsed.name === "DEEPAK KUMAR" || parsed.name === "SCENARIO MODEL") {
            parsed.name = "DEEPAK KUMAR (SCENARIO MODEL)";
            updated = true;
          }
          if (updated) {
            localStorage.setItem("paisa_active_session", JSON.stringify(parsed));
            setSessionUser(parsed);
          }
        }
      }

      setProfiles(prevProfiles => {
        let changed = false;
        const updated = prevProfiles.map(p => {
          if (p.name === "Deepak Kumar" || p.name === "Scenario Model") {
            changed = true;
            return { ...p, name: "Deepak Kumar (Scenario Model)" };
          }
          if (p.name === "DEEPAK KUMAR" || p.name === "SCENARIO MODEL") {
            changed = true;
            return { ...p, name: "DEEPAK KUMAR (SCENARIO MODEL)" };
          }
          return p;
        });
        if (changed) {
          // Sync migrated profiles back to localStorage
          if (activeSess) {
            const parsed = JSON.parse(activeSess);
            localStorage.setItem(`paisa_family_profiles_list_${parsed.email.toLowerCase()}`, JSON.stringify(updated));
          }
          localStorage.setItem("paisa_family_profiles_list", JSON.stringify(updated));
          return updated;
        }
        return prevProfiles;
      });
    } catch (err) {
      console.warn("Client-side migration warning:", err);
    }
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
      id: "salary" as ActiveWidget,
      label: "Salary Calculator",
      desc: "DA, HRA & scale estimator",
      icon: <Landmark className="w-5 h-5" />,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      id: "pension" as ActiveWidget,
      label: "Pension Calculator",
      desc: "NPS and pension projection",
      icon: <Coins className="w-5 h-5 font-bold" />,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      id: "health" as ActiveWidget,
      label: "Health Scorecard",
      desc: "Overall wellness assessment",
      icon: <HeartPulse className="w-5 h-5" />,
      color: "text-bhagwa-600 bg-bhagwa-50 border-bhagwa-100",
    },
    {
      id: "sip" as ActiveWidget,
      label: "Plan SIP",
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
      id: "debt" as ActiveWidget,
      label: "Debt Freedom Planner",
      desc: "Accelerate debt payoffs with pre-payments",
      icon: <TrendingDown className="w-5 h-5" />,
      color: "text-rose-600 bg-rose-50 border-rose-100",
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

            {/* WhatsApp Share Button */}
            <button
              onClick={() => {
                const message = "Check out Paisa Blueprint - The Indian salaried personal finance adviser! Formulate your portfolio, optimize tax, simulate SIP and retirement targets. Try it live at: " + getShareableLink();
                window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, "_blank");
              }}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold rounded-full text-xs flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none border-0 shadow-3xs"
              title="Share Paisa Blueprint on WhatsApp to your friends or family"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

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
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-extrabold px-4 py-2 rounded-full text-xs shadow-xs hover:shadow-md transition-all cursor-pointer select-none focus:outline-none border-0"
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

        {/* Dynamic Brand Tagline & Action Banner */}
        <div id="brand-tagline-hero" className="relative overflow-hidden bg-gradient-to-br from-violet-100 via-white to-emerald-100/85 dark:from-[#24173d] dark:via-slate-900 dark:to-[#052b1e] border-2 border-violet-200/70 dark:border-emerald-500/30 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 shadow-md dark:shadow-xl dark:shadow-violet-950/20 transition-all duration-300">
          {/* Decorative glows & patterns using light purple and light green */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-violet-400/30 dark:bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-12 w-48 h-48 bg-emerald-400/30 dark:bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600/15 to-emerald-600/15 dark:from-violet-400/10 dark:to-emerald-400/10 border border-violet-300/40 dark:border-violet-500/30 px-3 py-1 rounded-full">
              <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse" />
              <span className="text-[10px] sm:text-xs font-bold tracking-widest text-violet-700 dark:text-violet-300 uppercase font-mono">
                India's Financial Operating System For SALARIED EMPLOYEES
              </span>
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-105 tracking-tight leading-relaxed font-display flex flex-wrap items-center gap-x-2 gap-y-1.5 relative z-10">
              <span className="bg-purple-500/5 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-500/30 !text-purple-700 dark:!text-purple-300 font-black">
                Plan Salary
              </span>
              <span className="!text-purple-500 dark:!text-purple-400 font-extrabold text-base">•</span>
              <span className="bg-purple-500/5 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-500/30 !text-purple-700 dark:!text-purple-300 font-black">
                Calculate Salary
              </span>
              <span className="!text-purple-500 dark:!text-purple-400 font-extrabold text-base">•</span>
              <span className="bg-purple-500/5 dark:bg-purple-500/20 px-2.5 py-0.5 rounded-lg border border-purple-200/50 dark:border-purple-500/30 !text-purple-700 dark:!text-purple-300 font-black">
                Do SIP
              </span>
              <span className="!text-purple-500 dark:!text-purple-400 font-extrabold text-base">•</span>
              <span className="bg-emerald-500/5 dark:bg-emerald-500/20 px-3 py-1 rounded-lg border border-emerald-200/60 dark:border-emerald-500/30 !text-emerald-700 dark:!text-emerald-300 font-black shadow-sm">
                Build Wealth
              </span>
            </h2>
          </div>

          <div className="relative z-10 shrink-0 self-start md:self-auto flex flex-col gap-2">
            <button
              type="button"
              id="hero-calculate-salary-btn"
              onClick={() => {
                setActiveWidget("salary");
                if (contentRef.current) {
                  contentRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500/50 active:scale-[0.98] text-white font-extrabold uppercase tracking-wider rounded-xl text-xs sm:text-sm transition-all shadow-md hover:shadow-lg hover:shadow-emerald-600/10 cursor-pointer flex items-center justify-center gap-2 border-0"
            >
              <span>Calculate Your Salary</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              id="hero-plan-sip-btn"
              onClick={() => {
                setActiveWidget("sip");
                if (contentRef.current) {
                  contentRef.current.scrollIntoView({ behavior: "smooth" });
                }
              }}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-850 dark:bg-slate-800 dark:hover:bg-slate-750 text-white dark:text-slate-100 font-bold uppercase tracking-wider rounded-lg text-xs transition-all shadow-sm cursor-pointer flex items-center justify-center gap-1.5 border border-slate-800 dark:border-slate-700"
            >
              <span>Plan SIP</span>
              <ChevronRight className="w-3 h-3 text-emerald-400" />
            </button>
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
          <div className="bg-bhagwa-50 border border-bhagwa-100 rounded-2xl p-5 space-y-3.5">
            <h4 className="font-bold text-bhagwa-950 dark:text-bhagwa-200 flex items-center gap-1.5 font-display text-sm">
              <ShieldCheck className="w-5 h-5 text-bhagwa-600 dark:text-bhagwa-500" /> Prudent Indian Financial Mandates
            </h4>
            <div className="text-[11px] text-slate-750 dark:text-slate-200 leading-relaxed space-y-2.5">
              <p>
                🛡️ <strong className="font-extrabold text-slate-900 dark:text-white">Term over Life policies:</strong> Buy plain direct Term Insurance for 20x annual income instead of expensive moneyback ULIP schemes.
              </p>
              <p>
                📈 <strong className="font-extrabold text-slate-900 dark:text-white">Harness direct mutual funds:</strong> Start an automated index SIP with annual step-up. Flat SIPs lose the power of regular wage appraisals.
              </p>
              <p>
                🏦 <strong className="font-extrabold text-slate-900 dark:text-white">NPS Multipliers:</strong> Utilize the exclusive extra Section 80CCD(1B) up to ₹50,000 for efficient 30% slab deductions.
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

            {activeWidget === "salary" && (
              <SalaryPlanner profile={profile} />
            )}

            {activeWidget === "pension" && (
              <PensionCalculator />
            )}

            {activeWidget === "health" && (
              <FinancialHealthCheck profile={profile} onUpdateProfile={handleUpdateProfile} />
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

            {activeWidget === "debt" && (
              <DebtPlanner profile={profile} />
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
