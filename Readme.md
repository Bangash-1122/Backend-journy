# VideoHub — Full Stack Video Streaming Platform

[![React](https://img.shields.io/badge/Frontend-React%2019%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS%204-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Backend-Express%205-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Cloudinary](https://img.shields.io/badge/Media-Cloudinary%20CDN-3448C5?logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Tests](https://img.shields.io/badge/Tests-Vitest%20%26%20Node%20Runner-passing-success)]()

A high-performance, production-ready, YouTube-style video sharing and creator platform built with a decoupled monorepo architecture featuring an **Express 5 + MongoDB REST API backend** and a responsive **React 19 + Vite (pure JavaScript JSX) frontend**.

---

## 📑 Table of Contents

- [Overview & Architecture](#overview--architecture)
- [Monorepo Directory Structure](#monorepo-directory-structure)
- [Frontend Architecture & Guide](#frontend-architecture--guide)
  - [Tech Stack](#frontend-tech-stack)
  - [Design System & Theme Tokens](#design-system--theme-tokens)
  - [Key Pages & User Flows](#key-pages--user-flows)
  - [Frontend Services Layer (8 Services)](#frontend-services-layer)
  - [State Management & Data Fetching](#state-management--data-fetching)
  - [Notifications & Animation Architecture](#notifications--animation-architecture)
  - [Testing Suite](#frontend-testing-suite)
- [Backend Architecture & Guide](#backend-architecture--guide)
  - [Tech Stack](#backend-tech-stack)
  - [Data Models & Schema Design](#data-models--schema-design)
  - [REST API Endpoints Reference](#rest-api-endpoints-reference)
  - [Security & Architecture Hardening](#security--architecture-hardening)
  - [Backend Testing Suite](#backend-testing-suite)
- [Security & Environment Variables](#security--environment-variables)
  - [Backend Environment Template](#backend-environment-configuration-backedenvexample)
  - [Frontend Environment Template](#frontend-environment-configuration-frontendenvexample)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Zero-Server Demo Mode (MSW)](#zero-server-demo-mode-msw)
- [Available Scripts Reference](#available-scripts-reference)

---

## Overview & Architecture

VideoHub provides a comprehensive end-to-end video streaming and creator ecosystem:
- **Video Ingestion & Playback:** Multipart/form-data upload pipeline with byte progress tracking, Cloudinary video and thumbnail transcoding, automatic cleanup of superseded media assets, and custom HTML5 video player with fullscreen, theatre mode, autoplay, and adjustable playback speeds (`0.5x`–`2x`).
- **Social & Engagement Engine:** Real-time like/unlike interactions with structured boolean flags, threaded video comments with ownership checks, one-click channel subscriptions with live subscriber counting, and custom playlist curation.
- **Creator Studio:** Real-time channel analytics (`totalVideos`, `totalVideoViews`, `totalSubscribers`, `totalLikeCount`), interactive Recharts graphs across selectable date windows (`7D`, `28D`, `90D`), and video management table with privacy toggles (Public/Private) and inline metadata editing.
- **Responsive Dark-First UI:** Responsive YouTube layout with collapsible desktop sidebar (expanded/compact rail), mobile bottom navigation drawer, sticky category chips, and instant dark/light theme switching.

```
                      ┌────────────────────────────────────────┐
                      │        VideoHub Client (React 19)      │
                      │  Zustand • TanStack Query • Tailwind   │
                      └──────────────────┬─────────────────────┘
                                         │
                    HTTP (Axios) / Bearer JWT + Cookies
                    [AbortSignal Cancellation & Auto-Refresh]
                                         │
                      ┌──────────────────▼─────────────────────┐
                      │        Node.js / Express 5 API         │
                      │   Auth Guard • Multer • Cloudinary SDK │
                      └──────────────┬──────────────────┬──────┘
                                     │                  │
                 Mongoose 8 ODM      │                  │ Media Stream / Transcode
                                     ▼                  ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │  MongoDB Atlas   │    │   Cloudinary    │
                       │   Database       │    │  Media Storage  │
                       └──────────────────┘    └─────────────────┘
```

---

## Monorepo Directory Structure

```
Video_Hub/
├── .gitignore                      # Top-level gitignore (protects secrets, build, temp)
├── Readme.md                       # Complete platform documentation
│
├── backend/                        # Express 5 REST API Backend
│   ├── public/temp/                # Temporary disk buffer for multipart uploads
│   ├── src/
│   │   ├── controllers/            # Request handlers (auth, videos, comments, etc.)
│   │   ├── db/                     # MongoDB connection bootstrap
│   │   ├── middlewares/            # JWT auth guard, Multer file upload
│   │   ├── models/                 # Mongoose schemas (user, video, like, comment, etc.)
│   │   ├── routes/                 # Express router declarations
│   │   ├── tests/                  # Node.js built-in test suite (backend.test.js)
│   │   ├── utils/                  # ApiError, ApiResponse, asyncHandler, cloudinary
│   │   ├── app.js                  # Express middleware, CORS, error handling
│   │   ├── constants.js            # DB name and global constants
│   │   └── index.js                # Server entrypoint
│   └── package.json
│
└── frontend/                       # React 19 + Vite Frontend SPA
    ├── public/                     # Static assets & MSW mockServiceWorker.js
    ├── scripts/                    # Build scripts (patch-tailwind.js for Tailwind 4)
    ├── src/
    │   ├── assets/                 # SVGs and static brand graphics
    │   ├── components/             # Modular UI components
    │   │   ├── channel/            # ChannelHeader, ChannelTabs, SubscribeButton
    │   │   ├── charts/             # ViewsChart, WatchTimeChart, SubscribersChart
    │   │   ├── feedback/           # EmptyState, ErrorState, ConfirmDialog
    │   │   ├── forms/              # TextField, TextAreaField, SelectField, FileDropzone
    │   │   ├── home/               # HeroCarousel (GSAP timeline animation)
    │   │   ├── layout/             # Header, Sidebar, MobileBottomNav, CategoryChips
    │   │   ├── playlist/           # PlaylistCard, PlaylistRow, AddToPlaylistModal
    │   │   ├── ui/                 # Avatar, Badge, Button, Chip, Modal, Skeleton, Tabs
    │   │   └── video/              # VideoPlayer, PlayerControls, VideoGrid, UpNextList
    │   ├── features/               # Domain-specific exports (auth, videos, channels, studio)
    │   ├── hooks/                  # TanStack Query & state hooks (useVideos, useChannel, etc.)
    │   ├── layouts/                # MainLayout, AuthLayout, StudioLayout, SettingsLayout
    │   ├── lib/                    # Adapters, validators (Zod), formatters, queryKeys
    │   ├── mocks/                  # MSW handlers, browser worker, seed data
    │   ├── pages/                  # Route views (Home, Watch, Studio, Playlists, etc.)
    │   ├── routes/                 # Code-split routes (lazy.jsx, ProtectedRoute, PublicRoute)
    │   ├── services/               # 8 centralized Axios services + upload client
    │   ├── store/                  # Zustand client stores (auth, theme, player, UI)
    │   ├── tests/                  # Vitest unit & integration tests
    │   ├── App.jsx                 # Route tree with Suspense fallback
    │   ├── index.css               # Tailwind CSS 4 theme design tokens
    │   └── main.jsx                # App initialization & MSW service worker bootstrap
    └── package.json
```

---

## Frontend Architecture & Guide

### Frontend Tech Stack

| Layer | Library / Tool | Implementation Purpose |
| :--- | :--- | :--- |
| **Framework & Build** | React 19 + Vite | Ultra-fast HMR, pure JavaScript JSX architecture (no TypeScript, no Next.js overhead) |
| **Styling** | Tailwind CSS v4 | CSS variable design tokens mapped directly to light and dark themes |
| **Routing** | React Router v7 | Code-split lazy routes, nested layouts, protected/public route guards |
| **Server State** | TanStack Query v5 + Axios | Cache invalidation, optimistic updates, request cancellation with `AbortSignal` |
| **Client UI State** | Zustand v5 | Lightweight persisted client stores (auth, theme, player, UI drawers) |
| **Forms & Validation** | React Hook Form + Zod | Schema-based validation per form with accessible inline error alerts |
| **Toasts** | Sonner | Non-blocking everyday notifications (success, error, warning, progress) |
| **Confirmations** | SweetAlert2 | Dedicated modal confirmations for destructive/irreversible actions |
| **Animation** | Motion + GSAP | Motion for micro-interactions; GSAP lazy-loaded for Hero carousel |
| **Data Analytics** | Recharts | Responsive Area, Line, and Bar charts for Creator Studio metrics |
| **Mock API** | MSW (Mock Service Worker) | Full zero-server demo mode matching real backend API contracts |

---

### Design System & Theme Tokens

The design follows a **dark-first** YouTube aesthetic with deep surfaces (`#0F0F0F`, `#212121`), clean contrast text (`#F1F1F1`), and signature brand red (`#FF0000`).

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

### Key Pages & User Flows

1. **Home Feed (`/`):** Full-width 16:7 Hero Carousel (GSAP animated), sticky horizontal category chips, 3–4 column video grid, desktop "Load more" button, and mobile infinite scroll.
2. **Watch Page (`/watch/:videoId`):** Custom HTML5 video player, like/dislike toggle, share modal, add-to-playlist modal, expandable description, comment section, and 360px up-next recommendation rail.
3. **Search Page (`/search`):** Query parameter synchronization (`?q=&filter=&sort=`), 300ms input debounce, channel cards, and video result grids.
4. **Channel Page (`/channel/:username`):** Banner, avatar, subscriber count, and sticky tab bar (`Home`, `Videos`, `Playlists`, `Community`, `About`).
5. **Video Upload (`/upload`):** Drag-and-drop dropzone, Zod-validated metadata, thumbnail selector, upload byte progress bar, and server transcoding indicator.
6. **Playlists (`/playlists`, `/playlist/:playlistId`):** Playlist grid, creation modal, interactive playlist player with video reorder/removal.
7. **Library (`/library`):** Watch history, Watch Later, Liked Videos, and Playlists.
8. **Subscriptions (`/subscriptions`):** Horizontal channel avatar filter bar and chronological feed.
9. **Creator Studio (`/studio`, `/studio/videos`, `/studio/analytics`):** Real-time metrics cards, Recharts time-series charts (`7D`, `28D`, `90D`), and video data table with public/private toggle and metadata editor.
10. **Authentication (`/login`, `/register`):** 400px centered form card with Zod schema validation and password toggle.
11. **Profile & Settings (`/profile`, `/settings`):** Account info, appearance theme switcher (Dark/Light + Reduce Motion toggle), and playback settings.

---

### Frontend Services Layer

All API operations are isolated in 8 dedicated service modules in `frontend/src/services/`:

1. **`api.js`:** Centralized Axios instance with timeout, base URL configuration, credentials forwarding, Bearer token injection, request cancellation signal propagation, normalized error transformations, and token-refresh interceptor guarded against infinite loops (`/users/refresh-token`).
2. **`auth.service.js`:** Handles `registerUser`, `loginUser`, `logoutUser`, `fetchCurrentUser`, `updateAccount`, `changePassword`, `updateAvatar`, `updateCoverImage`, `fetchChannel`, and `fetchWatchHistory`.
3. **`videos.service.js`:** Handles `fetchVideos`, `fetchVideoById`, `updateVideo`, `deleteVideo`, `togglePublish`, `toggleVideoLike` (structured `{ isLiked: boolean }`), and `fetchLikedVideos`.
4. **`channels.service.js`:** Handles `getChannelByUsername`, `getChannelVideos`, `toggleSubscription` (structured `{ isSubscribed: boolean }`), `getSubscribedChannels`, `getChannelTweets`, and `createTweet`.
5. **`playlists.service.js`:** Handles `fetchUserPlaylists`, `fetchPlaylist`, `createPlaylist`, `updatePlaylist`, `deletePlaylist`, `addVideoToPlaylist`, and `removeVideoFromPlaylist`. **Never hides server errors behind silent local storage fallbacks.**
6. **`comments.service.js`:** Handles `fetchComments`, `addComment`, `updateComment`, `deleteComment`, and `toggleCommentLike` (structured `{ isLiked: boolean }`).
7. **`upload.service.js`:** Handles multipart video upload with XHR upload progress reporting and server processing state distinction.
8. **`studio.service.js`:** Handles `fetchStudioStats`, `fetchStudioVideos`, and `fetchStudioAnalytics`.

---

### State Management & Data Fetching

- **`useAuthStore`:** Stores logged-in user profile, access token, refresh token, and rehydration state with `localStorage` persistence.
- **`useThemeStore`:** Manages `'dark' | 'light'` theme and `reduceMotion` preference with `document.documentElement` class synchronisation.
- **`usePlayerStore`:** Controls playback state, volume, muted flag, playback speed (`0.5x`–`2x`), theatre mode, and autoplay toggle.
- **`useUiStore`:** Tracks responsive sidebar state (expanded/collapsed on desktop, drawer modal on mobile) and modal states.
- **TanStack Query:** Manages server cache, pagination (`useInfiniteQuery`), and precise cache invalidations:
  - `useAddToPlaylist`: Invalidates both user playlists (`queryKeys.playlists.mine(userId)`) and playlist details (`queryKeys.playlists.detail(playlistId)`).
  - `useToggleLike`: Invalidates video detail (`queryKeys.videos.detail(id)`) and liked videos library (`queryKeys.library.liked`).

---

### Notifications & Animation Architecture

- **Sonner (`sonner`):** Lightweight toast alerts mounted at `bottom-right` for everyday notifications (duration: 3.5s default, 5s for errors).
- **SweetAlert2 (`sweetalert2`):** Reserved exclusively for destructive and irreversible actions:
  - Deleting a video
  - Deleting a playlist
  - Removing a video from a playlist
  - Clearing watch history
  - Deleting own comments
- **Motion (`motion/react`):** Micro-interactions: page cross-fades, card hover scaling (`1.02`), modal entry scale (`0.96` → `1`), and drawer slides.
- **GSAP (`gsap`):** Lazy-loaded dynamically on the Home page hero carousel sequence to keep the initial application bundle lightweight.

---

### Frontend Testing Suite

Vitest and React Testing Library are configured in `vite.config.js` with JSDOM:
- **Unit Tests (`src/tests/unit/`):**
  - `format.test.js`: Validates `formatViews`, `formatDuration`, and `timeAgo`.
  - `validators.test.js`: Validates login, register, upload, playlist, and comment Zod schemas.
  - `components.test.jsx`: Unit tests for `Button`, `Chip`, and `VideoCard`.
  - `services.test.js`: Validates structured boolean response handling (`isLiked`, `isSubscribed`), shorts/recommendations mapping, playlist error propagation, and comment author fallback mapping.
  - `optimistic.test.jsx`: Verifies TanStack Query optimistic UI mutations and cache rollback on server failure for likes, comments, and subscriptions.
- **Integration Tests (`src/tests/integration/`):**
  - `features.test.jsx`: Tests Home page video fetching and rendering via Mock Service Worker (`msw/node`).

All 24 frontend tests pass with 100% test suite reliability.

Run frontend tests via:
```bash
cd frontend
npm run test:run
```

---

## Backend Architecture & Guide

### Backend Tech Stack

- **Runtime:** Node.js (ES Modules, `"type": "module"`)
- **Web Framework:** Express 5.x
- **Database:** MongoDB via Mongoose 8.x ODM
- **Authentication:** JSON Web Tokens (Access Token + Refresh Token via HTTP-only Cookies and Bearer headers)
- **Password Security:** `bcrypt` (10 salt rounds)
- **Media Upload Pipeline:** `multer` (temporary disk buffer) + `cloudinary` (cloud hosting and CDN distribution)
- **Pagination:** `mongoose-aggregate-paginate-v2`
- **Architecture Pattern:** Controller-Service-Model architecture with standardized `ApiResponse` and `ApiError` utilities wrapped in `asyncHandler`.

---

### Data Models & Schema Design

1. **User (`user.model.js`):** `username`, `email`, `fullName`, `avatar`, `coverImage`, `watchHistory[]`, `password` (hashed), `refreshToken`.
2. **Video (`video.model.js`):** `videoFile` (URL), `thumbnail` (URL), `title`, `description`, `duration`, `views`, `isPublished`, `owner`.
3. **Comment (`comment.model.js`):** `content`, `video`, `owner`.
4. **Like (`like.model.js`):** `video`, `comment`, `tweet`, `likedBy`. Compound unique indexes prevent duplicate likes.
5. **Playlist (`playlist.model.js`):** `name`, `description`, `videos[]`, `owner`.
6. **Subscription (`subscription.model.js`):** `subscriber`, `channel`. Compound unique index prevents duplicate subscriptions.
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
| `PATCH` | `/users/avatar` | Upload and replace avatar image (deletes old asset) | Yes |
| `PATCH` | `/users/cover-image` | Upload and replace channel banner (deletes old asset) | Yes |
| `GET` | `/users/c/:username` | Retrieve channel profile & subscription stats | Yes |
| `GET` | `/users/watch-history` | Retrieve user video watch history | Yes |

#### Videos (`/videos`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/videos` | Query videos (search, sort, pagination) | No |
| `GET` | `/videos/feed/shorts` | Paginated YouTube Shorts feed (`aspectRatio: '9:16'`, duration <= 60s) | No |
| `GET` | `/videos/feed/recommendations` | Multi-signal recommendations (view count, recency, category matching) | No |
| `GET` | `/videos/related/:videoId` | Content-based related video recommendations | No |
| `POST` | `/videos` | Upload video file & thumbnail | Yes |
| `GET` | `/videos/:videoId` | Get video details by ID | No |
| `PATCH` | `/videos/:videoId` | Update video title, description, or thumbnail | Yes |
| `DELETE` | `/videos/:videoId` | Delete video and associated Cloudinary assets | Yes |
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
| `POST` | `/likes/toggle/v/:videoId` | Toggle like on a video (returns `{ isLiked }`) | Yes |
| `POST` | `/likes/toggle/c/:commentId` | Toggle like on a comment (returns `{ isLiked }`) | Yes |
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
| `POST` | `/subscriptions/c/:channelId` | Toggle subscribe / unsubscribe (returns `{ isSubscribed }`) | Yes |
| `GET` | `/subscriptions/c/:channelId` | Get list of subscribers for a channel | Yes |
| `GET` | `/subscriptions/u/:subscriberId` | Get channels subscribed to by a user | Yes |

#### Dashboard & Creator Metrics (`/dashboard`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `GET` | `/dashboard/stats/:channelId` | Channel overview (total views, subscribers, videos, likes) | Yes |
| `GET` | `/dashboard/videos/:channelId`| Get videos uploaded by channel (protects private drafts) | Yes |

#### Community Tweets (`/tweets`)
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/tweets` | Post a new community tweet (owner derived from session) | Yes |
| `GET` | `/tweets/user/:userId` | Get tweets published by a channel | No |
| `PATCH` | `/tweets/:tweetId` | Update tweet text (ownership enforced) | Yes |
| `DELETE` | `/tweets/:tweetId` | Delete tweet (ownership enforced) | Yes |

---

### Security & Architecture Hardening

- **Cookie Security:** Refresh and access tokens use `httpOnly: true` and `secure: process.env.NODE_ENV === "production"` to ensure HTTPS protection in production while remaining local-development friendly.
- **Orphan Asset Prevention:** `deleteFromCloudinary` helper automatically deletes superseded avatar images, cover photos, thumbnails, and deleted videos from Cloudinary storage to prevent storage leaks.
- **IDOR Protection:** Ingestion of user identity across sensitive mutations (creating tweets, editing comments, toggling playlists) derives `owner` directly from `req.user._id`, preventing Insecure Direct Object References.
- **Centralized Error Handling:** Global Express error middleware intercepts all unhandled errors and instances of `ApiError`, producing standard `{ success: false, statusCode, message, errors }` JSON responses.
- **Double-Pagination Elimination:** Video queries using `Video.aggregatePaginate()` pass raw pipelines without manual `.skip()` and `.limit()`, eliminating pagination offsets conflicts.

---

### Backend Testing Suite

Built-in Node.js test runner verifies backend core utilities and router configurations:
```bash
cd backend
npm test
```
Tests validate:
- `ApiResponse` fields, HTTP status codes, and success boolean flags.
- `ApiError` code, message, error array, and stack formatting.
- Express app routing registration across all 9 route modules.

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

## Available Scripts Reference

### Backend (`/backend`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the Express API server with `nodemon` and auto-reloading |
| `npm test` | Runs the Node.js test runner against `src/tests/backend.test.js` |

### Frontend (`/frontend`)

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Vite development server at `http://localhost:5173` |
| `npm run build` | Builds optimized production bundle into `dist/` with code splitting |
| `npm run preview` | Previews the production build locally |
| `npm run lint` | Runs `oxlint` static analysis across the codebase |
| `npm run test` | Runs Vitest test runner in interactive watch mode |
| `npm run test:run` | Executes all unit and integration tests once (CI mode) |
| `npm run test:e2e` | Runs Playwright end-to-end smoke tests |
