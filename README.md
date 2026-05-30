<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-/master/public/logo-dark.png">
    <img src="https://raw.githubusercontent.com/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-/master/public/logo-light.png" alt="Journalist Logo" width="130" />
  </picture>
</p>

<h1 align="center">JOURNALIST</h1>
<p align="center">
  <a href="https://tradejournalist.pages.dev"><b>tradejournalist.pages.dev</b></a>
</p>

<p align="center">
  <b>A premium, high-performance trading journal</b> meticulously engineered for tracking, analyzing, and optimizing trades across Crypto, Futures, Forex, Equities, and Indices.
  <br/>
  <i>Elevate your edge with multi-account control, dynamic analytics, and a state-of-the-art dark-mode interface.</i>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase" />
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&logo=github&color=38bdf8" alt="License" />
  <img src="https://img.shields.io/github/last-commit/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&logo=git&color=c084fc" alt="Last Commit" />
  <img src="https://img.shields.io/github/repo-size/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-?style=flat-square&logo=files&color=fb923c" alt="Repo Size" />
  <img src="https://img.shields.io/badge/PRs-welcome-34d399?style=flat-square&logo=gitkraken" alt="PRs Welcome" />
</p>

---

## ⚡ Key Architectural Highlights

> [!TIP]
> **Double Database Synchronization Architecture**
> Journalist operates on a dual-engine database structure. By default, it operates completely offline via a local high-performance SQLite engine. Plugging in your Supabase keys instantly and seamlessly upgrades the application to a fully cloud-synchronized architecture with Row Level Security (RLS) policies.

---

## 🛠️ The Tech Stack

### 💻 Frontend Core
* **React 19 & TypeScript 5** — The gold standard for modern, robust SPA building.
* **Vite 8** — Next-generation frontend tooling providing ultra-fast HMR and building.
* **Tailwind CSS v4** — High-fidelity utilities coupled with CSS-variable configuration.
* **Recharts** — Dynamic, interactive, and beautifully responsive SVG charting.
* **html2canvas-pro** — Allows traders to download gorgeous high-definition PnL cards natively.

### ⚙️ Backend & Infrastructure
* **Express 5** — High-throughput REST API backend handling routes and service synchronization.
* **SQLite / Supabase** — Modular database layer catering to both isolated local use and real-time cloud backup.
* **JSON Web Tokens (JWT)** — Secure, stateless, and encrypted session management.
* **Nodemailer** — Production-ready SMTP integrations for secure password recovery.

---

## 💎 Features at a Glance

### 📊 Trade & Portfolio Management
* 💼 **Multi-Account Engine** — Maintain completely independent metrics, histories, and settings for Cash, Margin, and Futures accounts.
* 🧙‍♂️ **3-Step Logging Wizard** — Document setups instantly inside a wizard-style modal matching raw quantitative metrics, visual strategies, and trader psychology.
* ✏️ **Full CRUD & Bulk Timeline Control** — Seamlessly edit, delete, or bulk-remove logs straight from an interactive chronological timeline feed.
* 🏷️ **Dynamic Multi-Tagging** — Categorize entries by setup style, session, or mistake to generate multi-dimensional edge matrices.

### 📈 Deep Analytics & Intelligence
* 🎯 **R-Ratio Planned vs. Realized Scatter** — Scatter charts showing the mathematical difference between your projected risk reward and actual execution.
* 🍩 **Outcome Distribution Wheel** — Donut visualization showcasing win/loss ratios overlaid with win-rate percentages.
* 🗺️ **Setup & Tag Win-Rate Matrix** — Spot your strongest and weakest setups instantly through high-impact, segmented matrices.
* 📅 **Monthly PnL Heatmap Calendar** — A color-coded calendar showcasing daily profit/loss aggregates alongside custom non-trading day logs.
* 📈 **Equity & Cumulative PnL Curves** — Premium charts tracking portfolio growth dynamically across customizable date ranges.

### 🔒 Security & User Experience
* 🌓 **Fluid Dark & Light Modes** — Responsive theme customization featuring persistent local styling and browser preference detection.
* ⌨️ **Universal Command Palette** — Jump anywhere or execute quick actions in milliseconds using the **`Ctrl + K`** modal.
* ✈️ **Sleek Shareable PnL Cards** — Generate gorgeous, customized quantitative cards for Telegram, Twitter, or Discord with one click.
* 📥 **Color-Coded Excel Exports** — Export trade sheets dynamically formatted with green/red margins and portfolio summary headers.

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following baseline environments installed:
* **Node.js** `>= 18.0.0`
* **npm** `>= 9.0.0`

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/MAYURSHEWALE12/JOURNALIST---The-Trading-Journal-For-Tarders-.git

# Navigate to the workspace
cd trading-journal

# Install package dependencies
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:
```env
JWT_SECRET=your_ultra_secure_secret_key_here
JWT_EXPIRES_IN=30d

# SMTP Configuration (Nodemailer)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password

# Client Base URL
APP_URL=http://localhost:5173
```

### 4. Development Run
Fire up the Vite development server and the backend Express daemon concurrently with a single command:
```bash
npm run dev
```
* **Frontend Dashboard:** `http://localhost:5173`
* **Backend REST Server:** `http://localhost:3001`

---

## 🗂️ Project Workspace Map

```
trading-journal/
├── src/
│   ├── context/          # React Global State Layer (Auth, Accounts, Trades, UI)
│   ├── components/       # Collapsible Sidebar, CmdPalette, PnLCard, KPI Dashboards
│   ├── screens/          # Dashboard, Analytics, Heatmap Calendar, Auth, Trade Details
│   ├── lib/              # Supabase Client, Excel/PDF Generators, Scoring Logic
│   ├── data/             # Quantitative Mock Seed Data
│   └── types.ts          # Centralized Shared TypeScript Interfaces
├── server/
│   └── index.js          # REST Backend (SQLite, Nodemailer, Auth Engines)
```

---

## 🔐 Security Standards

* **Bcryptjs (12 Rounds)** — Multi-layer encryption of all user passwords prior to database insertion.
* **Stateless JWT Authorization** — Expiring bearer tokens passed via headers to protect API endpoints.
* **Supabase RLS Policies** — Robust Row-Level Security ensuring user accounts remain strictly isolated and inaccessible to others.

---

## ⚡ Deployment & Pipelines

### 🌍 Cloudflare Pages
This project is configured with a fully automated **GitHub Actions** CI/CD pipeline (`.github/workflows/deploy.yml`). Pushing changes directly to `master` builds the project and deploys it to your live domain instantly.

### 🛢️ Supabase Integration (Optional)
To activate real-time cloud database backup, add these environment variables to your `.env.local`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```
> [!NOTE]
> Database migration scripts are located in `supabase-migration.sql` and `migrate-sqlite-to-supabase.sql`. Paste them into your Supabase SQL editor to initialize tables with full RLS support in under 2 minutes!

---

<p align="center">
  <b>Meticulously Crafted by <a href="https://github.com/MAYURSHEWALE12">MAYURSHEWALE12</a></b>
  <br/>
  <sub>Because serious traders deserve serious tools.</sub>
</p>
