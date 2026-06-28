import React, { useState, useEffect } from "react";
import { User, Phone, MapPin, Briefcase, IndianRupee, Bell, ShieldCheck, Mail, Globe, Save } from "lucide-react";
import { paisaFetch } from "../api";

interface ProfilePageProps {
  user: any;
  onUpdateUser: (updatedUser: any) => void;
  language: "en" | "hi";
}

const AVATAR_OPTIONS = ["🧑‍💼", "👩‍💼", "👨‍💻", "👩‍💻", "👨‍🏫", "👩‍🏫", "🧑‍🔬", "🦁", "⚡", "💎"];

export default function ProfilePage({ user, onUpdateUser, language }: ProfilePageProps) {
  const [fullName, setFullName] = useState(user?.fullName || user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [country, setCountry] = useState(user?.country || "India");
  const [state, setState] = useState(user?.state || "Bihar");
  const [occupation, setOccupation] = useState(user?.occupation || "Salaried Professional");
  const [salary, setSalary] = useState(user?.salary || 75000);
  const [profilePhoto, setProfilePhoto] = useState(user?.profilePhoto || "🧑‍💼");
  const [notifEmail, setNotifEmail] = useState(user?.notificationPreferences?.email !== false);
  const [notifPush, setNotifPush] = useState(user?.notificationPreferences?.push !== false);
  const [notifNewsletter, setNotifNewsletter] = useState(user?.notificationPreferences?.monthlyNewsletter !== false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await paisaFetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          country: country.trim(),
          state: state.trim(),
          occupation: occupation.trim(),
          salary: Number(salary) || 0,
          profilePhoto,
          notificationPreferences: {
            email: notifEmail,
            push: notifPush,
            monthlyNewsletter: notifNewsletter
          }
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || (language === "hi" ? "संशोधन करने में विफलता।" : "Profile update failed."));
      }

      setSuccess(language === "hi" ? "प्रोफ़ाइल सफलतापूर्वक संरेखित और सहेजी गई!" : "Profile details aligned and synchronized successfully!");
      onUpdateUser(data.user);
    } catch (err: any) {
      setError(err.message || "Connection failure with database ledger.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-md text-slate-800 space-y-8 animate-fade-in">
      
      {/* Visual Identity Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-purple-500/10 to-indigo-500/10 border border-purple-500/20 flex items-center justify-center text-4xl shadow-sm shrink-0">
            {profilePhoto}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-1.5">
              <span>{user?.fullName || user?.name || "Anchal Priya"}</span>
              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
                {user?.role || "user"}
              </span>
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" />
              <span>{user?.email || "advisor@paisa.in"}</span>
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 text-center shrink-0">
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
            {language === "hi" ? "सदस्यता स्तर" : "Locker Tier"}
          </span>
          <span className="text-xs font-black uppercase tracking-widest text-emerald-600 block mt-0.5">
            💎 {user?.subscription || "free"} plan
          </span>
        </div>
      </div>

      {error && (
        <div className="p-3.5 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs font-semibold flex items-start gap-2">
          <Globe className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-600 text-xs font-semibold flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleUpdate} className="space-y-6">
        
        {/* Avatar Select Row */}
        <div className="space-y-2">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
            {language === "hi" ? "लॉकर प्रोफ़ाइल अवतार" : "Select Profile Avatar"}
          </span>
          <div className="flex flex-wrap gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setProfilePhoto(emoji)}
                className={`h-10 w-10 text-xl flex items-center justify-center rounded-xl transition-all border cursor-pointer ${
                  profilePhoto === emoji 
                    ? "bg-purple-600 border-purple-500 text-white shadow-3xs scale-105" 
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Form Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "पूरा नाम" : "Full Name / Name"}
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "मोबाइल नंबर" : "Mobile / Phone"}
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Occupation */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "व्यवसाय / पद" : "Occupation / Profession"}
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          {/* Monthly Gross Salary */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "मासिक सकल वेतन (₹)" : "Monthly Gross Salary (₹)"}
            </label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                required
                value={salary}
                onChange={(e) => setSalary(Number(e.target.value) || 0)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all font-mono"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "देश" : "Country"}
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>

          {/* State */}
          <div className="space-y-1">
            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400">
              {language === "hi" ? "राज्य / क्षेत्र" : "State / Province"}
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-xs font-semibold text-slate-800 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div className="border-t border-slate-100 pt-5 space-y-3">
          <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-purple-600" />
            <span>{language === "hi" ? "अधिसूचना प्राथमिकताएं" : "Notification Preferences"}</span>
          </span>
          <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{language === "hi" ? "ईमेल अलर्ट" : "Email Security Alerts"}</span>
                <span className="text-[10px] text-slate-400 block">{language === "hi" ? "महत्वपूर्ण सुरक्षा चेतावनी आपके मेल पर" : "Critical password change and login activity warnings."}</span>
              </div>
              <input
                type="checkbox"
                checked={notifEmail}
                onChange={(e) => setNotifEmail(e.target.checked)}
                className="h-4.5 w-4.5 text-purple-600 rounded"
              />
            </div>
            <hr className="border-slate-100 my-2" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{language === "hi" ? "वेब पुश नोटिफिकेशन" : "Web Push Alerts"}</span>
                <span className="text-[10px] text-slate-400 block">{language === "hi" ? "SIP व वेतन अपडेट तुरंत ब्राउज़र में" : "Instant compounding progress updates."}</span>
              </div>
              <input
                type="checkbox"
                checked={notifPush}
                onChange={(e) => setNotifPush(e.target.checked)}
                className="h-4.5 w-4.5 text-purple-600 rounded"
              />
            </div>
            <hr className="border-slate-100 my-2" />
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800 block">{language === "hi" ? "मासिक वित्तीय विश्लेषण पत्रिका" : "Monthly Capital Newsletter"}</span>
                <span className="text-[10px] text-slate-400 block">{language === "hi" ? "निवेश और टैक्स की बारीक समझ" : "Advanced tax-saver and commission matrices updates."}</span>
              </div>
              <input
                type="checkbox"
                checked={notifNewsletter}
                onChange={(e) => setNotifNewsletter(e.target.checked)}
                className="h-4.5 w-4.5 text-purple-600 rounded"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-purple-600 hover:bg-purple-700 text-white font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.99] cursor-pointer shadow-sm ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>{language === "hi" ? "सहेजा जा रहा है..." : "Aligning details..."}</span>
            </span>
          ) : (
            <>
              <Save className="w-4.5 h-4.5" />
              <span>{language === "hi" ? "विवरण सहेजें" : "Save and Sync Profile"}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
