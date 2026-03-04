import { motion } from "framer-motion";

const HUDOverlay = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-20">
      {/* Corner brackets - top left */}
      <div className="absolute top-16 left-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 15 L0 0 L15 0" stroke="hsl(180, 70%, 40%)" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>
      {/* Corner brackets - top right */}
      <div className="absolute top-16 right-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 15 L40 0 L25 0" stroke="hsl(180, 70%, 40%)" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>
      {/* Corner brackets - bottom left */}
      <div className="absolute bottom-4 left-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M0 25 L0 40 L15 40" stroke="hsl(180, 70%, 40%)" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>
      {/* Corner brackets - bottom right */}
      <div className="absolute bottom-4 right-4">
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <path d="M40 25 L40 40 L25 40" stroke="hsl(180, 70%, 40%)" strokeWidth="1" strokeOpacity="0.3" />
        </svg>
      </div>

      {/* Floating coordinate readout */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <div className="flex items-center gap-4 text-[9px] font-mono text-muted-foreground/50">
          <span>SYS.ACTIVE</span>
          <div className="w-px h-2.5 bg-muted-foreground/20" />
          <span>RENDER.60FPS</span>
          <div className="w-px h-2.5 bg-muted-foreground/20" />
          <span>GRAPH.STABLE</span>
        </div>
      </motion.div>
    </div>
  );
};

export default HUDOverlay;
