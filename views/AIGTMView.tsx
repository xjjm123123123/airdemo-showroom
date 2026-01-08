import React from 'react';
import SidebarLeft from '../components/AIGTM/SidebarLeft';
import MainGrid from '../components/AIGTM/MainGrid';
import SidebarRight from '../components/AIGTM/SidebarRight';

const AIGTMView: React.FC = () => {
  return (
    <div className="flex h-full w-full bg-white overflow-hidden text-lark-textPrimary absolute inset-0 z-10">
      {/* 3-Column Layout */}
      <SidebarLeft />
      <MainGrid />
      <SidebarRight />
    </div>
  );
};

export default AIGTMView;
