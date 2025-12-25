import React from 'react';

const Loading: React.FC = () => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[color:var(--bg-surface-1)]/80 backdrop-blur-sm transition-opacity duration-300">
      <div className="relative flex items-center justify-center">
        {/* Outer rotating ring */}
        <div className="w-12 h-12 border-2 border-[color:var(--border)] rounded-full"></div>
        <div className="absolute w-12 h-12 border-2 border-transparent border-t-[color:var(--primary)] rounded-full animate-spin"></div>
        
        {/* Inner pulsing dot */}
        <div className="absolute w-2 h-2 bg-[color:var(--primary)] rounded-full animate-pulse"></div>
      </div>
      
      <div className="mt-4 flex flex-col items-center gap-2">
        <span className="text-sm font-medium text-[color:var(--text-2)] tracking-wide">
          正在加载多维表格...
        </span>
        <span className="text-[10px] text-[color:var(--text-3)] uppercase tracking-widest opacity-60">
          Loading Data Base
        </span>
      </div>
    </div>
  );
};

export default Loading;
