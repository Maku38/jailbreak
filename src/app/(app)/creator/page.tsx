"use client";

import { useState, useEffect } from "react";
import { motion, Variants} from "framer-motion";
import { PlusSquare, Link as LinkIcon, Shield, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function CreatorPortal() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [points, setPoints] = useState(500);
  const [flagPattern, setFlagPattern] = useState("");
  const [endpointUrl, setEndpointUrl] = useState("");
  const [authToken, setAuthToken] = useState("");

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    setSuccessMsg("");

    // Generate a unique ID (e.g., bty-12345)
    const challengeId = `bty-${Math.floor(Math.random() * 100000)}`;

    const { error } = await supabase.from('challenges').insert({
      id: challengeId,
      title,
      description,
      difficulty,
      points: Number(points),
      flag_pattern: flagPattern,
      is_bounty: true,
      endpoint_url: endpointUrl,
      auth_token: authToken,
      creator_id: user.id
    });

    setIsSubmitting(false);

    if (error) {
      alert("Error creating bounty: " + error.message);
    } else {
      setSuccessMsg(`Target [${challengeId}] successfully deployed to the network.`);
      setTitle(""); setDescription(""); setFlagPattern(""); setEndpointUrl(""); setAuthToken("");
    }
  };

  if (loading) return null;

  if (!user) {
    return (
      <div className="p-8 text-center bg-[var(--color-surface)] border border-white/10 rounded-xl mt-10 max-w-2xl mx-auto">
        <Shield size={48} className="mx-auto text-[var(--color-danger)] mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Restricted Area</h2>
        <p className="text-zinc-400 font-mono">You must be an authenticated operative to register target nodes.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2 flex items-center gap-3">
          <PlusSquare className="text-[var(--color-primary-neon)]" size={32} />
          Deploy Custom Target
        </h1>
        <p className="text-zinc-400 font-mono text-sm">
          Register your custom AI agent endpoint. Let the community attempt to break your security guardrails.
        </p>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-[var(--color-primary-neon)]/10 border border-[var(--color-primary-neon)]/30 rounded-lg flex items-center gap-3 text-[var(--color-primary-neon)] font-mono text-sm">
          <CheckCircle2 size={18} /> {successMsg}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="bg-[var(--color-surface)]/50 border border-white/10 rounded-xl p-6 md:p-8 space-y-6 shadow-2xl backdrop-blur-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Target Title</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Acme Corp Support Bot" className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-primary-neon)]/50 transition-all" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Briefing / Description</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the bot's purpose and what hackers should try to extract..." rows={3} className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-primary-neon)]/50 transition-all resize-none" />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Difficulty Rating</label>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-primary-neon)]/50 appearance-none">
              <option value="Easy">Easy (No strict filters)</option>
              <option value="Medium">Medium (Basic keyword blocks)</option>
              <option value="Hard">Hard (Advanced context filtering)</option>
              <option value="Insane">Insane (LLM-as-a-judge filtering)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Bounty (Points)</label>
            <input type="number" required value={points} onChange={(e) => setPoints(Number(e.target.value))} min="100" max="10000" step="50" className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-primary-neon)]/50 transition-all" />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Win Condition (Flag Pattern)</label>
            <input type="text" required value={flagPattern} onChange={(e) => setFlagPattern(e.target.value)} placeholder="e.g., secret_key_9942 or 'I am bypassed'" className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-primary-neon)]/50 transition-all" />
            <p className="text-xs text-zinc-500 font-mono mt-1 flex items-center gap-1"><AlertCircle size={12}/> Our engine will check if the AI's response contains this string.</p>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <LinkIcon className="text-[var(--color-secondary-cyber)]" size={20} /> Connection Details
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Endpoint URL (POST)</label>
              <input type="url" required value={endpointUrl} onChange={(e) => setEndpointUrl(e.target.value)} placeholder="https://api.yourcompany.com/v1/chat" className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-secondary-cyber)]/50 transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Authorization Header (Bearer Token)</label>
              <input type="password" value={authToken} onChange={(e) => setAuthToken(e.target.value)} placeholder="sk-..." className="w-full bg-black/50 border border-white/10 rounded-md py-3 px-4 text-white font-mono focus:border-[var(--color-secondary-cyber)]/50 transition-all" />
              <p className="text-xs text-zinc-500 font-mono mt-1">This token is stored securely and only used server-side to proxy requests.</p>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-8 py-3 bg-[var(--color-primary-neon)] text-black font-bold rounded-md shadow-[0_0_15px_var(--color-primary-glow)] hover:opacity-90 transition-all disabled:opacity-50">
            {isSubmitting ? "Deploying Target..." : "Initialize Bounty"}
          </button>
        </div>
      </form>
    </div>
  );
}