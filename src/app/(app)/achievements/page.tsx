"use client";

import { useEffect, useState } from "react";
import { motion, type Variants } from "framer-motion";
import { ShieldAlert, Zap, Target, Unlock, Lock, Award, TerminalSquare, Skull } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const containerVariants: Variants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants: Variants = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0 } };
const itemTransition = { type: "spring" as const, stiffness: 300, damping: 24 };

export default function AchievementsPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Real stats
  const [totalSolves, setTotalSolves] = useState(0);
  const [uniqueModels, setUniqueModels] = useState(0);
  const [hasVaultSolve, setHasVaultSolve] = useState(false);
  const [userRank, setUserRank] = useState(999);

  const supabase = createClient();

  useEffect(() => {
    async function loadStats() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // 1. Fetch Solves
        const { data: solves } = await supabase.from('solves').select('*').eq('user_id', authUser.id);
        
        if (solves) {
          setTotalSolves(solves.length);
          // Calculate unique models compromised
          const models = new Set(solves.map(s => s.model_used));
          setUniqueModels(models.size);
          // Check if they beat the Insane level
          setHasVaultSolve(solves.some(s => s.challenge_id === 'c-04'));
        }

        // 2. Fetch User Profile to calculate Rank
        const { data: profile } = await supabase.from('profiles').select('points').eq('id', authUser.id).single();
        if (profile) {
          // Count how many people have MORE points to determine exact rank
          const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).gt('points', profile.points);
          setUserRank((count || 0) + 1);
        }
      }
      setLoading(false);
    }
    
    loadStats();
  }, []);

  // --- DYNAMIC ACHIEVEMENTS ENGINE ---
  const achievements = [
    { id: 1, title: "First Blood", desc: "Successfully execute your first exploit.", icon: Zap, unlocked: totalSolves >= 1, rarity: "Common" },
    { id: 2, title: "Context Manipulator", desc: "Execute 2 successful exploits.", icon: Target, unlocked: totalSolves >= 2, rarity: "Rare" },
    { id: 3, title: "Ghost In The Logs", desc: "Execute 5 successful exploits.", icon: TerminalSquare, unlocked: totalSolves >= 5, progress: totalSolves, max: 5, rarity: "Epic" },
    { id: 4, title: "Model Breaker", desc: "Successfully compromise 3 different models.", icon: Unlock, unlocked: uniqueModels >= 3, progress: uniqueModels, max: 3, rarity: "Epic" },
    { id: 5, title: "The Vault Cracker", desc: "Defeat 'The Vault' (Level 4) on any model.", icon: Skull, unlocked: hasVaultSolve, progress: hasVaultSolve ? 1 : 0, max: 1, rarity: "Legendary" },
    { id: 6, title: "Grandmaster", desc: "Reach the Top 10 on the Global Leaderboard.", icon: Award, unlocked: userRank <= 10, progress: userRank, max: 10, isReverseProgress: true, rarity: "Mythic" },
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercentage = Math.round((unlockedCount / totalCount) * 100);

  if (loading) return <div className="p-8 text-[var(--color-primary-neon)] font-mono animate-pulse">Syncing logs...</div>;

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 pb-10">
        <div className="p-6 bg-[var(--color-surface)] border border-white/10 rounded-xl flex items-center justify-between shadow-xl">
           <div>
             <h2 className="text-xl font-bold text-white flex items-center gap-2">
               <ShieldAlert className="text-[var(--color-danger)]" size={24} /> Sync Offline
             </h2>
             <p className="text-zinc-400 font-mono text-sm mt-1">Authenticate to track your exploit records.</p>
           </div>
           <Link href="/login" className="px-6 py-2 bg-[var(--color-primary-neon)] text-black font-bold transition-all rounded">Authenticate</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <ShieldAlert className="text-[var(--color-primary-neon)]" size={32} />
            Hacker Badges
          </h1>
          <p className="text-zinc-400 font-mono text-sm">Real-time telemetry evaluating your system exploits.</p>
        </div>
        
        <div className="bg-black/40 border border-white/5 rounded-xl p-4 min-w-[250px]">
          <div className="flex justify-between items-end mb-2">
            <span className="text-zinc-400 font-mono text-xs uppercase tracking-wider">Completion</span>
            <span className="text-[var(--color-primary-neon)] font-bold font-mono">{unlockedCount} / {totalCount}</span>
          </div>
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
            <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercentage}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-[var(--color-primary-neon)] shadow-[0_0_10px_var(--color-primary-glow)]" />
          </div>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((badge) => {
          const Icon = badge.icon;
          const isUnlocked = badge.unlocked;
          
          return (
            <motion.div key={badge.id} variants={itemVariants} transition={itemTransition}>
              <div className={`relative h-full p-6 rounded-xl border transition-all duration-300 overflow-hidden ${isUnlocked ? "bg-[var(--color-surface)] border-[var(--color-primary-neon)]/30 shadow-[0_4px_20px_rgba(0,255,157,0.05)]" : "bg-black/40 border-white/5 opacity-70 grayscale-[50%]"}`}>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className={`p-3 rounded-lg ${isUnlocked ? "bg-[var(--color-primary-neon)]/10 text-[var(--color-primary-neon)]" : "bg-white/5 text-zinc-500"}`}>
                    <Icon size={24} className={isUnlocked ? "drop-shadow-[0_0_8px_rgba(0,255,157,0.5)]" : ""} />
                  </div>
                  {isUnlocked ? <span className="text-[10px] font-mono text-[var(--color-primary-neon)] uppercase tracking-wider bg-[var(--color-primary-neon)]/10 px-2 py-1 rounded border border-[var(--color-primary-neon)]/20">Unlocked</span> : <Lock size={16} className="text-zinc-600" />}
                </div>
                <div className="relative z-10">
                  <h3 className={`font-bold text-lg mb-1 ${isUnlocked ? "text-white" : "text-zinc-400"}`}>{badge.title}</h3>
                  <p className="text-sm text-zinc-500 min-h-[40px] leading-relaxed">{badge.desc}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 relative z-10">
                  {isUnlocked ? (
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className={`px-2 py-1 rounded border ${badge.rarity === 'Legendary' ? 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10' : badge.rarity === 'Epic' ? 'text-[var(--color-secondary-cyber)] border-[var(--color-secondary-cyber)]/30 bg-[var(--color-secondary-cyber)]/10' : badge.rarity === 'Rare' ? 'text-blue-400 border-blue-400/30 bg-blue-400/10' : 'text-zinc-400 border-white/10 bg-white/5'}`}>{badge.rarity}</span>
                      <span className="text-[var(--color-primary-neon)]">VERIFIED</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-zinc-500">
                        <span>Progress</span>
                        <span>{badge.isReverseProgress ? `Rank #${badge.progress}` : `${Math.min(badge.progress || 0, badge.max || 1)} / ${badge.max}`}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-600 rounded-full" style={{ width: badge.isReverseProgress ? `${Math.min(100, Math.max(5, (1000 - (badge.progress || 999)) / 10))}%` : `${((badge.progress || 0) / (badge.max || 1)) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}