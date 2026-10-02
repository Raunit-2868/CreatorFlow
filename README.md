# CreatorFlow — Next-Generation Influencer-Brand Collaboration Platform

CreatorFlow is an end-to-end marketplace and campaign management workspace connecting top creators with elite brands. Built with the **CreatorFlow Unified Light Design System**, the platform delivers an editorial, high-clarity user experience across all portals.

---

## 1. Project Overview & Design Philosophy

- **Unified Light Aesthetic**: Single cohesive light design system across all roles (`#F5F2EB` Warm Ivory canvas, `#FAF9F6` Soft Cream surfaces, `#2B2B2B` Soft Charcoal primary actions, `#B8955A` Champagne Gold accents).
- **Zero Role-Specific Themes**: Creators, Brands, and Administrators share the exact same refined editorial palette.
- **Strict Visual Rules**: No dark backgrounds, no Midnight Navy, no neon glows, and no glassmorphism.

---

## 2. Technology Stack

### Frontend
- **Framework**: React 18 + Vite (SPA)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS + custom tokens
- **Component Primitives**: shadcn/ui + Radix UI
- **Routing**: React Router v6
- **Typography**: Manrope (Headings) & Inter (Body/UI)
- **Icons**: Google Material Symbols Outlined
- **Testing**: Vitest + React Testing Library + jsdom

### Backend
- **Framework**: Node.js + Express
- **Language**: TypeScript
- **Database**: MongoDB (Mongoose ODM)
- **Authentication Foundation**: JWT + bcryptjs
- **Realtime Foundation**: Socket.IO
- **Security**: Helmet, CORS, centralized error handling
- **Testing**: Vitest + Supertest

---

## 3. Project Structure

```
CreatorFlow/
├── client/                     # React + Vite frontend SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # 26 reusable UI primitives (Button, Card, Input, Table, etc.)
│   │   │   ├── layout/         # AppShell, Navbar, Sidebar, Breadcrumbs, PageContainer
│   │   │   └── navigation/     # Role-based navigation configs
│   │   ├── pages/
│   │   │   ├── public/         # LandingPage, SignInPage, RegisterPage
│   │   │   ├── influencer/     # Creator portal pages
│   │   │   ├── brand/          # Brand portal pages
│   │   │   ├── admin/          # Admin portal pages
│   │   │   └── shared/         # Reusable placeholder shells
│   │   ├── types/              # Frontend TypeScript definitions
│   │   ├── App.tsx             # Route declarations
│   │   ├── main.tsx            # Entrypoint
│   │   └── index.css           # Design tokens & styles
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── server/                     # Node.js + Express REST API
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection
│   │   ├── middleware/         # 404 handler, error handler, logger
│   │   ├── models/             # User Mongoose model
│   │   ├── routes/             # /api/v1 routes (health, auth, campaigns, etc.)
│   │   ├── types/              # Backend interfaces & enums
│   │   ├── app.ts              # Express application factory
│   │   └── server.ts           # HTTP & Socket.IO server startup
│   └── tests/                  # Supertest API test suite
│
├── docs/
│   └── STITCH_DESIGN_REFERENCE.md  # Approved Design System Source of Truth
├── .env.example                # Sample environment variables
├── .gitignore
├── README.md
└── package.json                # Monorepo workspace configuration
```

---

## 4. Development Setup

### Prerequisites
- **Node.js**: v18+ (tested with v20+)
- **npm**: v9+
- **MongoDB**: Local or Atlas instance (optional for Phase 1 shell testing)

### Installation
Clone or navigate to the repository root and install dependencies for all workspaces:
```bash
npm install
```

---

## 5. Environment Variables

Copy `.env.example` to `.env` in the root:
```bash
cp .env.example .env
```

| Variable | Description | Default |
|---|---|---|
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Runtime environment | `development` |
| `CLIENT_URL` | Frontend client URL (CORS) | `http://localhost:5173` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/creatorflow` |
| `JWT_SECRET` | Secret key for access tokens | Development placeholder |
| `JWT_REFRESH_SECRET` | Secret key for refresh tokens | Development placeholder |

---

## 6. Running the Application

### Option A: Run Both Client & Server Concurrently
```bash
npm run dev
```

### Option B: Run Workspaces Individually
```bash
# Terminal 1 — Backend API Server (Port 5000)
npm run dev:server

# Terminal 2 — Frontend Client (Port 5173)
npm run dev:client
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 7. Running Tests

Run test suites across both server and client:
```bash
# Run all tests (Server Supertest + Client Vitest)
npm run test

# Run tests individually
npm run test --workspace=server
npm run test --workspace=client
```

---

## 8. TypeScript & Code Quality Checks

```bash
# Run typechecking across workspaces
npm run typecheck
```

---

## 9. API Endpoints (Phase 1 Baseline)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/health` | Healthcheck (`{"success": true, "message": "CreatorFlow API is running"}`) |
| `GET` | `/api/v1/campaigns` | Campaigns API endpoint |
| `GET` | `/api/v1/influencers` | Influencers API endpoint |
| `GET` | `/api/v1/brands` | Brands API endpoint |
| `GET` | `/api/v1/applications` | Applications API endpoint |
| `GET` | `/api/v1/collaborations` | Collaborations API endpoint |
| `GET` | `/api/v1/messages` | Messages API endpoint |
| `GET` | `/api/v1/notifications`| Notifications API endpoint |
| `GET` | `/api/v1/analytics` | Analytics API endpoint |
| `GET` | `/api/v1/admin` | Admin API endpoint |
| `GET` | `/api/v1/ai` | AI engine endpoint |
