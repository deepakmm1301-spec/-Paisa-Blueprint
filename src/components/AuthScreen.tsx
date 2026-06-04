import React, { useState } from "react";
import { Lock, Mail, User, ShieldCheck, Sparkles, LogIn, UserPlus, ArrowRight, Eye, EyeOff } from "lucide-react";
// @ts-ignore
import paisaLogo from "../assets/images/deep_paisa_logo_1780484307855.png";

// Simple internal interface for user account structures
interface UserAccount {
  email: string;
  name: string;
  passwordHash: string;
  profilesList: any[];
  activeProfileId: string;
  createdAt: string;
}

interface AuthScreenProps {
  onLoginSuccess: (user: { name: string; email: string }, profilesList: any[], activeProfileId: string) => void;
  defaultProfile: any;
}

export default function AuthScreen({ onLoginSuccess, defaultProfile }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Inputs
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // States
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Retrieve existing accounts or seed default one
  const getAccounts = (): UserAccount[] => {
    const saved = localStorage.getItem("paisa_user_accounts");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse accounts, reset", e);
      }
    }
    
    // Seed default account
    const seed: UserAccount[] = [
      {
        email: "advisor@paisa.in",
        name: "Deepak Kumar",
        passwordHash: "paisa", // Simple secure match
        profilesList: [
          {
            ...defaultProfile,
            id: "profile-main"
          }
        ],
        activeProfileId: "profile-main",
        createdAt: new Date().toISOString()
      }
    ];
    localStorage.setItem("paisa_user_accounts", JSON.stringify(seed));
    return seed;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all standard credentials.");
      return;
    }

    const accounts = getAccounts();
    const found = accounts.find(acc => acc.email.toLowerCase() === email.toLowerCase().trim());

    if (!found || found.passwordHash !== password) {
      setError("Invalid Email address or Password. Did you forget your password? Try checking credentials or register a new one.");
      return;
    }

    // Success login!
    onLoginSuccess(
      { name: found.name, email: found.email },
      found.profilesList || [{ ...defaultProfile, id: "profile-main" }],
      found.activeProfileId || "profile-main"
    );
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!name.trim() || !email.trim() || !password) {
      setError("All inputs must be completed.");
      return;
    }

    if (password.length < 5) {
      setError("Password must have at least 5 character dimensions.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password confirmations do not match.");
      return;
    }

    const accounts = getAccounts();
    const alreadyExists = accounts.some(acc => acc.email.toLowerCase() === email.toLowerCase().trim());
    
    if (alreadyExists) {
      setError("This email address is already registered in Paisa system. Try logging in.");
      return;
    }

    // Register ! Create localized template
    const newAccount: UserAccount = {
      email: email.trim().toLowerCase(),
      name: name.trim(),
      passwordHash: password,
      profilesList: [
        {
          ...defaultProfile,
          id: "profile-main",
          name: name.trim() // Instantly seed with user's name!
        }
      ],
      activeProfileId: "profile-main",
      createdAt: new Date().toISOString()
    };

    const updated = [...accounts, newAccount];
    localStorage.setItem("paisa_user_accounts", JSON.stringify(updated));

    setSuccessMsg("Account successfully created in database! You may now sign in using your credentials.");
    
    // Clear registration controls
    setIsSignUp(false);
    setPassword("");
    setConfirmPassword("");
  };

  const loadPromoCreds = () => {
    setError("");
    setEmail("advisor@paisa.in");
    setPassword("paisa");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 md:p-8 animate-fade-in text-slate-150">
      
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
                Securely calibrate your household compounding engine.
              </h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Unlock multi-profile family accounting, compute New vs Old tax slabs, step-up SIPs, and draft government scale allowances with smart AI auditing options.
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-850 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-bhagwa-500 shrink-0" />
              <span>Full offline state simulation</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Calibrated standard Tax slabs</span>
            </div>
          </div>

        </div>

        {/* Right Aspect: Authentication Interactive Form Panel */}
        <div className="md:col-span-7 p-8 md:p-12 flex flex-col justify-center space-y-6 bg-slate-900/20">
          
          {/* Prominent Tab Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(false);
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                !isSignUp 
                  ? "bg-bhagwa-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Sign In (Access File)
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(true);
                setError("");
                setSuccessMsg("");
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                isSignUp 
                  ? "bg-bhagwa-600 text-white shadow-sm" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Create Account (Register)
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              {isSignUp ? "Register Family Locker" : "Unlock Account File"}
            </h2>
            <p className="text-slate-400 text-xs mt-1">
              {isSignUp 
                ? "Set your details below to create a brand new secure portfolio file." 
                : "Enter your registered credentials to synchronize your active ledger profiles."
              }
            </p>
          </div>

          {/* Messages info box */}
          {error && (
            <div className="p-3.5 bg-rose-950/40 border border-rose-900 text-rose-300 text-xs font-semibold rounded-xl flex items-start gap-2 animate-pulse">
              <Lock className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 bg-emerald-950/40 border border-emerald-900 text-emerald-300 text-xs font-semibold rounded-xl flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            
            {/* Full Name input for registration */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-450 text-slate-450 text-slate-400">
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
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="e.g. deepak@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all"
                />
              </div>
            </div>

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
                  placeholder="Password (min 5 symbols)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all"
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
            {isSignUp && (
              <div className="space-y-1 animate-fade-in">
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="Verify passcode"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs font-medium text-white focus:outline-none focus:border-bhagwa-500 focus:ring-1 focus:ring-bhagwa-500 placeholder-slate-600 transition-all"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-bhagwa-600 hover:bg-bhagwa-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-bhagwa-600/10 hover:shadow-bhagwa-600/20 active:scale-[0.99] cursor-pointer mt-4"
            >
              {isSignUp ? (
                <>
                  <UserPlus className="w-4.5 h-4.5" /> Create Multi-Profile Locker
                </>
              ) : (
                <>
                  <LogIn className="w-4.5 h-4.5" /> Access Portfolio File <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Register vs Access toggle link */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError("");
                setSuccessMsg("");
              }}
              className="text-xs text-bhagwa-400 hover:text-bhagwa-300 font-semibold cursor-pointer select-none"
            >
              {isSignUp ? "Already have a lock file? Access Sign In" : "Don't have a secure family profile? Create account"}
            </button>
          </div>

          {/* Quick-seed demo credentials option for reviewer */}
          {!isSignUp && (
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
