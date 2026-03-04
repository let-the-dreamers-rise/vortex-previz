import { motion } from "framer-motion";
import { GitBranch, Clock } from "lucide-react";

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
];

const typeIcons: Record<string, string> = {
  origin: "◉",
  mutation: "◈",
  merge: "⊕",
  branch: "⊶",
};

const EvolutionTimeline = () => {
  return (
    <div className="fixed left-4 top-20 bottom-4 w-[280px] glass rounded-2xl overflow-hidden z-20 flex flex-col">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-neon-cyan" />
          <h3 className="text-sm font-semibold text-foreground">Evolution Timeline</h3>
        </div>
        <p className="text-xs text-muted-foreground mt-1">How ideas evolve over time</p>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hidden p-4">
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[11px] top-0 bottom-0 w-px bg-gradient-to-b from-neon-cyan/50 via-neon-purple/30 to-transparent" />

          <div className="space-y-1">
            {events.map((event, i) => (
              <motion.div
                key={event.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="relative pl-8 py-2 group"
              >
                {/* Node */}
                <div
                  className="absolute left-0 top-3 w-6 h-6 rounded-full flex items-center justify-center text-[10px] border"
                  style={{
                    borderColor: event.color,
                    background: `${event.color.replace(")", " / 0.15)")}`,
                    boxShadow: `0 0 10px ${event.color.replace(")", " / 0.3)")}`,
                  }}
                >
                  {typeIcons[event.type]}
                </div>

                <div className="glass rounded-lg p-3 group-hover:border-glass-border transition-all">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-[10px] font-mono" style={{ color: event.color }}>{event.year}</span>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">{event.title}</h4>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{event.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvolutionTimeline;
