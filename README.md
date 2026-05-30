<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="/logo-dark.png">
    <img src="/logo-dark.png" alt="Journalist Logo" width="120" />
  </picture>
</p>

<h1 align="center">📓 Journalist — Trading Journal</h1>

<p align="center">
  <b>A premium full-stack trading journal</b> for tracking trades across Crypto, Futures, Forex, Equities, and Indices.
  <br/>
  Analytics dashboards • Multi-account management • Polished dark-mode UI
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Express-5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&color=blue" alt="License" />
  <img src="https://img.shields.io/github/last-commit/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&color=purple" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&color=orange" alt="Repo Size" />
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen?style=flat-square" alt="PRs Welcome" />
</p>

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | ![React 19](https://img.shields.io/badge/React_19-61DAFB?logo=react&logoColor=white) ![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?logo=typescript&logoColor=white) ![Vite 8](https://img.shields.io/badge/Vite_8-646CFF?logo=vite&logoColor=white) ![Tailwind CSS 4](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?logo=tailwindcss&logoColor=white) ![Recharts](https://img.shields.io/badge/Recharts-22B5BF?logo=recharts&logoColor=white) |
| **Backend** | ![Express 5](https://img.shields.io/badge/Express_5-000000?logo=express&logoColor=white) ![JWT](https://img.shields.io/badge/JWT-000000?logo=jsonwebtokens&logoColor=white) ![Bcrypt](https://img.shields.io/badge/Bcrypt-003A70?logo=lock&logoColor=white) |
| **Database** | ![SQLite](https://img.shields.io/badge/SQLite-003B57?logo=sqlite&logoColor=white) / ![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white) |
| **Tools** | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white) ![npm](https://img.shields.io/badge/npm-CB3837?logo=npm&logoColor=white)

---

## ✨ Features

### 📊 Trade Management
| Feature | Description |
|---------|-------------|
| 🔄 **Multi-account** | Track separate accounts (cash, margin, futures) with independent metrics |
| 📝 **3-step logging** | Wizard-style modal: metrics → strategy → psychology |
| ✏️ **Edit & Delete** | Full CRUD with confirmation dialogs; bulk delete on Timeline |
| 🏷️ **Tag system** | Custom tags for categorization, filtering, and performance breakdown |
| 🖼️ **Screenshots** | Attach setup screenshots to every trade |

### 📈 Analytics & Insights
| Feature | Description |
|---------|-------------|
| 📉 **R-Ratio scatter** | Planned vs realized R visualization |
| 🍩 **Win/Loss donut** | Outcome distribution with win rate overlay |
| 📊 **Tag matrix** | Win rate breakdown by custom tag |
| 🗓️ **Calendar heatmap** | Color-coded daily PnL with monthly aggregates |
| 📈 **Equity curves** | Cumulative PnL timeline |
| 🎯 **KPI dashboard** | Win rate, profit factor, avg PnL, best/worst assets |
| 📅 **Date range** | Filter analytics by custom date range |

### 📓 Journaling
| Feature | Description |
|---------|-------------|
| 📝 **Day notes** | Add notes to any calendar day — even non-trading days — to log market observations or explain why you sat out |
| ⏳ **Timeline feed** | Chronological scrollable view with notes, tags, screenshots, and emotional state |
| 🧠 **Mindset tracking** | Log emotional state at time of trade |

### 🎨 User Experience
| Feature | Description |
|---------|-------------|
| 🌙 **Dark / Light mode** | Persistent theme with system preference detection |
| ⌨️ **Command palette** | `Ctrl+K` quick navigation and actions |
| 👤 **Guest mode** | Sandbox with mock trades, no login required |
| 📱 **Responsive** | Mobile-optimized with iOS-style bottom sheets |
| 📤 **Export** | Colored Excel (.xls) with green/red rows and summary header |

### 🔐 Authentication
| Feature | Description |
|---------|-------------|
| 🔑 **Register / Login** | Email-based auth with JWT |
| 📧 **Password recovery** | OTP-based reset via email (Nodemailer) |
| 👤 **Profile management** | Update username, avatar, bio, social handles |

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|------------|---------|
| **Node.js** | `>= 18` |
| **npm** | `>= 9` |

### Installation

```bash
# Clone the repo
git clone https://github.com/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-.git

# Install dependencies
cd trading-journal
npm install
```

### ⚙️ Environment

Create a `.env` file in the project root:

```env
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=30d
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
APP_URL=http://localhost:5173
```

### 🧪 Development

Starts both Vite frontend and Express backend concurrently:

```bash
npm run dev
```

| Service | URL |
|---------|-----|
| **Frontend** | `http://localhost:5173` |
| **Backend** | `http://localhost:3001` |

### 📦 Build

```bash
npm run build
```

### 🔍 Lint

```bash
npm run lint
```

---

## 📂 Project Structure

```
📦 trading-journal
├── 📁 src/
│   ├── 📁 context/                    # 🧩 React context providers
│   │   ├── 📄 AppContext.tsx           # Composite provider (all sub-contexts)
│   │   ├── 📄 UIContext.tsx            # Theme, sidebar, command palette, calendar nav
│   │   ├── 📄 AuthContext.tsx          # User, login/register, profile, password reset
│   │   ├── 📄 AccountContext.tsx       # Accounts CRUD, active account management
│   │   ├── 📄 TradeContext.tsx         # Trades CRUD, filters, tags, modal state
│   │   └── 📄 AnalyticsContext.tsx     # Computed stats, equity curve, calendar days
│   ├── 📁 components/                  # 🧱 Reusable UI components
│   │   ├── 📄 Sidebar.tsx              # Collapsible navigation
│   │   ├── 📄 Header.tsx               # Top bar with actions
│   │   ├── 📄 CommandPalette.tsx       # Ctrl+K command search
│   │   ├── 📄 NewTradeModal.tsx        # 3-step trade creation wizard
│   │   ├── 📄 EditTradeModal.tsx       # Edit trade form
│   │   ├── 📄 DeleteConfirmModal.tsx   # Delete confirmation dialog
│   │   ├── 📄 NewAccountModal.tsx      # Create new account
│   │   ├── 📄 ScreenshotModal.tsx      # Fullscreen image lightbox
│   │   ├── 📄 CursorFollower.tsx       # Decorative cursor animation
│   │   ├── 📄 LogoIcon.tsx             # Theme-aware logo
│   │   ├── 📄 KpiDashboard.tsx         # Key performance indicators
│   │   ├── 📄 PremiumPnLChart.tsx      # Equity curve chart
│   │   ├── 📄 JournalistScore.tsx      # Journalist scoring component
│   │   └── 📄 Skeleton.tsx             # Loading skeletons
│   ├── 📁 screens/                     # 📺 Page-level components
│   │   ├── 📄 LandingPage.tsx          # Marketing / landing page
│   │   ├── 📄 AuthPage.tsx             # Login / Register
│   │   ├── 📄 ForgotPassword.tsx       # Email → OTP → new password
│   │   ├── 📄 ResetPassword.tsx        # Token-based password reset
│   │   ├── 📄 Dashboard.tsx            # Stats, equity curve, calendar, trade cards
│   │   ├── 📄 Analytics.tsx            # Scatter, donut, tag matrix, date range
│   │   ├── 📄 Calendar.tsx             # Monthly heatmap with day notes
│   │   ├── 📄 Timeline.tsx             # Chronological trade feed with bulk delete
│   │   └── 📄 TradeDetail.tsx          # Single trade detail view
│   ├── 📁 lib/
│   │   ├── 📄 api.ts                   # 🌐 API client (Express + Supabase)
│   │   ├── 📄 supabase.ts              # Supabase client init
│   │   ├── 📄 pdfExporter.ts           # 📄 PDF report generation (jsPDF)
│   │   ├── 📄 excelExporter.ts         # 📊 Colored Excel export (SpreadsheetML)
│   │   └── 📄 journalistScore.ts       # Scoring algorithm
│   ├── 📁 data/
│   │   └── 📄 mockTrades.ts            # Seed data for guest mode
│   └── 📄 types.ts                     # Shared TypeScript types
│
├── 📁 server/
│   └── 📄 index.js                     # 🖥 Express server, SQLite, JWT, email
│
├── 📄 .env                             # 🔒 Environment variables
├── 📄 package.json                     # 📦 Dependencies & scripts
├── 📄 vite.config.ts                   # ⚡ Vite configuration
└── 📄 tsconfig.json                    # TypeScript configuration
```

---

## 📡 API Endpoints

### 🔐 Auth
| Method | Endpoint | 🔒 | Description |
|--------|----------|:--:|-------------|
| `POST` | `/api/auth/register` | ❌ | Register new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `GET` | `/api/auth/me` | ✅ | Verify token & get profile |
| `POST` | `/api/auth/forgot-password` | ❌ | Request OTP via email |
| `POST` | `/api/auth/reset-password` | ❌ | Reset password with OTP |
| `POST` | `/api/auth/change-password` | ✅ | Change password |

### 💼 Accounts
| Method | Endpoint | 🔒 | Description |
|--------|----------|:--:|-------------|
| `GET` | `/api/accounts` | ✅ | List all accounts |
| `POST` | `/api/accounts` | ✅ | Create new account |
| `DELETE` | `/api/accounts/:id` | ✅ | Delete account |

### 📈 Trades
| Method | Endpoint | 🔒 | Description |
|--------|----------|:--:|-------------|
| `GET` | `/api/trades` | ✅ | List all trades |
| `POST` | `/api/trades` | ✅ | Create new trade |
| `PUT` | `/api/trades/:id` | ✅ | Update trade |
| `DELETE` | `/api/trades/:id` | ✅ | Delete trade |

### 📝 Day Notes
| Method | Endpoint | 🔒 | Description |
|--------|----------|:--:|-------------|
| `GET` | `/api/day-notes?month=YYYY-MM` | ✅ | Get notes for a month |
| `PUT` | `/api/day-notes/:date` | ✅ | Create / update / delete a note |

### 🛠 Utilities
| Method | Endpoint | 🔒 | Description |
|--------|----------|:--:|-------------|
| `GET` | `/api/screenshot?url=` | ❌ | Puppeteer webpage screenshot |

---

## 🔒 Security

| Measure | Detail |
|---------|--------|
| **🔑 Passwords** | Hashed with bcryptjs (12 rounds) |
| **🎫 Authentication** | JWT-based with configurable expiry |
| **🗄️ Database** | SQLite excluded from version control |
| **🛡️ RLS** | Row Level Security required for Supabase deployment |

---

## 🚢 Deployment

### ☁️ Cloudflare Pages

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) for automatic deployment to Cloudflare Pages on push to `master`.

### 🔷 Supabase (Optional)

For cloud database, configure these in `.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Required Supabase tables:** `profiles`, `accounts`, `trades`, `day_notes` — each with RLS policies using `auth.uid()`.

---

<p align="center">
  <b>Built with ❤️ by <a href="https://github.com/MAYURSHEWALE12">MAYURSHEWALE12</a></b>
  <br/>
  <sub>Made for traders who take their journaling seriously.</sub>
</p>
