import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface IdeaNode {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  glowColor: string;
  category: string;
  connections: string[];
  traits: {
    complexity: number;
    adoption: number;
    scalability: number;
    influence: number;
  };
  description: string;
  year: number;
  fields: string[];
  isDiscovered?: boolean;
  birthTime?: number;
}

const IDEA_NODES: IdeaNode[] = [
  {
    id: "genesis", label: "Genesis Slate", x: 0, y: 0, size: 30,
    color: "hsl(180, 100%, 50%)", glowColor: "hsl(180, 100%, 50%)", category: "System",
    connections: [],
    traits: { complexity: 10, adoption: 100, scalability: 100, influence: 100 },
    description: "The beginning of your sequence.",
    year: 2026, fields: ["Creation"],
  }
];

// Domain-specific additional nodes
const DOMAIN_NODES: Record<string, IdeaNode[]> = {};

interface Props {
  onSequenceChange: (seq: IdeaNode[]) => void;
  selectedSequence: IdeaNode[];
  discoveredNodes?: IdeaNode[];
  activeDomain?: string | null;
  highlightedNodeIds?: string[];
  onConnect?: (sourceId: string, targetId: string) => void;
}

const KnowledgeGraph = ({ onSequenceChange, selectedSequence, discoveredNodes = [], activeDomain, highlightedNodeIds = [], onConnect }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [birthTimes, setBirthTimes] = useState<Record<string, number>>({});
  const seenDiscoveredRef = useRef<Set<string>>(new Set());

  // Connecting Nodes State
  const [dragSource, setDragSource] = useState<string | null>(null);

  // Merge base nodes with domain and discovered nodes — stamp birth times
  const domainExtra = activeDomain ? (DOMAIN_NODES[activeDomain] || []) : [];
  const allNodes = [...IDEA_NODES, ...domainExtra, ...discoveredNodes];

  // Track when new discovered nodes appear and stamp with current internal time
  useEffect(() => {
    discoveredNodes.forEach(n => {
      if (!seenDiscoveredRef.current.has(n.id)) {
        seenDiscoveredRef.current.add(n.id);
        setBirthTimes(prev => ({ ...prev, [n.id]: time }));
      }
    });
  }, [discoveredNodes, time]);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.016), 16);
    return () => clearInterval(interval);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.93 : 1.07;
    setScale((s) => Math.max(0.2, Math.min(4, s * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest(".idea-node")) return;
    setDragging(true);
    didDrag.current = false;
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    if (!dragging) return;
    didDrag.current = true;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 700;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

  // Parallax offset based on mouse
  const parallaxX = (mousePos.x - centerX) * 0.008;
  const parallaxY = (mousePos.y - centerY) * 0.008;

  return (
    <svg
      ref={svgRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <defs>
        {allNodes.map((node) => (
          <radialGradient key={`grad-${node.id}`} id={`glow-${node.id}`}>
            <stop offset="0%" stopColor={node.glowColor} stopOpacity="0.9" />
            <stop offset="30%" stopColor={node.glowColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={node.glowColor} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-heavy">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="blur-light">
          <feGaussianBlur stdDeviation="3" />
        </filter>
        <filter id="blur-mega">
          <feGaussianBlur stdDeviation="20" />
        </filter>
        {/* Glow filter for discovered nodes */}
        <filter id="birth-glow" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        {/* Sequence Arrow Marker */}
        <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(180, 80%, 60%)" />
        </marker>
        <marker id="arrow-glow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="white" opacity="0.8" />
        </marker>
      </defs>

      <g transform={`translate(${centerX + offset.x}, ${centerY + offset.y}) scale(${scale})`}>

        {/* Deep space grid - parallax layer 1 */}
        <g opacity={0.04} transform={`translate(${parallaxX * -3}, ${parallaxY * -3})`}>
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`hg-${i}`} x1={-600} y1={-500 + i * 60} x2={600} y2={-500 + i * 60} stroke="hsl(180, 60%, 50%)" strokeWidth={0.5} />
          ))}
          {Array.from({ length: 20 }, (_, i) => (
            <line key={`vg-${i}`} x1={-600 + i * 60} y1={-500} x2={-600 + i * 60} y2={700} stroke="hsl(180, 60%, 50%)" strokeWidth={0.5} />
          ))}
        </g>

        {/* Gravitational field rings - parallax layer 2 */}
        <g transform={`translate(${parallaxX * -1.5}, ${parallaxY * -1.5})`}>
          {[100, 200, 320, 460].map((r, i) => (
            <circle
              key={`ring-${i}`}
              cx={0} cy={0} r={r}
              fill="none"
              stroke="hsl(180, 60%, 40%)"
              strokeWidth={0.4}
              strokeOpacity={0.06 + Math.sin(time * 0.5 + i) * 0.02}
              strokeDasharray={`${3 + i * 2} ${8 + i * 3}`}
              style={{ transform: `rotate(${time * (5 - i) * 2}deg)`, transformOrigin: 'center' }}
            />
          ))}
        </g>

        {/* Ambient nebula patches */}
        {[
          { x: -300, y: -200, r: 200, hue: 270 },
          { x: 250, y: 150, r: 180, hue: 180 },
          { x: 100, y: -350, r: 150, hue: 320 },
        ].map((neb, i) => (
          <circle
            key={`neb-${i}`}
            cx={neb.x + Math.sin(time * 0.3 + i) * 10}
            cy={neb.y + Math.cos(time * 0.2 + i) * 8}
            r={neb.r}
            fill={`hsl(${neb.hue}, 60%, 40%)`}
            filter="url(#blur-mega)"
          />
        ))}

        {/* Dynamic Drag Connection Line */}
        {dragSource && (() => {
          const sourceNode = allNodes.find(n => n.id === dragSource);
          if (sourceNode) {
            const mx = (mousePos.x - centerX - offset.x) / scale;
            const my = (mousePos.y - centerY - offset.y) / scale;
            return (
              <line 
                x1={sourceNode.x} y1={sourceNode.y} 
                x2={mx} y2={my} 
                stroke="hsl(180, 80%, 60%)" 
                strokeWidth={2} 
                strokeDasharray="4 4" 
                opacity={0.8} 
              />
            );
          }
          return null;
        })()}

        {/* Connection lines with depth */}
        {allNodes.map((node) =>
          node.connections.map((connId) => {
            const target = allNodes.find((n) => n.id === connId);
            if (!target) return null;
            
            const isNodeInSeq = selectedSequence.some(s => s.id === node.id);
            const isTargetInSeq = selectedSequence.some(s => s.id === connId);
            const isHighlighted =
              isNodeInSeq || isTargetInSeq ||
              hoveredNode === node.id || hoveredNode === connId ||
              highlightedNodeIds.includes(node.id) || highlightedNodeIds.includes(connId);

            // Don't draw the normal connection if it's an active sequence edge
            const isSequenceEdge = selectedSequence.findIndex(s => s.id === node.id) !== -1 && 
                                   selectedSequence.findIndex(s => s.id === connId) !== -1;

            if (isSequenceEdge) return null;

            const midX = (node.x + target.x) / 2 + Math.sin(time * 0.6 + node.y * 0.01) * 20;
            const midY = (node.y + target.y) / 2 + Math.cos(time * 0.5 + node.x * 0.01) * 20;

            // Breathing line width
            const breathe = 0.6 + Math.sin(time * 1.5 + node.x * 0.02) * 0.2;

            return (
              <g key={`${node.id}-${connId}`}>
                {isHighlighted && (
                  <path
                    d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={6}
                    strokeOpacity={0.08}
                    filter="url(#blur-light)"
                  />
                )}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={isHighlighted ? "hsl(180, 80%, 60%)" : "hsl(200, 30%, 35%)"}
                  strokeWidth={isHighlighted ? 2.2 : breathe + 0.3}
                  strokeOpacity={isHighlighted ? 0.95 : 0.35}
                  style={{ transition: "stroke-opacity 0.5s, stroke 0.5s, stroke-width 0.3s" }}
                />
              </g>
            );
          })
        )}

        {/* Energy pulses along highlighted connections */}
        {(selectedSequence.length > 0 || hoveredNode) && allNodes.filter(
          n => n.id === (selectedSequence[selectedSequence.length - 1]?.id || hoveredNode)
        ).map(node =>
          node.connections.map((connId, ci) => {
            const target = allNodes.find((n) => n.id === connId);
            if (!target) return null;
            return [0, 0.25, 0.5, 0.75].map((phaseOffset) => {
              const t = ((time * 0.5 + phaseOffset + ci * 0.15) % 1);
              // Quadratic bezier interpolation
              const midX = (node.x + target.x) / 2 + Math.sin(time * 0.6 + node.y * 0.01) * 20;
              const midY = (node.y + target.y) / 2 + Math.cos(time * 0.5 + node.x * 0.01) * 20;
              const px = (1 - t) * (1 - t) * node.x + 2 * (1 - t) * t * midX + t * t * target.x;
              const py = (1 - t) * (1 - t) * node.y + 2 * (1 - t) * t * midY + t * t * target.y;
              return (
                <g key={`pulse-${connId}-${phaseOffset}`}>
                  <circle cx={px} cy={py} r={8} fill={node.color} opacity={0.08} filter="url(#blur-light)" />
                  <circle cx={px} cy={py} r={3} fill={node.color} opacity={0.7 + Math.sin(time * 4) * 0.3} />
                  <circle cx={px} cy={py} r={1.2} fill="white" opacity={0.9} />
                </g>
              );
            });
          })
        )}

        {/* Birth convergence rays for newly discovered nodes */}
        {discoveredNodes.filter(n => birthTimes[n.id] !== undefined && (time - birthTimes[n.id]) < 3).map(node => {
          const age = time - (birthTimes[node.id] || 0);
          const parentNodes = allNodes.filter(p => node.connections.includes(p.id));
          return parentNodes.map(parent => {
            const progress = Math.min(1, age / 1.5);
            const sx = parent.x + (node.x - parent.x) * progress;
            const sy = parent.y + (node.y - parent.y) * progress;
            return (
              <g key={`birth-ray-${node.id}-${parent.id}`}>
                <line
                  x1={parent.x} y1={parent.y} x2={sx} y2={sy}
                  stroke={node.color}
                  strokeWidth={3 * (1 - progress)}
                  strokeOpacity={0.6 * (1 - progress)}
                  filter="url(#blur-light)"
                />
                {/* Spark at tip */}
                <circle cx={sx} cy={sy} r={4 * (1 - progress * 0.5)} fill={node.color} opacity={0.8 * (1 - progress)} />
              </g>
            );
          });
        })}

        {/* Sequence Path (The Storyboard Timeline) */}
        {selectedSequence.length > 1 && selectedSequence.map((node, idx) => {
          if (idx === selectedSequence.length - 1) return null;
          const target = selectedSequence[idx + 1];
          // We draw a straight, intense laser beam for the sequence edge
          return (
            <g key={`seq-${node.id}-${target.id}`}>
              <line
                x1={node.x} y1={node.y}
                x2={target.x} y2={target.y}
                stroke="hsl(180, 80%, 60%)"
                strokeWidth={5}
                strokeOpacity={0.6}
                filter="url(#blur-heavy)"
              />
              <line
                x1={node.x} y1={node.y}
                x2={target.x} y2={target.y}
                stroke="white"
                strokeWidth={2}
                strokeOpacity={0.9}
                markerEnd="url(#arrow-glow)"
              />
              {/* Animated particle traveling along the sequence path */}
              <circle r={4} fill="white" filter="url(#blur-light)">
                <animateMotion 
                  dur="1.5s" 
                  repeatCount="indefinite" 
                  path={`M ${node.x} ${node.y} L ${target.x} ${target.y}`} 
                />
              </circle>
            </g>
          );
        })}

        {/* Nodes */}
        {allNodes.map((node) => {
          const isSelected = selectedSequence.some(s => s.id === node.id);
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedSequence.some(s => s.connections.includes(node.id));
          const isHighlightTarget = highlightedNodeIds.includes(node.id);
          const floatY = Math.sin(time * 0.6 + node.x * 0.004 + node.y * 0.004) * 5;
          const floatX = Math.cos(time * 0.4 + node.y * 0.003) * 3;
          const pulseScale = 1 + Math.sin(time * 1.8 + node.x * 0.01) * 0.04;
          const active = isSelected || isHovered || isHighlightTarget;
          const dimmed = selectedSequence.length > 0 && !isSelected && !isConnected && !isHighlightTarget;
          const nodeBirthTime = node.isDiscovered ? birthTimes[node.id] : undefined;
          const isBorn = nodeBirthTime !== undefined && (time - nodeBirthTime) < 2;
          const birthAge = nodeBirthTime !== undefined ? time - nodeBirthTime : 0;
          const birthScale = isBorn ? Math.min(1, birthAge / 0.8) : 1;

          return (
            <g
              key={node.id}
              className="idea-node cursor-pointer"
              transform={`translate(${node.x + floatX}, ${node.y + floatY}) scale(${birthScale})`}
              onMouseDown={(e) => {
                e.stopPropagation();
                setDragSource(node.id);
              }}
              onMouseUp={(e) => {
                e.stopPropagation();
                if (dragSource && dragSource !== node.id) {
                  onConnect?.(dragSource, node.id);
                }
                setDragSource(null);
              }}
              onClick={(e) => { 
                e.stopPropagation(); 
                
                // Traverse connected nodes to build the cinematic sequence automatically!
                const getConnectedPath = (startNode: IdeaNode): IdeaNode[] => {
                  const path: IdeaNode[] = [];
                  const visited = new Set<string>();
                  const queue: IdeaNode[] = [startNode];
                  
                  while (queue.length > 0) {
                    const current = queue.shift()!;
                    if (visited.has(current.id)) continue;
                    
                    visited.add(current.id);
                    path.push(current);
                    
                    // Add all connected children to the queue
                    for (const connId of current.connections) {
                      const child = allNodes.find(n => n.id === connId);
                      if (child && !visited.has(child.id)) {
                        queue.push(child);
                      }
                    }
                  }
                  return path;
                };

                if (e.shiftKey) {
                  // Append to sequence manually
                  if (!isSelected) {
                    onSequenceChange([...selectedSequence, node]);
                  } else if (selectedSequence[selectedSequence.length - 1]?.id === node.id) {
                    onSequenceChange(selectedSequence.slice(0, -1));
                  }
                } else {
                  // Automatically select the entire chain of connections starting at this node
                  const autoPath = getConnectedPath(node);
                  onSequenceChange(isSelected && selectedSequence.length === autoPath.length ? [] : autoPath); 
                }
              }}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ transition: "opacity 0.4s" }}
            >
              {/* Invisible large hit target */}
              <circle r={node.size * 2.5} fill="transparent" />
              {/* Birth explosion ring */}
              {isBorn && (
                <>
                  <circle
                    r={node.size * (2 + birthAge * 4)}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={2 * (1 - Math.min(1, birthAge / 2))}
                    opacity={0.5 * (1 - Math.min(1, birthAge / 2))}
                  />
                  <circle
                    r={node.size * (1 + birthAge * 2)}
                    fill={node.color}
                    opacity={0.15 * (1 - Math.min(1, birthAge / 1.5))}
                    filter="url(#blur-heavy)"
                  />
                </>
              )}

              {/* GOD-TIER TIMELINE SYNC: Intense pulsing aura when this node's shot is actively playing */}
              {isHighlightTarget && (
                <>
                  {/* Massive expanding pulse ring */}
                  <circle
                    r={node.size * (2.5 + Math.sin(time * 3) * 0.8)}
                    fill="none"
                    stroke="hsl(40, 100%, 60%)"
                    strokeWidth={3 + Math.sin(time * 4) * 1.5}
                    opacity={0.6 + Math.sin(time * 3) * 0.3}
                  />
                  {/* Secondary counter-pulse */}
                  <circle
                    r={node.size * (3.2 + Math.cos(time * 2.5) * 0.6)}
                    fill="none"
                    stroke="hsl(180, 100%, 60%)"
                    strokeWidth={1.5}
                    strokeDasharray="6 4"
                    opacity={0.4 + Math.sin(time * 5) * 0.2}
                    style={{ transform: `rotate(${time * 90}deg)`, transformOrigin: "center" }}
                  />
                  {/* Core intense glow aura */}
                  <circle
                    r={node.size * 3}
                    fill="hsl(40, 100%, 55%)"
                    opacity={0.12 + Math.sin(time * 3) * 0.06}
                    filter="url(#blur-heavy)"
                  />
                  {/* Inner bright halo */}
                  <circle
                    r={node.size * 1.8}
                    fill="hsl(180, 100%, 70%)"
                    opacity={0.15 + Math.sin(time * 4) * 0.08}
                    filter="url(#blur-light)"
                  />
                </>
              )}

              {/* Mega deep glow */}
              <circle
                r={node.size * 4.5}
                fill={`url(#glow-${node.id})`}
                opacity={active ? 1 : dimmed ? 0.1 : 0.35}
                style={{ transition: "opacity 0.5s" }}
              />

              {/* Rotating orbital rings */}
              {active && (
                <>
                  <circle
                    r={node.size * 1.7}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.8}
                    strokeOpacity={0.5}
                    strokeDasharray="4 6"
                    style={{ transform: `rotate(${time * 60}deg)`, transformOrigin: "center" }}
                  />
                  <circle
                    r={node.size * 2.1}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.25}
                    strokeDasharray="2 10"
                    style={{ transform: `rotate(${-time * 35}deg)`, transformOrigin: "center" }}
                  />
                  <circle
                    r={node.size * 2.6}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.3}
                    strokeOpacity={0.15}
                    strokeDasharray="1 14"
                    style={{ transform: `rotate(${time * 20}deg)`, transformOrigin: "center" }}
                  />
                  {/* Orbiting particles */}
                  {[0, 1, 2].map(i => {
                    const angle = time * (1.5 + i * 0.5) + i * (Math.PI * 2 / 3);
                    const orbitR = node.size * (1.7 + i * 0.4);
                    return (
                      <circle
                        key={`orb-${i}`}
                        cx={Math.cos(angle) * orbitR}
                        cy={Math.sin(angle) * orbitR}
                        r={2}
                        fill={node.color}
                        opacity={0.8}
                      />
                    );
                  })}
                  {/* Sequence Order Number */}
                  {isSelected && (
                    <g transform={`translate(${node.size * 1.5}, -${node.size * 1.5})`}>
                      <circle r={12} fill="hsl(180, 80%, 20%)" stroke="hsl(180, 80%, 60%)" strokeWidth={2} />
                      <text 
                        y={4} 
                        textAnchor="middle" 
                        fill="white" 
                        fontSize="12" 
                        fontFamily="JetBrains Mono, monospace" 
                        fontWeight="bold"
                      >
                        {selectedSequence.findIndex(s => s.id === node.id) + 1}
                      </text>
                    </g>
                  )}
                </>
              )}

              {/* Soft aura */}
              <circle
                r={node.size * 1.4}
                fill={node.color}
                opacity={active ? 0.1 : 0.03}
                filter="url(#blur-heavy)"
                style={{ transition: "opacity 0.4s" }}
              />

              {/* Main sphere - gradient fill */}
              <circle
                r={node.size * pulseScale}
                fill={`${node.color.replace(")", " / 0.06)")}`}
                stroke={node.color}
                strokeWidth={active ? 2.5 : 1.2}
                opacity={dimmed ? 0.2 : 1}
                style={{
                  transition: "all 0.4s ease",
                  filter: active ? `drop-shadow(0 0 12px ${node.color}) drop-shadow(0 0 4px ${node.color})` : "none",
                }}
              />

              {/* Inner ring */}
              <circle
                r={node.size * 0.65}
                fill="none"
                stroke={node.color}
                strokeWidth={0.5}
                strokeOpacity={0.2}
                strokeDasharray="2 4"
              />

              {/* Bright inner core */}
              <circle
                r={node.size * 0.38}
                fill={node.color}
                opacity={0.3 + Math.sin(time * 2 + node.x) * 0.2}
              />

              {/* Hot center point */}
              <circle
                r={node.size * 0.15}
                fill="white"
                opacity={0.7 + Math.sin(time * 3.5 + node.y) * 0.25}
              />

              {/* Tiny spark */}
              <circle
                r={1}
                fill="white"
                opacity={Math.sin(time * 5 + node.x * 0.1) > 0.7 ? 0.9 : 0}
                cx={node.size * 0.3 * Math.cos(time * 2)}
                cy={node.size * 0.3 * Math.sin(time * 2)}
              />

              {/* Label with shadow */}
              <text
                y={node.size + 22}
                textAnchor="middle"
                fill="hsl(200, 20%, 90%)"
                fontSize="13"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="600"
                opacity={dimmed ? 0.15 : 1}
                style={{
                  transition: "opacity 0.4s",
                  filter: active ? `drop-shadow(0 0 8px ${node.color})` : "drop-shadow(0 2px 4px hsl(0 0% 0% / 0.5))",
                }}
              >
                {node.label}
              </text>

              {/* Category + year badge */}
              {active && (
                <g>
                  <rect
                    x={-28} y={node.size + 28}
                    width={56} height={18}
                    rx={5}
                    fill={`${node.color.replace(")", " / 0.12)")}`}
                    stroke={`${node.color.replace(")", " / 0.3)")}`}
                    strokeWidth={0.5}
                  />
                  <text
                    y={node.size + 40}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.category} · {node.year}
                  </text>
                </g>
              )}

              {/* Discovered badge */}
              {node.isDiscovered && (
                <g>
                  <rect
                    x={node.size * 0.5} y={-node.size - 8}
                    width={40} height={14}
                    rx={4}
                    fill="hsl(180, 80%, 50%)"
                    fillOpacity={0.15}
                    stroke="hsl(180, 80%, 50%)"
                    strokeWidth={0.5}
                    strokeOpacity={0.4}
                  />
                  <text
                    x={node.size * 0.5 + 20}
                    y={-node.size + 2}
                    textAnchor="middle"
                    fill="hsl(180, 80%, 50%)"
                    fontSize="7"
                    fontFamily="JetBrains Mono, monospace"
                    fontWeight="bold"
                  >
                    NEW
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Mouse-follow subtle light */}
        <circle
          cx={(mousePos.x - centerX - offset.x) / scale}
          cy={(mousePos.y - centerY - offset.y) / scale}
          r={80}
          fill="hsl(180, 70%, 50%)"
          opacity={0.015}
          filter="url(#blur-mega)"
          pointerEvents="none"
        />
      </g>
    </svg>
  );
};

export default KnowledgeGraph;
export { IDEA_NODES, DOMAIN_NODES };
