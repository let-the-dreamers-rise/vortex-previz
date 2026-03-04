import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, Atom, Brain, Cpu, Zap, Search, ChevronDown, ChevronUp, FlaskConical, Dna, Target, TrendingUp, Lightbulb } from "lucide-react";
import { IDEA_NODES, type IdeaNode } from "./KnowledgeGraph";

/* ── Discovery types ── */
interface DiscoveredIdea {
  name: string;
  parents: IdeaNode[];
  combinedTraits: string[];
  scores: { novelty: number; feasibility: number; impact: number };
  description: string;
  color: string;
}

/* ── Trait pools per node ── */
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

/* ── Discovery algorithm ── */
function generateDiscovery(parentIds: string[]): DiscoveredIdea {
  const parents = parentIds.map(id => IDEA_NODES.find(n => n.id === id)!).filter(Boolean);
  
  // Combine traits from parents
  const allTraits = parentIds.flatMap(id => TRAIT_MAP[id] || []);
  // Pick interesting combinations (every other trait for variety)
  const combinedTraits = allTraits
    .filter((_, i) => i % 2 === 0)
    .slice(0, 5);

  // Compute scores based on parent trait averages with variation
  const avgComplexity = parents.reduce((s, p) => s + p.traits.complexity, 0) / parents.length;
  const avgAdoption = parents.reduce((s, p) => s + p.traits.adoption, 0) / parents.length;
  const avgInfluence = parents.reduce((s, p) => s + p.traits.influence, 0) / parents.length;

  const novelty = Math.min(99, Math.round(avgComplexity * 0.6 + (parents.length * 8) + Math.random() * 10));
  const feasibility = Math.min(99, Math.round(avgAdoption * 0.5 + 30 + Math.random() * 15));
  const impact = Math.min(99, Math.round(avgInfluence * 0.7 + Math.random() * 12));

  // Mix colors from parents
  const hues = parents.map(p => {
    const match = p.color.match(/hsl\((\d+)/);
    return match ? parseInt(match[1]) : 180;
  });
  const avgHue = Math.round(hues.reduce((a, b) => a + b, 0) / hues.length);

  return { name: "", parents, combinedTraits, scores: { novelty, feasibility, impact }, description: "", color: `hsl(${avgHue}, 75%, 55%)` };
}

/* ── Pre-defined discovery combos ── */
const DISCOVERY_COMBOS: { parentIds: string[]; name: string; description: string }[] = [
  {
    parentIds: ["transformers", "backpropagation", "quantum-ml"],
    name: "Quantum Attention Optimizer",
    description: "A hybrid architecture exploiting quantum superposition for parallel attention head computation with gradient-free optimization in entangled parameter spaces.",
  },
  {
    parentIds: ["neural-networks", "generative-ai", "neuro-symbolic"],
    name: "Symbolic Generative Reasoner",
    description: "Fuses neural generation with formal logic verification — every generated output is provably grounded in symbolic knowledge graphs.",
  },
  {
    parentIds: ["deep-learning", "diffusion", "attention"],
    name: "Attention-Guided Diffusion Engine",
    description: "Replaces random noise scheduling with learned attention maps, enabling semantically-aware denoising for ultra-coherent generation.",
  },
  {
    parentIds: ["transformers", "neural-networks", "gradient-descent"],
    name: "Self-Optimizing Transformer",
    description: "A meta-learning transformer that dynamically adapts its own optimizer, learning rate, and architecture during inference time.",
  },
];

/* ── Discovery step phases ── */
type Phase = "idle" | "scanning" | "extracting" | "combining" | "scoring" | "complete";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "READY",
  scanning: "SCANNING KNOWLEDGE GRAPH",
  extracting: "EXTRACTING IDEA GENOMES",
  combining: "COMBINING TRAIT SEQUENCES",
  scoring: "COMPUTING DISCOVERY SCORES",
  complete: "DISCOVERY COMPLETE",
};

