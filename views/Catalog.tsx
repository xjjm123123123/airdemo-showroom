import React from 'react';
import { Demo } from '../types';
import { DEMO_LIST } from '../constants';
import { Check, ArrowRight, Grid, Box } from 'lucide-react';

interface CatalogProps {
  onSelectDemo: (demo: Demo) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onSelectDemo }) => {
  return (
    <div className="h-full w-full overflow-y-auto font-sans text-[color:var(--text)]">
      <section className="min-h-full flex flex-col p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[color:var(--text)] mb-2">
            Demo 中心
          </h1>
          <p className="text-sm sm:text-base lg:text-base text-[color:var(--text-3)]">
            探索 AI 数字伙伴在不同业务场景中的实际应用
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {DEMO_LIST.map((demo) => (
            <div 
              key={demo.id} 
              className="group ui-card overflow-hidden cursor-pointer flex flex-col hover:border-[color:var(--border-strong)] transition-all duration-300 bg-[color:var(--bg-surface-1)] hover:bg-[color:var(--bg-surface-2)] hover:shadow-[var(--shadow-md)]"
              onClick={() => onSelectDemo(demo)}
            >
              <div className="p-4 sm:p-6 lg:p-8 flex-1">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[color:var(--bg-surface-2)] text-[color:var(--text)] rounded-[var(--radius-md)] flex items-center justify-center border border-[color:var(--border)] group-hover:bg-[color:var(--primary)] group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Box size={20} />
                  </div>
                  <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[color:var(--text)] tracking-tight group-hover:text-[color:var(--text)] transition-colors">{demo.title}</h3>
                </div>
                
                <p className="text-[color:var(--text)] font-medium mb-4 sm:mb-6 text-sm sm:text-base leading-relaxed pl-3 border-l-2 border-[color:var(--primary)] opacity-90">
                  "{demo.valueProp}"
                </p>

                <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                  {demo.points.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-xs text-[color:var(--text-2)]">
                      <span className="text-[color:var(--success)] mt-0.5 flex-shrink-0">
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <span className="font-normal tracking-wide">{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="px-4 py-3 sm:px-6 sm:py-4 lg:px-8 lg:py-4 bg-[color:var(--bg-surface-2)]/50 border-t border-[color:var(--border)] flex items-center justify-between group-hover:bg-[color:var(--bg-surface-2)] transition-colors">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] sm:text-[10px] text-[color:var(--text-3)] font-semibold uppercase tracking-wider">适用角色</span>
                  <span className="text-xs sm:text-xs font-medium text-[color:var(--text-2)] truncate max-w-[140px] sm:max-w-[180px]">{demo.audience}</span>
                </div>
                <button className="ui-btn ui-btn-ghost px-0 text-[color:var(--primary)] gap-1.5 group-hover:translate-x-1 transition-transform text-xs min-h-[44px] min-w-[44px] flex items-center">
                  进入 Demo <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Placeholder for future demos */}
          <div className="border border-dashed border-[color:var(--border)] rounded-[var(--radius-lg)] flex items-center justify-center p-6 sm:p-10 text-[color:var(--text-3)] bg-[color:var(--bg-surface-1)] min-h-[280px] sm:min-h-[300px] cursor-default hover:border-[color:var(--text-3)] transition-colors">
            <div className="text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-4 sm:mb-6 rounded-full bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center shadow-sm">
                 <Grid size={16} />
              </div>
              <p className="font-medium text-sm sm:text-sm text-[color:var(--text-2)] mb-1.5">M2 阶段新增...</p>
              <p className="text-xs sm:text-xs text-[color:var(--text-3)] font-normal">AI 妙记智能分析 / AI 客服助手 / VOC 声音分析</p>
            </div>
          </div>
        </div>

        {/* Design Document Info A~C Section */}
        <section className="mt-8 pt-6 sm:mt-12 sm:pt-8 lg:mt-24 lg:pt-16 border-t border-[color:var(--border)]">
          <h3 className="text-[10px] font-bold text-[color:var(--text-3)] uppercase tracking-[0.15em] mb-6 sm:mb-8 lg:mb-12 text-center">设计方案包 (Part A-C)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-[color:var(--text)] text-sm flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[color:var(--text)] text-[color:var(--bg)] flex items-center justify-center text-[10px] font-bold">A</span>
                选择理由
              </h4>
              <p className="text-xs sm:text-xs font-normal text-[color:var(--text-2)] leading-relaxed">选定 GTM 与智能巡检，覆盖销售运营及线下管理两大最能通过结构化 AI (Base + Aily) 产生闭环价值的黄金场景。目标决策层对"商机流失"与"安全违规"极其敏感。</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-[color:var(--text)] text-sm flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[color:var(--text)] text-[color:var(--bg)] flex items-center justify-center text-[10px] font-bold">B</span>
                价值主张
              </h4>
              <p className="text-xs sm:text-xs font-normal text-[color:var(--text-2)] leading-relaxed">"不讲技术名词，只讲业务风险。AirDemo 致力于让管理层在5分钟内看到：AI 是如何从无序数据中提取行动建议，并直接产生业务回报的。"</p>
            </div>
            <div className="space-y-2 sm:space-y-3">
              <h4 className="font-semibold text-[color:var(--text)] text-sm flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[color:var(--text)] text-[color:var(--bg)] flex items-center justify-center text-[10px] font-bold">C</span>
                Catalog 设计
              </h4>
              <p className="text-xs sm:text-xs font-normal text-[color:var(--text-2)] leading-relaxed">卡片式展示，强引导"价值"与"要点"，让售前在还没进入 Demo 前就能准确根据客户画像快速匹配推荐方案。</p>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
};

export default Catalog;
