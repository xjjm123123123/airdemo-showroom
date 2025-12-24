import React, { useState } from 'react';
import Catalog from './views/Catalog';
import Workspace from './views/Workspace';
import DemoFlow from './views/DemoFlow';
import Efficiency from './views/Efficiency';
import Prism from './components/Prism';
import { Demo } from './types';
import { DEMO_LIST, EFFICIENCY_TOOLS } from './constants';

type AppId = 'home' | 'demo' | 'efficiency';
type WorkspaceViewId = 'main' | 'management' | 'equipment' | 'factory';

// Icons
const IconHome = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;
const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconClock = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const IconArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconArrowUpRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
const IconMessage = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const IconSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;

const App: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [currentApp, setCurrentApp] = useState<AppId>('home');
  const [workspaceInitialView, setWorkspaceInitialView] = useState<WorkspaceViewId>('main');
  const [demoViewMode, setDemoViewMode] = useState<'flow' | 'workspace'>('flow');
  const [homeMessages, setHomeMessages] = useState<{ role: 'ai' | 'user'; text: string }[]>([
    { role: 'ai', text: '你好，我是首页 AI 助手。想先看探探 / 睿睿 / 巡检哪个？' }
  ]);
  const [homeInput, setHomeInput] = useState('');

  const handleGoHome = () => {
    setSelectedDemo(null);
    setCurrentApp('home');
  };

  const handleReset = () => {
    setSelectedDemo(null);
    setCurrentApp('demo');
    setWorkspaceInitialView('main');
    setDemoViewMode('flow');
  };

  const inspectionDemo = DEMO_LIST.find((d) => d.id === 'inspection');
  
  const INSPECTION_COVER_URL =
    'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%886.50.56.png';
  const GTM_COVER_URL =
    'https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/%E6%88%AA%E5%B1%8F2025-12-24%20%E4%B8%8B%E5%8D%883.35.20.png';

  const openEfficiencyTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const replyHomeAssistant = (text: string) => {
    const t = text.trim();
    const lower = t.toLowerCase();
    if (!t) return '';
    if (t.includes('探探') || lower.includes('tantan')) return '探探适合做互动式客户调研，自动生成调研总结，先把关注点收敛。';
    if (t.includes('睿睿') || lower.includes('ruirui')) return '睿睿适合做汇报复盘：金句、干系人洞察、故事线与案例推荐。';
    if (t.includes('巡检') || t.includes('智能巡检') || lower.includes('inspection')) return '点击「AI 智能巡检」卡片即可进入演示。';
    if (t.includes('推荐') || t.includes('怎么选')) return '给我 3 个信息：行业 / 角色 / 痛点，我给你推荐路径。';
    return '收到。也可以直接点「最新 Demo / 最新效率工具」卡片快速进入。';
  };

  const sendHomeMessage = () => {
    const text = homeInput.trim();
    if (!text) return;
    setHomeMessages((prev) => [...prev, { role: 'user', text }, { role: 'ai', text: replyHomeAssistant(text) }]);
    setHomeInput('');
  };

  const activeLabel =
    currentApp === 'home'
      ? '首页'
      : currentApp === 'demo'
        ? 'Demo中心'
        : '效率工具';

  const apps: { id: AppId; name: string; icon: React.ReactNode }[] = [
    { id: 'home', name: '首页', icon: <IconHome /> },
    { id: 'demo', name: 'Demo中心', icon: <IconGrid /> },
    { id: 'efficiency', name: '效率工具', icon: <IconZap /> }
  ];

  return (
    <div className="h-screen flex flex-col bg-[color:var(--bg)] overflow-hidden font-sans relative">
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
      <header className="h-20 border-b border-[color:var(--border)] flex items-center justify-between px-6 lg:px-10 glass-panel flex-shrink-0 z-50 relative">
        <div className="flex items-center gap-4 lg:gap-8 min-w-0 flex-1">
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={handleGoHome}>
            <div className="w-9 h-9 bg-[color:var(--primary)] rounded-[var(--radius-sm)] flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <div className="flex flex-col leading-tight hidden sm:flex">
              <h1 className="font-semibold text-sm text-[color:var(--text)] tracking-tight">AirDemo</h1>
              <span className="text-[10px] font-medium text-[color:var(--text-3)] tracking-wide">Showroom</span>
            </div>
          </div>

          <nav className="flex items-center gap-2 ml-4 lg:ml-8 overflow-x-auto no-scrollbar mask-gradient-r">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.id === 'home') {
                    handleGoHome();
                    return;
                  }
                  if (app.id === 'efficiency' && selectedDemo) {
                     setDemoViewMode('workspace');
                  }
                  if (app.id === 'demo') {
                    setSelectedDemo(null);
                  }
                  setCurrentApp(app.id);
                }}
                className={`ui-btn ui-btn-ghost px-3 lg:px-4 h-9 gap-2 text-xs lg:text-sm whitespace-nowrap flex-shrink-0 ${currentApp === app.id ? 'bg-[color:var(--bg-subtle)] text-[color:var(--text)] font-medium border border-[color:var(--border)]' : 'text-[color:var(--text-2)] font-normal hover:text-[color:var(--text)]'}`}
              >
                {app.icon}
                {app.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0 ml-4">
          {selectedDemo && (
            <button onClick={handleReset} className="ui-btn border border-[color:var(--border)] h-9 text-xs px-3 lg:px-4 whitespace-nowrap hover:bg-[color:var(--danger-subtle)] hover:text-[color:var(--danger)] hover:border-[color:var(--danger)] transition-all">
              <span className="hidden sm:inline">退出演示</span>
              <span className="sm:hidden">退出</span>
            </button>
          )}
          <div className="h-4 w-[1px] bg-[color:var(--border)] hidden sm:block"></div>
          <div className="text-xs font-medium text-[color:var(--text-3)] hidden sm:block truncate max-w-[120px] lg:max-w-none tracking-wide">
            {selectedDemo ? selectedDemo.title : activeLabel}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden relative z-10">
        {currentApp === 'efficiency' ? (
          <Efficiency />
        ) : selectedDemo ? (
          (demoViewMode === 'flow') ? (
            <DemoFlow demo={selectedDemo} onEnterApp={() => setDemoViewMode('workspace')} />
          ) : (
            <Workspace demo={selectedDemo} currentApp={currentApp} initialView={workspaceInitialView} />
          )
        ) : currentApp === 'home' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-12 pb-24 lg:pb-12">
              <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
                <section className="ui-card overflow-hidden border border-[color:var(--border)] shadow-[var(--shadow-sm)]">
                  <div className="px-8 py-10 lg:px-20 lg:py-20 relative overflow-hidden">
                    <div className="max-w-3xl relative z-10">
                      <h2 className="text-3xl lg:text-5xl font-semibold text-[color:var(--text)] tracking-tight leading-tight">
                        欢迎来到<br/>飞书 AI 售前样板间
                      </h2>
                      <p className="mt-4 lg:mt-6 text-base lg:text-lg text-[color:var(--text-2)] leading-relaxed max-w-2xl font-light">
                        用最短路径把客户需求翻译成方案故事线：<br/>数据结构化 → AI 洞察 → 行动闭环。
                      </p>
                      <div className="mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 lg:gap-5">
                        <button
                          onClick={() => setCurrentApp('demo')}
                          className="ui-btn bg-white text-black hover:bg-gray-100 h-11 px-8 text-sm justify-center font-medium transition-transform active:scale-95"
                        >
                          开始探索
                          <IconArrowRight />
                        </button>
                        <button
                          onClick={() => setCurrentApp('efficiency')}
                          className="ui-btn border border-[color:var(--border)] h-11 px-8 text-sm justify-center hover:bg-[color:var(--bg-subtle)] font-medium transition-colors"
                        >
                          打开效率工具
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[color:var(--bg-subtle)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text)] shadow-sm">
                        <IconClock />
                      </div>
                      <h3 className="text-lg font-semibold text-[color:var(--text)] tracking-tight">最新 Demo</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                    {DEMO_LIST.map((demo) => (
                      <button
                        key={demo.id}
                        onClick={() => {
                          setWorkspaceInitialView('main');
                          setSelectedDemo(demo);
                          setCurrentApp('demo');
                          setDemoViewMode('flow');
                        }}
                        className="ui-card group overflow-hidden text-left relative hover:shadow-2xl transition-all duration-500 border-0 bg-white h-[320px] flex flex-col"
                      >
                        <div className="absolute inset-0 z-0">
                           {demo.id === 'inspection' ? (
                            <img src={INSPECTION_COVER_URL} alt="" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                          ) : demo.id === 'gtm' ? (
                            <img src={GTM_COVER_URL} alt="" className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                              <IconGrid />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />
                        </div>
                        
                        <div className="relative z-10 p-6 flex flex-col h-full justify-end text-white">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                               <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-medium tracking-wide">
                                 方案 Demo
                               </span>
                            </div>
                            <h4 className="text-xl lg:text-2xl font-bold mb-2 text-white leading-tight shadow-sm">{demo.title}</h4>
                            <p className="text-sm text-white/80 line-clamp-2 leading-relaxed font-light mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                              {demo.valueProp}
                            </p>
                            <div className="flex items-center gap-2 text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                              <span>进入体验</span>
                              <IconArrowRight />
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="ui-card overflow-hidden text-left bg-[color:var(--bg-subtle)] border border-dashed border-[color:var(--border)] hover:border-[color:var(--text-3)] cursor-default flex flex-col justify-center items-center text-center p-8 h-[320px] backdrop-blur-sm transition-colors group">
                      <div className="w-12 h-12 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-3)] mb-4 group-hover:scale-110 transition-transform duration-300">
                        <IconGrid />
                      </div>
                      <h4 className="text-sm font-medium text-[color:var(--text)] mb-2">更多 Demo 正在制作</h4>
                      <p className="text-xs text-[color:var(--text-3)] max-w-[200px] leading-relaxed">后续会持续补充更多行业与角色场景。</p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-6 lg:mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[color:var(--bg-subtle)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text)] shadow-sm">
                        <IconZap />
                      </div>
                      <h3 className="text-lg font-semibold text-[color:var(--text)] tracking-tight">最新效率工具</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                    {EFFICIENCY_TOOLS.map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => openEfficiencyTool(tool.url)}
                        className="ui-card p-6 lg:p-8 text-left group hover:border-[color:var(--border-strong)] transition-all duration-300 backdrop-blur-md bg-[color:var(--surface)]/60 hover:bg-[color:var(--surface)]/80 border border-[color:var(--border)] hover:shadow-[var(--shadow-md)]"
                      >
                        <div className="flex items-start justify-between gap-5">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="ui-tag px-2 py-1 text-[10px] font-medium tracking-wide border border-[color:var(--border)] rounded text-[color:var(--text-2)] bg-[color:var(--bg-subtle)]">{tool.name}</span>
                              <span className="text-[10px] font-bold text-[color:var(--text)] bg-[color:var(--bg-subtle)] px-2 py-0.5 rounded-full border border-[color:var(--border)]">NEW</span>
                            </div>
                            <h4 className="text-base lg:text-lg font-semibold text-[color:var(--text)] mb-2 group-hover:text-white transition-colors">{tool.title}</h4>
                            <p className="text-sm text-[color:var(--text-2)] line-clamp-2 leading-relaxed mb-4 font-light">{tool.highlight}</p>
                            <div className="flex flex-wrap gap-2">
                              {tool.skills.slice(0, 3).map(skill => (
                                <span key={skill} className="text-[10px] text-[color:var(--text-3)] bg-[color:var(--bg-subtle)] px-2 py-1 rounded border border-[color:var(--border)]">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="text-[color:var(--text-3)] group-hover:text-white transition-colors transform group-hover:translate-x-1 duration-300">
                            <IconArrowUpRight />
                          </div>
                        </div>
                      </button>
                    ))}

                    <div className="ui-card p-6 lg:p-8 text-left bg-[color:var(--bg-subtle)] border border-dashed border-[color:var(--border)] flex items-center justify-center text-center cursor-default min-h-[160px] backdrop-blur-sm transition-colors hover:border-[color:var(--text-3)]">
                      <div>
                        <div className="inline-flex items-center justify-center w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] text-[color:var(--text-3)] mb-3 lg:mb-4">
                          <IconZap />
                        </div>
                        <h4 className="text-sm font-medium text-[color:var(--text)] mb-1">更多效率工具</h4>
                        <p className="text-xs text-[color:var(--text-3)]">正在制作中...</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <aside className="w-full lg:w-[360px] h-[300px] lg:h-auto border-t lg:border-t-0 lg:border-l border-[color:var(--border)] ui-card rounded-none lg:rounded-none border-0 lg:border-l flex flex-col flex-shrink-0 shadow-[var(--shadow-xl)] z-40 lg:relative absolute bottom-0 lg:bottom-auto transition-transform duration-300 transform translate-y-0 backdrop-blur-xl">
              <div className="h-12 lg:h-16 border-b border-[color:var(--border)] flex items-center justify-between px-4 lg:px-6 bg-transparent">
                <div className="flex items-center gap-2 text-sm font-bold text-[color:var(--text)]">
                  <IconMessage />
                  <span>首页 AI 助手</span>
                </div>
                <button onClick={() => setHomeMessages([{ role: 'ai', text: '你好，我是首页 AI 助手。想先看探探 / 睿睿 / 巡检哪个？' }])} className="ui-btn ui-btn-ghost h-8 px-3 text-xs">
                  清空
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 space-y-4 bg-transparent">
                {homeMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[90%] p-3 lg:p-4 rounded-2xl text-xs lg:text-sm leading-relaxed border shadow-[var(--shadow-sm)] ${m.role === 'ai' ? 'bg-[color:var(--surface)]/80 border-[color:var(--border)] text-[color:var(--text)] backdrop-blur-md' : 'bg-[color:var(--primary)] border-transparent text-white'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 lg:p-6 border-t border-[color:var(--border)] bg-transparent">
                <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
                  <button onClick={() => setHomeInput('探探')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-2 lg:px-3 text-[10px] lg:text-xs rounded-full">探探</button>
                  <button onClick={() => setHomeInput('睿睿')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-2 lg:px-3 text-[10px] lg:text-xs rounded-full">睿睿</button>
                  <button onClick={() => setHomeInput('巡检')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-2 lg:px-3 text-[10px] lg:text-xs rounded-full">巡检</button>
                </div>
                <div className="relative">
                  <input
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendHomeMessage();
                    }}
                    placeholder="输入你的问题…"
                    className="ui-input pr-10 lg:pr-12 h-10 lg:h-11 text-xs lg:text-sm"
                  />
                  <button
                    onClick={sendHomeMessage}
                    className="absolute right-1.5 lg:right-2 top-1.5 lg:top-2 bottom-1.5 lg:bottom-2 w-8 flex items-center justify-center text-[color:var(--primary)] hover:bg-[color:var(--primary-subtle)] rounded-[var(--radius-sm)] transition-colors"
                  >
                    <IconSend />
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : currentApp === 'demo' ? (
          <Catalog onSelectDemo={(demo) => { setWorkspaceInitialView('main'); setSelectedDemo(demo); setCurrentApp('demo'); setDemoViewMode('flow'); }} />
        ) : null}
      </main>
    </div>
  );
};

export default App;
