import React, { useState } from "react";
import { Lock, ShieldCheck, KeyRound, AlertTriangle } from "lucide-react";
import { paisaFetch } from "../api";

interface SettingsPageProps {
  language: "en" | "hi";
}

export default function SettingsPage({ language }: SettingsPageProps) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!oldPassword) {
      setError(language === "hi" ? "वर्तमान पासवर्ड आवश्यक है।" : "Current password is required.");
      return;
    }

    if (!newPassword || newPassword.length < 5) {
      setError(language === "hi" ? "नया पासवर्ड कम से कम 5 अंकों का होना चाहिए।" : "New password must be at least 5 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(language === "hi" ? "नए पासवर्ड मेल नहीं खा रहे हैं।" : "New passwords entered do not match.");
      return;
    }

    setIsLoading(true);
    try {
       const res = await paisaFetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "पासवर्ड परिवर्तन असफल।" : "Current password matching failed."));
      }

      setSuccess(language === "hi" ? "लॉकर पासवर्ड सफलतापूर्वक बदल दिया गया!" : "Locker passcode/password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to establish secure password adjustment.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md text-slate-800 space-y-6 animate-fade-in">
      
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-purple-650" />
          <span>{language === "hi" ? "सुरक्षा सेटिंग्स" : "Locker Security Settings"}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {language === "hi" ? "अपने लॉकर क्रेडेंशियल्स और सुरक्षा कुंजियों को प्रबंधित करें।" : "Manage your secure locker credentials and key passcodes."}
        </p>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-semibold flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
        {/* Old Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "वर्तमान पासवर्ड / पिन" : "Current Password / PIN"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "नया पासवर्ड" : "New Password / PIN"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
            />
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1">
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "नए पासवर्ड की पुष्टि करें" : "Verify New Password"}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
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
              <span>{language === "hi" ? "पासवर्ड अपडेट किया जा रहा है..." : "Processing password reset..."}</span>
            </span>
          ) : (
            <span>{language === "hi" ? "लॉकर पासवर्ड बदलें" : "Update Secure Passcode"}</span>
          )}
        </button>
      </form>
    </div>
  );
}
