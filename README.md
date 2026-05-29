# Journalist —  Trading Journal

**Journalist** is a high-performance, full-stack trading journal and analytics dashboard designed for traders tracking activity across **Crypto, Futures, Forex, Equities, and Indices**. Built with a premium, Notion-inspired black-and-white minimalist design system, it delivers high-density portfolio analytics, qualitative mindset tracking, and multi-screenshot trade reviews side-effect-free.

---

## 🛠️ Tech Stack & Architecture

Journalist is engineered with a modern full-stack decoupled architecture:

### 1. Frontend Client
- **Framework**: React 19 + TypeScript + Vite 8
- **Styling**: Tailwind CSS v4 (Stark monochrome HSL palette, dark/light theme classes)
- **Data Visualization**: Recharts (Custom monochrome area charts, scatter plots, win-rate meters)
- **Icons**: Lucide React
- **Purity Guard**: Fully compliant with strict React 19 compiler hooks and render idempotency rules.

### 2. Backend Server
- **Engine**: Node.js + Express 5
- **Database**: SQLite3 (Local file-based system)
- **Authentication**: JWT (JSON Web Tokens) with Secure Password Hashing (BcryptJS)
- **Mailing**: Nodemailer (OTP validation support for password recovery)

---

## 🖼️ Premium UI Features

- **Stark monochrome theme**: A beautiful visual design that uses high-contrast layouts. It eliminates colors except for green wins (`#10b981`) and red losses (`#f43f5e`).
- **Interactive Multi-Screenshot Galleries**: Attach multiple chart URLs to a single trade. Visualized dynamically side-by-side on dashboard cards and organized inside an interactive details lightbox slider.
- **Pulsing Skeleton States**: Replaces empty loading screens with custom-designed, hardware-accelerated monochrome pulse loading elements during API fetches.
- **Custom Interactive `<CursorFollower />`**: A smooth cursor tracking system that adapts perfectly to interaction vectors across all public landing pages and workspace screens.
- **Systematic Command Palette**: Hit `Ctrl + K` (or click Search) to trigger an immediate, keyboard-accessible quick navigation interface.

---

## 💾 Database Schema

Journalist utilizes a reliable SQLite database (`database.sqlite`) mapped as follows:

```mermaid
erDiagram
    USERS ||--o{ ACCOUNTS : owns
    USERS ||--o{ TRADES : logs
    ACCOUNTS ||--o{ TRADES : categorizes
    
    USERS {
        INTEGER id PK
        TEXT username
        TEXT email UNIQUE
        TEXT password_hash
        TEXT created_at
    }

    ACCOUNTS {
        TEXT id PK
        INTEGER user_id FK
        TEXT name
        TEXT type
        REAL account_size
        TEXT created_at
    }

    TRADES {
        TEXT id PK
        INTEGER user_id FK
        TEXT account_id FK
        TEXT asset
        TEXT direction
        TEXT status
        REAL entry_price
        REAL exit_price
        REAL quantity
        REAL net_pnl
        REAL planned_r
        REAL realized_r
        TEXT strategy
        TEXT tags
        TEXT notes
        TEXT emotional_state
        TEXT screenshot_urls
        TEXT created_at
    }
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### 2. Local Installation
Clone the repository and install the full-stack dependency trees:
```bash
npm install
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
EMAIL_USER=your_smtp_gmail_user@gmail.com
EMAIL_PASS=your_gmail_app_specific_pass
```

### 4. Running the Dev Servers
Launch both the Vite development server and the Express database backend concurrently with one command:
```bash
npm run dev
```
- Frontend starts at: `http://localhost:5173`
- Backend server logs on: `http://localhost:5000`

### 5. Production Compilation
Build a highly optimized, minimized bundle:
```bash
npm run build
```

---

## 🔒 Security Best Practices
- The local SQLite database binary (`database.sqlite`) and environment variables (`.env`) are explicitly untracked via `.gitignore` to prevent data or credentials leakage.
- Passwords are encrypted one-way using 10 rounds of salt factorization.
