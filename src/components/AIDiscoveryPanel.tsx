import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, ArrowRight, ArrowDown, Zap, Search, ChevronDown, ChevronUp, FlaskConical, Dna, Target, TrendingUp, Lightbulb, Plus, Layers } from "lucide-react";
import { IDEA_NODES, type IdeaNode } from "./KnowledgeGraph";

interface DiscoveredIdea {
  name: string;
  parents: IdeaNode[];
  combinedTraits: string[];
  scores: { novelty: number; feasibility: number; impact: number };
  description: string;
  color: string;
  architectureLayers: string[];
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

function generateDiscovery(parentIds: string[]): DiscoveredIdea {
  const parents = parentIds.map(id => IDEA_NODES.find(n => n.id === id)!).filter(Boolean);
  const allTraits = parentIds.flatMap(id => TRAIT_MAP[id] || []);
  const combinedTraits = allTraits.filter((_, i) => i % 2 === 0).slice(0, 5);
  const avgComplexity = parents.reduce((s, p) => s + p.traits.complexity, 0) / parents.length;
  const avgAdoption = parents.reduce((s, p) => s + p.traits.adoption, 0) / parents.length;
  const avgInfluence = parents.reduce((s, p) => s + p.traits.influence, 0) / parents.length;
  const novelty = Math.min(99, Math.round(avgComplexity * 0.6 + (parents.length * 8) + Math.random() * 10));
  const feasibility = Math.min(99, Math.round(avgAdoption * 0.5 + 30 + Math.random() * 15));
  const impact = Math.min(99, Math.round(avgInfluence * 0.7 + Math.random() * 12));
  const hues = parents.map(p => { const m = p.color.match(/hsl\((\d+)/); return m ? parseInt(m[1]) : 180; });
  const avgHue = Math.round(hues.reduce((a, b) => a + b, 0) / hues.length);
  return { name: "", parents, combinedTraits, scores: { novelty, feasibility, impact }, description: "", color: `hsl(${avgHue}, 75%, 55%)`, architectureLayers: [] };
}

const DISCOVERY_COMBOS: { parentIds: string[]; name: string; description: string; architectureLayers: string[] }[] = [
  {
    parentIds: ["transformers", "backpropagation", "quantum-ml"],
    name: "Quantum Attention Optimizer",
    description: "A hybrid architecture exploiting quantum superposition for parallel attention head computation with gradient-free optimization in entangled parameter spaces.",
    architectureLayers: ["Input Embedding", "Quantum State Encoder", "Entangled Attention Heads", "Superposition Pooling", "Gradient-Free Optimizer", "Output Decoder"],
  },
  {
    parentIds: ["neural-networks", "generative-ai", "neuro-symbolic"],
    name: "Symbolic Generative Reasoner",
    description: "Fuses neural generation with formal logic verification — every generated output is provably grounded in symbolic knowledge graphs.",
    architectureLayers: ["Neural Encoder", "Symbolic Rule Engine", "Logic Gate Layer", "Generative Decoder", "Proof Verification", "Grounded Output"],
  },
  {
    parentIds: ["deep-learning", "diffusion", "attention"],
    name: "Attention-Guided Diffusion Engine",
    description: "Replaces random noise scheduling with learned attention maps, enabling semantically-aware denoising for ultra-coherent generation.",
    architectureLayers: ["Noise Injector", "Attention Map Generator", "Semantic Mask Layer", "Guided Denoiser", "Coherence Refiner", "HD Output"],
  },
  {
    parentIds: ["transformers", "neural-networks", "gradient-descent"],
    name: "Self-Optimizing Transformer",
    description: "A meta-learning transformer that dynamically adapts its own optimizer, learning rate, and architecture during inference time.",
    architectureLayers: ["Meta-Controller", "Dynamic Architecture", "Self-Tuning Optimizer", "Adaptive Attention", "Live Pruning Engine", "Inference Output"],
  },
];

type Phase = "idle" | "scanning" | "extracting" | "combining" | "scoring" | "complete";

const PHASE_LABELS: Record<Phase, string> = {
  idle: "READY",
  scanning: "SCANNING KNOWLEDGE GRAPH",
  extracting: "EXTRACTING IDEA GENOMES",
  combining: "COMBINING TRAIT SEQUENCES",
  scoring: "COMPUTING DISCOVERY SCORES",
  complete: "DISCOVERY COMPLETE",
};

interface Props {
  onDiscovery?: (node: IdeaNode) => void;
  onHighlightNodes?: (ids: string[]) => void;
}

const AIDiscoveryPanel = ({ onDiscovery, onHighlightNodes }: Props) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentCombo, setCurrentCombo] = useState(0);
  const [discovery, setDiscovery] = useState<DiscoveredIdea | null>(null);
  const [expanded, setExpanded] = useState(true);
  const [visibleTraits, setVisibleTraits] = useState(0);
  const [visibleParents, setVisibleParents] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [addedToGraph, setAddedToGraph] = useState<Set<string>>(new Set());

