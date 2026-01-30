import React, { useState, useEffect, useRef, memo } from 'react';
import { 
  LayoutGrid, 
  MessageSquare, 
  Settings, 
  Menu, 
  X, 
  Send, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  Plus, 
  MoreHorizontal,
  Home,
  ArrowRight,
  Zap,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { DEMO_LIST, EFFICIENCY_TOOLS, PROMPT_TEMPLATES, INSPECTION_COVER_URL, GTM_COVER_URL } from './constants';
import Catalog from './views/Catalog';
import Workspace from './views/Workspace';
import DemoFlow from './views/DemoFlow';
import AIGTMView from './views/AIGTMView';
import Efficiency from './views/Efficiency';
import Prism from './components/Prism';
import TextType from './components/TextType';
import BottomToolbar from './components/BottomToolbar';
import { Demo, EfficiencyTool } from './types';

type AppId = 'home' | 'demo' | 'efficiency';
type WorkspaceViewId = 'main' | 'management' | 'equipment' | 'factory';

type Message = {
  role: 'user' | 'ai';
  text: string;
};

const API_BASE = (import.meta as any).env?.VITE_API_BASE || '/api';
const AI_NAVIGATOR_URL = 'http://115.190.84.234:8081';
const AILY_CHAT_ENDPOINT = (import.meta as any).env?.VITE_AILY_CHAT_ENDPOINT || '/api/aily';

const fetchDemos = async (): Promise<Demo[]> => {
  try {
    const resp = await fetch(`${API_BASE}/demo`);
    if (!resp.ok) throw new Error('Failed to fetch demos');
    const json = await resp.json();
    if (json.code === 0 && json.data) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.warn('从 API 加载 Demo 失败，使用静态数据:', error);
    return [];
  }
};

const fetchTools = async (): Promise<EfficiencyTool[]> => {
  try {
    const resp = await fetch(`${API_BASE}/tools`);
    if (!resp.ok) throw new Error('Failed to fetch tools');
    const json = await resp.json();
    if (json.code === 0 && json.data) {
      return json.data;
    }
    return [];
  } catch (error) {
    console.warn('从 API 加载工具失败，使用静态数据:', error);
    return [];
  }
};

const App: React.FC = () => {
  const [selectedDemo, setSelectedDemo] = useState<Demo | null>(null);
  const [currentApp, setCurrentApp] = useState<AppId>('home');
  const [workspaceInitialView, setWorkspaceInitialView] = useState<WorkspaceViewId>('main');
  const [demoViewMode, setDemoViewMode] = useState<'flow' | 'workspace'>('flow');
  const [homeMessages, setHomeMessages] = useState<Message[]>([{ role: 'ai', text: '你好，我是首页 AI 助手。想先看探探 / 睿睿 / 巡检哪个？' }]);
  const [homeInput, setHomeInput] = useState('');
  const [isHomeChatCollapsed, setIsHomeChatCollapsed] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHomeChatLoading, setIsHomeChatLoading] = useState(false);
  const [demoList, setDemoList] = useState<Demo[]>([...DEMO_LIST]);
  const [efficiencyTools, setEfficiencyTools] = useState<EfficiencyTool[]>([...EFFICIENCY_TOOLS]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [demos, tools] = await Promise.all([fetchDemos(), fetchTools()]);

        if (demos.length > 0) {
          setDemoList(demos);
        } else {
          setDemoList([...DEMO_LIST]);
        }

        if (tools.length > 0) {
          setEfficiencyTools(tools);
        } else {
          setEfficiencyTools([...EFFICIENCY_TOOLS]);
        }
      } catch (error) {
        console.warn('加载数据失败，使用静态数据:', error);
        setDemoList([...DEMO_LIST]);
        setEfficiencyTools([...EFFICIENCY_TOOLS]);
      }
    };

    loadData();
  }, []);

  const handleGoHome = () => {
    setSelectedDemo(null);
    setCurrentApp('home');
    setDemoViewMode('flow');
    setIsMobileMenuOpen(false);
  };

  const handleReset = () => {
    setSelectedDemo(null);
    setDemoViewMode('flow');
    setIsMobileMenuOpen(false);
  };

  const openEfficiencyTool = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const replyHomeAssistantFallback = (text: string) => {
    const t = text.trim();
    const lower = t.toLowerCase();
    if (!t) return '我这边没听清，可以再具体一点吗？';
    if (t.includes('探探') || lower.includes('tantan')) return '探探适合做互动式客户调研，自动生成调研总结，先把关注点收敛。';
    if (t.includes('睿睿') || lower.includes('ruirui')) return '睿睿适合做汇报复盘：金句、干系人洞察、故事线及案例推荐。';
    if (t.includes('巡检') || t.includes('智能巡检') || lower.includes('inspection')) return '可以直接点击首页里的「AI 智能巡检」卡片进入演示，我会帮你讲完闭环。';
    if (t.includes('推荐') || t.includes('怎么选')) return '你可以告诉我 行业 / 角色 / 当前最大痛点，我帮你选一条最合适的 Demo 路线。';
    return '收到。如果你愿意，也可以直接从首页卡片进入「最新 Demo」或「最新数字伙伴」。';
  };

  const sendHomeMessage = async () => {
    const text = homeInput.trim();
    if (!text || isHomeChatLoading) return;

    // 先把用户消息 push 进去
    setHomeMessages((prev) => [...prev, { role: 'user', text }]);
    setHomeInput('');
    setIsHomeChatLoading(true);

    try {
      const resp = await fetch(AILY_CHAT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }

      const data = await resp.json();
      const answer = typeof data?.answer === 'string' && data.answer.trim()
        ? data.answer.trim()
        : replyHomeAssistantFallback(text);

      setHomeMessages((prev) => [...prev, { role: 'ai', text: answer }]);
    } catch (error) {
      console.error('首页 Aily 对话调用失败，使用本地 fallback：', error);
      const fallback = replyHomeAssistantFallback(text);
      setHomeMessages((prev) => [...prev, { role: 'ai', text: fallback }]);
    } finally {
      setIsHomeChatLoading(false);
    }
  };

  const activeLabel = selectedDemo 
    ? selectedDemo.title 
    : currentApp === 'home' 
      ? '首页' 
      : currentApp === 'demo'
        ? 'Demo中心'
        : '数字伙伴';

  const isLightMode = currentApp === 'demo' && selectedDemo && demoViewMode === 'workspace';

  const apps: { id: AppId; name: string; icon: React.ReactNode }[] = [
    { id: 'home', name: '首页', icon: <img src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2014_32_47%201.png" alt="首页" className="w-4 h-4 object-contain" loading="lazy" /> },
    { id: 'demo', name: 'Demo中心', icon: <img src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2014_31_10%201.png" alt="Demo" className="w-4 h-4 object-contain" loading="lazy" /> },
    { id: 'efficiency', name: '数字伙伴', icon: <img src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2014_31_37%201.png" alt="数字伙伴" className="w-4 h-4 object-contain" loading="lazy" /> }
  ];

  const handleToolbarNavigate = (id: string) => {
    if (id === 'inspection') {
      const demo = demoList.find(d => d.id === 'inspection');
      if (demo) {
        setSelectedDemo(demo);
        setCurrentApp('demo');
        setDemoViewMode('flow');
      }
    } else if (id === 'tantan') {
      // 映射到 GTM Demo (包含探探)
      const demo = demoList.find(d => d.id === 'gtm');
      if (demo) {
        setSelectedDemo(demo);
        setCurrentApp('demo');
        setDemoViewMode('flow');
      }
    }
  };

  return (
    <div className="h-[100dvh] w-full bg-[color:var(--bg)] overflow-hidden font-sans relative">
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
          suspendWhenOffscreen={true}
        /> 
      </div>
      <header className="fixed top-0 left-0 right-0 h-14 border-b border-[color:var(--border)] flex items-center justify-between px-4 lg:px-6 bg-[color:var(--bg-surface-1)] z-50">
        <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-1">
          <div className="flex items-center gap-3 cursor-pointer group flex-shrink-0" onClick={handleGoHome}>
            <img 
              src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/Lark_Suite_logo_2022%201_%E5%89%AF%E6%9C%AC.png" 
              alt="Logo" 
              className="w-8 h-8 object-contain transition-transform group-hover:scale-105"
              loading="lazy"
            />
            <div className="flex flex-col leading-tight hidden sm:flex">
              <h1 className="font-semibold text-sm text-[color:var(--text)] tracking-tight">AirDemo</h1>
              <span className="text-[10px] font-medium text-[color:var(--text-3)] tracking-wide">Showroom</span>
            </div>
          </div>

          {/* 桌面端导航菜单 */}
          <nav className="hidden lg:flex items-center gap-1 ml-4 lg:ml-6 overflow-x-auto no-scrollbar mask-gradient-r">
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
                className={`ui-btn ui-btn-ghost px-3 h-8 gap-2 text-xs whitespace-nowrap flex-shrink-0 rounded-[var(--radius-md)] ${currentApp === app.id ? 'bg-[color:var(--bg-surface-2)] text-[color:var(--text)] font-medium' : 'text-[color:var(--text-2)] font-normal hover:text-[color:var(--text)]'}`}
              >
                {app.icon}
                {app.name}
              </button>
            ))}

            <a
              href={AI_NAVIGATOR_URL}
              target="_blank"
              rel="noreferrer"
              className="ui-btn ui-btn-ghost px-3 h-8 gap-2 text-xs whitespace-nowrap flex-shrink-0 text-[color:var(--text-2)] font-normal hover:text-[color:var(--text)] rounded-[var(--radius-md)]"
            >
              <img src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2014_36_28%201.png" alt="AI领航者" className="w-4 h-4 object-contain" loading="lazy" />
              AI领航者
            </a>
          </nav>

          {/* 移动端汉堡菜单按钮 */}
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] hover:bg-[color:var(--bg-surface-2)] transition-colors ml-auto"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="打开菜单"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-[color:var(--text)]" />
            ) : (
              <Menu className="w-6 h-6 text-[color:var(--text)]" />
            )}
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-3 lg:gap-4 flex-shrink-0 ml-4">
          {selectedDemo && (
            <button onClick={handleReset} className="ui-btn border border-[color:var(--border)] h-8 text-xs px-3 whitespace-nowrap hover:bg-[color:var(--danger-subtle)] hover:text-[color:var(--danger)] hover:border-[color:var(--danger)] transition-all">
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

      {/* 移动端菜单遮罩 */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 移动端菜单面板 */}
      {isMobileMenuOpen && (
        <div className="fixed top-14 right-0 left-0 bg-[color:var(--bg-surface-1)] border-b border-[color:var(--border)] z-50 lg:hidden shadow-xl">
          <div className="p-4 space-y-2">
            {apps.map(app => (
              <button
                key={app.id}
                onClick={() => {
                  if (app.id === 'home') {
                    handleGoHome();
                  } else if (app.id === 'efficiency' && selectedDemo) {
                     setDemoViewMode('workspace');
                  } else if (app.id === 'demo') {
                    setSelectedDemo(null);
                  }
                  setCurrentApp(app.id);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full ui-btn ui-btn-ghost px-4 h-12 gap-3 text-sm flex items-center justify-start ${currentApp === app.id ? 'bg-[color:var(--bg-surface-2)] text-[color:var(--text)] font-medium' : 'text-[color:var(--text-2)] font-normal hover:text-[color:var(--text)]'}`}
              >
                {app.icon}
                {app.name}
              </button>
            ))}

            <a
              href={AI_NAVIGATOR_URL}
              target="_blank"
              rel="noreferrer"
              className="w-full ui-btn ui-btn-ghost px-4 h-12 gap-3 text-sm flex items-center justify-start text-[color:var(--text-2)] font-normal hover:text-[color:var(--text)]"
            >
              <img src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2014_36_28%201.png" alt="AI领航者" className="w-4 h-4 object-contain" />
              AI领航者
            </a>

            {selectedDemo && (
              <button 
                onClick={() => {
                  handleReset();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full ui-btn border border-[color:var(--border)] h-12 text-sm px-4 hover:bg-[color:var(--danger-subtle)] hover:text-[color:var(--danger)] hover:border-[color:var(--danger)] transition-all"
              >
                退出演示
              </button>
            )}
          </div>
        </div>
      )}

      <main className={`absolute top-14 bottom-0 left-0 right-0 flex flex-col lg:flex-row overflow-hidden z-10 ${isLightMode ? 'light-theme' : ''}`}>
        {currentApp === 'efficiency' ? (
          <Efficiency tools={efficiencyTools} />
        ) : selectedDemo ? (
          (demoViewMode === 'flow') ? (
            <DemoFlow 
              demo={selectedDemo} 
              onEnterApp={() => {
                if (selectedDemo.url) {
                  window.open(selectedDemo.url, '_blank', 'noopener,noreferrer');
                } else {
                  setDemoViewMode('workspace');
                }
              }} 
            />
          ) : selectedDemo.id === 'gtm' ? (
            <AIGTMView />
          ) : (
            <Workspace demo={selectedDemo} currentApp={currentApp} initialView={workspaceInitialView} />
          )
        ) : currentApp === 'home' ? (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
            <div className="flex-1 overflow-y-auto no-scrollbar p-6 lg:p-8 pb-24 lg:pb-12">
              <div className="max-w-6xl mx-auto space-y-8 lg:space-y-10">
                <section className="ui-card overflow-hidden border border-[color:var(--border)] shadow-[var(--shadow-sm)]">
                  <div className="px-6 py-8 sm:px-8 sm:py-10 lg:px-16 lg:py-16 relative overflow-hidden">
                    <div className="max-w-3xl relative z-10">
                      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[color:var(--text)] tracking-tight leading-tight min-h-[3em]">
                        <TextType
                          text={['欢迎来到\n飞书 AI 解决方案样板间']}
                          typingSpeed={100}
                          cursorCharacter="|"
                          loop={false}
                          showCursor={true}
                        />
                      </h2>
                      <p className="mt-4 lg:mt-6 text-sm sm:text-base lg:text-lg text-[color:var(--text-2)] leading-relaxed max-w-2xl font-normal">
                        用最短路径把客户需求翻译成方案故事线：<br/>数据结构化 → AI 洞察 → 行动闭环。
                      </p>
                      <div className="mt-6 sm:mt-8 lg:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4">
                        <button
                          onClick={() => setCurrentApp('demo')}
                          className="ui-btn ui-btn-primary h-9 px-6 text-sm justify-center font-medium transition-transform active:scale-95 rounded-[var(--radius-lg)]"
                        >
                          开始探索
                          <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => setCurrentApp('efficiency')}
                          className="ui-btn ui-btn-secondary h-9 px-6 text-sm justify-center font-medium transition-colors rounded-[var(--radius-lg)]"
                        >
                          打开数字伙伴
                        </button>
                      </div>
                    </div>
                    
                    {/* Decorative Image */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-16 h-[120%] w-[50%] hidden lg:flex items-center justify-center pointer-events-none z-0 opacity-80 mix-blend-normal">
                      <img 
                        src="https://raw.githubusercontent.com/xjjm123123123/my_imge/main/img/ChatGPT%20Image%202025%E5%B9%B412%E6%9C%8825%E6%97%A5%2000_09_48.png" 
                        alt="" 
                        className="max-w-full max-h-full object-contain transform scale-[1.15]"
                        loading="lazy"
                      />
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-4 sm:mb-5 lg:mb-6">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-[var(--radius-md)] bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text)] shadow-sm">
                        <Clock size={16} />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-[color:var(--text)] tracking-tight">最新 Demo</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                    {demoList.map((demo) => (
                      <div
                        key={demo.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => {
                          setWorkspaceInitialView('main');
                          setSelectedDemo(demo);
                          setCurrentApp('demo');
                          setDemoViewMode('flow');
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setWorkspaceInitialView('main');
                            setSelectedDemo(demo);
                            setCurrentApp('demo');
                            setDemoViewMode('flow');
                          }
                        }}
                        className="ui-card group overflow-hidden text-left relative hover:shadow-[var(--shadow-lg)] transition-all duration-500 border-0 bg-[color:var(--bg-surface-1)] h-[280px] sm:h-[320px] flex flex-col rounded-[var(--radius-xl)] cursor-pointer"
                      >
                        <div className="absolute inset-0 z-0">
                           {demo.cover ? (
                            <img src={demo.cover} alt="" className="absolute inset-0 !w-full !h-full !max-w-none object-cover object-top transition-transform duration-700 group-hover:scale-105 block" loading="lazy" />
                          ) : (
                            <div className="w-full h-full bg-[color:var(--bg-subtle)] flex items-center justify-center">
                              <LayoutGrid size={16} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-500" />
                        </div>
                        
                        <div className="relative z-10 p-4 sm:p-6 flex flex-col h-full justify-end text-white">
                          <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <div className="flex items-center gap-2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                               <span className="px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-[10px] font-medium tracking-wide">
                                 方案 Demo
                               </span>
                            </div>
                            <h4 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2 text-white leading-tight shadow-sm">{demo.title}</h4>
                            <p className="text-xs sm:text-sm text-white/80 line-clamp-2 leading-relaxed font-light mb-3 sm:mb-4 opacity-80 group-hover:opacity-100 transition-opacity">
                              {demo.valueProp}
                            </p>
                            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-medium text-white/90 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-2 group-hover:translate-y-0">
                              <span>进入体验</span>
                              <ArrowRight size={14} />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="ui-card overflow-hidden text-left bg-[color:var(--bg-subtle)] border border-dashed border-[color:var(--border)] hover:border-[color:var(--text-3)] cursor-default flex flex-col justify-center items-center text-center p-6 sm:p-8 h-[280px] sm:h-[320px] backdrop-blur-sm transition-colors group rounded-[var(--radius-xl)]">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-3)] mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <LayoutGrid size={16} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-[color:var(--text)] mb-2">更多 Demo 正在制作</h4>
                      <p className="text-[10px] sm:text-xs text-[color:var(--text-3)] max-w-[200px] leading-relaxed">后续会持续补充更多行业与角色场景。</p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center justify-between mb-5 sm:mb-6 lg:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[color:var(--bg-subtle)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text)] shadow-sm">
                        <Zap size={16} />
                      </div>
                      <h3 className="text-base sm:text-lg font-semibold text-[color:var(--text)] tracking-tight">最新数字伙伴</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    {efficiencyTools.map((tool) => (
                      <div key={tool.id} className="ui-card overflow-hidden p-4 sm:p-5 lg:p-6 hover:border-[color:var(--border-strong)] hover:bg-[color:var(--bg-surface-2)] transition-all duration-300 group flex flex-col h-full items-start sm:items-center text-left sm:text-center rounded-[var(--radius-xl)]">
                        <div className="flex flex-row sm:flex-col items-center gap-3 sm:gap-4 mb-3 sm:mb-4 w-full">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[var(--radius-md)] bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center overflow-hidden flex-shrink-0">
                             {tool.avatarUrl ? (
                               <img src={tool.avatarUrl} alt={tool.name} className="w-full h-full object-cover" loading="lazy" />
                             ) : (
                               <Zap size={16} />
                             )}
                          </div>
                          <div className="w-full px-2 flex-1">
                             <h3 className="text-sm sm:text-base font-semibold text-[color:var(--text)] truncate w-full">{tool.title}</h3>
                             <span className="text-[10px] sm:text-xs text-[color:var(--text-2)] block truncate w-full">{tool.name}</span>
                          </div>
                        </div>
                        
                        <div className="bg-[color:var(--bg-surface-2)] rounded-[var(--radius-md)] p-2.5 sm:p-3 border border-[color:var(--border)] text-[10px] sm:text-xs text-[color:var(--text-2)] leading-relaxed mb-3 sm:mb-4 flex-grow w-full break-words">
                          "{tool.highlight}"
                        </div>

                        <div className="flex flex-wrap items-center justify-start sm:justify-center mt-auto w-full gap-2 sm:gap-3">
                           <div className="flex flex-wrap gap-1 sm:gap-1.5 justify-start sm:justify-center max-w-full">
                            {tool.skills.slice(0, 1).map((s) => (
                              <span key={s} className="px-1.5 py-0.5 rounded border border-[color:var(--border)] bg-[color:var(--bg-surface-1)] text-[10px] text-[color:var(--text-2)] truncate max-w-[80px] sm:max-w-[100px]">
                                {s}
                              </span>
                            ))}
                          </div>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noreferrer"
                            className="ui-btn ui-btn-primary px-3 h-8 text-xs flex-shrink-0 sm:px-5 sm:h-9 sm:text-sm rounded-[var(--radius-lg)]"
                          >
                            打开
                          </a>
                        </div>
                      </div>
                    ))}

                    <div className="ui-card overflow-hidden text-left bg-[color:var(--bg-subtle)] border border-dashed border-[color:var(--border)] hover:border-[color:var(--text-3)] cursor-default flex flex-col justify-center items-center text-center p-6 sm:p-8 h-full min-h-[180px] sm:min-h-[200px] backdrop-blur-sm transition-colors group rounded-[var(--radius-xl)]">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[color:var(--surface)] border border-[color:var(--border)] flex items-center justify-center text-[color:var(--text-3)] mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Zap size={16} />
                      </div>
                      <h4 className="text-xs sm:text-sm font-medium text-[color:var(--text)] mb-2">更多数字伙伴敬请期待</h4>
                      <p className="text-[10px] sm:text-xs text-[color:var(--text-3)] max-w-[200px] leading-relaxed">持续补充更多场景助手。</p>
                    </div>
                  </div>
                </section>

                <BottomToolbar onNavigate={handleToolbarNavigate} />
              </div>
            </div>

            <aside
              className={`lg:w-[360px] lg:h-auto flex flex-col flex-shrink-0 z-40 lg:relative fixed top-[64px] lg:top-auto lg:right-auto lg:left-auto bottom-auto transition-all duration-300 ease-in-out backdrop-blur-xl ${
                isHomeChatCollapsed
                  ? 'w-10 h-10 rounded-full right-4 left-auto bg-[color:var(--primary)] shadow-lg border-0 items-center justify-center overflow-hidden'
                  : 'w-[calc(100%-32px)] h-[400px] right-4 left-4 rounded-2xl bg-[color:var(--bg-surface-1)] shadow-[var(--shadow-xl)] border border-[color:var(--border)]'
              } lg:bg-transparent lg:shadow-[var(--shadow-xl)] lg:border lg:border-t-0 lg:border-l lg:border-[color:var(--border)] lg:rounded-none lg:items-stretch lg:justify-start lg:overflow-visible ui-card`}
            >
              <div className={`h-12 lg:h-16 border-b border-[color:var(--border)] flex items-center justify-between px-4 lg:px-6 bg-transparent flex-shrink-0 ${isHomeChatCollapsed ? 'border-0 p-0 justify-center w-full h-full' : ''}`}>
                <button
                  type="button"
                  onClick={() => setIsHomeChatCollapsed((v) => !v)}
                  className={`flex items-center gap-2 text-sm font-bold text-[color:var(--text)] min-w-0 lg:pointer-events-none w-full lg:w-auto ${isHomeChatCollapsed ? 'justify-center h-full text-white' : ''}`}
                  aria-label={isHomeChatCollapsed ? '展开首页 AI 助手' : '折叠首页 AI 助手'}
                >
                  <div className={`w-6 h-6 rounded-[var(--radius-sm)] flex items-center justify-center shadow-sm flex-shrink-0 ${isHomeChatCollapsed ? 'bg-transparent text-white shadow-none' : 'bg-[color:var(--primary)] text-white'}`}>
                    <Zap size={14} />
                  </div>
                  <span className={`flex-1 text-left ${isHomeChatCollapsed ? 'hidden lg:block' : 'block'}`}>首页 AI 助手</span>
                  <ChevronDown size={16} className={`lg:hidden transition-transform ${isHomeChatCollapsed ? 'hidden' : 'rotate-180'}`} />
                </button>
              </div>

              <div className={`flex-1 overflow-y-auto no-scrollbar p-4 lg:p-6 space-y-4 bg-transparent ${isHomeChatCollapsed ? 'hidden lg:block' : ''}`}>
                {homeMessages.map((m, idx) => (
                  <div key={idx} className="flex flex-col gap-2">
                    <div className={`flex ${m.role === 'ai' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[90%] p-3 lg:p-4 rounded-[var(--radius-xl)] text-xs lg:text-sm leading-relaxed border shadow-[var(--shadow-sm)] ${m.role === 'ai' ? 'bg-[color:var(--surface)]/80 border-[color:var(--border)] text-[color:var(--text)] backdrop-blur-md' : 'bg-[color:var(--primary)] border-transparent text-white'}`}>
                        {m.text}
                      </div>
                    </div>
                    {idx === 0 && m.role === 'ai' && (
                      <div className="flex flex-wrap gap-2 ml-1">
                        <button onClick={() => setHomeInput('探探')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-3 lg:px-4 text-[10px] lg:text-xs rounded-full border-[color:var(--border)] bg-[color:var(--bg-surface-1)] hover:bg-[color:var(--bg-surface-2)] shadow-sm transition-all">探探</button>
                        <button onClick={() => setHomeInput('睿睿')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-3 lg:px-4 text-[10px] lg:text-xs rounded-full border-[color:var(--border)] bg-[color:var(--bg-surface-1)] hover:bg-[color:var(--bg-surface-2)] shadow-sm transition-all">睿睿</button>
                        <button onClick={() => setHomeInput('巡检')} className="ui-btn ui-btn-secondary h-7 lg:h-8 px-3 lg:px-4 text-[10px] lg:text-xs rounded-full border-[color:var(--border)] bg-[color:var(--bg-surface-1)] hover:bg-[color:var(--bg-surface-2)] shadow-sm transition-all">巡检</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className={`p-3 lg:p-6 border-t border-[color:var(--border)] bg-transparent flex-shrink-0 ${isHomeChatCollapsed ? 'hidden lg:block' : ''}`}>
                <div className="relative w-full flex flex-col lg:block gap-2 lg:gap-0">
                  <input
                    value={homeInput}
                    onChange={(e) => setHomeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') sendHomeMessage();
                    }}
                    placeholder="输入你的问题…"
                    className="ui-input w-full pl-4 pr-4 lg:pr-12 h-10 lg:h-11 text-xs lg:text-sm rounded-full bg-[color:var(--bg-surface-2)] border-transparent focus:bg-[color:var(--bg-surface-1)] focus:border-[color:var(--primary)] transition-all shadow-inner"
                  />
                  <div className="flex justify-end lg:block">
                    <button
                      onClick={sendHomeMessage}
                      className="static lg:absolute lg:right-1 lg:top-1/2 lg:-translate-y-1/2 w-8 h-8 flex items-center justify-center bg-[color:var(--primary)] text-white rounded-full shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
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

export default memo(App);