/* ── Component ── */
const AIDiscoveryPanel = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentCombo, setCurrentCombo] = useState(0);
  const [discovery, setDiscovery] = useState<DiscoveredIdea | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [visibleTraits, setVisibleTraits] = useState(0);
  const [visibleParents, setVisibleParents] = useState(0);
  const [showScores, setShowScores] = useState(false);

  const runDiscovery = useCallback((comboIndex: number) => {
    const combo = DISCOVERY_COMBOS[comboIndex];
    setPhase("scanning");
    setVisibleTraits(0);
    setVisibleParents(0);
    setShowScores(false);
    setDiscovery(null);

    // Phase 1: Scanning (1s)
    setTimeout(() => {
      setPhase("extracting");
      const disc = generateDiscovery(combo.parentIds);
      disc.name = combo.name;
      disc.description = combo.description;
      setDiscovery(disc);

      // Phase 2: Show parents one by one
      disc.parents.forEach((_, i) => {
        setTimeout(() => setVisibleParents(i + 1), i * 400);
      });

      // Phase 3: Combining (after parents shown)
      setTimeout(() => {
        setPhase("combining");
        // Reveal traits one by one
        disc.combinedTraits.forEach((_, i) => {
          setTimeout(() => setVisibleTraits(i + 1), i * 300);
        });

        // Phase 4: Scoring
        setTimeout(() => {
          setPhase("scoring");
          setTimeout(() => {
            setShowScores(true);
            setTimeout(() => setPhase("complete"), 600);
          }, 400);
        }, disc.combinedTraits.length * 300 + 400);
      }, disc.parents.length * 400 + 500);
    }, 1000);
  }, []);

  // Auto-run first discovery on mount
  useEffect(() => {
    const timer = setTimeout(() => runDiscovery(0), 1500);
    return () => clearTimeout(timer);
  }, [runDiscovery]);

  const nextDiscovery = () => {
    const next = (currentCombo + 1) % DISCOVERY_COMBOS.length;
    setCurrentCombo(next);
    runDiscovery(next);
  };

  return (
    <div className="fixed right-4 bottom-4 w-[380px] glass rounded-2xl overflow-hidden z-20">
      {/* Header */}
      <div
        className="p-4 border-b border-border/50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <FlaskConical className="w-4 h-4 text-neon-cyan" />
              {phase !== "idle" && phase !== "complete" && (
                <motion.div
                  className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-neon-cyan"
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </div>
            <h3 className="text-sm font-semibold text-foreground">AI Discovery Engine</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono text-muted-foreground tracking-wider">
              {PHASE_LABELS[phase]}
            </span>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
            ) : (
              <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Phase progress bar */}
        {phase !== "idle" && phase !== "complete" && (
          <div className="mt-2 h-0.5 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full bg-neon-cyan rounded-full"
              animate={{
                width: phase === "scanning" ? "20%" : phase === "extracting" ? "45%" : phase === "combining" ? "70%" : "90%",
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        )}
      </div>

      {/* Body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-h-[420px] overflow-y-auto scrollbar-hidden p-4 space-y-4">
              {/* Scanning animation */}
              {phase === "scanning" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center py-6 gap-3"
                >
                  <motion.div
                    className="relative w-16 h-16"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-6 h-6 text-neon-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <svg className="w-full h-full" viewBox="0 0 64 64">
                      <circle cx="32" cy="32" r="28" fill="none" stroke="hsl(var(--neon-cyan))" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 8" />
                      <circle cx="32" cy="32" r="20" fill="none" stroke="hsl(var(--neon-cyan))" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="2 6" />
                    </svg>
                  </motion.div>
                  <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                    ANALYZING {IDEA_NODES.length} IDEA NODES...
                  </p>
                  {/* Node dots representing scanning */}
                  <div className="flex gap-1.5 mt-1">
                    {IDEA_NODES.slice(0, 8).map((node, i) => (
                      <motion.div
                        key={node.id}
                        className="w-2 h-2 rounded-full"
                        style={{ background: node.color }}
                        animate={{ opacity: [0.2, 1, 0.2] }}
                        transition={{ duration: 1, delay: i * 0.12, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Parent ideas extraction */}
              {(phase === "extracting" || phase === "combining" || phase === "scoring" || phase === "complete") && discovery && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Dna className="w-3.5 h-3.5 text-neon-cyan" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wider">SOURCE GENOMES</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {discovery.parents.map((parent, i) => (
                      <AnimatePresence key={parent.id}>
                        {i < visibleParents && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 15 }}
                            className="flex items-center gap-1.5"
                          >
                            {i > 0 && (
                              <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-[10px] font-mono text-neon-cyan"
                              >
                                +
                              </motion.span>
                            )}
                            <div
                              className="px-2.5 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-1.5"
                              style={{
                                background: `${parent.color.replace(")", " / 0.12)")}`,
                                border: `1px solid ${parent.color}33`,
                                color: parent.color,
                              }}
                            >
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: parent.color }}
                              />
                              {parent.label}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </div>
              )}

              {/* Combined traits */}
              {(phase === "combining" || phase === "scoring" || phase === "complete") && discovery && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-neon-purple" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wider">COMBINED TRAITS</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {discovery.combinedTraits.map((trait, i) => (
                      <AnimatePresence key={trait}>
                        {i < visibleTraits && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="px-2 py-0.5 rounded-full text-[9px] font-mono"
                            style={{
                              color: discovery.color,
                              background: `${discovery.color.replace(")", " / 0.1)")}`,
                              border: `1px solid ${discovery.color}22`,
                            }}
                          >
                            ✓ {trait}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Arrow connector */}
              {(phase === "scoring" || phase === "complete") && discovery && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center py-1"
                >
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 24 }}
                    transition={{ duration: 0.4 }}
                    className="w-px bg-gradient-to-b from-neon-purple to-neon-cyan relative"
                  >
                    <ArrowRight className="w-3 h-3 text-neon-cyan absolute -bottom-1 -left-1.5 rotate-90" />
                  </motion.div>
                </motion.div>
              )}

              {/* Discovery result */}
              {(phase === "scoring" || phase === "complete") && discovery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="glass-strong rounded-xl p-4 relative overflow-hidden"
                  style={{ borderColor: `${discovery.color}33` }}
                >
                  {/* Glow effect */}
                  <div
                    className="absolute inset-0 opacity-5 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse at 50% 0%, ${discovery.color}, transparent 70%)`,
                    }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <Lightbulb className="w-4 h-4" style={{ color: discovery.color }} />
                      <span className="text-[9px] font-mono text-muted-foreground tracking-widest">EMERGING CONCEPT</span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-1">{discovery.name}</h4>
                    <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">{discovery.description}</p>

                    {/* Scores */}
                    <AnimatePresence>
                      {showScores && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 space-y-2"
                        >
                          {(["novelty", "feasibility", "impact"] as const).map((key, i) => {
                            const icons = { novelty: Sparkles, feasibility: Target, impact: TrendingUp };
                            const colors = { novelty: "hsl(var(--neon-cyan))", feasibility: "hsl(var(--neon-purple))", impact: "hsl(var(--neon-pink))" };
                            const Icon = icons[key];
                            return (
                              <motion.div
                                key={key}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.15 }}
                                className="flex items-center gap-2"
                              >
                                <Icon className="w-3 h-3 shrink-0" style={{ color: colors[key] }} />
                                <span className="text-[9px] font-mono text-muted-foreground w-16 uppercase">{key}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: colors[key] }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${discovery.scores[key]}%` }}
                                    transition={{ duration: 0.8, delay: i * 0.15 }}
                                  />
                                </div>
                                <span className="text-[10px] font-mono font-bold w-8 text-right" style={{ color: colors[key] }}>
                                  {discovery.scores[key]}%
                                </span>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Mini architecture diagram */}
                    {phase === "complete" && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-4 rounded-lg p-3"
                        style={{ background: `${discovery.color.replace(")", " / 0.05)")}`, border: `1px solid ${discovery.color}15` }}
                      >
                        <span className="text-[8px] font-mono text-muted-foreground tracking-widest block mb-2">ARCHITECTURE</span>
                        <div className="flex items-center justify-center gap-1">
                          {discovery.parents.map((p, i) => (
                            <div key={p.id} className="flex items-center gap-1">
                              <div
                                className="w-8 h-8 rounded flex items-center justify-center text-[7px] font-mono leading-tight text-center"
                                style={{
                                  background: `${p.color.replace(")", " / 0.15)")}`,
                                  border: `1px solid ${p.color}33`,
                                  color: p.color,
                                }}
                              >
                                {p.label.split(" ")[0]}
                              </div>
                              {i < discovery.parents.length - 1 && (
                                <ArrowRight className="w-2.5 h-2.5 text-muted-foreground/40" />
                              )}
                            </div>
                          ))}
                          <ArrowRight className="w-3 h-3 text-neon-cyan mx-1" />
                          <div
                            className="w-10 h-10 rounded flex items-center justify-center text-[7px] font-mono leading-tight text-center font-bold"
                            style={{
                              background: `${discovery.color.replace(")", " / 0.2)")}`,
                              border: `1px solid ${discovery.color}44`,
                              color: discovery.color,
                              boxShadow: `0 0 12px ${discovery.color.replace(")", " / 0.2)")}`,
                            }}
                          >
                            NEW
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Next discovery button */}
              {phase === "complete" && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  onClick={nextDiscovery}
                  className="w-full py-2.5 rounded-xl text-[11px] font-mono glass hover:bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  DISCOVER NEXT CONCEPT
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIDiscoveryPanel;
