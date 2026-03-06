"use client";

import { useParams } from "next/navigation";
import { motion} from "framer-motion";
import { User, Activity, Shield, Cpu, Target, ShieldAlert, Award } from "lucide-react";

export default function PublicProfilePage() {
  const params = useParams();
  const username = params.username as string;

  // Mock data for the viewed user
  const profile = {
    username: decodeURIComponent(username),
    title: "Elite Exploit Engineer",
    level: 88,
    rank: 3,
    winRate: 94,
    recentBadges: ["Model Breaker", "Ghost In The Logs", "Context Manipulator"]
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <User className="text-[var(--color-secondary-cyber)]" size={32} />
            Public Dossier: {profile.username}
          </h1>
          <p className="text-zinc-400 font-mono text-sm">Viewing public records and exploit history.</p>
        </div>
        <div className="px-4 py-2 bg-[var(--color-primary-neon)]/10 border border-[var(--color-primary-neon)]/20 rounded-lg text-sm font-mono text-[var(--color-primary-neon)]">
          Global Rank: #{profile.rank}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-[var(--color-surface)] border border-white/10 rounded-xl p-6 shadow-lg md:col-span-1">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 p-1 mb-4 shadow-[0_0_20px_rgba(250,204,21,0.2)]">
            <div className="w-full h-full bg-black/60 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-3xl font-black text-white tracking-tighter">{profile.username.substring(0, 2).toUpperCase()}</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">{profile.username}</h2>
          <p className="text-[var(--color-primary-neon)] font-mono text-sm mb-6">{profile.title}</p>
          
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-500">Threat Level</span>
              <span className="text-white font-bold">{profile.level}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <span className="text-zinc-500">Success Rate</span>
              <span className="text-[var(--color-danger)] font-bold">{profile.winRate}%</span>
            </div>
          </div>
        </motion.div>

        {/* Public Badges & Activity */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="md:col-span-2 space-y-6">
          <div className="bg-black/40 border border-white/10 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-yellow-400" size={20} />
              Verified Exploits (Badges)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.recentBadges.map((badge, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg">
                  <ShieldAlert className="text-[var(--color-primary-neon)]" size={18} />
                  <span className="font-mono text-sm text-zinc-300">{badge}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}