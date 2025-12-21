import React, { useState } from 'react';
import { useResponsive } from '../../utils/responsive';
import SkillsGraph from './SkillsGraph';

type TabType = 'about' | 'skills' | 'experience';

type WidgetsSidebarProps = {
  className?: string;
  defaultTab?: TabType;
};

const WidgetsSidebar: React.FC<WidgetsSidebarProps> = ({
  className = '',
  defaultTab = 'skills'
}) => {
  const [activeTab, setActiveTab] = useState<TabType>(defaultTab);
  const responsive = useResponsive();

  const tabs: Array<{ id: TabType; label: string }> = [
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' }
  ];

  // Responsive container classes - using viewport units with breakpoints for different screen sizes
  const getContainerClass = () => {
    if (responsive.isMobile) return 'w-full min-h-[500px] flex-col';
    if (responsive.isTablet) return 'w-[16vw] h-[50vh] flex-col';
    // Desktop: 小屏幕（笔记本）用较大值，大屏幕（外接显示器）用较小值
    // 基础桌面（1024-1440px）: 25vw, 45vh
    // 大屏（1440-1920px）: 22vw, 40vh
    // 超大屏（>=1920px）: 18.5vw, 37vh
    return 'w-[25vw] h-[45vh] xl:w-[22vw] xl:h-[40vh] 2xl:w-[18.5vw] 2xl:h-[37vh] flex-col';
  };

  // Responsive tab navigation classes - horizontal tabs at top for all devices
  const getTabNavClass = () => {
    return 'flex flex-row gap-1 p-1 bg-white/20 border-b border-white/20';
  };

  return (
    <div
      className={`
        ${getContainerClass()}
        ${className}
        bg-transparent border border-white/30
        rounded-2xl shadow-xl overflow-hidden flex
      `}
    >
      {/* Tab Navigation - Top for all devices */}
      <div className={`
        ${getTabNavClass()}
        order-1
      `}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1
              px-1 py-1 rounded-lg text-xs font-medium
              transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-white/50 text-gray-900 font-semibold shadow-md'
                : 'bg-transparent text-gray-700 hover:bg-white/20'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area - Below tabs for all devices */}
      <div className="flex-1 p-4 overflow-y-auto order-2">
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
};

// Tab Content Component
const TabContent: React.FC<{ tab: TabType }> = ({ tab }) => {
  const contentMap = {
    about: <AboutContent />,
    skills: <SkillsContent />,
    experience: <ExperienceContent />
  };

  return (
    <div className="transition-opacity duration-200 h-full">
      {contentMap[tab]}
    </div>
  );
};

// Placeholder Content Components
const AboutContent = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-600 text-sm">About content placeholder</p>
  </div>
);

const SkillsContent = () => (
  <div className="w-full h-full">
    <SkillsGraph />
  </div>
);

const ExperienceContent = () => (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-600 text-sm">Experience content placeholder</p>
  </div>
);

export default WidgetsSidebar;
