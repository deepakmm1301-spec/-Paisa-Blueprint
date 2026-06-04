import React, { useState, useEffect } from "react";
import { Receipt, Landmark, ShieldCheck, Scale, Award, HelpCircle, FileText, Sparkles } from "lucide-react";
import { UserProfile } from "../types";

interface Props {
  profile?: UserProfile;
}

export default function TaxPlanner({ profile }: Props) {
  const [annualGross, setAnnualGross] = useState<number>(1200000); // 12 Lakhs typical standard
  const [section80C, setSection80C] = useState<number>(150000); // Max 1.5L
  const [section80Nps, setSection80Nps] = useState<number>(50000); // Max 50k
  const [section80D, setSection80D] = useState<number>(25000); // Health insurance, max 25k or 50k
  const [hraExempt, setHraExempt] = useState<number>(40000); // standard HRA claims
  const [homeloanInterest, setHomeloanInterest] = useState<number>(0); // Section 24b max 2L

  useEffect(() => {
    if (profile) {
      setAnnualGross(profile.salary * 12);
      
      // Calculate starting EPF Contribution roughly as 12% of basic base or EPF balance portion
      const epfContribution = Math.min(150000, Math.round(profile.salary * 12 * 0.12));
      const termPremium = Math.round((profile.termInsuranceCover || 5000000) * 0.002);
      const ppfContrib = profile.investments?.ppf || 0;
      setSection80C(Math.min(150000, epfContribution + termPremium + ppfContrib));

      // Synchronize NPS Extra allowance
      setSection80Nps(Math.min(50000, profile.investments?.nps || 0));

      // Health premium calculation (Roughly 3-4% of health cover, capped at reasonable 25k/50k)
      const healthPremium = Math.min(25000, Math.round((profile.healthInsuranceCover || 500000) * 0.03));
      setSection80D(healthPremium || 25000);

      // Home loan interest estimation (If they have high homeLoan outstanding)
      if (profile.loans?.homeLoan > 0) {
        setHomeloanInterest(Math.min(200000, Math.round(profile.loans.homeLoan * 0.08)));
      } else {
        setHomeloanInterest(0);
      }
    }
  }, [profile?.id, profile?.salary, profile?.healthInsuranceCover, profile?.termInsuranceCover]);

  const standardDeductionOld = 50000;
  const standardDeductionNew = 75000;

  // 1. OLD REGIME MATH
  // Deductions are allowed under Old Regime
  const totalDeductionsOld = 
    standardDeductionOld +
    Math.min(150000, section80C) +
    Math.min(50000, section80Nps) +
    Math.min(100000, section80D) +
    hraExempt +
    Math.min(200000, homeloanInterest);

  const taxableIncomeOld = Math.max(0, annualGross - totalDeductionsOld);

  // Old Regime Slabs (standard FY 23-24 rates for simplicity & robustness in Indian context)
  // Up to 2.5L: Nil
  // 2.5L - 5L: 5%
  // 5L - 10L: 20%
  // Above 10L: 30%
  let taxOld = 0;
  if (taxableIncomeOld > 1000000) {
    taxOld += (taxableIncomeOld - 1000000) * 0.30;
    taxOld += 100000; // Slab 5-10L: 500000 * 20% = 100000
    taxOld += 12500;  // Slab 2.5-5L: 250000 * 5% = 12500
  } else if (taxableIncomeOld > 500000) {
    taxOld += (taxableIncomeOld - 500000) * 0.20;
    taxOld += 12500;
  } else if (taxableIncomeOld > 250000) {
    taxOld += (taxableIncomeOld - 250000) * 0.05;
  }
  // Section 87A rebate for taxable income <= 5L (Old)
  if (taxableIncomeOld <= 500000) {
    taxOld = 0;
  }

  // 2. NEW REGIME MATH (Revised FY 24-25 Union Budget rates)
  // Standard deduction of 75,000 allowed, but no 80C/80D/HRA exemptions.
  const taxableIncomeNew = Math.max(0, annualGross - standardDeductionNew);

  // New Regime slabs:
  // Up to 3,000,000: Nil
  // 3L - 7L: 5%
  // 7L - 10L: 10%
  // 10L - 12L: 15%
  // 12L - 15L: 20%
  // Above 15L: 30%
  let taxNew = 0;
  if (taxableIncomeNew > 1500000) {
    taxNew += (taxableIncomeNew - 1500000) * 0.30;
    taxNew += 60000; // 12-15L: 300,000 * 20% = 60000
    taxNew += 30000; // 10-12L: 200,000 * 15% = 30000
    taxNew += 30000; // 7-10L: 300,000 * 10% = 30000
    taxNew += 20000; // 3-7L: 400,000 * 5% = 20000
  } else if (taxableIncomeNew > 1200000) {
    taxNew += (taxableIncomeNew - 1200000) * 0.20;
    taxNew += 30000; // 10-12L
    taxNew += 30000; // 7-10L
    taxNew += 20000; // 3-7L
  } else if (taxableIncomeNew > 1000000) {
    taxNew += (taxableIncomeNew - 1000000) * 0.15;
    taxNew += 30000; // 7-10L
    taxNew += 20000; // 3-7L
  } else if (taxableIncomeNew > 700000) {
    taxNew += (taxableIncomeNew - 700000) * 0.10;
    taxNew += 20000; // 3-7L
  } else if (taxableIncomeNew > 300000) {
    taxNew += (taxableIncomeNew - 300000) * 0.05;
  }

  // Section 87A rebate for taxable income <= 7L in New Regime (tax is fully rebated up to 7L!)
  // In budget, taxable income up to 7L gets FULL rebate under Section 87A (effective zero tax)
  if (taxableIncomeNew <= 700000) {
    taxNew = 0;
  }

  // Cess calculations (Education & Health Cess of 4% of tax)
  const cessOld = Math.round(taxOld * 0.04);
  const totalTaxOld = taxOld + cessOld;

  const cessNew = Math.round(taxNew * 0.04);
  const totalTaxNew = taxNew + cessNew;

  const standardTaxSavings = Math.abs(totalTaxOld - totalTaxNew);
  const betterRegime = totalTaxOld < totalTaxNew ? "Old Regime" : "New Regime";

  return (
    <div id="tax-planner-module" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs text-sm">
      <div className="border-b border-slate-100 pb-5 mb-6">
        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">FY 24-25 Budget</span>
        <h2 className="text-2xl font-bold text-slate-800 mt-2 font-display">Tax Optimizer: Old vs. New Regime</h2>
        <p className="text-slate-500 text-sm mt-1">
          Input your annual income and potential exemptions to optimize your Indian tax liability under both financial schemes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Controls/Inputs */}
        <div className="lg:col-span-5 bg-slate-50 border border-slate-100 p-5 rounded-2xl space-y-5">
          <h3 className="font-semibold text-slate-800 flex items-center justify-between border-b border-slate-200 pb-2">
            <span className="flex items-center gap-1.5">
              <Receipt className="w-4 h-4 text-emerald-500" /> Income & Deductions
            </span>
            {profile && (
              <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-500 animate-pulse" /> Linked ({profile.name})
              </span>
            )}
          </h3>

          <div>
            <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
              <span>Annual Gross CTC Salary</span>
              <span className="text-bhagwa-600 font-bold">₹{annualGross.toLocaleString("en-IN")}</span>
            </div>
            <input
              type="range"
              min="300000"
              max="5000000"
              step="50000"
              value={annualGross}
              onChange={(e) => setAnnualGross(Number(e.target.value))}
              className="w-full accent-bhagwa-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-0.5 font-mono">
              <span>3 Lakhs</span>
              <span>12 Lakhs</span>
              <span>50 Lakhs</span>
            </div>
          </div>

          <div id="oldregimedeductions" className="space-y-4 pt-2 border-t border-slate-200/60">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Old Regime Exemptions (Section-based)</span>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Sec 80C (EPF/PPF/ELSS)</label>
                <input
                  type="number"
                  max="150000"
                  value={section80C}
                  onChange={(e) => setSection80C(Math.min(150000, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">NPS extra Sec 80CCD</label>
                <input
                  type="number"
                  max="50000"
                  value={section80Nps}
                  onChange={(e) => setSection80Nps(Math.min(50000, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">HRA Exemption Claim</label>
                <input
                  type="number"
                  value={hraExempt}
                  onChange={(e) => setHraExempt(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Home Loan Interest 24b</label>
                <input
                  type="number"
                  value={homeloanInterest}
                  onChange={(e) => setHomeloanInterest(Math.min(200000, Math.max(0, Number(e.target.value))))}
                  className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Health Insurance Premium (Sec 80D)</label>
              <input
                type="number"
                value={section80D}
                onChange={(e) => setSection80D(Math.max(0, Number(e.target.value)))}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 font-semibold text-slate-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Right Output Sheet: Side-by-side comparison */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Old tax card */}
            <div className="p-5 border border-slate-100 rounded-2xl bg-slate-50/40 hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Old Tax Regime</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">Standard</span>
                </div>
                
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Income:</span>
                    <span className="font-semibold text-slate-800">₹{taxableIncomeOld.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Allowed Deductions:</span>
                    <span className="font-semibold text-emerald-600">-₹{totalDeductionsOld.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Base Income Tax:</span>
                    <span className="font-semibold text-slate-800">₹{taxOld.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Health & Edu Cess (4%):</span>
                    <span className="font-semibold text-slate-800">₹{cessOld.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200/50">
                <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Est. Annual Tax</span>
                <span className="text-2xl font-extrabold text-slate-800 font-mono">₹{totalTaxOld.toLocaleString("en-IN")}</span>
              </div>
            </div>

            {/* New tax card */}
            <div className="p-5 border border-bhagwa-100 rounded-2xl bg-bhagwa-50/10 hover:bg-bhagwa-50/20 transition-colors flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-bhagwa-800 uppercase tracking-wide">New Tax Regime</span>
                  <span className="text-[10px] bg-bhagwa-100 text-bhagwa-700 px-2 py-0.5 rounded-full font-extrabold">Recommended</span>
                </div>

                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Income:</span>
                    <span className="font-semibold text-bhagwa-950">₹{taxableIncomeNew.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Allowed Deductions:</span>
                    <span className="font-semibold text-emerald-600">-₹{standardDeductionNew.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Base Income Tax:</span>
                    <span className="font-semibold text-bhagwa-950">₹{taxNew.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Health & Edu Cess (4%):</span>
                    <span className="font-semibold text-bhagwa-950">₹{cessNew.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-bhagwa-100">
                <span className="text-[10px] uppercase font-semibold text-bhagwa-500 block">Total Est. Annual Tax</span>
                <span className="text-2xl font-extrabold text-bhagwa-700 font-mono">₹{totalTaxNew.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Comparison summary card */}
          <div className="p-5 bg-gradient-to-r from-emerald-50 to-bhagwa-50/30 border border-emerald-100/60 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Scale className="w-5 h-5 text-emerald-600" /> Optimize Complete
              </div>
              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed max-w-sm">
                Choosing <strong>{betterRegime}</strong> will save you approximately <strong>₹{standardTaxSavings.toLocaleString("en-IN")}</strong> in unnecessary annual tax charges! Check your investments strategy.
              </p>
            </div>
            {standardTaxSavings > 0 ? (
              <div className="text-right">
                <span className="text-[10px] uppercase font-extrabold text-emerald-600 block">Your Annual Tax Saving</span>
                <span className="text-2xl font-extrabold text-emerald-600 font-mono">₹{standardTaxSavings.toLocaleString("en-IN")}</span>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 block">Identical liabilities</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
