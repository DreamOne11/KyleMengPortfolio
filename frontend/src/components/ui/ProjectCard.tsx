import React from 'react';

export type ProjectCardProps = {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  icon?: React.ReactNode;
  isPlaceholder?: boolean;
  cardWidth?: string;
  isCollapsed?: boolean;
  onHoverChange?: (isHovered: boolean) => void;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  techStack,
  link,
  icon,
  isPlaceholder = false,
  cardWidth = 'w-[300px]',
  isCollapsed = false,
  onHoverChange
}) => {
  // Placeholder card has different styling
  const cardStyle = isPlaceholder
    ? 'bg-white/5 backdrop-blur-sm border border-white/10 opacity-40'
    : '';

  return (
    <div
      className={`relative ${cardWidth} font-sans transition-all duration-300`}
      style={{ fontFamily: "Inter, Poppins, Manrope, sans-serif" }}
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      {/* Background layer - transitions between transparent and glass morphism */}
      {!isPlaceholder && (
        <div
          className={`
            absolute inset-0 -z-10 rounded-2xl border
            transition-all duration-300 ease-in-out
            ${isCollapsed
              ? 'bg-transparent backdrop-blur-none border-transparent shadow-none'
              : 'bg-white/10 backdrop-blur-md border-white/20 shadow-2xl'
            }
          `}
        />
      )}

      {/* Content layer */}
      <div className={`${cardStyle} rounded-2xl p-6 flex flex-col gap-4 relative`}>
        {/* Title section - ALWAYS visible */}
        <div className="flex items-center gap-3 mb-2">
          <span
            className="text-lg font-bold truncate max-w-[240px]"
            style={{
              color: '#1A1A1A',
              fontWeight: 700,
              textShadow: '0 1px 2px rgba(0,0,0,0.15)'
            }}
          >
            {title}
          </span>
          {link && icon && (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex-shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              {icon}
            </a>
          )}
        </div>

        {/* Content section - smooth collapse/expand with max-height transition */}
        <div
          className={`
            transition-all duration-300 ease-in-out overflow-hidden
            ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100'}
          `}
        >
          <div className="description text-sm mb-2" style={{ color: '#333' }}>
            {description}
          </div>
          {techStack.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {techStack.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs font-semibold px-2 py-1"
                  style={{
                    color: '#1A1A1A',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '6px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.18)'
                  }}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
