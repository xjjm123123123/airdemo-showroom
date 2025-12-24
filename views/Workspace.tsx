import React, { useState, useEffect, useRef } from 'react';
import Prism from '../components/Prism';
import { GoogleGenAI } from "@google/genai";
import { BusinessContext, Demo } from '../types';
import { EFFICIENCY_TOOLS } from '../constants';

type AppId = 'home' | 'demo' | 'efficiency';
type ViewId = 'main' | 'management' | 'equipment' | 'factory';
type SecondaryViewId = Exclude<ViewId, 'main'>;
type FieldType = 'text' | 'number' | 'select' | 'image';
type BaseViewMode = 'table' | 'app';

// Icons
const IconHash = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>;
const IconType = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>;
const IconList = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const IconImage = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
const IconZap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const IconFileText = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>;
const IconArrowUpRight = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>;
const IconMessage = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>;
const IconSend = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const IconGrid = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>;

interface WorkspaceProps {
  demo: Demo;
  currentApp: AppId;
  initialView?: ViewId;
}

interface ColumnDef {
  key: string;
  label: string;
  type: FieldType;
}

const Workspace: React.FC<WorkspaceProps> = ({ demo, currentApp, initialView }) => {
  const [isAiRunning, setIsAiRunning] = useState(false);

  const baseIframeUrl = 'https://bytedance.larkoffice.com/base/Rcbrbk2qCazsPTs48TecJSIKnod?from=from_copylink';
  const baseAppIframeUrl = 'https://bytedance.larkoffice.com/app/Vv6DbpDoGawcMwszp3XcMms6nTf';
  
  // UI State
  const [currentView, setCurrentView] = useState<ViewId>(initialView || 'main');
  const [baseViewMode, setBaseViewMode] = useState<BaseViewMode>('app');
  
  // State for current active table and columns
  const [editableMainData, setEditableMainData] = useState<any[]>(demo.mainTable);
  const [editableSecondaryDataByView, setEditableSecondaryDataByView] = useState<{
    management?: any[];
    equipment?: any[];
    factory?: any[];
  }>(() => {
    const base = demo.secondaryTable ? { management: demo.secondaryTable, equipment: demo.secondaryTable, factory: demo.secondaryTable } : {};
    return { ...base, ...(demo.secondaryTables || {}) };
  });
  const [columns, setColumns] = useState<ColumnDef[]>([]);
  const [editingCell, setEditingCell] = useState<{rowIndex: number, colKey: string} | null>(null);
  
  // New Column Form State
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState<FieldType>('text');

  // Bot Chat Messages
  const [messages, setMessages] = useState<{role: 'ai' | 'user', text: string}[]>([]);
  const [isAilyThinking, setIsAilyThinking] = useState(false);
  const [activeBusinessContext, setActiveBusinessContext] = useState<BusinessContext | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarInnerRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  const getSecondaryData = (view: SecondaryViewId) => editableSecondaryDataByView[view] || [];

  useEffect(() => {
    setShowAddColumn(false);
    setEditingCell(null);
    if (currentApp !== 'demo') setBaseViewMode('app');
  }, [currentApp]);

  useEffect(() => {
    setEditableMainData(demo.mainTable);
    const base = demo.secondaryTable ? { management: demo.secondaryTable, equipment: demo.secondaryTable, factory: demo.secondaryTable } : {};
    setEditableSecondaryDataByView({ ...base, ...(demo.secondaryTables || {}) });
  }, [demo]);

  useEffect(() => {
    setCurrentView(initialView || 'main');
  }, [demo, initialView]);

  useEffect(() => {
    setShowAddColumn(false);
    setEditingCell(null);
  }, [baseViewMode]);

  const viewNameMap: Record<ViewId, string> = {
    main: '人员违规数据表',
    management: '巡检管理数据表',
    equipment: '设备巡检数据表',
    factory: '厂区巡检数据表'
  };

  // Initialize and React to View Changes
  useEffect(() => {
    // Determine which dataset to use as source for schema
    const secondarySource = currentView === 'main' ? undefined : (demo.secondaryTables?.[currentView] || demo.secondaryTable);
    const useSecondary = (currentView !== 'main') && secondarySource && secondarySource.length > 0;
    const sourceData = useSecondary ? secondarySource![0] : demo.mainTable[0];
    
    const initialColumns: ColumnDef[] = Object.keys(sourceData).map(key => {
      if (key === 'id') return { key, label: 'ID', type: 'text' as FieldType };
      const lowerKey = key.toLowerCase();
      let type: FieldType = 'text';
      
      if (lowerKey.includes('budget') || lowerKey.includes('score') || lowerKey === '编号' || lowerKey === '序列号') {
        type = 'number';
      } else if (
        lowerKey.includes('risk') || 
        lowerKey.includes('status') || 
        lowerKey.includes('状态') || 
        lowerKey.includes('情况') || 
        lowerKey.includes('岗位') ||
        lowerKey === '部门'
      ) {
        type = 'select';
      } else if (lowerKey.includes('图片') || lowerKey.includes('记录') || lowerKey.includes('photo') || lowerKey.includes('image')) {
        type = 'image';
      }
      
      return { key, label: key, type };
    });
    setColumns(initialColumns);

    setMessages(prev => [...prev, { 
      role: 'ai', 
      text: `已切换至【${viewNameMap[currentView]}】。Aily 已根据该业务维度同步分析模型。` 
    }]);
  }, [currentView, demo]);

  const getVisibleTableData = () => {
    const useSecondary = (currentView !== 'main') && getSecondaryData(currentView as SecondaryViewId).length > 0;
    let data = useSecondary ? [...getSecondaryData(currentView as SecondaryViewId)] : [...editableMainData];
    
    if (currentView === 'management') {
      return data;
    }
    if (currentView === 'equipment') {
      if (demo.secondaryTables?.equipment) return data;
      return data.filter(row => row.任务名称?.includes('电机') || row.任务名称?.includes('电气') || row.位置?.includes('设备'));
    }
    if (currentView === 'factory') {
      if (demo.secondaryTables?.factory) return data;
      return data.filter(row => row.任务名称?.includes('照明') || row.位置?.includes('仓库') || row.位置?.includes('休息区'));
    }
    return data;
  };

  const visibleTable = getVisibleTableData();

  useEffect(() => {
    const tableEl = tableContainerRef.current;
    const scrollbarEl = bottomScrollbarRef.current;
    const innerEl = bottomScrollbarInnerRef.current;
    if (!tableEl || !scrollbarEl || !innerEl) return;

    const syncFromTable = () => {
      if (isSyncingScrollRef.current) return;
      isSyncingScrollRef.current = true;
      scrollbarEl.scrollLeft = tableEl.scrollLeft;
      queueMicrotask(() => {
        isSyncingScrollRef.current = false;
      });
    };

    const syncFromScrollbar = () => {
      if (isSyncingScrollRef.current) return;
      isSyncingScrollRef.current = true;
      tableEl.scrollLeft = scrollbarEl.scrollLeft;
      queueMicrotask(() => {
        isSyncingScrollRef.current = false;
      });
    };

    const updateInnerWidth = () => {
      innerEl.style.width = `${tableEl.scrollWidth}px`;
      scrollbarEl.scrollLeft = tableEl.scrollLeft;
    };

    updateInnerWidth();

    tableEl.addEventListener('scroll', syncFromTable, { passive: true });
    scrollbarEl.addEventListener('scroll', syncFromScrollbar, { passive: true });
    window.addEventListener('resize', updateInnerWidth, { passive: true });

    const resizeObserver = new ResizeObserver(updateInnerWidth);
    resizeObserver.observe(tableEl);

    return () => {
      tableEl.removeEventListener('scroll', syncFromTable);
      scrollbarEl.removeEventListener('scroll', syncFromScrollbar);
      window.removeEventListener('resize', updateInnerWidth);
      resizeObserver.disconnect();
    };
  }, [columns, currentView, currentApp, baseViewMode, visibleTable.length]);

  // Handlers
  const handleCellEdit = (rowIndex: number, colKey: string, value: string) => {
    const targetRow = visibleTable[rowIndex];
    const useSecondary = (currentView !== 'main') && getSecondaryData(currentView as SecondaryViewId).length > 0;
    const secondaryView = currentView as SecondaryViewId;
    const sourceData = useSecondary ? [...getSecondaryData(secondaryView)] : [...editableMainData];
    const setData = useSecondary
      ? (next: any[]) => setEditableSecondaryDataByView(prev => ({ ...prev, [secondaryView]: next }))
      : setEditableMainData;

    const sourceIndex = sourceData.findIndex(r => r.id === targetRow.id);
    if (sourceIndex !== -1) {
      const colDef = columns.find(c => c.key === colKey);
      let finalValue: any = value;
      if (colDef?.type === 'number') finalValue = value.replace(/[^0-9.-]+/g,"");
      sourceData[sourceIndex] = { ...sourceData[sourceIndex], [colKey]: finalValue };
      setData(sourceData);
    }
  };

  const handleAddRecord = () => {
    const useSecondary = (currentView !== 'main') && getSecondaryData(currentView as SecondaryViewId).length > 0;
    const secondaryView = currentView as SecondaryViewId;
    const sourceData = useSecondary ? [...getSecondaryData(secondaryView)] : [...editableMainData];
    const setData = useSecondary
      ? (next: any[]) => setEditableSecondaryDataByView(prev => ({ ...prev, [secondaryView]: next }))
      : setEditableMainData;

    const newId = `NEW-${Date.now()}`;
    const newRecord: any = { id: newId };
    columns.forEach(col => { 
      if (col.key !== 'id') {
        newRecord[col.key] = col.type === 'number' ? '0' : ''; 
      }
    });
    setData([...sourceData, newRecord]);
  };

  const handleDeleteRecord = (id: string) => {
    const useSecondary = (currentView !== 'main') && getSecondaryData(currentView as SecondaryViewId).length > 0;
    const secondaryView = currentView as SecondaryViewId;
    if (useSecondary) {
      setEditableSecondaryDataByView(prev => ({ ...prev, [secondaryView]: (prev[secondaryView] || []).filter(row => row.id !== id) }));
      return;
    }
    setEditableMainData(prev => prev.filter(row => row.id !== id));
  };

  const handleAddColumn = () => {
    if (!newColName.trim()) return;
    const newKey = newColName;
    const newCol: ColumnDef = { key: newKey, label: newColName, type: newColType };
    
    setColumns(prev => [...prev, newCol]);
    
    // Add to both datasets to maintain consistency
    setEditableMainData(prev => prev.map(row => ({ ...row, [newKey]: newColType === 'number' ? '0' : '' })));
    setEditableSecondaryDataByView(prev => {
      const next: typeof prev = { ...prev };
      (Object.keys(next) as SecondaryViewId[]).forEach(view => {
        const rows = next[view];
        if (!rows) return;
        next[view] = rows.map(row => ({ ...row, [newKey]: newColType === 'number' ? '0' : '' }));
      });
      return next;
    });
    
    setNewColName('');
    setShowAddColumn(false);
    setIsAiRunning(true);
    
    setTimeout(() => {
      setIsAiRunning(false);
      setMessages(prev => [...prev, { role: 'ai', text: `已成功添加新维度“${newCol.label}”。Aily 已自动更新多维分析模型。` }]);
    }, 100);
  };

  const deleteColumn = (key: string) => {
    if (key === 'id') return;
    setColumns(columns.filter(c => c.key !== key));
  };

  const askGemini = async (question: string, context?: BusinessContext) => {
    setIsAilyThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const ctx = context || activeBusinessContext;
      const ctxPayload = ctx
        ? {
            id: ctx.id,
            title: ctx.title,
            category: ctx.category,
            description: ctx.description,
            scenario: ctx.scenario,
            mcps: ctx.mcps,
            skills: ctx.skills,
            agents: ctx.agents
          }
        : null;

      const systemInstruction = [
        '你是一个专业的业务分析师 Aily。',
        `当前演示场景：${demo.title}`,
        `当前数据视角：${currentView}`,
        `当前表格结构（字段定义）：${JSON.stringify(columns)}`,
        `当前可见数据（行记录）：${JSON.stringify(visibleTable)}`,
        ctxPayload ? `业务上下文（Business Context）：${JSON.stringify(ctxPayload)}` : null,
        ctxPayload ? '你必须遵循该业务上下文的目标/约束/输出要求，并尽量引用可见数据作为证据。' : null,
        '请根据以上信息提供深度的业务见解。语言：中文。简洁、专业、结果导向。'
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: question,
        config: { systemInstruction, temperature: 0.7 },
      });
      setMessages(prev => [...prev, { role: 'ai', text: response.text || "已完成分析。" }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "AI 响应异常，请重试。" }]);
    } finally {
      setIsAilyThinking(false);
    }
  };

  const getHeaderIcon = (type: FieldType) => {
    switch(type) {
      case 'number': return <span className="text-blue-500 mr-2"><IconHash /></span>;
      case 'select': return <span className="text-orange-400 mr-2"><IconList /></span>;
      case 'image': return <span className="text-purple-400 mr-2"><IconImage /></span>;
      default: return <span className="text-gray-400 mr-2"><IconType /></span>;
    }
  };

  const getPillColor = (value: string) => {
    const v = String(value).trim();
    if (!v) return 'bg-gray-50 text-gray-300 border-gray-100';
    if (['高', '不合规', '紧急', '进行中', '在岗玩手机', '睡岗', '走路玩手机'].includes(v)) return 'bg-red-50 text-red-600 border-red-100';
    if (['无', '合规', '已完成', '已交付', '生产部'].includes(v)) return 'bg-green-50 text-green-600 border-green-100';
    if (['处理中', '中', 'AI识别结论', '不符合5s标准', '机械工艺师'].includes(v)) return 'bg-blue-50 text-blue-600 border-blue-100';
    return 'bg-gray-50 text-gray-600 border-gray-100';
  };

  const appImageColumn = columns.find((c) => c.type === 'image' && c.key !== 'id');
  const appPrimaryColumns = columns.filter((c) => c.key !== 'id' && c.type !== 'image');
  const appTitleColumn = appPrimaryColumns[0];
  const appDetailColumns = appPrimaryColumns.slice(1, 5);

  const getFieldKey = (candidates: string[]) => {
    const exact = columns.find((c) => candidates.includes(c.key));
    if (exact) return exact.key;
    const partial = columns.find((c) => candidates.some((k) => c.key.includes(k)));
    return partial?.key;
  };

  const normalizeDay = (raw: any) => {
    if (raw == null) return '';
    const s = String(raw).trim();
    if (!s) return '';
    const first = s.split(' ')[0];
    if (/^\d{4}[-/]\d{2}[-/]\d{2}$/.test(first)) return first.replace(/\//g, '-');
    const m = s.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (m) {
      const y = m[1];
      const mm = String(m[2]).padStart(2, '0');
      const dd = String(m[3]).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    }
    return first;
  };

  const countBy = (rows: any[], key?: string) => {
    const m = new Map<string, number>();
    if (!key) return m;
    for (const r of rows) {
      const v = String(r[key] ?? '').trim() || '未填';
      m.set(v, (m.get(v) || 0) + 1);
    }
    return m;
  };

  const countByDay = (rows: any[], dateKey?: string) => {
    const m = new Map<string, number>();
    if (!dateKey) return m;
    for (const r of rows) {
      const d = normalizeDay(r[dateKey]);
      if (!d) continue;
      m.set(d, (m.get(d) || 0) + 1);
    }
    return m;
  };

  // ... (Chart components removed for brevity, will rely on simple HTML/CSS if needed or keep existing)
  // Actually, keeping the charts but cleaning them up
  const LineChart: React.FC<{ labels: string[]; values: number[]; color: string }> = ({ labels, values, color }) => {
    const max = Math.max(1, ...values);
    const w = 420;
    const h = 140;
    const pad = 18;
    const step = values.length <= 1 ? 0 : (w - pad * 2) / (values.length - 1);
    const pts = values
      .map((v, i) => {
        const x = pad + step * i;
        const y = pad + (h - pad * 2) * (1 - v / max);
        return `${x},${y}`;
      })
      .join(' ');

    const area = `${pad},${h - pad} ${pts} ${pad + step * (values.length - 1)},${h - pad}`;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-36">
        <defs>
          <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.1} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`M ${area}`} fill="url(#lineFill)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
        {values.map((v, i) => {
          const x = pad + step * i;
          const y = pad + (h - pad * 2) * (1 - v / max);
          return <circle key={`p-${i}`} cx={x} cy={y} r={3} fill={color} />;
        })}
      </svg>
    );
  };

  return (
    <div className="h-full w-full flex flex-col lg:flex-row overflow-hidden bg-white font-sans relative text-slate-900">
      <section className="flex-1 flex flex-col min-w-0 bg-white relative overflow-hidden order-1">
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {currentApp === 'demo' ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
               <div className="h-14 bg-white border-b border-gray-100 flex items-center px-6 lg:px-8 gap-6 flex-shrink-0 z-10">
                  <div className="ml-auto inline-flex rounded-[var(--radius-md)] border border-gray-200 bg-gray-50 p-1">
                    <button
                      onClick={() => setBaseViewMode('table')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${baseViewMode === 'table' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      多维表格
                    </button>
                    <button
                      onClick={() => setBaseViewMode('app')}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-[var(--radius-sm)] transition-all ${baseViewMode === 'app' ? 'bg-white text-slate-900 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-900'}`}
                    >
                      应用模式
                    </button>
                  </div>
               </div>
               
               {baseViewMode === 'table' ? (
                 <div className="flex-1 bg-white">
                   <iframe
                     src={baseIframeUrl}
                     title="Lark Base"
                     className="w-full h-full border-0"
                     allow="clipboard-read; clipboard-write; fullscreen"
                     allowFullScreen
                   />
                 </div>
              ) : (
                <div className="flex-1 bg-white">
                  <iframe
                    src={baseAppIframeUrl}
                    title="Lark App"
                    className="w-full h-full border-0"
                    allow="clipboard-read; clipboard-write; fullscreen"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-[color:var(--text-3)] flex-col gap-4">
              <div className="text-6xl opacity-10 grayscale">
                <IconGrid />
              </div>
              <p className="text-[10px] font-bold uppercase tracking-widest">Building AI Modules...</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. AILY SIDEBAR */}
      <aside className="w-full lg:w-[360px] h-[35vh] lg:h-auto border-t lg:border-t-0 lg:border-l border-gray-200 bg-gray-50/50 flex flex-col flex-shrink-0 z-50 shadow-xl relative order-2">
        <div className="h-14 lg:h-16 border-b border-gray-200 flex items-center justify-between px-6 bg-white sticky top-0 z-10">
           <div className="flex flex-col min-w-0">
             <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
               <div className="w-6 h-6 bg-slate-900 rounded-[var(--radius-sm)] flex items-center justify-center shadow-sm text-white">
                 <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
               </div>
               Aily 分析工作台
             </h4>
             {activeBusinessContext && (
               <div className="text-[10px] font-semibold text-slate-400 tracking-tight truncate mt-1">
                 当前上下文：{activeBusinessContext.title}
               </div>
             )}
           </div>
           <button onClick={() => setMessages([])} className="text-xs font-medium text-slate-400 hover:text-slate-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors">清空</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5 no-scrollbar bg-gray-50">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
              <div className={`max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${msg.role === 'ai' ? 'bg-white border-gray-200 text-slate-800' : 'bg-slate-900 border-transparent text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAilyThinking && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-white p-3 rounded-[var(--radius-md)] text-xs text-slate-400 font-semibold border border-gray-200 shadow-sm">Aily 正在深度解构业务维度...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 border-t border-gray-200 bg-white">
          <div className="relative">
            <input
              type="text"
              disabled={isAilyThinking}
              placeholder="向 Aily 提问业务现状..."
              className="w-full h-11 pl-4 pr-12 text-sm bg-white border border-gray-200 rounded-[var(--radius-md)] focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-400 transition-all placeholder:text-slate-400 text-slate-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const input = e.currentTarget;
                  if (!input.value || isAilyThinking) return;
                  const text = input.value;
                  setMessages(prev => [...prev, { role: 'user', text }]);
                  input.value = '';
                  askGemini(text);
                }
              }}
            />
            <button className="absolute right-2 top-2 bottom-2 w-8 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-gray-100 rounded-[var(--radius-sm)] transition-all" disabled={isAilyThinking}>
              <IconSend />
            </button>
          </div>
          <p className="mt-4 text-[10px] text-slate-300 text-center font-bold tracking-[0.2em] uppercase">Gemini 3 Pro Solution Engine</p>
        </div>
      </aside>
    </div>
  );
};

export default Workspace;
