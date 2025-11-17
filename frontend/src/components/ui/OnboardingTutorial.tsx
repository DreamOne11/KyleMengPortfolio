import React, { useState, useEffect, useRef } from 'react';
import { useResponsive } from '../../utils/responsive';

type Props = {
  onComplete: () => void;
  onTriggerContactFolder?: () => void;
  onCloseContactFolder?: () => void;
};

type Step = {
  id: number;
  title: string;
  description: string;
  targetSelector: string;
  tooltipPosition: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  autoTrigger?: () => void;
};

const OnboardingTutorial: React.FC<Props> = ({ onComplete, onTriggerContactFolder, onCloseContactFolder }) => {
  const responsive = useResponsive();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);

  const steps: Step[] = [
    {
      id: 0,
      title: 'Welcome to my Portfolio 👋',
      description: 'Click the corresponding button to switch between sections',
      targetSelector: responsive.isMobile ? '.top-navigation' : '.bottom-dock',
      tooltipPosition: 'top',
    },
    {
      id: 1,
      title: 'Explore Folders 📁',
      description: 'Double-click to open the folder and view its contents',
      targetSelector: '[data-onboarding="contact-folder"]',
      tooltipPosition: 'right',
    },
    {
      id: 2,
      title: 'View Details 📄',
      description: 'Click to view details',
      targetSelector: '[data-onboarding="contact-email"]',
      tooltipPosition: 'right',
      autoTrigger: onTriggerContactFolder,
    },
    {
      id: 3,
      title: 'Chat with Me 💬',
      description: 'Double-click to chat with the Chatbot',
      targetSelector: '.kyle-interactive',
      tooltipPosition: 'left',
    },
  ];

  const currentStepData = steps[currentStep];

  // Update highlight and tooltip position
  const updatePositions = () => {
    if (!currentStepData) return;

    const element = document.querySelector(currentStepData.targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);

      // Calculate tooltip position
      const padding = 20;
      let top = 0;
      let left = 0;

      // Check if mobile view
      const isMobileView = window.innerWidth < 768;
      const tooltipWidth = isMobileView ? Math.min(340, window.innerWidth - 32) : 380;
      const tooltipHeight = isMobileView ? 180 : 200;

      if (isMobileView) {
        // Mobile-specific positioning - always use bottom positioning and center horizontally
        left = window.innerWidth / 2;

        if (currentStepData.tooltipPosition === 'top') {
          // Position above the highlighted element
          top = rect.top - tooltipHeight - 16;
          // If not enough space above, position below
          if (top < 16) {
            top = rect.bottom + 16;
          }
        } else {
          // For all other positions on mobile, position below the element
          top = rect.bottom + 16;
          // If not enough space below, position above
          if (top + tooltipHeight > window.innerHeight - 16) {
            top = rect.top - tooltipHeight - 16;
          }
        }
      } else {
        // Desktop positioning logic - use the specified tooltip position
        switch (currentStepData.tooltipPosition) {
          case 'top':
            top = rect.top - 250 - padding;  // Increased distance from element
            left = rect.left + rect.width / 2;
            break;
          case 'bottom':
            top = rect.bottom + padding;
            left = rect.left + rect.width / 2;
            break;
          case 'left':
            // Step 4 (Kyle 3D model) - position closer to model
            top = rect.top + rect.height / 2;
            left = rect.left - 200;
            break;
          case 'right':
            // Special positioning for different steps
            if (currentStep === 1) {
              // Step 2 (Contact folder) - position below and to the right
              top = rect.bottom + padding;
              left = rect.right + padding;
            } else if (currentStep === 2) {
              // Step 3 (Email row) - position slightly below center and to the right
              top = rect.top + rect.height / 2 + 40;
              left = rect.right + padding;
            } else {
              // Default right positioning
              top = rect.top + rect.height / 2;
              left = rect.right + padding;
            }
            break;
          default:
            top = rect.top + rect.height / 2;
            left = rect.right + padding;
        }

        // Keep tooltip within viewport (desktop only)
        if (left + tooltipWidth > window.innerWidth) {
          left = rect.left - tooltipWidth - padding;
        }
        if (left < padding) {
          left = padding;
        }
        if (top + tooltipHeight > window.innerHeight) {
          top = window.innerHeight - tooltipHeight - padding;
        }
        if (top < padding) {
          top = padding;
        }
      }

      setTooltipPosition({ top, left });
    } else {
      setHighlightRect(null);
      setTooltipPosition(null);
    }
  };

  // Watch for DOM changes to update positions
  useEffect(() => {
    updatePositions();

    // Create observer to watch for DOM changes
    observerRef.current = new MutationObserver(() => {
      updatePositions();
    });

    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
    });

    // Update on window resize
    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);

    // Retry finding element if not found initially
    const retryInterval = setInterval(() => {
      if (!highlightRect) {
        updatePositions();
      }
    }, 500);

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
      clearInterval(retryInterval);
    };
  }, [currentStep]);

  // Auto-trigger action for current step
  useEffect(() => {
    if (currentStepData.autoTrigger) {
      const timer = setTimeout(() => {
        currentStepData.autoTrigger?.();
        // Update positions after trigger with longer delay to ensure DOM is ready
        setTimeout(updatePositions, 100);
        setTimeout(updatePositions, 300);
        setTimeout(updatePositions, 600);
        setTimeout(updatePositions, 1000);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const handleNext = () => {
    // Close Contact folder when moving from step 2 (Email) to step 3 (Chat)
    if (currentStep === 2 && onCloseContactFolder) {
      onCloseContactFolder();
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    localStorage.setItem('portfolio_onboarding_completed', 'true');
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* Semi-transparent overlay with cutout */}
      <div
        className="absolute inset-0 pointer-events-auto"
        style={{
          background: 'rgba(0, 0, 0, 0.2)',  // Darker overlay for more contrast
        }}
      />

      {/* Spotlight highlight */}
      {highlightRect && (
        <>
          {/* Glowing border */}
          <div
            className="absolute rounded-lg pointer-events-none transition-all duration-500 ease-out"
            style={{
              top: highlightRect.top - 6,
              left: highlightRect.left - 6,
              width: highlightRect.width + 12,
              height: highlightRect.height + 12,
              boxShadow: `
                0 0 0 4px rgba(96, 165, 250, 0.8),
                0 0 0 9999px rgba(0, 0, 0, 0.85),
                0 0 40px 8px rgba(59, 130, 246, 0.6),
                inset 0 0 30px rgba(147, 197, 253, 0.5)
              `,
              border: '3px solid rgba(147, 197, 253, 1)',
              animation: 'pulse-border 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            }}
          />

          {/* Bright inner area */}
          <div
            className="absolute rounded-lg pointer-events-none transition-all duration-500 ease-out"
            style={{
              top: highlightRect.top,
              left: highlightRect.left,
              width: highlightRect.width,
              height: highlightRect.height,
              background: 'rgba(255, 255, 255, 0.03)',
              boxShadow: 'inset 0 0 20px rgba(147, 197, 253, 0.3)',
            }}
          />
        </>
      )}

      {/* Tooltip card */}
      {(tooltipPosition || !highlightRect) && (
        <div
          className="absolute pointer-events-auto transition-all duration-500 ease-out px-4 md:px-0"
          style={{
            top: tooltipPosition?.top ?? window.innerHeight / 2 - 150,
            left: tooltipPosition?.left ?? window.innerWidth / 2,
            transform: 'translateX(-50%)',
            maxWidth: window.innerWidth < 768 ? 'calc(100vw - 32px)' : 'none',
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 md:p-6" style={{
            width: window.innerWidth < 768 ? 'auto' : '360px',
            minWidth: window.innerWidth < 768 ? '300px' : 'auto',
          }}>
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-3 md:mb-4">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentStep
                      ? 'w-8 bg-blue-500'
                      : index < currentStep
                      ? 'w-2 bg-blue-300'
                      : 'w-2 bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Content */}
            <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2 text-center">
              {currentStepData.title}
            </h2>
            <p className="text-xs md:text-sm text-gray-600 mb-4 md:mb-6 text-center leading-relaxed">
              {currentStepData.description}
            </p>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSkip}
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-xl text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200 font-medium text-xs md:text-sm"
              >
                Skip
              </button>
              <button
                onClick={handleNext}
                className="flex-1 px-3 md:px-4 py-2 md:py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-xs md:text-sm"
              >
                {currentStep < steps.length - 1 ? 'Next →' : 'Got it!'}
              </button>
            </div>

            {/* Step counter */}
            <p className="text-center text-xs text-gray-400 mt-2 md:mt-3">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>
        </div>
      )}

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse-border {
          0%, 100% {
            box-shadow:
              0 0 0 4px rgba(96, 165, 250, 1),
              0 0 0 9999px rgba(0, 0, 0, 0.85),
              0 0 50px 10px rgba(59, 130, 246, 0.8),
              inset 0 0 40px rgba(147, 197, 253, 0.6);
            border-color: rgba(147, 197, 253, 1);
          }
          50% {
            box-shadow:
              0 0 0 4px rgba(96, 165, 250, 0.8),
              0 0 0 9999px rgba(0, 0, 0, 0.85),
              0 0 30px 6px rgba(59, 130, 246, 0.5),
              inset 0 0 20px rgba(147, 197, 253, 0.4);
            border-color: rgba(147, 197, 253, 0.8);
          }
        }
      `}</style>
    </div>
  );
};

export default OnboardingTutorial;
