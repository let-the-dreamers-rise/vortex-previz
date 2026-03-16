import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ParticleBackground from "@/components/ParticleBackground";
import KnowledgeGraph from "@/components/KnowledgeGraph";
import type { IdeaNode } from "@/components/KnowledgeGraph";
import { IDEA_NODES, DOMAIN_NODES } from "@/components/KnowledgeGraph";
import StorytellerCodex from "@/components/StorytellerCodex";
import TopBar from "@/components/TopBar";
import HUDOverlay from "@/components/HUDOverlay";
import { Play, Image as ImageIcon, Sparkles, RefreshCcw, Film } from "lucide-react";
import { extractStyleGenome } from "@/lib/api";

const Index = () => {
  const [selectedSequence, setSelectedSequence] = useState<IdeaNode[]>([]);
  const [showIntro, setShowIntro] = useState(true);
  const [discoveredNodes, setDiscoveredNodes] = useState<IdeaNode[]>([]);
  const [activeDomain, setActiveDomain] = useState<string | null>(null);
  const [highlightedNodeIds, setHighlightedNodeIds] = useState<string[]>([]);
  
  // Timeline Sync State
  const [activeSequenceIndex, setActiveSequenceIndex] = useState<number | null>(null);
  
  // Style Genome Drag & Drop States
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingStyle, setIsExtractingStyle] = useState(false);

  // God-tier Node Spawner State
  const [newNodeInput, setNewNodeInput] = useState("");

  // Derived for backwards compatibility with existing panels
  const selectedNode = selectedSequence.length > 0 ? selectedSequence[selectedSequence.length - 1] : null;

  const { nodeCount, linkCount } = useMemo(() => {
    const domainExtra = activeDomain ? (DOMAIN_NODES[activeDomain] || []) : [];
    const allNodes = [...IDEA_NODES, ...domainExtra, ...discoveredNodes];
    const links = allNodes.reduce((sum, n) => sum + n.connections.filter(c => allNodes.some(a => a.id === c)).length, 0);
    return { nodeCount: allNodes.length, linkCount: links };
  }, [activeDomain, discoveredNodes]);

  // --- Drag & Drop Handlers ---
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      console.warn("Dropped file is not an image.");
      return;
    }

    setIsExtractingStyle(true);
    console.log(`📸 Image dropped: ${file.name}. Extracting Style Genome...`);
    
    try {
      const response = await extractStyleGenome(file);
      if (response.data && response.data.idea) {
        // Add the new Style Node to the graph
        const styleNode = { ...response.data.idea, isDiscovered: true };
        setDiscoveredNodes(prev => [...prev, styleNode]);
        // Also automatically select it to start a sequence
        setSelectedSequence(prev => [...prev, styleNode]);
      }
    } catch (err) {
      console.error("Failed to extract style genome", err);
    } finally {
      setIsExtractingStyle(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsExtractingStyle(true);
    console.log(`📸 Image selected: ${file.name}. Extracting Style Genome...`);
    
    try {
      const response = await extractStyleGenome(file);
      if (response.data && response.data.idea) {
        // Add the new Style Node to the graph
        const styleNode = { ...response.data.idea, isDiscovered: true };
        setDiscoveredNodes(prev => [...prev, styleNode]);
        // Also automatically select it to start a sequence
        setSelectedSequence(prev => [...prev, styleNode]);
      }
    } catch (err) {
      console.error("Failed to extract style genome", err);
    } finally {
      setIsExtractingStyle(false);
      // Reset input
      e.target.value = '';
    }
  }, []);

  return (
    <div 
      className="relative w-screen h-screen overflow-hidden bg-background vortex-grid"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Deep cinematic vignette */}
      <div className="absolute inset-0 pointer-events-none z-20" style={{
        boxShadow: "inset 0 0 250px 50px rgba(0,0,0,0.9)"
      }} />

      <ParticleBackground />
      <TopBar nodeCount={nodeCount} linkCount={linkCount} />
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
                <motion.div
                  className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center transform-gpu"
                  animate={{ 
                    rotate: [0, 5, -5, 0],
                    scale: [1, 1.05, 0.95, 1],
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity, 
                    ease: "easeInOut" 
                  }}
                  style={{ 
                    boxShadow: "0 0 30px hsl(180 80% 50% / 0.25)",
                    backdropFilter: "blur(10px)"
                  }}
                >
                  <Film className="w-8 h-8 text-neon-cyan animate-pulse" />
                </motion.div>

                <h1 className="text-6xl md:text-8xl font-bold text-foreground tracking-tighter text-glow-cyan">
                  Vortex Previz
                </h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="mt-4 text-sm font-mono text-muted-foreground tracking-[0.3em]"
                >
                  CINEMATIC SEQUENCE ENGINE
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
                  {["Semantic Video", "Style Genome", "Timeline Sync"].map((label, i) => (
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

      {/* Style Genome Extracting Overlay */}
      <AnimatePresence>
        {(isDragging || isExtractingStyle) && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-4 rounded-3xl border-2 border-dashed border-neon-cyan/50 bg-neon-cyan/5 flex flex-col items-center justify-center pointer-events-none">
              <motion.div
                animate={{ scale: isExtractingStyle ? [1, 1.1, 1] : 1, rotate: isExtractingStyle ? 360 : 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="w-24 h-24 rounded-full bg-neon-cyan/20 flex items-center justify-center mb-6 shadow-[0_0_50px_hsl(180_80%_50%_/_0.3)] glow-cyan"
              >
                {isExtractingStyle ? (
                  <RefreshCcw className="w-10 h-10 text-neon-cyan" />
                ) : (
                  <ImageIcon className="w-10 h-10 text-neon-cyan" />
                )}
              </motion.div>
              <h2 className="text-3xl font-bold text-foreground font-mono tracking-tight mb-2">
                {isExtractingStyle ? "EXTRACTING STYLE GENOME..." : "DROP IMAGE HERE"}
              </h2>
              <p className="text-neon-cyan/80 font-mono text-sm max-w-md text-center">
                {isExtractingStyle 
                  ? "Gemini Vision is analyzing the color grade, film grain, and lighting topology to create a reusable Style Node."
                  : "Upload a cinematic still. Our engine will mathematically extract its visual DNA to stylize your generated sequence."}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Knowledge Graph */}
      <div className="absolute inset-0 z-10">
        <KnowledgeGraph
          onSequenceChange={(seq) => {
            setSelectedSequence(seq);
            setActiveSequenceIndex(null); // Reset sync on sequence change
          }}
          onConnect={(sourceId, targetId) => {
            // Update the connection in the discoveredNodes state
            setDiscoveredNodes(prev => prev.map(n => 
              n.id === sourceId && !n.connections.includes(targetId)
                ? { ...n, connections: [...n.connections, targetId] }
                : n
            ));
          }}
          selectedSequence={selectedSequence}
          discoveredNodes={discoveredNodes}
          activeDomain={activeDomain}
          highlightedNodeIds={
            activeSequenceIndex !== null && selectedSequence[activeSequenceIndex] 
              ? [...highlightedNodeIds, selectedSequence[activeSequenceIndex].id] 
              : highlightedNodeIds
          }
        />
      </div>

      {/* God-Tier Node Spawner (Director's Terminal) */}
      {!showIntro && (
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ 
            y: 0, 
            opacity: 1,
            x: selectedSequence.length > 0 ? "-60%" : "-50%", // Shift left when sidebar is open
            width: selectedSequence.length > 0 ? "calc(100% - 540px)" : "100%" // Shrink to avoid sidebar
          }}
          transition={{ duration: 0.5, type: "spring", stiffness: 120, damping: 20 }}
          className="fixed bottom-8 left-1/2 z-40 max-w-3xl"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!newNodeInput.trim()) return;
              // Spawn relative to the parent, moving from left to right (cinematic timeline feel)
              let originX = 0;
              let originY = 0;
              if (selectedNode) {
                originX = selectedNode.x;
                originY = selectedNode.y;
              }
              const radius = 180 + Math.random() * 40;
              const angle = (Math.random() - 0.5) * Math.PI * 0.7; // Spread between roughly -60 and +60 degrees
              const x = originX + Math.cos(angle) * radius;
              const y = originY + Math.sin(angle) * radius;
              const newNode: IdeaNode = {
                id: `node-${Date.now()}`,
                label: newNodeInput.trim(),
                x, y,
                size: 26,
                color: "hsl(180, 100%, 50%)",
                glowColor: "hsl(180, 100%, 50%)",
                category: "SCENE_NODE",
                connections: selectedNode ? [selectedNode.id] : ["genesis"], // Attach to Genesis or last selected
                traits: { complexity: 50, adoption: 50, scalability: 50, influence: 50 },
                description: "Director's custom sequence node.",
                year: 2026,
                fields: ["Sequence", "Cinematic"],
                isDiscovered: true
              };
              
              setDiscoveredNodes(prev => [...prev, newNode]);
              setSelectedSequence(prev => {
                // If it's already connected to selectedNode, selecting the new node extends the sequence
                if (!prev.some(n => n.id === newNode.id)) {
                   return [...prev, newNode];
                }
                return prev;
              });
              setNewNodeInput("");
            }}
            className="flex items-center gap-3 glass-strong tech-bezel p-3 px-5 shadow-[0_0_40px_rgba(0,0,0,0.8)] border-neon-cyan/40"
          >
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse glow-cyan" />
            <span className="text-xs font-mono text-neon-cyan/70 tracking-widest hidden sm:inline">SPAWN</span>
            <input 
              type="text" 
              value={newNodeInput}
              onChange={e => setNewNodeInput(e.target.value)}
              placeholder="e.g. 'Cyberpunk Alleyway' + Enter"
              className="flex-1 bg-transparent border-none outline-none text-neon-cyan font-mono text-sm placeholder:text-neon-cyan/30"
              autoFocus
            />
            <button 
              type="submit" 
              className="px-4 py-1.5 rounded bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/30 text-neon-cyan text-xs font-mono transition-colors"
            >
              COMPILE NODE
            </button>
            <div className="w-px h-6 bg-glass-border/30 mx-1" />
            <button 
              type="button" 
              onClick={() => document.getElementById('style-upload')?.click()}
              className="px-4 py-1.5 flex items-center gap-2 rounded bg-neon-purple/10 hover:bg-neon-purple/20 border border-neon-purple/30 text-neon-purple text-xs font-mono transition-colors whitespace-nowrap"
            >
              <ImageIcon className="w-3 h-3" />
              + STYLE GENOME
            </button>
            <input 
              type="file" 
              id="style-upload" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload} 
            />
          </form>
        </motion.div>
      )}

      {/* Storyteller Codex Panel */}
      <StorytellerCodex 
        sequence={selectedSequence} 
        onClose={() => setSelectedSequence([])} 
        onShotChange={setActiveSequenceIndex}
      />
    </div>
  );
};

export default Index;
