import React, { useState, useEffect, useMemo, useCallback } from "react";
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
import SeoHub from "./components/SeoHub";
import PaiseToRupee from "./components/PaiseToRupee";
import BpscTeacherSalary from "./components/BpscTeacherSalary";
import BiharDaCalculator from "./components/BiharDaCalculator";
import GovtEmployeeSipCalculator from "./components/GovtEmployeeSipCalculator";
import NpsGovtCalculator from "./components/NpsGovtCalculator";
import EightPayCommissionHub from "./components/EightPayCommissionHub";
// @ts-ignore
import paisaLogo from "./assets/images/deep_paisa_logo_1780484307855.png";

import { 
  HeartPulse, 
  Landmark, 
  TrendingUp, 
  Compass, 
  Scale, 
  Wallet, 
  Percent, 
  Bot, 
  Coins, 
  Sliders, 
  ChevronRight, 
  ShieldCheck, 
  Sparkles,
  Award,
  BookOpen,
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
  TrendingDown,
  IndianRupee
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
  | "seohub"
  | "learning"
  | "debt"
  | "bpsc_salary"
  | "bihar_da"
  | "govt_sip"
  | "nps_govt"
  | "eight_pay_calc"
  | "eight_pay_fitment"
  | "eight_pay_hike"
  | "eight_pay_pension"
  | "eight_pay_news"
  | "eight_pay_fitment_info"
  | "eight_pay_chart"
  | "eight_pay_date"
  | "eight_pay_teachers";

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
  const isDarkMode = false;

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
    document.documentElement.classList.remove("dark");
    localStorage.setItem("paisa_theme", "light");
  }, []);

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

  const [activeWidget, setActiveWidget] = useState<ActiveWidget>(() => {
    const getWidgetFromPath = (pathName: string): ActiveWidget => {
      const cleanPath = pathName.replace(/\/$/, "").toLowerCase();
      if (cleanPath === "/bpsc-teacher-salary-calculator" || cleanPath === "/bihar-teacher-salary-calculator") return "bpsc_salary";
      if (cleanPath === "/bihar-da-calculator") return "bihar_da";
      if (cleanPath === "/government-employee-sip-calculator") return "govt_sip";
      if (cleanPath === "/nps-calculator-for-government-employees") return "nps_govt";
      if (cleanPath === "/salary-calculator") return "salary";
      if (cleanPath === "/pension-calculator") return "pension";
      if (cleanPath === "/plan-sip" || cleanPath === "/sip-planner") return "sip";
      if (cleanPath === "/paise-to-rupee-wisdom") return "learning";
      if (cleanPath === "/health-scorecard") return "health";
      if (cleanPath === "/retirement-roadmap") return "retirement";
      if (cleanPath === "/my-goal-planner") return "goals";
      if (cleanPath === "/tax-regime-optimizer") return "tax";
      if (cleanPath === "/my-wealth-tracker") return "networth";
      if (cleanPath === "/cabinet-and-resources") return "seohub";
      if (cleanPath === "/cibil-credit-card") return "cibil";
      if (cleanPath === "/debt-freedom-planner") return "debt";
      if (cleanPath === "/paisa-ai-coach") return "coach";
      if (cleanPath === "/8th-pay-commission-calculator") return "eight_pay_calc";
      if (cleanPath === "/8th-pay-fitment-factor-calculator") return "eight_pay_fitment";
      if (cleanPath === "/8th-pay-salary-hike-calculator") return "eight_pay_hike";
      if (cleanPath === "/8th-pay-pension-calculator") return "eight_pay_pension";
      if (cleanPath === "/8th-pay-commission-latest-news") return "eight_pay_news";
      if (cleanPath === "/8th-pay-commission-fitment-factor") return "eight_pay_fitment_info";
      if (cleanPath === "/8th-pay-commission-salary-chart") return "eight_pay_chart";
      if (cleanPath === "/8th-pay-commission-date") return "eight_pay_date";
      if (cleanPath === "/8th-pay-commission-for-teachers") return "eight_pay_teachers";
      return "profiles";
    };

    if (typeof window !== "undefined") {
      // 1. Try URL parameters first for backwards compatibility
      const params = new URLSearchParams(window.location.search);
      let queryWidget = params.get("widget") || params.get("tool") || params.get("calc");
      if (queryWidget) {
        if (queryWidget === "bpsc_salary" || queryWidget === "bpsc-salary") return "bpsc_salary";
        if (queryWidget === "bihar_da" || queryWidget === "bihar-da" || queryWidget === "da") return "bihar_da";
        if (queryWidget === "govt_sip" || queryWidget === "govt-sip") return "govt_sip";
        if (queryWidget === "nps_govt" || queryWidget === "nps-govt" || queryWidget === "pension-nps") return "nps_govt";
        
        // 8th Pay Aliases
        if (queryWidget === "8th_pay_calc" || queryWidget === "8th-pay-calc" || queryWidget === "eight-pay-calc") queryWidget = "eight_pay_calc";
        if (queryWidget === "8th_pay_fitment" || queryWidget === "8th-pay-fitment" || queryWidget === "eight-pay-fitment") queryWidget = "eight_pay_fitment";
        if (queryWidget === "8th_pay_hike" || queryWidget === "8th-pay-hike" || queryWidget === "eight-pay-hike") queryWidget = "eight_pay_hike";
        if (queryWidget === "8th_pay_pension" || queryWidget === "8th-pay-pension" || queryWidget === "eight-pay-pension") queryWidget = "eight_pay_pension";
        if (queryWidget === "8th_pay_news" || queryWidget === "8th-pay-news" || queryWidget === "eight-pay-news") queryWidget = "eight_pay_news";
        if (queryWidget === "8th_pay_fitment_info" || queryWidget === "8th-pay-fitment-info" || queryWidget === "eight-pay-fitment-info") queryWidget = "eight_pay_fitment_info";
        if (queryWidget === "8th_pay_chart" || queryWidget === "8th-pay-chart" || queryWidget === "eight-pay-chart") queryWidget = "eight_pay_chart";
        if (queryWidget === "8th_pay_date" || queryWidget === "8th-pay-date" || queryWidget === "eight-pay-date") queryWidget = "eight_pay_date";
        if (queryWidget === "8th_pay_teachers" || queryWidget === "8th-pay-teachers" || queryWidget === "eight-pay-teachers") queryWidget = "eight_pay_teachers";

        const validWidgets = [
          "profiles", "salary", "pension", "health", "sip", "retirement",
          "goals", "tax", "networth", "cibil", "debt", "coach", "seohub", "learning",
          "eight_pay_calc", "eight_pay_fitment", "eight_pay_hike", "eight_pay_pension",
          "eight_pay_news", "eight_pay_fitment_info", "eight_pay_chart", "eight_pay_date", "eight_pay_teachers"
        ];
        if (validWidgets.includes(queryWidget)) {
          return queryWidget as ActiveWidget;
        }
      }

      // 2. Fall back to pathname patterns
      return getWidgetFromPath(window.location.pathname);
    }
    return "profiles";
  });

  const [language, setLanguage] = useState<"en" | "hi">(() => {
    return (localStorage.getItem("paisa_language") as "en" | "hi") || "en";
  });

  const getPathFromWidget = useCallback((widget: ActiveWidget): string => {
    if (widget === "profiles") return "/";
    if (widget === "bpsc_salary") return "/bpsc-teacher-salary-calculator";
    if (widget === "bihar_da") return "/bihar-da-calculator";
    if (widget === "govt_sip") return "/government-employee-sip-calculator";
    if (widget === "nps_govt") return "/nps-calculator-for-government-employees";
    if (widget === "salary") return "/salary-calculator";
    if (widget === "pension") return "/pension-calculator";
    if (widget === "sip") return "/plan-sip";
    if (widget === "learning") return "/paise-to-rupee-wisdom";
    if (widget === "health") return "/health-scorecard";
    if (widget === "retirement") return "/retirement-roadmap";
    if (widget === "goals") return "/my-goal-planner";
    if (widget === "tax") return "/tax-regime-optimizer";
    if (widget === "networth") return "/my-wealth-tracker";
    if (widget === "seohub") return "/cabinet-and-resources";
    if (widget === "cibil") return "/cibil-credit-card";
    if (widget === "debt") return "/debt-freedom-planner";
    if (widget === "coach") return "/paisa-ai-coach";
    if (widget === "eight_pay_calc") return "/8th-pay-commission-calculator";
    if (widget === "eight_pay_fitment") return "/8th-pay-fitment-factor-calculator";
    if (widget === "eight_pay_hike") return "/8th-pay-salary-hike-calculator";
    if (widget === "eight_pay_pension") return "/8th-pay-pension-calculator";
    if (widget === "eight_pay_news") return "/8th-pay-commission-latest-news";
    if (widget === "eight_pay_fitment_info") return "/8th-pay-commission-fitment-factor";
    if (widget === "eight_pay_chart") return "/8th-pay-commission-salary-chart";
    if (widget === "eight_pay_date") return "/8th-pay-commission-date";
    if (widget === "eight_pay_teachers") return "/8th-pay-commission-for-teachers";
    return "/";
  }, []);

  // Keep path and page title in sync with activeWidget
  useEffect(() => {
    if (typeof window === "undefined") return;

    let targetTitle = "Salary Calculator • NPS Calculator Pension Calculator SIP Calculator";
    let targetPath = getPathFromWidget(activeWidget);

    if (activeWidget === "bpsc_salary") {
      targetTitle = "BPSC Teacher Salary Calculator 2026 | Paisa Blueprint";
    } else if (activeWidget === "bihar_da") {
      targetTitle = "Bihar Dearness Allowance (DA) Calculator 2026 | Paisa Blueprint";
    } else if (activeWidget === "govt_sip") {
      targetTitle = "Government Employee SIP Calculator & Retirement Planner | Paisa Blueprint";
    } else if (activeWidget === "nps_govt") {
      targetTitle = "BPSC Teacher NPS & Pension Calculator 2026 | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_calc") {
      targetTitle = "8th Pay Commission Salary Calculator 2026 | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_fitment") {
      targetTitle = "8th Pay Commission Fitment Factor Calculator | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_hike") {
      targetTitle = "8th Pay Commission Salary Hike Calculator | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_pension") {
      targetTitle = "8th Pay Commission Pension Calculator | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_news") {
      targetTitle = "8th Pay Commission Latest News & Projections | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_fitment_info") {
      targetTitle = "8th Pay Commission Fitment Factor Guide | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_chart") {
      targetTitle = "8th Pay Commission Pay Matrix & Salary Chart | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_date") {
      targetTitle = "8th Pay Commission Expected Implementation Date | Paisa Blueprint";
    } else if (activeWidget === "eight_pay_teachers") {
      targetTitle = "8th Pay Commission State Teachers Salary Growth | Paisa Blueprint";
    } else if (activeWidget !== "profiles" && activeWidget !== "dashboard") {
      const capitalized = activeWidget.charAt(0).toUpperCase() + activeWidget.slice(1);
      targetTitle = `${capitalized} Tool | Paisa Blueprint`;
    }

    document.title = targetTitle;

    // Dynamically update meta description to target SEO snippet
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', "Visit India's Own Salaried Personal Calculator");

    const currentFull = window.location.pathname;
    if (currentFull.replace(/\/$/, "") !== targetPath.replace(/\/$/, "")) {
      window.history.pushState({ widget: activeWidget }, "", targetPath);
    }
  }, [activeWidget, getPathFromWidget]);

  // Handle browser back & forward buttons
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (typeof window === "undefined") return;

      // 1. Try URL parameters first
      const params = new URLSearchParams(window.location.search);
      let queryWidget = params.get("widget") || params.get("tool") || params.get("calc");
      if (queryWidget) {
        if (queryWidget === "bpsc_salary" || queryWidget === "bpsc-salary") {
          setActiveWidget("bpsc_salary");
          return;
        }
        if (queryWidget === "bihar_da" || queryWidget === "bihar-da" || queryWidget === "da") {
          setActiveWidget("bihar_da");
          return;
        }
        if (queryWidget === "govt_sip" || queryWidget === "govt-sip") {
          setActiveWidget("govt_sip");
          return;
        }
        if (queryWidget === "nps_govt" || queryWidget === "nps-govt" || queryWidget === "pension-nps") {
          setActiveWidget("nps_govt");
          return;
        }

        // 8th Pay Aliases
        if (queryWidget === "8th_pay_calc" || queryWidget === "8th-pay-calc" || queryWidget === "eight-pay-calc") queryWidget = "eight_pay_calc";
        if (queryWidget === "8th_pay_fitment" || queryWidget === "8th-pay-fitment" || queryWidget === "eight-pay-fitment") queryWidget = "eight_pay_fitment";
        if (queryWidget === "8th_pay_hike" || queryWidget === "8th-pay-hike" || queryWidget === "eight-pay-hike") queryWidget = "eight_pay_hike";
        if (queryWidget === "8th_pay_pension" || queryWidget === "8th-pay-pension" || queryWidget === "eight-pay-pension") queryWidget = "eight_pay_pension";
        if (queryWidget === "8th_pay_news" || queryWidget === "8th-pay-news" || queryWidget === "eight-pay-news") queryWidget = "eight_pay_news";
        if (queryWidget === "8th_pay_fitment_info" || queryWidget === "8th-pay-fitment-info" || queryWidget === "eight-pay-fitment-info") queryWidget = "eight_pay_fitment_info";
        if (queryWidget === "8th_pay_chart" || queryWidget === "8th-pay-chart" || queryWidget === "eight-pay-chart") queryWidget = "eight_pay_chart";
        if (queryWidget === "8th_pay_date" || queryWidget === "8th-pay-date" || queryWidget === "eight-pay-date") queryWidget = "eight_pay_date";
        if (queryWidget === "8th_pay_teachers" || queryWidget === "8th-pay-teachers" || queryWidget === "eight-pay-teachers") queryWidget = "eight_pay_teachers";

        const validWidgets = [
          "profiles", "salary", "pension", "health", "sip", "retirement",
          "goals", "tax", "networth", "cibil", "debt", "coach", "seohub", "learning",
          "eight_pay_calc", "eight_pay_fitment", "eight_pay_hike", "eight_pay_pension",
          "eight_pay_news", "eight_pay_fitment_info", "eight_pay_chart", "eight_pay_date", "eight_pay_teachers"
        ];
        if (validWidgets.includes(queryWidget)) {
          setActiveWidget(queryWidget as ActiveWidget);
          return;
        }
      }

      // 2. Pathname compatibility fallback
      const getWidgetFromPath = (pathName: string): ActiveWidget => {
        const cleanPath = pathName.replace(/\/$/, "").toLowerCase();
        if (cleanPath === "/bpsc-teacher-salary-calculator" || cleanPath === "/bihar-teacher-salary-calculator") return "bpsc_salary";
        if (cleanPath === "/bihar-da-calculator") return "bihar_da";
        if (cleanPath === "/government-employee-sip-calculator") return "govt_sip";
        if (cleanPath === "/nps-calculator-for-government-employees") return "nps_govt";
        if (cleanPath === "/salary-calculator") return "salary";
        if (cleanPath === "/pension-calculator") return "pension";
        if (cleanPath === "/plan-sip" || cleanPath === "/sip-planner") return "sip";
        if (cleanPath === "/paise-to-rupee-wisdom") return "learning";
        if (cleanPath === "/health-scorecard") return "health";
        if (cleanPath === "/retirement-roadmap") return "retirement";
        if (cleanPath === "/my-goal-planner") return "goals";
        if (cleanPath === "/tax-regime-optimizer") return "tax";
        if (cleanPath === "/my-wealth-tracker") return "networth";
        if (cleanPath === "/cabinet-and-resources") return "seohub";
        if (cleanPath === "/cibil-credit-card") return "cibil";
        if (cleanPath === "/debt-freedom-planner") return "debt";
        if (cleanPath === "/paisa-ai-coach") return "coach";
        if (cleanPath === "/8th-pay-commission-calculator") return "eight_pay_calc";
        if (cleanPath === "/8th-pay-fitment-factor-calculator") return "eight_pay_fitment";
        if (cleanPath === "/8th-pay-salary-hike-calculator") return "eight_pay_hike";
        if (cleanPath === "/8th-pay-pension-calculator") return "eight_pay_pension";
        if (cleanPath === "/8th-pay-commission-latest-news") return "eight_pay_news";
        if (cleanPath === "/8th-pay-commission-fitment-factor") return "eight_pay_fitment_info";
        if (cleanPath === "/8th-pay-commission-salary-chart") return "eight_pay_chart";
        if (cleanPath === "/8th-pay-commission-date") return "eight_pay_date";
        if (cleanPath === "/8th-pay-commission-for-teachers") return "eight_pay_teachers";
        return "profiles";
      };

      setActiveWidget(getWidgetFromPath(window.location.pathname));
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const widgetShareText = useMemo(() => {
    let currentUrl = "https://paisablueprint.in/";
    if (typeof window !== "undefined") {
      const base = window.location.origin;
      const widgetPath = getPathFromWidget(activeWidget);
      const search = window.location.search || "";
      currentUrl = widgetPath === "/" ? `${base}/${search}` : `${base}${widgetPath}${search}`;
    }
    let title = "";
    if (activeWidget === "profiles") {
      title = language === "hi" 
        ? `🎯 मैंने Paisa Master पर अपना वित्तीय प्रोफाइल बनाया! अपनी आय, निवेश और ऋणों का विवरण देखें:` 
        : `🎯 I completed my financial catalog and portfolio on Paisa Master! Manage your income, assets & loans:`;
    } else if (activeWidget === "salary") {
      title = language === "hi"
        ? `💰 मैंने अपने टेक-होम वेतन, भत्तों और आयकर स्लैब की सटीक गणना की!`
        : `💰 Just calculated my exact take-home salary and post-deductions breakdown on Paisa Planner!`;
    } else if (activeWidget === "pension") {
      title = language === "hi"
        ? `👴 मैंने रिटायरमेंट के बाद अपनी अंतिम पेंशन और ग्रेच्युटी संचय का सटीक अनुमान लगाया!`
        : `👴 Mapped my exact post-retirement pension income and gratuity projections here:`;
    } else if (activeWidget === "health") {
      title = language === "hi"
        ? `🏥 मैंने अपना व्यक्तिगत वित्तीय स्वास्थ्य स्कोर और रेटिंग मापी! मेरा स्कोर सुधारने के टिप्स देखें:`
        : `🏥 Just audited my financial health performance standard index, with expert suggestions:`;
    } else if (activeWidget === "sip") {
      title = language === "hi"
        ? `📈 मैंने अपने म्यूचुअल फंड निवेश (SIP) पर मिलने वाले चक्रवृद्धि लाभ (Compounding) की गणना की!`
        : `📈 Calibrated my mutual fund SIP returns and compounding multiplier on the wealth dashboard:`;
    } else if (activeWidget === "retirement") {
      title = language === "hi"
        ? `🌴 मैंने अपनी सेवानिवृत्ति (Retirement) आवश्यकता और मासिक एसआईपी सहेजा लक्ष्य पाया!`
        : `🌴 Computed my optimal retirement nest-egg goals and startup monthly SIP on this panel:`;
    } else if (activeWidget === "goals") {
      title = language === "hi"
        ? `🎯 मैंने अपने घर, कार, शादी और उच्च शिक्षा जैसे लक्ष्यों के लिए भविष्य बचत की योजना बनाई!`
        : `🎯 Designed custom monthly target buckets for all my future core wealth dreams:`;
    } else if (activeWidget === "tax") {
      title = language === "hi"
        ? `⚖️ मैंने पुरानी बनाम नई कर व्यवस्था (Old vs New Tax Regime) की तुलना करके कर बचत पहचानी!`
        : `⚖️ Compared New vs Old Tax Regime on my income class to check my best tax-saving path:`;
    } else if (activeWidget === "networth") {
      title = language === "hi"
        ? `🏛️ मैंने अपने सभी एसेट्स और ऋणों का शुद्ध संतुलन (Net Worth) मापा!`
        : `🏛️ Verified my absolute Net Worth and asset-liability ratio balance chart here:`;
    } else if (activeWidget === "cibil") {
      title = language === "hi"
        ? `💳 मैंने अपनी ऋण योग्यता और सिबिल (CIBIL Score) रेटिंग तथा सिबिल सुधारने के मार्ग खोजे!`
        : `💳 Understood my credit score tiering, factors and tips to safely level up my CIBIL score:`;
    } else if (activeWidget === "debt") {
      title = language === "hi"
        ? `🛑 मैंने अपने लोन को तेजी से चुकाने (Debt Payoff) और ईएमआई (EMI) घटाने की योजना बनाई!`
        : `🛑 Structured my loan repayment timeline and custom debt paydown strategies here:`;
    } else if (activeWidget === "coach") {
      title = language === "hi"
        ? `🤖 मैंने अपने पर्सनल एआई वित्तीय कोच (Gemini Financial AI) से बातचीत की और विशेषज्ञ सलाह पायी!`
        : `🤖 Queried custom wealth and asset protection guidelines from this advanced Gemini AI Financial Coach!`;
    } else if (activeWidget === "seohub") {
      title = language === "hi"
        ? `📚 मैंने वित्तीय टूलों, लोन नियमों, पीपीएफ नियमों और बचत योजनाओं का अध्ययन किया!`
        : `📚 Gained direct insights into Indian tax rules, debt guidelines and banking standards:`;
    } else if (activeWidget === "learning") {
      title = language === "hi"
        ? `🔥 पैसे से पैसा बनाना सीखो! ₹5,000 SIP, तुलनात्मक FD, ₹1 करोड़ रोडमैप, बजट और FIRE नियम...`
        : `🔥 Learn to grow money! ₹5,000 SIP returns, FD vs SIP battles, ₹1 Crore goals, 50-30-20 budget rules...`;
    } else if (activeWidget === "eight_pay_calc") {
      title = language === "hi"
        ? `📊 मैंने 8वें वेतन आयोग के बाद अपने वेतन वृद्धि और नए मूल वेतन का अनुमान लगाया!`
        : `📊 I projected my estimated salary hike & revised basic pay under the 8th Pay Commission!`;
    } else if (activeWidget === "eight_pay_fitment") {
      title = language === "hi"
        ? `📈 मैंने 1.92, 2.57, 2.86 और 3.00 फिटमेंट फैक्टर के साथ 8वें वेतन आयोग के वेतन की गणना की!`
        : `📈 I calculated my 8th Pay Commission revised basic with 1.92, 2.57, 2.86 and 3.00 fitment factors!`;
    } else if (activeWidget === "eight_pay_hike") {
      title = language === "hi"
        ? `🔥 मैंने 8वें वेतन आयोग से अपनी कुल वेतन वृद्धि का सटीक आकलन किया!`
        : `🔥 I analyzed my exact percentage salary growth with 8th CPC projections!`;
    } else if (activeWidget === "eight_pay_pension") {
      title = language === "hi"
        ? `👵 मैंने 8वें वेतन आयोग के फिटमेंट फैक्टर के साथ अपनी संशोधित पेंशन का अनुमान लगाया!`
        : `👵 Proportional pension assessment for 8th pay revision matrix calculated here:`;
    } else if (activeWidget === "eight_pay_news") {
      title = language === "hi"
        ? `📰 8वें वेतन आयोग के कार्यान्वयन और सरकार के नवीनतम अपडेट की जाँच करें!`
        : `📰 Read the latest official news and recommendations for the 8th Pay Commission:`;
    } else if (activeWidget === "eight_pay_fitment_info") {
      title = language === "hi"
        ? `🔍 8वें वेतन आयोग के फिटमेंट फैक्टर और इसके विभिन्न प्रस्तावों की पूरी जानकारी!`
        : `🔍 Detailed guide on how 8th CPC fitment factors affect central & state scales:`;
    } else if (activeWidget === "eight_pay_chart") {
      title = language === "hi"
        ? `📋 8वें वेतन आयोग का वेतन मैट्रिक्स और अपनी पे-लेवल का नया मूल वेतन चार्ट देखें!`
        : `📋 Explored the projected 8th Pay Commission salary matrix and pay-level chart here:`;
    } else if (activeWidget === "eight_pay_date") {
      title = language === "hi"
        ? `📅 8वां वेतन आयोग कब लागू होगा? संभावित समय सीमा और एरियर की तिथि देखें!`
        : `📅 Expected official resolution timeline & arrears date for the 8th Pay Commission:`;
    } else if (activeWidget === "eight_pay_teachers") {
      title = language === "hi"
        ? `🍎 सरकारी शिक्षकों के वेतन पर 8वें वेतन आयोग का प्रभाव और नई वेतन संरचना!`
        : `🍎 Calculated state government and teacher pay grid impact under 8th CPC:`;
    }

    return encodeURIComponent(`${title}\n${currentUrl}`);
  }, [activeWidget, language]);

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
      id: "eight_pay_calc" as ActiveWidget,
      label: language === "hi" ? "8वां वेतन आयोग हब" : "8th Pay Commission Hub",
      desc: language === "hi" ? "वेतन वृद्धि, फिटमेंट फैक्टर और 8वें वेतन आकलन 2026" : "Calculators & guides structure of 8th CPC",
      icon: <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500/20" />,
      color: "text-violet-650 bg-violet-50 border-violet-100",
    },
    {
      id: "bpsc_salary" as ActiveWidget,
      label: language === "hi" ? "BPSC शिक्षक वेतन" : "BPSC Teacher Salary",
      desc: language === "hi" ? "बिहार शिक्षक भर्ती वेतन आकलन 2026" : "Bihar BPSC teacher scales",
      icon: <Award className="w-5 h-5" />,
      color: "text-teal-650 bg-teal-50 border-teal-100",
    },
    {
      id: "nps_govt" as ActiveWidget,
      label: language === "hi" ? "BPSC शिक्षक NPS और पेंशन कैलकुलेटर" : "BPSC Teacher NPS And Pension Calculator",
      desc: language === "hi" ? "नियमित शिक्षक पेंशन एवं राष्ट्रीय पेंशन प्रणाली लेखाचित्र" : "National pension scheme & teacher retirement pension ledger",
      icon: <Landmark className="w-5 h-5" />,
      color: "text-violet-650 bg-violet-50 border-violet-100",
    },
    {
      id: "govt_sip" as ActiveWidget,
      label: language === "hi" ? "BPSC शिक्षक SIP" : "BPSC Teacher SIP",
      desc: language === "hi" ? "वेतन वृद्धि + SIP का चक्रवृद्धि प्रभाव" : "Salary increment + compounding planner",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-indigo-650 bg-indigo-50 border-indigo-110",
    },
    {
      id: "bihar_da" as ActiveWidget,
      label: language === "hi" ? "BPSC शिक्षक DA कैलकुलेटर" : "BPSC Teacher DA Calculator",
      desc: language === "hi" ? "राज्य कर्मियों का महंगाई भत्ता गणना 2026" : "Bihar state employee dearness allowance",
      icon: <Percent className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "profiles" as ActiveWidget,
      label: language === "hi" ? "प्रोफ़ाइल और खाते" : "Profiles & Accounts",
      desc: language === "hi" ? "एकाधिक पारिवारिक फाइलें संभालें" : "Manage multiple family files",
      icon: <Users className="w-5 h-5" />,
      color: "text-orange-600 bg-orange-50 border-orange-100",
    },
    {
      id: "salary" as ActiveWidget,
      label: language === "hi" ? "वेतन कैलकुलेटर" : "Salary Calculator",
      desc: language === "hi" ? "महंगाई भत्ता (DA) व वेतनमान सटीक अनुमान" : "DA, HRA & scale estimator",
      icon: <Landmark className="w-5 h-5" />,
      color: "text-sky-600 bg-sky-50 border-sky-100",
    },
    {
      id: "pension" as ActiveWidget,
      label: language === "hi" ? "पेंशन कैलकुलेटर" : "Pension Calculator",
      desc: language === "hi" ? "NPS और पेंशन योजना अनुमान" : "NPS and pension projection",
      icon: <Coins className="w-5 h-5 font-bold" />,
      color: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      id: "sip" as ActiveWidget,
      label: language === "hi" ? "एसआईपी योजनाकार" : "Plan SIP",
      desc: language === "hi" ? "चक्रवृद्धि के साथ धन वृद्धि" : "Compounding wealth growth",
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      id: "learning" as ActiveWidget,
      label: language === "hi" ? "पैसे से पैसा बनाना सीखो" : "Paise to Rupee Wisdom",
      desc: language === "hi" ? "₹5,050 SIP, तुलनात्मक FD, ₹1 करोड़ रोडमैप, बजट और FIRE नियम" : "₹5k SIP, FD v/s SIP battles, ₹1Cr targets, 50-30-20 rule, retirement calculations",
      icon: <Sparkles className="w-5 h-5" />,
      color: "text-emerald-650 bg-emerald-50 border-emerald-100",
    },
    {
      id: "health" as ActiveWidget,
      label: language === "hi" ? "स्वास्थ्य स्कोरकार्ड" : "Health Scorecard",
      desc: language === "hi" ? "समग्र वित्तीय स्वास्थ्य मूल्यांकन" : "Overall wellness assessment",
      icon: <HeartPulse className="w-5 h-5" />,
      color: "text-bhagwa-600 bg-bhagwa-50 border-bhagwa-100",
    },
    {
      id: "retirement" as ActiveWidget,
      label: language === "hi" ? "रिटायरमेंट रोडमैप" : "Retirement Roadmap",
      desc: language === "hi" ? "महंगाई दर और दीर्घायु वित्तीय कवर" : "Inflation vs longevity cover",
      icon: <Compass className="w-5 h-5" />,
      color: "text-violet-650 bg-violet-50 border-violet-100",
    },
    {
      id: "goals" as ActiveWidget,
      label: language === "hi" ? "मेरा लक्ष्य योजनाकार" : "My Goal Planner",
      desc: language === "hi" ? "शादी, घर, वाहन आदि लक्ष्य" : "Plan weddings, homes, cars",
      icon: <Sparkles className="w-5 h-5" />,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      id: "tax" as ActiveWidget,
      label: language === "hi" ? "टैक्स व्यवस्था अनुकूलक" : "Tax Regime Optimizer",
      desc: language === "hi" ? "पुरानी और नई टैक्स व्यवस्था की तुलना" : "Compare Old vs. New Schemes",
      icon: <Scale className="w-5 h-5" />,
      color: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      id: "networth" as ActiveWidget,
      label: language === "hi" ? "मेरा धन ट्रैकर" : "My Wealth Tracker",
      desc: language === "hi" ? "सक्रिय ऋणों के मुकाबले संपत्तियां" : "Map assets against active loans",
      icon: <Wallet className="w-5 h-5" />,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      id: "seohub" as ActiveWidget,
      label: language === "hi" ? "संसाधन व गाइड कैबिनेट" : "Cabinets & Resources",
      desc: language === "hi" ? "10+ कैलकुलेटर, शब्दावली और वित्तीय गाइड" : "10+ Calculators, Glossary & Guides",
      icon: <BookOpen className="w-5 h-5" />,
      color: "text-purple-655 bg-purple-50 border-purple-110",
    },
    {
      id: "cibil" as ActiveWidget,
      label: language === "hi" ? "सिबिल (CIBIL) क्रेड स्कोर" : "CIBIL Credit Score",
      desc: language === "hi" ? "सिम्युलेशन और सिबिल स्वास्थ्य जांच" : "Check & simulate Credit Health",
      icon: <CreditCard className="w-5 h-5" />,
      color: "text-emerald-650 bg-emerald-50 border-emerald-110",
    },
    {
      id: "debt" as ActiveWidget,
      label: language === "hi" ? "ऋण मुक्ति योजनाकार" : "Debt Freedom Planner",
      desc: language === "hi" ? "प्री-पेमेंट से कर्जों को शीघ्र मिटाएं" : "Accelerate debt payoffs with pre-payments",
      icon: <TrendingDown className="w-5 h-5" />,
      color: "text-rose-600 bg-rose-50 border-rose-100",
    },
    {
      id: "coach" as ActiveWidget,
      label: language === "hi" ? "पैसा एआई कोच" : "Paisa AI Coach",
      desc: language === "hi" ? "वित्तीय प्रश्नों के तुरंत जवाब" : "Real-time chat & feedback",
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
          >
            <motion.div
              id="welcome-card"
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: -10, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative max-w-sm w-full bg-slate-900 border border-purple-500/20 rounded-3xl p-7 shadow-2xl text-center overflow-hidden"
            >
              {/* Premium Purple Glow FX */}
              <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600/25 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-fuchsia-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative flex flex-col items-center gap-5">
                {/* Brand Logo & Animated Purple Ambient Halo */}
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/20 rounded-2xl blur-md animate-pulse" />
                  <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-tr from-slate-950 to-slate-900 flex items-center justify-center shadow-xl border border-purple-500/40">
                    <img
                      src={paisaLogo}
                      alt="Paisa Blueprint"
                      className="w-11 h-11 object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 w-full">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase font-display flex items-center justify-center gap-1.5">
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300">
                      Paisa Blueprint
                    </span>
                    <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
                  </h3>
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-[9px] font-black uppercase bg-purple-650 text-white px-2 py-0.5 rounded-full border border-purple-500/30 tracking-wider">
                      Salaried 🇮🇳
                    </span>
                    <span className="text-[10px] font-bold text-purple-300">
                      Smart Personal Finance Engine
                    </span>
                  </div>
                </div>

                {/* Core Welcome Announcement */}
                <div className="mt-1 space-y-2">
                  <p className="text-base font-extrabold text-slate-100 flex items-center justify-center gap-1.5">
                    Welcome to Your Wealth cockpit!
                  </p>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Instantiating your high-octane financial diagnostic tools. Prepare to optimize taxes, simulate direct index SIPs, and blueprint your freedom targets.
                  </p>
                </div>

                {/* 2-Second Linear Animation Progress Indicator bar */}
                <div className="w-full space-y-1.5 mt-2">
                  <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-wider text-purple-400/80">
                    <span>Configuring modules</span>
                    <span className="font-mono">Processing...</span>
                  </div>
                  <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-purple-950 shadow-inner">
                    <motion.div
                      id="welcome-progress"
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-indigo-500"
                    />
                  </div>
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
                <span
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newName = e.currentTarget.textContent?.trim();
                    if (newName && newName !== profile.name) {
                      handleUpdateProfile({
                        ...profile,
                        name: newName
                      });
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  title="Click to edit profile name directly inline"
                  className="px-1 py-0.5 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-905 focus:outline-none focus:ring-1 focus:ring-bhagwa-500 min-w-[50px] inline-block transition-all cursor-text border-b border-dashed border-slate-300"
                >
                  {profile.name || "Default user"}
                </span>
                <span className="text-[9px] uppercase tracking-wider bg-bhagwa-100 text-bhagwa-700 font-extrabold px-1 rounded-sm ml-0.5 animate-pulse">
                  {language === "hi" ? "बदलें" : "Switch"}
                </span>
              </button>
              <div className="h-4 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">{language === "hi" ? "मासिक ग्रॉस:" : "Monthly Gross:"}</span>
                <span className="font-bold text-bhagwa-600 ml-1">₹{profile.salary.toLocaleString("en-IN")}</span>
              </div>
              <div className="h-4 w-px bg-slate-200"></div>
              <div>
                <span className="text-slate-400">{language === "hi" ? "उम्र:" : "Age:"}</span>
                <span className="font-bold text-slate-700 ml-1">{profile.age} {language === "hi" ? "वर्ष" : "yrs"}</span>
              </div>
            </div>

            {/* Global Language Toggle Selector */}
            <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl shadow-3xs border border-slate-150 dark:border-slate-700 shrink-0">
              <button
                onClick={() => {
                  setLanguage("en");
                  localStorage.setItem("paisa_language", "en");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer ${
                  language === "en"
                    ? "bg-purple-600 text-white shadow-3xs font-black"
                    : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="Switch entire dashboard to standard Indian English"
              >
                EN
              </button>
              <button
                onClick={() => {
                  setLanguage("hi");
                  localStorage.setItem("paisa_language", "hi");
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-black tracking-wide transition-all cursor-pointer ${
                  language === "hi"
                    ? "bg-purple-600 text-white shadow-3xs font-black"
                    : "text-slate-500 hover:text-slate-850 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
                title="संपूर्ण डैशबोर्ड को हिन्दी राजभाषा प्रारूप में बदलें"
              >
                हिन्दी
              </button>
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
              <span className="!text-emerald-500 dark:!text-emerald-400 font-extrabold text-base">•</span>
              <button
                type="button"
                onClick={() => {
                  setActiveWidget("learning");
                  if (contentRef.current) {
                    contentRef.current.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white text-sm sm:text-base font-black px-5 py-2.5 sm:px-6 sm:py-3 rounded-2xl shadow-lg border-0 cursor-pointer transition-all flex items-center gap-2"
              >
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
                <span className="font-extrabold tracking-wide" style={{ wordSpacing: "0.25em" }}>पैसे से पैसा बनाना सीखो</span>
                <ChevronRight className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-300" />
              </button>
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
              {language === "hi" ? "फाइनेंस सूट उपकरण" : "FINANCE SUITE"}
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
              <ShieldCheck className="w-5 h-5 text-bhagwa-600 dark:text-bhagwa-500" /> {language === "hi" ? "विवेकपूर्ण भारतीय वित्तीय नियम" : "Prudent Indian Financial Mandates"}
            </h4>
            <div className="text-[11px] text-slate-750 dark:text-slate-200 leading-relaxed space-y-2.5">
              <p>
                🛡️ <strong className="font-extrabold text-slate-900 dark:text-white">{language === "hi" ? "जीवन बीमा पर टर्म प्लान:" : "Term over Life policies:"}</strong> {language === "hi" ? "पारंपरिक बंदोबस्ती या महंगे मनीबैक यूलिप प्लान के बजाय सामान्य टर्म इंश्योरेंस लें जो वार्षिक आय का 20 गुना हो।" : "Buy plain direct Term Insurance for 20x annual income instead of expensive moneyback ULIP schemes."}
              </p>
              <p>
                📈 <strong className="font-extrabold text-slate-900 dark:text-white">{language === "hi" ? "म्यूचुअल फंड की ताकत:" : "Harness direct mutual funds:"}</strong> {language === "hi" ? "सालाना स्टेप-अप (Step-Up) के साथ एक इंडेक्स एसआईपी शुरू करें, जो फ्लैट एसआईपी की तुलना में बहुत अधिक धन सृजित करती है।" : "Start an automated index SIP with annual step-up. Flat SIPs lose the power of regular wage appraisals."}
              </p>
              <p>
                🏦 <strong className="font-extrabold text-slate-900 dark:text-white">{language === "hi" ? "NPS आयकर लाभ:" : "NPS Multipliers:"}</strong> {language === "hi" ? "30% टैक्स स्लैब वाले वेतनभोगियों के लिए धारा 80CCD(1B) के तहत ₹50,000 की विशेष छूट का पूरा लाभ उठाएं।" : "Utilize the exclusive extra Section 80CCD(1B) up to ₹50,000 for efficient 30% slab deductions."}
              </p>
            </div>
          </div>
        </section>

        {/* Middle Content Sheet */}
        <section ref={contentRef} className="lg:col-span-6 scroll-mt-24">
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeWidget}
                layoutId="active-dashboard-panel"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="w-full"
              >
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

                {activeWidget === "seohub" && (
                  <SeoHub userGrossMonthly={profile.salary} />
                )}

                {activeWidget === "learning" && (
                  <PaiseToRupee userGrossMonthly={profile.salary} language={language} />
                )}

                {activeWidget === "bpsc_salary" && (
                  <BpscTeacherSalary language={language} />
                )}

                {activeWidget === "bihar_da" && (
                  <BiharDaCalculator language={language} />
                )}

                {activeWidget === "govt_sip" && (
                  <GovtEmployeeSipCalculator language={language} />
                )}

                {activeWidget === "nps_govt" && (
                  <NpsGovtCalculator language={language} />
                )}

                {(activeWidget === "eight_pay_calc" ||
                  activeWidget === "eight_pay_fitment" ||
                  activeWidget === "eight_pay_hike" ||
                  activeWidget === "eight_pay_pension" ||
                  activeWidget === "eight_pay_news" ||
                  activeWidget === "eight_pay_fitment_info" ||
                  activeWidget === "eight_pay_chart" ||
                  activeWidget === "eight_pay_date" ||
                  activeWidget === "eight_pay_teachers") && (
                  <EightPayCommissionHub 
                    language={language}
                    activeSubPage={
                      activeWidget === "eight_pay_calc" ? "calculator" :
                      activeWidget === "eight_pay_fitment" ? "fitment" :
                      activeWidget === "eight_pay_hike" ? "hike" :
                      activeWidget === "eight_pay_pension" ? "pension" :
                      activeWidget === "eight_pay_news" ? "latest-news" :
                      activeWidget === "eight_pay_fitment_info" ? "fitment-factor" :
                      activeWidget === "eight_pay_chart" ? "salary-chart" :
                      activeWidget === "eight_pay_date" ? "date" :
                      "for-teachers"
                    }
                    onNavigate={(subPage) => {
                      const mapping: Record<string, ActiveWidget> = {
                        "calculator": "eight_pay_calc",
                        "fitment": "eight_pay_fitment",
                        "hike": "eight_pay_hike",
                        "pension": "eight_pay_pension",
                        "latest-news": "eight_pay_news",
                        "fitment-factor": "eight_pay_fitment_info",
                        "salary-chart": "eight_pay_chart",
                        "date": "eight_pay_date",
                        "for-teachers": "eight_pay_teachers"
                      };
                      if (mapping[subPage]) {
                        setActiveWidget(mapping[subPage]);
                      }
                    }}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            {/* Global Widget WhatsApp Share Action */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4.5 rounded-3xl shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-emerald-100/50 dark:bg-emerald-500/10 text-[#25D366] flex items-center justify-center">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.417 9.863-9.848.002-2.63-1.023-5.101-2.884-6.963C16.58 1.952 14.108.928 11.48.928c-5.44 0-9.866 4.416-9.87 9.848-.002 1.79.479 3.541 1.39 5.1l-.479 1.754 1.83-.48.116.069zM17.151 14.28c-.282-.142-1.67-.824-1.928-.918-.258-.095-.447-.142-.635.142-.188.283-.729.918-.893 1.107-.164.188-.328.213-.61.071-.282-.142-1.192-.44-2.271-1.402-.839-.75-1.407-1.675-1.571-1.958-.164-.283-.018-.435.123-.576.127-.127.282-.329.423-.495.141-.165.188-.283.282-.472.094-.188.047-.354-.024-.495-.07-.142-.635-1.529-.87-2.094-.229-.553-.46-.477-.635-.486-.164-.008-.353-.01-.541-.01s-.494.07-.753.354c-.259.283-.988.966-.988 2.358 0 1.392 1.012 2.735 1.153 2.924.141.189 1.992 3.041 4.825 4.258.674.29 1.201.463 1.61.593.677.215 1.293.185 1.78.113.543-.081 1.67-.682 1.905-1.34s.235-1.226.165-1.34c-.07-.114-.282-.208-.564-.35z"/>
                  </svg>
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">
                    {language === "hi" ? "इस टूल का परिणाम साझा करें" : "Share results of this planner"}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                    {language === "hi" 
                      ? "व्हाट्सएप पर मित्रों के साथ अपनी वित्तीय गणना और रिपोर्ट साझा करें!" 
                      : "Send your current active sheet calculations and insights to WhatsApp!"}
                  </p>
                </div>
              </div>
              <a
                href={`https://api.whatsapp.com/send?text=${widgetShareText}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-gradient-to-r from-[#25D366] to-[#128C7E] hover:from-[#20ba5a] hover:to-[#0e6f63] active:scale-95 text-white text-xs sm:text-sm font-black px-5 py-2.5 rounded-2xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-2 hover:shadow-lg no-underline shrink-0"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.417 9.863-9.848.002-2.63-1.023-5.101-2.884-6.963C16.58 1.952 14.108.928 11.48.928c-5.44 0-9.866 4.416-9.87 9.848-.002 1.79.479 3.541 1.39 5.1l-.479 1.754 1.83-.48.116.069zM17.151 14.28c-.282-.142-1.67-.824-1.928-.918-.258-.095-.447-.142-.635.142-.188.283-.729.918-.893 1.107-.164.188-.328.213-.61.071-.282-.142-1.192-.44-2.271-1.402-.839-.75-1.407-1.675-1.571-1.958-.164-.283-.018-.435.123-.576.127-.127.282-.329.423-.495.141-.165.188-.283.282-.472.094-.188.047-.354-.024-.495-.07-.142-.635-1.529-.87-2.094-.229-.553-.46-.477-.635-.486-.164-.008-.353-.01-.541-.01s-.494.07-.753.354c-.259.283-.988.966-.988 2.358 0 1.392 1.012 2.735 1.153 2.924.141.189 1.992 3.041 4.825 4.258.674.29 1.201.463 1.61.593.677.215 1.293.185 1.78.113.543-.081 1.67-.682 1.905-1.34s.235-1.226.165-1.34c-.07-.114-.282-.208-.564-.35z"/>
                </svg>
                <span>{language === "hi" ? "व्हाट्सएप पर साझा करें" : "Share on WhatsApp"}</span>
              </a>
            </div>
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
            language={language}
            onLanguageChange={(lang) => {
              setLanguage(lang);
              localStorage.setItem("paisa_language", lang);
            }}
          />
        </section>

        </div>
      </main>

      {/* Footer Design Credits Line */}
      <FooterSections language={language} />
    </div>
  );
}
