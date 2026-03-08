import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User, Compass, Sparkles } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
  type?: "text" | "exploration";
}

const DOMAIN_KEYWORDS: Record<string, string> = {
  neuroscience: "neuroscience",
  brain: "neuroscience",
  consciousness: "neuroscience",
  robotics: "robotics",
  robot: "robotics",
  embodied: "robotics",
  physics: "physics",
  quantum: "physics",
  string: "physics",
};

const mockResponses: Record<string, string> = {
  default: "I can help you explore the evolution of ideas. Try:\n\n🧠 **\"Explore neuroscience\"** — brain plasticity, consciousness\n🤖 **\"Explore robotics\"** — reinforcement learning, embodied AI\n⚛️ **\"Explore physics\"** — quantum computing, string theory\n\nOr ask about specific concepts like transformers, diffusion models, or the future of AI.",
  neural: "**Neural Networks** trace back to 1943 with the McCulloch-Pitts model.\n\n◉ **1943** — Mathematical neuron model\n◈ **1957** — Perceptron (single-layer learning)\n⊶ **1986** — Backpropagation enables deep training\n⊶ **1997** — LSTM introduces long-term memory\n⊕ **2012** — AlexNet sparks the deep learning revolution\n\nGenome: Complexity 85% · Adoption 95% · Influence 98%",
  transformer: "**Transformers** emerged in 2017 from the merger of attention + sequence modeling.\n\nGenome Profile:\n• **Scalability**: 95% — scales elegantly with compute\n• **Influence**: 97% — reshaped NLP, vision, and beyond\n• **Key Trait**: Self-attention mechanism\n\nSpawned GPT, BERT, and the entire foundation model paradigm.",
  future: "The Discovery Engine predicts convergent ideas:\n\n🧠 **Adaptive Memory Transformer** — LSTM memory + transformer attention\n⚛️ **Quantum Diffusion Engine** — quantum-accelerated generative models\n🔮 **Neural Logic Synthesizer** — unifying neural + symbolic reasoning\n\nClick **ADD TO GRAPH** in the Discovery Panel to visualize these.",
  explore_neuroscience: "🧠 **Shifting to Neuroscience domain...**\n\nNew nodes appearing:\n• **Brain Plasticity** — neural reorganization\n• **Consciousness** — the hard problem\n\nThe graph is evolving. Watch the new connections form!",
  explore_robotics: "🤖 **Shifting to Robotics domain...**\n\nNew nodes appearing:\n• **Reinforcement Learning** — reward-based optimization\n• **Embodied AI** — physical world interaction\n\nWatch the graph expand into physical intelligence!",
  explore_physics: "⚛️ **Shifting to Physics domain...**\n\nNew nodes appearing:\n• **Quantum Computing** — superposition computing\n• **String Theory** — one-dimensional strings\n\nThe knowledge universe just expanded!",
};

interface Props {
  onExplore?: (domain: string) => void;
}

