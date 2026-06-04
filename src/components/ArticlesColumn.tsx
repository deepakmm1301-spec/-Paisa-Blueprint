import React, { useState } from "react";
import { BookOpen, Sparkles, Flame, Search, ArrowRight, X, Clock, HelpCircle, HeartPulse, Percent, Coins, Milestone } from "lucide-react";

interface Article {
  id: string;
  title: string;
  category: "Investment" | "Tax" | "Saving" | "Retirement";
  readTime: string;
  summary: string;
  content: string[];
  importance: "High" | "Critical" | "Standard";
  targetedWidget: "tax" | "sip" | "salary" | "health" | "retirement";
  icon: React.ReactNode;
}

interface ArticlesColumnProps {
  onNavigateToWidget: (widgetId: any) => void;
  userMonthlySalary: number;
}

export default function ArticlesColumn({ onNavigateToWidget, userMonthlySalary }: ArticlesColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  const articles: Article[] = [
    {
      id: "art-1",
      title: "Direct Mutual Funds Over Regular: The ₹1.5 Cr Wealth Multiplier",
      category: "Investment",
      readTime: "4 mins read",
      importance: "Critical",
      summary: "Skip banking distributors and advisors who charge 1% in commissions. See how small recurring fees compound to drain millions from your retirement corpus.",
      targetedWidget: "sip",
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      content: [
        "In India, direct mutual funds have no distributor commissions, resulting in a lower expense ratio—often 0.75% to 1.5% lower than regular funds.",
        "While a difference of 1% a year sounds negligible, under the rule of continuous fractional compounding, it works against your corpus for 20 to 30 years.",
        "Example calculation: If you invest ₹25,000 monthly for 25 years at an expected CAGR of 12%:",
        "• With Direct Funds (12% CAGR): Your final portfolio compounds to approximately ₹4.70 Crores.",
        "• With Regular Funds representing 1% extra charges (11% CAGR): Your final portfolio compounds to only ₹3.75 Crores.",
        "• That is a staggering loss of ₹95 Lakhs paid solely in background commissions!",
        "Always search for mutual funds containing the word 'Direct' in their name rather than 'Regular'. Use the SIP Calculator to plan your step-up compounding goals without leaks."
      ]
    },
    {
      id: "art-2",
      title: "Decoupling the Regime Conundrum: New vs. Old Tax Regime Slabs",
      category: "Tax",
      readTime: "5 mins read",
      importance: "Critical",
      summary: "With FY 2024-25 updates, the New Tax regime is the standard default. Calculate when standard Old regime deductions can save you more money.",
      targetedWidget: "tax",
      icon: <Percent className="w-4 h-4 text-orange-500" />,
      content: [
        "The standard default tax regime in India now has highly compressed slabs with lower peak rates, alongside a standard deduction of ₹75,000 for salaried employees.",
        "However, the Old Tax Regime allows extensive deductions that remain incredibly powerful for certain brackets:",
        "• Section 80C limit: Up to ₹1.5 Lakhs (EPF, PPF, ELSS, School fees, principal house loan repayment).",
        "• Section 24b House Loan Interest: Up to ₹2 Lakhs on home loan interest payments.",
        "• Section 80D Mediclaim: Up to ₹75,000 (for self, dependents, and senior citizen parents' healthcare premium).",
        "• HRA component exemption: Complete deduction on house rent paid according to metro or non-metro formulas.",
        "Rule of thumb: If your combined tax-saving deductions exceed ₹3,75,000 a year, the Old Tax Regime will likely save you more taxes. Go to the Tax Planner to run a side-by-side simulation tailored to your active profile salary."
      ]
    },
    {
      id: "art-3",
      title: "Why Traditional ULIPs and Endowment Policies are Wealth Destroyers",
      category: "Saving",
      readTime: "3 mins read",
      importance: "High",
      summary: "Combining protection & investment often returns worse than savings accounts. Break the cycle of lock-ins and embrace Direct Mutual Funds plus Direct Term Insurance.",
      targetedWidget: "health",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      content: [
        "Unit Linked Insurance Plans (ULIPs) and traditional LIC endowment policies often promise guaranteed moneyback returns or market upsides with insurance coverage. This is a suboptimal arrangement.",
        "These plans suffer from heavy upfront charges (premium allocation fees, policy admin charges, and high mortality fees) that eat up your principal in the first 5 years.",
        "The average net yield on endowment policies hovers at an underwhelming 4.5% to 6%, lagging well behind inflation.",
        "A cleaner, safer, and far more lethal alternative is to keep Insurance and Investment strictly separate:",
        "1. Buy a pure, low-cost Term Insurance plan that covers at least 15x to 20x of your annual salary in standard contingencies.",
        "2. Allocate your actual savings directly to Nifty 50 Index Mutual Funds and Smallcap/Midcap equity plans.",
        "This split approach guarantees superior security and double-digit average compound annual growth."
      ]
    },
    {
      id: "art-4",
      title: "Unlocking the NPS Section 80CCD(1B) ₹50,050 Tax Waiver Bonus",
      category: "Tax",
      readTime: "3 mins read",
      importance: "Standard",
      summary: "Most salaried professionals ignore the exclusive additional retirement deduction beyond the ₹1.5L umbrella of 80C. Learn how NPS Tier 1 delivers.",
      targetedWidget: "salary",
      icon: <Milestone className="w-4 h-4 text-sky-500" />,
      content: [
        "National Pension System (NPS) Tier-1 offers an exclusive deduction under Section 80CCD(1B) of the Income Tax Act.",
        "This deduction permits a maximum waiver of up to ₹50,000 annually. Crucially, this benefit is completely over and above the traditional Section 80C limit of ₹1,50,000.",
        "For a salaried taxpayer sitting in the peak 30% tax bracket, investing ₹50,000 in NPS yields immediate cash savings of ₹15,600 each financial year in taxes.",
        "NPS also lets you control asset allocation classes (Equity, Corporate Debt, and Government Securities).",
        "Optimize your future wage breakdowns on the Salary Planner list to review take-home modifications and allocation patterns."
      ]
    },
    {
      id: "art-5",
      title: "The Compounding Step-Up Cheat Sheet: Rule of 72 & Raising SIPs",
      category: "Investment",
      readTime: "4 mins read",
      importance: "High",
      summary: "Do not keep your SIP amount flat. Discover how adding a 10% annual increase matching your corporate promotion cycle completely alters your final estate.",
      targetedWidget: "retirement",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      content: [
        "Many investors start a standard monthly SIP of ₹10,000 and leave it unchanged for 20 years, ignoring that their salary scale naturally increases with career progressions.",
        "By enforcing a Step-Up SIP (boosting your investment magnitude by just 10% annually to match salary appraisals), you compound wealth exponentially faster.",
        "Let's observe the multiplier over 20 years at a 12% CAGR rate:",
        "• Scenario A (Flat SIP of ₹10,000/month): Total invested capital is ₹24 Lakhs, and the final maturity value is ₹99.9 Lakhs.",
        "• Scenario B (10% Annual Step-up): Your initial SIP starts at ₹10,000, rising to ₹11,000 in Year 2, ₹12,100 in Year 3, etc. Total invested capital becomes ₹68.7 Lakhs, and the final compounded portfolio is a massive ₹2.07 Crores!",
        "A humble 10% annual upgrade produces more than double the final wealth outcome. Learn to balance long-term compounding milestones in the Retirement Planner."
      ]
    }
  ];

  const categories = ["All", "Investment", "Tax", "Saving", "Retirement"];

  const filteredArticles = articles.filter((art) => {
    const matchesSearch = 
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      art.summary.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="articles-advisor-panel" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-bhagwa-600 animate-pulse" />
          <h3 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
            Paisa Guidance Cabinet
          </h3>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
          {articles.length} reads Available
        </span>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        Expert bites, simplified calculators, tax strategies calibrated specifically to help Indian salaried professionals leverage compounding.
      </p>

      {/* Filter and Search controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search tax advice, SIP wisdom..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-850 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-bhagwa-500 transition-all font-medium"
          />
        </div>

        {/* Categories Pills */}
        <div className="flex flex-wrap gap-1 pt-1 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight cursor-pointer uppercase select-none transition-all ${
                selectedCategory === cat
                  ? "bg-bhagwa-600 text-white shadow-3xs"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-slate-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredArticles.length === 0 ? (
          <div className="p-6 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50">
            <span className="block text-xs font-semibold">No matched advice</span>
            <span className="block text-[10px] text-slate-450 mt-1">Try other tags or words</span>
          </div>
        ) : (
          filteredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => setSelectedArticle(art)}
              className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all hover:border-bhagwa-200 cursor-pointer flex gap-3 text-left group"
            >
              <div className="h-8 w-8 rounded-lg bg-white border border-slate-150 flex items-center justify-center shrink-0 shadow-3xs group-hover:scale-105 transition-all">
                {art.icon}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider text-slate-450 font-extrabold group-hover:text-bhagwa-600 transition-all">
                    {art.category}
                  </span>
                  <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3 text-slate-300" />
                    <span>{art.readTime}</span>
                  </div>
                </div>
                <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                  {art.title}
                </h4>
                <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                  {art.summary}
                </p>
                <span className="text-[10px] text-bhagwa-600 group-hover:text-bhagwa-700 font-bold inline-flex items-center gap-0.5 mt-1">
                  Read blueprint counsel <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Highly visible interactive prompt for user salary context */}
      <div className="bg-slate-950 text-slate-300 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-black block">Active Salary Context Check</span>
        <p className="text-[10px] text-slate-400 leading-tight">
          Your active ledger salary is registered at <strong className="text-white font-mono">₹{userMonthlySalary.toLocaleString("en-IN")}/mo</strong>. Use the integrated tools to plan allocations.
        </p>
      </div>

      {/* Beautiful Modal Article Reader */}
      {selectedArticle && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div
            id="article-detail-sheet"
            className="bg-white border border-slate-100 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col justify-between max-h-[85vh]"
          >
            {/* Header section with Category & actions */}
            <div className="p-5 md:p-6 bg-gradient-to-r from-slate-900 to-slate-950 text-white flex items-center justify-between shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-emerald-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold">
                    {selectedArticle.category} Advice
                  </span>
                  {selectedArticle.importance === "Critical" && (
                    <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                      <Flame className="w-2.5 h-2.5 shrink-0" /> Important
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 font-mono">
                    {selectedArticle.readTime}
                  </span>
                </div>
                <h3 className="text-base md:text-lg font-black tracking-tight leading-snug">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 hover:text-white text-slate-300 rounded-xl transition-all cursor-pointer focus:outline-none"
                title="Close read sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
              <p className="font-bold text-slate-950 text-xs italic border-l-3 border-bhagwa-500 pl-3">
                {selectedArticle.summary}
              </p>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                {selectedArticle.content.map((para, index) => (
                  <p key={index} className="text-slate-600 whitespace-pre-line text-xs font-normal">
                    {para}
                  </p>
                ))}
              </div>

              {/* Alert standard reminder box */}
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-2.5 mt-2">
                <Sparkles className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Adviser Direct Recommendation
                  </span>
                  <span className="text-[11px] text-emerald-700">
                    Your financial parameters can be validated instantly inside the calibrated companion suite widget.
                  </span>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-3 shrink-0">
              <span className="text-[10px] text-slate-400">
                Ref: Indian Income Tax Slabs & direct compounding simulations.
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                >
                  Close Advice
                </button>
                <button
                  onClick={() => {
                    onNavigateToWidget(selectedArticle.targetedWidget);
                    setSelectedArticle(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                >
                  Launch Companion Tool <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
