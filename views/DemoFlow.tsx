import React from 'react';
import { Demo } from '../types';

// Reuse icons or define new ones
const IconArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconBrain = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>;
const IconCheckSquare = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const IconMessageSquare = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const IconMonitor = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>;
const IconPlay = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>;

interface DemoFlowProps {
  demo: Demo;
  onEnterApp: () => void;
}

const FlowNode: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  desc: string; 
  x: number; 
  y: number;
  color: string;
}> = ({ icon, title, desc, x, y, color }) => (
  <div 
    className="absolute bg-[color:var(--bg-surface-1)] rounded-xl shadow-[var(--shadow-md)] border border-[color:var(--border)] p-4 w-64 min-h-[200px] flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] z-10"
    style={{ left: x, top: y }}
  >
    <div className={`h-1 absolute top-0 left-4 right-4 rounded-b-sm ${color}`}></div>
    <div className="flex items-center gap-3 mt-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
        {icon}
      </div>
      <h4 className="font-bold text-[color:var(--text)] text-sm">{title}</h4>
    </div>
    <p className="text-xs text-[color:var(--text-2)] leading-relaxed bg-[color:var(--bg-surface-2)] p-2 rounded border border-[color:var(--border)]">
      {desc}
    </p>
    <div className="flex gap-2">
       <span className="text-[10px] font-mono bg-[color:var(--bg-surface-2)] text-[color:var(--text-3)] px-1.5 py-0.5 rounded">Input</span>
       <span className="ml-auto text-[10px] font-mono bg-[color:var(--bg-surface-2)] text-[color:var(--text-3)] px-1.5 py-0.5 rounded">Output</span>
    </div>
  </div>
);

const FlowEdge: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isVertical?: boolean;
}> = ({ startX, startY, endX, endY, isVertical }) => {
  let path = '';
  
  if (isVertical) {
    // Vertical connection (S-shape turn)
    const midY = (startY + endY) / 2;
    path = `M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}`;
  } else {
    // Horizontal connection
    const midX = (startX + endX) / 2;
    path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  }
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <path d={path} fill="none" stroke="var(--border)" strokeWidth="4" />
      <path d={path} fill="none" stroke="var(--text-3)" strokeWidth="2" strokeDasharray="6 4" className="animate-[dash_20s_linear_infinite]" />
      <circle cx={endX} cy={endY} r="3" fill="var(--text-3)" />
    </svg>
  );
};

