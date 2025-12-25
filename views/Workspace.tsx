
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BusinessContext, Demo } from '../types';
import { EFFICIENCY_TOOLS, PROMPT_TEMPLATES } from '../constants';
import { 
  getCheckpointList, 
  queryCheckpointData, 
  writeViolationRecord,
  generateNewId,
  getCurrentTimestamp,
  getCurrentDate,
  type ViolationRecord 
} from '../services/larkBaseService';
import { analyzeImageForViolation, formatConfidence } from '../services/aiVisionService';
import ViolationCard from '../components/ViolationCard';

type AppId = 'home' | 'demo' | 'efficiency' | 'prompt';
type ViewId = 'main' | 'management' | 'equipment' | 'factory';
type SecondaryViewId = Exclude<ViewId, 'main'>;
type FieldType = 'text' | 'number' | 'select' | 'image';
type BaseViewMode = 'table' | 'app';

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
  const [messages, setMessages] = useState<{
    role: 'ai' | 'user'; 
    text?: string;
    card?: {
      type: 'violation';
      data: {
        imageUrl: string;
        violationType: string;
        confidence: number;
        description: string;
        location: string;
        department: string;
        date: string;
        time: string;
      };
    };
  }[]>([]);
  const [isAilyThinking, setIsAilyThinking] = useState(false);
  const [activeBusinessContext, setActiveBusinessContext] = useState<BusinessContext | null>(null);
  
  // AI 巡检分析状态
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarRef = useRef<HTMLDivElement>(null);
  const bottomScrollbarInnerRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  const getSecondaryData = (view: SecondaryViewId) => editableSecondaryDataByView[view] || [];

  useEffect(() => {
    setShowAddColumn(false);
    setEditingCell(null);
    if (currentApp !== 'demo') setBaseViewMode('table');
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

    // 只在视图切换时添加消息，避免重复
    const newMessage = `已切换至【${viewNameMap[currentView]}】。Aily 已根据该业务维度同步分析模型。`;
    setMessages(prev => {
      // 检查最后一条消息是否相同，避免重复
      if (prev.length > 0 && prev[prev.length - 1].text === newMessage) {
        return prev;
      }
      return [...prev, { role: 'ai', text: newMessage }];
    });
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
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const baseURL = process.env.GEMINI_BASE_URL;
      
      if (!apiKey) {
        setMessages(prev => [...prev, { role: 'ai', text: "未配置 API Key，请检查环境变量。" }]);
        setIsAilyThinking(false);
        return;
      }

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

      let responseText = '';

      // 如果配置了中转 API，使用 OpenAI 兼容格式
      if (baseURL) {
        console.log('使用中转 API 进行对话:', baseURL);
        console.log('API Key:', apiKey ? `${apiKey.substring(0, 10)}...` : '未配置');
        console.log('请求模型:', 'gemini-2.0-flash-exp');
        
        const requestBody = {
          model: 'gemini-2.0-flash-exp',
          messages: [
            { role: 'system', content: systemInstruction },
            { role: 'user', content: question }
          ],
          temperature: 0.7,
        };
        
        console.log('请求体:', JSON.stringify(requestBody, null, 2));
        
        const response = await fetch(`${baseURL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify(requestBody),
        });

        console.log('响应状态:', response.status, response.statusText);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API 错误响应:', errorText);
          throw new Error(`API 返回错误: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('API 响应数据:', data);
        responseText = data.choices?.[0]?.message?.content || "已完成分析。";
      } else {
        // 使用官方 Gemini SDK
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.0-flash-exp',
          contents: question,
          config: { systemInstruction, temperature: 0.7 },
        });
        responseText = response.text || "已完成分析。";
      }

      setMessages(prev => [...prev, { role: 'ai', text: responseText }]);
    } catch (error) {
      console.error('AI 对话失败:', error);
      setMessages(prev => [...prev, { role: 'ai', text: "AI 响应异常，请重试。" }]);
    } finally {
      setIsAilyThinking(false);
    }
  };

  /**
   * 执行 AI 巡检分析流程
   * 1. 显示思考过程
   * 2. 调用工作流进行人员违规判断
   * 3. 输出卡片式结果
   */
  const executeInspectionAnalysis = async () => {
    if (!selectedCheckpoint) {
      setMessages(prev => [...prev, { role: 'ai', text: '请先选择一个点位进行分析。' }]);
      return;
    }

    setIsAnalyzing(true);
    setMessages(prev => [...prev, { role: 'user', text: `开始巡检分析：${selectedCheckpoint}` }]);

    try {
      // 显示"正在思考并生成答案..."标题
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: '正在思考并生成答案...' 
      }]);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 1: 调用人员违规判断工作流
      setAnalysisStep('调用人员违规判断工作流');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'ai',
          text: '正在思考并生成答案...\n\n调用人员违规判断工作流'
        };
        return newMessages;
      });
      
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: 正在查询点位图像数据
      setAnalysisStep('正在查询点位图像数据');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'ai',
          text: '正在思考并生成答案...\n\n正在查询点位图像数据'
        };
        return newMessages;
      });
      
      const checkpointData = await queryCheckpointData(selectedCheckpoint);
      
      if (!checkpointData) {
        setMessages(prev => [...prev, { role: 'ai', text: `未找到点位「${selectedCheckpoint}」的数据，请检查数据源。` }]);
        setIsAnalyzing(false);
        setAnalysisStep('');
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 3: 正在进行 AI 视觉分析
      setAnalysisStep('正在进行 AI 视觉分析');
      setMessages(prev => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1] = {
          role: 'ai',
          text: '正在思考并生成答案...\n\n正在进行 AI 视觉分析'
        };
        return newMessages;
      });

      const analysisResult = await analyzeImageForViolation(checkpointData.图像, selectedCheckpoint);

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 4: 输出卡片
      const currentDate = getCurrentDate();
      const currentTime = getCurrentTimestamp();

      // 移除思考过程，添加结果卡片
      setMessages(prev => {
        const newMessages = prev.slice(0, -1); // 移除思考过程消息
        return [
          ...newMessages,
          {
            role: 'ai',
            card: {
              type: 'violation' as const,
              data: {
                imageUrl: checkpointData.图像,
                violationType: analysisResult.violationType,
                confidence: analysisResult.confidence,
                description: analysisResult.description,
                location: selectedCheckpoint,
                department: analysisResult.suggestedDepartment,
                date: currentDate,
                time: currentTime,
              }
            }
          }
        ];
      });

      // Step 5: 写入违规记录（如果有违规）
      if (analysisResult.hasViolation) {
        const confidenceStr = formatConfidence(analysisResult.confidence);
        const newRecord: ViolationRecord = {
          编号: generateNewId(editableMainData),
          日期: currentDate,
          违规情况: analysisResult.violationType,
          违规记录: checkpointData.图像,
          抓取时间: currentTime,
          位置: selectedCheckpoint,
          部门: analysisResult.suggestedDepartment,
          AI生成: `AI识别，置信度${confidenceStr}`,
        };

        const writeSuccess = await writeViolationRecord(newRecord);

        if (writeSuccess) {
          // 同步更新本地数据
          setEditableMainData(prev => [...prev, {
            id: `NEW-${Date.now()}`,
            ...newRecord,
          }]);

          setMessages(prev => [...prev, { 
            role: 'ai', 
            text: `✅ 违规记录已自动写入「人员违规数据表」`
          }]);
        }
      }

    } catch (error) {
      console.error('巡检分析失败:', error);
      setMessages(prev => [...prev, { role: 'ai', text: '❌ 分析过程中发生错误，请检查网络连接后重试。' }]);
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
      setSelectedCheckpoint('');
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
        <div className="flex-1 flex flex-col overflow-hidden bg-[#f5f6f7]">
          {currentApp === 'demo' ? (
            <div className="flex-1 flex flex-col overflow-hidden animate-fadeIn">
               <div className="h-10 bg-white border-b border-gray-100 flex items-center px-4 gap-4 flex-shrink-0 z-10">
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
          ) : currentApp === 'efficiency' ? (
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
              <div className="max-w-4xl mx-auto">
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
          ) : currentApp === 'prompt' ? (
            <div className="flex-1 p-8 overflow-y-auto bg-gray-50 animate-fadeIn">
               <div className="max-w-4xl mx-auto">
                  <header className="mb-8">
                     <h2 className="text-2xl font-bold text-gray-900 mb-2">提示词模版库</h2>
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
              {msg.card ? (
                // 渲染卡片
                <div className="max-w-[95%]">
                  {msg.card.type === 'violation' && (
                    <ViolationCard {...msg.card.data} />
                  )}
                </div>
              ) : (
                // 渲染普通文本消息
                <div className={`max-w-[90%] p-3.5 rounded-2xl text-[11px] shadow-sm border ${msg.role === 'ai' ? 'bg-white border-gray-100 text-gray-800' : 'bg-blue-600 border-blue-500 text-white'}`}>
                  {/* 如果是思考消息，添加转圈动画 */}
                  {msg.text?.includes('正在思考') ? (
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="whitespace-pre-line">{msg.text}</span>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line">{msg.text}</span>
                  )}
                </div>
              )}
            </div>
          ))}
          {isAilyThinking && (
            <div className="flex justify-start animate-pulse">
               <div className="bg-gray-100 p-2.5 rounded-xl text-[10px] text-gray-400 font-medium italic flex items-center gap-2">
                 <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Aily 正在深度解构业务维度...
               </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-4 border-t border-gray-100 bg-white shadow-2xl space-y-3">
          {/* AI 巡检分析区域 */}
          {currentApp === 'demo' && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm">🔍</span>
                <span className="text-[11px] font-bold text-orange-700">AI 巡检分析</span>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedCheckpoint}
                  onChange={(e) => setSelectedCheckpoint(e.target.value)}
                  disabled={isAnalyzing}
                  className="flex-1 border border-orange-200 rounded-lg py-2 px-3 text-[11px] bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none transition-all"
                >
                  <option value="">选择点位...</option>
                  {getCheckpointList().map(cp => (
                    <option key={cp} value={cp}>{cp}</option>
                  ))}
                </select>
                
                <button
                  onClick={executeInspectionAnalysis}
                  disabled={!selectedCheckpoint || isAnalyzing}
                  className={`px-4 py-2 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 ${
                    !selectedCheckpoint || isAnalyzing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg shadow-orange-200'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      分析中
                    </>
                  ) : (
                    <>
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                      </svg>
                      开始分析
                    </>
                  )}
                </button>
              </div>
              
              {isAnalyzing && analysisStep && (
                <div className="text-[10px] text-orange-600 italic animate-pulse">
                  {analysisStep}
                </div>
              )}
            </div>
          )}

          {/* 普通对话输入框 */}
          <div className="relative">
            <input type="text" disabled={isAilyThinking || isAnalyzing} placeholder="向 Aily 提问业务现状..." className="w-full border border-gray-200 rounded-xl py-3 pl-4 pr-10 text-[11px] focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 shadow-inner transition-all" onKeyDown={(e) => { if (e.key === 'Enter') { const input = e.currentTarget; if (!input.value || isAilyThinking) return; const text = input.value; setMessages(prev => [...prev, { role: 'user', text }]); input.value = ''; askGemini(text); } }} />
            <button className="absolute right-3 top-3 text-blue-600 hover:scale-110 transition-transform">
              <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Workspace;
