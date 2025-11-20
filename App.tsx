import React, { useState, useCallback } from 'react';
import { generateCircuit } from './services/geminiService';
import SchematicCanvas from './components/SchematicCanvas';
import WaveformViewer from './components/WaveformViewer';
import CodePanel from './components/CodePanel';
import { GeneratedDesign } from './types';
import { 
  Cpu, Zap, Play, Activity, Code2, GitBranch, FileText, 
  Sparkles, Layers, Send, Command, Box, Settings, Share2, 
  Download, LayoutGrid, MessageSquare, ChevronRight, 
  Maximize2, ChevronDown
} from 'lucide-react';

const PRESETS = [
  "4-bit Counter",
  "Full Adder",
  "Traffic Light Controller",
  "SPI Master"
];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [design, setDesign] = useState<GeneratedDesign | null>(null);
  const [activeRightTab, setActiveRightTab] = useState<'specs' | 'verilog' | 'tb'>('specs');
  const [showWaveform, setShowWaveform] = useState(true);
  
  // Chat history simulation
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', text: string}>>([
    { role: 'ai', text: "Welcome to LogicForge. Describe a digital circuit, and I'll design, code, and simulate it for you." }
  ]);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;
    
    // Add user message
    const userMsg = prompt;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setPrompt('');
    setLoading(true);

    // Add temp AI message
    setMessages(prev => [...prev, { role: 'ai', text: "Analyzing requirements and synthesizing circuit..." }]);

    try {
      const result = await generateCircuit(userMsg);
      setDesign(result);
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', text: "Design complete. Schematic, Verilog, and Simulation are ready." };
        return newMsgs;
      });
      setActiveRightTab('verilog');
    } catch (err: any) {
      setMessages(prev => {
        const newMsgs = [...prev];
        newMsgs[newMsgs.length - 1] = { role: 'ai', text: `Error: ${err.message || "Failed to generate design."}` };
        return newMsgs;
      });
    } finally {
      setLoading(false);
    }
  }, [prompt]);

  return (
    <div className="h-screen w-screen bg-eda-950 flex text-eda-text font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR: AI Co-pilot */}
      <aside className="w-80 flex flex-col border-r border-eda-800 bg-eda-900/50 backdrop-blur-sm z-20 shrink-0">
        {/* Sidebar Header */}
        <div className="h-14 border-b border-eda-800 flex items-center px-4 gap-3">
          <div className="bg-eda-accent/10 p-1.5 rounded-lg border border-eda-accent/20">
            <Cpu className="text-eda-accent h-5 w-5" />
          </div>
          <h1 className="font-bold tracking-tight text-white text-sm">LogicForge <span className="text-eda-600 font-normal ml-1">AI</span></h1>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
               <span className="text-[10px] font-mono text-eda-600 uppercase tracking-wider mb-1">
                 {msg.role === 'user' ? 'You' : 'LogicForge'}
               </span>
               <div className={`text-sm leading-relaxed p-3 rounded-xl max-w-[90%] ${
                 msg.role === 'user' 
                 ? 'bg-eda-accent/10 text-eda-accent border border-eda-accent/20 rounded-tr-sm' 
                 : 'bg-eda-800 text-eda-text border border-eda-800 rounded-tl-sm shadow-sm'
               }`}>
                 {msg.text}
               </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-eda-600 animate-pulse ml-1">
               <Sparkles size={12} /> Synthesizing hardware...
            </div>
          )}
          <div id="chat-end" />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-eda-800 bg-eda-900/80">
          {/* Presets */}
          <div className="flex gap-2 overflow-x-auto pb-3 no-scrollbar mask-fade-right">
             {PRESETS.map((p, i) => (
               <button 
                 key={i}
                 onClick={() => setPrompt(p)}
                 className="text-[10px] whitespace-nowrap px-2.5 py-1 rounded-full bg-eda-800 hover:bg-eda-700 border border-eda-700 transition-colors text-eda-text/70"
               >
                 {p}
               </button>
             ))}
          </div>
          
          <div className="relative group">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleGenerate();
                }
              }}
              placeholder="Describe your circuit..."
              className="w-full bg-eda-950 border border-eda-800 rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none focus:border-eda-accent/50 focus:ring-1 focus:ring-eda-accent/50 transition-all resize-none h-[100px] shadow-inner"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !prompt}
              className="absolute bottom-3 right-3 p-2 bg-eda-accent hover:bg-eda-accentHover text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
            >
              {loading ? <Activity className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
          <div className="text-[10px] text-center mt-2 text-eda-600">
             Generates Verilog, TB & Schematic
          </div>
        </div>
      </aside>

      {/* CENTER: Canvas & Simulation */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-[#050912]">
        
        {/* Top Toolbar Overlay */}
        <div className="absolute top-4 left-4 right-4 z-10 flex justify-between pointer-events-none">
            <div className="pointer-events-auto flex items-center gap-2 bg-eda-900/80 backdrop-blur-md p-1.5 rounded-lg border border-eda-800 shadow-xl">
               <button className="p-2 hover:bg-eda-800 rounded-md text-eda-text/70 hover:text-white transition-colors" title="Grid">
                 <LayoutGrid size={16} />
               </button>
               <div className="h-4 w-[1px] bg-eda-800"></div>
               <button className="p-2 hover:bg-eda-800 rounded-md text-eda-text/70 hover:text-white transition-colors" title="Zoom Fit">
                 <Maximize2 size={16} />
               </button>
               <span className="px-2 text-xs font-mono text-eda-600">{design ? "SCHEMATIC.v" : "EMPTY_WS"}</span>
            </div>

            <div className="pointer-events-auto flex items-center gap-2">
               <button className="flex items-center gap-2 bg-eda-accent text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-eda-accentHover shadow-lg shadow-blue-900/20 transition-all">
                  <Download size={14} /> Export Verilog
               </button>
               <button className="p-2 bg-eda-900/80 backdrop-blur hover:bg-eda-800 text-eda-text rounded-lg border border-eda-800 transition-colors">
                  <Settings size={16} />
               </button>
            </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden cursor-crosshair">
           {/* Grid Background handled in SchematicCanvas or CSS */}
           <div className="absolute inset-0 bg-dot-pattern opacity-[0.05] pointer-events-none" style={{backgroundSize: '20px 20px'}}></div>
           
           {design ? (
             <SchematicCanvas nodes={design.schematic.nodes} edges={design.schematic.edges} />
           ) : (
             <div className="absolute inset-0 flex flex-col items-center justify-center text-eda-700">
                <div className="w-32 h-32 rounded-full border border-dashed border-eda-800 flex items-center justify-center mb-4">
                   <LayoutGrid size={48} className="opacity-20" />
                </div>
                <p className="font-mono text-sm">Waiting for design input...</p>
             </div>
           )}
        </div>

        {/* Bottom Panel: Simulation */}
        <div className={`bg-eda-900 border-t border-eda-800 transition-all duration-300 ease-in-out flex flex-col ${showWaveform ? 'h-64' : 'h-10'}`}>
           <div 
             className="h-10 border-b border-eda-800 flex items-center justify-between px-4 cursor-pointer hover:bg-eda-800/50 transition-colors select-none"
             onClick={() => setShowWaveform(!showWaveform)}
           >
              <div className="flex items-center gap-3">
                <ChevronRight size={16} className={`transition-transform ${showWaveform ? 'rotate-90' : ''}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-eda-text flex items-center gap-2">
                  <Activity size={14} className="text-emerald-500" /> Simulation Results
                </span>
              </div>
              <div className="text-[10px] font-mono text-eda-600">
                 {design ? 'SIMULATION_COMPLETE' : 'NO_DATA'}
              </div>
           </div>
           
           {showWaveform && (
             <div className="flex-1 overflow-hidden relative bg-eda-950/50">
                <WaveformViewer simulation={design?.simulation || null} />
             </div>
           )}
        </div>
      </main>

      {/* RIGHT SIDEBAR: Inspector */}
      <aside className="w-80 bg-eda-900 border-l border-eda-800 flex flex-col shrink-0 z-20">
        {/* Tabs */}
        <div className="flex items-center border-b border-eda-800">
           <button 
             onClick={() => setActiveRightTab('specs')}
             className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeRightTab === 'specs' ? 'border-eda-accent text-white bg-eda-800/50' : 'border-transparent text-eda-600 hover:text-eda-text'}`}
           >
             Specs
           </button>
           <button 
             onClick={() => setActiveRightTab('verilog')}
             className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeRightTab === 'verilog' ? 'border-eda-accent text-white bg-eda-800/50' : 'border-transparent text-eda-600 hover:text-eda-text'}`}
           >
             Verilog
           </button>
           <button 
             onClick={() => setActiveRightTab('tb')}
             className={`flex-1 py-3 text-xs font-medium border-b-2 transition-colors ${activeRightTab === 'tb' ? 'border-eda-accent text-white bg-eda-800/50' : 'border-transparent text-eda-600 hover:text-eda-text'}`}
           >
             Testbench
           </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {activeRightTab === 'specs' && (
            <div className="p-5 space-y-6">
              <div>
                <h3 className="text-xs font-bold text-eda-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Box size={14} /> Module Info
                </h3>
                <div className="bg-eda-950 border border-eda-800 rounded-lg p-3 space-y-2">
                   <div className="flex justify-between text-xs">
                      <span className="text-eda-600">Name</span>
                      <span className="font-mono text-eda-text">generated_module</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-eda-600">Inputs</span>
                      <span className="font-mono text-eda-text">{design ? design.schematic.nodes.filter(n => n.type === 'INPUT').length : '-'}</span>
                   </div>
                   <div className="flex justify-between text-xs">
                      <span className="text-eda-600">Outputs</span>
                      <span className="font-mono text-eda-text">{design ? design.schematic.nodes.filter(n => n.type === 'OUTPUT').length : '-'}</span>
                   </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-bold text-eda-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare size={14} /> Explanation
                </h3>
                <div className="text-sm text-eda-text/80 leading-relaxed font-light">
                   {design?.explanation || "No design generated yet."}
                </div>
              </div>
            </div>
          )}

          {activeRightTab === 'verilog' && (
             <div className="h-full">
               <CodePanel title="module.v" code={design?.verilogCode || ''} language="verilog" />
             </div>
          )}

          {activeRightTab === 'tb' && (
             <div className="h-full">
               <CodePanel title="testbench.v" code={design?.testbenchCode || ''} language="verilog" />
             </div>
          )}
        </div>
      </aside>

    </div>
  );
};

export default App;