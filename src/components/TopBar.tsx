import { motion } from "framer-motion";
import { Clapperboard, Sparkles, Activity, Radar, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  nodeCount?: number;
  linkCount?: number;
}

const TopBar = ({ nodeCount = 10, linkCount = 14 }: Props) => {
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
              className="relative w-11 h-11 tech-bezel bg-neon-cyan/10 border border-neon-cyan/40 flex items-center justify-center glow-cyan"
              whileHover={{ rotate: 10 }}
              transition={{ type: "spring", damping: 10 }}
            >
              <Clapperboard className="w-5 h-5 text-neon-cyan" />
            </motion.div>
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground tracking-tight text-glow-cyan">
              Vortex Previz
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
              <p className="text-[8px] text-muted-foreground font-mono tracking-[0.2em]">CINEMATIC SEQUENCE ENGINE</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 glass-strong tech-bezel px-4 py-2 border-l-2 border-l-neon-cyan">
            <Activity className="w-3 h-3 text-neon-cyan animate-pulse" />
            <span className="text-[10px] font-mono text-muted-foreground mr-1">
              SCENE NODES <span className="text-neon-cyan font-bold">{nodeCount}</span>
            </span>
            <div className="w-px h-3 bg-neon-cyan/40 mx-2" />
            <span className="text-[10px] font-mono text-muted-foreground">
              COMPILER EDGES <span className="text-neon-cyan font-bold">{linkCount}</span>
            </span>
          </div>

          <div className="flex items-center gap-2 glass-strong tech-bezel px-4 py-2 border-l-2 border-l-neon-purple">
            <Zap className="w-3 h-3 text-neon-purple" />
            <span className="text-[10px] font-mono text-neon-purple drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">ORCHESTRATOR LIVE</span>
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
