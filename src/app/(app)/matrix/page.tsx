"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { Database, ShieldOff, Minus, Search, Filter, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const AVAILABLE_MODELS = ["GPT-NeoX-Secure", "Llama-Guard-Pro", "Claude-Vault-v2", "Titan-Lock-X"];

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const rowVariants: Variants = { hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } };
const rowTransition = { type: "spring" as const, stiffness: 300, damping: 24 };

export default function MatrixPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [challenges, setChallenges] = useState<any[]>([]);
  const [solves, setSolves] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // Fetch all challenges to build the rows
        const { data: challengeData } = await supabase.from('challenges').select('*').order('id');
        setChallenges(challengeData || []);

        // Fetch user's actual successful hacks
        const { data: solveData } = await supabase.from('solves').select('challenge_id, model_used').eq('user_id', authUser.id);
        setSolves(solveData || []);
      }
      setLoading(false);
    }
    
    fetchData();
  }, []);

  if (loading) return <div className="p-8 font-mono text-[var(--color-secondary-cyber)] animate-pulse">Scanning vulnerability logs...</div>;

  // --- GUEST STATE ---
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto mt-20 text-center space-y-6 bg-[var(--color-surface)]/80 border border-white/10 p-12 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="w-20 h-20 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,0,85,0.2)]">
          <Lock className="text-[var(--color-danger)]" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Matrix Access Denied</h1>
        <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto">
          You must be authenticated to view your personal vulnerability cross-reference grid.
        </p>
        <div className="pt-6">
          <Link href="/login" className="px-8 py-3 bg-[var(--color-primary-neon)] text-black font-bold rounded-md shadow-[0_0_15px_var(--color-primary-glow)] hover:opacity-90 transition-all">
            Initialize Connection
          </Link>
        </div>
      </div>
    );
  }

  // Helper to check if a specific cell was breached
  const isBreached = (challengeId: string, model: string) => {
    return solves.some(solve => solve.challenge_id === challengeId && solve.model_used === model);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Database className="text-[var(--color-secondary-cyber)]" size={32} />
            Vulnerability Matrix
          </h1>
          <p className="text-zinc-400 font-mono text-sm">
            Live cross-reference of your successful exploits against target models.
          </p>
        </div>
      </div>

      {/* The Matrix Table Container */}
      <div className="bg-[var(--color-surface)]/80 backdrop-blur-sm border border-white/10 rounded-xl overflow-x-auto shadow-2xl">
        <div className="min-w-[800px]">
          
          {/* Table Header (Models) */}
          <div className="grid grid-cols-5 border-b border-white/10 bg-black/60">
            <div className="p-4 flex items-end justify-start font-mono text-xs text-zinc-500 uppercase tracking-widest border-r border-white/10">
              Target Level \ Model
            </div>
            {AVAILABLE_MODELS.map(model => (
              <div key={model} className="p-4 flex items-center justify-center text-center border-r border-white/10 last:border-0">
                <span className="font-bold text-zinc-200 truncate">{model}</span>
              </div>
            ))}
          </div>

          {/* Table Body (Challenges) */}
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
            {challenges.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 font-mono text-sm">No target data found in the database.</div>
            ) : (
              challenges.map((challenge) => (
                <motion.div key={challenge.id} variants={rowVariants} transition={rowTransition} className="grid grid-cols-5 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0">
                  {/* Challenge Name Column */}
                  <div className="p-4 border-r border-white/10 flex items-center bg-black/20">
                    <span className="font-mono font-medium text-white text-sm truncate">{challenge.title}</span>
                  </div>

                  {/* Status Cells */}
                  {AVAILABLE_MODELS.map(model => {
                    const breached = isBreached(challenge.id, model);
                    return (
                      <div key={`${challenge.id}-${model}`} className="p-4 border-r border-white/10 last:border-0 flex items-center justify-center">
                        {breached ? (
                          <div className="flex items-center gap-2 px-3 py-1 bg-[var(--color-primary-neon)]/10 border border-[var(--color-primary-neon)]/30 rounded text-[var(--color-primary-neon)] font-mono text-xs font-bold uppercase shadow-[0_0_10px_rgba(0,255,157,0.1)]">
                            <ShieldOff size={14} /> Breached
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-zinc-600 font-mono text-xs uppercase">
                            <Minus size={14} /> Untested
                          </div>
                        )}
                      </div>
                    );
                  })}
                </motion.div>
              ))
            )}
          </motion.div>
          
        </div>
      </div>
    </div>
  );
}