// packages/api/index.js
const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();

// ■ CORS ■
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://calendar-web-rust.vercel.app'
  ],
  credentials: true
}));

app.use(express.json());

// ■ Trust the proxy (Render / Vercel) so HTTPS is detected correctly ■
app.set('trust proxy', 1);

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,          // force new sessions to be set
  cookie: {
    secure: process.env.NODE_ENV === 'production', // only Secure in prod
    sameSite: 'none',               // required for cross‑site cookies
    httpOnly: true                  // good practice
  }
}));

// ■ SQLite and schema init ■
const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin'
  )`);
});

// ■ Auth check middleware ■
function isAuthenticated(req, res, next) {
  if (req.session.userId) return next();
  res.status(401).json({ message: 'Unauthorized' });
}

// ■ Login (with forced session.save) ■
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get(
    'SELECT * FROM users WHERE username = ?', 
    [username],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });
      if (!user) return res.status(401).json({ message: 'Invalid credentials' });

      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

      req.session.userId = user.id;

      // ✅ force the cookie to be set before we reply
      req.session.save(saveErr => {
        if (saveErr) {
          console.error('Session save error:', saveErr);
          return res.status(500).json({ message: 'Could not create session' });
        }
        res.json({ message: 'Logged in' });
      });
    }
  );
});

// ■ Logout ■
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Could not log out' });
    res.json({ message: 'Logged out' });
  });
});

// ■ Create user ■
app.post('/users', (req, res) => {
  const { username, password, role = 'admin' } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run(
    'INSERT INTO users(username, password, role) VALUES(?, ?, ?)',
    [username, hashed, role],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint')) {
          return res.status(400).json({ message: 'Username already exists' });
        }
        return res.status(500).json({ message: 'Internal server error' });
      }
      res.json({ message: 'User created' });
    }
  );
});

// ■ Who am I? ■
app.get('/me', isAuthenticated, (req, res) => {
  db.get(
    'SELECT id, username, role FROM users WHERE id = ?',
    [req.session.userId],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'Internal server error' });
      res.json(user);
    }
  );
});

// ■ List users ■
app.get('/users', (req, res) => {
  db.all(
    'SELECT id, username, role FROM users',
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error fetching users' });
      res.json(rows);
    }
  );
});

// ■ Get one user ■
app.get('/users/:id', isAuthenticated, (req, res) => {
  db.get(
    'SELECT id, username, role FROM users WHERE id = ?',
    [req.params.id],
    (err, user) => {
      if (err) return res.status(500).json({ message: 'Error' });
      if (!user) return res.status(404).json({ message: 'User not found' });
      res.json(user);
    }
  );
});

// ■ Update user ■
app.put('/users/:id', isAuthenticated, (req, res) => {
  const { username, password, role } = req.body;
  const updates = [];
  const values = [];

  if (username) {
    updates.push('username = ?');
    values.push(username);
  }
  if (password) {
    updates.push('password = ?');
    values.push(bcrypt.hashSync(password, 10));
  }
  if (role) {
    updates.push('role = ?');
    values.push(role);
  }
  values.push(req.params.id);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'User updated' });
  });
});
// ─────────────── Events persistence ───────────────

// Create events table (if it doesn’t exist yet)
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    userId  INTEGER,
    title   TEXT,
    date    TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

// GET /events — return all events for the current user
app.get('/events', isAuthenticated, (req, res) => {
  db.all(
    'SELECT id, title, date FROM events WHERE userId = ? ORDER BY date',
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error fetching events' });
      res.json(rows);
    }
  );
});

// POST /events — create a new event for the current user
app.post('/events', isAuthenticated, (req, res) => {
  const { title, date } = req.body;
  db.run(
    'INSERT INTO events(userId, title, date) VALUES(?, ?, ?)',
    [req.session.userId, title, date],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error creating event' });
      // Return the newly created event
      res.json({ id: this.lastID, title, date });
    }
  );
});

// ■ Health check ■
app.get('/', (req, res) => res.send('API up and running 🚀'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
