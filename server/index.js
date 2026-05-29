import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import nodemailer from 'nodemailer';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env manually (no external dotenv needed for simple key=value)
try {
  const envPath = join(__dirname, '../.env');
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length > 0) {
      process.env[key.trim()] = rest.join('=').trim();
    }
  });
} catch (e) {
  console.warn('.env file not found, using defaults.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'journalist_fallback_secret_key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30d';

// SMTP config (optional — falls back to console logging in dev)
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const APP_URL = process.env.APP_URL || 'http://localhost:5173';

const transporter = SMTP_USER && SMTP_PASS && SMTP_PASS !== 'your_gmail_app_password_here'
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    })
  : null;

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ==========================================
// DATABASE SETUP
// ==========================================

const dbPath = join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to open local database:', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
    initializeDatabase();
  }
});

function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

async function initializeDatabase() {
  try {
    // 1. Create users table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        passwordHash TEXT NOT NULL,
        createdAt TEXT NOT NULL
      )
    `);
    console.log('Users table verified.');

    // 1b. Create password_reset_tokens table
    await runQuery(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        token TEXT NOT NULL,
        expiresAt TEXT NOT NULL,
        used INTEGER DEFAULT 0
      )
    `);
    console.log('Password reset tokens table verified.');

    // 2. Create accounts table with userId
    await runQuery(`
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        accountSize REAL DEFAULT 0.0,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Accounts table verified.');

    // 3. Create trades table with userId
    await runQuery(`
      CREATE TABLE IF NOT EXISTS trades (
        id TEXT PRIMARY KEY,
        asset TEXT NOT NULL,
        direction TEXT CHECK(direction IN ('LONG', 'SHORT')) NOT NULL,
        status TEXT CHECK(status IN ('WIN', 'LOSS', 'BREAKEVEN')) NOT NULL,
        entryPrice REAL NOT NULL,
        exitPrice REAL,
        quantity REAL NOT NULL,
        entryTime TEXT NOT NULL,
        exitTime TEXT,
        netPnl REAL NOT NULL,
        plannedR REAL,
        realizedR REAL,
        strategy TEXT,
        tags TEXT,
        notes TEXT,
        emotionalState TEXT,
        accountId TEXT,
        screenshotUrl TEXT,
        userId TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Trades table verified.');

    // Safe migrations for existing databases (may already have columns)
    const migrations = [
      'ALTER TABLE accounts ADD COLUMN accountSize REAL DEFAULT 0.0',
      'ALTER TABLE accounts ADD COLUMN userId TEXT',
      'ALTER TABLE trades ADD COLUMN accountId TEXT',
      'ALTER TABLE trades ADD COLUMN screenshotUrl TEXT',
      'ALTER TABLE trades ADD COLUMN userId TEXT',
    ];

    for (const sql of migrations) {
      try {
        await runQuery(sql);
      } catch (_) {
        // Column already exists — safe to ignore
      }
    }

    // Clean slate: remove any orphaned rows that have no userId
    await runQuery(`DELETE FROM trades WHERE userId IS NULL OR userId = ''`);
    await runQuery(`DELETE FROM accounts WHERE userId IS NULL OR userId = ''`);

    // Fix corrupt data where tags or emotionalState is stored as "[object Object]"
    await runQuery(`UPDATE trades SET tags = '[]' WHERE tags = '[object Object]'`);
    await runQuery(`UPDATE trades SET emotionalState = '[]' WHERE emotionalState = '[object Object]'`);

    console.log('Database initialized and orphaned rows cleaned.');

  } catch (err) {
    console.error('Database initialization error:', err.message);
  }
}

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token. Please log in again.' });
  }
}

// ==========================================
// AUTH ROUTES
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    // Check if email already exists
    const existing = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email.toLowerCase(), username.toLowerCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (existing) {
      return res.status(409).json({ error: 'Email or username already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const createdAt = new Date().toISOString();

    await runQuery(
      'INSERT INTO users (id, username, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)',
      [userId, username.toLowerCase(), email.toLowerCase(), passwordHash, createdAt]
    );

    const token = jwt.sign({ userId, username: username.toLowerCase(), email: email.toLowerCase() }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: { id: userId, username: username.toLowerCase(), email: email.toLowerCase(), createdAt }
    });

  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const passwordMatch = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful.',
      token,
      user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt }
    });

  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me — verify token and return user info
