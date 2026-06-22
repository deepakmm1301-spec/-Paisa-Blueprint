import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Sparkles, LogIn, UserPlus, ArrowRight, Eye, EyeOff, ChevronLeft, Phone } from "lucide-react";
// @ts-ignore
import paisaLogo from "../assets/images/deep_paisa_logo_1780484307855.png";

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }, profilesList: any[], activeProfileId: string) => void;
  defaultProfile: any;
}

export default function AuthScreen({ onLoginSuccess, defaultProfile }: AuthScreenProps) {
  // Main Tab State: "signin" | "signup"
  const [activeTab, setActiveTab] = useState<"signin" | "signup">("signin");
  
  // Auth Method within files: "email" | "phone"
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone"); // default to phone as requested
  
  // Fields & Inputs
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Clear states when toggling tabs
  const handleTabChange = (tab: "signin" | "signup") => {
    setActiveTab(tab);
    setError("");
    setSuccessMsg("");
    setPassword("");
    setConfirmPassword("");
  };

  // Perform secure sign-up
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("Please key in your full name for the master portfolio profile.");
      return;
    }

    const valueStr = authMethod === "email" ? email.trim() : phone.trim();
    if (!valueStr) {
      setError(authMethod === "email" ? "Please enter your email address." : "Please enter your phone number.");
      return;
    }

    if (authMethod === "email") {
      if (!valueStr.includes("@") || valueStr.length < 5) {
        setError("Please present a valid standard Email format.");
        return;
      }
    } else {
      const digitsOnly = valueStr.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (!password) {
      setError(authMethod === "phone" ? "Please define your secure 4-digit passcode." : "Please define a secure password.");
      return;
    }

    if (authMethod === "phone") {
      if (!/^\d{4}$/.test(password)) {
        setError("Your passcode must be exactly 4 digits (0-9).");
        return;
      }
    } else {
      if (password.length < 5) {
        setError("For safety, your password must contain at least 5 characters.");
        return;
      }
    }

    if (password !== confirmPassword) {
      setError(authMethod === "phone" ? "Passcodes entered do not match. Check spelling." : "Passwords entered do not match. Check spelling.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: authMethod === "email" ? valueStr : "",
          phone: authMethod === "phone" ? valueStr : "",
          name: name.trim(),
          password,
          defaultProfile
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registry error setting up files.");
      }

      setSuccessMsg("Locker file registered and seeded successfully! Logging in...");
      setTimeout(() => {
        onLoginSuccess(
          { name: data.user.name, email: data.user.email },
          data.user.profilesList || [{ ...defaultProfile, id: "profile-main" }],
          data.user.activeProfileId || "profile-main"
        );
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to create your database locker.");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform secure sign-in
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const valueStr = authMethod === "email" ? email.trim() : phone.trim();
    if (!valueStr) {
      setError(authMethod === "email" ? "Please enter your email address." : "Please enter your phone number.");
      return;
    }

    if (authMethod === "email") {
      if (!valueStr.includes("@") || valueStr.length < 5) {
        setError("Please present a valid standard Email format.");
        return;
      }
    } else {
      const digitsOnly = valueStr.replace(/\D/g, "");
      if (digitsOnly.length < 10) {
        setError("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    if (!password) {
      setError(authMethod === "phone" ? "Please type in your 4-digit passcode." : "Please type in your password.");
      return;
    }

    if (authMethod === "phone" && !/^\d{4}$/.test(password)) {
      setError("Please enter a valid 4-digit numeric passcode.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: valueStr, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (authMethod === "phone" ? "Locker matched incorrectly or does not exist." : "Password matched incorrectly or locker does not exist."));
      }

      setSuccessMsg("Locker file authenticated! Launching financial engine...");
      setTimeout(() => {
        onLoginSuccess(
          { name: data.name, email: data.email },
          data.profilesList || [{ ...defaultProfile, id: "profile-main" }],
          data.activeProfileId || "profile-main"
        );
      }, 500);
    } catch (err: any) {
      setError(err.message || "Connection failure with centralized Paisa network.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPromoCreds = () => {
    setError("");
    setSuccessMsg("");
    setActiveTab("signin");
    setAuthMethod("email");
    setEmail("advisor@paisa.in");
    setPassword("paisa");
  };

  const handleContinueAsGuest = () => {
    onLoginSuccess(
      { name: "Anchal Priya", email: "paisa.mm1301@gmail.com" },
      [{ ...defaultProfile, id: "profile-main" }],
      "profile-main"
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 animate-fade-in text-slate-100">
      
      {/* Background Ambience styling */}
      <div className="absolute inset-0 max-w-full h-full overflow-hidden pointer-events-none z-0 opacity-40">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-bhagwa-900/30 rounded-full blur-[120px] transition-all"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-[160px] transition-all"></div>
      </div>

      <div id="auth-ledger-frame" className="relative z-10 w-full max-w-4xl bg-slate-900/40 border border-slate-800 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        
        {/* Left Aspect: Brand promotional pitch card */}
        <div className="md:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 p-8 md:p-10 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-xl shadow-md bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
                <img 
                  src={paisaLogo} 
                  alt="Paisa Blueprint Logo" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-md font-extrabold text-white tracking-widest font-display uppercase leading-tight">
                  PAISA BLUEPRINT
                </h1>
                <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-extrabold flex items-center gap-1">
                  Salaried Adviser 🇮🇳
                </span>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <h2 className="text-xl font-bold text-slate-100 leading-tight">
                Instantly compute and calibrate salary compounding.
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Seamless multi-profile family accounts, New vs Old tax comparisons, SIP compounders, and smart allowances with robust cloud syncing.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-850 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-bhagwa-500 shrink-0" />
              <span>Secure central database file locker</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Real-time cross-device synchronization</span>
            </div>
          </div>

        </div>

        {/* Right Aspect: Authentication Interactive Dynamic Panel */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-slate-900/20">
          
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
            <div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Unlock Portfolio Locker
              </h2>
              <p className="text-slate-400 text-xs mt-1">
                Access your sandbox budgets, profiles and financial advisors
              </p>
            </div>
          </div>

          {/* Messages info box */}
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/80 text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-2">
              <Lock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/80 text-emerald-300 text-xs font-semibold rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form wrapper */}
          <form onSubmit={activeTab === "signin" ? handleSignInSubmit : handleSignUpSubmit} className="space-y-4">
            
            {/* Choose Registration Method: Phone vs Email */}
            <div className="bg-slate-950/40 p-1 rounded-xl border border-slate-850 flex">
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("phone");
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === "phone"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Phone className="w-3.5 h-3.5 text-emerald-400" /> Phone & 4-Digit PIN
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMethod("email");
                  setError("");
                }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  authMethod === "email"
                    ? "bg-slate-800 text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-blue-400" /> Email & Password
              </button>
            </div>

            {/* Dynamic Name Input (Sign Up ONLY) */}
            {activeTab === "signup" && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Anchal Priya"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Credentials Input */}
            {authMethod === "phone" ? (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. scenario@paisa.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                  />
                </div>
              </div>
            )}

            {/* Passcode / Password Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {authMethod === "phone" ? "4-Digit Passcode PIN" : "Lock Password"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={authMethod === "phone" ? 4 : undefined}
                  pattern={authMethod === "phone" ? "\\d{4}" : undefined}
                  inputMode={authMethod === "phone" ? "numeric" : undefined}
                  placeholder={
                    authMethod === "phone"
                      ? "Enter 4-digit passcode PIN"
                      : activeTab === "signup"
                      ? "Define password (min 5 symbols)"
                      : "Enter lock password"
                  }
                  value={password}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (authMethod === "phone") {
                      const cleaned = val.replace(/\D/g, "");
                      setPassword(cleaned);
                    } else {
                      setPassword(val);
                    }
                  }}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm font-mono tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 pointer-events-auto p-1"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Passcode PIN input (Sign Up ONLY) */}
            {activeTab === "signup" && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {authMethod === "phone" ? "Confirm 4-Digit Passcode PIN" : "Confirm Password"}
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    maxLength={authMethod === "phone" ? 4 : undefined}
                    pattern={authMethod === "phone" ? "\\d{4}" : undefined}
                    inputMode={authMethod === "phone" ? "numeric" : undefined}
                    placeholder={
                      authMethod === "phone"
                        ? "Verify 4-digit passcode PIN"
                        : "Verify your password choice"
                    }
                    value={confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (authMethod === "phone") {
                        const cleaned = val.replace(/\D/g, "");
                        setConfirmPassword(cleaned);
                      } else {
                        setConfirmPassword(val);
                      }
                    }}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm font-mono tracking-widest"
                  />
                </div>
              </div>
            )}

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.99] cursor-pointer mt-4 ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                  Processing security handshake...
                </span>
              ) : activeTab === "signin" ? (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Unlock Secure Locker <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <UserPlus className="w-4.5 h-4.5" /> Register & Launch Private Locker
                </>
              )}
            </button>



            <div className="flex items-center py-2">
              <hr className="flex-1 border-slate-800" />
              <span className="px-3 text-[9px] text-slate-550 uppercase tracking-widest font-black">OR</span>
              <hr className="flex-1 border-slate-800" />
            </div>

            <button
              type="button"
              onClick={handleContinueAsGuest}
              className="w-full bg-slate-800/65 hover:bg-slate-750 border border-slate-800 hover:border-slate-700 text-slate-300 font-extrabold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-[0.99] cursor-pointer"
            >
              Continue Offline (Guest Locker)
            </button>
          </form>

          {/* Quick-seed demo credentials option for reviewer */}
          {activeTab === "signin" && (
            <div className="border-t border-slate-800/80 pt-4">
              <div className="bg-slate-950/40 border border-slate-800/60 p-3 rounded-xl text-center space-y-1">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Quick Trial Account (Direct Preloaded Data)
                </span>
                <p className="text-[11px] text-slate-500">
                  Pre-compiled profile folder: <code className="text-emerald-400 font-mono font-bold font-xs">advisor@paisa.in</code> password: <code className="text-emerald-400 font-mono font-bold">paisa</code>
                </p>
                <button
                  type="button"
                  onClick={loadPromoCreds}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer underline flex items-center justify-center mx-auto gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Autocomplete trial credentials
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-950/20 border border-slate-800/60 p-4 rounded-xl flex gap-3 text-xs text-slate-400">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <span className="text-white font-bold block">Individual Space & Privacy Guarantee</span>
              <p className="leading-relaxed text-[11px] text-slate-400">
                Your sandbox budgets, SIP compounders, family profiles, and calculators are encrypted and entirely isolated to your credentials. Guest data remains locally cached in your browser.
              </p>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
