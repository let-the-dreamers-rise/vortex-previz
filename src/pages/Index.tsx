import { useState } from "react";
import ParticleBackground from "@/components/ParticleBackground";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import type { IdeaNode } from "@/components/KnowledgeGraph";
import IdeaGenomePanel from "@/components/IdeaGenomePanel";
import EvolutionTimeline from "@/components/EvolutionTimeline";
import AIDiscoveryPanel from "@/components/AIDiscoveryPanel";
import ChatPanel from "@/components/ChatPanel";
import TopBar from "@/components/TopBar";

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<IdeaNode | null>(null);

  return (
    <div className="w-screen h-screen overflow-hidden bg-background relative">
      <ParticleBackground />
      <TopBar />

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
