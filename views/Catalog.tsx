
import React from 'react';
import { Demo } from '../types';
import { DEMO_LIST } from '../constants';

interface CatalogProps {
  onSelectDemo: (demo: Demo) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onSelectDemo }) => {
  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {DEMO_LIST.map((demo) => (
          <div 
            key={demo.id} 
            className="group bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-400 transition-all cursor-pointer flex flex-col"
            onClick={() => onSelectDemo(demo)}
          >
            <div className="p-6 flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{demo.title}</h3>
              </div>
              
              <p className="text-blue-600 font-medium mb-4 text-sm leading-relaxed">
                “{demo.valueProp}”
              </p>

              <ul className="space-y-2 mb-6">
                {demo.points.map((p, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium uppercase tracking-tighter">适用：{demo.audience}</span>
              <button className="text-blue-600 font-semibold text-sm group-hover:translate-x-1 transition-transform">
                进入 Demo →
              </button>
            </div>
          </div>
        ))}

        {/* Placeholder for future demos */}
        <div className="bg-dashed border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-12 text-gray-400">
          <div className="text-center">
            <p className="font-medium">M2 阶段新增...</p>
            <p className="text-xs">AI 妙记智能分析 / AI 客服助手 / VOC 声音分析</p>
          </div>
        </div>
      </div>

      {/* Design Document Info A~C Section */}
      <section className="mt-24 border-t border-gray-200 pt-12">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8 text-center">设计方案包 (Part A-C)</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">A) 选择理由</h4>
            <p className="text-xs text-gray-500 leading-relaxed">选定 GTM 与智能巡检，覆盖销售运营及线下管理两大最能通过结构化 AI (Base + Aily) 产生闭环价值的黄金场景。目标决策层对“商机流失”与“安全违规”极其敏感。</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">B) 价值主张</h4>
            <p className="text-xs text-gray-500 leading-relaxed">“不讲技术名词，只讲业务风险。AirDemo 致力于让管理层在5分钟内看到：AI 是如何从无序数据中提取行动建议，并直接产生业务回报的。”</p>
          </div>
          <div className="space-y-2">
            <h4 className="font-bold text-gray-700">C) Catalog 设计</h4>
            <p className="text-xs text-gray-500 leading-relaxed">卡片式展示，强引导“价值”与“要点”，让售前在还没进入 Demo 前就能准确根据客户画像快速匹配推荐方案。</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Catalog;
