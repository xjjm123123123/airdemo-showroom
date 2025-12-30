
import React from 'react';

interface FeishuCardProps {
  title: string;
  fields: { label: string; value: string }[];
  actions: { label: string; primary?: boolean }[];
}

const FeishuCard: React.FC<FeishuCardProps> = ({ title, fields, actions }) => {
  return (
    <div className="bg-[color:var(--bg-surface-1)] rounded-[var(--radius-md)] shadow-2xl border border-[color:var(--border)] overflow-hidden w-full max-w-[320px] transition-all transform hover:scale-[1.02]">
      {/* Header */}
      <div className="h-1 bg-[color:var(--primary)]"></div>
      <div className="p-4 border-b border-[color:var(--border)]">
        <h4 className="font-bold text-[color:var(--text)] text-sm flex items-center gap-2">
          <div className="w-4 h-4 bg-[color:var(--primary-light)] rounded-[var(--radius-sm)] flex items-center justify-center">
             <div className="w-2 h-2 bg-[color:var(--primary)] rounded-full"></div>
          </div>
          {title}
        </h4>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-[color:var(--text-3)] font-medium">{f.label}</span>
            <span className="text-xs text-[color:var(--text-2)] font-semibold">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-3 bg-[color:var(--bg-surface-2)] flex gap-2 border-t border-[color:var(--border)]">
        {actions.map((a, i) => (
          <button 
            key={i}
            className={`flex-1 py-1.5 text-xs font-bold rounded-[var(--radius-sm)] transition-colors ${
              a.primary 
                ? 'bg-[color:var(--primary)] text-white hover:bg-[color:var(--primary-hover)]' 
                : 'bg-[color:var(--bg-surface-1)] border border-[color:var(--border)] text-[color:var(--text-2)] hover:bg-[color:var(--bg-surface-2)]'
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FeishuCard;
