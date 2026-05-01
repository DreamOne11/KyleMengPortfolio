# Kyle Meng Portfolio

A full-stack portfolio website with a desktop OS-inspired interface, featuring interactive windows, 3D elements, and a photography showcase.

## Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite** — frontend dev server and production build
- **Tailwind CSS** with custom breakpoints
- **Three.js** / React Three Fiber — 3D model rendering
- **GSAP** — animations and transitions
- **Axios** — API communication

### Backend
- **Fastify** (Node.js) + TypeScript
- **Prisma ORM** — database access and migrations
- **PostgreSQL** — persistent storage
- **@sinclair/typebox** — runtime schema validation

### Deployment
- **AWS EC2** — both frontend and backend
- **Nginx** — static file serving + reverse proxy (`/api` → Node.js)
- **GitHub Actions** — CI/CD pipelines (separate workflows for frontend/backend)
- **systemd** — backend process management

## Project Structure

```
├── frontend/                  # React TypeScript application
│   └── src/
│       ├── components/
│       │   ├── layout/        # DesktopContainer, TopBar, Screen, BottomDock
│       │   ├── screens/       # AboutMe, MyWork, MyNote, Photography screens
│       │   ├── ui/            # CardCarousel, ParticleBackground, LoadingScreen, etc.
│       │   ├── windows/       # FileManager, EmailComposer, ProjectDetailWindow
│       │   ├── icons/         # MacOS-style icon components
│       │   └── models/        # Three.js 3D model components
│       ├── services/          # API service layer (photographyApi.ts)
│       ├── types/             # TypeScript type definitions
│       ├── utils/             # responsive.ts, helper utilities
│       └── data/              # Static data (filesystem simulation)
│
├── backend/                   # Fastify Node.js application
│   └── src/
│       ├── config/            # Environment configuration
│       ├── plugins/           # Fastify plugins (database, cors, sensible)
│       ├── routes/            # HTTP route handlers (photos, health)
│       ├── services/          # Business logic (photoService.ts)
│       └── types/             # API response type schemas
│   └── prisma/
│       ├── schema.prisma      # Database schema (PhotoCategory, Photo)
│       └── migrations/        # SQL migration history
│
├── .github/workflows/
│   ├── deploy-frontend.yml    # Build & deploy React app to EC2
│   └── deploy-backend.yml     # Build, test & deploy Node.js app to EC2
│
└── deployment/                # Server configuration files
```

## Development Setup

### Prerequisites
- Node.js 22+
- PostgreSQL running locally

### Backend
```bash
cd backend
cp .env.example .env        # set DATABASE_URL, PORT, FRONTEND_URL
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm start                   # runs on http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm start                   # runs on http://localhost:3000
```

The dev frontend proxies `/api` requests to `http://localhost:8080`. Set `VITE_API_URL` when you need to override the API base URL.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/photo-categories` | All photo categories with counts |
| GET | `/api/photo-categories/:id` | Single category |
| GET | `/api/photos` | All photos (optional `?page=&size=`) |
| GET | `/api/photos/:id` | Single photo |
| GET | `/api/photos/category/:categoryId` | Photos by category (optional `?page=&size=`) |

## Key Features

- **Desktop OS metaphor** — swipeable screens, draggable/resizable windows, dock navigation
- **Photography showcase** — card carousel with 3D stack effect, folder-based gallery viewer
- **3D interactive avatar** — Three.js model with performance-aware rendering
- **Particle background** — GPU-optimized, adapts to device performance level
- **Responsive scaling** — scales from 320px mobile to 1920px desktop using a single base design
- **Onboarding tutorial** — first-visit walkthrough

## Deployment

Both services deploy automatically on push to `main` when their respective paths change (`frontend/**` or `backend/**`). The backend runs under systemd at `/opt/kyle-portfolio` and is proxied through Nginx.

---

© 2025 Kyle Meng. All rights reserved.
