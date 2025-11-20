import React from 'react';
import { SimulationData } from '../types';

interface WaveformViewerProps {
  simulation: SimulationData | null;
}

const WaveformViewer: React.FC<WaveformViewerProps> = ({ simulation }) => {
  if (!simulation) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-eda-600 font-mono text-xs">
        <div className="mb-2 opacity-50">Waiting for simulation data...</div>
        <div className="w-16 h-1 bg-eda-800 rounded-full overflow-hidden">
             <div className="w-1/2 h-full bg-eda-700"></div>
        </div>
      </div>
    );
  }

  const STEP_WIDTH = 30;
  const ROW_HEIGHT = 40;
  const SIGNAL_HEIGHT = 20;
  const TOP_PADDING = 30;
  
  const totalWidth = Math.max(simulation.timeSteps * STEP_WIDTH, 1000);
  
  const getPolylinePoints = (data: number[]) => {
    let points = "";
    data.forEach((val, idx) => {
      const x1 = idx * STEP_WIDTH;
      const x2 = (idx + 1) * STEP_WIDTH;
      const y = val === 1 ? 0 : SIGNAL_HEIGHT;
      
      if (idx === 0) {
        points += `${x1},${y} `;
      } else {
        const prevVal = data[idx-1];
        const prevY = prevVal === 1 ? 0 : SIGNAL_HEIGHT;
        if (prevVal !== val) {
            points += `${x1},${prevY} ${x1},${y} `;
        }
      }
      points += `${x2},${y} `;
    });
    return points;
  };

  return (
    <div className="w-full h-full overflow-auto bg-[#080c14] custom-scrollbar relative">
      
      {/* Sticky Signal Names Column */}
      <div className="sticky left-0 top-0 z-10 bg-[#080c14] border-r border-eda-800 w-32 h-full absolute">
         <div className="h-[30px] border-b border-eda-800 bg-eda-900/50"></div> {/* Header spacer */}
         {simulation.signals.map((sig, idx) => {
             const isClock = sig.name.toLowerCase().includes('clk');
             return (
                <div key={sig.name} className="h-[40px] flex items-center justify-end px-3 border-b border-eda-800/50">
                    <span className={`font-mono text-xs font-bold ${isClock ? 'text-amber-400' : 'text-cyan-400'}`}>
                        {sig.name}
                    </span>
                </div>
             );
         })}
      </div>

      {/* Waveform Canvas */}
      <div className="absolute top-0 left-32">
        <svg width={totalWidth} height={simulation.signals.length * ROW_HEIGHT + 40} className="bg-[#080c14]">
            <defs>
                <pattern id="waveGrid" width={STEP_WIDTH} height={ROW_HEIGHT} patternUnits="userSpaceOnUse">
                    <path d={`M ${STEP_WIDTH} 0 L ${STEP_WIDTH} ${ROW_HEIGHT}`} stroke="#1e293b" strokeWidth="1" strokeDasharray="2 2"/>
                </pattern>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#waveGrid)" />

            {/* Time Ruler */}
            <g transform="translate(0, 20)">
                {Array.from({ length: simulation.timeSteps }).map((_, i) => (
                    <text key={i} x={i * STEP_WIDTH} y={0} fontSize="9" fill="#475569" textAnchor="start" className="font-mono">
                        {i * 10}ns
                    </text>
                ))}
            </g>

            {simulation.signals.map((sig, idx) => {
                const isClock = sig.name.toLowerCase().includes('clk');
                const color = isClock ? '#fbbf24' : '#22d3ee'; 
                const yOffset = TOP_PADDING + idx * ROW_HEIGHT + 10;

                return (
                <g key={sig.name} transform={`translate(0, ${yOffset})`}>
                    {/* Baseline */}
                    <line x1="0" y1={SIGNAL_HEIGHT} x2={totalWidth} y2={SIGNAL_HEIGHT} stroke="#1e293b" strokeWidth="1" />
                    
                    {/* Wave */}
                    <polyline
                        points={getPolylinePoints(sig.data)}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinejoin="round"
                    />
                </g>
                );
            })}
        </svg>
      </div>
    </div>
  );
};

export default WaveformViewer;