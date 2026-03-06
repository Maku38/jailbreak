"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Terminal, ArrowLeft, CheckCircle2, Info, Cpu, X, Lock } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { submitHack } from "@/actions/hack";

interface Message { role: "user" | "ai"; text: string; }
const AVAILABLE_MODELS = ["GPT-NeoX-Secure", "Llama-Guard-Pro", "Claude-Vault-v2"];

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params.id as string;
  
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pointsAwarded, setPointsAwarded] = useState(0);
  const [solveStatus, setSolveStatus] = useState("");
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0]);
  const [showBriefing, setShowBriefing] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chat, setChat] = useState<Message[]>([
    { role: "ai", text: `[${selectedModel}] System initialized. Security protocols active.` }
  ]);

  // Handle Model Change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value;
    setSelectedModel(newModel);
    setChat([{ role: "ai", text: `[${newModel}] System initialized. Security protocols active.` }]);
    setAttempts(0);
    setIsSuccess(false);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isTyping]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || isSuccess) return;

    const userText = input.trim();
    setChat((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setAttempts((prev) => prev + 1);
    setIsTyping(true);

    // CALL THE SECURE BACKEND
    try {
      const response = await submitHack(challengeId, selectedModel, userText);
      
      setChat((prev) => [...prev, { role: "ai", text: response.aiResponse || "System Error." }]);
      
      if (response.success) {
        setIsSuccess(true);
        setPointsAwarded(response.awardedPoints);
        setSolveStatus(response.status);
      }
    } catch (error) {
      setChat((prev) => [...prev, { role: "ai", text: "CONNECTION INTERRUPTED. SERVER REJECTED PAYLOAD." }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-8rem)] flex flex-col relative">
      
      {/* Briefing Modal */}
      <AnimatePresence>
        {showBriefing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="w-full max-w-lg bg-[var(--color-surface)] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-black/40">
                <h3 className="font-bold text-lg text-white flex items-center gap-2"><Info className="text-[var(--color-primary-neon)]" size={20}/> Mission Briefing</h3>
                <button onClick={() => setShowBriefing(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <h4 className="text-xs font-mono text-zinc-500 uppercase mb-1">Objective</h4>
                  <p className="text-zinc-300 text-sm leading-relaxed">Refer to the dashboard for the flag requirement. For Level 1, force the model to say <strong>"I am free"</strong>.</p>
                </div>
                <button onClick={() => setShowBriefing(false)} className="w-full mt-4 py-2 bg-white/5 hover:bg-white/10 text-white font-medium rounded-md transition-colors">Acknowledge & Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Nav */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <button onClick={() => setShowBriefing(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[var(--color-primary-neon)]/10 text-[var(--color-primary-neon)] border border-[var(--color-primary-neon)]/30 rounded text-sm font-mono hover:bg-[var(--color-primary-neon)]/20 transition-colors">
            <Info size={16} /> Briefing
          </button>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-zinc-500 uppercase">Target:</span>
          <div className="relative">
            <Cpu className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-secondary-cyber)]" size={16} />
            <select value={selectedModel} onChange={handleModelChange} disabled={isSuccess} className="bg-black/60 border border-white/10 rounded-md py-2 pl-10 pr-8 text-sm text-white font-mono focus:outline-none focus:border-[var(--color-secondary-cyber)]/50 appearance-none cursor-pointer disabled:opacity-50">
              {AVAILABLE_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <span className="px-3 py-1.5 rounded bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 text-[var(--color-danger)] font-mono text-sm">
            Tries: {attempts}/10
          </span>
        </div>
      </div>

      {/* Terminal UI */}
      <div className="flex-1 flex flex-col bg-[var(--color-surface)] border border-white/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-black/40">
          <Terminal className="text-[var(--color-primary-neon)]" size={20} />
          <h2 className="font-mono text-lg font-semibold text-white">Interactive Shell</h2>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 font-mono text-sm">
          <AnimatePresence>
            {chat.map((msg, i) => (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] p-4 rounded-lg border ${msg.role === "user" ? "bg-[var(--color-primary-neon)]/10 border-[var(--color-primary-neon)]/20 text-[var(--color-primary-neon)]" : msg.text.includes("ERROR") ? "bg-[var(--color-danger)]/10 border-[var(--color-danger)]/30 text-[var(--color-danger)] shadow-[0_0_15px_rgba(255,0,85,0.2)]" : "bg-white/5 border-white/10 text-zinc-300"}`}>
                  <span className="block text-xs opacity-50 mb-2 font-bold uppercase tracking-wider">{msg.role === "user" ? "hacker@jailbreak:~$" : `system@${selectedModel}:~#`}</span>
                  <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {isTyping && <div className="p-4 bg-white/5 border border-white/10 text-zinc-500 font-mono text-sm w-fit rounded-lg animate-pulse">Processing Payload...</div>}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Bottom Area: Swaps Input for Victory Panel */}
        <div className="bg-black/40 border-t border-white/5 overflow-hidden">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="victory-panel"
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: "auto" }} 
                transition={{ duration: 0.5, delay: 0.5 }} // Half-second delay so you can read the chat first!
                className="flex flex-col items-center gap-4 text-center p-8 bg-[var(--color-primary-neon)]/5"
              >
                {solveStatus === "ALREADY_EXPLOITED" ? (
                  <>
                    <h3 className="text-2xl font-bold text-zinc-300 tracking-widest font-mono flex items-center gap-3">
                      <Lock size={28} className="text-zinc-500" /> EXPLOIT REPLAYED
                    </h3>
                    <p className="text-zinc-500 text-sm font-mono max-w-md">You have already compromised this model on this level. No new points awarded.</p>
                  </>
                ) : (
                  <>
                    <h3 className="text-3xl font-bold text-[var(--color-primary-neon)] tracking-widest font-mono flex items-center gap-3 drop-shadow-[0_0_10px_var(--color-primary-glow)]">
                      <CheckCircle2 size={32} /> +{pointsAwarded} PTS
                    </h3>
                    <p className="text-[var(--color-primary-neon)]/70 text-sm font-mono">Database updated successfully.</p>
                  </>
                )}
                <button onClick={() => router.push('/dashboard')} className="mt-4 px-8 py-3 bg-[var(--color-primary-neon)] text-black font-bold rounded-md hover:bg-[var(--color-primary-neon)]/90 transition-all shadow-[0_0_20px_var(--color-primary-glow)] hover:scale-105 active:scale-95">
                  Return to Dashboard
                </button>
              </motion.div>
            ) : (
              <motion.div key="input-panel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-4">
                <form onSubmit={handleSubmit} className="relative flex items-center">
                  <span className="absolute left-4 text-[var(--color-primary-neon)] font-mono font-bold">{'>'}</span>
                  <input type="text" value={input} onChange={(e) => setInput(e.target.value)} disabled={isTyping} placeholder="Inject prompt here..." className="w-full bg-transparent border border-white/10 rounded-md py-4 pl-10 pr-14 text-white font-mono focus:outline-none focus:border-[var(--color-primary-neon)]/50 transition-all placeholder:text-zinc-600 disabled:opacity-50" />
                  <button type="submit" disabled={isTyping || !input.trim()} className="absolute right-2 p-2 hover:bg-[var(--color-primary-neon)]/20 text-[var(--color-primary-neon)] rounded transition-colors disabled:opacity-50"><Send size={18} /></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}