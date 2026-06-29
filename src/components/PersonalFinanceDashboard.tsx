import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { paisaFetch } from "../api";
import { UserProfile, Goal } from "../types";
import { 
  Award, 
  ShieldCheck, 
  Activity, 
  Clock, 
  Plus, 
  Trash2, 
  Edit2, 
  Copy, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Sparkles, 
  Bot, 
  Send, 
  Bell, 
  BellRing, 
  HeartPulse, 
  Compass, 
  Coins, 
  Landmark, 
  Check, 
  CheckCircle, 
  FileText, 
  ChevronRight, 
  Calendar, 
  ChevronDown, 
  User, 
  RefreshCw, 
  AlertCircle, 
  X,
  Briefcase,
  TrendingUp,
  TrendingDown,
  Percent,
  Search,
  BookOpen,
  DollarSign,
  Bookmark,
  Share2,
  HelpCircle,
  Volume2
} from "lucide-react";

interface SavedItem {
  id: string;
  title: string;
  type: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  isFavourite?: boolean;
}

interface DashboardProps {
  user: any;
  profile: UserProfile;
  language: "en" | "hi";
  onNavigateToWidget: (widgetId: string) => void;
}

export default function PersonalFinanceDashboard({ user, profile, language, onNavigateToWidget }: DashboardProps) {
  const [locker, setLocker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState<"savings" | "allocation" | "goals" | "tax" | "retirement">("savings");
  
  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      role: "assistant",
      content: language === "hi" 
        ? "नमस्ते! मैं आपका निजी वित्तीय एआई कोच हूँ। आप मुझसे अपने निवेश, बचत या कर नियोजन के बारे में कुछ भी पूछ सकते हैं!" 
        : "Hello! I am your personal financial AI coach. Ask me anything about your investments, savings, or tax planning!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Load cache on mount
  useEffect(() => {
    const cachedData = localStorage.getItem(`paisa_dashboard_cache_${user?.email}`);
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setLocker(parsed.locker);
        setActivityLog(parsed.activityLog || []);
        setNotifications(parsed.notifications || []);
        setIsLoading(false);
      } catch (e) {
        console.error("Error reading cached dashboard data:", e);
      }
    }
  }, [user?.email]);

  const fetchLockerData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await paisaFetch("/api/locker");
      if (response.ok) {
        const data = await response.json();
        setLocker(data);
        
        // Generate activity logs based on saved calculations
        const logs: any[] = [];
        const notifs: any[] = [];
        
        // Push general login activity
        logs.push({
          id: "act-login",
          title: language === "hi" ? "सुरक्षित सत्र प्रारंभ हुआ" : "Secure Session Authenticated",
          desc: language === "hi" ? "सत्र तिजोरी में लॉग इन किया गया" : "Logged in successfully to ledger",
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          icon: <Lock className="w-4 h-4 text-emerald-500" />
        });

        notifs.push({
          id: "not-insight",
          title: language === "hi" ? "नया वित्तीय अंतर्दृष्टि उपलब्ध" : "New Financial Insight Available",
          desc: language === "hi" ? "आपकी बचत दर 20% से अधिक होने पर विशेष निवेश मार्गदर्शिका पढ़ें।" : "Your savings rates are tracked. Read customized multipliers suggestions.",
          time: "10m ago",
          unread: true
        });

        // Parse salary calculations
        if (data.salaryCalculations && data.salaryCalculations.length > 0) {
          const sorted = [...data.salaryCalculations].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          logs.push({
            id: `act-sal-${sorted[0].id}`,
            title: language === "hi" ? "वेतनमान योजना सहेजी गई" : "Saved Salary Plan",
            desc: sorted[0].title,
            time: formatDateRelative(sorted[0].updatedAt),
            icon: <Briefcase className="w-4 h-4 text-purple-500" />
          });
          
          notifs.push({
            id: `not-sal-${sorted[0].id}`,
            title: language === "hi" ? "वेतन ब्लूप्रिंट सहेजा गया" : "Salary Blueprint Saved",
            desc: `${sorted[0].title} is secured in your financial locker.`,
            time: "Recently",
            unread: false
          });
        }

        // Parse pension calculations
        if (data.pensionCalculations && data.pensionCalculations.length > 0) {
          const sorted = [...data.pensionCalculations].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          logs.push({
            id: `act-pen-${sorted[0].id}`,
            title: language === "hi" ? "पेंशन योजना जोड़ी गई" : "Created Pension Plan",
            desc: sorted[0].title,
            time: formatDateRelative(sorted[0].updatedAt),
            icon: <Coins className="w-4 h-4 text-emerald-500" />
          });
        }

        // Parse SIP plans
        if (data.sipPlans && data.sipPlans.length > 0) {
          const sorted = [...data.sipPlans].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          logs.push({
            id: `act-sip-${sorted[0].id}`,
            title: language === "hi" ? "एसआईपी योजना अपडेट की गई" : "Updated SIP Investment Plan",
            desc: sorted[0].title,
            time: formatDateRelative(sorted[0].updatedAt),
            icon: <TrendingUp className="w-4 h-4 text-sky-500" />
          });
        }

        // Parse tax calculations
        if (data.taxCalculations && data.taxCalculations.length > 0) {
          const sorted = [...data.taxCalculations].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          logs.push({
            id: `act-tax-${sorted[0].id}`,
            title: language === "hi" ? "टैक्स गणना सहेजी गई" : "Tax Assessment Saved",
            desc: sorted[0].title,
            time: formatDateRelative(sorted[0].updatedAt),
            icon: <FileText className="w-4 h-4 text-red-500" />
          });
        }

        // Parse financial goals
        if (data.financialGoals && data.financialGoals.length > 0) {
          const sorted = [...data.financialGoals].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          logs.push({
            id: `act-goal-${sorted[0].id}`,
            title: language === "hi" ? "वित्तीय लक्ष्य सूची बनाई गई" : "Created Goals Target Checklist",
            desc: sorted[0].title,
            time: formatDateRelative(sorted[0].updatedAt),
            icon: <Bookmark className="w-4 h-4 text-pink-500" />
          });
          
          notifs.push({
            id: `not-goal-complete`,
            title: language === "hi" ? "लक्ष्य मील का पत्थर हासिल" : "Goal Milestones Setup Ready",
            desc: language === "hi" ? "आपके वित्तीय लक्ष्यों की रूपरेखा सफलतापूर्वक संरचित हो गई है।" : "Your financial goal milestones are successfully structured.",
            time: "1h ago",
            unread: true
          });
        }

        // Fallbacks for notifications list
        if (notifs.length === 0 || notifs.length < 3) {
          notifs.push({
            id: "not-da",
            title: language === "hi" ? "महंगाई भत्ता (DA) अपडेट किया गया" : "DA Rates Re-aligned",
            desc: language === "hi" ? "राज्य व केंद्रीय कर्मियों के लिए नवीनतम महंगाई भत्ता संशोधन चालू है।" : "Latest Dearness Allowance (DA) revisions are re-aligned to 53% structures.",
            time: "1d ago",
            unread: true
          });
          notifs.push({
            id: "not-report",
            title: language === "hi" ? "मासिक वित्तीय स्वास्थ्य रिपोर्ट तैयार" : "Monthly Financial Report Ready",
            desc: language === "hi" ? "आपकी मासिक संचयी बचत रिपोर्ट विश्लेषण देखने के लिए तैयार है।" : "Your personal cash flow health check is updated.",
            time: "2d ago",
            unread: false
          });
        }

        setActivityLog(logs);
        setNotifications(notifs);

        // Cache response in localStorage
        localStorage.setItem(`paisa_dashboard_cache_${user?.email}`, JSON.stringify({
          locker: data,
          activityLog: logs,
          notifications: notifs
        }));
      } else {
        const errData = await response.json().catch(() => ({}));
        setError(errData?.message || "Failed to fetch locker files.");
      }
    } catch (err: any) {
      setError(err?.message || "Database connection failure.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLockerData();
    
    // Listen for custom save events to refresh dashboard in real-time
    const handleSaveEvent = () => fetchLockerData(true);
    window.addEventListener("paisa-locker-saved", handleSaveEvent);
    return () => window.removeEventListener("paisa-locker-saved", handleSaveEvent);
  }, [user?.email]);

  const handleDeleteItem = async (type: string, id: string) => {
    if (!window.confirm(language === "hi" ? "क्या आप वाकई इस सहेजी गई गणना को हटाना चाहते हैं?" : "Are you sure you want to delete this saved calculation?")) return;
    try {
      const res = await paisaFetch(`/api/locker/delete/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        fetchLockerData(true);
      }
    } catch (e) {
      console.error("Delete operation failed", e);
    }
  };

  const handleDuplicateItem = async (item: SavedItem) => {
    try {
      const res = await paisaFetch("/api/locker/save", {
        method: "POST",
        body: JSON.stringify({
          title: `${item.title} (${language === "hi" ? "कॉपी" : "Copy"})`,
          type: item.type,
          data: item.data
        })
      });
      if (res.ok) {
        fetchLockerData(true);
      }
    } catch (e) {
      console.error("Duplicate operation failed", e);
    }
  };

  const handleLoadItem = (item: SavedItem) => {
    let targetWidget = "";
    const type = item.type.toLowerCase();
    if (type === "salary" || type === "salarycalculations" || type === "salary_calculations") {
      targetWidget = item.data?.teacherGrade ? "bpsc_salary" : "salary";
    }
    else if (type === "pension" || type === "pensioncalculations" || type === "pension_calculations") targetWidget = "pension";
    else if (type === "sip" || type === "sipplans" || type === "sip_plans") targetWidget = "sip";
    else if (type === "nps" || type === "npsplans" || type === "nps_plans") targetWidget = "nps_govt";
    else if (type === "tax" || type === "taxcalculations" || type === "tax_calculations") targetWidget = "tax";
    else if (type === "goal" || type === "financialgoals" || type === "financial_goals") targetWidget = "goals";

    if (!targetWidget) return;

    onNavigateToWidget(targetWidget);

    setTimeout(() => {
      const event = new CustomEvent("paisa-load-calculation", {
        detail: {
          type: item.type,
          data: item.data
        }
      });
      window.dispatchEvent(event);
    }, 200);
  };

  const handleToggleFav = async (id: string) => {
    try {
      const res = await paisaFetch(`/api/locker/favourite/${id}`, {
        method: "POST"
      });
      if (res.ok) {
        fetchLockerData(true);
      }
    } catch (e) {
      console.error("Fav toggle failed", e);
    }
  };

  // Chat message submit handler
  const sendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMsg = {
      role: "user",
      content: chatInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await paisaFetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userProfile: profile
        }),
      });

      if (response.ok) {
        const resText = await response.text();
        let answer = "";
        try {
          const parsed = JSON.parse(resText);
          answer = parsed.reply || parsed.response || parsed.choices?.[0]?.message?.content || "";
        } catch (_) {
          answer = resText;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: answer || (language === "hi" ? "माफ़ करें, मैं प्रक्रिया पूरी नहीं कर सका।" : "Sorry, I could not complete the processing."),
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        setChatMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: language === "hi" 
              ? "सर्वर प्रतिक्रिया त्रुटि। कृपया बाद में प्रयास करें या अपने स्थानीय एआई कोच को चलाएं।" 
              : "Server connectivity response failure. Please retry shortly.",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      }
    } catch (e) {
      setChatMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "AI Server connection failed.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Helper date conversions
  const formatDateRelative = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHrs < 1) return language === "hi" ? "अभी हाल ही में" : "Just now";
    if (diffHrs < 24) return `${diffHrs}${language === "hi" ? " घंटे पहले" : "h ago"}`;
    const diffDays = Math.floor(diffHrs / 24);
    return `${diffDays}${language === "hi" ? " दिन पहले" : "d ago"}`;
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return language === "hi" ? "शुभ प्रभात" : "Good Morning";
    if (hours < 17) return language === "hi" ? "शुभ दोपहर" : "Good Afternoon";
    return language === "hi" ? "शुभ संध्या" : "Good Evening";
  };

  // Helper lists from locker
  const getAllSavedItems = (): SavedItem[] => {
    if (!locker) return [];
    const map = new Map<string, SavedItem>();
    
    const categories = [
      locker.salaryCalculations,
      locker.pensionCalculations,
      locker.sipPlans,
      locker.npsPlans,
      locker.taxCalculations,
      locker.financialGoals
    ];

    categories.forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(i => map.set(i.id, i));
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  const allSavedItems = getAllSavedItems();

  // Extract variables for computation
  const monthlySalary = useMemo(() => {
    if (locker?.salaryCalculations && locker.salaryCalculations.length > 0) {
      const latest = [...locker.salaryCalculations].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      return latest.data?.netSalary || latest.data?.grossSalary || profile.salary;
    }
    return profile.salary;
  }, [locker, profile.salary]);

  const monthlyExpenses = useMemo(() => {
    return profile.monthlyExpenses || (monthlySalary * 0.4) || 25000;
  }, [profile.monthlyExpenses, monthlySalary]);

  const emergencyFund = useMemo(() => {
    return profile.currentSavings || (monthlySalary * 3);
  }, [profile.currentSavings, monthlySalary]);

  const monthlySIPValue = useMemo(() => {
    let sipSum = 0;
    if (locker?.sipPlans && locker.sipPlans.length > 0) {
      locker.sipPlans.forEach((s: any) => {
        sipSum += (s.data?.monthlySip || s.data?.monthlyInvestment || 0);
      });
    } else {
      sipSum = profile.investments?.mutualFunds * 0.02 || 5000;
    }
    return sipSum;
  }, [locker, profile.investments]);

  const monthlyNPSValue = useMemo(() => {
    let npsSum = 0;
    if (locker?.npsPlans && locker.npsPlans.length > 0) {
      locker.npsPlans.forEach((n: any) => {
        npsSum += (n.data?.monthlyContribution || 0);
      });
    } else {
      npsSum = profile.investments?.nps * 0.04 || 2500;
    }
    return npsSum;
  }, [locker, profile.investments]);

  const taxSavedValue = useMemo(() => {
    if (locker?.taxCalculations && locker.taxCalculations.length > 0) {
      const latest = [...locker.taxCalculations].sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
      return latest.data?.taxSaved || latest.data?.totalDeductions || 50000;
    }
    return 46800; // estimated deduction benefits
  }, [locker]);

  const netSavingsRate = useMemo(() => {
    const savings = monthlySalary - monthlyExpenses;
    return monthlySalary > 0 ? (savings / monthlySalary) * 100 : 0;
  }, [monthlySalary, monthlyExpenses]);

  const estimatedNetWorth = useMemo(() => {
    const totalInvestments = 
      (profile.investments?.mutualFunds || 0) +
      (profile.investments?.stocks || 0) +
      (profile.investments?.gold || 0) +
      (profile.investments?.epf || 0) +
      (profile.investments?.ppf || 0) +
      (profile.investments?.nps || 0);
    
    const totalLoans = 
      (profile.loans?.homeLoan || 0) +
      (profile.loans?.personalLoan || 0) +
      (profile.loans?.carLoan || 0) +
      (profile.loans?.otherLoan || 0);

    return (totalInvestments + emergencyFund) - totalLoans;
  }, [profile, emergencyFund]);

  // Financial Health Score Calculation
  const healthScoreDetails = useMemo(() => {
    let score = 50;
    const items: string[] = [];

    // Emergency fund index (target 6 months of expenses)
    const emMonths = monthlyExpenses > 0 ? emergencyFund / monthlyExpenses : 0;
    if (emMonths >= 6) {
      score += 15;
    } else if (emMonths >= 3) {
      score += 8;
    } else {
      items.push(language === "hi" ? "आपातकालीन कोष कम है (कम से कम 6 महीने का मासिक खर्च जोड़ें)" : "Emergency fund covers less than 6 months of expenses.");
    }

    // Savings rate index (target > 30%)
    if (netSavingsRate >= 35) {
      score += 15;
    } else if (netSavingsRate >= 20) {
      score += 8;
    } else {
      items.push(language === "hi" ? "मासिक बचत दर 20% से कम है (बजट नियंत्रण बढ़ाएं)" : "Monthly savings rate is below the recommended 25%.");
    }

    // SIP Compound index
    if (monthlySIPValue >= monthlySalary * 0.15) {
      score += 15;
    } else if (monthlySIPValue > 0) {
      score += 10;
    } else {
      items.push(language === "hi" ? "कोई सक्रिय एसआईपी योजना नहीं है (नियमित निवेश प्रारंभ करें)" : "No systematic compounding SIP investment tracked in locker.");
    }

    // NPS Retirement index
    if (monthlyNPSValue > 0) {
      score += 10;
    } else {
      items.push(language === "hi" ? "एनपीएस राष्ट्रीय पेंशन योजना अनुपस्थित है (₹50,000 की 80CCD(1B) आयकर छूट लें)" : "NPS Pension deductions are not utilized. Benefit from extra Section 80CCD(1B).");
    }

    // Insurance index
    const hasTerm = (profile.termInsuranceCover || 0) >= (monthlySalary * 12 * 10);
    const hasHealth = (profile.healthInsuranceCover || 0) >= 300000;
    if (hasTerm && hasHealth) {
      score += 15;
    } else {
      items.push(language === "hi" ? "पर्याप्त टर्म और स्वास्थ्य बीमा योजना बनाएं (सुरक्षा कवर बढ़ाएं)" : "Insurance security is low. Ensure a Term Plan covering 10x salary and Health plan.");
    }

    // Debt ratios index
    const totalLoansSum = 
      (profile.loans?.homeLoan || 0) +
      (profile.loans?.personalLoan || 0) +
      (profile.loans?.carLoan || 0) +
      (profile.loans?.otherLoan || 0);
    const estimatedEMI = totalLoansSum * 0.015; // approximation
    const debtRatio = monthlySalary > 0 ? (estimatedEMI / monthlySalary) : 0;
    if (debtRatio === 0) {
      score += 15;
    } else if (debtRatio < 0.25) {
      score += 8;
    } else {
      score -= 10;
      items.push(language === "hi" ? "ऋण जोखिम अत्यधिक है (उच्च ब्याज वाले कर्जों को तुरंत चुकाएं)" : "Debt repayments are highly straining. Prioritize debt reduction.");
    }

    // Tax optimization index
    if (locker?.taxCalculations && locker.taxCalculations.length > 0) {
      score += 10;
    } else {
      items.push(language === "hi" ? "कर बचत विश्लेषण नहीं किया गया (टैक्स प्लानर का उपयोग करें)" : "Tax liabilities are not optimized. Assess Old vs New Tax Regime.");
    }

    // Goal index
    if (locker?.financialGoals && locker.financialGoals.length > 0) {
      score += 10;
    }

    const finalScore = Math.max(10, Math.min(100, score));
    let level = "Average";
    let color = "text-orange-500 bg-orange-50 border-orange-200";
    if (finalScore >= 85) {
      level = "Excellent";
      color = "text-emerald-600 bg-emerald-50 border-emerald-200";
    } else if (finalScore >= 70) {
      level = "Good";
      color = "text-sky-600 bg-sky-50 border-sky-200";
    } else if (finalScore < 50) {
      level = "Needs Attention";
      color = "text-rose-600 bg-rose-50 border-rose-200";
    }

    // Suggestions fallback if score is perfect
    if (items.length === 0) {
      items.push(language === "hi" ? "बधाई हो! आपकी वित्तीय स्थिति बहुत सुदृढ़ है। अपने दीर्घकालिक लक्ष्यों पर ध्यान केंद्रित रखें।" : "Stellar financial position! Maintain compound indexing and adjust for inflation yearly.");
    }

    return { score: finalScore, level, color, suggestions: items };
  }, [monthlySalary, monthlyExpenses, emergencyFund, monthlySIPValue, monthlyNPSValue, profile, locker, language]);

  // Extract goal models
  const goalsList = useMemo(() => {
    if (locker?.financialGoals && locker.financialGoals[0]?.data?.goals) {
      return locker.financialGoals[0].data.goals;
    }
    // Fallback default goals to show
    return [
      { id: "g-em", name: language === "hi" ? "आपातकालीन सुरक्षा कोष" : "Emergency Cover Reserve", category: "emergency", targetAmount: monthlyExpenses * 6, yearsLeft: 1, currentSaved: emergencyFund },
      { id: "g-ret", name: language === "hi" ? "सेवानिवृत्ति कोष" : "Retirement Corpus Goal", category: "retirement", targetAmount: 25000000, yearsLeft: 20, currentSaved: profile.investments?.mutualFunds || 150000 },
      { id: "g-edu", name: language === "hi" ? "बच्चों की उच्च शिक्षा" : "Higher Education Planner", category: "education", targetAmount: 5000000, yearsLeft: 12, currentSaved: 300000 },
    ];
  }, [locker, profile, emergencyFund, monthlyExpenses, language]);

  // Notifications summary unread count
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* 1. Header & Quick Alerts Notification Panel */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs relative">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xl md:text-2xl font-bold font-display text-slate-900 flex items-center gap-1.5">
              {getGreeting()}, {user?.fullName || user?.name || "Deepak"} 👋
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>{new Date().toLocaleDateString(language === "hi" ? "hi-IN" : "en-US", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <span className="h-3 w-[1px] bg-slate-200" />
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-bold text-[10px] uppercase">
              {language === "hi" ? "सुरक्षित सक्रिय ब्लूप्रिंट" : "SECURED SESSION ACTIVE"}
            </span>
          </p>
        </div>

        {/* Notification center */}
        <div className="relative flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => {
              setIsNotificationsOpen(!isNotificationsOpen);
              // Clear unread indicator on click
              if (!isNotificationsOpen) {
                setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
              }
            }}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-100 transition-all cursor-pointer relative"
          >
            {unreadCount > 0 ? (
              <BellRing className="w-5 h-5 text-bhagwa-600 animate-swing" />
            ) : (
              <Bell className="w-5 h-5 text-slate-600" />
            )}
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-bhagwa-600 border border-white text-white font-extrabold text-[9px] flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {isNotificationsOpen && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.95 }}
                className="absolute right-0 top-12 mt-2 w-80 bg-white border border-slate-100 rounded-2xl shadow-xl py-3 z-50 max-h-96 overflow-y-auto"
              >
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-slate-500 tracking-wider">
                    {language === "hi" ? "सूचनाएं" : "NOTIFICATIONS"}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    {notifications.length} {language === "hi" ? "कुल" : "Total"}
                  </span>
                </div>
                <div className="divide-y divide-slate-50">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`p-4 transition-all hover:bg-slate-50/50 relative ${notif.unread ? "bg-bhagwa-50/20" : ""}`}>
                      <div className="flex justify-between items-start gap-1">
                        <span className="text-xs font-bold text-slate-800 block">
                          {notif.title}
                        </span>
                        <span className="text-[9px] text-slate-400 shrink-0 font-medium">
                          {notif.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                        {notif.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* 2. Welcome Overview Summary & Financial Health Score */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Welcome Card & Summary stats */}
        <div className="md:col-span-8 bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-950 p-6 rounded-3xl text-white relative overflow-hidden flex flex-col justify-between min-h-[300px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(242,112,24,0.1),transparent_50%)]" />
          
          <div className="relative z-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-bhagwa-400 block mb-1">
              {language === "hi" ? "एक नज़र में आपकी वित्तीय संपदा" : "EXECUTIVE WEALTH INDEX"}
            </span>
            <h3 className="text-2xl font-bold font-display tracking-tight leading-none">
              {language === "hi" ? "सक्रिय ब्लूप्रिंट पोर्टफोलियो" : "Active Ledger Portfolio"}
            </h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 mt-8">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  {language === "hi" ? "अनुमानित कुल संपत्ति" : "EST. NET WORTH"}
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono block">
                  ₹{estimatedNetWorth.toLocaleString()}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-0.5 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" /> 
                  <span>{language === "hi" ? "सुरक्षित रूप से बढ़ रहा है" : "Secured Growth"}</span>
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  {language === "hi" ? "मासिक संचयी बचत" : "MONTHLY SAVINGS RATE"}
                </span>
                <span className="text-lg sm:text-2xl font-black text-white font-mono block">
                  {netSavingsRate.toFixed(1)}%
                </span>
                <span className="text-[10px] text-sky-400 font-bold block">
                  ₹{(monthlySalary - monthlyExpenses).toLocaleString()} {language === "hi" ? "/माह" : "/mo"}
                </span>
              </div>

              <div className="col-span-2 sm:col-span-1 space-y-1 border-t border-white/5 pt-4 sm:pt-0 sm:border-0">
                <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
                  {language === "hi" ? "वित्तीय तिजोरी आइटम" : "LOCKER ASSETS"}
                </span>
                <span className="text-lg sm:text-2xl font-black text-bhagwa-400 font-mono block">
                  {allSavedItems.length} {language === "hi" ? "फाइलें" : "items"}
                </span>
                <button 
                  onClick={() => onNavigateToWidget("profiles")}
                  className="text-[10px] text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1 transition-all"
                >
                  <span>{language === "hi" ? "पोर्टफोलियो संपादन" : "Edit Portfolios"}</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{language === "hi" ? "सभी सहेजे गए डेटा एन्क्रिप्टेड और स्थानीय स्तर पर प्रबंधित हैं।" : "256-bit Secure locally persistent database active."}</span>
            </span>
            <button
              onClick={() => fetchLockerData()}
              className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-white cursor-pointer"
              title="Sync locker database"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Financial Health Score Circle Card */}
        <div className="md:col-span-4 bg-white border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              <span>{language === "hi" ? "वित्तीय स्वास्थ्य स्कोर" : "Financial Health Score"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "hi" ? "बचत दर, बीमा, कर्ज, और निवेश पर आधारित वैज्ञानिक मूल्यांकन" : "Scientific calculation of capital security ratios based on assets."}
            </p>
          </div>

          {/* Circle Score visualization */}
          <div className="my-5 flex flex-col items-center justify-center">
            <div className="relative w-32 h-32 flex items-center justify-center">
              {/* Outer SVG Circle */}
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  className="stroke-slate-100 fill-transparent" 
                  strokeWidth="8"
                />
                <motion.circle 
                  cx="50" cy="50" r="40" 
                  className={`fill-transparent ${
                    healthScoreDetails.score >= 85 ? "stroke-emerald-500" :
                    healthScoreDetails.score >= 70 ? "stroke-sky-500" :
                    healthScoreDetails.score >= 50 ? "stroke-orange-500" : "stroke-rose-500"
                  }`}
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 - (251.2 * healthScoreDetails.score) / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-3xl font-black text-slate-900 font-mono tracking-tight leading-none">
                  {healthScoreDetails.score}
                </span>
                <span className="text-[9px] text-slate-400 font-black tracking-widest mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <span className={`mt-3.5 px-3 py-1 border rounded-full text-xs font-extrabold ${healthScoreDetails.color}`}>
              {healthScoreDetails.level === "Excellent" ? (language === "hi" ? "उत्कृष्ट" : "Excellent") :
               healthScoreDetails.level === "Good" ? (language === "hi" ? "उत्तम" : "Good") :
               healthScoreDetails.level === "Average" ? (language === "hi" ? "औसत" : "Average") : (language === "hi" ? "ध्यान देने की आवश्यकता है" : "Needs Attention")}
            </span>
          </div>

          {/* Miniature suggestion anchor */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 leading-relaxed font-medium">
            <span className="font-extrabold text-slate-800 block mb-0.5">{language === "hi" ? "शीर्ष सुधार मार्ग:" : "Primary action paths:"}</span>
            <p className="line-clamp-2">{healthScoreDetails.suggestions[0]}</p>
          </div>
        </div>
      </section>

      {/* 3. Responsive Charts Center using Pure Polished CSS/SVG */}
      <section className="bg-white border border-slate-100 p-6 rounded-3xl shadow-3xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-50 pb-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-600" />
              <span>{language === "hi" ? "वित्तीय विश्लेषण चार्ट" : "Financial Analytics & Projection Charts"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "hi" ? "अपनी तिजोरी और प्रोफ़ाइल विश्लेषण के आधार पर वास्तविक और सटीक ग्राफ़ देखें" : "Dynamic data visualizer synced to saved calculations."}
            </p>
          </div>

          {/* Chart Tab selectors */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveChartTab("savings")}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeChartTab === "savings" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "hi" ? "बचत" : "Savings"}
            </button>
            <button
              onClick={() => setActiveChartTab("allocation")}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeChartTab === "allocation" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "hi" ? "वितरण" : "Allocation"}
            </button>
            <button
              onClick={() => setActiveChartTab("goals")}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeChartTab === "goals" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "hi" ? "लक्ष्य" : "Goals"}
            </button>
            <button
              onClick={() => setActiveChartTab("tax")}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeChartTab === "tax" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "hi" ? "टैक्स" : "Tax"}
            </button>
            <button
              onClick={() => setActiveChartTab("retirement")}
              className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer ${
                activeChartTab === "retirement" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {language === "hi" ? "पेंशन" : "Pension"}
            </button>
          </div>
        </div>

        {/* Chart Stage Canvas */}
        <div className="mt-6 min-h-[220px] flex items-center justify-center bg-slate-50/50 rounded-2xl border border-slate-100 p-4 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {activeChartTab === "savings" && (
              <motion.div 
                key="savings" 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full flex flex-col justify-between"
              >
                {/* Monthly Savings Comparison Line graph / Area graph */}
                <span className="text-[10px] font-bold text-slate-450 block text-center mb-2">
                  {language === "hi" ? "मासिक आय बनाम मासिक बचत दर (प्रगति) ₹" : "Monthly Gross Income vs Net Savings Stream ₹"}
                </span>
                <div className="h-44 w-full flex items-end justify-between px-4 sm:px-12 relative pt-6">
                  {/* Grid lines */}
                  <div className="absolute left-0 right-0 top-1/4 border-t border-slate-200/50" />
                  <div className="absolute left-0 right-0 top-2/4 border-t border-slate-200/50" />
                  <div className="absolute left-0 right-0 top-3/4 border-t border-slate-200/50" />
                  
                  {/* Bars & Lines representation */}
                  {[
                    { label: "Gross Salary", val: monthlySalary, color: "bg-purple-500" },
                    { label: "Net In Hand", val: monthlySalary * 0.82, color: "bg-indigo-500" },
                    { label: "Necessary Expenses", val: monthlyExpenses, color: "bg-amber-500" },
                    { label: "Investments Flow", val: monthlySIPValue + monthlyNPSValue, color: "bg-emerald-500" },
                    { label: "Emergency Reserve", val: emergencyFund * 0.15, color: "bg-sky-500" }
                  ].map((item, idx) => {
                    const maxVal = Math.max(monthlySalary, emergencyFund * 0.15) || 100000;
                    const heightPercent = Math.min(100, Math.max(10, (item.val / maxVal) * 100));
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 group relative z-10">
                        <div className="text-[9px] font-bold text-slate-800 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-3xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none">
                          ₹{Math.round(item.val).toLocaleString()}
                        </div>
                        <div className="w-8 sm:w-12 bg-slate-150/40 rounded-t-lg h-32 flex items-end">
                          <motion.div 
                            className={`w-full rounded-t-lg ${item.color}`}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPercent}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                          />
                        </div>
                        <span className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold max-w-[50px] sm:max-w-none text-center truncate">
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeChartTab === "allocation" && (
              <motion.div 
                key="allocation" 
                initial={{ opacity: 0, scale: 0.98 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full flex flex-col sm:flex-row items-center justify-around gap-6"
              >
                {/* Donut Chart representation */}
                <div className="relative w-40 h-40 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Ring 1: Mutual Funds */}
                    <circle cx="50" cy="50" r="35" className="stroke-purple-500 fill-transparent" strokeWidth="8" strokeDasharray="219.8" strokeDashoffset="54.9" />
                    {/* Ring 2: Stocks */}
                    <circle cx="50" cy="50" r="35" className="stroke-emerald-500 fill-transparent" strokeWidth="8" strokeDasharray="219.8" strokeDashoffset="164.8" />
                    {/* Ring 3: Liquid Emergency */}
                    <circle cx="50" cy="50" r="35" className="stroke-sky-500 fill-transparent" strokeWidth="8" strokeDasharray="219.8" strokeDashoffset="109.9" />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-xs font-black text-slate-800 block">{language === "hi" ? "वितरण" : "Asset Mix"}</span>
                    <span className="text-[9px] text-slate-400 font-medium">Locker & Profile</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: language === "hi" ? "म्यूचुअल फंड / शेयर" : "SIP & Mutual Funds", val: (profile.investments?.mutualFunds || 0) + (profile.investments?.stocks || 0), color: "bg-purple-500" },
                    { label: language === "hi" ? "पेंशन व सेवानिवृत्ति" : "NPS & Pension PPF", val: (profile.investments?.nps || 0) + (profile.investments?.ppf || 0) + (profile.investments?.epf || 0), color: "bg-emerald-500" },
                    { label: language === "hi" ? "लिक्विड फंड (बचत)" : "Liquid emergency reserve", val: emergencyFund || 0, color: "bg-sky-500" },
                    { label: language === "hi" ? "स्वर्ण / रियल एस्टेट" : "Gold asset indexing", val: profile.investments?.gold || 0, color: "bg-amber-400" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${item.color}`} />
                      <div>
                        <span className="text-[10px] text-slate-500 block leading-none font-bold">{item.label}</span>
                        <span className="text-xs font-extrabold text-slate-900 font-mono">₹{Math.round(item.val || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeChartTab === "goals" && (
              <motion.div 
                key="goals" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full space-y-4"
              >
                <span className="text-[10px] font-bold text-slate-450 block text-center">
                  {language === "hi" ? "लक्ष्य संचय अनुपात" : "Goal Target Completion Status (%)"}
                </span>
                <div className="space-y-3 px-4">
                  {goalsList.slice(0, 3).map((goal, idx) => {
                    const saved = goal.currentSaved || (goal.targetAmount * (0.15 + idx * 0.1));
                    const percent = Math.min(100, Math.round((saved / goal.targetAmount) * 100));
                    return (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-700">{goal.name}</span>
                          <span className="text-slate-900">{percent}% ({language === "hi" ? "सफल" : "Ready"})</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <motion.div 
                            className="bg-pink-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeChartTab === "tax" && (
              <motion.div 
                key="tax" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full"
              >
                <span className="text-[10px] font-bold text-slate-450 block text-center mb-2">
                  {language === "hi" ? "धारा 80C, 80D और 80CCD कर बचत कटौती विश्लेषण" : "Tax Reduction Benefits Comparison (Section 80C / 80D)"}
                </span>
                <div className="h-36 flex items-end justify-around px-8">
                  {[
                    { label: "80C Limits", limit: 150000, utilized: Math.min(150000, (profile.investments?.mutualFunds || 0) * 0.5 + (profile.investments?.ppf || 0)), color: "bg-red-400" },
                    { label: "80CCD(1B) NPS", limit: 50000, utilized: monthlyNPSValue * 12, color: "bg-orange-500" },
                    { label: "80D Health", limit: 25000, utilized: Math.min(25000, profile.healthInsuranceCover ? 15000 : 0), color: "bg-emerald-400" }
                  ].map((item, idx) => {
                    const limitPct = 100;
                    const utilizedPct = Math.min(100, (item.utilized / item.limit) * 100);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-1.5">
                        <div className="flex gap-1 h-24 items-end">
                          {/* Limit bar */}
                          <div className="w-4 bg-slate-150 rounded h-full relative" title="Legal Maximum Limit">
                            <div className="absolute bottom-0 w-full bg-slate-300 rounded" style={{ height: `${limitPct}%` }} />
                          </div>
                          {/* Utilized bar */}
                          <div className="w-4 bg-slate-150 rounded h-full relative" title="Your Utilized Deductions">
                            <motion.div 
                              className={`absolute bottom-0 w-full rounded ${item.color}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${utilizedPct}%` }}
                              transition={{ duration: 1 }}
                            />
                          </div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 text-center leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[8px] font-mono text-slate-450">
                          ₹{Math.round(item.utilized).toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {activeChartTab === "retirement" && (
              <motion.div 
                key="retirement" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="w-full flex flex-col justify-between"
              >
                <span className="text-[10px] font-bold text-slate-450 block text-center mb-2">
                  {language === "hi" ? "वार्षिक सेवानिवृत्ति कॉर्पस संचय अनुमान" : "Compounding Future Retirement Pension Corpus Growth"}
                </span>
                <div className="h-40 flex items-end justify-between px-6 sm:px-12 relative pt-6">
                  {/* Grid Lines */}
                  <div className="absolute left-0 right-0 top-1/3 border-t border-slate-100" />
                  <div className="absolute left-0 right-0 top-2/3 border-t border-slate-100" />

                  {/* Compounding bar curves */}
                  {[5, 10, 15, 20, 25].map((yrs, idx) => {
                    const monthlyContr = monthlySIPValue + monthlyNPSValue || 10000;
                    const r = 0.12; // expected returns 12%
                    // Compound interest future value estimation
                    const fVal = monthlyContr * (((Math.pow(1 + r/12, yrs * 12) - 1) / (r/12)) * (1 + r/12));
                    const maxProjVal = 20000000; // max threshold for view
                    const hPct = Math.min(100, Math.max(10, (fVal / maxProjVal) * 100));

                    return (
                      <div key={idx} className="flex flex-col items-center gap-1 group relative z-10">
                        <div className="text-[8px] font-bold text-slate-800 bg-white border px-1 py-0.5 rounded shadow-3xs opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 pointer-events-none">
                          ₹{Math.round(fVal / 100000).toLocaleString()}L
                        </div>
                        <div className="w-5 sm:w-8 bg-purple-50 rounded-t-md h-24 flex items-end">
                          <motion.div 
                            className="w-full bg-gradient-to-t from-purple-500 to-indigo-500 rounded-t-md"
                            initial={{ height: 0 }}
                            animate={{ height: `${hPct}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                          />
                        </div>
                        <span className="text-[9px] text-slate-500 font-bold">{yrs} {language === "hi" ? "वर्ष" : "Yrs"}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 4. Monthly Snapshot Bento Grid */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
            <Coins className="w-4 h-4 text-emerald-600" />
            <span>{language === "hi" ? "मासिक वित्तीय स्नैपशॉट" : "Monthly Financial Snapshot"}</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            {language === "hi" ? "आपकी वर्तमान आय, नियोजित बजट और निवेश योजनाओं का मासिक प्रवाह विश्लेषण" : "Consolidated monthly budget streams based on active indicators."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          
          {/* Card 1: Income */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "मासिक सकल आय" : "MONTHLY INCOME"}
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              ₹{monthlySalary.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block">
              {language === "hi" ? "वेतन / सहेजी गई गणना" : "From profile & salary plans"}
            </span>
          </div>

          {/* Card 2: Expenses */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "अनुमानित खर्च" : "MONTHLY EXPENSES"}
            </span>
            <div className="text-lg font-black text-slate-900 font-mono">
              ₹{monthlyExpenses.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block">
              {language === "hi" ? "बजट आवंटन" : "Budget estimated allocation"}
            </span>
          </div>

          {/* Card 3: Savings */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "कुल बचत कोष" : "NET SAVINGS"}
            </span>
            <div className="text-lg font-black text-emerald-600 font-mono">
              ₹{(monthlySalary - monthlyExpenses).toLocaleString()}
            </div>
            <span className="text-[9px] text-emerald-500 font-bold block">
              {netSavingsRate.toFixed(0)}% {language === "hi" ? "बचत दर" : "of gross salary"}
            </span>
          </div>

          {/* Card 4: Investments */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "कुल मासिक निवेश" : "SIP + NPS FLOW"}
            </span>
            <div className="text-lg font-black text-purple-600 font-mono">
              ₹{(monthlySIPValue + monthlyNPSValue).toLocaleString()}
            </div>
            <span className="text-[9px] text-purple-400 block font-bold">
              {monthlySIPValue > 0 ? "SIP Active" : "No active SIP"}
            </span>
          </div>

          {/* Card 5: Tax Saved */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "अनुमानित टैक्स बचत" : "TAX SAVED"}
            </span>
            <div className="text-lg font-black text-sky-600 font-mono">
              ₹{taxSavedValue.toLocaleString()}
            </div>
            <span className="text-[9px] text-slate-400 block">
              {language === "hi" ? "कटौती और बचत" : "Under Section deductions"}
            </span>
          </div>

          {/* Card 6: NPS */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "एनपीएस योगदान" : "NPS CONTRIBUTION"}
            </span>
            <div className="text-lg font-black text-orange-600 font-mono">
              ₹{monthlyNPSValue.toLocaleString()}
            </div>
            <span className="text-[9px] text-orange-500 font-bold block">
              {language === "hi" ? "पेंशन निवेश जारी" : "Securing retirement"}
            </span>
          </div>

          {/* Card 7: Emergency */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "आपातकालीन तरल आरक्षित" : "EMERGENCY FUND"}
            </span>
            <div className="text-lg font-black text-indigo-600 font-mono">
              ₹{emergencyFund.toLocaleString()}
            </div>
            <span className="text-[9px] text-indigo-500 font-bold block">
              {(emergencyFund / (monthlyExpenses || 1)).toFixed(1)}x {language === "hi" ? "महीने का सुरक्षा कवच" : "months safety buffer"}
            </span>
          </div>

          {/* Card 8: Investment Ratio */}
          <div className="bg-white border border-slate-100 p-4 rounded-2xl space-y-1.5 shadow-3xs">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider block">
              {language === "hi" ? "बचत का निवेश अनुपात" : "INVESTMENT RATIO"}
            </span>
            <div className="text-lg font-black text-pink-600 font-mono">
              {monthlySalary > 0 ? (((monthlySIPValue + monthlyNPSValue) / monthlySalary) * 100).toFixed(0) : "0"}%
            </div>
            <span className="text-[9px] text-slate-400 block">
              {language === "hi" ? "कुल मासिक आय का प्रतिशत" : "of cumulative monthly income"}
            </span>
          </div>

        </div>
      </section>

      {/* 5. Financial Locker (My Financial Locker) Calculations List */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-purple-600" />
              <span>{language === "hi" ? "मेरी वित्तीय तिजोरी" : "My Financial Locker - Saved Models"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "hi" ? "सभी सहेजे गए कैलकुलेटर डेटा फाइलों का वास्तविक समय संपादन और सिंक प्रबंधन" : "Real-time list of calculations saved inside your server session locker."}
            </p>
          </div>

          {allSavedItems.length > 0 && (
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-black uppercase rounded-full border border-purple-100">
              {allSavedItems.length} {language === "hi" ? "सहेजे गए आइटम्स" : "SAVED MODELS"}
            </span>
          )}
        </div>

        {allSavedItems.length === 0 ? (
          <div className="bg-white border border-slate-100 p-8 rounded-3xl text-center space-y-3">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-full w-12 h-12 flex items-center justify-center mx-auto">
              <Unlock className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 text-xs">
                {language === "hi" ? "आपकी वित्तीय तिजोरी अभी खाली है" : "Locker Database is Empty"}
              </h5>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                {language === "hi" ? "कैलकुलेटर उपकरण का उपयोग करें और गणना को स्थानीय तिजोरी में सुरक्षित रखने के लिए 'सहेजें' बटन दबाएं।" : "Build calculations using our suite, then press 'Save to Financial Locker' to synchronize here."}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {allSavedItems.map((item) => {
              const t = item.type.toLowerCase();
              let iconColor = "bg-purple-50 text-purple-600 border-purple-100";
              let catLabel = "Salary Calculation";
              if (t.startsWith("pension")) {
                iconColor = "bg-emerald-50 text-emerald-600 border-emerald-100";
                catLabel = "Pension Plan";
              } else if (t.startsWith("sip")) {
                iconColor = "bg-sky-50 text-sky-600 border-sky-100";
                catLabel = "SIP Plan";
              } else if (t.startsWith("nps")) {
                iconColor = "bg-orange-50 text-orange-600 border-orange-100";
                catLabel = "NPS Pension";
              } else if (t.startsWith("tax")) {
                iconColor = "bg-red-50 text-red-600 border-red-100";
                catLabel = "Tax Plan";
              } else if (t.startsWith("goal")) {
                iconColor = "bg-pink-50 text-pink-600 border-pink-100";
                catLabel = "Financial Goal";
              }

              return (
                <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-200 hover:shadow-xs transition-all duration-200">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded-full ${iconColor}`}>
                        {catLabel}
                      </span>
                      <button 
                        onClick={() => handleToggleFav(item.id)}
                        className={`text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer`}
                      >
                        <HeartPulse className={`w-4 h-4 ${item.isFavourite ? "text-rose-500 fill-rose-500" : ""}`} />
                      </button>
                    </div>

                    <div className="space-y-1">
                      <h5 className="font-extrabold text-slate-800 text-xs truncate" title={item.title}>
                        {item.title}
                      </h5>
                      <span className="text-[9px] text-slate-400 font-medium block">
                        {language === "hi" ? "अंतिम संशोधन:" : "Last Updated:"} {new Date(item.updatedAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Rendering values summary */}
                    <div className="p-3 bg-slate-50 border border-slate-100/50 rounded-xl">
                      {renderCalculatedSummary(item, language)}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-1.5 border-t border-slate-50 pt-3 mt-4">
                    <button
                      onClick={() => handleLoadItem(item)}
                      className="px-2 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 font-black text-[9px] rounded-lg transition-all border-0 uppercase cursor-pointer"
                    >
                      {language === "hi" ? "खोलें" : "Open"}
                    </button>
                    <button
                      onClick={() => handleLoadItem(item)}
                      className="px-2 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-black text-[9px] rounded-lg transition-all border-0 uppercase cursor-pointer"
                    >
                      {language === "hi" ? "संपादित" : "Edit"}
                    </button>
                    <button
                      onClick={() => handleDuplicateItem(item)}
                      className="px-2 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 font-black text-[9px] rounded-lg transition-all border-0 uppercase cursor-pointer"
                      title="Duplicate item inside locker"
                    >
                      {language === "hi" ? "प्रतिलिपि" : "Copy"}
                    </button>
                    <button
                      onClick={() => handleDeleteItem(item.type, item.id)}
                      className="px-2 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 font-black text-[9px] rounded-lg transition-all border-0 uppercase cursor-pointer"
                    >
                      {language === "hi" ? "मिटाएं" : "Del"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 6. Goal Progress tracker */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-pink-500" />
            <span>{language === "hi" ? "वित्तीय लक्ष्यों की प्रगति" : "Goal Progress tracker"}</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            {language === "hi" ? "आपकी बचत संचय योजनाओं और सेवानिवृत्ति कोष मील के पत्थरों की वास्तविक समय प्रगति दर" : "Consolidated completion status of saved goals."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {goalsList.map((goal: any, idx: number) => {
            const saved = goal.currentSaved || (goal.targetAmount * (0.15 + idx * 0.15));
            const percentage = Math.min(100, Math.round((saved / goal.targetAmount) * 100));
            // Target date calculation (current year + yearsLeft)
            const targetYear = new Date().getFullYear() + (goal.yearsLeft || 5);
            
            return (
              <div key={goal.id || idx} className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4 shadow-3xs">
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black uppercase text-pink-500 tracking-wider">
                      {goal.category || "General Goal"}
                    </span>
                    <h5 className="font-extrabold text-slate-800 text-xs">
                      {goal.name}
                    </h5>
                  </div>
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {percentage}%
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="w-full bg-slate-50 border border-slate-100 rounded-full h-2.5 overflow-hidden">
                    <motion.div 
                      className="bg-pink-500 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-450 font-bold">
                    <span>₹{Math.round(saved).toLocaleString()}</span>
                    <span>₹{goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] border-t border-slate-50 pt-2.5 text-slate-500">
                  <span className="flex items-center gap-1 font-bold">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Est. {targetYear}</span>
                  </span>
                  <span className="font-bold text-slate-450">
                    {goal.yearsLeft || 5} {language === "hi" ? "वर्ष शेष" : "years left"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. AI Recommendations Center & Recent Activity Timeline */}
      <section className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* AI Recommendations */}
        <div className="md:col-span-7 bg-white border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500 fill-orange-500/10" />
              <span>{language === "hi" ? "वित्तीय एआई सिफारिशें" : "AI Recommendations Panel"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "hi" ? "आपकी वर्तमान तिजोरी की सहेजी गई फ़ाइलों और वित्तीय स्थिति के आधार पर त्वरित विश्लेषण" : "Automated actionable insights compiled from user ledger profiles."}
            </p>
          </div>

          <div className="space-y-4 my-6">
            {healthScoreDetails.suggestions.map((sug, idx) => (
              <div key={idx} className="flex gap-3 items-start p-3 bg-gradient-to-r from-bhagwa-50/10 to-bhagwa-50/20 border border-bhagwa-100/40 rounded-2xl">
                <div className="p-1.5 bg-bhagwa-100 text-bhagwa-700 rounded-lg shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-800 leading-relaxed block">
                    {sug}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-bhagwa-600" />
              <span className="text-[10px] text-slate-500 font-bold">
                {language === "hi" ? "अधिक गहन विश्लेषण के लिए एआई कोच से बात करें" : "Need granular planning guidance?"}
              </span>
            </div>
            <button
              onClick={() => setChatOpen(true)}
              className="text-[10px] text-bhagwa-700 hover:text-bhagwa-850 font-black flex items-center gap-0.5 uppercase cursor-pointer"
            >
              <span>{language === "hi" ? "वार्ता प्रारंभ" : "Ask Coach"}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Recent Activity Timeline */}
        <div className="md:col-span-5 bg-white border border-slate-100 p-6 rounded-3xl flex flex-col justify-between">
          <div className="space-y-1.5">
            <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-sky-500" />
              <span>{language === "hi" ? "सक्रिय इतिहास लॉग" : "Recent Activity Timeline"}</span>
            </h4>
            <p className="text-[10px] text-slate-400 font-medium">
              {language === "hi" ? "आपके सुरक्षित सत्र के दौरान किए गए हालिया कार्यों का विवरण" : "Audit trail of operations executed during current active session."}
            </p>
          </div>

          <div className="space-y-4 my-6 pl-2 relative border-l border-slate-100/80">
            {activityLog.slice(0, 4).map((log, idx) => (
              <div key={log.id || idx} className="relative pl-5 pb-1">
                {/* Timeline node */}
                <div className="absolute -left-2.5 top-1 p-1 bg-white border border-slate-200 rounded-full z-10">
                  {log.icon || <Activity className="w-3 h-3 text-slate-400" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800 leading-none">
                      {log.title}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium">
                      {log.time}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 line-clamp-1 leading-normal">
                    {log.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              {language === "hi" ? "पूर्ण सुरक्षा तिजोरी ऑडिट सक्रिय है" : "SECURE AUDIT PATH LOGGED"}
            </span>
          </div>
        </div>
      </section>

      {/* 8. Quick Actions grid */}
      <section className="space-y-4">
        <div className="space-y-1">
          <h4 className="font-bold text-slate-900 font-display text-sm flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-purple-600" />
            <span>{language === "hi" ? "त्वरित वित्तीय उपकरण लाँचर" : "Quick Action Launcher"}</span>
          </h4>
          <p className="text-[10px] text-slate-400 font-medium">
            {language === "hi" ? "सीधे अपनी पसंद के कैलकुलेटर या एआई कोच पर जाएँ" : "Direct access links to all core Paisa Suite features."}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { id: "salary", label: language === "hi" ? "वेतन कैलकुलेटर" : "Salary Calculator", icon: <Briefcase className="w-5 h-5" />, color: "text-purple-600 bg-purple-50 hover:bg-purple-100 border-purple-100" },
            { id: "pension", label: language === "hi" ? "पेंशन योजनाकार" : "Pension Planner", icon: <Coins className="w-5 h-5" />, color: "text-emerald-600 bg-emerald-50 hover:bg-emerald-100 border-emerald-100" },
            { id: "nps_govt", label: language === "hi" ? "एनपीएस कैलकुलेटर" : "NPS Calculator", icon: <DollarSign className="w-5 h-5" />, color: "text-orange-600 bg-orange-50 hover:bg-orange-100 border-orange-100" },
            { id: "sip", label: language === "hi" ? "एसआईपी योजनाकार" : "SIP Planner", icon: <TrendingUp className="w-5 h-5" />, color: "text-sky-600 bg-sky-50 hover:bg-sky-100 border-sky-100" },
            { id: "tax", label: language === "hi" ? "टैक्स योजनाकार" : "Tax Regime Optimizer", icon: <FileText className="w-5 h-5" />, color: "text-red-600 bg-red-50 hover:bg-red-100 border-red-100" },
            { id: "goals", label: language === "hi" ? "लक्ष्य योजनाकार" : "Goal Planner", icon: <Bookmark className="w-5 h-5" />, color: "text-pink-600 bg-pink-50 hover:bg-pink-100 border-pink-100" },
            { id: "profiles", label: language === "hi" ? "वित्तीय पोर्टफोलियो" : "Family Portfolios", icon: <User className="w-5 h-5" />, color: "text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border-indigo-100" },
            { id: "coach", label: language === "hi" ? "पैसा एआई कोच" : "Paisa AI Coach", icon: <Bot className="w-5 h-5" />, color: "text-bhagwa-600 bg-bhagwa-50 hover:bg-bhagwa-100 border-bhagwa-100" }
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => onNavigateToWidget(act.id)}
              className={`p-4 border rounded-2xl flex flex-col items-center justify-center text-center gap-2.5 transition-all active:scale-[0.98] cursor-pointer ${act.color}`}
            >
              <div className="p-2 bg-white rounded-xl shadow-3xs text-current shrink-0">
                {act.icon}
              </div>
              <span className="text-[11px] font-black tracking-tight block">
                {act.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 9. Floating Collapsible AI Coach mini chat widget */}
      <div className="fixed bottom-6 right-6 z-50 print:hidden">
        {/* Toggle Button */}
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className="p-4 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-full shadow-2xl transition-all cursor-pointer flex items-center justify-center relative active:scale-[0.96]"
          title="Ask Paisa AI Coach"
        >
          {chatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Bot className="w-6 h-6 animate-pulse" />
          )}
          {!chatOpen && (
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.92 }}
              className="absolute bottom-16 right-0 w-80 sm:w-96 bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[420px]"
            >
              {/* Chat Header */}
              <div className="p-4 bg-gradient-to-r from-bhagwa-600 to-bhagwa-700 text-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white/10 rounded-xl">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs">
                      {language === "hi" ? "पैसा एआई वित्तीय कोच" : "Paisa AI Financial Coach"}
                    </h5>
                    <span className="text-[9px] text-bhagwa-200 block font-bold leading-none uppercase tracking-wider">
                      {language === "hi" ? "सहायक सक्रिय" : "ASSISTANT SECURED"}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setChatOpen(false)}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/80 hover:text-white cursor-pointer border-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Chat messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
                {chatMessages.map((msg, idx) => {
                  const isAssistant = msg.role === "assistant";
                  return (
                    <div key={idx} className={`flex gap-2.5 ${isAssistant ? "" : "flex-row-reverse"}`}>
                      <div className={`p-2 rounded-xl text-xs max-w-[80%] leading-relaxed ${
                        isAssistant ? "bg-white border border-slate-100 text-slate-800" : "bg-bhagwa-600 text-white"
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <span className={`text-[8px] font-medium block text-right mt-1.5 ${isAssistant ? "text-slate-400" : "text-white/60"}`}>
                          {msg.timestamp}
                        </span>
                      </div>
                    </div>
                  );
                })}
                {isChatLoading && (
                  <div className="flex gap-2.5">
                    <div className="p-3 bg-white border border-slate-100 rounded-xl text-xs text-slate-500 italic flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-bhagwa-600" />
                      <span>{language === "hi" ? "सोच रहा हूँ..." : "Typing recommendations..."}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Suggestion tags */}
              <div className="px-4 py-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5 overflow-x-auto max-h-[85px]">
                {[
                  language === "hi" ? "मुझे हर महीने कितना निवेश करना चाहिए?" : "How much should I invest monthly?",
                  language === "hi" ? "क्या मैं 60 वर्ष की आयु में सेवानिवृत्त हो सकता हूँ?" : "Can I retire at 60?",
                  language === "hi" ? "पुरानी या नई टैक्स व्यवस्था कौन सी बेहतर है?" : "Should I choose Old or New Tax Regime?"
                ].map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setChatInput(q);
                    }}
                    className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-lg text-[9px] font-bold text-slate-650 truncate max-w-[200px] cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <form onSubmit={sendChatMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={language === "hi" ? "एआई कोच से सवाल पूछें..." : "Ask ledger analysis queries..."}
                  className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-bhagwa-600 focus:ring-1 focus:ring-bhagwa-600"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-bhagwa-600 hover:bg-bhagwa-700 text-white rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 border-0 shadow-3xs"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}

// Sub-helper to render values of any saved calculation inside a list card
function renderCalculatedSummary(item: SavedItem, language: "en" | "hi") {
  const t = item.type.toLowerCase();
  const data = item.data || {};
  
  if (t.startsWith("salary")) {
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "मूल वेतन" : "Basic Pay"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.basicPay || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "महंगाई भत्ता" : "DA"}: <span className="font-extrabold text-slate-900">{(data.daPercent || 0)}%</span></div>
        <div>{language === "hi" ? "शुद्ध इन-हैंड" : "Net In Hand"}: <span className="font-extrabold text-purple-600">₹{Math.round(data.netSalary || data.inHand || 0).toLocaleString()}</span></div>
      </div>
    );
  }
  if (t.startsWith("pension")) {
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "अंतिम मूल वेतन" : "Last Basic Pay"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.lastBasicPay || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "मासिक पेंशन" : "Monthly Pension"}: <span className="font-extrabold text-emerald-600">₹{Math.round(data.monthlyPension || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "ग्रेच्युटी लाभ" : "Gratuity benefit"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.gratuity || 0).toLocaleString()}</span></div>
      </div>
    );
  }
  if (t.startsWith("sip")) {
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "मासिक एसआईपी" : "Monthly SIP"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.monthlySip || data.monthlyInvestment || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "रिटर्न दर" : "Expected Return"}: <span className="font-extrabold text-slate-900">{(data.expectedReturn || data.interestRate || 0)}%</span></div>
        <div>{language === "hi" ? "कुल भावी कोष" : "Future Value"}: <span className="font-extrabold text-sky-600">₹{Math.round(data.futureValue || data.totalValue || 0).toLocaleString()}</span></div>
      </div>
    );
  }
  if (t.startsWith("nps")) {
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "मासिक एनपीएस" : "Monthly NPS"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.monthlyContribution || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "संचित कोष" : "Total Corpus"}: <span className="font-extrabold text-orange-600">₹{Math.round(data.totalCorpus || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "मासिक पेंशन" : "Annuity Pension"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.monthlyPension || 0).toLocaleString()}</span></div>
      </div>
    );
  }
  if (t.startsWith("tax")) {
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "वार्षिक सकल" : "Gross Income"}: <span className="font-extrabold text-slate-900">₹{Math.round(data.grossIncome || data.annualSalary || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "देय कुल टैक्स" : "Net Payable Tax"}: <span className="font-extrabold text-red-600">₹{Math.round(data.netTaxPayable || data.taxPayable || 0).toLocaleString()}</span></div>
        <div>{language === "hi" ? "अनुकूल टैक्स विकल्प" : "Optimized Regime"}: <span className="font-extrabold text-slate-900 text-[10px]">{data.recommendedRegime || "New Regime"}</span></div>
      </div>
    );
  }
  if (t.startsWith("goal")) {
    const goalsCount = Array.isArray(data.goals) ? data.goals.length : 1;
    return (
      <div className="space-y-1 text-[11px] text-slate-650 font-medium">
        <div>{language === "hi" ? "सक्रिय लक्ष्य संख्या" : "Active goals count"}: <span className="font-extrabold text-slate-900">{goalsCount}</span></div>
        <div>{language === "hi" ? "कुल लक्ष्य लागत" : "Target accumulated"}: <span className="font-extrabold text-pink-600">₹{Math.round(Array.isArray(data.goals) ? data.goals.reduce((acc: number, g: any) => acc + g.targetAmount, 0) : (data.targetAmount || 0)).toLocaleString()}</span></div>
      </div>
    );
  }
  return <div className="text-[10px] text-slate-400 italic">{language === "hi" ? "कोई सारांश उपलब्ध नहीं" : "No summary details available"}</div>;
}
