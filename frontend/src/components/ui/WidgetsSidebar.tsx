import React, { useState } from 'react';
import { useResponsive } from '../../utils/responsive';
import SkillsGraph from './SkillsGraph';
import { Quote } from 'lucide-react';

type TabType = 'about' | 'skills';

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
    { id: 'skills', label: 'Skills' }
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
      <div className="flex-1 p-4 overflow-hidden order-2">
        <TabContent tab={activeTab} />
      </div>
    </div>
  );
};

// Tab Content Component
const TabContent: React.FC<{ tab: TabType }> = ({ tab }) => {
  const contentMap = {
    about: <AboutContent />,
    skills: <SkillsContent />
  };

  return (
    <div className="transition-opacity duration-200 h-full">
      {contentMap[tab]}
    </div>
  );
};

// Placeholder Content Components
const AboutContent = () => {
  const responsive = useResponsive();

  // Responsive text sizing
  const textSize = responsive.isMobile ? 'text-sm' : 'text-xs';
  const titleSize = responsive.isMobile ? 'text-base' : 'text-sm';

  return (
    <div className="h-full w-full bg-white/10 backdrop-blur-md rounded-2xl p-4 md:p-6 border border-white/20 shadow-2xl overflow-y-auto custom-scrollbar">
      {/* Header: Quote Icon + Title */}
      <div className="flex items-start gap-3 mb-4">
        <Quote className="w-8 h-8 md:w-10 md:h-10 text-gray-500 flex-shrink-0" />
        <h3 className={`${titleSize} font-semibold text-gray-900 pt-1`}>
          Hi, I'm Kyle (Xiangyi)
        </h3>
      </div>

      {/* Content paragraphs */}
      <div className="space-y-3">
        <p className={`${textSize} text-gray-800 leading-relaxed`}>
          I specialize in AI-driven applications, exploring{' '}
          <span className="text-purple-600">prompt engineering</span>,{' '}
          <span className="text-purple-600">AI agents</span>,{' '}
          <span className="text-purple-600">MCP servers</span>, and LLM frameworks like{' '}
          <span className="font-medium text-gray-900">LangChain</span> and{' '}
          <span className="font-medium text-gray-900">LangGraph</span>.
          I design practical, production-oriented agent workflows and continuously
          experiment with how AI systems can reason, retrieve, and act more effectively.
        </p>

        <p className={`${textSize} text-gray-800 leading-relaxed`}>
          I also have a passion for{' '}
          <span className="text-blue-600">data engineering</span>. During my
          undergraduate studies, I built a distributed search engine, sparking my
          enthusiasm for big-data processing and distributed systems. Since then,
          I've deepened my expertise in data pipelines and large-scale system design.
        </p>
      </div>
    </div>
  );
};

const SkillsContent = () => (
  <div className="w-full h-full">
    <SkillsGraph />
  </div>
);

export default WidgetsSidebar;
