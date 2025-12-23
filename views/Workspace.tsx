
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BusinessContext, Demo } from '../types';
import { PROMPT_TEMPLATES } from '../constants';

type AppId = 'apaas' | 'base' | 'prompt';
type ViewId = 'main' | 'management' | 'equipment' | 'factory';
type SecondaryViewId = Exclude<ViewId, 'main'>;
type FieldType = 'text' | 'number' | 'select' | 'image';
type BaseViewMode = 'table' | 'app';

interface WorkspaceProps {
  demo: Demo;
  currentApp: AppId;
}

interface ColumnDef {
  key: string;
  label: string;
  type: FieldType;
}

const Workspace: React.FC<WorkspaceProps> = ({ demo, currentApp }) => {
  const [isAiRunning, setIsAiRunning] = useState(false);
  
  // UI State
  const [isBottomBarOpen, setIsBottomBarOpen] = useState(false); 
  const [currentView, setCurrentView] = useState<ViewId>('main');
  const [baseViewMode, setBaseViewMode] = useState<BaseViewMode>('table');
  
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
    setIsBottomBarOpen(false);
    setShowAddColumn(false);
    setEditingCell(null);
    if (currentApp !== 'base') setBaseViewMode('table');
  }, [currentApp]);

  useEffect(() => {
    setEditableMainData(demo.mainTable);
    const base = demo.secondaryTable ? { management: demo.secondaryTable, equipment: demo.secondaryTable, factory: demo.secondaryTable } : {};
    setEditableSecondaryDataByView({ ...base, ...(demo.secondaryTables || {}) });
  }, [demo]);

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
      case 'number': return <span className="text-blue-500 font-mono text-xs mr-2">#</span>;
      case 'select': return <span className="text-orange-400 text-xs mr-2">◉</span>;
      case 'image': return <span className="text-purple-400 text-xs mr-2">🖼️</span>;
      default: return <span className="text-gray-400 text-xs mr-2">Aa</span>;
    }
  };

  const getPillColor = (value: string) => {
    const v = String(value).trim();
    if (!v) return 'bg-gray-50 text-gray-300 border-gray-100';
    if (['高', '不合规', '紧急', '进行中', '在岗玩手机', '睡岗', '走路玩手机'].includes(v)) return 'bg-red-100 text-red-600 border-red-200';
    if (['无', '合规', '已完成', '已交付', '生产部'].includes(v)) return 'bg-green-100 text-green-600 border-green-200';
    if (['处理中', '中', 'AI识别结论', '不符合5s标准', '机械工艺师'].includes(v)) return 'bg-blue-100 text-blue-600 border-blue-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
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
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`M ${area}`} fill="url(#lineFill)" />
        <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" />
        {values.map((v, i) => {
          const x = pad + step * i;
          const y = pad + (h - pad * 2) * (1 - v / max);
          return <circle key={`p-${i}`} cx={x} cy={y} r={3.2} fill={color} />;
        })}
        {labels.length > 0 ? (
          <text x={pad} y={h - 4} fill="#9ca3af" fontSize="10" fontWeight="700">
            {labels[0]}
          </text>
        ) : null}
        {labels.length > 1 ? (
          <text x={w - pad} y={h - 4} textAnchor="end" fill="#9ca3af" fontSize="10" fontWeight="700">
            {labels[labels.length - 1]}
          </text>
        ) : null}
      </svg>
    );
  };

  const PieChart: React.FC<{ items: { label: string; value: number; color: string }[] }> = ({ items }) => {
    const total = items.reduce((s, it) => s + it.value, 0) || 1;
    const cx = 72;
    const cy = 72;
    const r = 56;
    let acc = 0;
    const arcs = items.map((it) => {
      const start = (acc / total) * Math.PI * 2;
      acc += it.value;
      const end = (acc / total) * Math.PI * 2;
      const x1 = cx + r * Math.cos(start - Math.PI / 2);
      const y1 = cy + r * Math.sin(start - Math.PI / 2);
      const x2 = cx + r * Math.cos(end - Math.PI / 2);
      const y2 = cy + r * Math.sin(end - Math.PI / 2);
      const large = end - start > Math.PI ? 1 : 0;
      const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
      return { ...it, d };
    });

    return (
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 144 144" className="w-36 h-36 flex-shrink-0">
          <circle cx={cx} cy={cy} r={r} fill="#f3f4f6" />
          {arcs.map((a) => (
            <path key={a.label} d={a.d} fill={a.color} opacity={0.95} />
          ))}
          <circle cx={cx} cy={cy} r={34} fill="#ffffff" />
          <text x={cx} y={cy - 2} textAnchor="middle" fill="#111827" fontSize="16" fontWeight="900">
            {total}
          </text>
          <text x={cx} y={cy + 16} textAnchor="middle" fill="#9ca3af" fontSize="10" fontWeight="800">
            总量
          </text>
        </svg>
        <div className="flex-1 space-y-2">
          {items.map((it) => (
            <div key={it.label} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
                <span className="text-[11px] font-bold text-gray-700 truncate">{it.label}</span>
              </div>
              <span className="text-[11px] font-bold text-gray-600">{it.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const BarChart: React.FC<{ items: { label: string; value: number; color: string }[]; horizontal?: boolean }> = ({ items, horizontal }) => {
    const max = Math.max(1, ...items.map((x) => x.value));
    return (
      <div className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center gap-3">
            <div className={`text-[10px] font-bold text-gray-500 ${horizontal ? 'w-16' : 'w-24'} truncate`}>{it.label}</div>
            <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
              <div className="h-full" style={{ width: `${Math.max(3, (it.value / max) * 100)}%`, backgroundColor: it.color, opacity: 0.85 }} />
            </div>
            <div className="text-[10px] font-black text-gray-600 w-8 text-right">{it.value}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="h-full w-full flex overflow-hidden bg-[#f5f6f7]">
      <section className="flex-1 flex flex-col min-w-0 bg-white relative">
        <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-white z-40 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex items-center gap-1.5 text-xs font-medium min-w-0">
              <span className="text-gray-400">Workspace</span>
              <span className="text-gray-300">/</span>
              <span className="text-gray-900 font-bold truncate">{currentApp === 'prompt' ? '提示词模板库' : currentApp === 'apaas' ? 'aPaaS 低代码' : demo.title}</span>
            </div>
          </div>
          {currentApp === 'base' && (
             <button onClick={() => setIsBottomBarOpen(!isBottomBarOpen)} className="text-[10px] font-black bg-gray-50 px-3 py-1 rounded hover:bg-gray-100 text-gray-500 transition-all border border-gray-200 uppercase tracking-tighter">
                {isBottomBarOpen ? 'Close Views' : 'Views'}
             </button>
          )}
        </div>

        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6f7]">
          {currentApp === 'base' ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
               <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0 z-10">
                  <button onClick={handleAddRecord} className="text-blue-600 text-[11px] font-bold hover:bg-blue-50 px-2 py-1 rounded transition-colors">+ 新增记录</button>
                  {baseViewMode === 'table' && (
                    <div className="relative">
                      <button onClick={() => setShowAddColumn(!showAddColumn)} className={`text-blue-600 text-[11px] font-bold px-2 py-1 rounded transition-colors ${showAddColumn ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>+ 添加字段</button>
                      {showAddColumn && (
                        <div className="absolute top-8 left-0 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 z-[100] animate-fadeIn border-t-4 border-t-blue-600">
                           <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">配置新字段</h5>
                           <input autoFocus value={newColName} onChange={(e) => setNewColName(e.target.value)} placeholder="列名 (如：复核员)" className="w-full text-xs border border-gray-200 p-2.5 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none bg-gray-50 mb-3" />
                           <div className="grid grid-cols-3 gap-2 mb-4">
                             {(['text', 'number', 'select', 'image'] as FieldType[]).map(t => (
                               <button key={t} onClick={() => setNewColType(t)} className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 transition-all ${newColType === t ? 'border-blue-500 bg-blue-50 text-blue-600' : 'border-gray-50 text-gray-400 hover:border-blue-100 hover:bg-gray-50'}`}>
                                 <span className="text-sm mb-1">{t === 'text' ? 'Aa' : t === 'number' ? '#' : t === 'select' ? '◉' : '🖼️'}</span>
                                 <span className="text-[9px] font-bold">{t === 'text' ? '文本' : t === 'number' ? '数字' : t === 'select' ? '选项' : '图片'}</span>
                               </button>
                             ))}
                           </div>
                           <button onClick={handleAddColumn} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-xs font-bold hover:bg-blue-700 shadow-lg active:scale-95 transition-all">确认添加</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="ml-auto inline-flex rounded-xl border border-gray-200 bg-gray-50 p-0.5">
                    <button
                      onClick={() => setBaseViewMode('table')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${baseViewMode === 'table' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      多维表格
                    </button>
                    <button
                      onClick={() => setBaseViewMode('app')}
                      className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-colors ${baseViewMode === 'app' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                    >
                      应用模式
                    </button>
                  </div>
               </div>
               
               {baseViewMode === 'table' ? (
                 <>
                   <div ref={tableContainerRef} className="flex-1 overflow-auto bg-white no-scrollbar">
                     <table className="text-left border-collapse min-w-max relative">
                       <thead className="sticky top-0 z-30 bg-white">
                         <tr className="border-b border-gray-200 shadow-sm">
                           <th className="sticky left-0 z-40 w-12 text-center text-[10px] text-gray-400 bg-gray-50 border-r border-gray-200 font-normal">#</th>
                           {columns.map(col => (
                             <th key={col.key} className="w-[180px] min-w-[180px] px-3 py-2 border-r border-gray-100 group relative bg-white">
                               <div className="flex items-center justify-between">
                                 <div className="flex items-center text-[11px] font-bold text-gray-500 uppercase tracking-tight">
                                   {getHeaderIcon(col.type)} {col.label}
                                 </div>
                                 {col.key !== 'id' && (
                                   <button onClick={() => deleteColumn(col.key)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-opacity p-1">
                                     <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                                   </button>
                                 )}
                               </div>
                             </th>
                           ))}
                           <th className="w-12 bg-white sticky right-0 z-20"></th>
                         </tr>
                       </thead>
                       <tbody>
                         {visibleTable.map((row, i) => (
                           <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/10 transition-colors group h-10">
                             <td className="sticky left-0 z-20 w-12 text-center text-[10px] text-gray-400 bg-gray-50 border-r border-gray-200 group-hover:bg-blue-50 transition-colors">{i + 1}</td>
                             {columns.map(col => (
                               <td key={col.key} onClick={() => col.type !== 'image' && setEditingCell({rowIndex: i, colKey: col.key})} className={`px-3 border-r border-gray-100 relative cursor-text text-sm ${editingCell?.rowIndex === i && editingCell?.colKey === col.key ? 'ring-2 ring-inset ring-blue-500 z-10 bg-white shadow-inner' : ''}`}>
                                 {editingCell?.rowIndex === i && editingCell?.colKey === col.key ? (
                                   <input autoFocus className={`absolute inset-0 w-full h-full px-3 outline-none bg-white ${col.type === 'number' ? 'text-right' : ''}`} defaultValue={row[col.key]} onBlur={(e) => { handleCellEdit(i, col.key, e.target.value); setEditingCell(null); }} onKeyDown={(e) => { if (e.key === 'Enter') { handleCellEdit(i, col.key, e.currentTarget.value); setEditingCell(null); } }} />
                                 ) : (
                                   <div className={`truncate flex items-center h-full ${col.type === 'number' ? 'justify-end font-mono text-blue-600' : 'text-gray-700'}`}>
                                     {col.type === 'select' ? (
                                       <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPillColor(row[col.key])}`}>
                                         {row[col.key] || '待选'}
                                       </span>
                                     ) : col.type === 'image' ? (
                                        <div className="h-8 w-8 rounded overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center">
                                            <img src={row[col.key]} alt="Record" className="w-full h-full object-cover cursor-pointer hover:scale-150 transition-transform" />
                                        </div>
                                     ) : row[col.key] || <span className="text-gray-200 italic">-</span>}
                                   </div>
                                 )}
                               </td>
                             ))}
                             <td className="sticky right-0 z-10 w-12 bg-white text-center border-l border-gray-50">
                                <button onClick={() => handleDeleteRecord(row.id)} className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all p-1">
                                   <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                             </td>
                           </tr>
                         ))}
                         {isAiRunning && (
                            <tr className="animate-pulse">
                              <td className="sticky left-0 bg-gray-50 border-r"></td>
                              <td colSpan={columns.length} className="px-6 py-4 bg-blue-50/30 text-blue-600 text-xs font-bold italic">
                                Aily 正在同步多维巡检逻辑模型...
                              </td>
                              <td className="sticky right-0 bg-white"></td>
                            </tr>
                         )}
                       </tbody>
                     </table>
                   </div>

                   <div className="h-4 bg-white border-t border-gray-100 overflow-x-auto overflow-y-hidden" ref={bottomScrollbarRef}>
                     <div className="h-px" ref={bottomScrollbarInnerRef} />
                   </div>
                 </>
              ) : (
                <div className="flex-1 overflow-y-auto bg-white">
                  {(() => {
                    const statusKey = getFieldKey(['任务完成状态', '状态', 'status']);
                    const riskKey = getFieldKey(['风险等级', 'risk', '风险']);
                    const delayKey = getFieldKey(['是否延期', '延期']);
                    const ownerKey = getFieldKey(['负责人', '岗位', '部门', 'owner']);
                    const dateKey = getFieldKey(['任务执行时间', '抓取时间', '日期', '计划日期']);

                    const entityLabel = currentView === 'main' ? '违规' : '任务';

                    const total = visibleTable.length;
                    const completed = statusKey ? visibleTable.filter((r) => String(r[statusKey] ?? '').includes('已完成') || String(r[statusKey] ?? '').includes('完成')).length : 0;
                    const ongoing = statusKey ? visibleTable.filter((r) => String(r[statusKey] ?? '').includes('进行中') || String(r[statusKey] ?? '').includes('处理中')).length : 0;
                    const overdue = delayKey ? visibleTable.filter((r) => String(r[delayKey] ?? '').includes('延期')).length : 0;
                    const highRisk = riskKey
                      ? visibleTable.filter((r) => {
                          const v = String(r[riskKey] ?? '');
                          return v.includes('高') || v.includes('A级') || v === 'A' || v === '1';
                        }).length
                      : 0;

                    const dayCounts = Array.from(countByDay(visibleTable, dateKey).entries())
                      .sort(([a], [b]) => a.localeCompare(b))
                      .slice(-7);
                    const lineLabels = dayCounts.map(([d]) => d);
                    const lineValues = dayCounts.map(([, c]) => c);

                    const pieKey = statusKey || riskKey || ownerKey || appTitleColumn?.key;
                    const pieCounts = Array.from(countBy(visibleTable, pieKey).entries()).sort((a, b) => b[1] - a[1]);
                    const pieBase = pieCounts.slice(0, 4);
                    const pieOther = pieCounts.slice(4).reduce((s, [, v]) => s + v, 0);
                    const pieItems = [
                      ...pieBase.map(([label, value], idx) => ({ label, value, color: ['#3370ff', '#22c55e', '#f59e0b', '#ef4444'][idx] || '#94a3b8' })),
                      ...(pieOther > 0 ? [{ label: '其他', value: pieOther, color: '#94a3b8' }] : [])
                    ];

                    const barKey = ownerKey || statusKey || riskKey;
                    const barCounts = Array.from(countBy(visibleTable, barKey).entries()).sort((a, b) => b[1] - a[1]).slice(0, 6);
                    const barItems = barCounts.map(([label, value], idx) => ({ label, value, color: ['#3b82f6', '#06b6d4', '#f59e0b', '#a78bfa', '#22c55e', '#ef4444'][idx] || '#94a3b8' }));

                    const kpis: { label: string; value: number | string; sub: string; color: string }[] = [];
                    kpis.push({ label: `${entityLabel}总量`, value: total, sub: '记录数', color: '#3370ff' });
                    if (statusKey) {
                      kpis.push({ label: '已完成', value: completed, sub: String(statusKey), color: '#22c55e' });
                      kpis.push({ label: '进行中', value: ongoing, sub: String(statusKey), color: '#f59e0b' });
                    }
                    if (delayKey) kpis.push({ label: '延期', value: overdue, sub: String(delayKey), color: '#ef4444' });
                    if (riskKey) kpis.push({ label: '高风险', value: highRisk, sub: String(riskKey), color: '#ef4444' });
                    const uniqueKpis = kpis
                      .filter((k) => k.label)
                      .filter((k, idx, arr) => arr.findIndex((x) => x.label === k.label) === idx)
                      .slice(0, 4)
                      .map((k) => ({ ...k, value: typeof k.value === 'number' ? k.value : String(k.value) }));
                    while (uniqueKpis.length < 4) {
                      const top = pieCounts[0];
                      if (!top || !pieKey) break;
                      const label = `TOP：${top[0]}`;
                      if (uniqueKpis.some((x) => x.label === label)) break;
                      uniqueKpis.push({ label, value: top[1], sub: `按 ${pieKey}`, color: '#94a3b8' });
                      break;
                    }

                    const latest = visibleTable.slice(0, 10);
                    const hero =
                      (appImageColumn ? latest.find((r) => r[appImageColumn.key]) : undefined) ||
                      (riskKey ? visibleTable.find((r) => {
                        const v = String(r[riskKey] ?? '');
                        return v.includes('高') || v.includes('A级') || v === 'A' || v === '1';
                      }) : undefined) ||
                      (delayKey ? visibleTable.find((r) => String(r[delayKey] ?? '').includes('延期')) : undefined) ||
                      latest[0];
                    const heroTitle = appTitleColumn ? String(hero?.[appTitleColumn.key] ?? '') : '';
                    const heroStatus = statusKey ? String(hero?.[statusKey] ?? '') : '';
                    const heroRisk = riskKey ? String(hero?.[riskKey] ?? '') : '';
                    const heroOwner = ownerKey ? String(hero?.[ownerKey] ?? '') : '';
                    const heroDate = dateKey ? String(hero?.[dateKey] ?? '') : '';
                    const heroImage = appImageColumn ? String(hero?.[appImageColumn.key] ?? '') : '';

                    const heroFields = [
                      appTitleColumn ? { label: appTitleColumn.label, value: heroTitle } : null,
                      dateKey ? { label: String(dateKey), value: heroDate } : null,
                      ownerKey ? { label: String(ownerKey), value: heroOwner } : null,
                      statusKey ? { label: String(statusKey), value: heroStatus } : (riskKey ? { label: String(riskKey), value: heroRisk } : null)
                    ].filter(Boolean) as { label: string; value: string }[];

                    const imageRows = appImageColumn ? visibleTable.filter((r) => r[appImageColumn.key]).slice(0, 12) : [];
                    const tableCols = columns.filter((c) => c.key !== 'id').slice(0, 6);
                    const tableRows = visibleTable.slice(0, 8);

                    return (
                      <div className="max-w-7xl mx-auto px-4 pb-4 pt-2">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="min-w-0">
                            <div className="text-xs font-black text-gray-900 tracking-tight truncate">{viewNameMap[currentView]}</div>
                            <div className="text-[10px] text-gray-500 mt-0.5">应用模式 · 白色主题</div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap justify-end">
                            {(['main', 'management', 'equipment', 'factory'] as ViewId[]).map((vid) => (
                              <button
                                key={vid}
                                onClick={() => setCurrentView(vid)}
                                className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                                  currentView === vid
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                              >
                                {viewNameMap[vid]}
                              </button>
                            ))}
                            <div className="px-3 py-1 rounded-lg text-[10px] font-bold border border-gray-200 bg-gray-50 text-gray-700">共 {total} 条</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-12 gap-4 items-stretch">
                          <div className="col-span-12 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">概览</div>
                              <div className="text-[10px] font-bold text-gray-500">KPI</div>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-3">
                              {uniqueKpis.map((k) => (
                                <div key={k.label} className="rounded-2xl border border-gray-200 bg-gray-50 p-3">
                                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{k.label}</div>
                                  <div className="mt-2 flex items-baseline justify-between">
                                    <div className="text-2xl font-black" style={{ color: k.color }}>{k.value}</div>
                                    <div className="text-[10px] font-bold text-gray-500">{k.sub}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">重点{entityLabel}记录</div>
                              {heroStatus ? (
                                <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPillColor(heroStatus)}`}>{heroStatus}</span>
                              ) : null}
                            </div>

                            <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
                              {heroImage ? (
                                <img src={heroImage} alt="Hero" className="w-full h-52 object-cover" />
                              ) : (
                                <div className="h-52 flex items-center justify-center text-[11px] text-gray-400 font-bold">暂无图片</div>
                              )}
                            </div>

                            <div className="mt-3 grid grid-cols-2 gap-3">
                              {heroFields.slice(0, 4).map((f) => (
                                <div key={f.label} className="min-w-0">
                                  <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{f.label}</div>
                                  <div className="text-[12px] font-bold text-gray-900 truncate">{f.value || '-'}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{entityLabel}趋势</div>
                              <div className="text-[10px] font-bold text-gray-500">{dateKey ? '最近 7 天' : '缺少时间字段'}</div>
                            </div>
                            <div className="mt-2">
                              {lineLabels.length > 0 ? (
                                <LineChart labels={lineLabels} values={lineValues} color="#3370ff" />
                              ) : (
                                <div className="h-36 flex items-center justify-center text-[11px] text-gray-400 font-bold">暂无可用时间数据</div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{entityLabel}列表</div>
                              <div className="text-[10px] font-bold text-gray-500">最新 {Math.min(10, total)} 条</div>
                            </div>
                            <div className="mt-3 max-h-72 overflow-auto no-scrollbar space-y-3 pr-1">
                              {latest.length === 0 ? (
                                <div className="h-40 flex items-center justify-center text-[11px] text-gray-400 font-bold">暂无记录</div>
                              ) : (
                                latest.map((row, idx) => {
                                  const title = appTitleColumn ? String(row[appTitleColumn.key] ?? '-') : String(row.id ?? '-');
                                  const badge = statusKey ? String(row[statusKey] ?? '') : (riskKey ? String(row[riskKey] ?? '') : '');
                                  const when = dateKey ? String(row[dateKey] ?? '') : '';
                                  const img = appImageColumn ? String(row[appImageColumn.key] ?? '') : '';
                                  return (
                                    <div key={row.id || idx} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3">
                                      <div className="w-14 h-10 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0">
                                        {img ? <img src={img} alt="thumb" className="w-full h-full object-cover" /> : null}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-3">
                                          <div className="text-[11px] font-bold text-gray-900 truncate">{title}</div>
                                          {badge ? (
                                            <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPillColor(badge)}`}>{badge}</span>
                                          ) : null}
                                        </div>
                                        <div className="mt-1 text-[10px] text-gray-500 truncate">{when || '—'}</div>
                                      </div>
                                      <button onClick={() => handleDeleteRecord(row.id)} className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors">删除</button>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{barKey || '归属'} TOP</div>
                              <div className="text-[10px] font-bold text-gray-500">按 {barKey || '字段'} 统计</div>
                            </div>
                            <div className="mt-3">
                              {barItems.length > 0 ? (
                                <BarChart items={barItems} horizontal />
                              ) : (
                                <div className="h-40 flex items-center justify-center text-[11px] text-gray-400 font-bold">暂无可用维度</div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{pieKey || '维度'}分布</div>
                              <div className="text-[10px] font-bold text-gray-500">按 {pieKey || '字段'} 统计</div>
                            </div>
                            <div className="mt-3">
                              {pieItems.length > 0 ? (
                                <PieChart items={pieItems} />
                              ) : (
                                <div className="h-40 flex items-center justify-center text-[11px] text-gray-400 font-bold">暂无可用维度</div>
                              )}
                            </div>
                          </div>

                          <div className="col-span-12 lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{appImageColumn ? `${appImageColumn.label} 图片墙` : '图片墙'}</div>
                              <div className="text-[10px] font-bold text-gray-500">共 {imageRows.length} 张</div>
                            </div>
                            {imageRows.length === 0 ? (
                              <div className="flex-1 flex items-center justify-center text-[11px] text-gray-400 font-bold">该表暂无图片字段</div>
                            ) : (
                              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {imageRows.map((r, idx) => {
                                  const src = appImageColumn ? String(r[appImageColumn.key]) : '';
                                  const label = appTitleColumn ? String(r[appTitleColumn.key] ?? '') : '';
                                  return (
                                    <div key={r.id || idx} className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                                      <div className="w-full h-20 bg-gray-50">
                                        <img src={src} alt="grid" className="w-full h-full object-cover" />
                                      </div>
                                      <div className="p-2">
                                        <div className="text-[10px] font-bold text-gray-900 truncate">{label || `记录 ${idx + 1}`}</div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <div className="col-span-12 lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm overflow-hidden flex flex-col h-full">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-black text-gray-900">{entityLabel}明细</div>
                              <div className="text-[10px] font-bold text-gray-500">前 {tableRows.length} 条</div>
                            </div>
                            <div className="mt-3 flex-1 overflow-auto no-scrollbar">
                              <table className="min-w-full text-left border-collapse">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    {tableCols.map((c) => (
                                      <th key={c.key} className="px-3 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">{c.label}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tableRows.map((r, idx) => (
                                    <tr key={r.id || idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                      {tableCols.map((c) => (
                                        <td key={c.key} className="px-3 py-2 text-[11px] text-gray-700 whitespace-nowrap">
                                          {c.type === 'select' ? (
                                            <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-bold ${getPillColor(r[c.key])}`}>{r[c.key] || '待选'}</span>
                                          ) : c.type === 'number' ? (
                                            <span className="font-mono text-[#3370ff]">{r[c.key] || '-'}</span>
                                          ) : (
                                            <span className="truncate block max-w-[220px]">{String(r[c.key] ?? '-') || '-'}</span>
                                          )}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

               <div className={`transition-all duration-300 ease-in-out border-t border-gray-200 bg-white overflow-hidden ${isBottomBarOpen ? 'h-36' : 'h-0'}`}>
                  <div className="p-4 flex gap-4 h-full overflow-x-auto no-scrollbar">
                    {[
                       { id: 'main', name: '人员违规数据表', icon: '📊', desc: '违规抓拍明细' },
                       { id: 'management', name: '巡检管理数据表', icon: '📋', desc: '管理决策与整改跟进' },
                       { id: 'equipment', name: '设备巡检数据表', icon: '⚙️', desc: '核心设备运行扫描' },
                       { id: 'factory', name: '厂区巡检数据表', icon: '🏗️', desc: '公共区域与动力设施' }
                    ].map(view => (
                       <div key={view.id} onClick={() => { setCurrentView(view.id as ViewId); setIsBottomBarOpen(false); }} className={`flex-shrink-0 w-64 p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${currentView === view.id ? 'border-blue-500 bg-blue-50/50 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-200 bg-gray-50/50'}`}>
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-inner ${currentView === view.id ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-white text-gray-300'}`}>{view.icon}</div>
                          <div className="flex flex-col">
                             <span className={`text-xs font-bold ${currentView === view.id ? 'text-blue-700' : 'text-gray-700'}`}>{view.name}</span>
                             <span className="text-[10px] text-gray-400 mt-1">{view.desc}</span>
                          </div>
                       </div>
                    ))}
                  </div>
               </div>
            </div>
          ) : currentApp === 'prompt' ? (
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
               <div className="max-w-4xl mx-auto">
                  <header className="mb-8">
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">提示词模板库</h2>
                     <p className="text-sm text-gray-500">这些专业提示词定义了 Aily 分析巡检数据的深度逻辑。</p>
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
                              <button onClick={() => { setActiveBusinessContext(tmp); setMessages(prev => [...prev, { role: 'user', text: `应用模板：${tmp.title}` }]); askGemini(tmp.prompt, tmp); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                                 🚀 应用此指令
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
            <div className="flex-1 flex items-center justify-center text-gray-300 flex-col gap-4">
               <div className="text-6xl opacity-10">🏗️</div>
               <p className="text-[10px] font-black uppercase tracking-widest">Building AI Modules...</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. AILY SIDEBAR */}
      <aside className="w-80 border-l border-gray-200 bg-white flex flex-col flex-shrink-0 z-50 shadow-xl relative">
        <div className="h-10 border-b border-gray-200 flex items-center justify-between px-4 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-10">
           <div className="flex flex-col min-w-0">
             <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
               <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center shadow-lg">
                 <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
               </div>
               Aily 分析工作台
             </h4>
             {activeBusinessContext && (
               <div className="text-[9px] font-bold text-gray-300 tracking-tighter truncate">
                 当前上下文：{activeBusinessContext.title}
               </div>
             )}
           </div>
           <button onClick={() => setMessages([])} className="text-[10px] text-gray-400 hover:text-gray-600 font-bold tracking-tighter uppercase">Clear</button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#fafafa]">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'ai' ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
              <div className={`max-w-[90%] p-3.5 rounded-2xl text-[11px] shadow-sm border ${msg.role === 'ai' ? 'bg-white border-gray-100 text-gray-800' : 'bg-blue-600 border-blue-500 text-white'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isAilyThinking && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-gray-100 p-2.5 rounded-xl text-[10px] text-gray-400 font-medium italic">Aily 正在深度解构业务维度...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shadow-2xl">
          <div className="relative">
            <input type="text" disabled={isAilyThinking} placeholder="向 Aily 提问业务现状..." className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 shadow-inner transition-all" onKeyDown={(e) => { if (e.key === 'Enter') { const input = e.currentTarget; if (!input.value || isAilyThinking) return; const text = input.value; setMessages(prev => [...prev, { role: 'user', text }]); input.value = ''; askGemini(text); } }} />
            <button className="absolute right-3 top-3 text-blue-600 hover:scale-110 transition-transform">
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
          <p className="mt-3 text-[9px] text-gray-300 text-center font-bold tracking-tighter uppercase italic">Gemini 3 Pro Solution Engine</p>
        </div>
      </aside>
    </div>
  );
};

export default Workspace;
