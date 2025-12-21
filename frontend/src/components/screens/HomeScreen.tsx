import React, { useState, useEffect } from 'react';
import MacOSFolderIcon from '../icons/MacOSFolderIcon';
import KeyboardLogoStacked from '../ui/KeyboardLogoStacked';
import KyleInteractive from '../ui/KyleInteractive';
import ProjectCard from '../ui/ProjectCard';
import WidgetsSidebar from '../ui/WidgetsSidebar';
import { useResponsive, getResponsiveScale } from '../../utils/responsive';

type HomeScreenProps = {
  onFolderDoubleClick: (folderId: string, e: React.MouseEvent, folderName: string) => void;
  onAllProjectsFolderDoubleClick: (e: React.MouseEvent) => void;
  onChatExpandedChange?: (isExpanded: boolean) => void;
  onProjectDoubleClick?: (projectId: string) => void;
};

const HomeScreen: React.FC<HomeScreenProps> = ({
  onFolderDoubleClick,
  onAllProjectsFolderDoubleClick,
  onChatExpandedChange,
  onProjectDoubleClick
}) => {
  const responsive = useResponsive();
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [scale, setScale] = useState(getResponsiveScale());
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // 合并所有文件夹配置
  const folders = [
    { id: 'resume', name: 'Resume', color: 'blue' as const },
    { id: 'contact', name: 'Contact', color: 'green' as const },
    { id: 'all-projects', name: 'All projects', color: 'orange' as const }
  ];

  // 响应式辅助函数
  const getTitleSize = () => {
    if (responsive.isMobile) return '1.5rem';
    if (responsive.isTablet) return '1.75rem';
    return '2rem';
  };

  const getSubtitleSize = () => {
    if (responsive.isMobile) return '1rem';
    if (responsive.isTablet) return '1.25rem';
    return '1.5rem';
  };

  const getCardWidth = () => {
    if (responsive.isMobile) return 'w-full max-w-[320px]';
    if (responsive.isTablet) return 'w-[280px]';
    return 'w-[300px]';
  };

  const handleFolderClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFolder(folderId);

    // 移动端单击直接打开文件夹
    if (responsive.isMobile) {
      if (folderId === 'all-projects') {
        onAllProjectsFolderDoubleClick(e);
      } else {
        const folderName = folders.find(f => f.id === folderId)?.name || folderId;
        onFolderDoubleClick(folderId, e, folderName);
      }
    }
  };

  const handleFolderDoubleClick = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // 桌面端才响应双击事件
    if (!responsive.isMobile) {
      if (folderId === 'all-projects') {
        onAllProjectsFolderDoubleClick(e);
      } else {
        const folderName = folders.find(f => f.id === folderId)?.name || folderId;
        onFolderDoubleClick(folderId, e, folderName);
      }
    }
  };

  const handleBackgroundClick = () => setSelectedFolder(null);

  // Z-index 管理函数
  const getCardZIndex = (cardId: string): number => {
    // 默认堆叠顺序 (从下到上)
    const stackOrder = ['portfolio', 'suogogo', 'searchEngine', 'dataPipeline', 'ithink'];
    return 10 + stackOrder.indexOf(cardId);
  };

  // 计算卡片位置偏移 - hover 时下方卡片向下移动
  const getCardTopOffset = (cardId: string, baseOffset: number): number => {
    if (!hoveredCard) return baseOffset;

    const stackOrder = ['portfolio', 'suogogo', 'searchEngine', 'dataPipeline', 'ithink'];
    const hoveredIndex = stackOrder.indexOf(hoveredCard);
    const currentIndex = stackOrder.indexOf(cardId);

    // 如果当前卡片在 hover 卡片下方，向下偏移为展开的卡片让出空间
    if (currentIndex > hoveredIndex) {
      return baseOffset + 100; // 卡片展开高度约 200px，偏移 100px
    }

    return baseOffset;
  };

  // 悬停回调函数
  const handleCardHover = (cardId: string, isHovered: boolean) => {
    setHoveredCard(isHovered ? cardId : null);
  };

  // 双击卡片处理函数
  const handleCardDoubleClick = (cardId: string) => {
    if (!onProjectDoubleClick) return;

    // 映射 HomeScreen card ID 到 Screen allProjects ID
    const projectIdMap: { [key: string]: string } = {
      'portfolio': 'portfolio',
      'suogogo': 'suogogo',
      'searchEngine': 'searchengine',
      'dataPipeline': 'datapipeline',
      'ithink': 'ithink'
    };

    // 传递映射后的项目 ID
    const mappedId = projectIdMap[cardId] || cardId;
    onProjectDoubleClick(mappedId);
  };

  // 项目数据配置
  const projectsData = {
    portfolio: {
      title: 'Kyle\'s Portfolio',
      description: 'A desktop-inspired personal portfolio.',
      techStack: ['React', 'Three.js', 'GSAP'],
      link: 'https://github.com/DreamOne11/KyleMengPortfolio',
      icon: (
        <img
          src="/kyle-avatar.png"
          alt="Kyle"
          className="w-6 h-6 rounded-full object-cover"
        />
      )
    },
    suogogo: {
      title: 'Suogogo Platform',
      description: 'Suogogo is a shipping platform for cross-board logistics.',
      techStack: ['React', 'TypeScript', 'TailwindCSS'],
      link: 'https://www.suogogo.com',
      icon: (
        <svg width="24" height="24" viewBox="0 0 1198 1226" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M997.1 786.062V612.059C997.1 560.948 976.948 539.771 916.847 565.725L702.486 689.486C691.819 695.645 678.486 687.947 678.486 675.63V620.467C678.486 614.751 681.536 609.469 686.486 606.611L916.847 473.612L972.927 441.544C983.645 435.415 983.677 419.971 972.985 413.798L606.389 202.144C601.438 199.285 595.339 199.285 590.389 202.144L208 422.916C203.05 425.774 200 431.056 200 436.772V785.877C200 791.593 203.05 796.875 208 799.733L598.71 1025.31L989.1 799.918C994.051 797.06 997.1 791.778 997.1 786.062ZM908.847 754.782L606.697 929.228C601.753 932.082 595.664 932.087 590.716 929.239L287.584 754.778C282.623 751.923 279.565 746.635 279.565 740.911V482.072C279.565 476.356 282.615 471.074 287.565 468.216L590.389 293.38C595.339 290.522 601.438 290.522 606.389 293.38L815.073 413.865C825.74 420.023 825.74 435.419 815.073 441.577L608.043 561.106C603.093 563.964 600.043 569.246 600.043 574.962V750.163L600.291 812.663C600.339 824.924 613.593 832.576 624.236 826.488L678.486 795.452L892.847 671.691C903.514 665.532 916.847 673.23 916.847 685.547V740.926C916.847 746.642 913.797 751.924 908.847 754.782Z" fill="#059212"/>
        </svg>
      )
    },
    searchEngine: {
      title: 'Campus Search Engine',
      description: 'A distributed search engine base on Hadoop.',
      techStack: ['Java', 'Hadoop', 'MapReduce'],
      link: 'https://github.com/DreamOne11/SearchEngine',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/>
        </svg>
      )
    },
    dataPipeline: {
      title: 'E-commerce Data Pipeline',
      description: 'A data pipeline for e-commerce data.',
      techStack: ['Snowflake', 'Airflow', 'dbt'],
    },  
    ithink: {
      title: 'iThink Platform',
      description: 'A creative investment website to help you find brainstorming creative ideas.',
      techStack: ['Java', 'SpringBoot', 'Mini Program'],
      link: 'https://github.com/Chocolate-Prince-and-Six-Dwarfs/iThink/',
      icon: (
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path fill="#1A1A1A" d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.344-3.369-1.344-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.034 1.531 1.034.892 1.532 2.341 1.09 2.91.834.092-.648.35-1.09.636-1.34-2.22-.254-4.555-1.113-4.555-4.951 0-1.093.39-1.986 1.029-2.685-.103-.254-.446-1.272.098-2.651 0 0 .84-.27 2.75 1.027A9.564 9.564 0 0112 6.844c.85.004 1.705.116 2.504.34 1.909-1.297 2.747-1.027 2.747-1.027.546 1.38.203 2.397.1 2.651.64.7 1.028 1.592 1.028 2.685 0 3.847-2.339 4.695-4.566 4.945.359.31.678.922.678 1.857 0 1.34-.012 2.422-.012 2.75 0 .267.18.577.688.48C19.137 20.203 22 16.448 22 12.021 22 6.484 17.523 2 12 2Z"/>
        </svg>
      )
    }
  };


  // 监听窗口大小变化，更新缩放比例
  useEffect(() => {
    const handleResize = () => {
      setScale(getResponsiveScale());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 移动端垂直布局
  if (responsive.isMobile) {
    return (
      <div className="relative w-full h-full overflow-y-auto overflow-x-hidden" onClick={handleBackgroundClick}>
        <div className="flex flex-col min-h-full px-4 pt-20 pb-6">

          {/* HOME 标题 */}
          <div className="flex-shrink-0">
            <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4"
                style={{ fontSize: getTitleSize(), letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
              HOME
            </h3>
          </div>

          {/* KyleInteractive - 顶部 */}
          <div className="w-full h-32 flex-shrink-0">
            <KyleInteractive onChatExpandedChange={onChatExpandedChange} />
          </div>

          {/* 所有文件夹 - 水平并排 */}
          <div className="flex justify-center gap-3 flex-shrink-0 mb-4">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-2"
                onClick={(e) => handleFolderClick(folder.id, e)}
                onDoubleClick={(e) => handleFolderDoubleClick(folder.id, e)}
                data-onboarding={folder.id === 'contact' ? 'contact-folder' : undefined}
              >
                <div className={`w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-2 ${selectedFolder === folder.id ? 'bg-white/10' : ''}`}>
                  <MacOSFolderIcon color={folder.color} />
                </div>
                <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'}`}>
                  {folder.name}
                </h3>
              </div>
            ))}
          </div>

          {/* 项目展示卡片 - 垂直堆叠 */}
          <div className="flex flex-col items-center gap-6">
            <ProjectCard {...projectsData.portfolio} cardWidth={getCardWidth()} />
            <ProjectCard {...projectsData.suogogo} cardWidth={getCardWidth()} />
            <ProjectCard {...projectsData.searchEngine} cardWidth={getCardWidth()} />
            <ProjectCard {...projectsData.dataPipeline} cardWidth={getCardWidth()} />
            <ProjectCard {...projectsData.ithink} cardWidth={getCardWidth()} />
          </div>

          {/* Widgets Sidebar - mobile */}
          <div className="w-full mt-6">
            <WidgetsSidebar />
          </div>

          {/* KeyboardLogoStacked - 底部 */}
          <div className="flex justify-center flex-shrink-0 mt-8">
            <KeyboardLogoStacked />
          </div>

        </div>
      </div>
    );
  }

  // 桌面端布局
  return (
    <div className="relative w-full h-full overflow-hidden" onClick={handleBackgroundClick}>
      {/* KyleInteractive - 右上角 */}
      <div className="absolute top-2 right-2 z-20">
        <KyleInteractive onChatExpandedChange={onChatExpandedChange} />
      </div>

      {/* Title - 左上角 */}
      <div className="absolute top-8 z-10">
        <h3 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide mb-4"
            style={{ fontSize: getTitleSize(), letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          HOME
        </h3>
      </div>

      {/* 文件夹 - 左侧水平排列 */}
      <div className="absolute top-24 left-8 flex gap-4 md:gap-4">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="flex flex-col items-center cursor-pointer group transition-all duration-200 rounded-lg p-1"
            onClick={(e) => handleFolderClick(folder.id, e)}
            onDoubleClick={(e) => handleFolderDoubleClick(folder.id, e)}
            data-onboarding={folder.id === 'contact' ? 'contact-folder' : undefined}
          >
            <div className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center group-hover:scale-110 transition-all duration-200 rounded-lg hover:bg-white/10 mb-1 ${selectedFolder === folder.id ? 'bg-white/10' : ''}`}>
              <MacOSFolderIcon color={folder.color} />
            </div>
            <h3 className={`font-semibold text-xs px-2 py-1 rounded ${selectedFolder === folder.id ? 'text-white bg-blue-500' : 'text-white'}`}>
              {folder.name}
            </h3>
          </div>
        ))}
      </div>

      {/* Projects Subtitle - 在文件夹和卡片之间 */}
      <div className="absolute left-0 top-[22.5vh]">
        <h4 className="text-left text-[#263148] uppercase font-sans drop-shadow-sm font-extrabold tracking-wide"
            style={{ fontSize: getSubtitleSize(), letterSpacing: '0.04em', textShadow: '0 2px 8px #b3c2d6' }}>
          Projects
        </h4>
      </div>

      {/* 键帽 Logo - 居中显示 */}
      <div className="flex w-full h-full items-center justify-center pointer-events-none">
        <KeyboardLogoStacked />
      </div>

      {/* Widgets Sidebar - 右侧，与项目卡片对齐 */}
      <div className="absolute top-[22.5vh] right-0 z-10">
        <WidgetsSidebar />
      </div>

      {/* 项目卡片 - 左侧堆叠布局，相对于文件夹位置 */}
      {[
        { id: 'portfolio', data: projectsData.portfolio, topOffset: 0 },
        { id: 'suogogo', data: projectsData.suogogo, topOffset: 60 },
        { id: 'searchEngine', data: projectsData.searchEngine, topOffset: 120 },
        { id: 'dataPipeline', data: projectsData.dataPipeline, topOffset: 180 },
        { id: 'ithink', data: projectsData.ithink, topOffset: 240 }
      ].map(({ id, data, topOffset }) => (
        <div
          key={id}
          className="absolute cursor-pointer origin-left"
          style={{
            left: '1rem',
            top: `calc(26vh + ${getCardTopOffset(id, topOffset)}px)`,
            transform: `scale(${scale * (hoveredCard === id ? 1.02 : 1)})`,
            zIndex: getCardZIndex(id),
            transition: 'transform 0.3s ease-out, top 0.3s ease-out, z-index 0s'
          }}
          onDoubleClick={() => handleCardDoubleClick(id)}
        >
          <ProjectCard
            {...data}
            cardWidth={getCardWidth()}
            isCollapsed={hoveredCard !== id}
            onHoverChange={(isHovered) => handleCardHover(id, isHovered)}
          />
        </div>
      ))}
    </div>
  );
};

export default HomeScreen;
