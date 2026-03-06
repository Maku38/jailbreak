"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User as UserIcon, Activity, Shield, Terminal, Zap, Crosshair, Cpu, Clock, Lock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import type { User as SupabaseUser } from "@supabase/supabase-js";

// Mock Data for Skills & Logs (We will connect these to real tables later)
const skills = [
  { name: "Prompt Injection", value: 98, color: "bg-[var(--color-primary-neon)]" },
  { name: "Context Bypassing", value: 85, color: "bg-[var(--color-secondary-cyber)]" },
  { name: "Payload Obfuscation", value: 72, color: "bg-blue-500" },
  { name: "Logic Manipulation", value: 88, color: "bg-yellow-500" },
];

const activityLog = [
  { id: 1, action: "System Breached", target: "GPT-NeoX-Secure", time: "2 hours ago", status: "success", points: "+500" },
  { id: 2, action: "Exploit Failed", target: "Claude-Vault-v2", time: "5 hours ago", status: "failed", points: "0" },
];

const containerVariants: any = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants: any = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function loadProfile() {
      // 1. Get the authenticated user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      setUser(authUser);

      if (authUser) {
        // 2. Fetch their real stats from the profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        setProfileData(profile);
      }
      setLoading(false);
    }
    
    loadProfile();
  }, []);

  if (loading) return <div className="p-8 font-mono text-[var(--color-primary-neon)] animate-pulse">Decrypting dossier...</div>;

  // --- GUEST STATE ---
  if (!user) {
    return (
      <div className="max-w-3xl mx-auto mt-20 text-center space-y-6 bg-[var(--color-surface)]/80 border border-white/10 p-12 rounded-2xl shadow-2xl backdrop-blur-sm">
        <div className="w-20 h-20 bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,0,85,0.2)]">
          <Lock className="text-[var(--color-danger)]" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-white tracking-widest uppercase">Guest Entity Detected</h1>
        <p className="text-zinc-400 font-mono text-sm max-w-md mx-auto">
          Dossier access restricted. You must initialize an operative profile or authenticate an existing session to view combat statistics.
        </p>
        <div className="pt-6">
          <Link href="/login" className="px-8 py-3 bg-[var(--color-primary-neon)] text-black font-bold rounded-md shadow-[0_0_15px_var(--color-primary-glow)] hover:opacity-90 transition-all">
            Initialize Connection
          </Link>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats based on real data
  const xp = profileData?.points || 0;
  // Simple leveling math: every 1000 points is a level
  const currentLevel = Math.floor(xp / 1000) + 1;
  const nextLevelXp = currentLevel * 1000;
  const xpPercentage = Math.min((xp / nextLevelXp) * 100, 100);
  const displayUsername = profileData?.username || user.email?.split('@')[0] || "Unknown Hacker";

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <UserIcon className="text-[var(--color-primary-neon)]" size={32} />
            Operative Dossier
          </h1>
          <p className="text-zinc-400 font-mono text-sm">Classified hacker statistics and recent activity logs.</p>
        </div>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: ID Card & Overall Stats */}
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-xl p-6 relative overflow-hidden group shadow-lg">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Shield size={100} />
            </div>
            
            <div className="flex items-center gap-6 relative z-10">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--color-primary-neon)] to-[var(--color-secondary-cyber)] p-1 shadow-[0_0_20px_rgba(0,255,157,0.3)]">
                <div className="w-full h-full bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <span className="text-3xl font-black text-white tracking-tighter">{displayUsername.substring(0, 2).toUpperCase()}</span>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight break-all">{displayUsername}</h2>
                <p className="text-[var(--color-primary-neon)] font-mono text-sm mb-2">Operative</p>
                <div className="inline-flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded text-xs font-mono text-zinc-300">
                  <Activity size={12} className="text-zinc-500" /> Active Session
                </div>
              </div>
            </div>

            <div className="mt-8 relative z-10">
              <div className="flex justify-between items-end mb-2 font-mono text-sm">
                <span className="text-white font-bold">Level {currentLevel}</span>
                <span className="text-zinc-500">{xp.toLocaleString()} / {nextLevelXp.toLocaleString()} XP</span>
              </div>
              <div className="w-full bg-black/50 h-3 rounded-full overflow-hidden border border-white/5">
                <motion.div initial={{ width: 0 }} animate={{ width: `${xpPercentage}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-gradient-to-r from-[var(--color-secondary-cyber)] to-[var(--color-primary-neon)] relative">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[slide_1s_linear_infinite]" />
                </motion.div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Zap className="text-[var(--color-primary-neon)] mb-2" size={24} />
              <span className="text-2xl font-bold text-white">{profileData?.global_rank ? `#${profileData.global_rank}` : "Unranked"}</span>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">Global Rank</span>
            </div>
            <div className="bg-black/40 border border-white/5 rounded-xl p-4 flex flex-col items-center justify-center text-center">
              <Crosshair className="text-[var(--color-danger)] mb-2" size={24} />
              <span className="text-2xl font-bold text-white">{xp > 0 ? "100%" : "0%"}</span>
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">Win Rate</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Skills & Activity Log */}
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-surface)] border border-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Cpu className="text-zinc-400" size={20} />
              Attack Vectors
            </h3>
            <div className="space-y-5">
              {skills.map((skill, index) => (
                <div key={index}>
                  <div className="flex justify-between items-end mb-1 font-mono text-xs">
                    <span className="text-zinc-300">{skill.name}</span>
                    <span className="text-zinc-500">{skill.value}%</span>
                  </div>
                  <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${skill.value}%` }} transition={{ duration: 1, delay: index * 0.1 }} className={`h-full ${skill.color} shadow-[0_0_10px_currentColor] opacity-80`} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-black/60 border border-white/10 rounded-xl overflow-hidden shadow-lg font-mono">
            <div className="px-6 py-3 border-b border-white/5 bg-white/5 flex items-center gap-2 text-xs text-zinc-400 uppercase tracking-widest">
              <Clock size={14} /> System Access Logs
            </div>
            <div className="p-6 space-y-4">
              {activityLog.map((log) => (
                <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-l-2 pl-4 py-1 transition-colors hover:bg-white/5" style={{ borderLeftColor: log.status === 'success' ? 'var(--color-primary-neon)' : log.status === 'failed' ? 'var(--color-danger)' : 'var(--color-secondary-cyber)' }}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold text-sm ${log.status === 'success' ? 'text-[var(--color-primary-neon)]' : 'text-[var(--color-danger)]'}`}>[{log.action.toUpperCase()}]</span>
                      <span className="text-zinc-300 text-sm">{log.target}</span>
                    </div>
                    <div className="text-xs text-zinc-600 mt-1">{log.time}</div>
                  </div>
                  <div className={`text-sm font-bold ${log.points !== "0" ? 'text-white' : 'text-zinc-600'}`}>{log.points} PTS</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}