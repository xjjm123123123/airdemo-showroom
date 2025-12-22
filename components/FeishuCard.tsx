
import React from 'react';

interface FeishuCardProps {
  title: string;
  fields: { label: string; value: string }[];
  actions: { label: string; primary?: boolean }[];
}

const FeishuCard: React.FC<FeishuCardProps> = ({ title, fields, actions }) => {
  return (
    <div className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden w-full max-w-[320px] transition-all transform hover:scale-[1.02]">
      {/* Header */}
      <div className="h-1 bg-blue-500"></div>
      <div className="p-4 border-b border-gray-50">
        <h4 className="font-bold text-gray-900 text-sm flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
             <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
          </div>
          {title}
        </h4>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {fields.map((f, i) => (
          <div key={i} className="flex flex-col gap-0.5">
            <span className="text-[10px] text-gray-400 font-medium">{f.label}</span>
            <span className="text-xs text-gray-700 font-semibold">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="p-3 bg-gray-50 flex gap-2 border-t border-gray-100">
        {actions.map((a, i) => (
          <button 
            key={i}
            className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
              a.primary 
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
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
