import React, { useState } from 'react';
import { Search, Sparkles, Star } from 'lucide-react';
import { ENRICHMENT_TOOLS } from './constants';

const TABS = ['获客', '商机', '签约', '用户反馈', '客户培训'];

const SidebarRight: React.FC = () => {
  const [activeTab, setActiveTab] = useState('获客');
  const [showAll, setShowAll] = useState(false);

  const filteredTools = showAll
    ? ENRICHMENT_TOOLS
    : ENRICHMENT_TOOLS.filter(tool => tool.categories.includes(activeTab));

  return (
    <aside className="w-[320px] bg-white border-l border-lark-border flex flex-col h-full z-20">
      {/* Lark Tabs */}
      <div className="px-5 pt-3 border-b border-lark-border overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-5">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setShowAll(false);
              }}
              className={`pb-2.5 text-[14px] font-medium transition-all relative whitespace-nowrap ${
                activeTab === tab && !showAll ? 'text-lark-blue' : 'text-lark-textSecondary hover:text-lark-textPrimary'
              }`}
            >
              {tab}
              {activeTab === tab && !showAll && (
                <div className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-lark-blue rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar (Lark style) */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-lark-bgSidebar border border-lark-border rounded-md focus-within:bg-white focus-within:border-lark-blue transition-all">
          <Search className="w-4 h-4 text-lark-textPlaceholder" />
          <input
            type="text"
            placeholder="Search apps..."
            className="bg-transparent border-none focus:ring-0 text-[13px] p-0 w-full placeholder:text-lark-textPlaceholder text-lark-textPrimary"
          />
        </div>
      </div>

      {/* Catalog List */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <div className="flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
             <Star className="w-3.5 h-3.5 text-orange-400 fill-current" />
             <span className="text-[12px] font-semibold text-lark-textPrimary uppercase tracking-tight">
               {showAll ? '所有智能体' : '推荐智能体'}
             </span>
           </div>
        </div>

        <div className="space-y-2">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => tool.link && window.open(tool.link, '_blank')}
              className="group p-3 rounded-lg hover:bg-lark-bgSidebar border border-transparent hover:border-lark-border transition-all cursor-pointer active:bg-lark-bgHover"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-lark-border flex items-center justify-center text-xl shadow-sm overflow-hidden">
                    {tool.icon.startsWith('http') ? (
                      <img src={tool.icon} alt={tool.name} className="w-full h-full object-cover" />
                    ) : (
                      tool.icon
                    )}
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-lark-textPrimary">{tool.name}</div>
                    <div className="text-[11px] text-lark-textPlaceholder font-medium uppercase">{tool.provider}</div>
                  </div>
                </div>
              </div>
              <p className="text-[12px] text-lark-textSecondary leading-normal">
                {tool.description}
              </p>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowAll(true)}
          className="w-full mt-6 py-2 text-[13px] font-medium text-lark-textPrimary bg-white hover:bg-lark-bgHover border border-lark-border rounded-md transition-all"
        >
          查看所有智能体
        </button>
      </div>
    </aside>
  );
};

export default SidebarRight;
