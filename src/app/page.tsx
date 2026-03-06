"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Terminal, Trophy, ChevronDown, Database, ShieldOff, Lock } from "lucide-react";

export default function LandingPage() {
  const globalMatrix = [
    { target: "GPT-NeoX-Secure", breached: "84%", status: "COMPROMISED", color: "text-[var(--color-danger)]" },
    { target: "Llama-Guard-Pro", breached: "62%", status: "VULNERABLE", color: "text-yellow-400" },
    { target: "Claude-Vault-v2", breached: "12%", status: "RESILIENT", color: "text-[var(--color-primary-neon)]" },
    { target: "Titan-Lock-X", breached: "0.5%", status: "SECURE", color: "text-blue-400" },
  ];

  return (
    <div className="relative min-h-screen bg-background flex flex-col items-center overflow-x-hidden">
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-[image:var(--background-image-matrix-grid)] bg-[length:var(--background-size-grid)] opacity-20 pointer-events-none" />
      <div className="fixed top-1/4 left-1/2 -translate-x-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[var(--color-primary-glow)] rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <div className="min-h-screen flex flex-col items-center justify-center relative w-full pt-20">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="z-10 text-center space-y-8 max-w-4xl px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-surface)] border border-white/10 text-[var(--color-primary-neon)] text-sm font-mono mb-4 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[var(--color-primary-neon)] animate-pulse" />
            Global CTF Live
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-zinc-300 to-[var(--color-primary-neon)] pb-2">
            Can You Break <br /> The Model?
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            The ultimate competitive LLM security platform. Manipulate contexts, bypass safety filters, and extract restricted data to climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link href="/dashboard" className="w-full sm:w-auto px-8 py-4 rounded-md bg-[var(--color-primary-neon)] text-black font-bold text-lg hover:opacity-90 transition-all shadow-[0_0_20px_var(--color-primary-glow)] flex items-center justify-center gap-2">
              <Terminal size={20} /> Start Hacking
            </Link>
            <Link href="/leaderboard" className="w-full sm:w-auto px-8 py-4 rounded-md bg-[var(--color-surface)] border border-white/10 text-white font-semibold text-lg hover:bg-white/5 transition-all flex items-center justify-center gap-2">
              <Trophy size={20} className="text-[var(--color-secondary-cyber)]" /> View Leaderboard
            </Link>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center text-zinc-500 animate-bounce">
          <span className="text-xs font-mono uppercase tracking-widest mb-2">Global Intel</span>
          <ChevronDown size={24} />
        </motion.div>
      </div>

      {/* Global Matrix Section */}
      <div className="w-full max-w-5xl mx-auto px-6 py-32 z-10 relative">
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 text-center md:text-left">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-3">
                <Database className="text-[var(--color-secondary-cyber)]" size={36} />
                Global Threat Matrix
              </h2>
              <p className="text-zinc-400 max-w-lg">Live statistics of AI models compromised by the Jailbreak community. No system is perfectly secure.</p>
            </div>
            <div className="mt-6 md:mt-0 flex gap-4 font-mono text-sm">
              <div className="px-4 py-2 bg-black/40 border border-white/10 rounded text-center">
                <div className="text-zinc-500 mb-1">Total Exploits</div>
                <div className="text-[var(--color-primary-neon)] font-bold text-xl">1.4M+</div>
              </div>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-3 bg-black/60 p-4 border-b border-white/10 text-xs font-mono uppercase text-zinc-500 tracking-wider font-bold">
              <div>Target Model</div>
              <div className="text-center">Global Breach Rate</div>
              <div className="text-right">System Integrity</div>
            </div>
            
            <div className="divide-y divide-white/5">
              {globalMatrix.map((item, idx) => (
                <div key={idx} className="grid grid-cols-3 p-6 items-center hover:bg-white/5 transition-colors group">
                  <div className="font-mono text-white font-medium flex items-center gap-3">
                    {item.status === "SECURE" ? <Lock className="text-blue-400" size={18} /> : <ShieldOff className="text-[var(--color-danger)] group-hover:animate-pulse" size={18} />}
                    {item.target}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-white font-mono font-bold">{item.breached}</span>
                    <div className="w-full max-w-[200px] h-1.5 bg-black/50 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-400 rounded-full" style={{ width: item.breached, backgroundColor: item.status === "COMPROMISED" ? 'var(--color-danger)' : item.status === "SECURE" ? '#60a5fa' : 'var(--color-primary-neon)' }} />
                    </div>
                  </div>

                  <div className={`text-right font-mono font-bold tracking-widest text-sm ${item.color}`}>
                    [{item.status}]
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}