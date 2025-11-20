import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GeneratedDesign, NodeType } from '../types';

const SYSTEM_INSTRUCTION = `
You are LogicForge, an expert Digital Logic Engineer and Verilog Designer. 
Your task is to accept a natural language description of a digital circuit and generate:
1. Synthesizable Verilog code.
2. A matching Testbench.
3. A clean, educational explanation.
4. A schematic representation (Nodes and Edges).
5. Simulation data (waveform values) illustrating the circuit's behavior.

**Schematic Rules:**
- Layout the nodes using x,y coordinates. Assume a canvas of 800x600.
- Inputs should be on the left (x < 150). Outputs on the right (x > 650).
- Logic gates in the middle.
- Flow should generally be Left -> Right.
- Use standard types: INPUT, OUTPUT, AND, OR, NOT, NAND, NOR, XOR, DFF, MODULE.

**Simulation Rules:**
- Provide 20-50 time steps of simulation data.
- Ensure the simulation shows interesting behavior (e.g., counter counting, reset logic).
- All signals in the waveform must correspond to inputs/outputs in the design.
`;

// Define the response schema for strict JSON generation
const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    verilogCode: { type: Type.STRING, description: "Complete Verilog module code" },
    testbenchCode: { type: Type.STRING, description: "Complete Verilog testbench code" },
    explanation: { type: Type.STRING, description: "Brief explanation of logic" },
    schematic: {
      type: Type.OBJECT,
      properties: {
        nodes: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: Object.values(NodeType) },
              label: { type: Type.STRING },
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER },
              inputs: { type: Type.ARRAY, items: { type: Type.STRING } },
              outputs: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["id", "type", "label", "x", "y"]
          }
        },
        edges: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              sourceNodeId: { type: Type.STRING },
              sourcePort: { type: Type.STRING },
              targetNodeId: { type: Type.STRING },
              targetPort: { type: Type.STRING }
            },
            required: ["id", "sourceNodeId", "targetNodeId"]
          }
        }
      },
      required: ["nodes", "edges"]
    },
    simulation: {
      type: Type.OBJECT,
      properties: {
        timeSteps: { type: Type.NUMBER },
        signals: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              data: { type: Type.ARRAY, items: { type: Type.NUMBER } }
            },
            required: ["name", "data"]
          }
        }
      },
      required: ["timeSteps", "signals"]
    }
  },
  required: ["verilogCode", "testbenchCode", "explanation", "schematic", "simulation"]
};

export const generateCircuit = async (prompt: string): Promise<GeneratedDesign> => {
  try {
    // Check for API key availability
    if (!process.env.API_KEY) {
        throw new Error("API_KEY is missing. Please set it in your environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Design request: "${prompt}". Create a valid and functional digital logic design.`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.2, // Low temperature for deterministic logic
      },
    });

    if (!response.text) {
        throw new Error("No response generated from AI.");
    }

    const data = JSON.parse(response.text) as GeneratedDesign;
    return data;

  } catch (error) {
    console.error("Error generating circuit:", error);
    throw error;
  }
};