app.get('/api/auth/me', verifyToken, (req, res) => {
  db.get('SELECT id, username, email, createdAt FROM users WHERE id = ?', [req.userId], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json({ user: row });
  });
});

// ==========================================
// EMAIL (Nodemailer SMTP or dev mode)
// ==========================================

async function sendSmtpEmail(to, subject, text, html) {
  if (!transporter) {
    console.warn('SMTP transporter is not initialized. Check your SMTP_USER and SMTP_PASS.');
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Journalist" <${SMTP_USER}>`,
      to: to,
      subject: subject,
      text: text,
      html: html,
    });
    return true;
  } catch (error) {
    console.error('Error sending SMTP email:', error.message);
    return false;
  }
}

async function sendResetEmail(email, otp) {
  const text = `Your Journalist password reset OTP is: ${otp}\n\nThis code is valid for 1 hour. If you didn't request this, ignore this email.`;
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Journalist Password Reset</title>
  <style>
    body {
      background-color: #000000;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      background-color: #000000;
      padding: 60px 20px;
    }
    .card {
      background-color: #000000;
      border: 1px solid #FFFFFF;
      border-radius: 0px;
      max-width: 440px;
      margin: 0 auto;
      padding: 48px;
      text-align: left;
    }
    @media only screen and (max-width: 480px) {
      .wrapper {
        padding: 30px 10px !important;
      }
      .card {
        padding: 24px !important;
      }
      .otp-code {
        font-size: 28px !important;
        letter-spacing: 8px !important;
        padding-left: 8px !important;
      }
    }
    .logo-container {
      text-align: center;
      margin-bottom: 32px;
    }
    .logo-text {
      color: #FFFFFF;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      padding-left: 0.2em; /* balance alignment */
    }
    .title {
      color: #FFFFFF;
      font-size: 16px;
      font-weight: 700;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      margin-bottom: 12px;
      text-align: center;
    }
    .subtitle {
      color: #888888;
      font-size: 12px;
      line-height: 1.6;
      text-align: center;
      margin-bottom: 36px;
    }
    .otp-container {
      background-color: #FFFFFF;
      border: 2px dashed #000000;
      outline: 6px solid #FFFFFF;
      border-radius: 0px;
      padding: 24px;
      text-align: center;
      margin: 12px 6px 36px 6px;
    }
    .otp-code {
      color: #000000;
      font-family: monospace;
      font-size: 38px;
      font-weight: 900;
      letter-spacing: 12px;
      margin: 0;
      padding-left: 12px;
    }
    .instructions {
      color: #FFFFFF;
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .instructions-sub {
      color: #888888;
      font-size: 11px;
      line-height: 1.6;
      margin-bottom: 20px;
    }
    .footer {
      border-top: 1px solid #222222;
      padding-top: 24px;
      text-align: center;
      color: #555555;
      font-size: 11px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo-container">
        <span class="logo-text">Journalist</span>
      </div>
      <h2 class="title">Verification Code</h2>
      <p class="subtitle">Please use the following One-Time Password to securely reset your password.</p>
      
      <div class="otp-container">
        <h1 class="otp-code">${otp.slice(0,3)} ${otp.slice(3)}</h1>
      </div>
      
      <p class="instructions">
        This code is valid for <strong>1 hour</strong>. For security reasons, please do not share this code with anyone.
      </p>
      <p class="instructions-sub">
        If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.
      </p>
      
      <div class="footer">
        &copy; 2026 Journalist App. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>`;

  const sent = await sendSmtpEmail(email, 'Journalist — Password Reset Verification Code', text, html);

  if (sent) {
    console.log(`📧 Reset OTP sent to ${email} via SMTP`);
    return true;
  }

  console.log('\n═══════════════════════════════════════════');
  console.log('📧 DEV MODE — Password Reset OTP');
  console.log(`   To: ${email}`);
  console.log(`   OTP: ${otp}`);
  console.log('═══════════════════════════════════════════\n');
  return false;
}

// ==========================================
// PASSWORD RESET ROUTES
// ==========================================

// POST /api/auth/forgot-password
app.post('/api/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    // Check user exists
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    // Always return success even if email not found (security: don't reveal registered emails)
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Invalidate old tokens for this email
    await runQuery('UPDATE password_reset_tokens SET used = 1 WHERE email = ?', [email.toLowerCase()]);

    // Generate new 6-digit OTP token (valid 1 hour)
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    await runQuery(
      'INSERT INTO password_reset_tokens (email, token, expiresAt) VALUES (?, ?, ?)',
      [email.toLowerCase(), token, expiresAt]
    );

    // Send reset email via SMTP – must succeed, otherwise error
    const sent = await sendResetEmail(email.toLowerCase(), token);
    if (!sent) {
      // SMTP not configured or send failed
      console.error('SMTP email send failed – ensure SMTP_USER and SMTP_PASS are set correctly');
      return res.status(500).json({ error: 'Failed to send reset email via SMTP.' });
    }
    // Success – we can return devMode info to aid local development testing if SMTP is not set up
    const isDevMode = !SMTP_PASS || SMTP_PASS === 'your_gmail_app_password_here';
    res.json({ 
      message: 'If an account with that email exists, a verification code has been sent.',
      devMode: isDevMode,
      otp: isDevMode ? token : undefined
    });

  } catch (err) {
    console.error('Forgot-password error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/reset-password
app.post('/api/auth/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) {
    return res.status(400).json({ error: 'Email, token, and new password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  try {
    const record = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM password_reset_tokens WHERE email = ? AND token = ? AND used = 0 AND expiresAt > ?',
        [email.toLowerCase(), token, new Date().toISOString()],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!record) {
      return res.status(400).json({ error: 'Invalid or expired reset token.' });
    }

    // Mark token as used
    await runQuery('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [record.id]);

    // Update password
    const passwordHash = await bcrypt.hash(password, 12);
    await runQuery('UPDATE users SET passwordHash = ? WHERE email = ?', [passwordHash, email.toLowerCase()]);

    res.json({ message: 'Password reset successful. You can now sign in.' });

  } catch (err) {
    console.error('Reset-password error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// POST /api/auth/change-password (authenticated)
app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Old password and new password are required.' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  try {
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [req.userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await runQuery('UPDATE users SET passwordHash = ? WHERE id = ?', [passwordHash, req.userId]);

    res.json({ message: 'Password changed successfully.' });

  } catch (err) {
    console.error('Change-password error:', err.message);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ==========================================
// ACCOUNTS API (protected)
// ==========================================

// GET /api/accounts — fetch only this user's accounts
app.get('/api/accounts', verifyToken, (req, res) => {
  db.all('SELECT * FROM accounts WHERE userId = ? ORDER BY createdAt ASC', [req.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch accounts: ' + err.message });
    }
    res.json(rows);
  });
});

// POST /api/accounts — create account for this user
app.post('/api/accounts', verifyToken, (req, res) => {
  const { id, name, type, accountSize } = req.body;
  if (!name || !type) {
    return res.status(400).json({ error: 'Account name and type are required.' });
  }

  const accountId = id || `acc-${Math.floor(1000 + Math.random() * 9000)}`;
  const params = [
    accountId,
    name,
    type,
    new Date().toISOString(),
    accountSize !== undefined ? parseFloat(accountSize) : 0.0,
    req.userId
  ];

  db.run(
    'INSERT INTO accounts (id, name, type, createdAt, accountSize, userId) VALUES (?, ?, ?, ?, ?, ?)',
    params,
    function (err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to save account: ' + err.message });
      }
      res.status(201).json({ message: 'Account saved.', id: accountId });
    }
  );
});

// DELETE /api/accounts/:id
app.delete('/api/accounts/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM accounts WHERE id = ? AND userId = ?', [req.params.id, req.userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Account deleted.' });
  });
});

// ==========================================
// TRADES API (protected)
// ==========================================

// GET /api/trades — fetch only this user's trades
app.get('/api/trades', verifyToken, (req, res) => {
  db.all('SELECT * FROM trades WHERE userId = ? ORDER BY entryTime DESC', [req.userId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch trades: ' + err.message });
    }

    const safeParseArray = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        try { return JSON.parse(val); } catch { return []; }
      }
      return [];
    };

    const safeParseScreenshots = (val) => {
      if (!val) return [];
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') {
        const trimmed = val.trim();
        if (trimmed.startsWith('[')) {
          try { return JSON.parse(trimmed); } catch { return [val]; }
        }
        return [val];
      }
      return [];
    };

    const parsedRows = rows.map(row => ({
      ...row,
      tags: safeParseArray(row.tags),
      emotionalState: safeParseArray(row.emotionalState),
      screenshotUrls: safeParseScreenshots(row.screenshotUrl)
    }));

    res.json(parsedRows);
  });
});

// POST /api/trades — create trade for this user
app.post('/api/trades', verifyToken, (req, res) => {
  const {
    id, asset, direction, status, entryPrice, exitPrice,
    quantity, entryTime, exitTime, netPnl, plannedR, realizedR,
    strategy, tags, notes, emotionalState, accountId, screenshotUrl, screenshotUrls
  } = req.body;

  if (!asset || !entryPrice || !quantity) {
    return res.status(400).json({ error: 'Asset, entry price, and quantity are required.' });
  }

  const screenshots = Array.isArray(screenshotUrls) 
    ? JSON.stringify(screenshotUrls) 
    : (screenshotUrl ? JSON.stringify([screenshotUrl]) : '[]');

  const params = [
    id, asset, direction, status, entryPrice, exitPrice || null,
    quantity, entryTime, exitTime || null, netPnl, plannedR || null, realizedR || null,
    strategy || 'General Strategy',
    tags ? JSON.stringify(tags) : '[]',
    notes || '',
    emotionalState ? JSON.stringify(emotionalState) : '[]',
    accountId || null,
    screenshots,
    req.userId
  ];

  db.run(`
    INSERT INTO trades (
      id, asset, direction, status, entryPrice, exitPrice,
      quantity, entryTime, exitTime, netPnl, plannedR, realizedR,
      strategy, tags, notes, emotionalState, accountId, screenshotUrl, userId
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, params, function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to save trade: ' + err.message });
    }
    res.status(201).json({ message: 'Trade saved.', id });
  });
});

