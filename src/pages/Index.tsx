import { useState } from "react";
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

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <ParticleBackground />
      <TopBar />
      <HUDOverlay />

      {/* Cinematic intro overlay */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            onAnimationComplete={() => {}}
          >
            <motion.div
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Glow burst */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.5, 0] }}
                transition={{ duration: 2, delay: 0.5 }}
              >
                <div className="w-96 h-96 rounded-full bg-neon-cyan/10 blur-3xl" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative"
              >
                <h1 className="text-5xl md:text-7xl font-bold text-foreground tracking-tighter text-glow-cyan">
                  IdeaGenome
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 text-sm font-mono text-muted-foreground tracking-[0.3em]"
                >
                  MAPPING THE EVOLUTION OF HUMAN KNOWLEDGE
                </motion.p>

                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1.2, duration: 0.8 }}
                  className="mt-6 neon-line mx-auto w-48"
                />

                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  onClick={() => setShowIntro(false)}
                  className="mt-8 px-8 py-3 glass rounded-full text-sm font-mono text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/10 transition-all glow-cyan cursor-pointer"
                >
                  ENTER THE UNIVERSE →
                </motion.button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Graph - center */}
      <div className="absolute inset-0 z-10">
        <KnowledgeGraph onSelectNode={setSelectedNode} selectedNode={selectedNode} />
      </div>

      {/* Evolution Timeline - left */}
      <EvolutionTimeline />

      {/* Idea Genome Panel - right (when node selected) */}
      <IdeaGenomePanel node={selectedNode} onClose={() => setSelectedNode(null)} />

      {/* AI Discovery Panel - bottom right (hidden when genome panel open) */}
      {!selectedNode && <AIDiscoveryPanel />}

      {/* Chat Panel - bottom center */}
      <ChatPanel />
    </div>
  );
};

export default Index;
