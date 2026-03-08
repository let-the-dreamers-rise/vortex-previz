import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import type { IdeaNode } from "@/components/KnowledgeGraph";
import IdeaGenomePanel from "@/components/IdeaGenomePanel";
import EvolutionTimeline from "@/components/EvolutionTimeline";
import AIDiscoveryPanel from "@/components/AIDiscoveryPanel";
import ChatPanel from "@/components/ChatPanel";
import TopBar from "@/components/TopBar";
import HUDOverlay from "@/components/HUDOverlay";

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<IdeaNode | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [discoveredNodes, setDiscoveredNodes] = useState<IdeaNode[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);

  const handleDiscovery = useCallback((node: IdeaNode) => {
    setDiscoveredNodes(prev => {
      if (prev.some(n => n.id === node.id)) return prev;
      return [...prev, node];
    });
  }, []);

  const handleExplore = useCallback((domain: string) => {
    setActiveDomain(prev => prev === domain ? null : domain);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <ParticleBackground />
      <TopBar />
      <HUDOverlay />

      {/* Cinematic intro */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
          >
            {/* Pulsing rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-neon-cyan/10"
                  initial={{ width: 0, height: 0, opacity: 0 }}
                  animate={{ width: [0, 600], height: [0, 600], opacity: [0.3, 0] }}
                  transition={{ duration: 3, delay: 0.5 + i * 0.8, repeat: Infinity, ease: "easeOut" }}
                />
              ))}
            </div>

            {/* Glow burst */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.6, 0] }}
              transition={{ duration: 2.5, delay: 0.3 }}
            >
              <div className="w-[500px] h-[500px] rounded-full bg-neon-cyan/8 blur-[100px]" />
            </motion.div>

            <motion.div
              className="text-center relative z-10"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                {/* DNA helix icon */}
                <motion.div
                  className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center"
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ boxShadow: "0 0 40px hsl(180 80% 50% / 0.15)" }}
                >
                  <span className="text-3xl">🧬</span>
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter text-glow-cyan">
                  IdeaGenome
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-4 text-sm font-mono text-muted-foreground tracking-[0.3em]"
                >
                  MAPPING THE EVOLUTION OF HUMAN KNOWLEDGE
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.4, duration: 1 }}
                  className="mt-8 neon-line mx-auto w-56"
                />

                {/* Feature badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="mt-6 flex justify-center gap-3"
                >
                  {["AI Discovery", "Knowledge Graph", "Idea Genome"].map((label, i) => (
                    <motion.span
                      key={label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 2 + i * 0.15 }}
                      className="px-3 py-1.5 glass rounded-full text-[10px] font-mono text-muted-foreground"
                    >
                      {label}
                    </motion.span>
                  ))}
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.5 }}
                  onClick={() => setShowIntro(false)}
                  className="mt-10 px-10 py-4 glass rounded-full text-sm font-mono text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10 transition-all glow-cyan cursor-pointer group"
                >
                  <span className="group-hover:tracking-wider transition-all duration-300">ENTER THE UNIVERSE</span>
                  <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Graph */}
      <div className="absolute inset-0 z-10">
        <KnowledgeGraph
          onSelectNode={setSelectedNode}
          selectedNode={selectedNode}
          discoveredNodes={discoveredNodes}
          activeDomain={activeDomain}
          highlightedNodeIds={highlightedNodeIds}
        />
      </div>

      {/* Evolution Timeline */}
      <EvolutionTimeline />

      {/* Idea Genome Panel */}
      <IdeaGenomePanel node={selectedNode} onClose={() => setSelectedNode(null)} />

      {/* AI Discovery Panel */}
      {!selectedNode && (
        <AIDiscoveryPanel
          onDiscovery={handleDiscovery}
          onHighlightNodes={setHighlightedNodeIds}
        />
      )}

      {/* Chat Panel */}
      <ChatPanel onExplore={handleExplore} />
    </div>
  );
};

export default Index;
