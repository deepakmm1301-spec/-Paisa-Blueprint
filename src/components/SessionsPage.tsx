import React, { useState } from "react";
import { Laptop, Clock, ShieldAlert, Trash2, Calendar, Lock } from "lucide-react";
import { paisaFetch } from "../api";

interface SessionsPageProps {
  user: any;
  onLogout: () => void;
  language: "en" | "hi";
}

export default function SessionsPage({ user, onLogout, language }: SessionsPageProps) {
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Parse login history or provide a lovely fallback
  const loginHistory = user?.loginHistory || [
    {
      timestamp: new Date().toISOString(),
      ipAddress: "127.0.0.1 (Local Client)",
      device: navigator.userAgent.split(") ")[0] + ")" || "Sandbox Desktop"
    }
  ];

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!deletePassword) {
      setError(language === "hi" ? "खाता मिटाने के लिए पासवर्ड आवश्यक है।" : "Passcode validation is required to purge account.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await paisaFetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "पासवर्ड गलत है।" : "Entered passcode matching failed."));
      }

      setSuccess(
        language === "hi" 
          ? "खाता पूरी तरह से हटा दिया गया है। अलविदा!" 
          : "Your sandbox locker has been securely purged from the system. Fair winds!"
      );
      
      setTimeout(() => {
        onLogout();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to finalize account deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md text-slate-800 space-y-8 animate-fade-in">
      
      {/* Visual Identity Header */}
      <div className="border-b border-slate-100 pb-4">
        <h2 className="text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-650" />
          <span>{language === "hi" ? "सक्रिय सत्र और इतिहास" : "Active Sessions & Login History"}</span>
        </h2>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          {language === "hi" ? "अपने सक्रिय लॉकर सत्रों और हाल की गतिविधियों की समीक्षा करें।" : "Review active locker connection links and historic access metrics."}
        </p>
      </div>

      {/* Active Session Card */}
      <div className="space-y-3">
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
          {language === "hi" ? "वर्तमान सक्रिय सत्र" : "Current Active Session"}
        </span>
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-start gap-4">
          <div className="p-3 bg-purple-150 rounded-xl text-purple-700 shrink-0">
            <Laptop className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black block text-slate-800">
              {language === "hi" ? "यह ब्राउज़र सत्र" : "This Sandbox Browser"}
            </span>
            <p className="text-[11px] text-slate-500 leading-relaxed font-mono font-medium">
              IP: {user?.lastLogin ? "Stored Remote Session" : "127.0.0.1 (Dynamic)"} • Agent: {navigator.userAgent.slice(0, 50)}...
            </p>
            <span className="inline-flex items-center gap-1.5 text-[9px] uppercase font-black bg-emerald-55 text-emerald-700 border border-emerald-100 px-2.5 py-0.5 rounded-full mt-1">
              <span className="w-1.5 h-1.5 bg-emerald-550 rounded-full animate-pulse" />
              <span>{language === "hi" ? "सक्रिय" : "Active Connection"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Login History */}
      <div className="space-y-3">
        <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
          {language === "hi" ? "हालिया लॉगिन गतिविधि लॉग" : "Historic Session Logs"}
        </span>
        <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100">
          {loginHistory.map((log: any, idx: number) => (
            <div key={idx} className="p-3.5 flex justify-between items-center bg-white hover:bg-slate-50/50 transition-all">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="text-xs font-extrabold text-slate-700 block">
                    {new Date(log.timestamp).toLocaleString("en-IN", { timeZone: "IST" })}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">IP: {log.ipAddress || "Unknown IP"}</span>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 max-w-[120px] truncate text-right">
                {log.device || "Sandbox Terminal"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="border-t border-red-100 pt-6 space-y-4">
        <span className="block text-[10px] font-black uppercase tracking-wider text-red-500 flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
          <span>{language === "hi" ? "अति संवेदनशील क्षेत्र" : "Locker Danger Zone"}</span>
        </span>

        {error && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold">
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-semibold">
            <span>{success}</span>
          </div>
        )}

        {!showDeleteConfirm ? (
          <div className="bg-red-50/50 border border-red-100/70 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-xs font-black text-red-700 block">
                {language === "hi" ? "लॉकर को स्थायी रूप से मिटाएं" : "Purge Locker Permanently"}
              </span>
              <p className="text-[10px] text-red-600 mt-0.5 leading-relaxed font-semibold">
                {language === "hi" 
                  ? "यह क्रिया अपरिवर्तनीय है। आपके सभी बजट, प्रोफाइल और सहेजे गए डेटा स्थायी रूप से हटा दिए जाएंगे।" 
                  : "All data, calculations, and active sandbox profiles will be completely purged."}
              </p>
            </div>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer border-0 shrink-0 flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{language === "hi" ? "खाता हटाएं" : "Purge Ledger"}</span>
            </button>
          </div>
        ) : (
          <form onSubmit={handleDeleteAccount} className="bg-red-50 border border-red-200/60 p-4 rounded-2xl space-y-3">
            <div>
              <span className="text-xs font-black text-red-700 block">
                {language === "hi" ? "क्या आप सच में निश्चित हैं?" : "Are you absolutely sure?"}
              </span>
              <p className="text-[10px] text-red-600 font-semibold mt-0.5">
                {language === "hi" 
                  ? "स्थायी विलोपन की पुष्टि के लिए कृपया अपना पासवर्ड प्रविष्ट करें।" 
                  : "Please enter your password PIN to verify that you wish to delete this account."}
              </p>
            </div>
            <div className="relative max-w-sm">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder={language === "hi" ? "पासवर्ड दर्ज करें" : "Enter password PIN"}
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className="w-full bg-white border border-red-300 hover:border-red-400 rounded-xl py-2 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl transition-all cursor-pointer border-0 disabled:opacity-50"
              >
                {isDeleting ? "Purging..." : (language === "hi" ? "स्थायी रूप से हटाएं" : "Confirm Purge")}
              </button>
              <button
                type="button"
                onClick={() => { setShowDeleteConfirm(false); setDeletePassword(""); setError(""); }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer border-0"
              >
                {language === "hi" ? "रद्द करें" : "Cancel"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
