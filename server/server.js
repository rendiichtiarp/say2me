const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');
const dotenv = require('dotenv');
const xss = require('xss');
const fs = require('fs').promises;
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Configure CORS - harus sebelum route handlers
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
  maxAge: 3600
}));

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:3000", "http://localhost:5173"],
      imgSrc: ["'self'", "data:", "blob:"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"]
    }
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 100, // limit setiap IP ke 100 request per windowMs
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi nanti'
});

app.use(limiter);

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'say2me',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Asia/Jakarta'
});

// Generate unique username
const generateUniqueUsername = async () => {
  const adjectives = ['happy', 'lucky', 'sunny', 'clever', 'bright', 'kind', 'wise', 'brave'];
  const nouns = ['panda', 'tiger', 'eagle', 'dolphin', 'lion', 'wolf', 'bear', 'fox'];
  
  while (true) {
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 1000);
    const username = `${adj}-${noun}-${number}`;
    
    const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length === 0) {
      return username;
    }
  }
};

// Create new user page
app.post('/api/pages', [
  body('username')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage('Username harus antara 3-30 karakter dan hanya boleh mengandung huruf, angka, underscore, dan dash'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        errors: errors.array(),
        message: 'Validasi gagal'
      });
    }

    let username = req.body.username;
    
    if (username) {
      // Check if username already exists
      const [existing] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (existing.length > 0) {
        return res.status(400).json({
          error: 'Username sudah digunakan',
          message: 'Silakan pilih username lain'
        });
      }
    } else {
      // Generate random username if not provided
      username = await generateUniqueUsername();
    }
    
    const userId = require('crypto').randomUUID();
    await pool.query('INSERT INTO users (id, username) VALUES (?, ?)', [userId, username]);
    
    res.status(201).json({
      data: {
        userId,
        username,
        url: `/p/${username}`
      },
      message: 'Halaman berhasil dibuat'
    });
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({
      error: 'Gagal membuat halaman',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Get user by username
app.get('/api/pages/:username', async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, username, created_at FROM users WHERE username = ?',
      [req.params.username]
    );
    
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Halaman tidak ditemukan',
        message: 'Username tidak valid'
      });
    }
    
    res.json({ data: users[0] });
  } catch (error) {
    console.error('Error fetching page:', error);
    res.status(500).json({
      error: 'Gagal mengambil data halaman',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Get messages for specific user
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    
    const [rows] = await pool.query(
      'SELECT id, message_text, timestamp FROM messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [req.params.userId, pageSize, offset]
    );
    
    res.json({
      data: rows.map(row => ({
        id: row.id,
        message_text: row.message_text,
        timestamp: row.timestamp
      }))
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Gagal mengambil pesan',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Post message to specific user
app.post('/api/messages/:userId', [
  body('text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Pesan harus antara 1-500 karakter')
    .customSanitizer(value => xss(value))
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      message: 'Validasi gagal'
    });
  }
  
  const { text } = req.body;
  const userId = req.params.userId;
  
  try {
    // Verify user exists
    const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        error: 'Pengguna tidak ditemukan',
        message: 'User ID tidak valid'
      });
    }
    
    const [result] = await pool.query(
      'INSERT INTO messages (user_id, message_text) VALUES (?, ?)',
      [userId, text]
    );
    
    res.status(201).json({
      data: {
        id: result.insertId,
        message_text: text,
        timestamp: new Date()
      },
      message: 'Pesan berhasil disimpan'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Gagal menyimpan pesan',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Remove identifying information
app.use((req, res, next) => {
  delete req.headers['user-agent'];
  delete req.headers['x-forwarded-for'];
  delete req.headers['x-real-ip'];
  next();
});

// Get messages (paginated)
app.get('/api/messages', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = 20;
    const offset = (page - 1) * pageSize;
    
    const [rows] = await pool.query(
      'SELECT id, message_text, timestamp FROM messages ORDER BY timestamp DESC LIMIT ? OFFSET ?',
      [pageSize, offset]
    );
    
    res.json({
      data: rows.map(row => ({
        id: row.id,
        message_text: row.message_text,
        timestamp: row.timestamp
      }))
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Gagal mengambil pesan',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Post a new message
app.post('/api/messages', [
  body('text')
    .isString()
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Pesan harus antara 1-500 karakter')
    .customSanitizer(value => xss(value))
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      errors: errors.array(),
      message: 'Validasi gagal'
    });
  }
  
  const { text } = req.body;
  
  try {
    console.log(`Attempting to save message of length: ${text.length}`);
    
    const [result] = await pool.query(
      'INSERT INTO messages (message_text) VALUES (?)',
      [text]
    );
    
    const [countResult] = await pool.query('SELECT COUNT(*) as count FROM messages');
    if (countResult[0].count > 10000) {
      await pool.query(
        'DELETE FROM messages ORDER BY timestamp ASC LIMIT ?',
        [countResult[0].count - 10000]
      );
    }
    
    res.status(201).json({
      data: {
        id: result.insertId,
        message_text: text,
        timestamp: new Date()
      },
      message: 'Pesan berhasil disimpan'
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      error: 'Gagal menyimpan pesan',
      message: 'Terjadi kesalahan internal'
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Terjadi kesalahan internal',
    message: 'Mohon coba lagi nanti'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});