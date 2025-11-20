# LogicForge
--
## Features

### Natural-Language → Verilog
Describe any circuit in English (ex, “4-bit synchronous counter”) and LogicForge auto-generates-
- Verilog module
- Testbench
- Circuit explanation
- Simulation vectors

### Interactive Logic Schematic
Clean, auto-laid-out visualization of the generated circuit:
- Gates, flip-flops, muxes, adders
- Input/output nodes
- Wire connections

### Real-Time Waveform Analyzer
Simulated timing diagrams showing:
- Clock edges  
- Reset behavior  
- Register updates  
- Signal transitions

### Tabs for Specs, Verilog, and Testbench
Quickly switch between the circuit description, HDL, and testbench code.

---

## Tech Stack
- **Frontend:** React, TypeScript, Tailwind  
- **Visualization:** React Flow / SVG Canvas  
- **Simulation:** JS/WASM logic engine  
- **Backend:** Node/Python + Gemini 3 API  

---

## Getting Started
Clone the repo and run:

```bash
cd frontend && npm install && npm run dev
cd backend && npm install && npm run dev

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
