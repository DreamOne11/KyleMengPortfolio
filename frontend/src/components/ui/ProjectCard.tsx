import React from 'react';

export type ProjectCardProps = {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  icon?: React.ReactNode;
  isPlaceholder?: boolean;
  cardWidth?: string;
};

const ProjectCard: React.FC<ProjectCardProps> = ({
  title,
  description,
  techStack,
  link,
  icon,
  isPlaceholder = false,
  cardWidth = 'w-[300px]'
}) => {
  // Placeholder card has different styling
  const cardStyle = isPlaceholder
    ? 'bg-white/5 backdrop-blur-sm border border-white/10 opacity-40'
    : 'bg-white/10 backdrop-blur-md border border-white/20 group hover:shadow-2xl';

  return (
    <div
      className={`${cardStyle} rounded-2xl shadow-xl p-6 ${cardWidth} flex flex-col gap-4 relative card font-sans`}
      style={{ fontFamily: "Inter, Poppins, Manrope, sans-serif" }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span
          className="text-lg font-bold title transition-colors duration-200"
          style={{ color: '#1A1A1A', fontWeight: 700, textShadow: '0 1px 2px rgba(0,0,0,0.15)' }}
        >
          {title}
        </span>
        {link && icon && (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto"
            onClick={(e) => e.stopPropagation()} // Prevent drag when clicking link
          >
            {icon}
          </a>
        )}
      </div>
      <div className="description text-sm mb-2" style={{ color: '#333' }}>
        {description}
      </div>
      {techStack.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="label text-xs font-semibold px-2 py-1"
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
  );
};

export default ProjectCard;
