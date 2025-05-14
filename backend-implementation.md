# Backend Implementation Guide

This document outlines how to implement the backend for the Anonymous Messages application.

## Database Schema

Create a MySQL database with the following table:

```sql
CREATE TABLE messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  message_text VARCHAR(500) NOT NULL,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (timestamp)
);
```

## Node.js Express Backend

Here's a basic implementation of the Express backend:

```javascript
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Middleware
app.use(express.json());
app.use(helmet()); // Security headers

// Configure CORS to only allow requests from your frontend domain
app.use(cors({
  origin: process.env.FRONTEND_URL,
  methods: ['GET', 'POST']
}));

// Rate limiting (5 messages per minute)
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to all routes
app.use(limiter);

// Don't log IP addresses
app.use((req, res, next) => {
  req.ip = undefined;
  req.headers['user-agent'] = undefined;
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
    
    res.json(rows.map(row => ({
      id: row.id,
      text: row.message_text,
      timestamp: row.timestamp
    })));
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

// Post a new message
app.post('/api/messages', 
  body('text').isString().trim().isLength({ min: 1, max: 500 }),
  async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { text } = req.body;
    
    try {
      // Insert new message
      const [result] = await pool.query(
        'INSERT INTO messages (message_text) VALUES (?)',
        [text]
      );
      
      // Check if we need to delete old messages
      const [countResult] = await pool.query('SELECT COUNT(*) as count FROM messages');
      if (countResult[0].count > 10000) {
        // Delete oldest messages to stay under 10,000 limit
        await pool.query(
          'DELETE FROM messages ORDER BY timestamp ASC LIMIT ?',
          [countResult[0].count - 10000]
        );
      }
      
      res.status(201).json({
        id: result.insertId,
        text,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ error: 'Failed to save message' });
    }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## Required Environment Variables:

```
DB_HOST=your_mysql_host
DB_USER=your_mysql_user
DB_PASSWORD=your_mysql_password
DB_NAME=your_database_name
FRONTEND_URL=https://yourdomain.com
PORT=3001
```

## Required NPM Packages:

```json
{
  "dependencies": {
    "cors": "^2.8.5",
    "express": "^4.18.2",
    "express-rate-limit": "^6.7.0",
    "express-validator": "^7.0.1",
    "helmet": "^7.0.0",
    "mysql2": "^3.3.1"
  }
}
```

## Implementation Notes:

1. Security is implemented via:
   - Helmet for secure headers
   - CORS restriction to frontend domain only
   - Input validation and sanitization
   - Rate limiting
   - Removing identifying information from requests

2. The system automatically manages the 10,000 message limit by deleting oldest messages when needed.

3. For deployment, ensure:
   - HTTPS is enabled
   - Database credentials are secured
   - Environment variables are properly set
   - MySQL server version is 5.7 or higher