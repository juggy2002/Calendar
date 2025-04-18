const express = require('express');
const session = require('express-session');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false,           // secure should be false in dev (no https)
    sameSite: 'lax'          // important for cookies in cross-origin
  }
}));

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin'
  )`);
});

function isAuthenticated(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
}

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    req.session.userId = user.id;
    res.json({ message: 'Logged in' });
  });
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ message: 'Could not log out' });
    res.json({ message: 'Logged out' });
  });
});

app.post('/users', (req, res) => {
  const { username, password, role = 'admin' } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users(username, password, role) VALUES(?, ?, ?)', [username, hashed, role], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint')) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    }
    res.json({ message: 'User created' });
  });
});

app.get('/me', isAuthenticated, (req, res) => {
  db.get('SELECT id, username, role FROM users WHERE id = ?', [req.session.userId], (err, user) => {
    if (err) return res.status(500).json({ message: 'Internal server error' });
    res.json(user);
  });
});

app.get('/users', (req, res) => {
  db.all('SELECT id, username, role FROM users', (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error fetching users' });
    res.json(rows);
  });
});

app.get('/users/:id', isAuthenticated, (req, res) => {
  db.get('SELECT id, username, role FROM users WHERE id = ?', [req.params.id], (err, user) => {
    if (err) return res.status(500).json({ message: 'Error' });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  });
});

app.put('/users/:id', isAuthenticated, (req, res) => {
  const { username, password, role } = req.body;
  const { id } = req.params;

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

  values.push(id);

  const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  db.run(sql, values, function(err) {
    if (err) return res.status(500).json({ message: 'Update failed' });
    res.json({ message: 'User updated' });
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on port ${port}`));
