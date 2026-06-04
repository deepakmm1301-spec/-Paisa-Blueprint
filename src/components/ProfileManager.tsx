import React, { useState } from "react";
import { UserProfile, LoanDetails, InvestmentDetails } from "../types";
import { 
  UserPlus, 
  Users, 
  Lock, 
  Unlock, 
  Trash2, 
  Copy, 
  Plus, 
  Key, 
  Check, 
  ShieldAlert, 
  Award, 
  HelpCircle,
  Eye,
  EyeOff,
  Briefcase,
  TrendingUp,
  MapPin,
  Heart,
  Landmark
} from "lucide-react";

interface ProfileManagerProps {
  currentProfile: UserProfile;
  profiles: UserProfile[];
  onSelectProfile: (id: string) => void;
  onCreateProfile: (profile: UserProfile) => void;
  onDeleteProfile: (id: string) => void;
  onDuplicateProfile: (id: string) => void;
}

export default function ProfileManager({
  currentProfile,
  profiles,
  onSelectProfile,
  onCreateProfile,
  onDeleteProfile,
  onDuplicateProfile,
}: ProfileManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New profile state inputs
  const [name, setName] = useState("");
  const [age, setAge] = useState<number>(30);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [salary, setSalary] = useState<number>(80000);
  const [city, setCity] = useState<"tier1" | "tier2" | "tier3">("tier2");
  const [maritalStatus, setMaritalStatus] = useState<"single" | "married" | "dependents">("single");
  const [dependentsCount, setDependentsCount] = useState<number>(0);
  const [currentSavings, setCurrentSavings] = useState<number>(100000);
  const [mutualFunds, setMutualFunds] = useState<number>(200000);
  const [stocks, setStocks] = useState<number>(50000);
  const [gold, setGold] = useState<number>(50000);
  const [epf, setEpf] = useState<number>(100000);
  
  // Insurance Options
  const [healthInsuranceCover, setHealthInsuranceCover] = useState<number>(500000);
  const [termInsuranceCover, setTermInsuranceCover] = useState<number>(5000000);
  
  // PIN security options
  const [usePin, setUsePin] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [showPin, setShowPin] = useState(false);

  // Authentication/PIN unlocking state
  const [lockScreenProfile, setLockScreenProfile] = useState<UserProfile | null>(null);
  const [unlockPinAttempt, setUnlockPinAttempt] = useState("");
  const [unlockError, setUnlockError] = useState(false);

  // Form error validation
  const [formError, setFormError] = useState("");

  // Family aggregate statistics
  const aggregateAssets = profiles.reduce((acc, p) => {
    const pInv = p.investments;
    const invTotal = 
      (pInv?.mutualFunds || 0) + 
      (pInv?.stocks || 0) + 
      (pInv?.gold || 0) + 
      (pInv?.epf || 0) + 
      (pInv?.ppf || 0) + 
      (pInv?.nps || 0) + 
      (pInv?.realEstate || 0);
    return acc + invTotal + (p.currentSavings || 0);
  }, 0);

  const aggregateLiabilities = profiles.reduce((acc, p) => {
    const pLoan = p.loans;
    const loanTotal = 
      (pLoan?.homeLoan || 0) + 
      (pLoan?.personalLoan || 0) + 
      (pLoan?.carLoan || 0) + 
      (pLoan?.otherLoan || 0);
    return acc + loanTotal;
  }, 0);

  const consolidatedNetWorth = aggregateAssets - aggregateLiabilities;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Full Name is mandatory to registry a file.");
      return;
    }

    if (usePin && pinValue.length !== 4) {
      setFormError("Security PIN must be exactly 4 digits long.");
      return;
    }

    const newLoans: LoanDetails = {
      homeLoan: 0,
      personalLoan: 0,
      carLoan: 0,
      otherLoan: 0,
    };

    const newInvestments: InvestmentDetails = {
      mutualFunds: mutualFunds || 0,
      stocks: stocks || 0,
      gold: gold || 0,
      epf: epf || 0,
      ppf: 0,
      nps: 0,
      realEstate: 0,
    };

    const completeProfile: UserProfile = {
      id: "profile-" + Date.now(),
      name: name.trim(),
      age: Number(age) || 30,
      retirementAge: Number(retirementAge) || 60,
      salary: Number(salary) || 0,
      city,
      maritalStatus,
      dependentsCount: Number(dependentsCount) || 0,
      currentSavings: Number(currentSavings) || 0,
      loans: newLoans,
      investments: newInvestments,
      monthlyExpenses: Math.round((Number(salary) || 0) * 0.4),
      pin: usePin ? pinValue : undefined,
      healthInsuranceCover: Number(healthInsuranceCover) || 0,
      termInsuranceCover: Number(termInsuranceCover) || 0,
    };

    onCreateProfile(completeProfile);
    
    // Reset states
    setName("");
    setAge(30);
    setRetirementAge(60);
    setSalary(80000);
    setCity("tier2");
    setMaritalStatus("single");
    setDependentsCount(0);
    setCurrentSavings(100000);
    setMutualFunds(200000);
    setStocks(50000);
    setGold(50000);
    setEpf(100000);
    setHealthInsuranceCover(500000);
    setTermInsuranceCover(5000000);
    setUsePin(false);
    setPinValue("");
    setShowAddForm(false);
  };

  const handleProfileClick = (p: UserProfile) => {
    if (p.id === currentProfile.id) return;
    
    if (p.pin) {
      // Prompt for PIN unlock screen
      setLockScreenProfile(p);
      setUnlockPinAttempt("");
      setUnlockError(false);
    } else {
      onSelectProfile(p.id!);
    }
  };

  const handleUnlockPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lockScreenProfile) return;

    if (unlockPinAttempt === lockScreenProfile.pin) {
      onSelectProfile(lockScreenProfile.id!);
      setLockScreenProfile(null);
      setUnlockPinAttempt("");
      setUnlockError(false);
    } else {
      setUnlockError(true);
      setUnlockPinAttempt("");
    }
  };

  return (
    <div id="profile-manager-ledger" className="bg-white rounded-2xl border border-slate-100 p-6 md:p-8 shadow-xs space-y-8">
      
      {/* Intro Banner */}
      <div className="border-b border-slate-100 pb-5">
        <span className="text-xs font-semibold uppercase tracking-wider text-bhagwa-600 bg-bhagwa-50 px-2.5 py-1 rounded-full">
          Family Office Ledger
        </span>
        <h2 className="text-2xl font-bold text-slate-800 mt-2 font-display">Profiles & Accounts Manager</h2>
        <p className="text-slate-500 text-sm mt-1">
          Create separate profiles for your spouse, parents, or side portfolios. Lock profiles with PIN passcodes, and model multiple future scenarios.
        </p>
      </div>

      {/* Aggregate Family Dashboard Panel */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 p-6 rounded-2xl text-white relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Users className="w-48 h-48 -mr-10 -mb-10 text-white" />
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Family Active Profiles</span>
            <span className="block text-4xl font-extrabold mt-1 font-mono text-bhagwa-400">{profiles.length}</span>
            <span className="text-xs text-slate-300 block mt-1">Unique financial planners registered</span>
          </div>
          
          <div className="md:border-l md:border-slate-800 md:pl-6 space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Consolidated Ledger Wealth</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 block">
              ₹{consolidatedNetWorth.toLocaleString("en-IN")}
            </span>
            <div className="flex gap-4 text-[10px] text-slate-300">
              <span>Assets: <strong className="text-gray-100 font-mono">₹{aggregateAssets.toLocaleString("en-IN")}</strong></span>
              <span>Debt: <strong className="text-red-400 font-mono">₹{aggregateLiabilities.toLocaleString("en-IN")}</strong></span>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white px-5 py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-bhagwa-600/20 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" /> Register New Account
            </button>
          </div>
        </div>
      </div>

      {/* PIN Lock Auth Screen Overlay */}
      {lockScreenProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 transition-all">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-2xl relative">
            <div className="text-center py-4">
              <div className="mx-auto w-12 h-12 bg-bhagwa-50 border border-bhagwa-100 rounded-full flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-bhagwa-600" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Enter Profile PIN</h3>
              <p className="text-xs text-slate-500 mt-1">
                The account portfolio of <strong className="text-slate-800">{lockScreenProfile.name}</strong> is pinlocked.
              </p>
            </div>

            <form onSubmit={handleUnlockPinSubmit} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  autoFocus
                  placeholder="• • • •"
                  value={unlockPinAttempt}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setUnlockPinAttempt(val);
                    if (unlockError) setUnlockError(false);
                  }}
                  className="w-full tracking-widest text-center text-2xl font-mono font-black py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-bhagwa-500"
                />
                {unlockError && (
                  <p className="text-11px text-rose-500 text-center font-semibold mt-2 flex items-center justify-center gap-1">
                    <ShieldAlert className="w-4 h-4" /> PIN mismatch. Try again.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLockScreenProfile(null);
                    setUnlockPinAttempt("");
                    setUnlockError(false);
                  }}
                  className="w-full py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={unlockPinAttempt.length !== 4}
                  className="w-full py-2.5 bg-bhagwa-600 hover:bg-bhagwa-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Access File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register New Profile Form Card */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl space-y-6 text-sm">
          <div className="border-b border-slate-200/80 pb-3">
            <h3 className="font-bold text-slate-800 text-md flex items-center gap-1.5 font-display">
              <UserPlus className="w-4.5 h-4.5 text-bhagwa-600" /> New Portfolio Registration
            </h3>
            <p className="text-[11px] text-slate-400">Initialize a custom base parameters file</p>
          </div>

          {formError && (
            <div className="p-3.5 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Core General info */}
            <div className="space-y-4 bg-white p-4.5 rounded-xl border border-slate-200/50">
              <h4 className="font-semibold text-slate-700 text-xs border-b pb-1.5 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-bhagwa-500" /> Primary Attributes
              </h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanjali Sharma"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-bhagwa-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Current Age</label>
                    <input
                      type="number"
                      min={18}
                      max={85}
                      value={age}
                      onChange={(e) => setAge(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Retirement Target</label>
                    <input
                      type="number"
                      min={40}
                      max={90}
                      value={retirementAge}
                      onChange={(e) => setRetirementAge(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Monthly Gross Package (₹)</label>
                  <input
                    type="number"
                    min={0}
                    step={5000}
                    value={salary}
                    onChange={(e) => setSalary(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* Demographic Parameters */}
            <div className="space-y-4 bg-white p-4.5 rounded-xl border border-slate-200/50">
              <h4 className="font-semibold text-slate-700 text-xs border-b pb-1.5 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-500" /> Geography & Family
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Location Class</label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="tier1">Tier-1 Metro (Delhi, Mumbai, Bengaluru)</option>
                    <option value="tier2">Tier-2 Town (Patna, Jaipur, Lucknow)</option>
                    <option value="tier3">Tier-3 Rural / Semi-Urban</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Marital Status</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-lg px-2.5 py-2 text-xs bg-white focus:outline-none"
                  >
                    <option value="single">Single (No dependents)</option>
                    <option value="married">Married (Dual income option)</option>
                    <option value="dependents">Married with Family Dependents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Dependents Count</label>
                  <input
                    type="number"
                    min={0}
                    max={10}
                    value={dependentsCount}
                    onChange={(e) => setDependentsCount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1"
                  />
                </div>
              </div>
            </div>

            {/* Asset Seed Capital */}
            <div className="space-y-4 bg-white p-4.5 rounded-xl border border-slate-200/50">
              <h4 className="font-semibold text-slate-700 text-xs border-b pb-1.5 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-500" /> Starting Seed Assets
              </h4>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Emergency Savings (₹)</label>
                    <input
                      type="number"
                      step={10000}
                      value={currentSavings}
                      onChange={(e) => setCurrentSavings(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Mutual Funds (₹)</label>
                    <input
                      type="number"
                      step={10000}
                      value={mutualFunds}
                      onChange={(e) => setMutualFunds(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Direct Stocks (₹)</label>
                    <input
                      type="number"
                      step={10000}
                      value={stocks}
                      onChange={(e) => setStocks(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">PPF / Gold (₹)</label>
                    <input
                      type="number"
                      step={5000}
                      value={gold}
                      onChange={(e) => setGold(Number(e.target.value))}
                      className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">EPF Provident Fund (₹)</label>
                  <input
                    type="number"
                    step={10000}
                    value={epf}
                    onChange={(e) => setEpf(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1 text-xs font-mono focus:ring-1"
                  />
                </div>

                <div className="border-t border-slate-100 pt-2.5 mt-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Coverage Policies</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-500 mb-0.5">Health Cover (₹)</label>
                      <input
                        type="number"
                        step={50000}
                        value={healthInsuranceCover}
                        onChange={(e) => setHealthInsuranceCover(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-semibold text-slate-500 mb-0.5">Term Life Cover (₹)</label>
                      <input
                        type="number"
                        step={500000}
                        value={termInsuranceCover}
                        onChange={(e) => setTermInsuranceCover(Number(e.target.value))}
                        className="w-full border border-slate-200 rounded-lg px-2 py-1 text-xs font-mono focus:ring-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Security PIN code toggle */}
          <div className="bg-white border border-slate-200/60 p-4.5 rounded-xl space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-800 text-xs block">Account Security Code (Passcode lock)</span>
                <span className="text-[11px] text-slate-400 block">Require a 4-digit PIN before anyone can unlock and read this family member's ledger.</span>
              </div>
              <input
                type="checkbox"
                checked={usePin}
                onChange={(e) => {
                  setUsePin(e.target.checked);
                  if(!e.target.checked) setPinValue("");
                }}
                className="w-4 h-4 accent-bhagwa-600 rounded cursor-pointer"
              />
            </div>

            {usePin && (
              <div className="max-w-xs flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <Key className="w-4 h-4 text-bhagwa-500" />
                <div className="flex-1 relative">
                  <input
                    type={showPin ? "text" : "password"}
                    maxLength={4}
                    placeholder="Enter 4-digit numeric code"
                    value={pinValue}
                    onChange={(e) => setPinValue(e.target.value.replace(/\D/g, ""))}
                    className="w-full bg-transparent border-none text-xs font-mono tracking-widest focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="p-1 hover:text-slate-700 text-slate-400"
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-500 font-semibold rounded-lg text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-bold rounded-lg text-xs cursor-pointer shadow-sm"
            >
              Construct Portfolio File
            </button>
          </div>
        </form>
      )}

      {/* Grid of Existing Family Portfolios */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800 text-md font-display flex items-center gap-2">
          <Users className="w-5 h-5 text-bhagwa-600" /> Active Directories ({profiles.length})
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profiles.map((p) => {
            const isSelected = p.id === currentProfile.id;
            
            // Calc single user asset summary
            const pInv = p.investments;
            const singleAssetsTotal = 
              (pInv?.mutualFunds || 0) + 
              (pInv?.stocks || 0) + 
              (pInv?.gold || 0) + 
              (pInv?.epf || 0) + 
              (pInv?.ppf || 0) + 
              (pInv?.nps || 0) + 
              (pInv?.realEstate || 0) + 
              (p.currentSavings || 0);

            const pLoan = p.loans;
            const singleLiabilitiesTotal = 
              (pLoan?.homeLoan || 0) + 
              (pLoan?.personalLoan || 0) + 
              (pLoan?.carLoan || 0) + 
              (pLoan?.otherLoan || 0);

            const singleNetWorth = singleAssetsTotal - singleLiabilitiesTotal;

            return (
              <div
                key={p.id}
                onClick={() => handleProfileClick(p)}
                className={`border rounded-2xl p-5 relative transition-all group flex flex-col justify-between h-48 cursor-pointer ${
                  isSelected 
                    ? "border-bhagwa-500 bg-bhagwa-50/50 shadow-xs ring-1 ring-bhagwa-500" 
                    : "border-slate-150 hover:border-slate-300 hover:shadow-xs bg-white"
                }`}
              >
                {/* Header card state */}
                <div>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-800 text-sm tracking-tight group-hover:text-bhagwa-700 transition-colors">
                          {p.name}
                        </span>
                        {p.pin && (
                          <span className="p-0.5 bg-slate-100 border border-slate-200 rounded text-slate-400">
                            <Lock className="w-3 h-3 text-slate-500" />
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        {p.city === "tier1" ? "Metro (Tier-1)" : p.city === "tier2" ? "Town (Tier-2)" : "Rural (Tier-3)"} • Age {p.age}
                      </span>
                    </div>

                    {/* Status badge */}
                    {isSelected ? (
                      <span className="text-[9px] uppercase font-bold bg-bhagwa-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" /> ACTIVE
                      </span>
                    ) : (
                      <span className="text-[9px] uppercase font-semibold text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full bg-slate-50">
                        OFFLINE
                      </span>
                    )}
                  </div>

                  {/* Wealth Stats inside the card */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Gross Monthly</span>
                      <strong className="text-slate-700 font-mono">₹{p.salary.toLocaleString("en-IN")}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Invested Pool</span>
                      <strong className="text-slate-700 font-mono">₹{singleAssetsTotal.toLocaleString("en-IN")}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer buttons / actions inside the card */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div>
                    <span className="text-[10px] text-slate-400 block leading-tight">Calculated Net Worth</span>
                    <strong className="text-xs font-bold font-mono text-emerald-600 block">₹{singleNetWorth.toLocaleString("en-IN")}</strong>
                  </div>

                  <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      title="Duplicate base directory scenarios"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateProfile(p.id!);
                      }}
                      className="p-1 px-1.5 border border-slate-200 hover:border-bhagwa-200 hover:bg-slate-50 rounded text-slate-500 hover:text-bhagwa-600 transition-colors pointer-events-auto cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    {profiles.length > 1 && (
                      <button
                        type="button"
                        title="Delete Profile File"
                        onClick={(e) => {
                          e.stopPropagation();
                          if(confirm(`Are you absolutely sure you want to delete the file of "${p.name}"? This action is irreversible.`)) {
                            onDeleteProfile(p.id!);
                          }
                        }}
                        className="p-1 px-1.5 border border-slate-200 hover:border-rose-300 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors pointer-events-auto cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
