import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

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
}

const IDEA_NODES: IdeaNode[] = [
  {
    id: "neural-networks", label: "Neural Networks", x: 0, y: 0, size: 32,
    color: "hsl(180, 80%, 50%)", glowColor: "hsl(180, 80%, 50%)", category: "AI",
    connections: ["deep-learning", "backpropagation", "transformers"],
    traits: { complexity: 85, adoption: 95, scalability: 90, influence: 98 },
    description: "Computing systems inspired by biological neural networks, forming the foundation of modern AI.",
    year: 1943, fields: ["AI", "Neuroscience", "Mathematics"],
  },
  {
    id: "deep-learning", label: "Deep Learning", x: 200, y: -140, size: 27,
    color: "hsl(270, 60%, 55%)", glowColor: "hsl(270, 60%, 55%)", category: "AI",
    connections: ["neural-networks", "transformers", "generative-ai"],
    traits: { complexity: 90, adoption: 92, scalability: 88, influence: 95 },
    description: "Multi-layered neural networks that learn hierarchical representations of data.",
    year: 2006, fields: ["AI", "Computer Vision", "NLP"],
  },
  {
    id: "transformers", label: "Transformers", x: -180, y: -200, size: 29,
    color: "hsl(320, 70%, 55%)", glowColor: "hsl(320, 70%, 55%)", category: "AI",
    connections: ["neural-networks", "deep-learning", "attention"],
    traits: { complexity: 92, adoption: 88, scalability: 95, influence: 97 },
    description: "Architecture using self-attention mechanisms, revolutionizing NLP and beyond.",
    year: 2017, fields: ["NLP", "AI", "Sequence Modeling"],
  },
  {
    id: "backpropagation", label: "Backpropagation", x: 260, y: 110, size: 22,
    color: "hsl(170, 70%, 45%)", glowColor: "hsl(170, 70%, 45%)", category: "Mathematics",
    connections: ["neural-networks", "gradient-descent"],
    traits: { complexity: 70, adoption: 98, scalability: 85, influence: 90 },
    description: "Algorithm for computing gradients in neural networks via the chain rule.",
    year: 1986, fields: ["Mathematics", "AI", "Optimization"],
  },
  {
    id: "attention", label: "Attention Mechanism", x: -340, y: -60, size: 24,
    color: "hsl(210, 80%, 55%)", glowColor: "hsl(210, 80%, 55%)", category: "AI",
    connections: ["transformers", "generative-ai"],
    traits: { complexity: 80, adoption: 85, scalability: 92, influence: 88 },
    description: "Mechanism allowing models to focus on relevant parts of input sequences.",
    year: 2014, fields: ["AI", "NLP", "Computer Vision"],
  },
  {
    id: "generative-ai", label: "Generative AI", x: -120, y: 200, size: 28,
    color: "hsl(45, 80%, 55%)", glowColor: "hsl(45, 80%, 55%)", category: "AI",
    connections: ["deep-learning", "attention", "diffusion"],
    traits: { complexity: 88, adoption: 80, scalability: 90, influence: 92 },
    description: "AI systems capable of generating novel content: text, images, code, and more.",
    year: 2014, fields: ["AI", "Creative Computing", "NLP"],
  },
  {
    id: "gradient-descent", label: "Gradient Descent", x: 400, y: 30, size: 20,
    color: "hsl(140, 60%, 45%)", glowColor: "hsl(140, 60%, 45%)", category: "Mathematics",
    connections: ["backpropagation"],
    traits: { complexity: 50, adoption: 99, scalability: 80, influence: 85 },
    description: "Iterative optimization algorithm for minimizing loss functions.",
    year: 1847, fields: ["Mathematics", "Optimization"],
  },
  {
    id: "diffusion", label: "Diffusion Models", x: -290, y: 220, size: 23,
    color: "hsl(290, 65%, 50%)", glowColor: "hsl(290, 65%, 50%)", category: "AI",
    connections: ["generative-ai"],
    traits: { complexity: 88, adoption: 70, scalability: 82, influence: 78 },
    description: "Generative models that learn to reverse a noise diffusion process.",
    year: 2020, fields: ["AI", "Computer Vision", "Generative Models"],
  },
  {
    id: "quantum-ml", label: "Quantum ML", x: 340, y: -200, size: 21,
    color: "hsl(200, 90%, 55%)", glowColor: "hsl(200, 90%, 55%)", category: "Quantum",
    connections: ["neural-networks"],
    traits: { complexity: 98, adoption: 15, scalability: 60, influence: 45 },
    description: "Intersection of quantum computing and machine learning for exponential speedups.",
    year: 2014, fields: ["Quantum Computing", "AI", "Physics"],
  },
  {
    id: "neuro-symbolic", label: "Neuro-Symbolic AI", x: 120, y: -280, size: 22,
    color: "hsl(30, 80%, 55%)", glowColor: "hsl(30, 80%, 55%)", category: "AI",
    connections: ["neural-networks", "deep-learning"],
    traits: { complexity: 85, adoption: 30, scalability: 70, influence: 55 },
    description: "Combining neural networks with symbolic reasoning for more robust AI.",
    year: 2019, fields: ["AI", "Logic", "Cognitive Science"],
  },
];

