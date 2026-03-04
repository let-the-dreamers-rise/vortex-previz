import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, Send, X, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const mockResponses: Record<string, string> = {
  default:
    "I can help you explore the evolution of ideas across human knowledge. Try asking about specific concepts like neural networks, transformers, or the future of AI.",
  neural:
    "**Neural Networks** trace back to 1943 with the McCulloch-Pitts model. Key evolutionary branches include:\n\n• **1957** — Perceptron (single-layer learning)\n• **1986** — Backpropagation enables deep training\n• **1997** — LSTM introduces long-term memory\n• **2012** — AlexNet sparks the deep learning revolution\n\nThe idea genome shows high complexity (85%), near-universal adoption (95%), and massive influence (98%) across fields.",
  transformer:
    "**Transformers** emerged in 2017 from the merger of attention mechanisms and sequence modeling. Their genome reveals:\n\n• **Scalability**: 95% — scales elegantly with compute\n• **Influence**: 97% — reshaped NLP, vision, and beyond\n\nThey spawned GPT, BERT, and the foundation model paradigm.",
  future:
    "The AI Discovery Engine predicts several convergent ideas:\n\n🧠 **Adaptive Memory Transformer** — merging LSTM memory with transformer attention\n⚛️ **Quantum Diffusion Engine** — quantum-accelerated generative models\n🔮 **Neural Logic Synthesizer** — unifying neural and symbolic reasoning\n\nEach represents a novel combination of existing idea genomes.",
};

const ChatPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome to IdeaGenome. I'm your guide to the universe of knowledge. What would you like to explore?" },
  ]);
  const [input, setInput] = useState("");

  const getResponse = (msg: string): string => {
    const lower = msg.toLowerCase();
    if (lower.includes("neural")) return mockResponses.neural;
    if (lower.includes("transformer")) return mockResponses.transformer;
    if (lower.includes("future") || lower.includes("discover") || lower.includes("predict")) return mockResponses.future;
    return mockResponses.default;
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: getResponse(input) }]);
    }, 800);
  };

  return (
    <>
      {/* Toggle button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 glass rounded-full p-4 glow-cyan hover:scale-110 transition-transform"
          >
            <MessageCircle className="w-5 h-5 text-neon-cyan" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[480px] max-w-[calc(100vw-2rem)] glass rounded-2xl overflow-hidden z-30 flex flex-col"
            style={{ maxHeight: "400px" }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-neon-cyan" />
                <span className="text-sm font-semibold text-foreground">IdeaGenome AI</span>
                <span className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse-glow" />
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hidden p-4 space-y-3" style={{ minHeight: "200px" }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "assistant" ? "bg-neon-cyan/10 border border-neon-cyan/30" : "bg-neon-purple/10 border border-neon-purple/30"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-3 h-3 text-neon-cyan" />
                    ) : (
                      <User className="w-3 h-3 text-neon-purple" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                      msg.role === "assistant"
                        ? "glass text-foreground"
                        : "bg-neon-purple/15 border border-neon-purple/20 text-foreground"
                    }`}
                  >
                    {msg.content.split("\n").map((line, j) => (
                      <span key={j}>
                        {line.replace(/\*\*(.*?)\*\*/g, "«$1»").split("«").map((part, k) => {
                          if (part.includes("»")) {
                            const [bold, rest] = part.split("»");
                            return (
                              <span key={k}>
                                <strong className="text-foreground">{bold}</strong>
                                {rest}
                              </span>
                            );
                          }
                          return <span key={k}>{part}</span>;
                        })}
                        {j < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Input */}
            <div className="p-3 border-t border-border/50">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Explore the evolution of ideas..."
                  className="flex-1 bg-secondary rounded-xl px-4 py-2 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-neon-cyan/50 transition-all"
                />
                <button
                  onClick={handleSend}
                  className="p-2 rounded-xl bg-neon-cyan/15 border border-neon-cyan/30 hover:bg-neon-cyan/25 transition-colors"
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
