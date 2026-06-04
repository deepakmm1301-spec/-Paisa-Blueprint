import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Sparkles, LogIn, UserPlus, ArrowRight, Eye, EyeOff, ChevronLeft, RefreshCw } from "lucide-react";
// @ts-ignore
import paisaLogo from "../assets/images/deep_paisa_logo_1780484307855.png";

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }, profilesList: any[], activeProfileId: string) => void;
  defaultProfile: any;
}

export default function AuthScreen({ onLoginSuccess, defaultProfile }: AuthScreenProps) {
  // Common inputs & state
  const [email, setEmail] = useState("");
  const [emailChecked, setEmailChecked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Dynamic step detection: checks standard network registry for matching email
  const handleCheckEmail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    const emailStr = email.trim();
    if (!emailStr) {
      setError("Please key in your email address.");
      return;
    }
    if (!emailStr.includes("@") || emailStr.length < 5) {
      setError("Please present a valid standard Email format.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/auth/check-email?email=${encodeURIComponent(emailStr)}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Paisa center ledger query failed.");
      }
      setIsRegistered(data.registered);
      setEmailChecked(true);
    } catch (err: any) {
      setError(err.message || "Failed to reach the Paisa central directory.");
    } finally {
      setIsLoading(false);
    }
  };

  // Perform standard secure sign in
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    
    if (!password) {
      setError("Please input your password.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Password matched inaccurately or locker does not exist.");
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

  // Perform standard secure signup
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim()) {
      setError("Please present your full name for the master portfolio profile.");
      return;
    }
    if (!password) {
      setError("Please declare a secure account password.");
      return;
    }
    if (password.length < 5) {
      setError("For safety, use at least 5 character symbols.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords confirmed do not match. Check spelling.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim(),
          password,
          defaultProfile
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Centrex registration rejected.");
      }

      setSuccessMsg("Locker file registered and seeded successfully! Logging in...");
      setTimeout(() => {
        onLoginSuccess(
          { name: data.user.name, email: data.user.email },
          data.user.profilesList,
          data.user.activeProfileId
        );
      }, 800);
    } catch (err: any) {
      setError(err.message || "Error setting up your database files.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPromoCreds = () => {
    setError("");
    setSuccessMsg("");
    setEmail("advisor@paisa.in");
    setPassword("paisa");
    setIsRegistered(true);
    setEmailChecked(true);
  };

  const handleResetEmail = () => {
    setEmailChecked(false);
    setError("");
    setSuccessMsg("");
  };

  const handleContinueAsGuest = () => {
    onLoginSuccess(
      { name: "Deepak Kumar", email: "paisa.mm1301@gmail.com" },
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
          
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {!emailChecked ? "Access Portfolio Locker" : isRegistered ? "Unlock Secure Locker" : "Create Modern Account"}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {!emailChecked 
                ? "Input your email. We will instantly locate your ledger or set up a brand new one."
                : isRegistered 
                ? "Account found in central database! Enter your locker password to access." 
                : "New Email identified! Enter your name and password to seal your new ledger."
              }
            </p>
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

          {/* STEP 1: Email Form */}
          {!emailChecked ? (
            <form onSubmit={handleCheckEmail} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. deepak@paisa.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.99] cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                    Searching central registry...
                  </span>
                ) : (
                  <>
                    Continue to Locker <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center py-2">
                <hr className="flex-1 border-slate-800" />
                <span className="px-3 text-[9px] text-slate-500 uppercase tracking-widest font-black">OR</span>
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
          ) : (
            /* STEP 2: Password (and optionally Name) Form */
            <form onSubmit={isRegistered ? handleLogin : handleSignUp} className="space-y-4">
              
              {/* Dynamic Information Pill */}
              <div className={`p-3 rounded-xl border text-[11px] font-medium flex items-center gap-2 ${
                isRegistered 
                  ? "bg-slate-950/50 text-slate-300 border-slate-800" 
                  : "bg-emerald-950/30 text-emerald-400 border-emerald-900/50"
              }`}>
                <div className={`w-2 h-2 rounded-full ${isRegistered ? "bg-emerald-500" : "bg-bhagwa-500"}`}></div>
                <div className="flex-1 truncate">
                  Registered account for <span className="font-bold">{email}</span> {isRegistered ? "exists." : "will be created."}
                </div>
                <button 
                  type="button" 
                  onClick={handleResetEmail} 
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Change Email
                </button>
              </div>

              {/* Full Name input for registration */}
              {!isRegistered && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Deepak Kumar"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Password Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder={isRegistered ? "Enter account password" : "Define password (min 5 symbols)"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
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

              {/* Confirm Password input for registration */}
              {!isRegistered && (
                <div className="space-y-1 animate-fade-in">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      required
                      placeholder="Re-verify password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={handleResetEmail}
                  className="px-4 py-3 bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 hover:border-slate-800 text-slate-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`flex-1 bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.99] cursor-pointer ${isLoading ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></span>
                      Synchronizing...
                    </span>
                  ) : isRegistered ? (
                    <>
                      <LogIn className="w-4.5 h-4.5" /> Unlock Account File <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4.5 h-4.5" /> Register & Launch Locker
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Quick-seed demo credentials option for reviewer */}
          {!emailChecked && (
            <div className="border-t border-slate-800/80 pt-5">
              <div className="bg-slate-950/40 border border-slate-800/60 p-3.5 rounded-xl text-center space-y-1.5">
                <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                  Quick Trial Account (Direct Preloaded Data)
                </span>
                <p className="text-[11px] text-slate-500">
                  Pre-compiled profile folder: <code className="text-emerald-400 font-mono font-bold">advisor@paisa.in</code> password: <code className="text-emerald-400 font-mono font-bold">paisa</code>
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

        </div>

      </div>

    </div>
  );
}
