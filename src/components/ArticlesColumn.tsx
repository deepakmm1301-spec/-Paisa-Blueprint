import React, { useState } from "react";
import { BookOpen, Sparkles, Flame, Search, ArrowRight, X, Clock, HelpCircle, HeartPulse, Percent, Coins, Milestone, Languages } from "lucide-react";

interface Article {
  id: string;
  category: "Investment" | "Tax" | "Saving" | "Retirement";
  readTime: "3 mins read" | "4 mins read" | "5 mins read" | "3 मिनट" | "4 मिनट" | "5 मिनट";
  importance: "High" | "Critical" | "Standard";
  targetedWidget: "tax" | "sip" | "salary" | "health" | "retirement";
  icon: React.ReactNode;
  
  // Bilingual structures
  en: {
    title: string;
    summary: string;
    content: string[];
  };
  hi: {
    title: string;
    summary: string;
    content: string[];
  };
}

interface ArticlesColumnProps {
  onNavigateToWidget: (widgetId: any) => void;
  userMonthlySalary: number;
}

export default function ArticlesColumn({ onNavigateToWidget, userMonthlySalary }: ArticlesColumnProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  const articles: Article[] = [
    {
      id: "art-1",
      category: "Investment",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "Critical",
      targetedWidget: "sip",
      icon: <Coins className="w-4 h-4 text-emerald-500" />,
      en: {
        title: "Direct Mutual Funds Over Regular: The ₹1.5 Cr Wealth Multiplier",
        summary: "Skip banking distributors and advisors who charge 1% in commissions. See how small recurring fees compound to drain millions from your retirement corpus.",
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
      hi: {
        title: "डायरेक्ट म्यूचुअल फंड बनाम रेगुलर: ₹1.5 करोड़ की वेल्थ का सीक्रेट कम्पाउंडिंग गणित",
        summary: "बैंकों और डिस्ट्रीब्यूटर्स के 1% कमीशन से बचें। देखें कि कैसे छोटे-छोटे सालाना चार्ज आपके रिटायरमेंट कॉर्पस को लाखों-करोड़ों रुपये तक नुकसान पहुँचा सकते हैं।",
        content: [
          "भारत में डायरेक्ट म्यूचुअल फंड में कोई डिस्ट्रीब्यूटर कमीशन या एजेंट फीस नहीं होती है, जिसके कारण इनका एक्सपेंस रेशियो (Expense Ratio) अक्सर रेगुलर फंड से 0.75% से 1.5% तक कम होता है।",
          "हालांकि प्रति वर्ष 1% का अंतर बहुत छोटा लगता है, लेकिन लगातार चक्रवृद्धि (fractional compounding) के प्रभाव के कारण यह 20 से 30 वर्षों में आपके कुल फंड को बहुत कम कर देता है।",
          "उदाहरण गणना: यदि आप ₹25,000 मासिक एसआईपी (SIP) निवेश 25 वर्षों के लिए 12% की अपेक्षित सालाना दर (CAGR) से करते हैं:",
          "• डायरेक्ट म्यूचुअल फंड के साथ (12% CAGR): आपका फाइनल पोर्टफोलियो लगभग ₹4.70 करोड़ हो जाता है।",
          "• रेगुलर फंड के साथ (जिसमें 1% कमीशन शुल्क शामिल है - 11% CAGR): आपका फाइनल पोर्टफोलियो केवल ₹3.75 करोड़ ही बन पाता है।",
          "• यानी बिना किसी वजह के बैकग्राउंड कमीशन में आपकी गाढ़ी कमाई से लगभग ₹95 लाख का सीधा नुकसान!",
          "हमेशा उन म्यूचुअल फंड्स को चुनें जिनके नाम में 'Regular' के बजाय 'Direct' शब्द लिखा हो। अपने लक्ष्यों की ठीक से गणना करने के लिए हमारे SIP Calculator का उपयोग करें।"
        ]
      }
    },
    {
      id: "art-2",
      category: "Tax",
      readTime: language === "hi" ? "5 मिनट" : "5 mins read",
      importance: "Critical",
      targetedWidget: "tax",
      icon: <Percent className="w-4 h-4 text-orange-500" />,
      en: {
        title: "Decoupling the Regime Conundrum: New vs. Old Tax Regime Slabs",
        summary: "With FY 2024-25 updates, the New Tax regime is the standard default. Calculate when standard Old regime deductions can save you more money.",
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
      hi: {
        title: "टैक्स का सही चुनाव: नई बनाम पुरानी टैक्स प्रणाली (New vs Old Tax Regime Slabs)",
        summary: "वित्त वर्ष 2024-25 के अपडेट के साथ, नया टैक्स स्लैब डिफॉल्ट हो गया है। जानें कि निवेश और छूट के साथ पुरानी प्रणाली कब आपके लिए फायदेमंद हो सकती है।",
        content: [
          "भारत में नई कर प्रणाली (New Tax Regime) में कम टैक्स दरें और वेतनभोगी कर्मचारियों के लिए ₹75,000 की मानक कटौती (Standard Deduction) दी गई है।",
          "इसके विपरीत, पुरानी कर प्रणाली (Old Tax Regime) उन लोगों के लिए बेहद शक्तिशाली है जो विभिन्न टैक्स-बचत धाराओं (deductions) में निवेश करते हैं:",
          "• धारा 80C की सीमा: ₹1.5 लाख तक की छूट (EPF, PPF, ELSS, बच्चों की ट्यूशन फीस, आदि)।",
          "• धारा 24b गृह ऋण ब्याज: होम लोन के ब्याज भुगतान पर ₹2 लाख तक की वार्षिक छूट।",
          "• धारा 80D स्वास्थ्य बीमा: स्वयं, परिवार व वरिष्ठ नागरिक माता-पिता के लिए ₹75,000 तक की छूट।",
          "• एचआरए (HRA) किराया छूट: मेट्रो या नॉन-मेट्रो शहरों के नियमानुसार मकान किराया भुगतान पर शानदार छूट।",
          "सिद्धांत यह है: यदि आपकी कुल टैक्स-बचत कटौतियां सालाना ₹3,75,000 से अधिक हैं, तो पुरानी टैक्स व्यवस्था आपके लिए अधिक फायदेमंद रहेगी। टैक्स प्लानर (Tax Planner) टूल का उपयोग करके तुरंत दोनों पद्धतियों की तुलना करें।"
        ]
      }
    },
    {
      id: "art-3",
      category: "Saving",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "High",
      targetedWidget: "health",
      icon: <HeartPulse className="w-4 h-4 text-rose-500" />,
      en: {
        title: "Why Traditional ULIPs and Endowment Policies are Wealth Destroyers",
        summary: "Combining protection & investment often returns worse than savings accounts. Break the cycle of lock-ins and embrace Direct Mutual Funds plus Direct Term Insurance.",
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
      hi: {
        title: "पारम्परिक यूलिप (ULIP) और एंडोमेंट पॉलिसियां क्यों हैं वेल्थ डिस्ट्रॉयर?",
        summary: "बीमा और निवेश को मिलाना अक्सर घाटे का सौदा होता है। यूलिप के लॉक-इन चक्र को तोड़ें और 'टर्म इंश्योरेंस + डायरेक्ट म्यूचुअल फंड' की बेहतरीन रणनीति अपनाएं।",
        content: [
          "यूनिट लिंक्ड इंश्योरेंस प्लान (ULIP) और पारंपरिक मनीबैक पॉलिसियां सुरक्षा के साथ गारंटीड रिटर्न का वादा करती हैं, लेकिन ये बहुत कम मुनाफा देती हैं।",
          "इन योजनाओं में शुरुआती 5 वर्षों में पॉलिसी एडमिनिस्ट्रेशन, मृत्यु दर शुल्क (Mortality charges) और आवंटन शुल्क काफी अधिक काटे जाते हैं, जिससे आपका मूलधन बहुत कम रह जाता है।",
          "ऐसी पॉलिसियों का औसत सालाना रिटर्न केवल 4.5% से 6% के आसपास रहता है, जो महंगाई दर को भी मात नहीं दे पाता।",
          "इसका सबसे सरल, सुरक्षित और पावरफुल विकल्प इंश्योरेंस व इन्वेस्टमेंट को हमेशा अलग रखना है:",
          "1. अपने सालाना पैकेज/वेतन का कम से कम 15 से 20 गुना का एक प्योर टर्म इंश्योरेंस लें (जो बहुत कम खर्च में मिल जाता है)।",
          "2. बचे हुए पैसे को सीधे निफ्टी 50 इंडेक्स या अन्य किसी डायरेक्ट म्यूचुअल फंड में निवेश करें।",
          "इस दोहरे दृष्टिकोण से आपको बेहतरीन जीवन सुरक्षा और दो अंकों (Double digit) में कम्पाउंडिंग रिटर्न मिलता है।"
        ]
      }
    },
    {
      id: "art-4",
      category: "Tax",
      readTime: language === "hi" ? "3 मिनट" : "3 mins read",
      importance: "Standard",
      targetedWidget: "salary",
      icon: <Milestone className="w-4 h-4 text-sky-500" />,
      en: {
        title: "Unlocking the NPS Section 80CCD(1B) ₹50,000 Tax Waiver Bonus",
        summary: "Most salaried professionals ignore the exclusive additional retirement deduction beyond the ₹1.5L umbrella of 80C. Learn how NPS Tier 1 delivers.",
        content: [
          "National Pension System (NPS) Tier-1 offers an exclusive deduction under Section 80CCD(1B) of the Income Tax Act.",
          "This deduction permits a maximum waiver of up to ₹50,000 annually. Crucially, this benefit is completely over and above the traditional Section 80C limit of ₹1,50,000.",
          "For a salaried taxpayer sitting in the peak 30% tax bracket, investing ₹50,000 in NPS yields immediate cash savings of ₹15,600 each financial year in taxes.",
          "NPS also lets you control asset allocation classes (Equity, Corporate Debt, and Government Securities).",
          "Optimize your future wage breakdowns on the Salary Planner list to review take-home modifications and allocation patterns."
        ]
      },
      hi: {
        title: "एनपीएस धारा 80CCD(1B): पाइए ₹50,000 की एक्स्ट्रा टैक्स छूट का बोनस",
        summary: "ज्यादातर नौकरीपेशा लोग धारा 80C के ₹1.5 लाख के अतिरिक्त मिलने वाले ₹50,000 के खास पेंशन निवेश लाभ को नजरअंदाज कर देते हैं। जानिए एनपीएस कैसे काम करता है।",
        content: [
          "राष्ट्रीय पेंशन प्रणाली (NPS) के टियर-1 खाते में निवेश करने पर इनकम टैक्स एक्ट की धारा 80CCD(1B) के तहत अतिरिक्त टैक्स छूट मिलती है।",
          "यह कटौती आपको सालाना ₹50,000 तक की अतिरिक्त छूट प्रदान करती है, जो कि धारा 80C की ₹1.5 लाख की सीमा से बिल्कुल अलग है।",
          "यदि आप 30% वाले टैक्स स्लैब में आते हैं, तो एनपीएस के माध्यम से ₹50,000 निवेश करने पर आप हर साल ₹15,600 का टैक्स सीधे बचा सकते हैं।",
          "एनपीएस आपको अपने निवेश में इक्विटी और डेट (कर्ज) के अनुपात को अपनी पसंद के अनुसार चुनने की सहूलियत भी देता है।",
          "वेतन नियोजक (Salary Planner) में जाकर अपने वेतन संरचना और टैक्स कटौती के लाभ की तुरंत गणना करें।"
        ]
      }
    },
    {
      id: "art-5",
      category: "Investment",
      readTime: language === "hi" ? "4 मिनट" : "4 mins read",
      importance: "High",
      targetedWidget: "retirement",
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
      en: {
        title: "The Compounding Step-Up Cheat Sheet: Rule of 72 & Raising SIPs",
        summary: "Do not keep your SIP amount flat. Discover how adding a 10% annual increase matching your corporate promotion cycle completely alters your final estate.",
        content: [
          "Many investors start a standard monthly SIP of ₹10,000 and leave it unchanged for 20 years, ignoring that their salary scale naturally increases with career progressions.",
          "By enforcing a Step-Up SIP (boosting your investment magnitude by just 10% annually to match salary appraisals), you compound wealth exponentially faster.",
          "Let's observe the multiplier over 20 years at a 12% CAGR rate:",
          "• Scenario A (Flat SIP of ₹10,000/month): Total invested capital is ₹24 Lakhs, and the final maturity value is ₹99.9 Lakhs.",
          "• Scenario B (10% Annual Step-up): Your initial SIP starts at ₹10,000, rising to ₹11,000 in Year 2, ₹12,100 in Year 3, etc. Total invested capital becomes ₹68.7 Lakhs, and the final compounded portfolio is a massive ₹2.07 Crores!",
          "A humble 10% annual upgrade produces more than double the final wealth outcome. Learn to balance long-term compounding milestones in the Retirement Planner."
        ]
      },
      hi: {
        title: "कम्पाउंडिंग स्टेप-अप सीक्रेट: हर साल 10% एसआईपी (SIP) बढ़ाकर पाएं दोगुनी वेल्थ",
        summary: "अपने मासिक एसआईपी (SIP) की राशि को कभी भी स्थिर न रखें। हर साल अपने इंक्रीमेंट या प्रमोशन के अनुसार मात्र 10% की बढ़ोतरी करके अपने रिटायरमेंट कॉर्पस को दोगुना से अधिक बढ़ाएं।",
        content: [
          "कई निवेशक सालों-साल ₹10,000 की फ्लैट मासिक एसआईपी जारी रखते हैं, जबकि उनके करियर की प्रगति के साथ उनकी सैलरी लगातार बढ़ती जाती है।",
          "अपनी एसआईपी राशि में मात्र 10% की वार्षिक बढ़ोतरी (Step-up SIP) करके आप अपनी पूंजी को आश्चर्यजनक रूप से तेजी से बढ़ा सकते हैं।",
          "आइए 20 वर्षों के लिए 12% वार्षिक रिटर्न (CAGR) पर तुलना करें:",
          "• विकल्प अ (स्थिर ₹10,000/माह): कुल निवेश ₹24 लाख होगा, तथा मैच्योरिटी वैल्यू लगभग ₹99.9 लाख होगी।",
          "• विकल्प ब (10% वार्षिक स्टेप-अप): आपकी किस्त पहले वर्ष ₹10,000, दूसरे वर्ष ₹11,000, तीसरे वर्ष ₹12,100 होगी। इससे कुल निवेश ₹68.7 लाख होगा और अंतिम कॉपर्स ₹2.07 करोड़ की भारी-भरकम राशि बन जाएगा!",
          "एक छोटा सा 10% का वार्षिक अपग्रेड आपके अंतिम कॉर्पस को दोगुने से भी अधिक बढ़ा देता है। इसके कैलकुलेशन की जांच आज ही हमारे रिटायरमेंट प्लानर (Retirement Planner) में करें।"
        ]
      }
    }
  ];

  const categories = ["All", "Investment", "Tax", "Saving", "Retirement"];
  
  const categoryLabels: Record<string, string> = {
    All: language === "hi" ? "सभी श्रेणी" : "All Advice",
    Investment: language === "hi" ? "निवेश" : "Investment",
    Tax: language === "hi" ? "कर / टैक्स" : "Tax",
    Saving: language === "hi" ? "बचत" : "Saving",
    Retirement: language === "hi" ? "रिटायरमेंट" : "Retirement"
  };

  const filteredArticles = articles.filter((art) => {
    const titleText = language === "en" ? art.en.title : art.hi.title;
    const summaryText = language === "en" ? art.en.summary : art.hi.summary;
    
    const matchesSearch = 
      titleText.toLowerCase().includes(searchQuery.toLowerCase()) || 
      summaryText.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "All" || art.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div id="articles-advisor-panel" className="bg-white border border-slate-100 rounded-2xl p-5 shadow-3xs space-y-4">
      
      {/* Header section with Cabinet name & total reads flag */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4.5 h-4.5 text-bhagwa-600 animate-pulse" />
          <h3 className="font-extrabold text-xs text-slate-800 tracking-wider uppercase">
            {language === "hi" ? "पैसा मार्गदर्शन कैबिनेट" : "Paisa Guidance Cabinet"}
          </h3>
        </div>
        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono font-bold">
          {articles.length} {language === "hi" ? "मार्गदर्शन" : "reads Available"}
        </span>
      </div>

      {/* Prominent Bilingual Language Selector Button Unit */}
      <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-1.5">
        <div className="flex items-center gap-1.5 text-slate-500 pl-1">
          <Languages className="w-3.5 h-3.5 text-bhagwa-600" />
          <span className="text-[10px] font-bold">
            {language === "hi" ? "भाषा बदलें:" : "Language:"}
          </span>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setLanguage("en")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              language === "en"
                ? "bg-white text-bhagwa-600 shadow-3xs border border-slate-150 font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            English
          </button>
          <button
            onClick={() => setLanguage("hi")}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide transition-all cursor-pointer ${
              language === "hi"
                ? "bg-bhagwa-600 text-white shadow-3xs font-extrabold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            हिन्दी (Hindi)
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 leading-relaxed">
        {language === "hi"
          ? "नौकरीपेशा भारतीयों के लिए विशेषज्ञ वित्तीय सलाह, व्यावहारिक योजनाएं और वेतन से बचत बढ़ाने के आसान तथा सटीक मार्गदर्शन।"
          : "Expert bites, simplified calculators, tax strategies calibrated specifically to help Indian salaried professionals leverage compounding."}
      </p>

      {/* Filter and Search controls */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "टैक्स छूट, एसआईपी, म्यूचुअल फंड खोजें..."
                : "Search tax advice, SIP wisdom..."
            }
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
              {categoryLabels[cat]}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Feed */}
      <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
        {filteredArticles.length === 0 ? (
          <div className="p-6 text-center text-slate-400 border border-dashed border-slate-100 rounded-xl bg-slate-50">
            <span className="block text-xs font-semibold">
              {language === "hi" ? "कोई मेल नहीं मिला" : "No matched advice"}
            </span>
            <span className="block text-[10px] text-slate-450 mt-1">
              {language === "hi" ? "कृपया कुछ अन्य शब्द लिखकर खोजें" : "Try other tags or words"}
            </span>
          </div>
        ) : (
          filteredArticles.map((art) => {
            const currentData = language === "en" ? art.en : art.hi;
            return (
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
                      {language === "hi" && art.category === "Investment" ? "निवेश" :
                       language === "hi" && art.category === "Tax" ? "टैक्स" :
                       language === "hi" && art.category === "Saving" ? "बचत" :
                       language === "hi" && art.category === "Retirement" ? "रिटायरमेंट" : art.category}
                    </span>
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                      <Clock className="w-3 h-3 text-slate-300" />
                      <span>{art.readTime}</span>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 leading-tight group-hover:text-slate-950 transition-colors line-clamp-2">
                    {currentData.title}
                  </h4>
                  <p className="text-[10px] text-slate-450 line-clamp-2 leading-relaxed">
                    {currentData.summary}
                  </p>
                  <span className="text-[10px] text-bhagwa-600 group-hover:text-bhagwa-700 font-bold inline-flex items-center gap-0.5 mt-1">
                    {language === "hi" ? "मार्गदर्शन फ़ाइल पढ़ें" : "Read blueprint counsel"}{" "}
                    <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Interactive prompt for user salary context */}
      <div className="bg-slate-950 text-slate-300 p-3.5 rounded-xl border border-slate-800 space-y-2">
        <span className="text-[8px] uppercase tracking-widest text-emerald-400 font-black block">
          {language === "hi" ? "सक्रिय वेतन संदर्भ स्थिति" : "Active Salary Context Check"}
        </span>
        <p className="text-[10px] text-slate-400 leading-tight">
          {language === "hi" ? (
            <>
              सक्रिय लेज़र में आपका मासिक वेतन{" "}
              <strong className="text-white font-mono">
                ₹{userMonthlySalary.toLocaleString("en-IN")}/माह
              </strong>{" "}
              दर्ज है। योजना बनाने के लिए हमारे विशेष टूल्स का उपयोग करें।
            </>
          ) : (
            <>
              Your active ledger salary is registered at{" "}
              <strong className="text-white font-mono">
                ₹{userMonthlySalary.toLocaleString("en-IN")}/mo
              </strong>
              . Use the integrated tools to plan allocations.
            </>
          )}
        </p>
      </div>

      {/* Beautiful Modal Article Reader */}
      {selectedArticle && (() => {
        const currentData = language === "en" ? selectedArticle.en : selectedArticle.hi;
        return (
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
                      {language === "hi" && selectedArticle.category === "Investment" ? "निवेश" :
                       language === "hi" && selectedArticle.category === "Tax" ? "टैक्स" :
                       language === "hi" && selectedArticle.category === "Saving" ? "बचत" :
                       language === "hi" && selectedArticle.category === "Retirement" ? "रिटायरमेंट" : selectedArticle.category}{" "}
                      {language === "hi" ? "सलाह" : "Advice"}
                    </span>
                    {selectedArticle.importance === "Critical" && (
                      <span className="px-2 py-0.5 bg-rose-500 text-white rounded text-[9px] uppercase tracking-wider font-extrabold flex items-center gap-0.5">
                        <Flame className="w-2.5 h-2.5 shrink-0" /> {language === "hi" ? "महत्वपूर्ण" : "Important"}
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {selectedArticle.readTime}
                    </span>
                  </div>
                  <h3 className="text-base md:text-lg font-black tracking-tight leading-snug">
                    {currentData.title}
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
                  {currentData.summary}
                </p>

                <hr className="border-slate-100" />

                <div className="space-y-4">
                  {currentData.content.map((para, index) => (
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
                      {language === "hi" ? "सलाहकार की सीधी अनुशंसा" : "Adviser Direct Recommendation"}
                    </span>
                    <span className="text-[11px] text-emerald-700">
                      {language === "hi"
                        ? "आप ऊपर बताए गए वित्तीय मापदंडों की जांच सीधे इसके समतुल्य टूल/कैलकुलेटर को खोलकर तुरंत कर सकते हैं।"
                        : "Your financial parameters can be validated instantly inside the calibrated companion suite widget."}
                    </span>
                  </div>
                </div>
              </div>

              {/* Sticky Actions Footer */}
              <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center sm:justify-between gap-3 shrink-0">
                <span className="text-[10px] text-slate-400">
                  {language === "hi"
                    ? "संदर्भ: भारतीय आयकर स्लैब, प्रत्यक्ष निवेश और कम्पाउंडिंग सिमुलेशन गणना।"
                    : "Ref: Indian Income Tax Slabs & direct compounding simulations."}
                </span>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setSelectedArticle(null)}
                    className="w-full sm:w-auto px-4 py-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                  >
                    {language === "hi" ? "बंद करें" : "Close Advice"}
                  </button>
                  <button
                    onClick={() => {
                      onNavigateToWidget(selectedArticle.targetedWidget);
                      setSelectedArticle(null);
                    }}
                    className="w-full sm:w-auto px-4 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-extrabold rounded-xl text-xs transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {language === "hi" ? "टूल/कैलकुलेटर शुरू करें" : "Launch Companion Tool"}{" "}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
