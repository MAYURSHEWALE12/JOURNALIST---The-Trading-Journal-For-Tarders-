# Journalist — Trading Journal

A premium full-stack trading journal for tracking trades across Crypto, Futures, Forex, Equities, and Indices. Features a suite of analytical tools, multi-account management, and a polished dark-mode UI.

---

## Tech Stack

**Frontend:** React 19, TypeScript, Vite 8, Tailwind CSS v4, Recharts, Lucide React, React Router v7  
**Backend:** Express 5, SQLite3, JWT, BcryptJS, Nodemailer  
**Database:** SQLite (local) / Supabase (cloud)

---

## Features

### Trade Management
- **Multi-account support** — Track separate trading accounts (cash, margin, futures) with independent metrics
- **3-step trade logging** — Wizard-style modal: metrics → strategy → psychology
- **Edit & delete** — Full CRUD with confirmation and bulk delete on Timeline
- **Tag system** — Custom tags for trade categorization and filtering
- **Screenshot attachments** — Upload setup screenshots per trade

### Analytics & Insights
- **R-Ratio scatter plot** — Planned vs realized R visualization
- **Win/Loss donut chart** — Outcome distribution with win rate overlay
- **Tag performance matrix** — Win rate breakdown by tag
- **Daily calendar heatmap** — Color-coded PnL per day with month aggregates
- **Equity curves** — Cumulative PnL timeline
- **KPI dashboard** — Win rate, profit factor, average PnL, best/worst assets
- **Date range filtering** — Filter analytics by custom date range

### Journaling
- **Day notes** — Add notes to any calendar day (even non-trading days) to log market observations or explain why you avoided trades
- **Timeline feed** — Chronological scrollable view with notes, tags, screenshots, and emotional state
- **Emotional state tracking** — Log mindset at time of trade

### User Experience
- **Dark/Light mode** — Persistent theme with system preference detection
- **Command palette** — `Ctrl+K` quick navigation and actions
- **Guest mode** — Sandbox with mock trades, no login required
- **Responsive design** — Mobile-optimized with iOS-style bottom sheets
- **Export** — Colored Excel (.xls) with green/red rows and summary header

### Authentication
- **Register / Login** — Email-based auth with JWT
- **Password recovery** — OTP-based reset via email (Nodemailer)
- **Profile management** — Update username, avatar, bio, social handles

---

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

---

## Project Structure

```
src/
├── context/                    # React context providers
│   ├── AppContext.tsx           # Composite provider (all sub-contexts)
│   ├── UIContext.tsx            # Theme, sidebar, command palette, calendar nav
│   ├── AuthContext.tsx          # User, login/register, profile, password reset
│   ├── AccountContext.tsx       # Accounts CRUD, active account management
│   ├── TradeContext.tsx         # Trades CRUD, filters, tags, modal state
│   └── AnalyticsContext.tsx     # Computed stats, equity curve, calendar days
├── components/                  # Reusable UI components
│   ├── Sidebar.tsx              # Collapsible navigation
│   ├── Header.tsx               # Top bar with actions
│   ├── CommandPalette.tsx       # Ctrl+K command search
│   ├── NewTradeModal.tsx        # 3-step trade creation wizard
│   ├── EditTradeModal.tsx       # Edit trade form
│   ├── DeleteConfirmModal.tsx   # Delete confirmation dialog
│   ├── NewAccountModal.tsx      # Create new account
│   ├── ScreenshotModal.tsx      # Fullscreen image lightbox
│   ├── CursorFollower.tsx       # Decorative cursor animation
│   ├── LogoIcon.tsx             # Theme-aware logo
│   ├── KpiDashboard.tsx         # Key performance indicators
│   ├── PremiumPnLChart.tsx      # Equity curve chart
│   ├── JournalistScore.tsx      # Journalist scoring component
│   └── Skeleton.tsx             # Loading skeletons
├── screens/                     # Page-level components
│   ├── LandingPage.tsx          # Marketing / landing page
│   ├── AuthPage.tsx             # Login / Register
│   ├── ForgotPassword.tsx       # Email → OTP → new password
│   ├── ResetPassword.tsx        # Token-based password reset
│   ├── Dashboard.tsx            # Stats, equity curve, calendar, trade cards
│   ├── Analytics.tsx            # Scatter, donut, tag matrix, date range
│   ├── Calendar.tsx             # Monthly heatmap with day notes
│   ├── Timeline.tsx             # Chronological trade feed with bulk delete
│   └── TradeDetail.tsx          # Single trade detail view
├── lib/
│   ├── api.ts                   # API client (Express + Supabase)
│   ├── supabase.ts              # Supabase client init
│   ├── pdfExporter.ts           # PDF report generation (jsPDF)
│   ├── excelExporter.ts         # Colored Excel export (SpreadsheetML)
│   └── journalistScore.ts       # Scoring algorithm
├── data/mockTrades.ts           # Seed data for guest mode
└── types.ts                     # Shared TypeScript types

server/
└── index.js                     # Express server, SQLite, JWT, email
```

---

## API Endpoints

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| GET | `/api/auth/me` | Yes | Verify token & get profile |
| POST | `/api/auth/forgot-password` | No | Request OTP via email |
| POST | `/api/auth/reset-password` | No | Reset password with OTP |
| POST | `/api/auth/change-password` | Yes | Change password |

### Accounts

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/accounts` | Yes | List all accounts |
| POST | `/api/accounts` | Yes | Create new account |
| DELETE | `/api/accounts/:id` | Yes | Delete account |

### Trades

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/trades` | Yes | List all trades |
| POST | `/api/trades` | Yes | Create new trade |
| PUT | `/api/trades/:id` | Yes | Update trade |
| DELETE | `/api/trades/:id` | Yes | Delete trade |

### Day Notes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/day-notes?month=YYYY-MM` | Yes | Get notes for a month |
| PUT | `/api/day-notes/:date` | Yes | Create / update / delete a note |

### Utilities

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/screenshot?url=` | No | Puppeteer webpage screenshot |

---

## Security

- Passwords hashed with bcryptjs (12 rounds)
- JWT-based authentication with configurable expiry
- SQLite database excluded from version control
- RLS policies required for Supabase deployment

---

## Deployment

### Cloudflare Pages

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment to Cloudflare Pages on push to `master`.

### Supabase (Optional)

For cloud database, configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`. Required Supabase tables: `profiles`, `accounts`, `trades`, `day_notes` — each with RLS policies using `auth.uid()`.
