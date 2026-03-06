"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal, Trophy, ShieldAlert, User, Database, PlusSquare, Menu, X } from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Terminal },
  { name: "Model Matrix", href: "/matrix", icon: Database },
  { name: "Leaderboard", href: "/leaderboard", icon: Trophy },
  { name: "Achievements", href: "/achievements", icon: ShieldAlert },
  { name: "Creator Portal", href: "/creator", icon: PlusSquare },
  { name: "Profile", href: "/profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Auto-close the mobile menu when the user navigates to a new page
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/10 bg-[var(--color-surface)]/50 backdrop-blur-md z-10">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-3 text-[var(--color-primary-neon)] font-bold tracking-widest font-mono text-xl hover:opacity-80 transition-opacity">
            <Terminal size={24} />
            <span>JAILBREAK</span>
          </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-mono text-sm ${isActive ? "bg-[var(--color-primary-neon)]/10 text-[var(--color-primary-neon)] border border-[var(--color-primary-neon)]/30 shadow-[0_0_15px_rgba(0,255,157,0.1)]" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
                <Icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* --- MOBILE OVERLAY MENU --- */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
             <div className="flex items-center gap-2 text-[var(--color-primary-neon)] font-bold font-mono tracking-widest text-lg">
                <Terminal size={20} /> JAILBREAK
             </div>
             <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-zinc-400 hover:text-[var(--color-primary-neon)] transition-colors rounded-md bg-white/5 border border-white/10">
               <X size={24} />
             </button>
          </div>
          <nav className="flex-1 p-4 space-y-3 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href} className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-mono text-base ${isActive ? "bg-[var(--color-primary-neon)]/10 text-[var(--color-primary-neon)] border border-[var(--color-primary-neon)]/30" : "text-zinc-300 bg-white/5 border border-white/10"}`}>
                  <Icon size={22} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        
        {/* MOBILE TOP BAR */}
        <header className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-[var(--color-surface)]/90 backdrop-blur-md z-40">
          <Link href="/dashboard" className="flex items-center gap-2 text-[var(--color-primary-neon)] font-bold font-mono tracking-widest">
            <Terminal size={20} />
            <span>JAILBREAK</span>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 text-zinc-400 hover:text-white bg-white/5 rounded-md border border-white/10 transition-colors">
            <Menu size={20} />
          </button>
        </header>

        {/* Global Matrix Background Pattern */}
        <div className="absolute inset-0 bg-[image:var(--background-image-matrix-grid)] bg-[length:var(--background-size-grid)] opacity-5 pointer-events-none" />

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10">
          {children}
        </main>
      </div>
      
    </div>
  );
}