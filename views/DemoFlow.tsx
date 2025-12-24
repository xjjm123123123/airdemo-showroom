import React from 'react';
import { Demo } from '../types';

// Reuse icons or define new ones
const IconArrowRight = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
const IconCamera = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>;
const IconBrain = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z"></path><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z"></path></svg>;
const IconCheckSquare = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const IconMessageSquare = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
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
    className="absolute bg-white rounded-xl shadow-[var(--shadow-md)] border border-[color:var(--border)] p-4 w-64 flex flex-col gap-3 transition-transform hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] z-10"
    style={{ left: x, top: y }}
  >
    <div className={`h-1 absolute top-0 left-4 right-4 rounded-b-sm ${color}`}></div>
    <div className="flex items-center gap-3 mt-2">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color.replace('bg-', 'bg-opacity-10 text-')}`}>
        {icon}
      </div>
      <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
    </div>
    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2 rounded border border-slate-100">
      {desc}
    </p>
    <div className="flex gap-2">
       <span className="text-[10px] font-mono bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Input</span>
       <span className="ml-auto text-[10px] font-mono bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded">Output</span>
    </div>
  </div>
);

const FlowEdge: React.FC<{
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}> = ({ startX, startY, endX, endY }) => {
  // Simple cubic bezier
  const midX = (startX + endX) / 2;
  const path = `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
      <path d={path} fill="none" stroke="#e2e8f0" strokeWidth="4" />
      <path d={path} fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="6 4" className="animate-[dash_20s_linear_infinite]" />
      <circle cx={endX} cy={endY} r="3" fill="#94a3b8" />
    </svg>
  );
};

const DemoFlow: React.FC<DemoFlowProps> = ({ demo, onEnterApp }) => {
  
  // Define nodes based on demo ID
  let nodes = [
    { id: 1, title: '全景数据采集', desc: '实时接入工厂摄像头数据流与 IoT 传感器信号', icon: <IconCamera />, x: 100, y: 300, color: 'bg-blue-500' },
    { id: 2, title: '多模态 AI 分析', desc: 'YOLOv8 + Gemini 联合分析，识别违规行为与设备隐患', icon: <IconBrain />, x: 450, y: 300, color: 'bg-purple-500' },
    { id: 3, title: '智能业务路由', desc: '基于风险等级自动分发：警告/工单/停机指令', icon: <IconCheckSquare />, x: 800, y: 300, color: 'bg-orange-500' },
    { id: 4, title: '闭环行动触达', desc: '推送飞书卡片给对应负责人，拉起应急群组', icon: <IconMessageSquare />, x: 1150, y: 300, color: 'bg-green-500' },
  ];

  if (demo.id === 'gtm') {
    nodes = [
      { id: 1, title: '销售会议录制', desc: '飞书妙记自动录制销售沟通全过程', icon: <IconCamera />, x: 100, y: 300, color: 'bg-indigo-500' },
      { id: 2, title: '智能风险提取', desc: 'AI 识别客户异议、预算风险与竞对信息', icon: <IconBrain />, x: 450, y: 300, color: 'bg-rose-500' },
      { id: 3, title: 'CRM 自动同步', desc: '将风险点与关键信息自动回写至商机报表', icon: <IconCheckSquare />, x: 800, y: 300, color: 'bg-blue-500' },
      { id: 4, title: '销售策略建议', desc: '生成针对性的销售话术与下一步行动卡片', icon: <IconMessageSquare />, x: 1150, y: 300, color: 'bg-emerald-500' },
    ];
  }

  return (
    <div className="flex-1 flex h-full bg-slate-50 overflow-hidden relative font-sans">
      {/* Canvas Area */}
      <div className="flex-1 relative overflow-auto bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] cursor-grab active:cursor-grabbing">
         <div className="min-w-[1500px] min-h-[800px] relative p-20 flex items-center justify-center">
            {/* Edges */}
            {nodes.slice(0, -1).map((node, i) => (
              <FlowEdge 
                key={i}
                startX={node.x + 256} // width of card
                startY={node.y + 60} // roughly middle
                endX={nodes[i+1].x}
                endY={nodes[i+1].y + 60}
              />
            ))}

            {/* Nodes */}
            {nodes.map(node => (
              <FlowNode key={node.id} {...node} />
            ))}
         </div>
         
         <div className="absolute top-6 left-6 z-20">
            <div className="bg-white/80 backdrop-blur shadow-sm border border-slate-200 rounded-lg p-3 flex items-center gap-3">
               <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
               <span className="text-xs font-semibold text-slate-600">流程引擎运行中</span>
            </div>
         </div>
      </div>

      {/* Right Sidebar */}
      <div className="w-[360px] bg-white border-l border-[color:var(--border)] shadow-xl z-30 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-[color:var(--border)] flex items-center justify-between px-6">
           <div className="flex items-center gap-2">
             <span className="ui-tag px-2 py-0.5 text-[10px] bg-slate-100 text-slate-500 border-slate-200">Flow</span>
             <h3 className="text-sm font-bold text-slate-900">业务流程编排</h3>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
           <div className="aspect-video w-full rounded-xl bg-slate-100 border border-slate-200 mb-6 overflow-hidden relative group">
              {demo.cover ? (
                <img src={demo.cover} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300">Preview</div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
                 <h2 className="text-white font-bold text-lg">{demo.title}</h2>
              </div>
           </div>

           <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">流程说明</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-light">
                  {demo.valueProp}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-3">关键节点</h4>
                <ul className="space-y-3">
                  {nodes.map((n, i) => (
                    <li key={n.id} className="flex items-center gap-3 text-sm text-slate-600">
                      <span className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">{i+1}</span>
                      <span>{n.title}</span>
                    </li>
                  ))}
                </ul>
              </div>
           </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[color:var(--border)] bg-slate-50">
           <button 
             onClick={onEnterApp}
             className="w-full ui-btn ui-btn-primary h-12 text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all transform active:scale-95 flex items-center justify-center gap-2 text-black"
           >
             <IconPlay />
             进入应用
           </button>
           <p className="text-center mt-3 text-[10px] text-slate-400">
             点击即可进入应用模式体验真实交互
           </p>
        </div>
      </div>
    </div>
  );
};

export default DemoFlow;
