import { motion } from "framer-motion";
import { Dna, Sparkles } from "lucide-react";

const TopBar = () => {
  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 glass-strong"
    >
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <Dna className="w-5 h-5 text-neon-cyan" />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-cyan animate-pulse-glow" />
          </div>
          <div>
            <h1 className="text-base font-bold text-foreground tracking-tight text-glow-cyan">
              IdeaGenome
            </h1>
            <p className="text-[10px] text-muted-foreground font-mono">KNOWLEDGE UNIVERSE EXPLORER</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <Sparkles className="w-3 h-3 text-neon-cyan" />
            <span className="text-[10px] font-mono text-muted-foreground">
              <span className="text-neon-cyan">10</span> IDEAS MAPPED
            </span>
          </div>
          <div className="flex items-center gap-2 glass rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
            <span className="text-[10px] font-mono text-muted-foreground">SIMULATION ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Neon line */}
      <div className="neon-line w-full" />
    </motion.header>
  );
};

export default TopBar;