  const runDiscovery = useCallback((comboIndex: number) => {
    const combo = DISCOVERY_COMBOS[comboIndex];
    setPhase("scanning");
    setVisibleTraits(0);
    setVisibleParents(0);
    setShowScores(false);
    setDiscovery(null);

    // Highlight parent nodes in graph
    onHighlightNodes?.(combo.parentIds);

    setTimeout(() => {
      setPhase("extracting");
      const disc = generateDiscovery(combo.parentIds);
      disc.name = combo.name;
      disc.description = combo.description;
      disc.architectureLayers = combo.architectureLayers;
      setDiscovery(disc);

      disc.parents.forEach((_, i) => {
        setTimeout(() => setVisibleParents(i + 1), i * 400);
      });

      setTimeout(() => {
        setPhase("combining");
        disc.combinedTraits.forEach((_, i) => {
          setTimeout(() => setVisibleTraits(i + 1), i * 250);
        });
        setTimeout(() => {
          setPhase("scoring");
          setTimeout(() => {
            setShowScores(true);
            setTimeout(() => {
              setPhase("complete");
              onHighlightNodes?.([]);
            }, 600);
          }, 400);
        }, disc.combinedTraits.length * 250 + 400);
      }, disc.parents.length * 400 + 500);
    }, 1200);
  }, [onHighlightNodes]);

  useEffect(() => {
    const timer = setTimeout(() => runDiscovery(0), 2000);
    return () => clearTimeout(timer);
  }, [runDiscovery]);

  const nextDiscovery = () => {
    const next = (currentCombo + 1) % DISCOVERY_COMBOS.length;
    setCurrentCombo(next);
    runDiscovery(next);
  };

  const addToGraph = () => {
    if (!discovery) return;
    const combo = DISCOVERY_COMBOS[currentCombo];
    const parentPositions = discovery.parents.map(p => ({ x: p.x, y: p.y }));
    const avgX = parentPositions.reduce((s, p) => s + p.x, 0) / parentPositions.length;
    const avgY = parentPositions.reduce((s, p) => s + p.y, 0) / parentPositions.length;
    // Offset from center of parents
    const newNode: IdeaNode = {
      id: `discovered-${combo.name.toLowerCase().replace(/\s+/g, '-')}`,
      label: discovery.name,
      x: avgX + (Math.random() - 0.5) * 80,
      y: avgY + 120 + Math.random() * 40,
      size: 26,
      color: discovery.color,
      glowColor: discovery.color,
      category: "Discovered",
      connections: combo.parentIds,
      traits: {
        complexity: discovery.scores.novelty,
        adoption: discovery.scores.feasibility,
        scalability: Math.round((discovery.scores.novelty + discovery.scores.impact) / 2),
        influence: discovery.scores.impact,
      },
      description: discovery.description,
      year: 2026,
      fields: ["AI", "Emerging"],
      isDiscovered: true,
    };
    onDiscovery?.(newNode);
    setAddedToGraph(prev => new Set(prev).add(combo.name));
  };

  const isAdded = discovery ? addedToGraph.has(discovery.name) : false;
  const phaseProgress = phase === "scanning" ? 15 : phase === "extracting" ? 35 : phase === "combining" ? 60 : phase === "scoring" ? 85 : 100;

