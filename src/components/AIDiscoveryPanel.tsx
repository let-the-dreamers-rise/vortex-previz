import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Atom, Brain, Cpu } from "lucide-react";

interface Discovery {
  name: string;
  parents: string[];
  traits: string[];
  potential: number;
  description: string;
  icon: typeof Atom;
  color: string;
}

const discoveries: Discovery[] = [
  {
    name: "Adaptive Memory Transformer",
    parents: ["Transformers", "LSTM Networks"],
    traits: ["Dynamic context windows", "Persistent memory banks", "Self-evolving architecture"],
    potential: 92,
    description: "A transformer variant with biologically-inspired memory consolidation, enabling infinite context retention.",
    icon: Brain,
    color: "hsl(180, 80%, 50%)",
  },
  {
    name: "Quantum Diffusion Engine",
    parents: ["Diffusion Models", "Quantum ML"],
    traits: ["Superposition sampling", "Entangled latent spaces", "Probabilistic generation"],
    potential: 78,
    description: "Leveraging quantum superposition for exponentially faster diffusion-based generation.",
    icon: Atom,
    color: "hsl(270, 60%, 55%)",
  },
  {
    name: "Neural Logic Synthesizer",
    parents: ["Neuro-Symbolic AI", "Deep Learning"],
    traits: ["Formal verification", "Emergent reasoning", "Self-correcting logic"],
    potential: 85,
    description: "Unifying neural pattern recognition with symbolic logic for provably correct AI reasoning.",
    icon: Cpu,
    color: "hsl(320, 70%, 55%)",
  },
];

const AIDiscoveryPanel = () => {
  return (
    <div className="fixed right-4 bottom-4 w-[360px] glass rounded-2xl overflow-hidden z-20">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-sm font-semibold text-foreground">AI Discovery Engine</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Predicted future discoveries</p>
      </div>

      <div className="max-h-[320px] overflow-y-auto scrollbar-hidden p-3 space-y-3">
        {discoveries.map((disc, i) => (
          <motion.div
            key={disc.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15, duration: 0.4 }}
            className="glass rounded-xl p-4 hover:border-glass-border transition-all group cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: `${disc.color.replace(")", " / 0.15)")}`, border: `1px solid ${disc.color}33` }}
              >
                <disc.icon className="w-4 h-4" style={{ color: disc.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-foreground">{disc.name}</h4>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{disc.description}</p>
              </div>
            </div>

            {/* Parents */}
            <div className="mt-3 flex items-center gap-1.5 text-[10px]">
              {disc.parents.map((p, j) => (
                <span key={p} className="flex items-center gap-1">
                  <span className="font-mono text-muted-foreground">{p}</span>
                  {j < disc.parents.length - 1 && <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/50" />}
                </span>
              ))}
            </div>

            {/* Traits */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {disc.traits.map((trait) => (
                <span
                  key={trait}
                  className="px-2 py-0.5 rounded-full text-[9px] font-mono"
                  style={{
                    color: disc.color,
                    background: `${disc.color.replace(")", " / 0.1)")}`,
                    border: `1px solid ${disc.color}22`,
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Potential bar */}
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] text-muted-foreground font-mono">DISCOVERY POTENTIAL</span>
                <span className="text-[9px] font-mono" style={{ color: disc.color }}>{disc.potential}%</span>
              </div>
              <div className="h-1 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: disc.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${disc.potential}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AIDiscoveryPanel;
