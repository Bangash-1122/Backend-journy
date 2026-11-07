# VideoHub — Full Stack Video Streaming Platform

A modern, production-ready, YouTube-style video streaming application built with a decoupled monorepo architecture featuring an **Express + MongoDB REST API backend** and a high-performance **React + Vite (JavaScript JSX) frontend**.

---

## 📑 Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Project Structure](#project-structure)
- [Frontend Guide](#frontend-guide)
  - [Tech Stack](#frontend-tech-stack)
  - [Design System & Theme Tokens](#design-system--theme-tokens)
  - [Key Pages & Layouts](#key-pages--layouts)
  - [Client State & Data Fetching](#client-state--data-fetching)
  - [Feedback & Animation Architecture](#feedback--animation-architecture)
  - [Testing Suite](#frontend-testing-suite)
- [Backend Guide](#backend-guide)
  - [Tech Stack](#backend-tech-stack)
  - [Data Models](#data-models)
  - [REST API Endpoints Reference](#rest-api-endpoints-reference)
- [Security & Environment Variables](#security--environment-variables)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Zero-Server Demo Mode (MSW)](#zero-server-demo-mode-msw)
- [Available Scripts](#available-scripts)

---

## Overview & Architecture

VideoHub provides a complete video sharing and creator workflow:
- **Video Management:** Upload (multipart/form-data with progress bar), transcoding and cloud hosting, custom player with theatre mode, fullscreen, and custom controls.
- **Social Engagement:** Optimistic like/dislike interactions, threaded comments with deletion, channel subscriptions, and custom playlist curation.
- **Creator Studio:** Channel metrics (views, subscribers, watch minutes), Recharts analytics with time-range filtering, and video publishing controls.
- **Responsive YouTube Layout:** YouTube-style header, collapsible desktop sidebar (expanded/mini), mobile bottom navigation drawer, and sticky category filters.

```
                      ┌────────────────────────────────────────┐
                      │         VideoHub Client (React)        │
                      │  Zustand • TanStack Query • Tailwind   │
                      └──────────────────┬─────────────────────┘
                                         │
                   HTTP (Axios) / Bearer JWT + Cookies
                                         │
                      ┌──────────────────▼─────────────────────┐
                      │        Node.js / Express 5 API         │
                      │     Auth • Multer • Cloudinary SDK     │
                      └──────────────┬──────────────────┬──────┘
                                     │                  │
                 Mongoose ODM        │                  │ Media Stream
                                     ▼                  ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  MongoDB Atlas   │    │   Cloudinary    │
                       │   Database       │    │  Media Storage  │
                       └──────────────────┘    └─────────────────┘
```

---

## Project Structure

```
Video_Hub/
├── backend/                        # Node.js Express REST API
│   ├── public/temp/                # Temporary disk buffer for uploads
│   ├── src/
│   │   ├── controllers/            # Request handlers (auth, videos, comments, etc.)
│   │   ├── db/                     # MongoDB connection bootstrap
│   │   ├── middlewares/            # JWT auth guard, Multer file upload
│   │   ├── models/                 # Mongoose schemas (User, Video, Like, etc.)
│   │   ├── routes/                 # Express router declarations
│   │   ├── utils/                  # ApiError, ApiResponse, asyncHandler, Cloudinary
│   │   ├── app.js                  # Express middleware and route mounting
│   │   ├── constants.js            # DB name and global constants
│   │   └── index.js                # Server entrypoint
│   └── package.json
│
├── frontend/                       # React 19 + Vite Frontend SPA
│   ├── public/                     # Static assets & MSW mockServiceWorker.js
│   ├── src/
│   │   ├── assets/                 # SVGs and static brand graphics
│   │   ├── components/             # Reusable UI, layout, video, and chart components
│   │   │   ├── channel/            # ChannelHeader, ChannelTabs, SubscribeButton
│   │   │   ├── charts/             # ViewsChart, WatchTimeChart, SubscribersChart
│   │   │   ├── feedback/           # EmptyState, ErrorState, ConfirmDialog
│   │   │   ├── forms/              # TextField, TextAreaField, SelectField, FileDropzone
│   │   │   ├── home/               # HeroCarousel (GSAP timeline animation)
│   │   │   ├── layout/             # Header, Sidebar, MobileBottomNav, CategoryChips
│   │   │   ├── playlist/           # PlaylistCard, PlaylistRow, AddToPlaylistModal
│   │   │   ├── ui/                 # Avatar, Badge, Button, Chip, Modal, Skeleton, Tabs
│   │   │   └── video/              # VideoPlayer, PlayerControls, VideoGrid, UpNextList
│   │   ├── features/               # Domain-specific exports (auth, videos, channels, studio)
│   │   ├── hooks/                  # Custom query and state hooks (useVideos, useTheme, etc.)
│   │   ├── layouts/                # MainLayout, AuthLayout, StudioLayout, SettingsLayout
│   │   ├── lib/                    # Helpers, validators (Zod), formatters, query keys
│   │   ├── mocks/                  # MSW handlers, browser worker, and mock seed data
│   │   ├── pages/                  # Route views (Home, Watch, Studio, Playlists, etc.)
│   │   ├── routes/                 # lazy.jsx, routes.jsx, ProtectedRoute, PublicRoute
│   │   ├── services/               # Axios API endpoints and upload client
│   │   ├── store/                  # Zustand client stores (auth, theme, player, UI)
│   │   ├── tests/                  # Vitest unit and integration test suite
│   │   ├── App.jsx                 # Route tree with Suspense fallback
│   │   ├── index.css               # Tailwind v4 theme variables
│   │   └── main.jsx                # QueryClient, Router, Theme wiring, Sonner mount
│   └── package.json
└── Readme.md                       # Project documentation
```

---

## Frontend Guide

### Frontend Tech Stack

| Layer | Library / Tool | Purpose |
| :--- | :--- | :--- |
| **Framework & Build** | React 19 + Vite | Fast HMR, pure JavaScript JSX architecture (no TypeScript, no Next.js) |
| **Styling** | Tailwind CSS v4 | CSS variable design tokens mapped directly to light and dark themes |
| **Routing** | React Router v7 | Code-split lazy routes, nested layouts, protected/public route guards |
| **Server State** | TanStack Query v5 + Axios | Cache invalidation, optimistic mutations, window focus isolation |
| **Client UI State** | Zustand v5 | Auth session, theme toggle, sidebar layout, player settings, filter state |
| **Forms & Validation** | React Hook Form + Zod | Schema-based validation per form with inline error alerts |
| **Toasts** | Sonner | Non-blocking everyday notifications (success, error, warning, progress) |
| **Confirmations** | SweetAlert2 | Dedicated modal confirmations for irreversible/destructive actions |
| **Animation** | Motion + GSAP | Motion for micro-interactions; GSAP lazy-loaded for Hero carousel |
| **Data Analytics** | Recharts | Responsive Line, Area, and Bar charts for Creator Studio & Channel metrics |
| **Mock API** | MSW (Mock Service Worker) | Zero-server demo capabilities with local seed data |

---

### Design System & Theme Tokens

The UI follows a **dark-first** YouTube design direction with dark surfaces (`#0F0F0F`, `#212121`), clean contrast text (`#F1F1F1`), and a single signature brand red (`#FF0000` / `#CC0000`).

| Token | Dark Theme | Light Theme | Usage |
| :--- | :--- | :--- | :--- |
| `--bg` | `#0F0F0F` | `#FFFFFF` | Page canvas background |
| `--surface` | `#212121` | `#F9F9F9` | Cards, sidebar, modal background |
| `--surface-elevated`| `#272727` | `#FFFFFF` | Dropdowns, popovers, tooltips |
| `--border` | `#3D3D3D` | `#E5E5E5` | Card dividers, input borders |
| `--text` | `#F1F1F1` | `#0F0F0F` | Primary titles and body text |
| `--muted` | `#AAAAAA` | `#606060` | Secondary metadata (views, timestamps) |
| `--brand` | `#FF0000` | `#FF0000` | Primary buttons, active state accents |
| `--brand-soft` | `#3D1A1A` | `#FFE5E5` | Active chips, soft badge accents |

---

### Key Pages & Layouts

1. **Home Feed (`/`):** Full-width 16:7 Hero Carousel (GSAP animation), sticky horizontal category chips, 3–4 column video grid, desktop "Load more" button, and mobile infinite scroll.
2. **Watch Page (`/watch/:videoId`):** Custom HTML5 video player with custom controls, video actions (optimistic Like/Dislike, Share modal, Add-to-Playlist modal), expandable description, comments section, and 360px Up-Next recommendation rail.
3. **Search Page (`/search`):** URL-driven query parameters (`?q=&filter=&sort=&duration=`), 300ms input debounce, channel cards, and video result grids.
4. **Channel Page (`/channel/:channelId`):** Channel banner, avatar, verified badge, subscriber count, and sticky tab bar (`Home`, `Videos`, `Playlists`, `Community`, `About`).
5. **Video Upload (`/upload`):** Drag-and-drop dropzone, Zod-validated metadata form, thumbnail picker, and XHR progress indicator.
6. **Playlists (`/playlists`, `/playlist/:playlistId`):** Playlist card grid, inline creation modal, interactive playlist player with video reorder/removal.
7. **Library (`/library`):** Watch history (with SweetAlert2 Clear History), Watch Later, Liked Videos, and Playlists tabs.
8. **Subscriptions (`/subscriptions`):** Horizontal avatar filter bar and chronological video feed.
9. **Creator Studio (`/studio`, `/studio/videos`, `/studio/analytics`):** Key metrics cards, Recharts analytics (views, watch time, subscribers), and video management data table with visibility toggle and video editing.
10. **Authentication (`/login`, `/register`):** 400px centered form card with Zod schema validation and password toggle.
11. **Profile & Settings (`/profile`, `/settings`):** Account details, channel branding, appearance theme switcher (Dark/Light cards + Reduce Motion toggle), and playback preferences.

---

### Client State & Data Fetching

- **`useAuthStore`:** Stores logged-in user details, access token, and refresh token with local storage persistence.
- **`useThemeStore`:** Manages `'dark' | 'light'` theme and `reduceMotion` preference with `document.documentElement` class synchronisation.
- **`usePlayerStore`:** Tracks playback state, volume, muted flag, playback speed (`0.5x`–`2x`), theatre mode, and autoplay toggle.
- **`useUiStore`:** Tracks responsive sidebar state (expanded/collapsed on desktop, drawer modal on mobile), active dialogs, and offline status.
- **TanStack Query (`@tanstack/react-query`):** Manages server state caching, pagination (`useInfiniteQuery`), and optimistic mutations for like toggles, playlist actions, and comments.

---

### Feedback & Animation Architecture

- **Sonner (`sonner`):** Handles non-blocking notifications mounted at `bottom-right` (duration: 3.5s default, 5s for errors).
- **SweetAlert2 (`sweetalert2`):** Reserved exclusively for destructive and irreversible actions:
  - Deleting a video
  - Deleting a playlist
  - Removing a video from a playlist
  - Clearing watch history
  - Deleting own comments
- **Motion (`motion/react`):** Page fades, card hover scaling (`1.02`), modal scales (`0.96` → `1`), and drawer slides.
- **GSAP (`gsap`):** Lazy-loaded dynamically for the Home page hero carousel sequence to keep the initial application bundle lightweight.

---

### Frontend Testing Suite

Vitest and React Testing Library are configured in `vite.config.js` with JSDOM and `@testing-library/jest-dom`:
- **Unit Tests (`src/tests/unit/`):**
  - `format.test.js`: Validates `formatViews`, `formatDuration`, and `timeAgo`.
  - `validators.test.js`: Validates login, register, upload, playlist, and comment Zod schemas.
  - `components.test.jsx`: Unit tests for `Button`, `Chip`, and `VideoCard`.
- **Integration Tests (`src/tests/integration/`):**
  - `features.test.jsx`: Tests Home page video fetching and rendering via Mock Service Worker (`msw/node`).

---

## Backend Guide

### Backend Tech Stack

- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Web Framework:** Express 5.x
- **Database:** MongoDB via Mongoose 8.x ODM
- **Authentication:** JSON Web Tokens (Access Token + Refresh Token via HTTP-only Cookies and Bearer headers)
- **Password Security:** `bcrypt` (10 salt rounds)
- **Media Upload Pipeline:** `multer` (temporary disk storage buffer) + `cloudinary` (cloud hosting and CDN distribution)
- **Pagination:** `mongoose-aggregate-paginate-v2`
- **Architecture Pattern:** Controller-Service-Model architecture with standardized `ApiResponse` and `ApiError` utilities wrapped in `asyncHandler`.

---

### Data Models

1. **User (`user.model.js`):** `username`, `email`, `fullName`, `avatar`, `coverImage`, `watchHistory[]`, `password` (hashed), `refreshToken`.
2. **Video (`video.model.js`):** `videoFile` (URL), `thumbnail` (URL), `title`, `description`, `duration`, `views`, `isPublished`, `owner`.
3. **Comment (`comment.model.js`):** `content`, `video`, `owner`.
4. **Like (`like.model.js`):** `video`, `comment`, `tweet`, `likedBy`.
5. **Playlist (`playlist.model.js`):** `name`, `description`, `videos[]`, `owner`.
6. **Subscription (`Subscription.model.js`):** `subscriber`, `channel`.
7. **Tweet (`tweet.model.js`):** `content`, `owner`.

---

### REST API Endpoints Reference

All routes are prefixed with `/api/v1`.

#### Authentication & User (`/users`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/users/register` | Register new user (with avatar & cover image) | No |
| `POST` | `/users/login` | Authenticate user & return tokens | No |
| `POST` | `/users/logout` | Clear refresh token & sign out | Yes |
| `POST` | `/users/refresh-token` | Generate new access token from refresh token | No |
| `POST` | `/users/change-password` | Update account password | Yes |
| `GET` | `/users/current-user` | Retrieve authenticated user profile | Yes |
| `PATCH` | `/users/update-account` | Update full name and email | Yes |
| `PATCH` | `/users/avatar` | Upload and replace avatar image | Yes |
| `PATCH` | `/users/cover-image` | Upload and replace channel banner | Yes |
| `GET` | `/users/c/:username` | Retrieve channel profile & subscription stats | Yes |
| `GET` | `/users/watch-history` | Retrieve user video watch history | Yes |

#### Videos (`/videos`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/videos` | Query videos (search, sort, pagination) | No |
| `POST` | `/videos` | Upload video file & thumbnail | Yes |
| `GET` | `/videos/:videoId` | Get video details by ID | No |
| `PATCH` | `/videos/:videoId` | Update video title, description, or thumbnail | Yes |
| `DELETE` | `/videos/:videoId` | Delete video and associated assets | Yes |
| `PATCH` | `/videos/toggle/publish/:videoId` | Toggle video public/private visibility | Yes |

#### Comments (`/comments`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/comments/:videoId` | List comments for a video (paginated) | No |
| `POST` | `/comments/:videoId` | Post a new comment | Yes |
| `PATCH` | `/comments/c/:commentId`| Edit an existing comment | Yes |
| `DELETE` | `/comments/c/:commentId`| Delete comment | Yes |

#### Likes (`/likes`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/likes/toggle/v/:videoId` | Toggle like on a video | Yes |
| `POST` | `/likes/toggle/c/:commentId` | Toggle like on a comment | Yes |
| `POST` | `/likes/toggle/t/:tweetId` | Toggle like on a tweet | Yes |
| `GET` | `/likes/videos` | Retrieve all videos liked by user | Yes |

#### Playlists (`/playlist`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/playlist` | Create a new playlist | Yes |
| `GET` | `/playlist/:playlistId` | Get playlist details & video list | No |
| `PATCH` | `/playlist/:playlistId` | Update playlist title and description | Yes |
| `DELETE` | `/playlist/:playlistId` | Delete playlist | Yes |
| `PATCH` | `/playlist/add/:videoId/:playlistId` | Add video to playlist | Yes |
| `PATCH` | `/playlist/remove/:videoId/:playlistId` | Remove video from playlist | Yes |
| `GET` | `/playlist/user/:userId` | Get all playlists created by a user | Yes |

#### Subscriptions (`/subscriptions`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/subscriptions/c/:channelId` | Toggle subscribe / unsubscribe | Yes |
| `GET` | `/subscriptions/c/:channelId` | Get list of subscribers for a channel | Yes |
| `GET` | `/subscriptions/u/:subscriberId` | Get channels subscribed to by a user | Yes |

#### Dashboard & Creator Metrics (`/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/dashboard/stats` | Channel overview (total views, subscribers, videos, likes) | Yes |
| `GET` | `/dashboard/videos` | Get all videos uploaded by channel | Yes |

#### Community Tweets (`/tweets`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/tweets` | Post a new community tweet | Yes |
| `GET` | `/tweets/user/:userId` | Get tweets published by a channel | No |
| `PATCH` | `/tweets/:tweetId` | Update tweet text | Yes |
| `DELETE` | `/tweets/:tweetId` | Delete tweet | Yes |

---

## Security & Environment Variables

> [!IMPORTANT]
> **Security Notice:** Never commit `.env` files containing production credentials, secret keys, or database passwords to any public or private repository. Always keep `.env` in `.gitignore` and distribute `.env.example` templates.

### Backend Environment Configuration (`backend/.env.example`)

Create a `.env` file inside the `backend/` directory using the following placeholder template:

```env
# Application Server Port
PORT=8000

# Allowed CORS Origin for Frontend
CORS_ORIGIN=http://localhost:5173

# MongoDB Connection String (Atlas or Local)
MONGODB_URI=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER>.mongodb.net

# JWT Access Token Configuration
ACCESS_TOKEN_SECRET=your_super_secret_access_token_key_here
ACCESS_TOKEN_EXPIRY=1d

# JWT Refresh Token Configuration
REFRESH_TOKEN_SECRET=your_super_secret_refresh_token_key_here
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary Storage Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Frontend Environment Configuration (`frontend/.env.example`)

Create a `.env` file inside the `frontend/` directory using the following template:

```env
# Backend Base API Endpoint (or Vite proxy /api/v1)
VITE_API_URL=/api/v1

# Application Name
VITE_APP_NAME=VideoHub

# Maximum Video Upload Size (in MB)
VITE_UPLOAD_MAX_MB=500

# Enable Mock Service Worker (MSW) when running without a backend
VITE_ENABLE_MOCK=false
```

---

## Getting Started

### Prerequisites

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **MongoDB:** A running MongoDB Atlas instance or local MongoDB server

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Fill in your MongoDB connection URI and Cloudinary credentials.

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The server will start listening at `http://localhost:8000`.

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:5173`.

---

### Zero-Server Demo Mode (MSW)

If you want to demo or test the entire frontend UI without running a backend or database:

1. In `frontend/.env`, set:
   ```env
   VITE_ENABLE_MOCK=true
   ```
2. Run `npm run dev` in the `frontend` directory.
3. The frontend will automatically boot Mock Service Worker (`MSW`) and seed videos, channel data, playlists, comments, and analytics so every page and interaction can be demonstrated immediately.

---

## Available Scripts

### Backend (`/backend`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Express API server with `nodemon` and auto-reloading |

### Frontend (`/frontend`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Builds optimized production bundle into `dist/` with code splitting |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs `oxlint` static analysis across the codebase |
| `npm run test` | Runs Vitest test runner in watch mode |
| `npm run test:run` | Executes all unit and integration tests once (CI mode) |
| `npm run test:e2e` | Runs Playwright end-to-end smoke tests |
