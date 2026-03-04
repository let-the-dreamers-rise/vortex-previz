import { motion, AnimatePresence } from "framer-motion";
import type { IdeaNode } from "./KnowledgeGraph";
import { X, Dna, Calendar, Layers, Zap, TrendingUp, Globe } from "lucide-react";

interface Props {
  node: IdeaNode | null;
  onClose: () => void;
}

const TraitBar = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <div className="space-y-1">
    <div className="flex justify-between items-center">
      <span className="text-xs text-muted-foreground font-mono">{label}</span>
      <span className="text-xs font-mono" style={{ color }}>{value}%</span>
    </div>
    <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, ${color}, ${color}88)` }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
      />
    </div>
  </div>
);

const IdeaGenomePanel = ({ node, onClose }: Props) => {
  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed right-4 top-20 bottom-4 w-[360px] glass rounded-2xl overflow-hidden z-30 flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/50">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${node.color.replace(")", " / 0.15)")}`, border: `1px solid ${node.color}44` }}
                >
                  <Dna className="w-5 h-5" style={{ color: node.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{node.label}</h3>
                  <span className="text-xs font-mono" style={{ color: node.color }}>{node.category}</span>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto scrollbar-hidden p-5 space-y-6">
            {/* Description */}
            <div>
              <p className="text-sm text-muted-foreground leading-relaxed">{node.description}</p>
            </div>

            {/* Meta */}
            <div className="flex gap-3">
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-neon-cyan" />
                <span className="text-xs font-mono text-foreground">{node.year}</span>
              </div>
              <div className="glass rounded-xl px-3 py-2 flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-neon-purple" />
                <span className="text-xs font-mono text-foreground">{node.connections.length} links</span>
              </div>
            </div>

            {/* Idea Genome */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Dna className="w-3.5 h-3.5" />
                Idea Genome
              </h4>
              <div className="space-y-3">
                <TraitBar label="Complexity" value={node.traits.complexity} color="hsl(180, 80%, 50%)" />
                <TraitBar label="Adoption" value={node.traits.adoption} color="hsl(270, 60%, 55%)" />
                <TraitBar label="Scalability" value={node.traits.scalability} color="hsl(320, 70%, 55%)" />
                <TraitBar label="Influence" value={node.traits.influence} color="hsl(45, 80%, 55%)" />
              </div>
            </div>

            {/* Fields */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5" />
                Influenced Fields
              </h4>
              <div className="flex flex-wrap gap-2">
                {node.fields.map((field) => (
                  <span
                    key={field}
                    className="px-3 py-1 rounded-full text-xs font-mono glass"
                    style={{ color: node.color, borderColor: `${node.color}33` }}
                  >
                    {field}
                  </span>
                ))}
              </div>
            </div>

            {/* Connections */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Connected Ideas
              </h4>
              <div className="space-y-2">
                {node.connections.map((connId) => (
                  <div
                    key={connId}
                    className="glass rounded-lg px-3 py-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  >
                    {connId.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* DNA strand decoration */}
          <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${node.color}, transparent)` }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default IdeaGenomePanel;
