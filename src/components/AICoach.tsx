import React, { useState, useRef, useEffect } from "react";
import { UserProfile, ChatMessage } from "../types";
import { Sparkles, Send, Bot, User, Trash2, HelpCircle, Loader2, AlertCircle } from "lucide-react";

interface Props {
  profile: UserProfile;
}

export default function AICoach({ profile }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-msg",
      role: "assistant",
      content: `Namaste ${profile.name || "friend"}! I am your **Paisa Blueprint AI Financial Coach** 🇮🇳. 

I specialize in Indian salaried personal finance, 7th Pay scales (BPSC/KVS), direct equity index mutual fund SIP compounding, and regime tax optimization.

Here are some helpful presets you can ask me, or type your own question below:`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setErrorStatus(null);
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          userProfile: profile,
        }),
      });

      if (!response.ok) {
        let serverErrorMsg = "";
        try {
          const errorText = await response.text();
          if (errorText.includes("GEMINI_API_KEY") || errorText.includes("ApiKey")) {
            serverErrorMsg = "Your Gemini API Key is missing. Access the Secrets panel in Settings to provide your GEMINI_API_KEY.";
          } else {
            try {
              const parsed = JSON.parse(errorText);
              serverErrorMsg = parsed.error || "Failed to parse error description.";
            } catch (jsonErr) {
              serverErrorMsg = "Failed to connect to AI server. This usually happens when GEMINI_API_KEY is not configured in the Secrets manager, or the server is still booting up.";
            }
          }
        } catch (readErr) {
          serverErrorMsg = "Failed to match AI server response. Please verify your GEMINI_API_KEY configured in Settings > Secrets.";
        }
        throw new Error(serverErrorMsg);
      }

      const data = await response.json();
      const botMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: "assistant",
        content: data.content,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error(err);
      setErrorStatus(
        err.message?.includes("GEMINI_API_KEY") 
          ? "Your Gemini API Key is missing or invalid. Access the Secrets panel in Settings to provide your GEMINI_API_KEY."
          : err.message || "Something went wrong. Please check your network connection or try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "welcome-msg",
        role: "assistant",
        content: `Chat cleared! Ask me anything regarding your customized Paisa personal finance roadmap.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    setErrorStatus(null);
  };

  const quickPrompts = [
    {
      label: "SIP Plan for ₹50,000 salary",
      text: "I earn ₹50,000 monthly in Bihar. How should I distribute my safe emergency fund vs index mutual fund SIPs?",
    },
    {
      label: "BPSC Teacher tax optimization",
      text: "As a primary BPSC school teacher, how can I save maximum tax under Section 80C and the NPS scheme?",
    },
    {
      label: "Why is Term insurance preferred?",
      text: "Why do Indian finance communities advise purchasing Term Life Insurance over Endowment or ULIP cash schemes?",
    },
  ];

  return (
    <div id="ai-coach-module" className="bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col h-[650px] overflow-hidden text-sm">
      {/* Head */}
      <div className="bg-slate-950 text-white p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-bhagwa-500/20 rounded-xl border border-bhagwa-500/30">
            <Bot className="w-5 h-5 text-bhagwa-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-100 font-display text-sm leading-tight">AI Financial Coach</h3>
            <span className="text-[10px] text-bhagwa-300 font-semibold tracking-wider flex items-center gap-1 mt-0.5">
              <Sparkles className="w-3 h-3" /> ONLINE • CALIBRATED FOR INDIA
            </span>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "ml-auto flex-row-reverse" : ""}`}
          >
            <div
              className={`p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border ${
                msg.role === "user" 
                  ? "bg-bhagwa-50 border-bhagwa-100 text-bhagwa-600" 
                  : "bg-white border-slate-100 text-slate-600"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className="space-y-1">
              <div
                className={`p-4 rounded-2xl leading-relaxed text-xs break-words ${
                  msg.role === "user"
                    ? "bg-bhagwa-600 text-white rounded-tr-none"
                    : "bg-white border border-slate-100 text-slate-800 rounded-tl-none"
                }`}
              >
                {/* Parse basic bold markdown spacing */}
                {msg.content.split("\n").map((line, lIdx) => {
                  // Basic formatting for lines with bold **
                  let displayLine: React.ReactNode = line;
                  if (line.includes("**")) {
                    const parts = line.split("**");
                    displayLine = parts.map((part, pIdx) => 
                      pIdx % 2 === 1 ? <strong key={pIdx} className={msg.role === "user" ? "text-white underline" : "text-bhagwa-950 font-bold"}>{part}</strong> : part
                    );
                  }
                  return (
                    <span key={lIdx} className="block mt-1">
                      {displayLine}
                    </span>
                  );
                })}
              </div>
              <span className={`text-[9px] text-slate-400 block ${msg.role === "user" ? "text-right" : ""}`}>
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {/* Floating Quick Action presets when chat is at standard start */}
        {messages.length === 1 && (
          <div className="grid grid-cols-1 gap-2.5 max-w-sm pl-12 pt-1">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(qp.text)}
                className="text-left bg-white border border-slate-100 hover:border-bhagwa-100 hover:bg-slate-50 p-3 rounded-xl text-xs text-bhagwa-950 font-semibold shadow-2xs transition-all cursor-pointer"
              >
                {qp.label} →
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="p-2.5 rounded-xl shrink-0 h-9 w-9 flex items-center justify-center border bg-white border-slate-100 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500">
              <span>Paisa Coach is thinking...</span>
            </div>
          </div>
        )}

        {/* Error notice */}
        {errorStatus && (
          <div className="p-4 bg-rose-50 border border-rose-100 text-rose-800 text-xs rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Execution Hold-up</p>
              <p className="mt-0.5 leading-relaxed">{errorStatus}</p>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Foot Input form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputValue);
        }}
        className="p-4 bg-white border-t border-slate-100 flex gap-2.5"
      >
        <input
          type="text"
          value={inputValue}
          disabled={loading}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask about taxes, SIP calculators, NPS vs EPF...`}
          className="flex-1 bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-2.5 text-slate-800 text-xs focus:outline-none focus:border-bhagwa-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || loading}
          className="bg-bhagwa-600 hover:bg-bhagwa-700 text-white p-2.5 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:bg-slate-300 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
