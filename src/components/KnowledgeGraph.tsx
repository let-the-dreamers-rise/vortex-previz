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
}

const IDEA_NODES: IdeaNode[] = [
  {
    id: "neural-networks",
    label: "Neural Networks",
    x: 0, y: 0, size: 28,
    color: "hsl(180, 80%, 50%)",
    glowColor: "hsl(180, 80%, 50%)",
    category: "AI",
    connections: ["deep-learning", "backpropagation", "transformers"],
    traits: { complexity: 85, adoption: 95, scalability: 90, influence: 98 },
    description: "Computing systems inspired by biological neural networks, forming the foundation of modern AI.",
    year: 1943,
    fields: ["AI", "Neuroscience", "Mathematics"],
  },
  {
    id: "deep-learning",
    label: "Deep Learning",
    x: 180, y: -120, size: 24,
    color: "hsl(270, 60%, 55%)",
    glowColor: "hsl(270, 60%, 55%)",
    category: "AI",
    connections: ["neural-networks", "transformers", "generative-ai"],
    traits: { complexity: 90, adoption: 92, scalability: 88, influence: 95 },
    description: "Multi-layered neural networks that learn hierarchical representations of data.",
    year: 2006,
    fields: ["AI", "Computer Vision", "NLP"],
  },
  {
    id: "transformers",
    label: "Transformers",
    x: -160, y: -180, size: 26,
    color: "hsl(320, 70%, 55%)",
    glowColor: "hsl(320, 70%, 55%)",
    category: "AI",
    connections: ["neural-networks", "deep-learning", "attention"],
    traits: { complexity: 92, adoption: 88, scalability: 95, influence: 97 },
    description: "Architecture using self-attention mechanisms, revolutionizing NLP and beyond.",
    year: 2017,
    fields: ["NLP", "AI", "Sequence Modeling"],
  },
  {
    id: "backpropagation",
    label: "Backpropagation",
    x: 220, y: 100, size: 20,
    color: "hsl(170, 70%, 45%)",
    glowColor: "hsl(170, 70%, 45%)",
    category: "Mathematics",
    connections: ["neural-networks", "gradient-descent"],
    traits: { complexity: 70, adoption: 98, scalability: 85, influence: 90 },
    description: "Algorithm for computing gradients in neural networks via the chain rule.",
    year: 1986,
    fields: ["Mathematics", "AI", "Optimization"],
  },
  {
    id: "attention",
    label: "Attention Mechanism",
    x: -300, y: -50, size: 22,
    color: "hsl(210, 80%, 55%)",
    glowColor: "hsl(210, 80%, 55%)",
    category: "AI",
    connections: ["transformers", "generative-ai"],
    traits: { complexity: 80, adoption: 85, scalability: 92, influence: 88 },
    description: "Mechanism allowing models to focus on relevant parts of input sequences.",
    year: 2014,
    fields: ["AI", "NLP", "Computer Vision"],
  },
  {
    id: "generative-ai",
    label: "Generative AI",
    x: -100, y: 180, size: 25,
    color: "hsl(45, 80%, 55%)",
    glowColor: "hsl(45, 80%, 55%)",
    category: "AI",
    connections: ["deep-learning", "attention", "diffusion"],
    traits: { complexity: 88, adoption: 80, scalability: 90, influence: 92 },
    description: "AI systems capable of generating novel content: text, images, code, and more.",
    year: 2014,
    fields: ["AI", "Creative Computing", "NLP"],
  },
  {
    id: "gradient-descent",
    label: "Gradient Descent",
    x: 350, y: 20, size: 18,
    color: "hsl(140, 60%, 45%)",
    glowColor: "hsl(140, 60%, 45%)",
    category: "Mathematics",
    connections: ["backpropagation"],
    traits: { complexity: 50, adoption: 99, scalability: 80, influence: 85 },
    description: "Iterative optimization algorithm for minimizing loss functions.",
    year: 1847,
    fields: ["Mathematics", "Optimization"],
  },
  {
    id: "diffusion",
    label: "Diffusion Models",
    x: -250, y: 200, size: 21,
    color: "hsl(290, 65%, 50%)",
    glowColor: "hsl(290, 65%, 50%)",
    category: "AI",
    connections: ["generative-ai"],
    traits: { complexity: 88, adoption: 70, scalability: 82, influence: 78 },
    description: "Generative models that learn to reverse a noise diffusion process.",
    year: 2020,
    fields: ["AI", "Computer Vision", "Generative Models"],
  },
  {
    id: "quantum-ml",
    label: "Quantum ML",
    x: 300, y: -180, size: 19,
    color: "hsl(200, 90%, 55%)",
    glowColor: "hsl(200, 90%, 55%)",
    category: "Quantum",
    connections: ["neural-networks"],
    traits: { complexity: 98, adoption: 15, scalability: 60, influence: 45 },
    description: "Intersection of quantum computing and machine learning for exponential speedups.",
    year: 2014,
    fields: ["Quantum Computing", "AI", "Physics"],
  },
  {
    id: "neuro-symbolic",
    label: "Neuro-Symbolic AI",
    x: 100, y: -250, size: 20,
    color: "hsl(30, 80%, 55%)",
    glowColor: "hsl(30, 80%, 55%)",
    category: "AI",
    connections: ["neural-networks", "deep-learning"],
    traits: { complexity: 85, adoption: 30, scalability: 70, influence: 55 },
    description: "Combining neural networks with symbolic reasoning for more robust AI.",
    year: 2019,
    fields: ["AI", "Logic", "Cognitive Science"],
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
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((s) => Math.max(0.3, Math.min(3, s * delta)));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as SVGElement).closest(".idea-node")) return;
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }, [offset]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragging) return;
    setOffset({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    });
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
            <stop offset="0%" stopColor={node.glowColor} stopOpacity="0.6" />
            <stop offset="50%" stopColor={node.glowColor} stopOpacity="0.15" />
            <stop offset="100%" stopColor={node.glowColor} stopOpacity="0" />
          </radialGradient>
        ))}
        <filter id="blur-glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <g transform={`translate(${centerX + offset.x}, ${centerY + offset.y}) scale(${scale})`}>
        {/* Connection lines */}
        {IDEA_NODES.map((node) =>
          node.connections.map((connId) => {
            const target = IDEA_NODES.find((n) => n.id === connId);
            if (!target) return null;
            const isHighlighted =
              selectedNode?.id === node.id ||
              selectedNode?.id === connId ||
              hoveredNode === node.id ||
              hoveredNode === connId;

            const pulseOffset = Math.sin(time * 2 + node.x * 0.01) * 0.3 + 0.5;

            return (
              <line
                key={`${node.id}-${connId}`}
                x1={node.x}
                y1={node.y}
                x2={target.x}
                y2={target.y}
                stroke={isHighlighted ? "hsl(180, 80%, 50%)" : "hsl(220, 20%, 25%)"}
                strokeWidth={isHighlighted ? 2 : 1}
                strokeOpacity={isHighlighted ? 0.8 : pulseOffset * 0.3}
                strokeDasharray={isHighlighted ? "none" : "4 4"}
              />
            );
          })
        )}

        {/* Animated particles along connections */}
        {selectedNode &&
          selectedNode.connections.map((connId) => {
            const target = IDEA_NODES.find((n) => n.id === connId);
            if (!target) return null;
            const t = ((time * 0.5) % 1);
            const px = selectedNode.x + (target.x - selectedNode.x) * t;
            const py = selectedNode.y + (target.y - selectedNode.y) * t;
            return (
              <circle
                key={`particle-${connId}`}
                cx={px}
                cy={py}
                r={3}
                fill="hsl(180, 80%, 60%)"
                opacity={0.8}
              />
            );
          })}

        {/* Nodes */}
        {IDEA_NODES.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isHovered = hoveredNode === node.id;
          const isConnected = selectedNode?.connections.includes(node.id);
          const floatY = Math.sin(time + node.x * 0.01 + node.y * 0.01) * 3;

          return (
            <g
              key={node.id}
              className="idea-node cursor-pointer"
              transform={`translate(${node.x}, ${node.y + floatY})`}
              onClick={() => onSelectNode(isSelected ? null : node)}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
            >
              {/* Outer glow */}
              <circle
                r={node.size * 2.5}
                fill={`url(#glow-${node.id})`}
                opacity={isSelected ? 0.8 : isHovered ? 0.6 : 0.3}
              />

              {/* Main circle */}
              <circle
                r={node.size}
                fill={`${node.color.replace(")", " / 0.15)")}`}
                stroke={node.color}
                strokeWidth={isSelected ? 3 : isHovered ? 2.5 : 1.5}
                opacity={isSelected || isHovered || isConnected || !selectedNode ? 1 : 0.4}
                style={{
                  transition: "all 0.3s ease",
                  filter: isSelected || isHovered ? "brightness(1.3)" : "none",
                }}
              />

              {/* Inner pulse */}
              <circle
                r={node.size * 0.4}
                fill={node.color}
                opacity={0.3 + Math.sin(time * 2 + node.x) * 0.2}
              />

              {/* Label */}
              <text
                y={node.size + 18}
                textAnchor="middle"
                fill="hsl(200, 20%, 85%)"
                fontSize="11"
                fontFamily="Space Grotesk, sans-serif"
                fontWeight="500"
                opacity={isSelected || isHovered || isConnected || !selectedNode ? 1 : 0.4}
                style={{ transition: "opacity 0.3s" }}
              >
                {node.label}
              </text>

              {/* Category badge */}
              {(isSelected || isHovered) && (
                <text
                  y={node.size + 32}
                  textAnchor="middle"
                  fill={node.color}
                  fontSize="9"
                  fontFamily="JetBrains Mono, monospace"
                  opacity={0.8}
                >
                  {node.category}
                </text>
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
