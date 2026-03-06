"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Terminal, Lock, Unlock, ShieldAlert, Cpu, ChevronRight, Zap, Briefcase } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

const difficultyConfig: Record<string, { color: string; requiredPts: number }> = {
  "Easy": { color: "text-[var(--color-primary-neon)] border-[var(--color-primary-neon)] bg-[var(--color-primary-neon)]/10", requiredPts: 0 },
  "Medium": { color: "text-blue-400 border-blue-400 bg-blue-400/10", requiredPts: 100 },
  "Hard": { color: "text-yellow-400 border-yellow-400 bg-yellow-400/10", requiredPts: 350 },
  "Insane": { color: "text-[var(--color-danger)] border-[var(--color-danger)] bg-[var(--color-danger)]/10", requiredPts: 850 },
};

export default function DashboardPage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userPoints, setUserPoints] = useState(0);
  const [coreMissions, setCoreMissions] = useState<any[]>([]);
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadDashboard() {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        const { data: profile } = await supabase.from('profiles').select('points').eq('id', authUser.id).single();
        setUserPoints(profile?.points || 0);
      }

      // Fetch all challenges
      const { data: challengeData } = await supabase.from('challenges').select('*').order('id');
      
      if (challengeData) {
        // Split them into Core Missions and Bounties
        setCoreMissions(challengeData.filter(c => !c.is_bounty));
        setBounties(challengeData.filter(c => c.is_bounty));
      }
      
      setLoading(false);
    }
    
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 font-mono text-[var(--color-primary-neon)] animate-pulse">Establishing secure connection to command center...</div>;

  // Reusable component for the Challenge Cards
  const TargetCard = ({ challenge, isBounty = false }: { challenge: any, isBounty?: boolean }) => {
    const config = difficultyConfig[challenge.difficulty] || difficultyConfig["Easy"];
    const isLocked = !isBounty && userPoints < config.requiredPts; // Bounties are never level-locked!

    return (
      <motion.div variants={itemVariants} className="group relative h-full">
        <div className={`relative h-full flex flex-col p-6 rounded-xl border transition-all duration-300 overflow-hidden ${
          isLocked 
            ? "bg-black/60 border-white/5 opacity-75 grayscale-[50%]" 
            : isBounty 
              ? "bg-[var(--color-surface)] border-yellow-500/30 hover:border-yellow-400/60 hover:shadow-[0_0_30px_rgba(250,204,21,0.1)] hover:-translate-y-1"
              : "bg-[var(--color-surface)] border-white/10 hover:border-[var(--color-primary-neon)]/50 hover:shadow-[0_0_30px_rgba(0,255,157,0.1)] hover:-translate-y-1"
        }`}>
          
          {!isLocked && (
            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-[60px] opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none ${isBounty ? 'bg-yellow-500' : 'bg-[var(--color-primary-glow)]'}`} />
          )}

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isLocked ? 'bg-white/5 text-zinc-500' : isBounty ? 'bg-yellow-500/10 text-yellow-400' : 'bg-[var(--color-primary-neon)]/10 text-[var(--color-primary-neon)]'}`}>
                {isBounty ? <Briefcase size={24} /> : <Cpu size={24} />}
              </div>
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  {challenge.title}
                  {isBounty && <span className="px-2 py-0.5 bg-yellow-400/20 border border-yellow-400/50 text-yellow-400 text-[10px] uppercase font-mono rounded">Bounty</span>}
                </h3>
                <div className="text-xs font-mono text-zinc-500 mt-1 uppercase tracking-widest">ID: {challenge.id}</div>
              </div>
            </div>
            {isLocked ? (
              <div className="p-2 bg-black/50 border border-white/5 rounded-md text-zinc-600"><Lock size={18} /></div>
            ) : (
              <div className={`p-2 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.1)] ${isBounty ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500' : 'bg-[var(--color-primary-neon)]/10 border border-[var(--color-primary-neon)]/20 text-[var(--color-primary-neon)]'}`}>
                <Unlock size={18} />
              </div>
            )}
          </div>

          <div className="flex-1 relative z-10 mb-6">
            <p className="text-zinc-400 text-sm leading-relaxed min-h-[40px]">{challenge.description}</p>
          </div>

          <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between relative z-10">
            <div className="flex gap-2">
              <span className={`px-2 py-1 text-xs font-mono border rounded ${config.color}`}>{challenge.difficulty}</span>
              <span className={`px-2 py-1 text-xs font-mono border rounded ${isBounty ? 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-bold' : 'border-white/10 bg-white/5 text-zinc-300'}`}>
                {challenge.points} PTS
              </span>
            </div>

            {isLocked ? (
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--color-danger)] font-bold uppercase">
                <ShieldAlert size={14} /> Requires {config.requiredPts} PTS
              </div>
            ) : !user ? (
              <Link href="/login" className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded text-sm text-zinc-300 hover:text-white hover:bg-white/10 transition-colors font-mono">
                Login Required
              </Link>
            ) : (
              <Link href={`/challenges/${challenge.id}`} className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-bold transition-all group/btn ${isBounty ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]' : 'bg-[var(--color-primary-neon)] text-black hover:bg-[var(--color-primary-neon)]/90 shadow-[0_0_15px_var(--color-primary-glow)]'}`}>
                Initiate Hack
                <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Terminal className="text-[var(--color-primary-neon)]" size={32} />
            Command Center
          </h1>
          <p className="text-zinc-400 font-mono text-sm">Select a target system. Bypass safety filters to extract the restricted flags.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-black/40 border border-white/5 rounded-xl p-3">
          <div className="px-4 border-r border-white/10">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Operative Status</div>
            <div className="text-sm font-bold text-white flex items-center gap-2">
              <Zap size={14} className="text-[var(--color-secondary-cyber)]" />
              {user ? "AUTHENTICATED" : "GUEST (OFFLINE)"}
            </div>
          </div>
          <div className="px-4">
            <div className="text-xs font-mono text-zinc-500 uppercase tracking-wider mb-1">Reputation</div>
            <div className="text-sm font-bold text-[var(--color-primary-neon)] font-mono">{userPoints.toLocaleString()} PTS</div>
          </div>
        </div>
      </div>

      {/* Official Missions Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-mono uppercase tracking-widest border-l-4 border-[var(--color-primary-neon)] pl-3">
          Official Training Simulations
        </h2>
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coreMissions.map((challenge) => (
            <TargetCard key={challenge.id} challenge={challenge} />
          ))}
        </motion.div>
      </div>

      {/* Live Bounties Section */}
      {bounties.length > 0 && (
        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-mono uppercase tracking-widest border-l-4 border-yellow-500 pl-3">
              Live Corporate Bounties
            </h2>
            <Link href="/creator" className="text-sm font-mono text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              + Deploy Target
            </Link>
          </div>
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bounties.map((bounty) => (
              <TargetCard key={bounty.id} challenge={bounty} isBounty={true} />
            ))}
          </motion.div>
        </div>
      )}

    </div>
  );
}