  return (
    <div className="fixed right-4 bottom-4 w-[400px] glass-strong rounded-2xl overflow-hidden z-20 border border-glass-border/60">
      {/* Header */}
      <div
        className="p-4 border-b border-border/50 cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                <FlaskConical className="w-3.5 h-3.5 text-neon-cyan" />
              </div>
              {phase !== "idle" && phase !== "complete" && (
                <motion.div
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-neon-cyan"
                  animate={{ scale: [1, 1.4, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight">AI Discovery Engine</h3>
              <span className="text-[8px] font-mono text-muted-foreground tracking-[0.15em]">
                {PHASE_LABELS[phase]}
              </span>
            </div>
          </div>
          {expanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronUp className="w-4 h-4 text-muted-foreground" />}
        </div>

        {phase !== "idle" && phase !== "complete" && (
          <div className="mt-3 h-1 rounded-full bg-secondary overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: "linear-gradient(90deg, hsl(var(--neon-cyan)), hsl(var(--neon-purple)))" }}
              animate={{ width: `${phaseProgress}%` }}
              transition={{ duration: 0.6 }}
            />
          </div>
        )}
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="max-h-[480px] overflow-y-auto scrollbar-hidden p-4 space-y-4">
              {/* Scanning animation */}
              {phase === "scanning" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center py-8 gap-4">
                  <motion.div
                    className="relative w-20 h-20"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Search className="w-7 h-7 text-neon-cyan absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    <svg className="w-full h-full" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="35" fill="none" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" strokeOpacity="0.15" strokeDasharray="6 10" />
                      <circle cx="40" cy="40" r="25" fill="none" stroke="hsl(var(--neon-cyan))" strokeWidth="0.8" strokeOpacity="0.25" strokeDasharray="3 8" />
                      {/* Sweep */}
                      <line x1="40" y1="40" x2="40" y2="8" stroke="hsl(var(--neon-cyan))" strokeWidth="1.5" strokeOpacity="0.5" />
                    </svg>
                  </motion.div>
                  <div className="text-center space-y-1">
                    <p className="text-[10px] font-mono text-muted-foreground tracking-wider">
                      ANALYZING {IDEA_NODES.length} NODES
                    </p>
                    <div className="flex gap-1.5 justify-center">
                      {IDEA_NODES.slice(0, 8).map((node, i) => (
                        <motion.div
                          key={node.id}
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: node.color }}
                          animate={{ opacity: [0.15, 1, 0.15], scale: [0.8, 1.2, 0.8] }}
                          transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Parent extraction */}
              {(phase === "extracting" || phase === "combining" || phase === "scoring" || phase === "complete") && discovery && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Dna className="w-3.5 h-3.5 text-neon-cyan" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wider">SOURCE GENOMES</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {discovery.parents.map((parent, i) => (
                      <AnimatePresence key={parent.id}>
                        {i < visibleParents && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0, rotate: -10 }}
                            animate={{ scale: 1, opacity: 1, rotate: 0 }}
                            transition={{ type: "spring", damping: 12 }}
                            className="flex items-center gap-1.5"
                          >
                            {i > 0 && <span className="text-xs font-mono text-neon-cyan font-bold">+</span>}
                            <div
                              className="px-3 py-2 rounded-xl text-[11px] font-mono flex items-center gap-2"
                              style={{
                                background: `${parent.color.replace(")", " / 0.1)")}`,
                                border: `1px solid ${parent.color}33`,
                                color: parent.color,
                                boxShadow: `0 0 12px ${parent.color.replace(")", " / 0.1)")}`,
                              }}
                            >
                              <div className="w-2.5 h-2.5 rounded-full" style={{ background: parent.color, boxShadow: `0 0 6px ${parent.color}` }} />
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
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-neon-purple" />
                    <span className="text-[10px] font-mono text-muted-foreground tracking-wider">FUSED TRAITS</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {discovery.combinedTraits.map((trait, i) => (
                      <AnimatePresence key={trait}>
                        {i < visibleTraits && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                            className="px-2.5 py-1 rounded-full text-[10px] font-mono"
                            style={{
                              color: discovery.color,
                              background: `${discovery.color.replace(")", " / 0.08)")}`,
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

              {/* Convergence arrow */}
              {(phase === "scoring" || phase === "complete") && discovery && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center py-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 28 }}
                    transition={{ duration: 0.4 }}
                    className="w-px relative"
                    style={{ background: `linear-gradient(to bottom, ${discovery.color}, hsl(var(--neon-cyan)))` }}
                  >
                    <ArrowDown className="w-3.5 h-3.5 text-neon-cyan absolute -bottom-1 -left-[6px]" />
                  </motion.div>
                </motion.div>
              )}

              {/* Discovery result */}
              {(phase === "scoring" || phase === "complete") && discovery && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", damping: 18 }}
                  className="glass-strong rounded-2xl p-5 relative overflow-hidden"
                  style={{ borderColor: `${discovery.color}44`, boxShadow: `0 0 30px ${discovery.color.replace(")", " / 0.08)")}` }}
                >
                  {/* Glow */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 50% 0%, ${discovery.color.replace(")", " / 0.08)")}, transparent 70%)` }}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Lightbulb className="w-4 h-4" style={{ color: discovery.color }} />
                      <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">EMERGING CONCEPT</span>
                    </div>
                    <h4 className="text-base font-bold text-foreground mt-1" style={{ textShadow: `0 0 20px ${discovery.color.replace(")", " / 0.3)")}` }}>
                      {discovery.name}
                    </h4>
                    <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">{discovery.description}</p>

                    {/* Scores */}
                    <AnimatePresence>
                      {showScores && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2.5">
                          {(["novelty", "feasibility", "impact"] as const).map((key, i) => {
                            const icons = { novelty: Sparkles, feasibility: Target, impact: TrendingUp };
                            const colors = { novelty: "hsl(var(--neon-cyan))", feasibility: "hsl(var(--neon-purple))", impact: "hsl(var(--neon-pink))" };
                            const Icon = icons[key];
                            return (
                              <motion.div key={key} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.12 }} className="flex items-center gap-2.5">
                                <Icon className="w-3.5 h-3.5 shrink-0" style={{ color: colors[key] }} />
                                <span className="text-[10px] font-mono text-muted-foreground w-18 uppercase tracking-wide">{key}</span>
                                <div className="flex-1 h-2 rounded-full bg-secondary overflow-hidden">
                                  <motion.div
                                    className="h-full rounded-full"
                                    style={{ background: `linear-gradient(90deg, ${colors[key]}, ${colors[key]}88)` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${discovery.scores[key]}%` }}
                                    transition={{ duration: 1, delay: i * 0.12 }}
                                  />
                                </div>
                                <span className="text-[11px] font-mono font-bold w-10 text-right" style={{ color: colors[key] }}>
                                  {discovery.scores[key]}%
                                </span>
                              </motion.div>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Architecture Diagram */}
                    {phase === "complete" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-5 rounded-xl p-4"
                        style={{ background: `${discovery.color.replace(")", " / 0.04)")}`, border: `1px solid ${discovery.color}15` }}
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <Layers className="w-3.5 h-3.5" style={{ color: discovery.color }} />
                          <span className="text-[9px] font-mono text-muted-foreground tracking-[0.2em]">ARCHITECTURE DIAGRAM</span>
                        </div>
                        <div className="space-y-0">
                          {discovery.architectureLayers.map((layer, i) => (
                            <motion.div
                              key={layer}
                              initial={{ opacity: 0, x: -15 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.5 + i * 0.1 }}
                              className="relative"
                            >
                              <div
                                className="px-3 py-2 rounded-lg text-[11px] font-mono text-center relative z-10"
                                style={{
                                  background: `${discovery.color.replace(")", ` / ${0.04 + i * 0.02})`)}`,
                                  border: `1px solid ${discovery.color}${(15 + i * 5).toString(16)}`,
                                  color: i === discovery.architectureLayers.length - 1 ? discovery.color : "hsl(var(--foreground))",
                                  fontWeight: i === discovery.architectureLayers.length - 1 ? "700" : "400",
                                }}
                              >
                                {layer}
                              </div>
                              {i < discovery.architectureLayers.length - 1 && (
                                <div className="flex justify-center -my-0.5 relative z-0">
                                  <div className="w-px h-3" style={{ background: `${discovery.color}33` }} />
                                  <ArrowDown className="w-2.5 h-2.5 absolute -bottom-0.5" style={{ color: `${discovery.color}66` }} />
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Actions */}
              {phase === "complete" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="flex gap-2">
                  <button
                    onClick={addToGraph}
                    disabled={isAdded}
                    className={`flex-1 py-3 rounded-xl text-[11px] font-mono flex items-center justify-center gap-2 cursor-pointer transition-all ${
                      isAdded
                        ? "glass text-muted-foreground border-border/30"
                        : "glass hover:bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20 glow-cyan"
                    }`}
                  >
                    {isAdded ? (
                      <><Sparkles className="w-3.5 h-3.5" /> ADDED TO GRAPH</>
                    ) : (
                      <><Plus className="w-3.5 h-3.5" /> ADD TO GRAPH</>
                    )}
                  </button>
                  <button
                    onClick={nextDiscovery}
                    className="flex-1 py-3 rounded-xl text-[11px] font-mono glass hover:bg-neon-purple/10 text-neon-purple border-neon-purple/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    NEXT DISCOVERY
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIDiscoveryPanel;
