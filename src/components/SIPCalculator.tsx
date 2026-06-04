import React, { useState } from "react";
import { TrendingUp, Award, HelpCircle, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";

export default function SIPCalculator() {
  const [monthlySip, setMonthlySip] = useState<number>(10000);
  const [annualStepUp, setAnnualStepUp] = useState<number>(10); // Standard recommended 10% annual increase
  const [expectedReturn, setExpectedReturn] = useState<number>(12); // Standard equity mutual fund returns
  const [years, setYears] = useState<number>(15);
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% average Indian inflation

  // Step-up SIP Calculation
  // Year-by-year modeling
  let totalInvested = 0;
  let totalValue = 0;
  let currentMonthlySip = monthlySip;

  const yearRecords = [];

  for (let year = 1; year <= years; year++) {
    let yearInvested = 0;
    let yearSipStartValue = totalValue;

    // Inside the year, calculate compound returns monthly
    // SIP paid at start of each month
    const monthlyReturnRate = (expectedReturn / 100) / 12;
    for (let month = 1; month <= 12; month++) {
      yearInvested += currentMonthlySip;
      totalValue = (totalValue + currentMonthlySip) * (1 + monthlyReturnRate);
    }

    totalInvested += yearInvested;
    const wealthEarned = Math.max(0, Math.round(totalValue - totalInvested));

    yearRecords.push({
      year,
      monthlySip: currentMonthlySip,
      investedAccumulated: totalInvested,
      futureValueAccumulated: Math.round(totalValue),
      wealthEarned: wealthEarned,
      inflationAdjustedValue: Math.round(totalValue / Math.pow(1 + inflationRate / 100, year)),
    });

    // Apply step-up for the next year
    currentMonthlySip = Math.round(currentMonthlySip * (1 + annualStepUp / 100));
  }

  const finalRecords = yearRecords[yearRecords.length - 1] || {
    investedAccumulated: 0,
    futureValueAccumulated: 0,
    wealthEarned: 0,
    inflationAdjustedValue: 0,
  };

  const investedAmount = finalRecords.investedAccumulated;
  const wealthCreated = finalRecords.wealthEarned;
  const futureValue = finalRecords.futureValueAccumulated;
  const inflationAdjusted = finalRecords.inflationAdjustedValue;

  return (
    <div id="sip-calculator-module" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Step-Up SIP</span>
        <h2 className="text-2xl font-bold text-slate-800 mt-2 font-display">Systematic Investment Plan (SIP) Calculator</h2>
        <p className="text-slate-500 text-sm mt-1">
          Estimate wealth growth from automated monthly mutual fund investments with an annual salary step-up option.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-6 text-sm">
          <h3 className="font-semibold text-slate-800 flex items-center gap-1.5 border-b border-slate-200/60 pb-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" /> Inputs
          </h3>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Initial Monthly Investment</span>
              <span className="text-emerald-600 font-bold">₹{monthlySip.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="200000"
              step="500"
              value={monthlySip}
              onChange={(e) => setMonthlySip(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>₹1,000</span>
              <span>₹50,000</span>
              <span>₹2,00,000</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Annual SIP Step-Up % (Increase each year)</span>
              <span className="text-emerald-600 font-bold">{annualStepUp}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="30"
              step="1"
              value={annualStepUp}
              onChange={(e) => setAnnualStepUp(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>0% (Constant SIP)</span>
              <span>10% (Std)</span>
              <span>30%</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Expected Annual Compounded Return (CAGR %)</span>
              <span className="text-emerald-600 font-bold">{expectedReturn}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="0.5"
              value={expectedReturn}
              onChange={(e) => setExpectedReturn(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
              <span>5% (Conservative)</span>
              <span>12%-15% (Equity Std)</span>
              <span>25%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Years)</label>
              <input
                type="number"
                min="1"
                max="40"
                value={years}
                onChange={(e) => setYears(Math.min(40, Math.max(1, Number(e.target.value))))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Inflation Rate (%)</label>
              <input
                type="number"
                min="0"
                max="15"
                value={inflationRate}
                onChange={(e) => setInflationRate(Math.min(15, Math.max(0, Number(e.target.value))))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-3 flex gap-2 text-emerald-800 text-xs">
            <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <strong className="block">Why Step-Up?</strong>
              <p className="text-[11px] text-emerald-700/90 mt-0.5">
                Stepping up your SIP by 10% every year aligns investments with annual salary appraisals, generating significantly higher wealth than a flat SIP!
              </p>
            </div>
          </div>
        </div>

        {/* Outputs & Breakdown */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          {/* Key outputs row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Invested</span>
              <span className="block text-lg font-bold text-slate-800 mt-1 font-mono">₹{investedAmount.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-slate-400">Total out-of-pocket savings</span>
            </div>

            <div className="p-4 bg-emerald-50/40 border border-emerald-100/50 rounded-xl">
              <span className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Wealth Created</span>
              <span className="block text-lg font-bold text-emerald-600 mt-1 font-mono">+₹{wealthCreated.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-emerald-500 font-semibold">Net capital expansion</span>
            </div>

            <div className="p-4 bg-bhagwa-50/40 border border-bhagwa-100/50 rounded-xl">
              <span className="text-xs text-bhagwa-600 uppercase font-bold tracking-wider font-display">Est. Future Value</span>
              <span className="block text-xl font-extrabold text-bhagwa-700 mt-1 font-mono">₹{futureValue.toLocaleString("en-IN")}</span>
              <span className="text-[10px] text-bhagwa-500/80 font-bold block">
                ≒ ₹{inflationAdjusted.toLocaleString("en-IN")} (Real Value)
              </span>
            </div>
          </div>

          {/* Visual Progress Bar Ratio */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-semibold">
              <span>Invested Capital Ratio</span>
              <span>Compounded Interest Ratio</span>
            </div>
            <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div 
                className="bg-slate-400 h-full text-[10px] font-bold text-white flex items-center justify-center transition-all duration-700" 
                style={{ width: `${Math.round((investedAmount / (futureValue || 1)) * 100)}%` }}
              >
                {Math.round((investedAmount / (futureValue || 1)) * 100)}%
              </div>
              <div 
                className="bg-emerald-500 h-full text-[10px] font-bold text-white flex items-center justify-center transition-all duration-700"
                style={{ width: `${Math.round((wealthCreated / (futureValue || 1)) * 100)}%` }}
              >
                {Math.round((wealthCreated / (futureValue || 1)) * 100)}%
              </div>
            </div>
          </div>

          {/* Annual growth table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">Year-on-Year Portfolio Compounding Growth</h4>
            <div className="max-h-56 overflow-y-auto border border-slate-100 rounded-xl">
              <table className="w-full text-xs text-left text-slate-500 divide-y divide-slate-100">
                <thead className="bg-slate-50 text-[10px] uppercase font-bold text-slate-600 sticky top-0">
                  <tr>
                    <th className="px-4 py-2">Year</th>
                    <th className="px-4 py-2">Monthly SIP</th>
                    <th className="px-4 py-2">Invested</th>
                    <th className="px-4 py-2 text-right">Maturity Value</th>
                    <th className="px-4 py-2 text-right">Adjusted (6% Infl)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {yearRecords.map((rec) => (
                    <tr key={rec.year} className="hover:bg-slate-50/50">
                      <td className="px-4 py-2.5 font-bold text-slate-700">Yr {rec.year}</td>
                      <td className="px-4 py-2.5 font-mono">₹{rec.monthlySip.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 font-mono text-slate-500">₹{rec.investedAccumulated.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 font-mono text-right font-semibold text-bhagwa-600">₹{rec.futureValueAccumulated.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-2.5 font-mono text-right text-slate-400">₹{rec.inflationAdjustedValue.toLocaleString("en-IN")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
