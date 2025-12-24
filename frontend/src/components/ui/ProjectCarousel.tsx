import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import ProjectCard from './ProjectCard';

interface Project {
  id: string;
  name: string;
  date: string;
  size: string;
  kind: string;
  desc: string;
  detailedDesc: string;
  screenshot: string;
  techStack: string[];
  links: {
    website?: string | null;
    github?: string | null;
  };
}

interface ProjectCardData {
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  icon?: React.ReactNode;
}

interface ProjectCarouselProps {
  projects: Project[];
  projectsData: {
    portfolio: ProjectCardData;
    suogogo: ProjectCardData;
    searchEngine: ProjectCardData;
    dataPipeline: ProjectCardData;
    ithink: ProjectCardData;
  };
  onProjectClick: (projectId: string) => void;
  cardWidth?: string;
}

const ProjectCarousel: React.FC<ProjectCarouselProps> = ({
  projects,
  projectsData,
  onProjectClick,
  cardWidth = 'w-full'
}) => {
  // State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Refs
  const dragStartY = useRef(0);
  const dragStartX = useRef(0);
  const touchStartTime = useRef(0);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Constants
  const SWIPE_THRESHOLD = 80;
  const TAP_THRESHOLD = 10;
  const TAP_DURATION = 200;

  // Get display data from projectsData based on project ID
  const getDisplayData = (project: Project): ProjectCardData => {
    const idMap: { [key: string]: keyof typeof projectsData } = {
      'portfolio': 'portfolio',
      'suogogo': 'suogogo',
      'searchengine': 'searchEngine',
      'datapipeline': 'dataPipeline',
      'ithink': 'ithink'
    };

    const key = idMap[project.id];
    if (key && projectsData[key]) {
      return projectsData[key];
    }

    // Fallback to project data if not found
    return {
      title: project.name,
      description: project.desc,
      techStack: project.techStack,
      link: project.links.website || project.links.github || undefined
    };
  };

  // Touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isTransitioning) return;

    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
    dragStartX.current = e.touches[0].clientX;
    touchStartTime.current = Date.now();

    // Prevent page scroll immediately when touch starts in carousel
    e.preventDefault();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || isTransitioning) return;

    // Always prevent default to stop page scroll
    e.preventDefault();

    const currentY = e.touches[0].clientY;
    const currentX = e.touches[0].clientX;
    const deltaY = currentY - dragStartY.current;
    const deltaX = currentX - dragStartX.current;

    // Detect vertical vs horizontal drag
    const absDeltaY = Math.abs(deltaY);
    const absDeltaX = Math.abs(deltaX);

    // Stop propagation for vertical drags
    if (absDeltaY > absDeltaX && absDeltaY > 15) {
      e.stopPropagation();
    }

    // Limit drag distance (rubber-band effect)
    const limitedDelta = Math.sign(deltaY) * Math.min(Math.abs(deltaY), 200);
    setDragOffset(limitedDelta);

    // Apply real-time transform to current card
    const currentCard = cardRefs.current[currentIndex];
    if (currentCard) {
      const dragProgress = Math.abs(limitedDelta) / 200;
      const scale = 1 - dragProgress * 0.05; // Max 5% reduction
      currentCard.style.transform = `translateY(${limitedDelta}px) scale(${scale})`;
      currentCard.style.transition = 'none';
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const touchDuration = Date.now() - touchStartTime.current;
    const dragDistance = Math.abs(dragOffset);

    if (dragDistance < TAP_THRESHOLD && touchDuration < TAP_DURATION) {
      // TAP: Open project detail
      onProjectClick(projects[currentIndex].id);
      resetCard();
    } else if (dragDistance > SWIPE_THRESHOLD) {
      // SWIPE: Navigate to next/prev card
      const direction = dragOffset > 0 ? 'down' : 'up';
      transitionCard(direction);
    } else {
      // INSUFFICIENT DRAG: Spring back
      springBack();
    }

    setIsDragging(false);
    setDragOffset(0);
  };

  // Reset card position
  const resetCard = () => {
    const currentCard = cardRefs.current[currentIndex];
    if (currentCard) {
      gsap.to(currentCard, {
        y: 0,
        scale: 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    }
  };

  // Spring back animation
  const springBack = useCallback(() => {
    const currentCard = cardRefs.current[currentIndex];
    if (!currentCard) return;

    gsap.to(currentCard, {
      y: 0,
      scale: 1,
      duration: 0.3,
      ease: 'elastic.out(1, 0.5)'
    });
  }, [currentIndex]);

  // Card transition animation
  const transitionCard = useCallback((direction: 'up' | 'down') => {
    setIsTransitioning(true);

    const newIndex = direction === 'up'
      ? (currentIndex + 1) % projects.length
      : (currentIndex - 1 + projects.length) % projects.length;

    const currentCard = cardRefs.current[currentIndex];
    const nextCard = cardRefs.current[newIndex];

    if (!currentCard || !nextCard) {
      setIsTransitioning(false);
      return;
    }

    // Make next card visible
    gsap.set(nextCard, {
      display: 'block',
      y: direction === 'up' ? '100%' : '-100%',
      scale: 0.9,
      opacity: 0,
      zIndex: 1
    });

    // Set current card z-index higher
    gsap.set(currentCard, { zIndex: 2 });

    const tl = gsap.timeline({
      onComplete: () => {
        setCurrentIndex(newIndex);
        setIsTransitioning(false);
        // Cleanup: hide old current card
        gsap.set(currentCard, { display: 'none', zIndex: 1 });
        gsap.set(nextCard, { zIndex: 1 });
      }
    });

    // Current card exits
    tl.to(currentCard, {
      y: direction === 'up' ? '-150%' : '150%',
      scale: 0.85,
      opacity: 0.8,
      duration: 0.3,
      ease: 'power2.in'
    }, 0);

    // Next card enters
    tl.to(nextCard, {
      y: '0%',
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out'
    }, 0.15); // 150ms overlap

    timelineRef.current = tl;
  }, [currentIndex, projects.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        transitionCard('down');
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        transitionCard('up');
      } else if (e.key === 'Enter') {
        onProjectClick(projects[currentIndex].id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTransitioning, transitionCard, onProjectClick, projects]);

  // Cleanup on unmount
  useEffect(() => {
    const cards = cardRefs.current;
    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      gsap.killTweensOf(cards);
    };
  }, []);

  // Setup touchmove event listener with passive: false to prevent page scroll
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchMoveHandler = (e: TouchEvent) => {
      // Always prevent default to stop page scroll when touching carousel
      e.preventDefault();
    };

    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    return () => container.removeEventListener('touchmove', touchMoveHandler);
  }, []);

  // Get visible card indices (only render current, next, previous)
  const getVisibleIndices = () => {
    return [
      currentIndex,
      (currentIndex + 1) % projects.length,
      (currentIndex - 1 + projects.length) % projects.length
    ];
  };

  const visibleIndices = getVisibleIndices();

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full"
      role="region"
      aria-label="Project carousel"
      tabIndex={0}
    >
      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Showing project {currentIndex + 1} of {projects.length}: {projects[currentIndex].name}
      </div>

      {/* Card container with fixed boundaries */}
      <div
        className={`relative ${cardWidth} select-none bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10`}
        style={{
          height: '153px',
          padding: '2px',
          overflow: 'hidden',
          touchAction: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {projects.map((project, index) => {
          if (!visibleIndices.includes(index)) return null;

          const isActive = index === currentIndex;

          const displayData = getDisplayData(project);

          return (
            <div
              key={project.id}
              ref={el => { cardRefs.current[index] = el; }}
              style={{
                display: isActive ? 'block' : 'none',
                willChange: isDragging && isActive ? 'transform' : 'auto'
              }}
            >
              <div className="h-full overflow-hidden">
                <ProjectCard
                  title={displayData.title}
                  description={displayData.description}
                  techStack={displayData.techStack}
                  link={displayData.link}
                  icon={displayData.icon}
                  cardWidth="w-full"
                  isCollapsed={false}
                  isMobileCarousel={true}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination dots - right side vertical, only show during drag/transition */}
      <div
        className={`absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-2 transition-opacity duration-300 ${
          isDragging || isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ pointerEvents: 'none' }}
      >
        {projects.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? 'bg-white/90 scale-125'
                : 'bg-white/30'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectCarousel;
