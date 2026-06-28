import React, { useState, useEffect } from "react";
import { Lock, Eye, EyeOff, ShieldCheck, ChevronLeft, LockKeyhole } from "lucide-react";
import { paisaFetch } from "../api";

interface ResetPasswordPageProps {
  onNavigate: (widget: string) => void;
  language: "en" | "hi";
  tokenFromQuery?: string;
}

export default function ResetPasswordPage({ onNavigate, language, tokenFromQuery }: ResetPasswordPageProps) {
  const [token, setToken] = useState(tokenFromQuery || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!token.trim()) {
      setError(language === "hi" ? "रीसेट टोकन आवश्यक है।" : "Recovery token is required.");
      return;
    }

    if (!password || password.length < 5) {
      setError(language === "hi" ? "नया पासवर्ड कम से कम 5 अंकों का होना चाहिए।" : "New password must be at least 5 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError(language === "hi" ? "पासवर्ड मेल नहीं खा रहे हैं।" : "Passwords entered do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await paisaFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token.trim(),
          password
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "पासवर्ड रीसेट करने में समस्या आई।" : "Error resetting password. Token may be invalid or expired."));
      }

      setSuccess(
        language === "hi" 
          ? "पासवर्ड सफलतापूर्वक रीसेट हो गया है! लॉगिन कर रहे हैं..." 
          : "Your locker password has been successfully reset! Redirecting to sign in..."
      );
      
      setTimeout(() => {
        onNavigate("login");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xl text-slate-800 relative overflow-hidden">
      
      {/* Decorative Brand Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-bhagwa-500 to-emerald-500" />
      
      <div className="mb-4">
        <button
          onClick={() => onNavigate("login")}
          className="text-xs font-black text-slate-500 hover:text-slate-800 transition-all flex items-center gap-1 cursor-pointer focus:outline-none"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{language === "hi" ? "लॉगिन पर वापस जाएं" : "Back to Sign In"}</span>
        </button>
      </div>

      <div className="text-center space-y-2 mb-6">
        <h3 className="text-2xl font-black text-slate-900 tracking-tight font-display uppercase">
          {language === "hi" ? "नया पासवर्ड सेट करें" : "Set New Password"}
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          {language === "hi" 
            ? "अपने लॉकर के लिए नया पासवर्ड प्रविष्ट करें।" 
            : "Establish a secure new password for your personal ledger folder."}
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-xl mb-4 text-red-600 text-xs font-semibold flex items-start gap-2 animate-fade-in">
          <LockKeyhole className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl mb-4 text-emerald-600 text-xs font-semibold flex items-start gap-2 animate-fade-in">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleResetPassword} className="space-y-4">
        
        {/* Token Input */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "रीसेट टोकन कुंजी" : "Locker Recovery Token"}
          </label>
          <input
            type="text"
            required
            placeholder="Paste your recovery token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 px-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 placeholder-slate-400 transition-all font-mono"
          />
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "नया पासवर्ड" : "New Password"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              required
              placeholder={language === "hi" ? "नया पासवर्ड दर्ज करें (न्यूनतम 5 अंक)" : "Enter new password (min 5 symbols)"}
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
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "पासवर्ड की पुष्टि करें" : "Confirm New Password"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              placeholder={language === "hi" ? "दोबारा टाइप करें" : "Verify new password selection"}
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
              <span>{language === "hi" ? "पासवर्ड सहेज रहे हैं..." : "Saving Password..."}</span>
            </span>
          ) : (
            <span>{language === "hi" ? "पासवर्ड सुरक्षित रूप से रीसेट करें" : "Establish New Password"}</span>
          )}
        </button>
      </form>
    </div>
  );
}
