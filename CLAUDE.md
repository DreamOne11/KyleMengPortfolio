# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Frontend (React TypeScript)
```bash
cd frontend
npm install          # Install dependencies
npm start            # Development server (uses craco start)
npm run build        # Production build (uses craco build)
npm test             # Run tests (uses craco test)
npm run lint:css     # CSS linting with stylelint
```

### Backend (Spring Boot)
```bash
cd backend
mvn clean install   # Build and install dependencies
mvn spring-boot:run  # Start development server
mvn test            # Run tests
```

### Root Level
The root package.json contains minimal dependencies for PDF handling (pdfjs-dist, react-pdf).

## Architecture Overview

This is a **desktop-inspired portfolio website** that simulates an operating system interface. The project is structured as a full-stack application:

### Frontend Architecture (React + TypeScript)
- **Main App Structure**: Single-page application with desktop metaphor
- **Layout System**: Hierarchical layout components that create OS-like experience
  - `DesktopContainer`: Main container with responsive scaling
  - `TopBar`: System status bar with time/weather
  - `Screen`: Swipeable screen system with multiple views
  - `BottomDock`: Navigation dock with screen switching

### Component Hierarchy
```
App.tsx
├── ParticleBackground (3D background effects)
├── DesktopContainer (responsive container)
    ├── TopBar (status bar)
    ├── Screen (screen management)
    │   ├── AboutMeScreen
    │   ├── MyWorkScreen
    │   ├── MyNoteScreen
    │   └── PhotographyScreen
    └── BottomDock (navigation)
```

### Window System
- **Modal Windows**: File manager, email composer, project details
- **Window Management**: Dragging, resizing, maximizing, z-index management
- **Responsive Behavior**: Windows adapt size/behavior based on device type

### Key Technical Features
1. **Responsive Design**: Custom responsive utility functions in `utils/responsive.ts`
2. **3D Elements**: Three.js integration for 3D model rendering (`Kyle3DModel.tsx`)
3. **Particle System**: Custom particle background with performance optimization
4. **Animation System**: GSAP for smooth animations and transitions
5. **Touch Support**: Mobile-optimized interactions and gestures

## Build Configuration

### Frontend Build Setup
- **Create React App** with **CRACO** for configuration overrides
- **Tailwind CSS** for styling with custom breakpoints (xs: 320px to 2xl: 1920px)
- **TypeScript** for type safety
- **PostCSS** for CSS processing

### Custom Webpack Configuration
- Source map warnings suppressed for @mediapipe/tasks-vision
- Development-only Stagewise toolbar integration for debugging

## Responsive Strategy

The application uses a **scaling-first approach** rather than traditional responsive breakpoints:
- Base design optimized for 1920x1080
- Dynamic scaling via `getResponsiveScale()` function
- Device-specific adaptations for mobile/tablet interactions
- Performance-aware rendering (particle count, 3D complexity based on device capability)

## Development Guidelines

### File Organization
- **Components**: Organized by type (layout, screens, ui, windows, icons, models)
- **Utils**: Shared utilities, especially responsive helpers
- **Data**: Static data files (filesystem structure simulation)

### Styling Approach
- **Tailwind-first**: Use Tailwind utilities with custom theme extensions
- **Glass morphism**: Consistent use of backdrop-blur and opacity for UI elements
- **Custom properties**: Leverage CSS custom properties for dynamic theming

### Performance Considerations
- **Conditional loading**: Stagewise components only in development
- **Device detection**: Adjust rendering complexity based on device performance
- **Lazy loading**: Import heavy dependencies dynamically when needed

### Code Patterns
- **TypeScript strict mode**: All components properly typed
- **React Hooks**: Functional components with hooks for state management
- **Custom hooks**: `useResponsive()` for device-aware components
- **Event handling**: Proper cleanup of event listeners in useEffect

## Important Technical Notes

### Responsive System
The project includes a comprehensive responsive utility system that:
- Detects device capabilities (performance level, memory, CPU cores)
- Provides breakpoint utilities (isMobile, isTablet, isDesktop)
- Calculates appropriate scaling factors for different screen sizes
- Manages window sizes based on device constraints

### 3D Integration
- Three.js with React Three Fiber for 3D rendering
- Performance optimization based on device detection
- Responsive camera positioning and model complexity

### Animation Performance
- GSAP for high-performance animations
- Reduced animation complexity on low-performance devices
- Particle system optimization for mobile devices

## Testing Strategy
- Jest and React Testing Library setup
- Component testing focus
- Use `npm test` in frontend directory

## Development Mode Features
- Stagewise toolbar for React component debugging (development only)
- Source map handling for external dependencies
- Hot reload with CRACO

## Backend Notes
- Minimal Spring Boot setup (currently basic web starter)
- Java 17 runtime
- Maven for dependency management
- Ready for expansion (database, API endpoints)

When working on this codebase, prioritize maintaining the desktop metaphor and responsive behavior. Always test changes across different device sizes and performance levels.