// PUT /api/trades/:id
app.put('/api/trades/:id', verifyToken, (req, res) => {
  const { asset, direction, status, entryPrice, exitPrice, quantity, netPnl, plannedR, realizedR, strategy, tags, notes, emotionalState, screenshotUrl, screenshotUrls } = req.body;
  
  // Serialize arrays to JSON strings for SQLite storage
  const tagsStr = Array.isArray(tags) ? JSON.stringify(tags) : (tags || '[]');
  const emotionalStr = Array.isArray(emotionalState) ? JSON.stringify(emotionalState) : (emotionalState || '[]');
  const screenshotsStr = Array.isArray(screenshotUrls) ? JSON.stringify(screenshotUrls) : (screenshotUrl ? JSON.stringify([screenshotUrl]) : '[]');

  db.run(`
    UPDATE trades 
    SET asset = ?, direction = ?, status = ?, entryPrice = ?, exitPrice = ?, quantity = ?, netPnl = ?, plannedR = ?, realizedR = ?, strategy = ?, tags = ?, notes = ?, emotionalState = ?, screenshotUrl = ?
    WHERE id = ? AND userId = ?
  `, [
    asset, direction, status, entryPrice, exitPrice, quantity, netPnl, plannedR, realizedR, strategy, tagsStr, notes, emotionalStr, screenshotsStr, req.params.id, req.userId
  ], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Trade updated.' });
  });
});

