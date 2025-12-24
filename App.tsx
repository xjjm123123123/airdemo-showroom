
import React, { useState } from 'react';
import Catalog from './views/Catalog';
import Workspace from './views/Workspace';
import { Demo } from './types';
import { DEMO_LIST, EFFICIENCY_TOOLS, PROMPT_TEMPLATES } from './constants';

type AppId = 'home' | 'demo' | 'efficiency' | 'prompt';
type WorkspaceViewId = 'main' | 'management' | 'equipment' | 'factory';

const App: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [currentApp, setCurrentApp] = useState<AppId>('home');
  const [workspaceInitialView, setWorkspaceInitialView] = useState<WorkspaceViewId>('main');
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
  };

  const inspectionDemo = DEMO_LIST.find((d) => d.id === 'inspection');
  const tantan = EFFICIENCY_TOOLS.find((t) => t.id === 'tantan');
  const ruirui = EFFICIENCY_TOOLS.find((t) => t.id === 'ruirui');

  const openEfficiencyTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const openInspection = (view: WorkspaceViewId) => {
    if (!inspectionDemo) return;
    setWorkspaceInitialView(view);
    setSelectedDemo(inspectionDemo);
    setCurrentApp('demo');
  };

  const replyHomeAssistant = (text: string) => {
    const t = text.trim();
    const lower = t.toLowerCase();
    if (!t) return '';
    if (t.includes('探探') || lower.includes('tantan')) return '探探适合做互动式客户调研，自动生成调研总结，先把关注点收敛。';
    if (t.includes('睿睿') || lower.includes('ruirui')) return '睿睿适合做汇报复盘：金句、干系人洞察、故事线与案例推荐。';
    if (t.includes('巡检') || t.includes('智能巡检') || lower.includes('inspection')) return '点击「AI 智能巡检」卡片即可进入演示。';
    if (t.includes('推荐') || t.includes('怎么选')) return '给我 3 个信息：行业 / 角色 / 痛点，我给你推荐路径。';
    return '收到。也可以直接点上方「上线啦」卡片快速进入。';
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
        : currentApp === 'efficiency'
          ? '效率工具'
          : '提示词模版';

  const apps: { id: AppId; name: string; icon: string }[] = [
    { id: 'home', name: '首页', icon: '🏠' },
    { id: 'demo', name: 'Demo中心', icon: '📊' },
    { id: 'efficiency', name: '效率工具', icon: '⚡' },
    { id: 'prompt', name: '提示词模版', icon: '📝' }
  ];

  return (
    <div className="h-screen flex flex-col bg-[#f5f6f7] overflow-hidden">
      <header className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white flex-shrink-0 z-50">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-6 h-6 feishu-blue rounded flex items-center justify-center cursor-pointer" onClick={handleGoHome}>
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <div className="flex flex-col leading-tight">
            <h1 className="font-bold text-xs text-gray-800">AirDemo Showroom</h1>
            <span className="text-[10px] text-gray-400">售前 AI 方案演示工作台</span>
          </div>

          <nav className="flex items-center gap-3 ml-2">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.id === 'home') {
                    handleGoHome();
                    return;
                  }
                  setCurrentApp(app.id);
                }}
                className={`px-1 py-0.5 text-[11px] font-semibold border-b-2 transition-colors focus:outline-none ${currentApp === app.id ? 'text-blue-600 border-blue-600' : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-200'}`}
              >
                {app.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
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
          <Workspace demo={selectedDemo} currentApp={currentApp} initialView={workspaceInitialView} />
        ) : currentApp === 'home' ? (
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
              <div className="max-w-6xl mx-auto">
                <section className="rounded-3xl overflow-hidden border border-gray-200 bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-500 shadow-sm">
                  <div className="px-10 py-10 md:px-12 md:py-12 relative">
                    <div className="max-w-2xl">
                      <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">欢迎来到飞书 AI 售前样板间</h2>
                      <p className="mt-4 text-sm text-white/80 leading-relaxed">用最短路径把客户需求翻译成方案故事线：数据结构化 → AI 洞察 → 行动闭环。</p>
                      <div className="mt-7 flex items-center gap-3">
                        <button
                          onClick={() => setCurrentApp('demo')}
                          className="px-5 py-2 bg-white text-blue-700 text-xs font-black rounded-xl hover:bg-white/90 shadow-lg transition-all"
                        >
                          开始探索 →
                        </button>
                        <button
                          onClick={() => setCurrentApp('efficiency')}
                          className="px-5 py-2 bg-white/10 text-white text-xs font-black rounded-xl hover:bg-white/15 border border-white/20 transition-all"
                        >
                          打开效率工具
                        </button>
                      </div>
                    </div>
                    <div className="absolute -right-20 -top-24 w-96 h-96 rounded-full bg-white/10 blur-3xl" />
                    <div className="absolute -right-10 -bottom-24 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
                  </div>
                </section>

                <section className="mt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[11px] font-black text-red-600">🚀</div>
                      <h3 className="text-sm font-black text-gray-800 tracking-tight">上线啦</h3>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4 overflow-x-auto no-scrollbar pb-2">
                    {ruirui && (
                      <button
                        onClick={() => openEfficiencyTool(ruirui.url)}
                        className="flex-shrink-0 w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
                      >
                        <div className="h-24 bg-gradient-to-br from-indigo-600 to-blue-600" />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">{ruirui.name}</span>
                            <span className="text-[10px] font-black text-red-500">NEW</span>
                          </div>
                          <div className="mt-2 text-sm font-black text-gray-900">{ruirui.title}</div>
                        </div>
                      </button>
                    )}

                    {tantan && (
                      <button
                        onClick={() => openEfficiencyTool(tantan.url)}
                        className="flex-shrink-0 w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
                      >
                        <div className="h-24 bg-gradient-to-br from-emerald-600 to-teal-500" />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">{tantan.name}</span>
                            <span className="text-[10px] font-black text-red-500">NEW</span>
                          </div>
                          <div className="mt-2 text-sm font-black text-gray-900">{tantan.title}</div>
                        </div>
                      </button>
                    )}

                    <button
                      onClick={() => openInspection('main')}
                      className="flex-shrink-0 w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                      <div className="h-24 bg-gradient-to-br from-orange-500 to-amber-500" />
                      <div className="p-4">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black">巡检</span>
                          <span className="text-[10px] font-black text-red-500">NEW</span>
                        </div>
                        <div className="mt-2 text-sm font-black text-gray-900">AI 智能巡检 | EHS & 设备管理</div>
                      </div>
                    </button>

                    {[1, 2].map((i) => (
                      <div key={i} className="flex-shrink-0 w-[260px] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="h-24 bg-gradient-to-br from-gray-200 to-gray-100" />
                        <div className="p-4">
                          <div className="flex items-center justify-between">
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-[10px] font-black">待制作</span>
                          </div>
                          <div className="mt-2 text-sm font-black text-gray-600">更多能力筹备中</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="mt-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-[11px] font-black text-blue-600">🧠</div>
                      <h3 className="text-sm font-black text-gray-800 tracking-tight">咨询洞察</h3>
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">更多 →</span>
                  </div>

                  {[
                    {
                      tag: '行业洞察',
                      date: '2025-12-20',
                      title: 'GTM 访谈提效：从 60 分钟到 15 分钟的需求收敛',
                      desc: '通过互动式调研提前对齐关注点，现场只做关键追问与方案匹配，让客户体验“AI 很懂我”。',
                      author: 'AirDemo Research'
                    },
                    {
                      tag: '售前方法论',
                      date: '2025-12-12',
                      title: '汇报复盘的 5 个关键维度：价值、贴合度、互动、异议、表达',
                      desc: '把“讲功能”升级为“讲管理思想与业务价值”，并且用数据与案例形成可复用的故事线。',
                      author: 'AirDemo SalesOps'
                    },
                    {
                      tag: '案例复用',
                      date: '2025-12-05',
                      title: '巡检场景演示脚本：数据结构化 + AI 洞察 + 行动闭环',
                      desc: '用三张表把“人员违规—管理跟进—设备健康度”串起来，让客户看到闭环的确定性。',
                      author: 'AirDemo Solution'
                    }
                  ].map((it) => (
                    <div key={`${it.date}-${it.title}`} className="mt-4 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-5">
                        <div className="w-28 h-16 rounded-xl bg-gradient-to-br from-gray-200 to-gray-100 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-black uppercase">{it.tag}</span>
                            <span className="text-[10px] font-bold text-gray-400">{it.date}</span>
                          </div>
                          <div className="mt-2 text-sm font-black text-gray-900">{it.title}</div>
                          <div className="mt-2 text-[11px] text-gray-500 leading-relaxed">{it.desc}</div>
                          <div className="mt-3 text-[10px] font-bold text-gray-400">作者：{it.author}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </section>
              </div>
            </div>

            <aside className="w-[340px] border-l border-gray-200 bg-white flex flex-col flex-shrink-0">
              <div className="h-12 border-b border-gray-100 flex items-center justify-between px-5">
                <div className="text-xs font-black text-gray-800">首页 AI 助手</div>
                <button onClick={() => setHomeMessages([{ role: 'ai', text: '你好，我是首页 AI 助手。想先看探探 / 睿睿 / 巡检哪个？' }])} className="text-[10px] font-bold text-gray-300 hover:text-gray-500 transition-colors">
                  清空
                </button>
              </div>

              <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3 bg-[#fafafa]">
                {homeMessages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[92%] p-3 rounded-2xl text-[11px] border shadow-sm ${m.role === 'ai' ? 'bg-white border-gray-100 text-gray-800' : 'bg-blue-600 border-blue-500 text-white'}`}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-100 bg-white">
                <div className="flex flex-wrap gap-2 mb-3">
                  <button onClick={() => setHomeInput('探探')} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">探探</button>
                  <button onClick={() => setHomeInput('睿睿')} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">睿睿</button>
                  <button onClick={() => setHomeInput('巡检')} className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-[10px] font-bold text-gray-600 hover:bg-gray-100 transition-colors">巡检</button>
                </div>
                <div className="relative">
                  <input
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendHomeMessage();
                    }}
                    placeholder="输入你的问题…"
                    className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-11 text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 shadow-inner transition-all"
                  />
                  <button
                    onClick={sendHomeMessage}
                    className="absolute right-3 top-3 text-blue-600 hover:scale-110 transition-transform"
                  >
                    <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                  </button>
                </div>
              </div>
            </aside>
          </div>
        ) : currentApp === 'demo' ? (
          <Catalog onSelectDemo={(demo) => { setWorkspaceInitialView('main'); setSelectedDemo(demo); setCurrentApp('demo'); }} />
        ) : currentApp === 'prompt' ? (
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
            <div className="max-w-4xl mx-auto">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">提示词模版库</h2>
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

                    <details className="mt-4 group">
                      <summary className="cursor-pointer select-none text-xs font-bold text-gray-700 flex items-center gap-2">
                        业务上下文
                        <span className="text-[10px] font-semibold text-gray-400 group-open:hidden">展开</span>
                        <span className="text-[10px] font-semibold text-gray-400 hidden group-open:inline">收起</span>
                      </summary>
                      <div className="mt-3 bg-white border border-gray-100 rounded-xl p-4 text-[11px] text-gray-600 space-y-3">
                        <div className="space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">场景</div>
                          <div className="leading-relaxed">{tmp.scenario.background}</div>
                          <div className="leading-relaxed"><span className="font-bold text-gray-700">目标：</span>{tmp.scenario.goal}</div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">输入 / 输出</div>
                          <div className="flex flex-wrap gap-2">
                            {tmp.scenario.inputs.map((it) => (
                              <span key={`in-${it}`} className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-600">{it}</span>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {tmp.scenario.outputs.map((it) => (
                              <span key={`out-${it}`} className="px-2 py-0.5 rounded-full border border-blue-100 bg-blue-50 text-[10px] font-semibold text-blue-700">{it}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">MCP</div>
                          <div className="space-y-2">
                            {tmp.mcps.map((cap) => (
                              <div key={cap.name} className="border border-gray-100 rounded-lg p-3 bg-gray-50/60">
                                <div className="text-[11px] font-bold text-gray-700">{cap.name}</div>
                                <div className="text-[10px] text-gray-500 mt-0.5">{cap.description}</div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {cap.tools.map((tool) => (
                                    <span key={`${cap.name}-${tool.name}`} className="px-2 py-0.5 rounded-full border border-gray-200 bg-white text-[10px] font-semibold text-gray-600">
                                      {tool.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Skills</div>
                          <div className="flex flex-wrap gap-2">
                            {tmp.skills.map((s) => (
                              <span key={s} className="px-2 py-0.5 rounded-full border border-gray-200 bg-white text-[10px] font-semibold text-gray-600">{s}</span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Agents</div>
                          <div className="space-y-2">
                            {tmp.agents.map((a) => (
                              <div key={a.name} className="border border-gray-100 rounded-lg p-3">
                                <div className="flex items-baseline justify-between gap-2">
                                  <div className="text-[11px] font-bold text-gray-700">{a.name}</div>
                                  <div className="text-[10px] font-semibold text-gray-400">{a.role}</div>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {a.responsibilities.map((r) => (
                                    <span key={`${a.name}-${r}`} className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-600">{r}</span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
            <div className="max-w-5xl mx-auto">
              <header className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">效率工具</h2>
                <p className="text-sm text-gray-500">售前过程中的高频提效助手，一键打开即用。</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {EFFICIENCY_TOOLS.map((tool) => (
                  <div key={tool.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">{tool.name}</span>
                          <h3 className="text-lg font-bold text-gray-800 truncate">{tool.title}</h3>
                        </div>
                        <a href={tool.url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] text-gray-500 hover:text-blue-600 truncate">
                          {tool.url}
                        </a>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <a
                          href={tool.url}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all"
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
                          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 text-xs font-bold rounded-xl hover:bg-gray-50 transition-all"
                        >
                          复制链接
                        </button>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">核心技能</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {tool.skills.map((s) => (
                          <span key={`${tool.id}-${s}`} className="px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-[10px] font-semibold text-gray-600">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 bg-gray-50 rounded-xl p-4 border border-gray-100 text-[11px] text-gray-600 leading-relaxed italic">
                      “{tool.highlight}”
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
