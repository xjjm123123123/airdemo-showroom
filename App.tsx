
import React, { useState } from 'react';
import Catalog from './views/Catalog';
import Workspace from './views/Workspace';
import { Demo } from './types';
import { DEMO_LIST, PROMPT_TEMPLATES } from './constants';

type AppId = 'apaas' | 'base' | 'prompt';

const App: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [currentApp, setCurrentApp] = useState<AppId>('base');

  const handleReset = () => {
    setSelectedDemo(null);
    setCurrentApp('base');
  };

  const activeLabel = currentApp === 'base' ? '解决方案样板间' : currentApp === 'prompt' ? '提示词模板' : 'aPaaS 低代码';

  const apps: { id: AppId; name: string; icon: string }[] = [
    { id: 'apaas', name: 'aPaaS 低代码', icon: '⚡' },
    { id: 'base', name: '多维表格 Base', icon: '📊' },
    { id: 'prompt', name: '提示词模板', icon: '📝' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f5f6f7] overflow-hidden">
      <header className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0 z-50">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-6 h-6 feishu-blue rounded flex items-center justify-center cursor-pointer" onClick={handleReset}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="font-bold text-xs text-gray-800">AirDemo Showroom</h1>
            <span className="text-[10px] text-gray-400">售前 AI 方案演示工作台</span>
          </div>

          <button
            onClick={handleReset}
            className={`ml-2 px-3 py-1 rounded text-[11px] font-bold border transition-colors ${selectedDemo ? 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50' : 'bg-blue-50 text-blue-600 border-blue-100'}`}
          >
            解决方案样板间
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => setCurrentApp(app.id)}
                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5 ${currentApp === app.id ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:bg-white/70'}`}
              >
                <span className="text-[12px]">{app.icon}</span>
                <span className="hidden md:inline">{app.name}</span>
              </button>
            ))}
          </div>
          {selectedDemo && (
            <button 
              onClick={handleReset}
              className="px-3 py-1 bg-red-50 text-red-600 border border-red-100 rounded text-[11px] font-medium hover:bg-red-100 transition-colors"
            >
              退出并重置演示
            </button>
          )}
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <div className="text-[11px] font-medium text-gray-500">
            {selectedDemo ? `当前场景：${selectedDemo.title}` : activeLabel}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        {selectedDemo ? (
          <Workspace demo={selectedDemo} currentApp={currentApp} />
        ) : currentApp === 'base' ? (
          <Catalog onSelectDemo={(demo) => { setSelectedDemo(demo); setCurrentApp('base'); }} />
        ) : currentApp === 'prompt' ? (
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">提示词模板库</h2>
                <p className="text-sm text-gray-500">这些专业提示词可直接复制到对话中使用。</p>
              </header>
              <div className="grid grid-cols-1 gap-6">
                {PROMPT_TEMPLATES.map(tmp => (
                  <div key={tmp.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase mb-2">{tmp.category}</span>
                        <h3 className="text-lg font-bold text-gray-800">{tmp.title}</h3>
                        <p className="text-xs text-gray-500 mt-1">{tmp.description}</p>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(tmp.prompt);
                          } catch {
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2"
                      >
                        复制指令
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 font-mono text-[11px] text-gray-600 leading-relaxed italic">
                      "{tmp.prompt}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300 flex-col gap-4 bg-white">
            <div className="text-6xl opacity-10">⚡</div>
            <p className="text-[10px] font-black uppercase tracking-widest">Building aPaaS Modules...</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
