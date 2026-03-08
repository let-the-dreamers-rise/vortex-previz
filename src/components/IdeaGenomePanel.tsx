import { motion, AnimatePresence } from "framer-motion";
import type { IdeaNode } from "./KnowledgeGraph";
import { X, Dna, Calendar, Layers, Zap, Globe, Activity } from "lucide-react";

interface Props {
  node: IdeaNode | null;
  onClose: () => void;
}

const TRAIT_MAP: Record<string, string[]> = {
  "neural-networks": ["biological inspiration", "weight learning", "universal approximation", "distributed representations"],
  "deep-learning": ["hierarchical features", "end-to-end training", "representation learning", "transfer learning"],
  "transformers": ["self-attention", "parallel computation", "positional encoding", "sequence modeling"],
  "backpropagation": ["gradient computation", "chain rule", "error propagation", "weight updates"],
  "attention": ["dynamic weighting", "context awareness", "selective focus", "query-key-value"],
  "generative-ai": ["content creation", "latent space sampling", "distribution modeling", "creative synthesis"],
  "gradient-descent": ["loss minimization", "iterative optimization", "learning rate", "convergence"],
  "diffusion": ["noise scheduling", "denoising process", "score matching", "iterative refinement"],
  "quantum-ml": ["superposition", "entanglement", "quantum gates", "exponential state space"],
  "neuro-symbolic": ["logical reasoning", "symbolic grounding", "rule extraction", "hybrid inference"],
};

const TraitBar = ({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) => (
  <div className="space-y-1.5">
    <div className="flex justify-between items-center">
      <span className="text-[11px] text-muted-foreground font-mono">{label}</span>
      <motion.span
        className="text-[11px] font-mono font-bold"
        style={{ color }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 0.5 }}
      >
        {value}%
      </motion.span>
    </div>
    <div className="h-2 rounded-full bg-secondary overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)`, boxShadow: `0 0 8px ${color}44` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay }}
      />
    </div>
  </div>
);

const IdeaGenomePanel = ({ node, onClose }: Props) => {
  const traits = node ? (TRAIT_MAP[node.id] || []) : [];

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 400, opacity: 0, scale: 0.95 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: 400, opacity: 0, scale: 0.95 }}
          transition={{ type: "spring", damping: 22, stiffness: 180 }}
          className="fixed right-4 top-20 bottom-4 w-[380px] glass-strong rounded-2xl overflow-hidden z-30 flex flex-col border border-glass-border/60"
          style={{ boxShadow: `0 0 40px ${node.color.replace(")", " / 0.08)")}` }}
        >
          {/* Header with colored accent */}
          <div className="p-5 border-b border-border/50 relative overflow-hidden">
            {/* Color accent glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(135deg, ${node.color.replace(")", " / 0.06)")}, transparent 60%)` }} />
            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", damping: 12 }}
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${node.color.replace(")", " / 0.12)")}`, border: `1.5px solid ${node.color}44`, boxShadow: `0 0 16px ${node.color.replace(")", " / 0.15)")}` }}
                >
                  <Dna className="w-6 h-6" style={{ color: node.color }} />
                </motion.div>
                <div>
                  <h3 className="font-bold text-foreground text-base">{node.label}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs font-mono" style={{ color: node.color }}>{node.category}</span>
                    {node.isDiscovered && (
                      <span className="text-[8px] font-mono px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
                        DISCOVERED
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden p-5 space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-sm text-muted-foreground leading-relaxed"
            >
              {node.description}
            </motion.p>

            {/* Meta badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex gap-2"
            >
              <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neon-cyan" />
                <span className="text-xs font-mono text-foreground font-bold">{node.year}</span>
              </div>
              <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Layers className="w-4 h-4 text-neon-purple" />
                <span className="text-xs font-mono text-foreground">{node.connections.length} links</span>
              </div>
              <div className="glass rounded-xl px-3 py-2.5 flex items-center gap-2">
                <Activity className="w-4 h-4 text-neon-pink" />
                <span className="text-xs font-mono text-foreground">{Math.round((node.traits.complexity + node.traits.influence) / 2)}% active</span>
              </div>
            </motion.div>

            {/* DNA Traits (Genome Sequence) */}
            {traits.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                  <Dna className="w-3.5 h-3.5" style={{ color: node.color }} />
                  Genome Sequence
                </h4>
                <div className="flex flex-wrap gap-2">
                  {traits.map((trait, i) => (
                    <motion.span
                      key={trait}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + i * 0.08, type: "spring", damping: 12 }}
                      className="px-3 py-1.5 rounded-full text-[11px] font-mono"
                      style={{
                        color: node.color,
                        background: `${node.color.replace(")", " / 0.08)")}`,
                        border: `1px solid ${node.color}22`,
                      }}
                    >
                      {trait}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Genome Bars */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                Trait Analysis
              </h4>
              <div className="space-y-3">
                <TraitBar label="Complexity" value={node.traits.complexity} color="hsl(180, 80%, 50%)" delay={0.3} />
                <TraitBar label="Adoption" value={node.traits.adoption} color="hsl(270, 60%, 55%)" delay={0.4} />
                <TraitBar label="Scalability" value={node.traits.scalability} color="hsl(320, 70%, 55%)" delay={0.5} />
                <TraitBar label="Influence" value={node.traits.influence} color="hsl(45, 80%, 55%)" delay={0.6} />
              </div>
            </motion.div>

            {/* Fields */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Influenced Fields
              </h4>
              <div className="flex flex-wrap gap-2">
                {node.fields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1.5 rounded-full text-xs font-mono glass"
                    style={{ color: node.color, borderColor: `${node.color}33` }}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Connected Ideas */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Connected Ideas
              </h4>
              <div className="space-y-2">
                {node.connections.map((connId) => (
                  <div
                    key={connId}
                    className="glass rounded-xl px-4 py-2.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-all cursor-pointer hover:border-glass-border/80"
                  >
                    {connId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom accent line */}
          <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${node.color}, transparent)`, opacity: 0.6 }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdeaGenomePanel;
