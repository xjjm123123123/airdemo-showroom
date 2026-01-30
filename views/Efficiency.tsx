import React from 'react';
import { Zap, FileText, PlayCircle } from 'lucide-react';
import Prism from '../components/Prism';
import { EfficiencyTool } from '../types';

const ToolAvatar: React.FC<{ tool: EfficiencyTool }> = ({ tool }) => {
  if (tool.avatarUrl) {
    return (
      <img
        src={tool.avatarUrl}
        alt={tool.name || tool.title}
        className="w-full h-full object-cover"
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }
  return <Zap size={16} />;
};

const Efficiency: React.FC<{ tools: EfficiencyTool[] }> = ({ tools }) => {
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden no-scrollbar bg-transparent animate-fadeIn relative h-full">
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
        <header className="mb-6 sm:mb-8 lg:mb-10">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-[color:var(--text)] mb-2 sm:mb-3 tracking-tight">数字伙伴</h2>
          <p className="text-sm sm:text-base lg:text-lg text-[color:var(--text-2)] font-normal">售前过程中的高频提效助手，一键打开即用。</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {tools.map((tool) => (
            <div key={tool.id} className="ui-card flex flex-col h-full p-5 sm:p-6 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--bg-surface-2)] transition-all duration-300 group rounded-2xl shadow-sm">
              <div className="flex items-start justify-between gap-4 mb-5 min-w-0">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-2xl bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-3)] group-hover:text-[color:var(--text)] transition-colors overflow-hidden flex-shrink-0 shadow-sm">
                     <ToolAvatar tool={tool} />
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-center gap-2 flex-wrap">
                       <h3 className="text-base sm:text-lg font-semibold text-[color:var(--text)] tracking-tight">{tool.title}</h3>
                       {tool.name && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[color:var(--bg-surface-2)] text-[color:var(--text-2)] border border-[color:var(--border)] uppercase tracking-wide">{tool.name}</span>}
                    </div>
                    <a href={tool.url} target="_blank" rel="noreferrer" className="text-xs font-normal text-[color:var(--text-3)] hover:text-[color:var(--primary)] truncate block mt-1 transition-colors max-w-full">
                      {tool.url}
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-[color:var(--bg-surface-2)] rounded-xl p-4 border border-[color:var(--border-subtle)] text-sm font-normal text-[color:var(--text-2)] leading-relaxed mb-5 flex-1">
                "{tool.highlight}"
              </div>

              <div className="flex flex-col gap-3 mt-auto pt-1">
                 <div className="flex flex-wrap gap-2">
                  {tool.skills.slice(0, 2).map((s) => (
                    <span key={`${tool.id}-${s}`} className="px-2.5 py-1 rounded-full border border-[color:var(--border)] bg-[color:var(--bg-surface-1)] text-[11px] font-medium text-[color:var(--text-2)]">
                      {s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-[color:var(--border-subtle)]">
                  <div className="flex gap-2">
                    <a
                      href={tool.docUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-btn ui-btn-secondary !min-h-[32px] !h-8 !px-3 !text-xs rounded-full font-medium shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      title="查看说明文档"
                    >
                      <FileText size={14} />
                      <span className="hidden sm:inline">文档</span>
                    </a>
                    <a
                      href={tool.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-btn ui-btn-secondary !min-h-[32px] !h-8 !px-3 !text-xs rounded-full font-medium shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      title="观看演示视频"
                    >
                      <PlayCircle size={14} />
                      <span className="hidden sm:inline">视频</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={tool.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ui-btn ui-btn-primary !min-h-[32px] !h-8 !px-4 !text-xs sm:!text-sm rounded-full font-medium shadow-sm flex items-center justify-center transition-transform active:scale-95"
                    >
                      打开
                    </a>
                  </div>
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
