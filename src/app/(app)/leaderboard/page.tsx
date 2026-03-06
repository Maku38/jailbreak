"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = { hidden: { opacity: 0, scale: 0.95, y: 10 }, show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } } };

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState<number | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchLeaderboard() {
      // 1. Get the current logged-in user
      const { data: { user } } = await supabase.auth.getUser();

      // 2. Fetch all profiles, sorted by highest points first
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, username, points')
        .order('points', { ascending: false })
        .limit(100); // Top 100 hackers

      if (error) {
        console.error("Error fetching leaderboard:", error);
        setLoading(false);
        return;
      }

      // 3. Format the data for our UI
      let myRank = null;
      const formattedPlayers = (profiles || []).map((p, index) => {
        const rank = index + 1;
        const isCurrentUser = user ? p.id === user.id : false;
        
        if (isCurrentUser) myRank = rank;

        return {
          rank,
          id: p.id,
          username: p.username || "Unknown Hacker",
          level: Math.floor((p.points || 0) / 1000) + 1, // 1 level per 1000 pts
          points: p.points || 0,
          isCurrentUser,
        };
      });

      setPlayers(formattedPlayers);
      setCurrentUserRank(myRank);
      setLoading(false);
    }

    fetchLeaderboard();

    // Optional: Subscribe to real-time changes
    const channel = supabase.channel('public:profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchLeaderboard(); // Refetch if someone scores points!
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return <div className="p-8 font-mono text-[var(--color-secondary-cyber)] animate-pulse flex justify-center mt-20">Fetching global ranks...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
            <Trophy className="text-[var(--color-secondary-cyber)]" size={32} />
            Global Hall of Fame
          </h1>
          <p className="text-zinc-400 font-mono text-sm">
            Top prompt engineers and AI exploiters worldwide. Ranks update in real-time.
          </p>
        </div>
        
        <div className="flex gap-4 font-mono text-sm">
          <Card className="px-4 py-2 bg-black/40 border-white/5 flex flex-col items-center justify-center">
            <span className="text-zinc-500">Your Rank</span>
            <span className="text-[var(--color-primary-neon)] font-bold text-lg">
              {currentUserRank ? `#${currentUserRank}` : "N/A"}
            </span>
          </Card>
          <Card className="px-4 py-2 bg-black/40 border-white/5 flex flex-col items-center justify-center">
            <span className="text-zinc-500">Percentile</span>
            <span className="text-white font-bold text-lg">
              {currentUserRank ? `Top ${Math.max(1, Math.round((currentUserRank / Math.max(players.length, 1)) * 100))}%` : "-"}
            </span>
          </Card>
        </div>
      </div>

      {/* Leaderboard Table Container */}
      <Card className="bg-[var(--color-surface)]/50 border border-white/10 backdrop-blur-sm overflow-hidden shadow-2xl">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 bg-black/60 text-xs font-mono text-zinc-500 uppercase font-bold tracking-wider">
          <div className="col-span-2 md:col-span-1 text-center">Rank</div>
          <div className="col-span-6 md:col-span-5">Hacker</div>
          <div className="col-span-2 hidden md:block text-center">Level</div>
          <div className="col-span-4 md:col-span-4 text-right">Reputation (PTS)</div>
        </div>

        {/* Table Body (Animated) */}
        {players.length === 0 ? (
           <div className="p-8 text-center text-zinc-500 font-mono">No operatives found in the database.</div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="show" className="flex flex-col">
            {players.map((player) => {
              const isTop3 = player.rank <= 3;
              const isFirst = player.rank === 1;
              const isSecond = player.rank === 2;
              const isThird = player.rank === 3;
              
              return (
                <motion.div 
                  key={player.id}
                  variants={itemVariants}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-white/5 transition-colors ${
                    player.isCurrentUser 
                      ? "bg-[var(--color-primary-neon)]/10 border-l-4 border-l-[var(--color-primary-neon)]" 
                      : "hover:bg-white/5 border-l-4 border-l-transparent"
                  }`}
                >
                  {/* Rank Column */}
                  <div className="col-span-2 md:col-span-1 flex justify-center items-center font-mono font-bold">
                    {isFirst ? <Crown className="text-yellow-400 animate-pulse" size={20} /> :
                     isSecond ? <Medal className="text-zinc-300" size={20} /> :
                     isThird ? <Medal className="text-amber-600" size={20} /> :
                     <span className={player.isCurrentUser ? "text-[var(--color-primary-neon)]" : "text-zinc-500"}>
                       #{player.rank}
                     </span>}
                  </div>

                  {/* Hacker Profile Column */}
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3">
                    <Link href={`/hacker/${player.username}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity w-full cursor-pointer">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-lg ${
                        isTop3 
                          ? "bg-gradient-to-br from-yellow-400/20 to-orange-500/20 border border-yellow-400/50 text-yellow-400" 
                          : player.isCurrentUser
                            ? "bg-[var(--color-primary-neon)]/20 border border-[var(--color-primary-neon)]/50 text-[var(--color-primary-neon)]"
                            : "bg-white/5 border border-white/10 text-zinc-300"
                      }`}>
                        {player.username.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-semibold hover:underline decoration-[var(--color-primary-neon)] decoration-2 underline-offset-4 ${
                          isFirst ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" : 
                          player.isCurrentUser ? "text-[var(--color-primary-neon)]" : "text-zinc-200"
                        }`}>
                          {player.username}
                          {player.isCurrentUser && <span className="ml-2 text-xs opacity-60 no-underline">(You)</span>}
                        </span>
                      </div>
                    </Link>
                  </div>

                  {/* Level Column */}
                  <div className="col-span-2 hidden md:flex justify-center">
                    <Badge variant="outline" className={`font-mono text-xs ${
                      isTop3 ? "border-yellow-400/30 text-yellow-400/80" : "border-white/10 text-zinc-400"
                    }`}>
                      Lvl {player.level}
                    </Badge>
                  </div>

                  {/* Points Column */}
                  <div className="col-span-4 md:col-span-4 flex justify-end font-mono">
                    <span className={`font-bold ${
                      isFirst ? "text-yellow-400" :
                      player.isCurrentUser ? "text-[var(--color-primary-neon)]" : "text-zinc-300"
                    }`}>
                      {player.points.toLocaleString()}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Card>
      
      {/* Subtle indicator for live connection */}
      <div className="flex justify-center pt-4 items-center gap-2 text-xs font-mono text-zinc-600">
         <div className="w-2 h-2 rounded-full bg-[var(--color-primary-neon)] animate-pulse" /> Live Database Connection Active
      </div>
    </div>
  );
}