const DemoFlow: React.FC<DemoFlowProps> = ({ demo, onEnterApp }) => {
  const defaultNodes = [
    { id: 1, title: '全景数据采集', desc: '实时接入工厂摄像头数据流与 IoT 传感器信号', icon: <IconCamera />, color: 'bg-blue-500' },
    { id: 2, title: '多模态 AI 分析', desc: 'YOLOv8 + Gemini 联合分析，识别违规行为与设备隐患', icon: <IconBrain />, color: 'bg-purple-500' },
    { id: 3, title: '智能业务路由', desc: '基于风险等级自动分发：警告/工单/停机指令', icon: <IconCheckSquare />, color: 'bg-orange-500' },
    { id: 4, title: '闭环行动触达', desc: '推送飞书卡片给对应负责人，拉起应急群组', icon: <IconMessageSquare />, color: 'bg-green-500' },
  ];

  const gtmNodes = [
    { id: 1, title: '获客阶段 - 探探', desc: '可用于市场调研和客户需求分析，实现规模化调研一线用户，节省调研纪要整理时间', icon: <IconMessageSquare />, color: 'bg-blue-500' },
    { id: 2, title: '商机阶段 - 参参', desc: '提供方案金句推荐、客户干系人及业务研究洞察、汇报故事线及案例推荐', icon: <IconBrain />, color: 'bg-purple-500' },
    { id: 3, title: '商机阶段 - 呆呆', desc: '一键生成demo所需定制化数据，提升准备汇报的效率', icon: <IconMonitor />, color: 'bg-indigo-500' },
    { id: 4, title: '商机阶段 - 图图', desc: '生成匹配飞书视觉风格的PPT配图，提升方案展示效果', icon: <IconCamera />, color: 'bg-pink-500' },
    { id: 5, title: '签约阶段 - 蕊蕊', desc: '对方案汇报进行复盘，给出改进建议，提升销售团队整体水平', icon: <IconCheckSquare />, color: 'bg-green-500' },
    { id: 6, title: '用户反馈 - 探探', desc: '可用于收集和分析用户反馈，帮助运营团队更好地了解客户需求', icon: <IconMessageSquare />, color: 'bg-blue-500' },
    { id: 7, title: '客户培训 - 参参', desc: '为客户提供培训内容和案例推荐，提升客户满意度和忠诚度', icon: <IconBrain />, color: 'bg-purple-500' },
  ];

  const inspectionNodes = [
    { id: 1, title: '摄像头点位输入', desc: '录入厂区点位与摄像头绑定信息，建立可追溯数据源', icon: <IconCamera />, color: 'bg-sky-500' },
    { id: 2, title: '点位摄像头视频抽帧', desc: '从视频流按规则抽帧，生成可检索的图片序列', icon: <IconCamera />, color: 'bg-indigo-500' },
    { id: 3, title: 'AI 识别违规', desc: '识别在岗玩手机、睡岗、5S 不合规等违规行为', icon: <IconBrain />, color: 'bg-purple-500' },
    { id: 4, title: '数据录入', desc: '违规记录与字段自动入表，支持人工补充与复核', icon: <IconCheckSquare />, color: 'bg-orange-500' },
    { id: 5, title: '大屏展示', desc: '实时汇总告警与趋势，管理者在大屏一眼掌控', icon: <IconMonitor />, color: 'bg-emerald-500' },
  ];

  const rawNodes = demo.id === 'gtm' ? gtmNodes : demo.id === 'inspection' ? inspectionNodes : defaultNodes;

  // Layout Configuration
  const COLUMNS = 3;
  const CARD_WIDTH = 256;
  const CARD_HEIGHT = 200; // Fixed height for layout
  const GAP_X = 60;
  const GAP_Y = 80;
  const PADDING = 60;

  // Calculate positions with S-shape layout
  const nodes = rawNodes.map((node, index) => {
    const row = Math.floor(index / COLUMNS);
    const col = index % COLUMNS;
    
    // S-shape: Even rows L->R, Odd rows R->L
    const isEvenRow = row % 2 === 0;
    const effectiveCol = isEvenRow ? col : (COLUMNS - 1 - col);
    
    return {
      ...node,
      x: PADDING + effectiveCol * (CARD_WIDTH + GAP_X),
      y: PADDING + row * (CARD_HEIGHT + GAP_Y),
      row,
      col: effectiveCol
    };
  });

  // Calculate container size
  const totalRows = Math.ceil(nodes.length / COLUMNS);
  const containerWidth = PADDING * 2 + COLUMNS * CARD_WIDTH + (COLUMNS - 1) * GAP_X;
  const containerHeight = PADDING * 2 + totalRows * CARD_HEIGHT + (totalRows - 1) * GAP_Y;

  return (
    <div className="flex-1 flex h-full bg-[color:var(--bg-body)] overflow-hidden relative font-sans">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:20px_20px] flex items-center justify-center">
         <div className="relative" style={{ width: containerWidth, height: containerHeight }}>
            {/* Edges */}
            {nodes.slice(0, -1).map((node, i) => {
              const nextNode = nodes[i+1];
              const isVertical = node.row !== nextNode.row;
              
              // Calculate connection points
              let startX, startY, endX, endY;

              if (isVertical) {
                // Connecting from bottom of current to top of next
                startX = node.x + CARD_WIDTH / 2;
                startY = node.y + CARD_HEIGHT; // Bottom of card
                endX = nextNode.x + CARD_WIDTH / 2;
                endY = nextNode.y; // Top of card
              } else {
                // Horizontal connection
                if (node.col < nextNode.col) {
                  // L -> R
                  startX = node.x + CARD_WIDTH;
                  startY = node.y + CARD_HEIGHT / 2;
                  endX = nextNode.x;
                  endY = nextNode.y + CARD_HEIGHT / 2;
                } else {
                  // R -> L
                  startX = node.x;
                  startY = node.y + CARD_HEIGHT / 2;
                  endX = nextNode.x + CARD_WIDTH;
                  endY = nextNode.y + CARD_HEIGHT / 2;
                }
              }

              return (
                <FlowEdge 
                  key={i}
                  startX={startX}
                  startY={startY}
                  endX={endX}
                  endY={endY}
                  isVertical={isVertical}
                />
              );
            })}

            {/* Nodes */}
            {nodes.map(node => (
              <FlowNode key={node.id} {...node} />
            ))}
         </div>
         
         <div className="absolute top-6 left-6 z-20">
            <div className="bg-[color:var(--bg-surface-1)]/80 backdrop-blur shadow-sm border border-[color:var(--border)] rounded-lg p-3 flex items-center gap-3">
               <span className="flex h-2 w-2 rounded-full bg-[color:var(--success)] animate-pulse"></span>
               <span className="text-xs font-semibold text-[color:var(--text-2)]">流程引擎运行中</span>
            </div>
         </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[360px] bg-[color:var(--bg-surface-1)] border-l border-[color:var(--border)] shadow-xl z-30 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[color:var(--border)] flex items-center justify-between px-6">
           <div className="flex items-center gap-2">
             <span className="ui-tag px-2 py-0.5 text-[10px] bg-[color:var(--bg-surface-2)] text-[color:var(--text-3)] border-[color:var(--border)]">Flow</span>
             <h3 className="text-sm font-bold text-[color:var(--text)]">业务流程编排</h3>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
           <div className="aspect-video w-full rounded-xl bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] mb-6 overflow-hidden relative group">
              {demo.cover ? (
                <img src={demo.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[color:var(--text-3)]">Preview</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                 <h2 className="text-white font-bold text-lg">{demo.title}</h2>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-[color:var(--text)] uppercase tracking-widest mb-3">流程说明</h4>
                <p className="text-sm text-[color:var(--text-2)] leading-relaxed font-light">
                  {demo.valueProp}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[color:var(--text)] uppercase tracking-widest mb-3">关键节点</h4>
                <ul className="space-y-3">
                  {nodes.map((n, i) => (
                    <li key={n.id} className="flex items-center gap-3 text-sm text-[color:var(--text-2)]">
                      <span className="w-5 h-5 rounded-full bg-[color:var(--bg-surface-2)] border border-[color:var(--border)] flex items-center justify-center text-[10px] font-bold text-[color:var(--text-3)]">{i+1}</span>
                      <span>{n.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[color:var(--border)] bg-[color:var(--bg-surface-1)]">
           <button 
             onClick={onEnterApp}
             className="w-full ui-btn ui-btn-primary h-12 text-sm shadow-lg shadow-[color:var(--primary)]/20 hover:shadow-[color:var(--primary)]/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-white"
           >
             <IconPlay />
             进入应用
           </button>
           <p className="text-center mt-3 text-[10px] text-[color:var(--text-3)]">
             点击即可进入应用模式体验真实交互
           </p>
        </div>
      </div>
    </div>
  );
};

export default DemoFlow;
