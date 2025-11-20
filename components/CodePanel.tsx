import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CodePanelProps {
  title: string;
  code: string;
  language?: string;
}

const CodePanel: React.FC<CodePanelProps> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-eda-900/30">
      <div className="flex items-center justify-between px-4 py-2 border-b border-eda-800 bg-eda-900/50">
        <span className="text-[10px] font-mono text-eda-600 uppercase">{title}</span>
        <button 
          onClick={handleCopy}
          className="text-eda-600 hover:text-eda-accent transition-colors p-1 hover:bg-eda-800 rounded"
          title="Copy to Clipboard"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
        </button>
      </div>
      <div className="flex-1 p-4 overflow-auto custom-scrollbar">
        {code ? (
             <pre className="text-xs font-mono text-eda-text/90 leading-relaxed whitespace-pre">
                <code>{code}</code>
             </pre>
        ) : (
             <div className="text-eda-600 text-xs italic text-center mt-10">// No code generated</div>
        )}
      </div>
    </div>
  );
};

export default CodePanel;