import React from 'react';
import Prism from '../components/Prism';
import { EFFICIENCY_TOOLS } from '../constants';

const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

const Efficiency: React.FC = () => {
  return (
    <div className="flex-1 p-6 lg:p-16 overflow-y-auto bg-transparent animate-fadeIn relative h-full">
      <div className="absolute inset-0 pointer-events-none z-0">
        <Prism 
          animationType="rotate" 
          timeScale={0.5} 
          height={3.5} 
          baseWidth={5.5} 
          scale={3.6} 
          hueShift={0} 
          colorFrequency={1} 
          noise={0} 
          glow={1} 
        /> 
      </div>
      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-8 lg:mb-12">
          <h2 className="text-3xl lg:text-4xl font-semibold text-white mb-4 tracking-tight">效率工具</h2>
          <p className="text-lg text-white/80 font-light">售前过程中的高频提效助手，一键打开即用。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {EFFICIENCY_TOOLS.map((tool) => (
            <div key={tool.id} className="bg-black/40 backdrop-blur-md rounded-[var(--radius-lg)] border border-white/10 p-6 lg:p-8 hover:border-white/30 hover:bg-black/50 hover:shadow-2xl transition-all duration-300 group">
              <div className="flex items-start justify-between gap-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[var(--radius-md)] bg-white/5 border border-white/10 flex items-center justify-center text-white/60 group-hover:text-white group-hover:bg-white/10 transition-colors">
                     <IconZap />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                       <h3 className="text-xl font-bold text-white">{tool.title}</h3>
                       <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/10 text-white/90 border border-white/10 uppercase tracking-wide">{tool.name}</span>
                    </div>
                    <a href={tool.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-white/40 hover:text-blue-400 truncate block mt-1 transition-colors">
                      {tool.url}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 rounded-[var(--radius-md)] p-5 border border-white/5 text-sm font-medium text-white/70 leading-relaxed italic mb-6">
                “{tool.highlight}”
              </div>

              <div className="flex items-center justify-between mt-auto pt-2">
                 <div className="flex flex-wrap gap-2">
                  {tool.skills.slice(0, 2).map((s) => (
                    <span key={`${tool.id}-${s}`} className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium text-white/60">
                      {s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-btn bg-black text-white hover:bg-gray-900 border border-white/10 px-3 lg:px-4 h-8 text-xs"
                  >
                    打开
                  </a>
                  <button
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(tool.url);
                      } catch {
                      }
                    }}
                    className="ui-btn bg-white/10 text-white hover:bg-white/20 border-white/10 px-3 lg:px-4 h-8 text-xs hidden sm:inline-flex"
                  >
                    复制
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Efficiency;
