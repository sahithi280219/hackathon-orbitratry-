import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "../types";
import { MessageSquare, Send, X, Bot, User, Sparkles, HelpCircle, Activity, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

interface COSMOChatProps {
  isOpen: boolean;
  onClose: () => void;
  currentTelemetry: {
    kpIndex?: { current: number };
    solarWind?: { speed: number };
    iss?: { latitude: number; longitude: number };
    nextLaunch?: { name: string; countdownText?: string };
    neoCount?: number;
  };
}

export default function COSMOChat({ isOpen, onClose, currentTelemetry }: COSMOChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "cosmo",
      text: "Greetings, Commander. I am COSMO, your on-board Space Science Officer. I am plugged into Orbitra's real-time optical arrays and NOAA sensors. Ask me anything about current space weather, near-Earth trajectories, ISS telemetry, or general astrophysics!",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Suggested quick-prompt coordinates
  const suggestedPrompts = [
    "Where is the ISS right now?",
    "Is there a solar storm active?",
    "Tell me about Apophis asteroid risk.",
    "Explain Coronal Mass Ejections (CME)."
  ];

  // Auto-scroll to bottom on chat changes
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    // Create user bubble
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // POST securely to full-stack backend
      const response = await fetch("/api/cosmo-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages.slice(-10), // Limit history depth context
          spaceContext: currentTelemetry
        })
      });

      if (!response.ok) throw new Error("Subsystem connection failure");
      const result = await response.json();

      const cosmoMsg: ChatMessage = {
        id: `cosmo-${Date.now()}`,
        sender: "cosmo",
        text: result.text || "Sub-orbital links are experiencing high ionization noise. Repeat entry.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, cosmoMsg]);

    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `error-${Date.now()}`,
        sender: "cosmo",
        text: "🚨 [LINK INTERRUPTED]: Unable to establish downstream packet sync with COSMO main module. Verify your server is online with valid Gemini credentials inside the Settings panel.",
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="cosmo-assistant-sidebar"
      className="fixed inset-y-0 right-0 w-full sm:w-[440px] glass-panel border-l border-[#7B5FFF]/30 shadow-2xl z-50 flex flex-col justify-between animate-slide-in"
    >
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#7B5FFF]/20 flex items-center justify-between bg-slate-950/80">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-[#7B5FFF]/15 border border-[#7B5FFF]/40 flex items-center justify-center text-[#7B5FFF]">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            {/* Status dot */}
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00FFCC] border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <h3 className="font-sans font-bold text-sm text-slate-100 tracking-wider">COSMO AI ASSISTANT</h3>
            <span className="text-[9px] font-mono text-slate-400 block uppercase tracking-widest">OBSERVATORY COMPANION</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-white/2 hover:bg-[#FF6060]/20 text-slate-400 hover:text-[#FF6060] border border-white/5 transition-all cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Chat Messages Timeline */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#050A1A]/95">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-[88%] ${msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"}`}
          >
            {/* Avatar block */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
              msg.sender === "user" 
                ? "bg-slate-900 border-white/10 text-slate-300" 
                : "bg-[#7B5FFF]/10 border-[#7B5FFF]/30 text-[#7B5FFF]"
            }`}>
              {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble block */}
            <div className={`p-3 rounded-xl border text-xs font-sans leading-relaxed whitespace-pre-line shadow-lg ${
              msg.sender === "user"
                ? "bg-slate-900/80 border-white/10 text-slate-200 rounded-tr-none"
                : msg.text.startsWith("🚨") 
                  ? "bg-[#FF6060]/10 border-[#FF6060]/30 text-[#FF6060]"
                  : "bg-[#7B5FFF]/5 border-[#7B5FFF]/15 text-slate-200 rounded-tl-none"
            }`}>
              {msg.text}
              <span className="text-[8px] font-mono text-slate-500 block text-right mt-1.5">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 max-w-[85%] mr-auto items-center">
            <div className="w-8 h-8 rounded-lg bg-[#7B5FFF]/10 border border-[#7B5FFF]/30 flex items-center justify-center text-[#7B5FFF]">
              <RefreshCw className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-xl bg-[#7B5FFF]/5 border border-[#7B5FFF]/15 text-xs text-slate-400 font-mono">
              COSMO is decoding signals...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts Drawer */}
      <div className="px-4 py-2 border-t border-white/5 bg-slate-950/60">
        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-[#7B5FFF]" /> SUGGESTED ENQUIRIES
        </span>
        <div className="flex flex-wrap gap-1.5">
          {suggestedPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-[9px] font-mono text-slate-300 hover:text-[#7B5FFF] bg-slate-900/60 hover:bg-[#7B5FFF]/10 border border-white/5 hover:border-[#7B5FFF]/30 px-2 py-1 rounded-md transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Form Input Message bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(input);
        }}
        className="p-4 border-t border-[#7B5FFF]/20 bg-slate-950 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Send a message to COSMO..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-lg px-3 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#7B5FFF] transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="p-2.5 bg-[#7B5FFF] hover:bg-[#7B5FFF]/80 disabled:bg-slate-800 disabled:text-slate-500 text-slate-100 rounded-lg transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