const ChatPanel = ({ onExplore }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to IdeaGenome. I'm your guide to the knowledge universe.\n\nTry **\"Explore neuroscience\"** or **\"Explore robotics\"** to shift the graph to new domains.", type: "text" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getResponse = (msg: string): { text: string; domain?: string } => {
    const lower = msg.toLowerCase();

    // Check for exploration commands
    if (lower.includes("explore")) {
      for (const [keyword, domain] of Object.entries(DOMAIN_KEYWORDS)) {
        if (lower.includes(keyword)) {
          return { text: mockResponses[`explore_${domain}`] || mockResponses.default, domain };
        }
      }
    }
    if (lower.includes("neural") && !lower.includes("explore")) return { text: mockResponses.neural };
    if (lower.includes("transformer")) return { text: mockResponses.transformer };
    if (lower.includes("future") || lower.includes("discover") || lower.includes("predict")) return { text: mockResponses.future };
    return { text: mockResponses.default };
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input, type: "text" };
    setMessages((prev) => [...prev, userMsg]);
    const userInput = input;
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const { text, domain } = getResponse(userInput);
      setMessages((prev) => [...prev, { role: "assistant", content: text, type: domain ? "exploration" : "text" }]);
      setIsTyping(false);
      if (domain) {
        onExplore?.(domain);
      }
    }, 1000);
  };

  const quickExplore = (domain: string) => {
    setInput(`Explore ${domain}`);
    setTimeout(() => {
      const userMsg: Message = { role: "user", content: `Explore ${domain}`, type: "text" };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
      setTimeout(() => {
        const { text } = getResponse(`explore ${domain}`);
        setMessages((prev) => [...prev, { role: "assistant", content: text, type: "exploration" }]);
        setIsTyping(false);
        onExplore?.(domain);
      }, 800);
      setInput("");
    }, 100);
  };

  return (
    <>
      {/* Toggle */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0, y: 20 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 group"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-neon-cyan/20 blur-xl group-hover:bg-neon-cyan/30 transition-all" />
              <div className="relative glass rounded-full p-4 glow-cyan hover:scale-110 transition-transform border border-neon-cyan/30">
                <MessageCircle className="w-5 h-5 text-neon-cyan" />
              </div>
            </div>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="absolute -top-8 left-1/2 -translate-x-1/2 text-[9px] font-mono text-neon-cyan/60 whitespace-nowrap"
            >
              EXPLORE THE UNIVERSE
            </motion.span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 300, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 300, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 22, stiffness: 180 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[520px] max-w-[calc(100vw-2rem)] glass-strong rounded-2xl overflow-hidden z-30 flex flex-col border border-glass-border/60"
            style={{ maxHeight: "450px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5 text-neon-cyan" />
                </div>
                <div>
                  <span className="text-sm font-bold text-foreground">IdeaGenome AI</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse-glow" />
                    <span className="text-[8px] font-mono text-muted-foreground tracking-wider">EXPLORATION MODE</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Quick explore buttons */}
            <div className="px-4 py-2 border-b border-border/30 flex gap-2">
              {[
                { domain: "neuroscience", icon: "🧠", label: "Neuroscience" },
                { domain: "robotics", icon: "🤖", label: "Robotics" },
                { domain: "physics", icon: "⚛️", label: "Physics" },
              ].map(({ domain, icon, label }) => (
                <button
                  key={domain}
                  onClick={() => quickExplore(domain)}
                  className="px-3 py-1.5 rounded-lg glass text-[10px] font-mono text-muted-foreground hover:text-foreground hover:bg-neon-cyan/5 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                  <Compass className="w-2.5 h-2.5" />
                </button>
              ))}
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-hidden p-4 space-y-3" style={{ minHeight: "180px" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", damping: 20 }}
                  className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      msg.role === "assistant" ? "bg-neon-cyan/10 border border-neon-cyan/30" : "bg-neon-purple/10 border border-neon-purple/30"
                    }`}
                  >
                    {msg.role === "assistant" ? <Bot className="w-3.5 h-3.5 text-neon-cyan" /> : <User className="w-3.5 h-3.5 text-neon-purple" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                      msg.role === "assistant"
                        ? msg.type === "exploration"
                          ? "glass border-neon-cyan/20 text-foreground"
                          : "glass text-foreground"
                        : "bg-neon-purple/12 border border-neon-purple/20 text-foreground"
                    }`}
                    style={msg.type === "exploration" ? { boxShadow: "0 0 15px hsl(180 80% 50% / 0.05)" } : undefined}
                  >
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>
                        {line.replace(/\*\*(.*?)\*\*/g, "«$1»").split("«").map((part, k) => {
                          if (part.includes("»")) {
                            const [bold, rest] = part.split("»");
                            return <span key={k}><strong className="text-foreground font-semibold">{bold}</strong>{rest}</span>;
                          }
                          return <span key={k}>{part}</span>;
                        })}
                        {j < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                    <Bot className="w-3.5 h-3.5 text-neon-cyan" />
                  </div>
                  <div className="glass rounded-xl px-4 py-3 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-neon-cyan"
                        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Explore neuroscience, robotics, physics..."
                  className="flex-1 bg-secondary/60 rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  className="p-2.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 hover:bg-neon-cyan/20 transition-colors"
                >
                  <Send className="w-4 h-4 text-neon-cyan" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatPanel;
