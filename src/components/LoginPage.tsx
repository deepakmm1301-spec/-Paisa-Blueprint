import React, { useState } from "react";
import { motion } from "motion/react";
import { paisaFetch } from "../api";
import { Lock, Mail, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles, LogIn } from "lucide-react";

interface LoginPageProps {
  onSuccess: (user: any) => void;
  onNavigate: (widget: string) => void;
  language: "en" | "hi";
}

export default function LoginPage({ onSuccess, onNavigate, language }: LoginPageProps) {
  const [authMethod, setAuthMethod] = useState<"email" | "phone">("phone");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const loginValue = authMethod === "email" ? email.trim() : phone.trim();
    if (!loginValue) {
      setError(
        authMethod === "email" 
          ? (language === "hi" ? "कृपया अपना ईमेल दर्ज करें।" : "Please enter your email.") 
          : (language === "hi" ? "कृपया अपना मोबाइल नंबर दर्ज करें।" : "Please enter your mobile number.")
      );
      return;
    }

    if (authMethod === "email" && (!loginValue.includes("@") || loginValue.length < 5)) {
      setError(language === "hi" ? "कृपया एक मान्य ईमेल प्रारूप प्रदान करें।" : "Please present a valid standard Email format.");
      return;
    }

    if (authMethod === "phone" && loginValue.replace(/\D/g, "").length < 10) {
      setError(language === "hi" ? "कृपया 10 अंकों का मोबाइल नंबर दर्ज करें।" : "Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!password) {
      setError(authMethod === "phone" ? (language === "hi" ? "कृपया पासकोड प्रविष्ट करें।" : "Please enter passcode.") : (language === "hi" ? "कृपया पासवर्ड दर्ज करें।" : "Please enter password."));
      return;
    }

    setIsLoading(true);
    try {
      const res = await paisaFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: loginValue,
          password,
          rememberMe
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "लॉगिन असफल। विवरण जांचें।" : "Locker matched incorrectly or does not exist."));
      }

      // Store acquired accessToken in localStorage
      if (data.accessToken) {
        localStorage.setItem("paisa_access_token", data.accessToken);
      }

      // Format response user payload to ensure user field matches App.tsx expectations
      if (!data.user && data.email) {
        data.user = {
          id: data.id,
          email: data.email,
          name: data.name,
          fullName: data.fullName,
          phone: data.phone,
          emailVerified: data.emailVerified,
          role: data.role,
          subscription: data.subscription,
          profilesList: data.profilesList,
          activeProfileId: data.activeProfileId,
          notificationPreferences: data.notificationPreferences,
          country: data.country,
          state: data.state,
          occupation: data.occupation,
          salary: data.salary
        };
      }

      setSuccess(language === "hi" ? "लॉकर प्रमाणित! वित्तीय इंजन लॉन्च किया जा रहा है..." : "Locker file authenticated! Launching financial engine...");
      
      setTimeout(() => {
        onSuccess(data);
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to establish secure session connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadDemo = () => {
    setAuthMethod("email");
    setEmail("advisor@paisa.in");
    setPassword("paisa");
    setError("");
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 relative overflow-hidden">
      
      {/* Decorative Brand Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-bhagwa-500 to-emerald-500" />
      
      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
          {language === "hi" ? "लॉकर अनलॉक करें" : "Unlock Secure Locker"}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {language === "hi" 
            ? "अपने सैंडबॉक्स बजट और एआई वित्तीय सलाहकारों तक पहुंचें।" 
            : "Access your sandbox budgets, step-up SIPs, and AI advisor portfolio."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-red-600 text-xs font-semibold flex items-start gap-2 animate-fade-in">
          <Lock className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 text-emerald-600 text-xs font-semibold flex items-start gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Toggle Credentials Method */}
        <div className="bg-slate-100 p-1 rounded-xl flex border border-slate-150">
          <button
            type="button"
            onClick={() => { setAuthMethod("phone"); setError(""); }}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === "phone" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-750"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-500" /> 
            <span>{language === "hi" ? "फ़ोन और पिन" : "Phone & PIN"}</span>
          </button>
          <button
            type="button"
            onClick={() => { setAuthMethod("email"); setError(""); }}
            className={`flex-1 py-1.5 text-[11px] font-black rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              authMethod === "email" ? "bg-white text-slate-900 shadow-3xs" : "text-slate-500 hover:text-slate-750"
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === "hi" ? "ईमेल और पासवर्ड" : "Email & Pass"}</span>
          </button>
        </div>

        {/* Dynamic Inputs */}
        {authMethod === "phone" ? (
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "मोबाइल नंबर" : "Mobile Number"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                required
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "ईमेल पता" : "Email Address"}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. employee@paisa.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
              />
            </div>
          </div>
        )}

        {/* Password */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {authMethod === "phone" 
                ? (language === "hi" ? "4-अंकीय पासकोड पिन" : "4-Digit Passcode PIN") 
                : (language === "hi" ? "लॉकर पासवर्ड" : "Locker Password")}
            </label>
            <button
              type="button"
              onClick={() => onNavigate("forgot_password")}
              className="text-[10px] font-black text-purple-600 hover:text-purple-700 hover:underline cursor-pointer focus:outline-none"
            >
              {language === "hi" ? "भूल गए?" : "Forgot?"}
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              maxLength={authMethod === "phone" ? 4 : undefined}
              pattern={authMethod === "phone" ? "\\d{4}" : undefined}
              inputMode={authMethod === "phone" ? "numeric" : undefined}
              placeholder={
                authMethod === "phone"
                  ? (language === "hi" ? "4-अंकीय पिन दर्ज करें" : "Enter 4-digit passcode PIN")
                  : (language === "hi" ? "पासवर्ड प्रविष्ट करें" : "Enter password")
              }
              value={password}
              onChange={(e) => {
                const val = e.target.value;
                if (authMethod === "phone") {
                  setPassword(val.replace(/\D/g, ""));
                } else {
                  setPassword(val);
                }
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember me */}
        <div className="flex items-center">
          <input
            id="remember-me-checkbox"
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-slate-300 rounded"
          />
          <label htmlFor="remember-me-checkbox" className="ml-2 block text-xs text-slate-500 font-bold select-none cursor-pointer">
            {language === "hi" ? "मुझे याद रखें (30 दिन)" : "Remember Me (30 Days)"}
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-purple-650 hover:bg-purple-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>{language === "hi" ? "सुरक्षा सत्यापन..." : "Processing Handshake..."}</span>
            </span>
          ) : (
            <>
              <LogIn className="w-4.5 h-4.5" />
              <span>{language === "hi" ? "अनलॉक करें" : "Unlock Ledger"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Trial Credentials */}
      <div className="mt-6 pt-5 border-t border-slate-100">
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-center space-y-1">
          <span className="text-[10px] text-slate-500 block font-black uppercase tracking-wider">
            {language === "hi" ? "परीक्षण खाता (डायरेक्ट प्रीलोडेड डेटा)" : "Trial Account (Direct Preloaded Data)"}
          </span>
          <p className="text-[11px] text-slate-600 font-medium">
            Email: <code className="text-purple-600 font-mono font-bold">advisor@paisa.in</code> Password: <code className="text-purple-600 font-mono font-bold">paisa</code>
          </p>
          <button
            type="button"
            onClick={loadDemo}
            className="text-[11px] font-black text-purple-600 hover:text-purple-700 cursor-pointer underline flex items-center justify-center mx-auto gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{language === "hi" ? "परीक्षण खाता ऑटो-फिल करें" : "Autocomplete trial credentials"}</span>
          </button>
        </div>
      </div>

      <div className="mt-5 text-center">
        <span className="text-xs text-slate-500 font-bold">
          {language === "hi" ? "नया लॉकर बनाना चाहते हैं?" : "Need a new locker? "}
          <button
            onClick={() => onNavigate("signup")}
            className="text-purple-600 hover:text-purple-700 hover:underline font-black cursor-pointer bg-transparent border-0"
          >
            {language === "hi" ? "यहाँ रजिस्टर करें" : "Sign Up Here"}
          </button>
        </span>
      </div>
    </div>
  );
}
