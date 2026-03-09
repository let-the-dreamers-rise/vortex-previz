import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, Sparkles, Dna, Zap, ArrowDown, Layers, Target, TrendingUp, ChevronRight } from "lucide-react";
import { IDEA_NODES } from "./KnowledgeGraph";

const DISCOVERY_COMBOS = [
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

type ReplayPhase = "intro" | "parent-reveal" | "genome-extract" | "fusion" | "birth" | "architecture" | "scores" | "transition" | "finale";

interface Props {
  open: boolean;
  onClose: () => void;
}

const DiscoveryReplay = ({ open, onClose }: Props) => {
  const [comboIndex, setComboIndex] = useState(0);
  const [phase, setPhase] = useState<ReplayPhase>("intro");
  const [visibleParents, setVisibleParents] = useState(0);
  const [visibleTraits, setVisibleTraits] = useState(0);
  const [visibleLayers, setVisibleLayers] = useState(0);
  const [showScores, setShowScores] = useState(false);
  const [scoreValues, setScoreValues] = useState({ novelty: 0, feasibility: 0, impact: 0 });
  const timerRef = useRef<NodeJS.Timeout[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const combo = DISCOVERY_COMBOS[comboIndex];
  const parents = combo.parentIds.map(id => IDEA_NODES.find(n => n.id === id)!).filter(Boolean);

  const TRAIT_MAP: Record<string, string[]> = {
    "neural-networks": ["biological inspiration", "weight learning", "universal approximation"],
    "deep-learning": ["hierarchical features", "end-to-end training", "representation learning"],
    "transformers": ["self-attention", "parallel computation", "positional encoding"],
    "backpropagation": ["gradient computation", "chain rule", "error propagation"],
    "attention": ["dynamic weighting", "context awareness", "selective focus"],
    "generative-ai": ["content creation", "latent space sampling", "distribution modeling"],
    "gradient-descent": ["loss minimization", "iterative optimization", "convergence"],
    "diffusion": ["noise scheduling", "denoising process", "score matching"],
    "quantum-ml": ["superposition", "entanglement", "quantum gates"],
    "neuro-symbolic": ["logical reasoning", "symbolic grounding", "rule extraction"],
  };

  const combinedTraits = combo.parentIds.flatMap(id => (TRAIT_MAP[id] || []).slice(0, 2));

  const clearTimers = useCallback(() => {
    timerRef.current.forEach(clearTimeout);
    timerRef.current = [];
  }, []);

  const t = (fn: () => void, ms: number) => {
    const timer = setTimeout(fn, ms);
    timerRef.current.push(timer);
    return timer;
  };

  // Particle background for replay
  useEffect(() => {
    if (!open) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; size: number; hue: number; life: number }[] = [];
    let time = 0;

    const animate = () => {
      time += 0.01;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Spawn particles
      if (Math.random() < 0.3) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          size: Math.random() * 2 + 0.5,
          hue: [180, 270, 320][Math.floor(Math.random() * 3)],
          life: 1,
        });
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.003;
        if (p.life <= 0) { particles.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 70%, 60%, ${p.life * 0.4})`;
        ctx.fill();
      }

      // Central pulse
      const pulseR = 150 + Math.sin(time * 2) * 30;
      const grad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, pulseR);
      grad.addColorStop(0, `hsla(180, 80%, 50%, ${0.03 + Math.sin(time * 1.5) * 0.01})`);
      grad.addColorStop(1, "transparent");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animRef.current);
  }, [open]);

  const runComboSequence = useCallback((idx: number) => {
    clearTimers();
    setComboIndex(idx);
    setVisibleParents(0);
    setVisibleTraits(0);
    setVisibleLayers(0);
    setShowScores(false);
    setScoreValues({ novelty: 0, feasibility: 0, impact: 0 });
    setPhase("parent-reveal");

    const c = DISCOVERY_COMBOS[idx];
    const p = c.parentIds.map(id => IDEA_NODES.find(n => n.id === id)!).filter(Boolean);

    // Reveal parents one by one
    p.forEach((_, i) => t(() => setVisibleParents(i + 1), i * 800));

    // Genome extraction
    t(() => setPhase("genome-extract"), p.length * 800 + 600);

    // Traits
    const traitStart = p.length * 800 + 1200;
    const traits = c.parentIds.flatMap(id => (TRAIT_MAP[id] || []).slice(0, 2));
    t(() => setPhase("fusion"), traitStart);
    traits.forEach((_, i) => t(() => setVisibleTraits(i + 1), traitStart + 300 + i * 350));

    // Birth
    const birthStart = traitStart + traits.length * 350 + 800;
    t(() => setPhase("birth"), birthStart);

    // Architecture
    const archStart = birthStart + 2000;
    t(() => setPhase("architecture"), archStart);
    c.architectureLayers.forEach((_, i) => t(() => setVisibleLayers(i + 1), archStart + 400 + i * 300));

    // Scores
    const scoreStart = archStart + c.architectureLayers.length * 300 + 600;
    t(() => {
      setPhase("scores");
      setShowScores(true);
      const avgComplexity = p.reduce((s, pp) => s + pp.traits.complexity, 0) / p.length;
      const avgAdoption = p.reduce((s, pp) => s + pp.traits.adoption, 0) / p.length;
      const avgInfluence = p.reduce((s, pp) => s + pp.traits.influence, 0) / p.length;
      setScoreValues({
        novelty: Math.min(99, Math.round(avgComplexity * 0.6 + p.length * 8 + 5)),
        feasibility: Math.min(99, Math.round(avgAdoption * 0.5 + 35)),
        impact: Math.min(99, Math.round(avgInfluence * 0.7 + 6)),
      });
    }, scoreStart);

    // Transition to next or finale
    const transStart = scoreStart + 2500;
    if (idx < DISCOVERY_COMBOS.length - 1) {
      t(() => {
        setPhase("transition");
        t(() => runComboSequence(idx + 1), 1200);
      }, transStart);
    } else {
      t(() => setPhase("finale"), transStart);
    }
  }, [clearTimers]);

  useEffect(() => {
    if (!open) { clearTimers(); return; }
    setPhase("intro");
    t(() => runComboSequence(0), 3000);
    return clearTimers;
  }, [open, runComboSequence, clearTimers]);

  if (!open) return null;

  const TRAIT_MAP_REF: Record<string, string[]> = {
    "neural-networks": ["biological inspiration", "weight learning", "universal approximation"],
    "deep-learning": ["hierarchical features", "end-to-end training", "representation learning"],
    "transformers": ["self-attention", "parallel computation", "positional encoding"],
    "backpropagation": ["gradient computation", "chain rule", "error propagation"],
    "attention": ["dynamic weighting", "context awareness", "selective focus"],
    "generative-ai": ["content creation", "latent space sampling", "distribution modeling"],
    "gradient-descent": ["loss minimization", "iterative optimization", "convergence"],
    "diffusion": ["noise scheduling", "denoising process", "score matching"],
    "quantum-ml": ["superposition", "entanglement", "quantum gates"],
    "neuro-symbolic": ["logical reasoning", "symbolic grounding", "rule extraction"],
  };

  const currentTraits = combo.parentIds.flatMap(id => (TRAIT_MAP_REF[id] || []).slice(0, 2));

  const parentHues = parents.map(p => {
    const m = p.color.match(/hsl\((\d+)/);
    return m ? parseInt(m[1]) : 180;
  });
  const avgHue = Math.round(parentHues.reduce((a, b) => a + b, 0) / parentHues.length);
  const discoveryColor = `hsl(${avgHue}, 75%, 55%)`;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-background" />
        <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{
          background: "radial-gradient(ellipse at center, transparent 30%, hsl(230 25% 3% / 0.8) 100%)"
        }} />

        {/* Close button */}
        <button
          onClick={() => { clearTimers(); onClose(); }}
          className="absolute top-6 right-6 z-[110] w-10 h-10 rounded-full glass flex items-center justify-center cursor-pointer hover:bg-secondary/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Discovery counter */}
        <div className="absolute top-6 left-6 z-[110]">
          <div className="flex items-center gap-3">
            {DISCOVERY_COMBOS.map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5"
              >
                <div
                  className={`w-8 h-1 rounded-full transition-all duration-500 ${
                    i < comboIndex ? "bg-primary" :
                    i === comboIndex ? "bg-primary shadow-[0_0_10px_hsl(var(--primary)/0.5)]" :
                    "bg-secondary"
                  }`}
                />
              </div>
            ))}
            <span className="text-[10px] font-mono text-muted-foreground ml-2">
              {comboIndex + 1} / {DISCOVERY_COMBOS.length}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-[105] max-w-3xl w-full px-8">
          <AnimatePresence mode="wait">

            {/* INTRO */}
            {phase === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                <motion.div
                  className="mx-auto mb-8 w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.2)" }}
                >
                  <Sparkles className="w-8 h-8 text-primary" />
                </motion.div>
                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter text-glow-cyan">
                  Discovery Replay
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-4 text-sm font-mono text-muted-foreground tracking-[0.3em]"
                >
                  {DISCOVERY_COMBOS.length} EMERGING CONCEPTS • CINEMATIC MODE
                </motion.p>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="mt-8 neon-line mx-auto w-48"
                />
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.5, 1] }}
                  transition={{ delay: 1.8, duration: 1.5 }}
                  className="mt-6 text-xs font-mono text-muted-foreground"
                >
                  INITIALIZING SYNTHESIS ENGINE...
                </motion.p>
              </motion.div>
            )}

            {/* PARENT REVEAL */}
            {phase === "parent-reveal" && (
              <motion.div
                key={`parents-${comboIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-8">
                  <Dna className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">
                    SOURCE GENOMES — DISCOVERY {comboIndex + 1}
                  </span>
                </div>
                <div className="flex justify-center items-center gap-6">
                  {parents.map((parent, i) => (
                    <AnimatePresence key={parent.id}>
                      {i < visibleParents && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0, y: 40 }}
                          animate={{ scale: 1, opacity: 1, y: 0 }}
                          transition={{ type: "spring", damping: 12, stiffness: 100 }}
                          className="flex flex-col items-center gap-3"
                        >
                          {i > 0 && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute text-2xl font-bold text-primary"
                              style={{ left: `calc(${(i * 100) / parents.length}% - 12px)`, top: "50%" }}
                            />
                          )}
                          <motion.div
                            className="w-24 h-24 rounded-2xl flex items-center justify-center relative"
                            style={{
                              background: `${parent.color.replace(")", " / 0.08)")}`,
                              border: `2px solid ${parent.color}44`,
                              boxShadow: `0 0 40px ${parent.color.replace(")", " / 0.15)")}`,
                            }}
                            animate={{ boxShadow: [
                              `0 0 40px ${parent.color.replace(")", " / 0.15)")}`,
                              `0 0 60px ${parent.color.replace(")", " / 0.25)")}`,
                              `0 0 40px ${parent.color.replace(")", " / 0.15)")}`,
                            ]}}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <div className="w-8 h-8 rounded-full" style={{ background: parent.color, boxShadow: `0 0 20px ${parent.color}` }} />
                          </motion.div>
                          <span className="text-sm font-mono" style={{ color: parent.color }}>{parent.label}</span>
                          <span className="text-[9px] font-mono text-muted-foreground">{parent.year}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
                {visibleParents >= parents.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 flex justify-center gap-2"
                  >
                    {parents.map((p, i) => (
                      <motion.span
                        key={p.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                        className="text-lg font-bold text-primary"
                      >
                        +
                      </motion.span>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* GENOME EXTRACT */}
            {phase === "genome-extract" && (
              <motion.div
                key={`extract-${comboIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Dna className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">EXTRACTING IDEA GENOMES</span>
                </div>
                <div className="flex justify-center gap-4">
                  {parents.map((p, i) => (
                    <motion.div
                      key={p.id}
                      className="glass rounded-xl p-4 w-48"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.3 }}
                    >
                      <div className="w-6 h-6 rounded-full mx-auto mb-3" style={{ background: p.color, boxShadow: `0 0 15px ${p.color}` }} />
                      <p className="text-xs font-mono mb-2" style={{ color: p.color }}>{p.label}</p>
                      <div className="space-y-1">
                        {(TRAIT_MAP_REF[p.id] || []).slice(0, 2).map((trait, ti) => (
                          <motion.div
                            key={trait}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.3 + ti * 0.2 + 0.5 }}
                            className="text-[10px] font-mono text-muted-foreground px-2 py-1 rounded-md bg-secondary/30"
                          >
                            {trait}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* FUSION */}
            {phase === "fusion" && (
              <motion.div
                key={`fusion-${comboIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Zap className="w-4 h-4 text-accent" />
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">COMBINING TRAIT SEQUENCES</span>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-lg mx-auto">
                  {currentTraits.map((trait, i) => (
                    <AnimatePresence key={trait}>
                      {i < visibleTraits && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0, rotate: -15 }}
                          animate={{ scale: 1, opacity: 1, rotate: 0 }}
                          transition={{ type: "spring", damping: 10 }}
                          className="px-4 py-2 rounded-full text-xs font-mono border"
                          style={{
                            color: discoveryColor,
                            background: `${discoveryColor.replace(")", " / 0.08)")}`,
                            borderColor: `${discoveryColor}33`,
                            boxShadow: `0 0 15px ${discoveryColor.replace(")", " / 0.1)")}`,
                          }}
                        >
                          ✓ {trait}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
                {visibleTraits >= currentTraits.length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8"
                  >
                    <ArrowDown className="w-6 h-6 text-primary mx-auto animate-bounce" />
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* BIRTH */}
            {phase === "birth" && (
              <motion.div
                key={`birth-${comboIndex}`}
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="text-center"
              >
                {/* Shockwave rings */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  {[0, 1, 2].map(i => (
                    <motion.div
                      key={i}
                      className="absolute rounded-full border"
                      style={{ borderColor: `${discoveryColor}33` }}
                      initial={{ width: 0, height: 0, opacity: 0.6 }}
                      animate={{ width: [0, 500], height: [0, 500], opacity: [0.6, 0] }}
                      transition={{ duration: 2, delay: i * 0.4, ease: "easeOut" }}
                    />
                  ))}
                </div>

                {/* Central glow burst */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.8, 0.2] }}
                  transition={{ duration: 1.5 }}
                >
                  <div className="w-[400px] h-[400px] rounded-full blur-[80px]" style={{ background: `${discoveryColor.replace(")", " / 0.15)")}` }} />
                </motion.div>

                <motion.div
                  className="relative z-10"
                  initial={{ y: 30 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                >
                  <motion.div
                    className="mx-auto mb-6 w-28 h-28 rounded-3xl flex items-center justify-center"
                    style={{
                      background: `${discoveryColor.replace(")", " / 0.1)")}`,
                      border: `2px solid ${discoveryColor}44`,
                      boxShadow: `0 0 80px ${discoveryColor.replace(")", " / 0.3)")}`,
                    }}
                    animate={{ boxShadow: [
                      `0 0 80px ${discoveryColor.replace(")", " / 0.3)")}`,
                      `0 0 120px ${discoveryColor.replace(")", " / 0.5)")}`,
                      `0 0 80px ${discoveryColor.replace(")", " / 0.3)")}`,
                    ]}}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-12 h-12" style={{ color: discoveryColor }} />
                  </motion.div>

                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-[10px] font-mono text-muted-foreground tracking-[0.3em] block mb-3"
                  >
                    EMERGING CONCEPT
                  </motion.span>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-4xl md:text-5xl font-bold text-foreground tracking-tight"
                    style={{ textShadow: `0 0 30px ${discoveryColor.replace(")", " / 0.4)")}` }}
                  >
                    {combo.name}
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-4 text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed"
                  >
                    {combo.description}
                  </motion.p>
                </motion.div>
              </motion.div>
            )}

            {/* ARCHITECTURE */}
            {phase === "architecture" && (
              <motion.div
                key={`arch-${comboIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Layers className="w-4 h-4" style={{ color: discoveryColor }} />
                  <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">ARCHITECTURE</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-8" style={{ textShadow: `0 0 20px ${discoveryColor.replace(")", " / 0.3)")}` }}>
                  {combo.name}
                </h3>
                <div className="max-w-sm mx-auto space-y-0">
                  {combo.architectureLayers.map((layer, i) => (
                    <AnimatePresence key={layer}>
                      {i < visibleLayers && (
                        <motion.div
                          initial={{ opacity: 0, x: -30, scale: 0.9 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          transition={{ type: "spring", damping: 15 }}
                        >
                          <div
                            className="px-6 py-3 rounded-xl text-sm font-mono text-center"
                            style={{
                              background: `${discoveryColor.replace(")", ` / ${0.04 + i * 0.025})`)}`,
                              border: `1px solid ${discoveryColor}${(20 + i * 8).toString(16)}`,
                              color: i === combo.architectureLayers.length - 1 ? discoveryColor : "hsl(var(--foreground))",
                              fontWeight: i === combo.architectureLayers.length - 1 ? 700 : 400,
                              boxShadow: i === combo.architectureLayers.length - 1 ? `0 0 20px ${discoveryColor.replace(")", " / 0.15)")}` : "none",
                            }}
                          >
                            {layer}
                          </div>
                          {i < combo.architectureLayers.length - 1 && (
                            <div className="flex justify-center -my-0.5">
                              <div className="w-px h-4" style={{ background: `${discoveryColor}33` }} />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SCORES */}
            {phase === "scores" && (
              <motion.div
                key={`scores-${comboIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center"
              >
                <h3 className="text-2xl font-bold text-foreground mb-2" style={{ textShadow: `0 0 20px ${discoveryColor.replace(")", " / 0.3)")}` }}>
                  {combo.name}
                </h3>
                <span className="text-[10px] font-mono text-muted-foreground tracking-[0.3em]">DISCOVERY METRICS</span>
                <div className="mt-8 max-w-md mx-auto space-y-5">
                  {(["novelty", "feasibility", "impact"] as const).map((key, i) => {
                    const icons = { novelty: Sparkles, feasibility: Target, impact: TrendingUp };
                    const colors = { novelty: "hsl(var(--neon-cyan))", feasibility: "hsl(var(--accent))", impact: "hsl(var(--neon-pink))" };
                    const Icon = icons[key];
                    return (
                      <motion.div
                        key={key}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.2 }}
                        className="flex items-center gap-4"
                      >
                        <Icon className="w-5 h-5 shrink-0" style={{ color: colors[key] }} />
                        <span className="text-xs font-mono text-muted-foreground w-24 uppercase tracking-wider text-left">{key}</span>
                        <div className="flex-1 h-3 rounded-full bg-secondary overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ background: `linear-gradient(90deg, ${colors[key]}, ${colors[key]}88)` }}
                            initial={{ width: 0 }}
                            animate={{ width: `${scoreValues[key]}%` }}
                            transition={{ duration: 1.5, delay: i * 0.2, ease: "easeOut" }}
                          />
                        </div>
                        <motion.span
                          className="text-lg font-mono font-bold w-16 text-right"
                          style={{ color: colors[key] }}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.2 + 0.5 }}
                        >
                          {scoreValues[key]}%
                        </motion.span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* TRANSITION */}
            {phase === "transition" && (
              <motion.div
                key={`transition-${comboIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: 1.2, times: [0, 0.2, 0.7, 1] }}
                className="text-center"
              >
                <ChevronRight className="w-8 h-8 text-primary mx-auto mb-4" />
                <span className="text-xs font-mono text-muted-foreground tracking-[0.3em]">
                  NEXT DISCOVERY
                </span>
              </motion.div>
            )}

            {/* FINALE */}
            {phase === "finale" && (
              <motion.div
                key="finale"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1 }}
                className="text-center"
              >
                <motion.div
                  className="mx-auto mb-6 w-20 h-20 rounded-3xl bg-primary/10 border border-primary/30 flex items-center justify-center"
                  style={{ boxShadow: "0 0 60px hsl(var(--primary) / 0.2)" }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="text-4xl">🧬</span>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight text-glow-cyan mb-4">
                  {DISCOVERY_COMBOS.length} Concepts Synthesized
                </h2>
                <p className="text-sm text-muted-foreground font-mono">
                  The knowledge universe has expanded
                </p>
                <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.5, duration: 1 }} className="mt-6 neon-line mx-auto w-48" />
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  {DISCOVERY_COMBOS.map((c, i) => (
                    <motion.span
                      key={c.name}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 + i * 0.15 }}
                      className="px-4 py-2 glass rounded-full text-xs font-mono text-primary"
                    >
                      {c.name}
                    </motion.span>
                  ))}
                </div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  onClick={onClose}
                  className="mt-10 px-8 py-3 glass rounded-full text-sm font-mono text-primary border-primary/30 hover:bg-primary/10 transition-all glow-cyan cursor-pointer"
                >
                  RETURN TO UNIVERSE →
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DiscoveryReplay;
