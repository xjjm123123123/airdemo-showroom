import React from 'react';

const MainGrid: React.FC = () => {
  return (
    <main className="flex-1 bg-white flex flex-col h-full overflow-hidden">
      {/* Embedded Lark Base */}
      <div className="flex-1 overflow-hidden">
        <iframe 
          src="https://bytedance.larkoffice.com/base/JRAkbvyCbag90QsDAhicKriBnZe?table=tblYiXmzqwotHNwg&view=vewwHwSIUN"
          className="w-full h-full border-none"
          title="Lark Base"
        />
      </div>
    </main>
  );
};

export default MainGrid;