// DELETE /api/trades/:id
app.delete('/api/trades/:id', verifyToken, (req, res) => {
  db.run('DELETE FROM trades WHERE id = ? AND userId = ?', [req.params.id, req.userId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Trade deleted.' });
  });
});

// ==========================================
// SCREENSHOT ENDPOINT (Puppeteer)
// ==========================================

let screenshotBrowser = null;

async function getScreenshotBrowser() {
  if (!screenshotBrowser) {
    screenshotBrowser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return screenshotBrowser;
}

app.get('/api/screenshot', async (req, res) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing ?url= parameter' });
  }

  try {
    const browser = await getScreenshotBrowser();
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // Wait extra for chart rendering
    await new Promise(r => setTimeout(r, 2000));

    const buffer = await page.screenshot({ type: 'jpeg', quality: 80 });
    await page.close();

    res.set('Content-Type', 'image/jpeg');
    res.send(buffer);
  } catch (err) {
    console.error('Screenshot error:', err.message);
    res.status(500).json({ error: 'Failed to take screenshot' });
  }
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
  console.log(`\n🔐 Journalist API Server running on http://localhost:${PORT}`);
  console.log(`   Auth routes: /api/auth/register, /api/auth/login, /api/auth/me`);
  console.log(`   Password routes: /api/auth/forgot-password, /api/auth/reset-password, /api/auth/change-password`);
  console.log(`   Protected routes: /api/accounts, /api/trades\n`);
});
