import { motion } from "framer-motion";
import { Dna, Sparkles, Activity, Radar } from "lucide-react";
import { useEffect, useState } from "react";

const TopBar = () => {
  const [uptime, setUptime] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setUptime((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, []);
  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-40"
    >
      {/* Gradient fade */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" style={{ height: "120%" }} />

      <div className="relative flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-neon-cyan/20 blur-xl group-hover:bg-neon-cyan/30 transition-all" />
            <div className="relative w-10 h-10 rounded-xl bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center">
              <Dna className="w-5 h-5 text-neon-cyan" />
            </div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight text-glow-cyan">
              IdeaGenome
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
              <p className="text-[9px] text-muted-foreground font-mono tracking-[0.2em]">KNOWLEDGE UNIVERSE v2.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats badges */}
          <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-2">
            <Activity className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono text-muted-foreground">
              NODES <span className="text-neon-cyan font-semibold">10</span>
            </span>
            <div className="w-px h-3 bg-border" />
            <span className="text-[10px] font-mono text-muted-foreground">
              LINKS <span className="text-neon-purple font-semibold">14</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2">
            <Radar className="w-3 h-3 text-neon-pink" />
            <span className="text-[10px] font-mono text-muted-foreground">
              SCAN <span className="text-neon-pink">{fmt(uptime)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 glass rounded-full px-4 py-2">
            <Sparkles className="w-3 h-3 text-neon-cyan animate-pulse-glow" />
            <span className="text-[10px] font-mono text-muted-foreground">SIMULATION ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Neon line */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0 neon-line" />
        {/* Scanning light on the line */}
        <motion.div
          className="absolute top-0 h-px w-40"
          style={{ background: "linear-gradient(90deg, transparent, hsl(180 80% 60% / 0.8), transparent)" }}
          animate={{ x: ["-10rem", "calc(100vw + 10rem)"] }}
          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.header>
  );
};

export default TopBar;
