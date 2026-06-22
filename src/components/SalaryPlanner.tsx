import React, { useState, useEffect } from "react";
import { UserProfile } from "../types";
import { Landmark, Calculator, Receipt, Shield, Award, HelpCircle, AlertCircle } from "lucide-react";

interface Props {
  profile: UserProfile;
}

// BPSC/KVS scales and standard options
type EmployeeCategory = "bpsc_primary" | "bpsc_secondary" | "bpsc_senior_secondary" | "kvs_teacher" | "bihar_govt" | "central_govt" | "private_salaried";

export default function SalaryPlanner({ profile }: Props) {
  const [category, setCategory] = useState<EmployeeCategory>("bpsc_primary");
  const [basicPay, setBasicPay] = useState<number>(25000);
  const [daRate, setDaRate] = useState<number>(50); // 50% current standard (or 53%)
  const [hraRate, setHraRate] = useState<number>(20); // 0% to 100% direct range
  const [otherAllowances, setOtherAllowances] = useState<number>(2000);
  
  // Custom DA Hike / Extra calculators states
  const [daHikeRate, setDaHikeRate] = useState<number>(3); // DA Hike % e.g. 3% or 4%
  const [monthsEncash, setMonthsEncash] = useState<number>(10); // Standard leave encashment months (max 10 months / 300 days)
  const [yearsWorked, setYearsWorked] = useState<number>(20); // Gratuity calculation years

  // Pre-fill fields based on categorization
  useEffect(() => {
    switch (category) {
      case "bpsc_primary":
        setBasicPay(25000); // Standard basic for primary teacher BPSC
        setHraRate(10);
        setOtherAllowances(2000); // Medical + other allowances
        break;
      case "bpsc_secondary":
        setBasicPay(31000); // Standard basic for Class 9-10 teacher
        setHraRate(20);
        setOtherAllowances(2500);
        break;
      case "bpsc_senior_secondary":
        setBasicPay(32000); // Class 11-12
        setHraRate(20);
        setOtherAllowances(2500);
        break;
      case "kvs_teacher":
        setBasicPay(44900); // Level 7 of 7th Pay Commission typical base
        setHraRate(20);
        setOtherAllowances(3800);
        break;
      case "bihar_govt":
        setBasicPay(28000);
        setHraRate(10);
        setOtherAllowances(1800);
        break;
      case "central_govt":
        setBasicPay(47600); // Level 8 base
        setHraRate(30);
        setOtherAllowances(4200);
        break;
      case "private_salaried":
        setBasicPay(Math.round(profile.salary * 0.45)); // Private basic is usually 40-50% of gross
        setHraRate(20);
        setOtherAllowances(Math.round(profile.salary * 0.2));
        break;
    }
  }, [category, profile.salary]);

  // Core Math
  const daAmount = Math.round((basicPay * daRate) / 100);
  const hraAmount = Math.round((basicPay * hraRate) / 100);
  
  // NPS Deductions: Employee contributes 10% of (Basic + DA)
  const isGovernment = category !== "private_salaried";
  const npsEmployeeBase = basicPay + daAmount;
  const npsEmployeeDeduction = isGovernment ? Math.round(npsEmployeeBase * 0.10) : 0;
  // Employer matching NPS is 14% of (Basic + DA) for Govt
  const npsGovtMatch = isGovernment ? Math.round(npsEmployeeBase * 0.14) : 0;

  // EPF Deductions for private sector (Standard 12% of basic up to 15,000 threshold or full basic)
  const pfDeduction = !isGovernment ? Math.min(Math.round(basicPay * 0.12), 1800) : 0;

  // Professional Tax: standard Rs 208/month or similar across India
  const professionalTax = 200;

  const grossSalary = basicPay + daAmount + hraAmount + otherAllowances;
  
  // Hand salary before standard tax rates
  const inHandSalary = grossSalary - npsEmployeeDeduction - pfDeduction - professionalTax;

  // Extra calculators
  // 1. DA Hike Impact
  const futureDaRate = daRate + daHikeRate;
  const futureDaAmount = Math.round((basicPay * futureDaRate) / 100);
  const daHikeGain = futureDaAmount - daAmount;
  const futureInHand = inHandSalary + daHikeGain - (isGovernment ? Math.round(daHikeGain * 0.10) : 0);

  // 2. Gratuity Calculator: (15 * Last basic pay + DA) * Years / 26
  const lastDrawnBasicPlusDa = basicPay + daAmount;
  const estimatedGratuity = Math.round(((lastDrawnBasicPlusDa * 15) / 26) * yearsWorked);

  // 3. Leave Encashment: Last basic pay + DA * Leave Accumulation (Months)
  const estimatedLeaveEncashment = lastDrawnBasicPlusDa * monthsEncash;

  return (
    <div id="salary-planner" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
      {/* Header */}
      <div className="border-b border-slate-100 pb-5 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 px-2.5 py-1 rounded-full">Section 7th Pay / Salaried</span>
        <h2 className="text-2xl font-bold text-slate-800 mt-2 font-display">Salary Planner & Pay Scale Estimator</h2>
        <p className="text-slate-500 text-sm mt-1">
          Detailed pay computation including Dearness Allowances (DA), HRA, National Pension System (NPS), and PF matching rates in Bihar or Central service.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Control Panel */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-6 text-sm">
          <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <Calculator className="w-4 h-4 text-bhagwa-600" /> Structure Configuration
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Employment Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as EmployeeCategory)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-bhagwa-500"
            >
              <option value="bpsc_primary">BPSC Primary Teacher (Class 1-5)</option>
              <option value="bpsc_secondary">BPSC Secondary Teacher (Class 9-10)</option>
              <option value="bpsc_senior_secondary">BPSC Senior Secondary (Class 11-12)</option>
              <option value="kvs_teacher">Kendriya Vidyalaya (KVS) Teacher</option>
              <option value="bihar_govt">Bihar State Government Employee</option>
              <option value="central_govt">Central Government Employee</option>
              <option value="private_salaried">Private Sector Salaried Employee</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span>Basic Pay Scale (₹/Month)</span>
              <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-2xs">
                <span className="text-slate-400">₹</span>
                <input
                  type="number"
                  value={basicPay || ""}
                  onChange={(e) => setBasicPay(Number(e.target.value))}
                  className="w-20 bg-transparent text-right font-bold text-bhagwa-600 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
              </div>
            </div>
            <input
              type="range"
              min="10000"
              max="150000"
              step="1"
              value={basicPay}
              onChange={(e) => setBasicPay(Number(e.target.value))}
              className="w-full accent-bhagwa-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹10,000</span>
              <span>₹1,50,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span>Dearness Allowance (DA % of Basic)</span>
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-2xs">
                <input
                  type="number"
                  value={daRate || ""}
                  onChange={(e) => setDaRate(Number(e.target.value))}
                  className="w-12 bg-transparent text-right font-bold text-bhagwa-600 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={daRate}
              onChange={(e) => setDaRate(Number(e.target.value))}
              className="w-full accent-bhagwa-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0% (No DA)</span>
              <span>50% (Current)</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs font-semibold text-slate-600 mb-1.5">
              <span>House Rent Allowance (HRA % of Basic)</span>
              <div className="flex items-center gap-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 shadow-2xs">
                <input
                  type="number"
                  value={hraRate || ""}
                  onChange={(e) => setHraRate(Number(e.target.value))}
                  className="w-12 bg-transparent text-right font-bold text-bhagwa-600 focus:outline-none focus:ring-0 border-0 p-0 text-xs"
                />
                <span className="text-slate-400">%</span>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={hraRate}
              onChange={(e) => setHraRate(Number(e.target.value))}
              className="w-full accent-bhagwa-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0% (No HRA)</span>
              <span>10% (Rural)</span>
              <span>20% (Tier 2)</span>
              <span>30% (Metro)</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medical / Other Allowances (₹/Month)</label>
            <input
              type="number"
              value={otherAllowances}
              onChange={(e) => setOtherAllowances(Number(e.target.value))}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:border-bhagwa-500"
            />
          </div>

          {/* Quick Info Box */}
          <div className="bg-bhagwa-50 border border-bhagwa-100 rounded-xl p-3 flex gap-2 text-bhagwa-800 text-xs leading-relaxed">
            <Shield className="w-4 h-4 text-bhagwa-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Government NPS Matching Advantage</p>
              <p className="text-[11px] text-bhagwa-700/90 mt-0.5">
                The government automatically adds an extra 14% matching contribution (₹{npsGovtMatch.toLocaleString("en-IN")}/mo) to your NPS account! This is a powerful retirement multiplier that pays off handsomely.
              </p>
            </div>
          </div>
        </div>

        {/* Right Output Sheet */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2 font-display">
              <Receipt className="w-5 h-5 text-bhagwa-600" /> Monthly Salary Breakdown
            </h3>

            <div className="bg-slate-50/50 rounded-2xl border border-slate-100 divide-y divide-slate-100 text-sm overflow-hidden min-h-[300px]">
              {/* Primary Header Row */}
              <div className="p-4 bg-slate-100/50 flex justify-between items-center">
                <span className="font-semibold text-slate-700">Earnings Components</span>
                <span className="text-xs font-bold text-bhagwa-600">Salaried Breakdown</span>
              </div>

              {/* Rows */}
              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Basic Pay Scale</span>
                <span className="font-bold text-slate-800">₹{basicPay.toLocaleString("en-IN")}</span>
              </div>

              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Dearness Allowance (DA @{daRate}%)</span>
                <span className="font-semibold text-emerald-600">+₹{daAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="p-4 flex justify-between">
                <span className="text-slate-600">House Rent Allowance (HRA @{hraRate}%)</span>
                <span className="font-semibold text-emerald-600">+₹{hraAmount.toLocaleString("en-IN")}</span>
              </div>

              <div className="p-4 flex justify-between">
                <span className="text-slate-600">Medical / Other Allowances</span>
                <span className="font-semibold text-emerald-600">+₹{otherAllowances.toLocaleString("en-IN")}</span>
              </div>

              <div className="p-4 bg-bhagwa-50/30 flex justify-between">
                <span className="font-bold text-slate-800">1. Gross Monthly Salary</span>
                <span className="font-extrabold text-slate-900 text-md">₹{grossSalary.toLocaleString("en-IN")}</span>
              </div>

              {/* Deductions */}
              {isGovernment && (
                <div className="p-4 flex justify-between bg-rose-50/10">
                  <span className="text-slate-500 italic">NPS Employee Deduction (10% of Basic + DA)</span>
                  <span className="font-semibold text-rose-600">-₹{npsEmployeeDeduction.toLocaleString("en-IN")}</span>
                </div>
              )}

              {!isGovernment && (
                <div className="p-4 flex justify-between bg-rose-50/10">
                  <span className="text-slate-500 italic">EPF Employee deduction (12%)</span>
                  <span className="font-semibold text-rose-600">-₹{pfDeduction.toLocaleString("en-IN")}</span>
                </div>
              )}

              <div className="p-4 flex justify-between">
                <span className="text-slate-500">Professional Tax (P-Tax)</span>
                <span className="font-semibold text-rose-600">-₹{professionalTax}</span>
              </div>

              {/* Final Take-Home */}
              <div className="p-5 bg-gradient-to-r from-bhagwa-50 to-emerald-50/30 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-bhagwa-950 text-base font-display">2. Est. Net In-Hand Salary</span>
                  <span className="block text-[11px] text-slate-500 font-normal">Approximate cash deposited to your bank account monthly</span>
                </div>
                <span className="font-extrabold text-2xl text-bhagwa-600 font-display">
                  ₹{inHandSalary.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Government Special Benefits Calculations Section */}
          <div className="border-t border-slate-100 pt-6 mt-6 col-span-full">
            <h3 className="font-bold text-slate-800 text-md mb-4 flex items-center gap-1.5 font-display">
              <Award className="w-5 h-5 text-bhagwa-600" /> Government Benefit Multipliers
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* DA Hike Impact Card */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-bhagwa-600">DA Hike Estimator</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={daHikeRate} 
                      onChange={(e) => setDaHikeRate(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-white border border-slate-200 text-center text-xs font-bold p-1 rounded-sm"
                    />
                    <span className="text-xs text-slate-500">%</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  If Dearness Allowance hikes by standard <strong>{daHikeRate}%</strong>, your salary changes:
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Additional GAIN</span>
                    <span className="font-bold text-emerald-600">+₹{daHikeGain.toLocaleString("en-IN")}/mo</span>
                  </div>
                  <div className="flex justify-between mt-1 text-slate-700 font-semibold">
                    <span>New In-hand</span>
                    <span className="text-bhagwa-600">₹{futureInHand.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Gratuity Estimator */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-bhagwa-600 font-display">Retirement Gratuity</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="1" 
                      max="40" 
                      value={yearsWorked} 
                      onChange={(e) => setYearsWorked(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-white border border-slate-200 text-center text-xs font-bold p-1 rounded-sm"
                    />
                    <span className="text-xs text-slate-500">Yrs</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Estimated lump sum Retirement Gratuity after <strong>{yearsWorked} years</strong> of service:
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Lump Sum Gratuity</span>
                    <span className="font-bold text-slate-800 text-sm">₹{estimatedGratuity.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {/* Leave Encashment */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-bhagwa-600 font-display">Leave Encashment</span>
                  <div className="flex items-center gap-1">
                    <input 
                      type="number" 
                      min="1" 
                      max="10" 
                      value={monthsEncash} 
                      onChange={(e) => setMonthsEncash(Math.max(1, Number(e.target.value)))}
                      className="w-10 bg-white border border-slate-200 text-center text-xs font-bold p-1 rounded-sm"
                    />
                    <span className="text-xs text-slate-500">Mo</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-snug">
                  Estimated payout for <strong>{monthsEncash} months</strong> of earned unutilized accumulated leaves:
                </p>
                <div className="pt-2 border-t border-slate-100 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600">Encashment</span>
                    <span className="font-bold text-slate-800 text-sm">₹{estimatedLeaveEncashment.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Salary, Pension and Allowances Explanation Section */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-8 text-left bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-850">
          {/* Explanation Section */}
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-805 font-display">
              How is Government &amp; Salaried Income Computed in India?
            </h3>
            <p className="text-xs leading-relaxed text-slate-650 dark:text-slate-400">
              Understanding your salaried package (or Gross Salary) involves dividing the various compensation allowances mandated by the Government or corporate HR policy. In India, salaried earnings are divided into a core Basic Pay, upon which other dynamic allowances like Dearness Allowance (DA), House Rent Allowance (HRA), and Medical/Transport buffers are scaled.
            </p>
            <p className="text-xs leading-relaxed text-slate-655 dark:text-slate-400">
              During retirement or voluntary resignation, permanent salaried employees are also legally entitled to specialized payouts such as **Gratuity** (under the Payment of Gratuity Act, computed as 15 days of basic salary for each completed year of service) and **Leave Encashment** (reimbursing unavailed earned leaves up to a statutory 300-day cumulative ceiling).
            </p>
          </div>

          {/* FAQ Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-extrabold text-slate-800 font-display">
              Salaried &amp; Pension Allowance FAQs
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q1: What is the rule for tax-free Gratuity?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  Under current Union Budget adjustments, the maximum tax-free Gratuity exemption limit for qualified non-government employees has been increased to ₹25 Lakhs, matching Central Government rules.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q2: How is HRA calculated under tax exemptions?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  House Rent Allowance (HRA) is tax-exempted under Section 10(13A) to the minimum of: Actual HRA received, Rent paid minus 10% of basic pay, or 50% (metros) / 40% (non-metros) of basic pay.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q3: Is Leave Encashment taxable?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  During active service, leave encashment is fully taxable. At retirement, the tax-free limit for leave encashment for non-government employees stands at ₹25 Lakhs.
                </p>
              </div>

              <div className="bg-slate-50/50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                <span className="block font-bold text-xs text-indigo-950 dark:text-indigo-300">
                  Q4: Does basic pay scale increase every year?
                </span>
                <p className="text-[11px] leading-relaxed text-slate-550 dark:text-slate-405">
                  Yes, central and state government employees see a regular annual increment (typically 3%) on either July 1st or January 1st under 7th Pay Commission recommendations.
                </p>
              </div>
            </div>
          </div>

          {/* Related Calculators */}
          <div className="bg-violet-50/45 dark:bg-violet-950/10 border border-violet-100/60 dark:border-violet-900/30 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-black uppercase text-violet-600 dark:text-violet-400 tracking-wider font-mono block">Related Utilities</span>
            <p className="text-xs font-bold text-slate-805 dark:text-slate-350">Optimize your future-proof ledger with central related Paisa planners:</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <a href="/sip-calculator.html" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-violet-450 text-center font-bold text-slate-705 dark:text-slate-300 block">SIP Calculator</a>
              <a href="/nps-calculator.html" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-violet-450 text-center font-bold text-slate-705 dark:text-slate-300 block">NPS Tax Planner</a>
              <a href="/pension-calculator.html" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-violet-450 text-center font-bold text-slate-705 dark:text-slate-300 block">Pension Retirement</a>
              <a href="/da-calculator.html" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl hover:border-violet-450 text-center font-bold text-slate-705 dark:text-slate-300 block">DA Allowance</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
