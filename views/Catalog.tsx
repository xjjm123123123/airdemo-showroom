import React from 'react';
import { Demo } from '../types';
import { DEMO_LIST } from '../constants';

interface CatalogProps {
  onSelectDemo: (demo: Demo) => void;
}

// Icons
const IconCheck = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>;
const IconArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconBox = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>;

const Catalog: React.FC<CatalogProps> = ({ onSelectDemo }) => {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 lg:px-12 lg:py-16 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
        {DEMO_LIST.map((demo) => (
          <div 
            key={demo.id} 
            className="group ui-card overflow-hidden cursor-pointer flex flex-col hover:border-[color:var(--border-strong)] transition-all duration-300 backdrop-blur-md bg-[color:var(--surface)]/60 hover:bg-[color:var(--surface)]/80 hover:shadow-[var(--shadow-md)]"
            onClick={() => onSelectDemo(demo)}
          >
            <div className="p-8 lg:p-10 flex-1">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-[color:var(--bg-subtle)] text-[color:var(--text)] rounded-[var(--radius-lg)] flex items-center justify-center border border-[color:var(--border)] group-hover:bg-[color:var(--primary)] group-hover:text-black transition-colors duration-300 shadow-sm">
                  <IconBox />
                </div>
                <h3 className="text-2xl font-semibold text-[color:var(--text)] tracking-tight group-hover:text-white transition-colors">{demo.title}</h3>
              </div>
              
              <p className="text-[color:var(--text)] font-medium mb-8 text-base leading-relaxed pl-4 border-l-2 border-[color:var(--primary)] opacity-90">
                “{demo.valueProp}”
              </p>

              <ul className="space-y-4 mb-8">
                {demo.points.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-[color:var(--text-2)]">
                    <span className="text-[color:var(--success)] mt-0.5 flex-shrink-0">
                      <IconCheck />
                    </span>
                    <span className="font-light tracking-wide">{p}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-8 py-6 lg:px-10 lg:py-6 bg-[color:var(--bg-subtle)]/50 border-t border-[color:var(--border)] flex items-center justify-between group-hover:bg-[color:var(--surface)] transition-colors">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-[color:var(--text-3)] font-bold uppercase tracking-widest">适用角色</span>
                <span className="text-xs font-medium text-[color:var(--text-2)] truncate max-w-[200px]">{demo.audience}</span>
              </div>
              <button className="ui-btn ui-btn-ghost px-0 text-[color:var(--primary)] gap-2 group-hover:translate-x-1 transition-transform">
                进入 Demo <IconArrowRight />
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder for future demos */}
        <div className="border border-dashed border-[color:var(--border)] rounded-[var(--radius-lg)] flex items-center justify-center p-12 text-[color:var(--text-3)] bg-[color:var(--bg-subtle)] min-h-[400px] cursor-default hover:border-[color:var(--text-3)] transition-colors backdrop-blur-sm">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center shadow-sm">
               <IconGrid />
            </div>
            <p className="font-medium text-base text-[color:var(--text-2)] mb-2">M2 阶段新增...</p>
            <p className="text-sm text-[color:var(--text-3)] font-light">AI 妙记智能分析 / AI 客服助手 / VOC 声音分析</p>
          </div>
        </div>
      </div>

      {/* Design Document Info A~C Section */}
      <section className="mt-16 pt-10 lg:mt-32 lg:pt-20 border-t border-[color:var(--border)]">
        <h3 className="text-xs font-bold text-[color:var(--text-3)] uppercase tracking-[0.2em] mb-10 lg:mb-16 text-center">设计方案包 (Part A-C)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-16">
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-base flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">A</span>
              选择理由
            </h4>
            <p className="text-sm font-light text-[color:var(--text-2)] leading-relaxed">选定 GTM 与智能巡检，覆盖销售运营及线下管理两大最能通过结构化 AI (Base + Aily) 产生闭环价值的黄金场景。目标决策层对“商机流失”与“安全违规”极其敏感。</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-base flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">B</span>
              价值主张
            </h4>
            <p className="text-sm font-light text-[color:var(--text-2)] leading-relaxed">“不讲技术名词，只讲业务风险。AirDemo 致力于让管理层在5分钟内看到：AI 是如何从无序数据中提取行动建议，并直接产生业务回报的。”</p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-white text-base flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-white text-black flex items-center justify-center text-xs font-bold">C</span>
              Catalog 设计
            </h4>
            <p className="text-sm font-light text-[color:var(--text-2)] leading-relaxed">卡片式展示，强引导“价值”与“要点”，让售前在还没进入 Demo 前就能准确根据客户画像快速匹配推荐方案。</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catalog;
