// Node types for the schematic
export enum NodeType {
    INPUT = 'INPUT',
    OUTPUT = 'OUTPUT',
    AND = 'AND',
    OR = 'OR',
    NOT = 'NOT',
    NAND = 'NAND',
    NOR = 'NOR',
    XOR = 'XOR',
    DFF = 'DFF', // Flip-flop
    MODULE = 'MODULE' // Generic module (mux, adder, etc)
  }
  
  export interface Port {
    id: string;
    name: string;
    type: 'input' | 'output';
  }
  
  export interface CircuitNode {
    id: string;
    type: NodeType;
    label: string;
    x: number;
    y: number;
    inputs: string[];  // List of port names
    outputs: string[]; // List of port names
  }
  
  export interface CircuitEdge {
    id: string;
    sourceNodeId: string;
    sourcePort: string;
    targetNodeId: string;
    targetPort: string;
  }
  
  export interface WaveformSignal {
    name: string;
    data: number[]; // 0 or 1
  }
  
  export interface SimulationData {
    timeSteps: number;
    signals: WaveformSignal[];
  }
  
  export interface GeneratedDesign {
    verilogCode: string;
    testbenchCode: string;
    explanation: string;
    schematic: {
      nodes: CircuitNode[];
      edges: CircuitEdge[];
    };
    simulation: SimulationData;
  }
  
  export type ComplexityLevel = 'basic' | 'intermediate' | 'advanced';
  
  export interface GeneratorRequest {
    prompt: string;
    complexity: ComplexityLevel;
  }