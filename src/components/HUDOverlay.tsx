import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const HUDOverlay = () => {
  const [dataPoints, setDataPoints] = useState(0);
  const [graphHash, setGraphHash] = useState("0xA3F7");

  useEffect(() => {
    const i = setInterval(() => {
      setDataPoints(d => d + Math.floor(Math.random() * 3));
      setGraphHash(`0x${Math.random().toString(16).slice(2, 6).toUpperCase()}`);
    }, 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Corner brackets with enhanced glow */}
      {[
        { pos: "top-16 left-4", d: "M0 20 L0 0 L20 0" },
        { pos: "top-16 right-4", d: "M50 20 L50 0 L30 0" },
        { pos: "bottom-4 left-4", d: "M0 30 L0 50 L20 50" },
        { pos: "bottom-4 right-4", d: "M50 30 L50 50 L30 50" },
      ].map((corner, i) => (
        <div key={i} className={`absolute ${corner.pos}`}>
          <svg width="50" height="50" viewBox="0 0 50 50" fill="none">
            <path d={corner.d} stroke="hsl(180, 70%, 40%)" strokeWidth="1.5" strokeOpacity="0.2" />
            <path d={corner.d} stroke="hsl(180, 70%, 50%)" strokeWidth="0.5" strokeOpacity="0.4" />
          </svg>
        </div>
      ))}

      {/* Left data stream */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute left-6 top-1/2 -translate-y-1/2 space-y-6"
      >
        {[
          { label: "ENTROPY", value: "0.847" },
          { label: "GRAPH.HASH", value: graphHash },
          { label: "DATA.PTS", value: dataPoints.toString() },
        ].map((item, i) => (
          <div key={i} className="space-y-0.5">
            <div className="text-[7px] font-mono text-muted-foreground/30 tracking-[0.2em]">{item.label}</div>
            <div className="text-[9px] font-mono text-neon-cyan/25">{item.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Right readouts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
        className="absolute right-6 top-1/2 -translate-y-1/2 text-right space-y-6"
      >
        {[
          { label: "RENDER", value: "60 FPS" },
          { label: "NODES", value: "ACTIVE" },
          { label: "SIM", value: "RUNNING" },
        ].map((item, i) => (
          <div key={i} className="space-y-0.5">
            <div className="text-[7px] font-mono text-muted-foreground/30 tracking-[0.2em]">{item.label}</div>
            <div className="text-[9px] font-mono text-neon-purple/25">{item.value}</div>
          </div>
        ))}
      </motion.div>

      {/* Bottom center readout */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-6 text-[8px] font-mono text-muted-foreground/30">
          <span>SYS.NOMINAL</span>
          <div className="w-px h-2.5 bg-muted-foreground/15" />
          <span>GRAPH.STABLE</span>
          <div className="w-px h-2.5 bg-muted-foreground/15" />
          <span>AI.ONLINE</span>
          <div className="w-px h-2.5 bg-muted-foreground/15" />
          <span>DISCOVERY.ACTIVE</span>
        </div>
      </motion.div>

      {/* Scanning crosshair in center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none" opacity="0.06">
          <line x1="20" y1="0" x2="20" y2="15" stroke="hsl(180, 80%, 50%)" strokeWidth="0.5" />
          <line x1="20" y1="25" x2="20" y2="40" stroke="hsl(180, 80%, 50%)" strokeWidth="0.5" />
          <line x1="0" y1="20" x2="15" y2="20" stroke="hsl(180, 80%, 50%)" strokeWidth="0.5" />
          <line x1="25" y1="20" x2="40" y2="20" stroke="hsl(180, 80%, 50%)" strokeWidth="0.5" />
          <circle cx="20" cy="20" r="8" stroke="hsl(180, 80%, 50%)" strokeWidth="0.3" />
        </svg>
      </div>
    </div>
  );
};

export default HUDOverlay;
