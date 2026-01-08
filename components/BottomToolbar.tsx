import React from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  ScanLine
} from 'lucide-react';

const BottomToolbar: React.FC<{ onNavigate: (id: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xs px-4 z-50">
      <div className="relative group">
        {/* 背景光效 */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-[2rem] blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        
        {/* 主容器 */}
        <div className="relative flex items-center justify-center bg-[#1e1e1e] rounded-[2rem] border border-white/10 shadow-2xl p-2 gap-4">
          
          <button
            onClick={() => window.open('https://gemini.google.com/app', '_blank')}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:scale-105 transition-transform duration-200"
            title="Gemini AI"
          >
            <Sparkles size={22} />
          </button>
          
          <button
            onClick={() => onNavigate('inspection')}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
            title="AI 智能巡检"
          >
            <ScanLine size={22} />
          </button>

          <button
            onClick={() => onNavigate('tantan')}
            className="w-12 h-12 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-all duration-200 hover:scale-105"
            title="探探"
          >
            <MessageSquare size={22} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomToolbar;
