import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitBranch, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface TimelineEvent {
  year: number;
  title: string;
  description: string;
  type: "origin" | "mutation" | "merge" | "branch";
  color: string;
}

const events: TimelineEvent[] = [
  { year: 1943, title: "McCulloch-Pitts Neuron", description: "First mathematical model of neural networks", type: "origin", color: "hsl(180, 80%, 50%)" },
  { year: 1957, title: "Perceptron", description: "Single-layer learning algorithm emerges", type: "branch", color: "hsl(170, 70%, 45%)" },
  { year: 1986, title: "Backpropagation", description: "Training deep networks becomes feasible", type: "mutation", color: "hsl(210, 80%, 55%)" },
  { year: 1997, title: "LSTM Networks", description: "Long-term memory in sequential models", type: "branch", color: "hsl(270, 60%, 55%)" },
  { year: 2012, title: "AlexNet Revolution", description: "Deep learning dominates computer vision", type: "mutation", color: "hsl(320, 70%, 55%)" },
  { year: 2014, title: "GANs Emerge", description: "Generative adversarial networks create synthetic data", type: "branch", color: "hsl(45, 80%, 55%)" },
  { year: 2017, title: "Attention Is All You Need", description: "Transformer architecture transforms NLP", type: "merge", color: "hsl(180, 80%, 50%)" },
  { year: 2020, title: "Diffusion Models", description: "New paradigm for generative AI", type: "branch", color: "hsl(290, 65%, 50%)" },
  { year: 2023, title: "Foundation Models", description: "Large-scale multi-modal AI systems", type: "merge", color: "hsl(200, 90%, 55%)" },
  { year: 2025, title: "Agentic AI", description: "Autonomous AI agents that plan, reason, and act", type: "merge", color: "hsl(160, 80%, 50%)" },
];

const typeIcons: Record<string, string> = {
  origin: "◉",
  mutation: "◈",
  merge: "⊕",
  branch: "⊶",
};

const typeLabels: Record<string, string> = {
  origin: "ORIGIN",
  mutation: "MUTATION",
  merge: "MERGE",
  branch: "BRANCH",
};

const EvolutionTimeline = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [hoveredEvent, setHoveredEvent] = useState<number | null>(null);

  return (
    <div className={`fixed left-4 top-20 bottom-4 ${collapsed ? 'w-12' : 'w-[300px]'} glass-strong rounded-2xl overflow-hidden z-20 flex flex-col border border-glass-border/60 transition-all duration-500`}>
      {/* Header */}
      <div
        className="p-4 border-b border-border/50 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center shrink-0">
            <GitBranch className="w-3.5 h-3.5 text-neon-cyan" />
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1">
              <h3 className="text-sm font-bold text-foreground tracking-tight">Evolution Timeline</h3>
              <span className="text-[8px] font-mono text-muted-foreground tracking-wider">IDEA PHYLOGENY</span>
            </motion.div>
          )}
          {!collapsed && (collapsed ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" />)}
        </div>
      </div>

      {!collapsed && (
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-4">
          <div className="relative">
            {/* Timeline spine */}
            <div className="absolute left-[13px] top-0 bottom-0 w-[2px]">
              <div className="h-full bg-gradient-to-b from-neon-cyan/40 via-neon-purple/20 to-transparent rounded-full" />
              {/* Animated pulse traveling down */}
              <motion.div
                className="absolute left-0 w-full h-8 rounded-full"
                style={{ background: "linear-gradient(to bottom, transparent, hsl(180 80% 50% / 0.4), transparent)" }}
                animate={{ top: ["-10%", "110%"] }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              />
            </div>

            <div className="space-y-1">
              {events.map((event, i) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                  className="relative pl-9 py-2 group"
                  onMouseEnter={() => setHoveredEvent(i)}
                  onMouseLeave={() => setHoveredEvent(null)}
                >
                  {/* Node */}
                  <motion.div
                    className="absolute left-0 top-3 w-7 h-7 rounded-full flex items-center justify-center text-[10px]"
                    style={{
                      border: `1.5px solid ${event.color}`,
                      background: hoveredEvent === i ? `${event.color.replace(")", " / 0.2)")}` : `${event.color.replace(")", " / 0.08)")}`,
                      boxShadow: hoveredEvent === i ? `0 0 16px ${event.color.replace(")", " / 0.4)")}` : `0 0 8px ${event.color.replace(")", " / 0.15)")}`,
                      transition: "all 0.3s ease",
                    }}
                  >
                    {typeIcons[event.type]}
                  </motion.div>

                  <div
                    className="glass rounded-xl p-3 transition-all duration-300"
                    style={{
                      borderColor: hoveredEvent === i ? `${event.color}33` : "transparent",
                      boxShadow: hoveredEvent === i ? `0 0 20px ${event.color.replace(")", " / 0.06)")}` : "none",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono font-bold" style={{ color: event.color }}>{event.year}</span>
                      <span className="text-[7px] font-mono text-muted-foreground/50 tracking-wider">{typeLabels[event.type]}</span>
                    </div>
                    <h4 className="text-xs font-semibold text-foreground">{event.title}</h4>
                    <AnimatePresence>
                      {hoveredEvent === i && (
                        <motion.p
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="text-[10px] text-muted-foreground mt-1 leading-relaxed overflow-hidden"
                        >
                          {event.description}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionTimeline;
