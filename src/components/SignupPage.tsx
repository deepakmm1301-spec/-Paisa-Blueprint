import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Lock, Mail, Phone, Eye, EyeOff, ShieldCheck, ArrowRight, User, UserPlus, CheckCircle } from "lucide-react";

interface SignupPageProps {
  onSuccess: (user: any) => void;
  onNavigate: (widget: string) => void;
  language: "en" | "hi";
  defaultProfile?: any;
}

export default function SignupPage({ onSuccess, onNavigate, language, defaultProfile }: SignupPageProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Password strength checker states
  const [strength, setStrength] = useState(0); // 0 to 4
  const [strengthLabel, setStrengthLabel] = useState("");
  const [strengthColor, setStrengthColor] = useState("bg-slate-200");

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setStrengthLabel("");
      setStrengthColor("bg-slate-200");
      return;
    }

    let score = 0;
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password) || /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    setStrength(score);

    if (score <= 1) {
      setStrengthLabel(language === "hi" ? "कमज़ोर" : "Weak");
      setStrengthColor("bg-red-500");
    } else if (score === 2) {
      setStrengthLabel(language === "hi" ? "मध्यम" : "Medium");
      setStrengthColor("bg-amber-500");
    } else if (score === 3) {
      setStrengthLabel(language === "hi" ? "सुरक्षित" : "Strong");
      setStrengthColor("bg-indigo-500");
    } else {
      setStrengthLabel(language === "hi" ? "अति सुरक्षित" : "Very Secure");
      setStrengthColor("bg-emerald-500");
    }
  }, [password, language]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!fullName.trim()) {
      setError(language === "hi" ? "कृपया अपना पूरा नाम दर्ज करें।" : "Please enter your full name.");
      return;
    }

    const emailTrim = email.trim();
    const phoneTrim = phone.trim().replace(/\D/g, "");

    if (!emailTrim && !phoneTrim) {
      setError(language === "hi" ? "या तो ईमेल या फोन नंबर अनिवार्य है।" : "Either email or phone number is required.");
      return;
    }

    if (emailTrim && (!emailTrim.includes("@") || emailTrim.length < 5)) {
      setError(language === "hi" ? "कृपया मान्य ईमेल प्रविष्ट करें।" : "Please enter a valid email address.");
      return;
    }

    if (phoneTrim && phoneTrim.length < 10) {
      setError(language === "hi" ? "कृपया मान्य 10-अंकीय मोबाइल नंबर प्रविष्ट करें।" : "Please enter a valid 10-digit phone number.");
      return;
    }

    if (!password || password.length < 5) {
      setError(language === "hi" ? "सुरक्षा के लिए पासवर्ड कम से कम 5 अंकों का होना चाहिए।" : "For safety, password must contain at least 5 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === "hi" ? "पासवर्ड मेल नहीं खा रहे हैं।" : "Passwords entered do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailTrim,
          phone: phoneTrim,
          name: fullName.trim(),
          password,
          defaultProfile
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "पंजीकरण विफल।" : "Registration failed."));
      }

      setSuccess(language === "hi" ? "सफलतापूर्वक पंजीकृत! ऑटो-लॉगिन शुरू..." : "Locker file registered and seeded successfully! Logging in...");
      
      setTimeout(() => {
        onSuccess(data);
      }, 1000);
    } catch (err: any) {
      setError(err.message || "Failed to create your database locker.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 relative overflow-hidden">
      
      {/* Decorative Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-bhagwa-500 to-emerald-500" />
      
      <div className="text-center space-y-2 mb-5">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
          {language === "hi" ? "नया खाता बनाएं" : "Create Private Locker"}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {language === "hi" 
            ? "अपना सुरक्षित डिजिटल लेज़र प्रारंभ करें और अपनी संपत्ति को संरेखित करें।" 
            : "Start your secure digital ledger and align your wealth compounding."}
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
          <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleSignup} className="space-y-3.5">
        
        {/* Full Name */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "पूरा नाम" : "Full Name"}
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              required
              placeholder="e.g. Anchal Priya"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "ईमेल पता" : "Email Address"}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="email"
              placeholder="e.g. info@paisa.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "मोबाइल नंबर (वैकल्पिक)" : "Mobile Number (Optional)"}
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="tel"
              placeholder="e.g. 9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        {/* Define Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "पासवर्ड प्रविष्ट करें" : "Define Security Password"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={language === "hi" ? "सुरक्षित पासवर्ड चुनें" : "Define secure password (min 5 characters)"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Password safety meter */}
          {password && (
            <div className="pt-1 space-y-1">
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 font-bold">{language === "hi" ? "पासवर्ड ताकत:" : "Safety Strength:"}</span>
                <span className="font-bold uppercase tracking-wider" style={{ color: strengthColor.replace('bg-', '') }}>
                  {strengthLabel}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div 
                  className={`h-full transition-all duration-300 ${strengthColor}`} 
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Verify Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm Security Password"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder={language === "hi" ? "पासवर्ड दोबारा लिखें" : "Verify your password choice"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-purple-650 hover:bg-purple-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>{language === "hi" ? "लॉकर रजिस्ट्री..." : "Registering Locker..."}</span>
            </span>
          ) : (
            <>
              <UserPlus className="w-4.5 h-4.5" />
              <span>{language === "hi" ? "रजिस्टर और प्रारंभ" : "Register Private Locker"}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-5 text-center">
        <span className="text-xs text-slate-500 font-bold">
          {language === "hi" ? "पहले से ही खाता है? " : "Already have a locker? "}
          <button
            onClick={() => onNavigate("login")}
            className="text-purple-600 hover:text-purple-700 hover:underline font-black cursor-pointer bg-transparent border-0"
          >
            {language === "hi" ? "यहाँ अनलॉक करें" : "Unlock Locker"}
          </button>
        </span>
      </div>
    </div>
  );
}
