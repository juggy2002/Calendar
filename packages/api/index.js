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

      // force the cookie to be set before we reply
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

// ───────── Events persistence ───────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id      INTEGER PRIMARY KEY AUTOINCREMENT,
    userId  INTEGER,
    title   TEXT,
    date    TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);
});

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

app.post('/events', isAuthenticated, (req, res) => {
  const { title, date } = req.body;
  db.run(
    'INSERT INTO events(userId, title, date) VALUES(?, ?, ?)',
    [req.session.userId, title, date],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error creating event' });
      res.json({ id: this.lastID, title, date });
    }
  );
});

// ───────── Messages persistence ──────────────────────
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    toUserId   INTEGER,
    fromUserId INTEGER,
    content    TEXT,
    read       INTEGER DEFAULT 0,
    createdAt  TEXT    DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(toUserId)   REFERENCES users(id),
    FOREIGN KEY(fromUserId) REFERENCES users(id)
  )`);
});

app.get('/messages', isAuthenticated, (req, res) => {
  db.all(
    `SELECT m.id, m.fromUserId, u.username AS fromUsername,
            m.content, m.read, m.createdAt
     FROM messages m
     JOIN users u ON m.fromUserId = u.id
     WHERE m.toUserId = ?
     ORDER BY m.createdAt DESC`,
    [req.session.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error fetching messages' });
      res.json(rows);
    }
  );
});

app.post('/messages', isAuthenticated, (req, res) => {
  const { toUserId, content } = req.body;
  const fromUserId = req.session.userId;
  db.run(
    'INSERT INTO messages(toUserId, fromUserId, content) VALUES(?, ?, ?)',
    [toUserId, fromUserId, content],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error sending message' });
      res.json({
        id: this.lastID,
        toUserId,
        fromUserId,
        content,
        read: 0,
        createdAt: new Date().toISOString()
      });
    }
  );
});

app.post('/messages/:id/read', isAuthenticated, (req, res) => {
  db.run(
    'UPDATE messages SET read = 1 WHERE id = ? AND toUserId = ?',
    [req.params.id, req.session.userId],
    function(err) {
      if (err) return res.status(500).json({ message: 'Error marking as read' });
      res.json({ success: true });
    }
  );
});

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


app.post('/chat', isAuthenticated, async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }]
    });

    const message = response.data.choices[0].message.content;
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});


// ■ Health check ■
app.get('/', (req, res) => res.send('API up and running 🚀'));

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
