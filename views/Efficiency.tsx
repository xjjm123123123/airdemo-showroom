import React from 'react';
import Prism from '../components/Prism';
import { EFFICIENCY_TOOLS } from '../constants';

const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;

type EfficiencyTool = (typeof EFFICIENCY_TOOLS)[number];

const ToolAvatar: React.FC<{ tool: EfficiencyTool }> = ({ tool }) => {
  if (tool.avatarUrl) {
    return (
      <img
        src={tool.avatarUrl}
        alt={tool.name}
        className="w-12 h-12 rounded-[var(--radius-md)] object-cover border border-white/10"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return <IconZap />;
};

const Efficiency: React.FC = () => {
  return (
    <div className="flex-1 p-6 lg:p-8 overflow-y-auto overflow-x-hidden no-scrollbar bg-transparent animate-fadeIn relative h-full">
      <div className="absolute inset-0 pointer-events-none z-0 opacity-40">
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
        <header className="mb-8 lg:mb-10">
          <h2 className="text-2xl lg:text-3xl font-semibold text-[color:var(--text)] mb-3 tracking-tight">数字员工</h2>
          <p className="text-base lg:text-lg text-[color:var(--text-2)] font-normal">售前过程中的高频提效助手，一键打开即用。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
          {EFFICIENCY_TOOLS.map((tool) => (
            <div key={tool.id} className="ui-card p-5 lg:p-6 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--bg-surface-2)] transition-all duration-300 group">
              <div className="flex items-start justify-between gap-4 mb-5 min-w-0">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-3)] group-hover:text-[color:var(--text)] transition-colors overflow-hidden">
                     <ToolAvatar tool={tool} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                       <h3 className="text-base font-semibold text-[color:var(--text)]">{tool.title}</h3>
                       <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-[color:var(--bg-surface-2)] text-[color:var(--text-2)] border border-[color:var(--border)] uppercase tracking-wide">{tool.name}</span>
                    </div>
                    <a href={tool.url} target="_blank" rel="noreferrer" className="text-xs font-normal text-[color:var(--text-3)] hover:text-[color:var(--primary)] truncate block mt-0.5 transition-colors max-w-full">
                      {tool.url}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[color:var(--bg-surface-2)] rounded-[var(--radius-md)] p-4 border border-[color:var(--border)] text-sm font-normal text-[color:var(--text-2)] leading-relaxed mb-5">
                “{tool.highlight}”
              </div>

              <div className="flex items-center justify-between mt-auto pt-1">
                 <div className="flex flex-wrap gap-2">
                  {tool.skills.slice(0, 2).map((s) => (
                    <span key={`${tool.id}-${s}`} className="px-2 py-0.5 rounded-md border border-[color:var(--border)] bg-[color:var(--bg-surface-1)] text-xs font-normal text-[color:var(--text-2)]">
                      {s}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ui-btn ui-btn-primary px-3 h-7 text-xs"
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
                    className="ui-btn ui-btn-secondary px-3 h-7 text-xs hidden sm:inline-flex"
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
