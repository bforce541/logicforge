import React, { useRef, useEffect, useState } from 'react';
import { CircuitNode, CircuitEdge, NodeType } from '../types';

interface SchematicCanvasProps {
  nodes: CircuitNode[];
  edges: CircuitEdge[];
}

const SchematicCanvas: React.FC<SchematicCanvasProps> = ({ nodes, edges }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Center the design initially
  useEffect(() => {
    if (nodes.length > 0 && containerRef.current) {
       // Simple auto-center logic could go here
       setPan({ x: 50, y: 50 }); 
    }
  }, [nodes]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = e.clientX - lastMousePos.x;
      const dy = e.clientY - lastMousePos.y;
      setPan(p => ({ x: p.x + dx, y: p.y + dy }));
      setLastMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Helper to draw logic gates paths
  const getGatePath = (type: NodeType, w: number, h: number): string => {
    switch (type) {
      case NodeType.AND:
        return `M 0,0 L ${w/2},0 C ${w},0 ${w},${h} ${w/2},${h} L 0,${h} Z`;
      case NodeType.OR:
        return `M 0,0 C ${w/4},0 ${w/4},${h} 0,${h} C ${w},${h} ${w},0 0,0 Z`;
      case NodeType.XOR:
        return `M 5,0 C ${w/4+5},0 ${w/4+5},${h} 5,${h} M 10,0 C ${w/4+10},0 ${w/4+10},${h} 10,${h} C ${w+5},${h} ${w+5},0 10,0 Z`;
      case NodeType.NOT:
        return `M 0,0 L ${w-12},${h/2} L 0,${h} Z`;
      case NodeType.NAND:
        return `M 0,0 L ${w/2},0 C ${w},0 ${w},${h} ${w/2},${h} L 0,${h} Z`;
      case NodeType.NOR:
        return `M 0,0 C ${w/4},0 ${w/4},${h} 0,${h} C ${w},${h} ${w},0 0,0 Z`;
      case NodeType.DFF:
      case NodeType.MODULE:
      default:
        return `M 0,0 L ${w},0 L ${w},${h} L 0,${h} Z`;
    }
  };

  const NODE_WIDTH = 60;
  const NODE_HEIGHT = 60;

  return (
    <div 
      ref={containerRef}
      className="w-full h-full bg-[#02040a] relative overflow-hidden select-none"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute top-4 right-4 text-xs font-mono text-gray-500 pointer-events-none">
        PAN: {Math.round(pan.x)},{Math.round(pan.y)}
      </div>
      
      <svg 
        className="w-full h-full" 
        viewBox="0 0 1000 800"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0' }}
      >
        <defs>
           <linearGradient id="gateGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1e293b" />
                <stop offset="100%" stopColor="#0f172a" />
           </linearGradient>
           <linearGradient id="moduleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
           </linearGradient>
           <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
             <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.5" />
           </filter>
        </defs>
        
        {/* Grid Pattern */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5"/>
        </pattern>
        <rect width="10000" height="10000" x="-5000" y="-5000" fill="url(#grid)" />

        {/* Edges */}
        {edges.map((edge) => {
          const source = nodes.find(n => n.id === edge.sourceNodeId);
          const target = nodes.find(n => n.id === edge.targetNodeId);
          if (!source || !target) return null;

          const sx = source.x + NODE_WIDTH;
          const sy = source.y + NODE_HEIGHT / 2;
          const tx = target.x;
          const ty = target.y + NODE_HEIGHT / 2;
          
          // Orthogonal-ish bezier
          const c1x = sx + (tx - sx) * 0.5;
          const c2x = c1x;

          return (
            <g key={edge.id}>
              <path
                d={`M ${sx},${sy} C ${c1x},${sy} ${c2x},${ty} ${tx},${ty}`}
                fill="none"
                stroke="#475569"
                strokeWidth="2"
                className="transition-all hover:stroke-eda-accent hover:stroke-[3px]"
              />
              <circle cx={sx} cy={sy} r="2" fill="#94a3b8" />
              <circle cx={tx} cy={ty} r="2" fill="#94a3b8" />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => {
          const isIO = node.type === NodeType.INPUT || node.type === NodeType.OUTPUT;
          const isModule = node.type === NodeType.MODULE || node.type === NodeType.DFF;
          const hasBubble = [NodeType.NOT, NodeType.NAND, NodeType.NOR].includes(node.type);
          
          const shapeColor = isIO ? '#0f172a' : (isModule ? 'url(#moduleGradient)' : 'url(#gateGradient)');
          const strokeColor = isIO ? '#3b82f6' : (isModule ? '#8b5cf6' : '#94a3b8');

          return (
            <g key={node.id} transform={`translate(${node.x},${node.y})`} className="group cursor-pointer" filter="url(#shadow)">
               
               {/* Main Shape */}
               {isIO ? (
                 // IO Shape (Pill)
                 <rect 
                   x="0" y={NODE_HEIGHT/4} width={NODE_WIDTH} height={NODE_HEIGHT/2} rx="10"
                   fill="#02040a" stroke={strokeColor} strokeWidth="2"
                 />
               ) : (
                 <path
                    d={getGatePath(node.type, NODE_WIDTH, NODE_HEIGHT)}
                    fill={shapeColor}
                    stroke={strokeColor}
                    strokeWidth="2"
                 />
               )}

               {/* Inversion Bubble */}
               {hasBubble && (
                  <circle 
                    cx={node.type === NodeType.NOT ? NODE_WIDTH - 6 : NODE_WIDTH + 4} 
                    cy={NODE_HEIGHT / 2} 
                    r="4" 
                    fill="#1e293b" 
                    stroke={strokeColor} 
                    strokeWidth="2" 
                  />
               )}

               {/* Label */}
               <text 
                  x={NODE_WIDTH/2} 
                  y={isIO ? NODE_HEIGHT/2 + 4 : -10} 
                  textAnchor="middle" 
                  fill={isIO ? '#3b82f6' : '#cbd5e1'} 
                  fontSize={isIO ? "11" : "10"} 
                  fontWeight="bold"
                  className="font-mono pointer-events-none select-none"
               >
                 {node.label}
               </text>

               {/* Type Label for logic */}
               {!isIO && (
                   <text
                     x={NODE_WIDTH/2}
                     y={NODE_HEIGHT/2 + 4}
                     textAnchor="middle"
                     fill={strokeColor}
                     fontSize="9"
                     fontWeight="bold"
                     className="font-sans opacity-50 select-none"
                   >
                     {node.type}
                   </text>
               )}
               
               {/* Hover Glow Effect (Invisible hit area) */}
               <rect x="-10" y="-10" width={NODE_WIDTH+20} height={NODE_HEIGHT+20} fill="transparent" />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default SchematicCanvas;