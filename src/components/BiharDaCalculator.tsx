import React, { useState, useMemo } from "react";
import { Sparkles, Share2, Info, Percent, Calculator, ListCollapse, BookOpen, AlertCircle, Coins } from "lucide-react";

interface BiharDaCalculatorProps {
  language?: "en" | "hi";
}

export default function BiharDaCalculator({ language = "en" }: BiharDaCalculatorProps = {}) {
  const [basicPay, setBasicPay] = useState<number>(35400); // Standard Level 6 basic pay
  const [daPercent, setDaPercent] = useState<number>(50); // Current rate 50%
  const [hraPercent, setHraPercent] = useState<number>(8); // Typical town rate

  const computedData = useMemo(() => {
    const daAmount = Math.round((basicPay * daPercent) / 100);
    
    const hraRate = hraPercent;
    const hraAmount = Math.round((basicPay * hraRate) / 100);

    const medicalAllowance = 1000; // Bihar state standard
    const grossSalary = basicPay + daAmount + hraAmount + medicalAllowance;

    // NPS Deduction (10% of Basic + DA)
    const npsDeduction = Math.round(((basicPay + daAmount) * 10) / 100);
    const professionalTax = 150;
    const totalDeductions = npsDeduction + professionalTax;
    const inHandSalary = grossSalary - totalDeductions;

    // 14% Government NPS Contribution
    const govtNpsContribution = Math.round(((basicPay + daAmount) * 14) / 100);

    return {
      daAmount,
      hraAmount,
      hraRate,
      medicalAllowance,
      grossSalary,
      npsDeduction,
      totalDeductions,
      inHandSalary,
      govtNpsContribution
    };
  }, [basicPay, daPercent, hraPercent]);

  const shareToWhatsApp = () => {
    const currentUrl = typeof window !== "undefined"
      ? `${window.location.origin}/?widget=bihar_da`
      : "https://paisablueprint.in/?widget=bihar_da";
    const text = language === "hi"
      ? `📊 *BPSC बिहार शिक्षक महंगाई भत्ता (DA) कैलकुलेटर 2026*\nदर्ज मूल वेतन (Basic Pay): ₹${basicPay.toLocaleString("en-IN")}\nवर्तमान डीए (DA) दर: ${daPercent}%\n*परिणाम स्वरूप कुल डीए राशि: ₹${computedData.daAmount.toLocaleString("en-IN")}*\nसकल मासिक वेतन (Gross Pay): ₹${computedData.grossSalary.toLocaleString("en-IN")}\nशुद्ध इन-हैंड वेतन (Net In-Hand): ₹${computedData.inHandSalary.toLocaleString("en-IN")}\n\nतुरंत गणना करें: ${currentUrl}`
      : `📊 *BPSC Teacher Dearness Allowance (DA) Calculator 2026*\nBasic Pay entered: ₹${basicPay.toLocaleString("en-IN")}\nCurrent DA Rate: ${daPercent}%\n*Formulated DA Amount: ₹${computedData.daAmount.toLocaleString("en-IN")}*\nMonthly Gross Pay: ₹${computedData.grossSalary.toLocaleString("en-IN")}\nNet In-Hand (After Deductions): ₹${computedData.inHandSalary.toLocaleString("en-IN")}\n\nCalculate yours instantly: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      
      {/* Title Header */}
      <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/60 dark:border-slate-800/60 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-black rounded-full mb-3 shadow-sm uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            BPSC Teacher DA Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-slate-800 dark:text-white leading-tight">
            BPSC Teacher Dearness Allowance (DA) Calculator 2026
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-medium max-w-2xl">
            Quickly calculate your revised Dearness Allowance amount, see how it elevates your basic pay, and view the resultant BPSC teacher salary structure adjustments.
          </p>
        </div>
        <button
          onClick={shareToWhatsApp}
          className="bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 text-white font-bold text-xs px-4 py-2.5 rounded-2xl flex items-center justify-center gap-2 self-start sm:self-center shadow-md transition-all border-0"
        >
          <Share2 className="w-4 h-4" />
          <span>{language === "hi" ? "व्हाट्सऐप पर साझा करें" : "Share on WhatsApp"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Input Parameters Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-md space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calculator className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h3 className="font-extrabold text-slate-800 dark:text-white text-base">State DA Inputs</h3>
          </div>

          {/* Basic Pay Numerical Input */}
          <div>
            <label className="block text-xs font-black text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
              Basic Pay (मूल वेतन)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-extrabold">₹</span>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(parseInt(e.target.value) || 0)}
                className="w-full bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 pl-8 pr-4 py-3 text-sm font-black focus:outline-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1 font-medium">
              Enter your current basic pay on the 7th pay commission matrix.
            </p>
          </div>

          {/* DA Percentage Range */}
          <div>
            <div className="flex justify-between text-xs font-semibold mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">Dearness Allowance (DA %)</span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold">{daPercent}%</span>
            </div>
            <input
              type="range"
              min={34}
              max={65}
              step={1}
              value={daPercent}
              onChange={(e) => setDaPercent(parseInt(e.target.value))}
              className="w-full accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
              <span>Previous: 42%</span>
              <span>Current (50% Milestone)</span>
              <span>Max: 65%</span>
            </div>
          </div>

          {/* HRA Ratio selection with Slider & Manual Input */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium mb-2">
              <span className="font-black text-slate-500 uppercase tracking-wide">
                House Rent Allowance (HRA % class)
              </span>
              <span className="text-teal-600 dark:text-teal-400 font-extrabold bg-teal-50 dark:bg-teal-950/40 px-2 py-0.5 rounded-md">
                {hraPercent}% HRA
              </span>
            </div>

            {/* Slider and Manual number input */}
            <div className="flex items-center gap-3 mb-1">
              <input
                type="range"
                min={0}
                max={30}
                step={0.5}
                value={hraPercent}
                onChange={(e) => setHraPercent(parseFloat(e.target.value) || 0)}
                className="flex-1 accent-teal-500 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="relative w-28 shrink-0">
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">%</span>
                <input
                  type="number"
                  value={hraPercent || ""}
                  step={0.1}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setHraPercent(val);
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 pl-2 pr-5 text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                  min={0}
                  max={100}
                  placeholder="Custom %"
                />
              </div>
            </div>
            <p className="text-[9px] text-slate-400 mt-1.5 font-medium leading-relaxed">
              Standard state scales: 16% (Patna), 8% (Towns), 6% (Rural areas).
            </p>
          </div>
        </div>

        {/* Output Dashboard column */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="bg-slate-900 border border-slate-850 dark:bg-neutral-900 dark:border-neutral-800 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <span className="text-xs font-black text-teal-400 uppercase tracking-wider">Dearness Compensation Balance Sheet</span>
              <div className="text-[10px] text-slate-400 font-extrabold">Active 7th Pay Formula</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Computed DA Amount */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">DA Component Net Pay</span>
                <p className="text-3xl font-black text-teal-400 mt-1">₹{computedData.daAmount.toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-400 mt-1.5 font-medium">Adds up directly to your baseline Basic Pay weight.</p>
              </div>

              {/* Combined Basic + DA */}
              <div className="bg-white/5 border border-white/5 rounded-2xl p-4.5">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">New Basic + DA Salary Weight</span>
                <p className="text-2xl font-black text-white mt-1">₹{(basicPay + computedData.daAmount).toLocaleString("en-IN")}</p>
                <p className="text-[9px] text-slate-400 mt-1.5 font-medium">The key base metric used to calculate NPS & Insurance.</p>
              </div>
            </div>

            {/* In hand output summary */}
            <div className="bg-teal-950/20 border border-teal-500/15 rounded-2xl p-4 mt-4 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-wide block">Estimated Ultimate In-Hand Salary</span>
                <p className="text-2xl font-black text-white mt-0.5">₹{computedData.inHandSalary.toLocaleString("en-IN")}/mo</p>
              </div>
              <div className="text-[11px] text-slate-400 text-right">
                <p className="font-extrabold">Gross: ₹{computedData.grossSalary.toLocaleString("en-IN")}</p>
                <p className="text-rose-400 font-medium">Deductions: ₹{computedData.totalDeductions.toLocaleString("en-IN")}</p>
              </div>
            </div>

            {/* Step-by-Step State formulas */}
            <h4 className="text-xs font-black text-slate-300 mt-6 mb-3.5 uppercase tracking-wider">Salary Adjustments Summary</h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Baseline Basic Pay Entered</span>
                <span>₹{basicPay.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">{`House Rent Allowance (${computedData.hraRate}%)`}</span>
                <span className="text-slate-200">+ ₹{computedData.hraAmount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5">
                <span className="text-slate-400">Medical Allowance (Fixed)</span>
                <span className="text-slate-200">+ ₹{computedData.medicalAllowance.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-white/5 font-medium text-rose-400">
                <span>NPS Account Employee Contribution (10%)</span>
                <span>- ₹{computedData.npsDeduction.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-1 text-teal-400 font-black">
                <span>Government of Bihar NPS contribution (14%)</span>
                <span>+ ₹{computedData.govtNpsContribution.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Quick Informational Note */}
          <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/40 p-4.5 rounded-2xl flex gap-3 text-xs text-emerald-800 dark:text-emerald-400">
            <Coins className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-500 mt-0.5" />
            <div>
              <p className="font-extrabold">Dearness Merger Rules</p>
              <p className="mt-0.5 font-medium leading-relaxed">
                Under traditional Central and Bihar state Pay commission schedules, when DA rates cross the critical <strong>50% boundary</strong>, other key dependent benefits (e.g. Gratuity milestones up to Rs 25 Lakhs, City Compensatory, Hostel allowances, Children's Education payouts) are upgraded to automatically adjust with cost of living indicators!
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Guide Content Section */}
      <div className="mt-12 border-t border-slate-200 dark:border-slate-800 pt-8 space-y-8">
        
        <section className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-300 space-y-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white font-display tracking-tight border-l-4 border-teal-500 pl-3">
            What is Dearness Allowance (DA) and How is it Computed in Bihar?
          </h2>
          <p className="text-sm leading-relaxed font-medium">
            Dearness Allowance (महंगाई भत्ता) is a life-maintenance allowance paid of State and Central cabinet employers to public service officials, BPSC educational faculty, and public pensioners. The objective of DA is to neutralize the erosion of real salaries caused by general retail market price inflation of commodities.
          </p>
          <p className="text-sm leading-relaxed font-semibold">
            In Bihar, dearness allowance rates operate in complete tandem with the cabinet revisions of the Union government under the recommendations of the Seventh Central Pay Commission rules. As of the current financial year update, both Union and state departments are implementing a <strong>50% dearness allowance</strong> rate.
          </p>
          
          <h3 className="text-base font-black text-slate-800 dark:text-white pt-2">Formula for Computing Bihar State Dearness Allowance (DA)</h3>
          <p className="text-sm leading-relaxed font-medium">
            For government personnel operating under 7th CPC guidelines (implemented centrally since 1st Jan 2016), the mathematical formula is:
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl font-mono text-center text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-extrabold border border-slate-200 dark:border-slate-800">
            DA Amount = [Basic Pay of the Employee] × [Applicable DA Percentage Rate / 100]
          </div>
          <p className="text-sm leading-relaxed font-medium mt-2">
            For example, if your Basic Pay is ₹35,400 (corresponds to Seventh CPC Pay matrix Level-6) and the prevailing Dearness Allowance rate is 50%, your calculated monthly DA amount is:
          </p>
          <div className="bg-slate-100 dark:bg-slate-900 p-3 rounded-xl font-mono text-center text-xs text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-800/60">
            ₹35,400 × (50 / 100) = ₹17,700 per month
          </div>
        </section>

        {/* FAQs */}
        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-800 dark:text-white font-display tracking-tight flex items-center gap-2 mb-4">
            <Info className="w-5 h-5 text-teal-600" />
            Frequently Asked Questions regarding Bihar DA
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600 dark:text-slate-300 font-medium">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1.5">When is DA revised in the Bihar Government?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                The dearness allowance undergoes a biannual evaluation: the first half takes effect from January (usually approved around March), and the second half starts from July (generally approved around October). Pay arrears for past buffer months are credited separately.
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-4 rounded-xl shadow-sm">
              <h4 className="text-xs font-black text-slate-800 dark:text-white mb-1.5">What is the difference between DA and HRA?</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Dearness allowance adjusts for general price inflation of daily consumption commodities. House Rent Allowance (HRA) is specifically allocated to compensate for housing costs and varies dynamically according to the classification of the municipal city.
              </p>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}
