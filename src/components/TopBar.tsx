import { motion } from "framer-motion";
import { Dna, Sparkles, Activity, Radar, Zap } from "lucide-react";
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
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-transparent pointer-events-none" style={{ height: "140%" }} />

      <div className="relative flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute inset-0 rounded-xl bg-neon-cyan/20 blur-xl group-hover:bg-neon-cyan/40 transition-all duration-500" />
            <motion.div
              className="relative w-11 h-11 rounded-xl bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Dna className="w-5 h-5 text-neon-cyan" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight text-glow-cyan">
              IdeaGenome
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
              <p className="text-[8px] text-muted-foreground font-mono tracking-[0.2em]">KNOWLEDGE UNIVERSE v3.0</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-2 border border-glass-border/40">
            <Activity className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono text-muted-foreground">
              NODES <span className="text-neon-cyan font-bold">10</span>
            </span>
            <div className="w-px h-3 bg-border/40" />
            <span className="text-[10px] font-mono text-muted-foreground">
              LINKS <span className="text-neon-purple font-bold">14</span>
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 glass rounded-full px-4 py-2 border border-glass-border/40">
            <Radar className="w-3 h-3 text-neon-pink" />
            <span className="text-[10px] font-mono text-muted-foreground">
              SCAN <span className="text-neon-pink font-bold">{fmt(uptime)}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 glass rounded-full px-4 py-2 border border-neon-cyan/20">
            <Zap className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono text-neon-cyan/80">DISCOVERY ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Neon line with scanning beam */}
      <div className="relative h-px w-full">
        <div className="absolute inset-0 neon-line" />
        <motion.div
          className="absolute top-0 h-px w-48"
          style={{ background: "linear-gradient(90deg, transparent, hsl(180 80% 60% / 0.8), hsl(270 60% 60% / 0.4), transparent)" }}
          animate={{ x: ["-12rem", "calc(100vw + 12rem)"] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
        />
      </div>
    </motion.header>
  );
};

export default TopBar;
