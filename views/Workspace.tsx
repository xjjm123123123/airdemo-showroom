
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Demo } from '../types';
import { PROMPT_TEMPLATES } from '../constants';

type AppId = 'apaas' | 'base' | 'prompt';
type ViewId = 'main' | 'management' | 'equipment' | 'factory';
type SecondaryViewId = Exclude<ViewId, 'main'>;
type FieldType = 'text' | 'number' | 'select' | 'image';

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
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarInnerRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  const getSecondaryData = (view: SecondaryViewId) => editableSecondaryDataByView[view] || [];

  useEffect(() => {
    setIsBottomBarOpen(false);
    setShowAddColumn(false);
  }, [currentApp]);

  useEffect(() => {
    setEditableMainData(demo.mainTable);
    const base = demo.secondaryTable ? { management: demo.secondaryTable, equipment: demo.secondaryTable, factory: demo.secondaryTable } : {};
    setEditableSecondaryDataByView({ ...base, ...(demo.secondaryTables || {}) });
  }, [demo]);

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

    const viewNameMap = {
      main: '人员违规数据表',
      management: '巡检管理数据表',
      equipment: '设备巡检数据表',
      factory: '厂区巡检数据表'
    };

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
  }, [columns, currentView, currentApp, visibleTable.length]);

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

  const askGemini = async (question: string) => {
    setIsAilyThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const systemInstruction = `你是一个专业的业务分析师 Aily。
      当前表格结构: ${JSON.stringify(columns)}
      当前可见数据: ${JSON.stringify(visibleTable)}
      请根据以上信息提供深度的业务见解。语言：中文。简洁、专业、结果导向。`;

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
               </div>
               
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
                              <button onClick={() => { setMessages(prev => [...prev, { role: 'user', text: `应用模板：${tmp.title}` }]); askGemini(tmp.prompt); }} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center gap-2">
                                 🚀 应用此指令
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
           <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
             <div className="w-4 h-4 bg-blue-600 rounded flex items-center justify-center shadow-lg">
               <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71L12 2z"/></svg>
             </div>
             Aily 分析工作台
           </h4>
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
