import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { IdeaNode } from "./KnowledgeGraph";
import { X, Film, Play, Image as ImageIcon, Volume2, Wand2, RefreshCcw } from "lucide-react";

interface Props {
  sequence: IdeaNode[];
  onClose: () => void;
  onGenerate?: () => void; 
  onShotChange?: (shotIndex: number) => void; // New prop for Timeline Sync
}

const StorytellerCodex = ({ sequence, onClose, onGenerate, onShotChange }: Props) => {
  // Streaming and Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [shots, setShots] = useState<any[]>([]);
  const [activeShotIndex, setActiveShotIndex] = useState<number>(-1);
  const [generationMode, setGenerationMode] = useState<"demo" | "live">("demo");

  // Web Speech API Voiceover Effect
  // Call useEffect to trigger voiceover whenever activeShotIndex changes
  if (typeof window !== "undefined") {
    // Need to use refs or effect to avoid infinite loops, doing it inside a regular useEffect below
  }

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatusMessage("Initializing Omni-Orchestrator...");
    setShots([]);
    setActiveShotIndex(-1);
    
    // Stop any current audio
    window.speechSynthesis.cancel();

    if (onGenerate) onGenerate();
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || '/api'}/generate-sequence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sequenceNodes: sequence.map(n => ({ id: n.id, label: n.label, category: n.category, connections: n.connections })),
          generationMode
        })
      });

      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || ""; // Keep the last incomplete chunk in the buffer

        for (const eventStr of events) {
          if (!eventStr.trim()) continue;
          
          const lines = eventStr.split('\n');
          let eventType = "message";
          let eventData = "";
          
          for (const line of lines) {
            if (line.startsWith("event: ")) eventType = line.substring(7).trim();
            if (line.startsWith("data: ")) eventData = line.substring(6).trim();
          }

          if (eventData) {
            const data = JSON.parse(eventData);
            
            if (eventType === "status") {
              setStatusMessage(data.message);
            } else if (eventType === "script_compiled") {
              setShots(data.shots);
              // We compile 1 shot less than nodes usually, but let's assume 1:1 mapping for the UI sync
            } else if (eventType === "shot_update") {
              setShots(prev => {
                const newShots = [...prev];
                newShots[data.shot_index] = data.shot;
                return newShots;
              });
              
              // Only trigger the active shot when it has ACTUAL visual assets (image or video)
              if (data.shot.image_url || data.shot.video_url) {
                 setActiveShotIndex(data.shot_index);
              }
            } else if (eventType === "compile_error" || eventType === "error") {
              setStatusMessage(`Error: ${data.message}`);
              setIsGenerating(false);
              return;
            } else if (eventType === "complete") {
              setStatusMessage("Sequence Generation Complete.");
              setIsGenerating(false);
              return;
            }
          }
        }
      }
    } catch (err) {
      console.error("Streaming error:", err);
      setStatusMessage("Failed to generate sequence.");
      setIsGenerating(false);
    }
  };

  // The Live Commentary Hook
  // Note: Since importing inline is bad, we will assume useEffect is imported top


  // The Live Commentary Hook
  useEffect(() => {
    if (activeShotIndex >= 0 && shots[activeShotIndex]) {
      const shot = shots[activeShotIndex];
      
      // Notify parent of shot change for Timeline Sync (God-Tier Feature 3)
      if (onShotChange) {
        onShotChange(activeShotIndex);
      }

      if (shot.voiceover) {
        window.speechSynthesis.cancel(); // Stop previous
        const utterance = new SpeechSynthesisUtterance(shot.voiceover);
        utterance.rate = 0.95; // Slightly slower for cinematic feel
        utterance.pitch = 0.9;
        // Try to find a good voice (Chrome specific, but falls back)
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes("Google UK English Female") || v.name.includes("Samantha"));
        if (preferredVoice) utterance.voice = preferredVoice;
        
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [activeShotIndex, shots]);

  if (sequence.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 600, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 600, opacity: 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed right-4 top-20 bottom-4 w-[480px] tech-bezel glass-strong overflow-hidden z-30 flex flex-col border border-glass-border/60 shadow-[0_0_50px_rgba(0,0,0,0.8)]"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/50 relative overflow-hidden bg-background/40">
          <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-neon-cyan/5 to-transparent" />
          <div className="relative flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 border border-neon-cyan/40 flex items-center justify-center glow-cyan">
                <Film className="w-5 h-5 text-neon-cyan" />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg tracking-tight">Cinematic Sequencer</h3>
                <p className="text-xs font-mono text-neon-cyan/80 mt-0.5">DIRECTOR'S TERMINAL</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary/80 transition-colors">
              <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto scrollbar-hidden p-5 flex flex-col gap-6">
          
          {/* Current Sequence Timeline */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-bold text-muted-foreground tracking-wider mb-2">SEQUENCE PATH</h4>
            <div className="flex flex-col gap-2 relative">
              {/* Subtle connecting line behind nodes */}
              <div className="absolute left-[13px] top-4 bottom-4 w-[2px] bg-border/40 rounded-full" />
              
              {sequence.map((node, i) => (
                <motion.div 
                  key={`${node.id}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 relative z-10"
                >
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-mono font-bold" 
                       style={{ backgroundColor: node.color.replace(')', ' / 0.15)'), color: node.color, border: `1px solid ${node.color}` }}>
                    {i + 1}
                  </div>
                  <div className="flex-1 glass-strong tech-bezel px-4 py-2 border-l-2 border-l-neon-cyan flex items-center justify-between">
                    <span className="text-sm font-medium">{node.label}</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase">{node.category}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating || sequence.length < 1}
              className={`w-full relative overflow-hidden group py-4 rounded-xl flex items-center justify-center gap-2 font-mono text-sm tracking-wide transition-all ${
                isGenerating 
                  ? "bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/50 cursor-not-allowed" 
                  : "bg-neon-cyan text-background hover:bg-neon-cyan/90 shadow-[0_0_20px_hsl(180,80%,50%/0.3)] hover:shadow-[0_0_30px_hsl(180,80%,50%/0.5)] cursor-pointer"
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                  COMPILING SUB-GRAPH...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  GENERATE PREVIZ SEQUENCE
                </>
              )}
              {/* Shine effect */}
              {!isGenerating && (
                <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
              )}
            </button>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className={`text-[10px] font-mono ${generationMode === 'demo' ? 'text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.4)]' : 'text-muted-foreground'}`}>FAST DEMO RUN</span>
              <button 
                type="button"
                disabled={isGenerating}
                onClick={() => setGenerationMode(prev => prev === "demo" ? "live" : "demo")}
                className={`w-10 h-5 rounded-full flex items-center p-1 transition-colors relative ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                style={{ backgroundColor: generationMode === "live" ? "hsl(180, 80%, 25%)" : "rgba(255,255,255,0.1)" }}
              >
                <motion.div 
                  className="w-3.5 h-3.5 rounded-full bg-white shadow-sm"
                  animate={{ x: generationMode === "live" ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </button>
              <span className={`text-[10px] font-mono ${generationMode === 'live' ? 'text-neon-cyan font-bold drop-shadow-[0_0_5px_rgba(0,255,255,0.8)]' : 'text-muted-foreground'}`}>LIVE VEO PRO (SLOW)</span>
            </div>
          </div>

          {/* Interactive Output Area */}
          <div className="flex-1 min-h-[250px] border border-glass-border tech-bezel bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            <div className="absolute inset-0 scanline pointer-events-none opacity-20" />
            
            {/* 1. Placeholder State */}
            {!isGenerating && shots.length === 0 && (
              <div className="text-center flex flex-col items-center gap-3">
                <div className="flex gap-4 opacity-40 mb-2">
                  <ImageIcon className="w-6 h-6" />
                  <Volume2 className="w-6 h-6" />
                  <Play className="w-6 h-6" />
                </div>
                <p className="text-xs font-mono text-muted-foreground">
                  Select 2 or more nodes and click Generate.<br/>
                  The compiled multimodal output will stream here.
                </p>
              </div>
            )}

            {/* 2. Generating / Status State (if no visuals yet) */}
            {(isGenerating && activeShotIndex === -1 && shots.length === 0) && (
              <div className="text-center flex flex-col items-center gap-4 w-full px-6">
                <div className="w-16 h-16 rounded-full border-t-2 border-neon-cyan animate-spin" />
                <p className="text-sm font-mono text-neon-cyan animate-pulse text-center">{statusMessage}</p>
              </div>
            )}

            {/* 3. The Live Sequence View */}
            {shots.length > 0 && activeShotIndex >= 0 && (
              <div className="absolute inset-0 w-full h-full flex flex-col bg-background/95">
                
                {/* Media Playback Area */}
                <div className="w-full aspect-video bg-black relative flex-shrink-0">
                  {shots[activeShotIndex].video_url ? (
                    <video 
                      src={shots[activeShotIndex].video_url} 
                      autoPlay 
                      loop 
                      muted 
                      className="w-full h-full object-cover"
                    />
                  ) : shots[activeShotIndex].image_url ? (
                    <img 
                      src={shots[activeShotIndex].image_url} 
                      alt="Shot Keyframe" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full border-t-2 border-neon-cyan animate-spin" />
                    </div>
                  )}

                  {/* Overlays */}
                  <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono text-white">
                    SHOT {activeShotIndex + 1}
                  </div>
                  <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-md rounded text-[9px] font-mono text-neon-cyan flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-neon-cyan animate-pulse" />
                    LIVE COMMENTARY ON
                  </div>
                </div>

                {/* Subtitles / Script Area */}
                <div className="flex-1 p-4 flex flex-col justify-center bg-gradient-to-t from-background to-secondary/10 border-t border-border/50">
                   <p className="text-sm italic text-foreground leading-relaxed border-l-2 border-neon-cyan pl-3">
                     "{shots[activeShotIndex].voiceover}"
                   </p>
                   <div className="mt-3 flex items-center gap-2 text-[10px] font-mono text-muted-foreground w-full justify-between">
                     <span>{statusMessage}</span>
                     <span>({activeShotIndex + 1} / {shots.length})</span>
                   </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StorytellerCodex;
