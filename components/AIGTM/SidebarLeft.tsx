import React from 'react';
import { ChevronRight, Sparkles, Send, MessageSquareText } from 'lucide-react';
import { SUGGESTIONS } from './constants';

const SidebarLeft: React.FC = () => {
  return (
    <aside className="w-[300px] bg-lark-bgSidebar border-r border-lark-border flex flex-col h-full relative z-20">
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-lark-border bg-white lg:bg-transparent">
        <div className="flex items-center gap-2">
          <img 
            src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/Lark_Suite_logo_2022%201_%E5%89%AF%E6%9C%AC.png" 
            alt="AI GTM Logo" 
            className="w-8 h-8 object-contain"
          />
          <h2 className="text-lark-textPrimary font-semibold text-[15px]">AI GTM</h2>
        </div>
        <button className="p-1.5 hover:bg-lark-bgHover rounded-md transition-colors">
          <MessageSquareText className="w-4 h-4 text-lark-textSecondary" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-3 overflow-y-auto pt-6 pb-28">
        <div className="mb-6 px-2">
          <h3 className="text-[18px] font-semibold text-lark-textPrimary mb-1">
            构建你的工作流
          </h3>
          <p className="text-sm text-lark-textSecondary leading-relaxed">
            我可以帮你查找潜在客户、丰富数据或自动化调研。
          </p>
        </div>

        <div className="space-y-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item.id}
              className="w-full group flex items-start gap-3 p-3 bg-white border border-lark-border rounded-lg transition-all duration-150 hover:shadow-sm hover:border-lark-blue/30 active:bg-lark-bgHover"
            >
              <div className="mt-0.5 p-1.5 rounded-md bg-lark-bgSidebar border border-lark-border group-hover:bg-lark-blueBg group-hover:border-lark-blue/20 transition-colors">
                {/* Fixed TypeScript error by validating element and casting to any to allow className override */}
                {React.isValidElement(item.icon) && React.cloneElement(item.icon as React.ReactElement<any>, { 
                  className: 'w-4 h-4 text-lark-textSecondary group-hover:text-lark-blue' 
                })}
              </div>
              <div className="flex-1 text-left">
                <div className="text-[13px] font-medium text-lark-textPrimary">{item.title}</div>
                <div className="text-[12px] text-lark-textSecondary line-clamp-1">{item.description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Lark-style Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-lark-bgSidebar/80 backdrop-blur-sm">
        <div className="relative flex flex-col bg-white border border-lark-border rounded-lg shadow-sm focus-within:border-lark-blue transition-all">
          <textarea
            rows={1}
            placeholder="Type a command..."
            className="w-full bg-transparent border-none focus:ring-0 text-[13px] px-4 py-3 text-lark-textPrimary placeholder:text-lark-textPlaceholder resize-none min-h-[44px]"
          />
          <div className="flex items-center justify-between px-3 pb-2">
            <div className="flex items-center gap-2">
               <button className="p-1 hover:bg-lark-bgHover rounded text-lark-textSecondary transition-colors">
                 <Sparkles className="w-4 h-4" />
               </button>
            </div>
            <button className="p-1.5 bg-lark-blue text-white rounded-md hover:bg-lark-blueHover transition-all active:scale-95">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SidebarLeft;