interface Props {
  onSelectNode: (node: IdeaNode | null) => void;
  selectedNode: IdeaNode | null;
}

const KnowledgeGraph = ({ onSelectNode, selectedNode }: Props) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTime((t) => t + 0.02), 50);
    return () => clearInterval(interval);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.92 : 1.08;
    setScale((s) => Math.max(0.3, Math.min(3, s * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest(".idea-node")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(false), []);

  const centerX = typeof window !== "undefined" ? window.innerWidth / 2 : 700;
  const centerY = typeof window !== "undefined" ? window.innerHeight / 2 : 400;

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
        {IDEA_NODES.map((node) => (
          <radialGradient key={`grad-${node.id}`} id={`glow-${node.id}`}>
            <stop offset="0%" stopColor={node.glowColor} stopOpacity="0.8" />
            <stop offset="40%" stopColor={node.glowColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={node.glowColor} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-heavy">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id="blur-light">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      <g transform={`translate(${centerX + offset.x}, ${centerY + offset.y}) scale(${scale})`}>

        {/* Central gravitational rings */}
        {[120, 220, 340].map((r, i) => (
          <circle
            key={`ring-${i}`}
            cx={0} cy={0} r={r}
            fill="none"
            stroke="hsl(180, 60%, 40%)"
            strokeWidth={0.5}
            strokeOpacity={0.08 + Math.sin(time + i) * 0.03}
            strokeDasharray="6 12"
          />
        ))}

        {/* Connection lines with energy flow */}
        {IDEA_NODES.map((node) =>
          node.connections.map((connId) => {
            const target = IDEA_NODES.find((n) => n.id === connId);
            if (!target) return null;
            const isHighlighted =
              selectedNode?.id === node.id || selectedNode?.id === connId ||
              hoveredNode === node.id || hoveredNode === connId;

            const midX = (node.x + target.x) / 2 + Math.sin(time + node.y * 0.01) * 15;
            const midY = (node.y + target.y) / 2 + Math.cos(time + node.x * 0.01) * 15;

            return (
              <g key={`${node.id}-${connId}`}>
                {/* Glow line behind */}
                {isHighlighted && (
                  <path
                    d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                    fill="none"
                    stroke="hsl(180, 80%, 50%)"
                    strokeWidth={4}
                    strokeOpacity={0.15}
                    filter="url(#blur-light)"
                  />
                )}
                {/* Main line */}
                <path
                  d={`M ${node.x} ${node.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
                  fill="none"
                  stroke={isHighlighted ? "hsl(180, 80%, 55%)" : "hsl(220, 30%, 25%)"}
                  strokeWidth={isHighlighted ? 1.5 : 0.8}
                  strokeOpacity={isHighlighted ? 0.9 : 0.25}
                />
              </g>
            );
          })
        )}

        {/* Animated energy pulses along connections */}
        {(selectedNode || hoveredNode) && IDEA_NODES.filter(
          n => n.id === (selectedNode?.id || hoveredNode)
        ).map(node =>
          node.connections.map((connId, ci) => {
            const target = IDEA_NODES.find((n) => n.id === connId);
            if (!target) return null;
            // Multiple pulses
            return [0, 0.33, 0.66].map((phaseOffset) => {
              const t = ((time * 0.8 + phaseOffset + ci * 0.2) % 1);
              const px = node.x + (target.x - node.x) * t;
              const py = node.y + (target.y - node.y) * t;
              return (
                <g key={`pulse-${connId}-${phaseOffset}`}>
                  <circle cx={px} cy={py} r={6} fill={node.color} opacity={0.15} filter="url(#blur-light)" />
                  <circle cx={px} cy={py} r={2.5} fill={node.color} opacity={0.9} />
                </g>
              );
            });
          })
        )}

        {/* Nodes */}
        {IDEA_NODES.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedNode?.connections.includes(node.id);
          const floatY = Math.sin(time * 0.8 + node.x * 0.005 + node.y * 0.005) * 4;
          const pulseScale = 1 + Math.sin(time * 2 + node.x * 0.01) * 0.05;
          const active = isSelected || isHovered;
          const dimmed = selectedNode && !isSelected && !isConnected;

          return (
            <g
              key={node.id}
              className="idea-node cursor-pointer"
              transform={`translate(${node.x}, ${node.y + floatY})`}
              onClick={() => onSelectNode(isSelected ? null : node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Deep glow */}
              <circle
                r={node.size * 3.5}
                fill={`url(#glow-${node.id})`}
                opacity={active ? 1 : dimmed ? 0.15 : 0.4}
                style={{ transition: "opacity 0.4s" }}
              />

              {/* Orbital ring */}
              {active && (
                <>
                  <circle
                    r={node.size * 1.8}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.8}
                    strokeOpacity={0.4}
                    strokeDasharray="3 6"
                    style={{ transform: `rotate(${time * 40}deg)`, transformOrigin: "center" }}
                  />
                  <circle
                    r={node.size * 2.2}
                    fill="none"
                    stroke={node.color}
                    strokeWidth={0.5}
                    strokeOpacity={0.2}
                    strokeDasharray="2 8"
                    style={{ transform: `rotate(${-time * 25}deg)`, transformOrigin: "center" }}
                  />
                </>
              )}

              {/* Glow circle behind */}
              <circle
                r={node.size * 1.2}
                fill={node.color}
                opacity={active ? 0.12 : 0.05}
                filter="url(#blur-heavy)"
                style={{ transition: "opacity 0.3s" }}
              />

              {/* Main circle with gradient */}
              <circle
                r={node.size * pulseScale}
                fill={`${node.color.replace(")", " / 0.08)")}`}
                stroke={node.color}
                strokeWidth={active ? 2.5 : 1.5}
                opacity={dimmed ? 0.3 : 1}
                style={{ transition: "all 0.4s ease", filter: active ? `drop-shadow(0 0 8px ${node.color})` : "none" }}
              />

              {/* Inner bright core */}
              <circle
                r={node.size * 0.35}
                fill={node.color}
                opacity={0.4 + Math.sin(time * 2.5 + node.x) * 0.25}
              />

              {/* Tiny bright center */}
              <circle
                r={node.size * 0.12}
                fill="white"
                opacity={0.6 + Math.sin(time * 3 + node.y) * 0.3}
              />

              {/* Label */}
              <text
                y={node.size + 20}
                textAnchor="middle"
                fill="hsl(200, 20%, 88%)"
                fontSize="12"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="600"
                opacity={dimmed ? 0.25 : 1}
                style={{
                  transition: "opacity 0.4s",
                  filter: active ? `drop-shadow(0 0 6px ${node.color})` : "none",
                }}
              >
                {node.label}
              </text>

              {/* Year badge */}
              {active && (
                <g>
                  <rect
                    x={-20} y={node.size + 26}
                    width={40} height={16}
                    rx={4}
                    fill={`${node.color.replace(")", " / 0.15)")}`}
                    stroke={`${node.color.replace(")", " / 0.3)")}`}
                    strokeWidth={0.5}
                  />
                  <text
                    y={node.size + 37}
                    textAnchor="middle"
                    fill={node.color}
                    fontSize="9"
                    fontFamily="JetBrains Mono, monospace"
                  >
                    {node.year}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export default KnowledgeGraph;
export { IDEA_NODES };
