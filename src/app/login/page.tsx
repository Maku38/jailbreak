"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Lock, Mail, Key, Github, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client"; // <-- The client we just built!

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (isLogin) {
        // --- REAL LOGIN ---
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        router.push("/dashboard");
        router.refresh(); // Refresh to update server components

      } else {
        // --- REAL SIGNUP ---
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username, // This triggers our SQL function to create the profile!
            }
          }
        });
        if (error) throw error;
        
        // Supabase requires email verification by default, but for this CTF let's assume auto-login
        // If email confirmation is ON in your Supabase project, tell them to check their email.
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred during authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden p-4">
      {/* Backgrounds */}
      <div className="absolute inset-0 bg-[image:var(--background-image-matrix-grid)] bg-[length:var(--background-size-grid)] opacity-20 pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[var(--color-primary-glow)] rounded-full blur-[120px] pointer-events-none opacity-30" />

      <Link href="/" className="absolute top-8 left-8 flex items-center gap-2 text-white hover:text-[var(--color-primary-neon)] transition-colors z-20">
        <Terminal size={24} />
        <span className="font-bold tracking-widest">JAILBREAK</span>
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-[var(--color-surface)]/80 backdrop-blur-xl border border-white/10 p-8 rounded-2xl shadow-2xl">
          
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black/50 border border-white/10 rounded-full flex items-center justify-center mx-auto mb-4 shadow-[0_0_15px_rgba(0,255,157,0.2)]">
              <Lock className="text-[var(--color-primary-neon)]" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isLogin ? "System Authentication" : "Operative Initialization"}
            </h1>
            <p className="text-zinc-400 font-mono text-sm mt-2">
              {isLogin ? "Enter credentials to access the terminal." : "Register to begin the exploit."}
            </p>
          </div>

          {/* Error Message Display */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mb-4">
                <div className="p-3 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded text-[var(--color-danger)] text-sm flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAuth} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Hacker Handle</label>
                <div className="relative">
                  <Terminal className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                  <input 
                    type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ZeroDay" 
                    className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-primary-neon)]/50 focus:ring-1 focus:ring-[var(--color-primary-neon)]/50 transition-all" 
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Email Node</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="operative@system.net" 
                  className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-primary-neon)]/50 focus:ring-1 focus:ring-[var(--color-primary-neon)]/50 transition-all" 
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Passphrase</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
                <input 
                  type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" 
                  className="w-full bg-black/50 border border-white/10 rounded-md py-3 pl-10 pr-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-[var(--color-primary-neon)]/50 focus:ring-1 focus:ring-[var(--color-primary-neon)]/50 transition-all" 
                />
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="w-full py-3 mt-4 bg-[var(--color-primary-neon)] text-black font-bold rounded-md hover:bg-[var(--color-primary-neon)]/90 transition-all shadow-[0_0_15px_var(--color-primary-glow)] flex items-center justify-center gap-2 group disabled:opacity-50">
              {isLoading ? "Processing..." : isLogin ? "Establish Connection" : "Initialize Profile"}
              {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-400 mt-6">
            {isLogin ? "No access privileges?" : "Already initialized?"}{" "}
            <button type="button" onClick={() => { setIsLogin(!isLogin); setErrorMsg(null); }} className="text-[var(--color-primary-neon)] hover:underline focus:outline-none font-medium">
              {isLogin ? "Request Access" : "Authenticate Now"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}