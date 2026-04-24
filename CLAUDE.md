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

### Backend (Fastify Node.js TypeScript)
```bash
cd backend
npm install
npx prisma generate  # Regenerate Prisma client after schema changes
npm run dev          # Development server (uses tsx watch)
npm run build        # Compile TypeScript to dist/
npm start            # Run compiled server
npm test             # Run Vitest tests
npm run db:migrate   # Run prisma migrate dev locally
npm run db:seed      # Seed photography metadata when needed
```

### Root Level
The root `package.json` contains minimal dependencies for PDF handling (`pdfjs-dist`, `react-pdf`).

## Architecture Overview

This is a **desktop-inspired portfolio website** that simulates an operating system interface. The project is structured as a full-stack application:

### Frontend Architecture (React + TypeScript)
- **Main App Structure**: Single-page application with desktop metaphor
- **Layout System**: Hierarchical layout components that create OS-like experience
  - `DesktopContainer`: Main container with responsive scaling
  - `TopBar`: System status bar with time/weather
  - `Screen`: Swipeable screen system with multiple views
  - `BottomDock`: Navigation dock with screen switching

### Backend Architecture (Node.js + Fastify + Prisma)
- **Runtime**: Node.js TypeScript service compiled to `backend/dist`
- **HTTP Layer**: Fastify routes in `backend/src/routes`
- **Data Layer**: Prisma Client connected to PostgreSQL
- **Plugins**: Database, CORS, and sensible error helpers are registered in `backend/src/plugins`
- **Deployment**: GitHub Actions deploys backend changes from `main` to EC2 and runs `prisma migrate deploy`

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
6. **Photography API**: Fastify + Prisma endpoints for categories and photos

## Build Configuration

### Frontend Build Setup
- **Create React App** with **CRACO** for configuration overrides
- **Tailwind CSS** for styling with custom breakpoints (xs: 320px to 2xl: 1920px)
- **TypeScript** for type safety
- **PostCSS** for CSS processing

### Backend Build Setup
- TypeScript compiles from `backend/src` to `backend/dist`
- Prisma Client must be regenerated after `backend/prisma/schema.prisma` changes
- Production runs `node dist/server.js`
- Environment variables are loaded from `.env` locally and `.env.production` on EC2

### Custom Webpack Configuration
- Source map warnings suppressed for `@mediapipe/tasks-vision`
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
- **Backend routes**: Keep HTTP concerns in `backend/src/routes`
- **Backend services**: Keep Prisma/data mapping logic in `backend/src/services`

### Styling Approach
- **Tailwind-first**: Use Tailwind utilities with custom theme extensions
- **Glass morphism**: Consistent use of backdrop-blur and opacity for UI elements
- **Custom properties**: Leverage CSS custom properties for dynamic theming

### Performance Considerations
- **Conditional loading**: Stagewise components only in development
- **Device detection**: Adjust rendering complexity based on device performance
- **Lazy loading**: Import heavy dependencies dynamically when needed
- **Photography assets**: PostgreSQL stores metadata/paths; static photo files are served separately through `/photos/photography/...`

### Code Patterns
- **TypeScript strict mode**: All components and backend services should be properly typed
- **React Hooks**: Functional components with hooks for state management
- **Custom hooks**: `useResponsive()` for device-aware components
- **Event handling**: Proper cleanup of event listeners in `useEffect`
- **Prisma mapping**: Convert `BigInt` IDs to numbers before returning API responses

## Important Technical Notes

### Photography Data
- The production source of truth for photo metadata is PostgreSQL on AWS EC2.
- `PhotoCategory` and `Photo` in `backend/prisma/schema.prisma` must match the real production table structure.
- Do not add fields to the Prisma `Photo` model unless the production table and migration both include those columns; Prisma selects model fields by default, so mismatches can cause `/api/photos/category/:categoryId` to return 500.
- Current photo paths use `/photos/photography/{category}/thumbnails/{filename}-{full|card}.webp`.
- The card carousel displays `thumbnailPath` and falls back to `filePath`.

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
- Backend: Vitest route tests via `npm test` in `backend`
- Frontend: Jest and React Testing Library via `npm test` in `frontend`
- Production frontend build: `npm run build` in `frontend`
- Known frontend test caveat: the current Jest setup may fail on axios ESM parsing unless Jest transform config is updated

## Deployment Notes
- Pushes to `main` trigger GitHub Actions.
- Backend workflow runs for changes under `backend/**` and deploys to EC2.
- Frontend workflow runs for changes under `frontend/**` and deploys the CRA build to Nginx.
- The backend is served on port `8080` behind Nginx `/api` proxy.

When working on this codebase, prioritize maintaining the desktop metaphor, responsive behavior, and the PostgreSQL-backed photography data contract. Always test changes across relevant device sizes and run the backend build/tests when touching Prisma or API code.
