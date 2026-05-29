# Journalist — Trading Journal

A full-stack trading journal for tracking trades across Crypto, Futures, Forex, Equities, and Indices. Features analytics dashboards, equity curves, risk metrics, and OTP-based password recovery.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts, Lucide React  
**Backend:** Express 5, SQLite3, JWT, BcryptJS, Nodemailer  
**Runtime:** Node.js

## Features

- **Multi-account support** — Track separate trading accounts with distinct metrics
- **Trade logging** — 3-step modal: metrics, strategy, psychology with emotional state tracking
- **Analytics dashboards** — R-Ratio scatter plots, win/loss breakdowns, tag performance matrix
- **Equity curves** — Cumulative PnL chart and calendar heatmap
- **Timeline view** — Chronological trade feed with notes, tags, screenshots
- **Command palette** — `Ctrl+K` quick navigation and actions
- **Dark/light mode** — Persistent theme toggle
- **Password recovery** — OTP-based reset via email (Nodemailer)
- **Guest mode** — Sandbox with mock trades, no login required

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

### Installation

```bash
npm install
```

### Environment

Create a `.env` file in the project root:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=30d
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
APP_URL=http://localhost:5173
```

### Development

Starts both Vite frontend and Express backend concurrently:

```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

### Build

```bash
npm run build
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
├── context/AppContext.tsx    # Global state (auth, trades, accounts, theme, modals)
├── components/               # Reusable UI components
│   ├── Sidebar.tsx           # Collapsible navigation
│   ├── Header.tsx            # Top bar with actions
│   ├── CommandPalette.tsx    # ⌘K command search
│   ├── NewTradeModal.tsx     # 3-step trade creation wizard
│   ├── EditTradeModal.tsx    # Edit trade form
│   ├── DeleteConfirmModal.tsx
│   ├── NewAccountModal.tsx   # Create new account
│   ├── ScreenshotModal.tsx   # Fullscreen image lightbox
│   ├── CursorFollower.tsx    # Decorative cursor animation
│   ├── LogoIcon.tsx          # Theme-aware logo
│   └── Skeleton.tsx          # Loading skeleton
├── screens/
│   ├── LandingPage.tsx       # Marketing page
│   ├── AuthPage.tsx          # Login / Register
│   ├── ForgotPassword.tsx    # Email → OTP → new password
│   ├── ResetPassword.tsx     # Token-based reset
│   ├── Dashboard.tsx         # Stats, equity curve, calendar, trades
│   ├── Analytics.tsx         # Scatter, donut, tag matrix
│   ├── Timeline.tsx          # Chronological trade feed
│   └── TradeDetail.tsx       # Single trade detail view
├── lib/api.ts                # API client (fetch-based)
├── data/mockTrades.ts        # Seed data for guest mode
└── types.ts                  # Shared TypeScript types

server/
└── index.js                  # Express server, SQLite, JWT auth, email
```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Verify token |
| POST | `/api/auth/forgot-password` | No | Request OTP |
| POST | `/api/auth/reset-password` | No | Reset with OTP |
| POST | `/api/auth/change-password` | Yes | Change password |
| GET | `/api/accounts` | Yes | List accounts |
| POST | `/api/accounts` | Yes | Create account |
| DELETE | `/api/accounts/:id` | Yes | Delete account |
| GET | `/api/trades` | Yes | List trades |
| POST | `/api/trades` | Yes | Create trade |
| PUT | `/api/trades/:id` | Yes | Update trade |
| DELETE | `/api/trades/:id` | Yes | Delete trade |

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT-based authentication with configurable expiry
- `.env` and `database.sqlite` excluded from version control via `.gitignore`
- No secrets in source code
