// packages/api/migrate.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT DEFAULT 'admin'
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    title TEXT,
    date TEXT,
    FOREIGN KEY(userId) REFERENCES users(id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    toUserId INTEGER,
    fromUserId INTEGER,
    content TEXT,
    read INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(toUserId) REFERENCES users(id),
    FOREIGN KEY(fromUserId) REFERENCES users(id)
  )`);

  db.get(`SELECT COUNT(*) as count FROM users`, (err, row) => {
    if (err) return console.error('Failed to check user count:', err);
    if (row.count === 0) {
      const hash = bcrypt.hashSync('admin123', 10);
      db.run(
        'INSERT INTO users(username, password, role) VALUES (?, ?, ?)',
        ['admin', hash, 'admin'],
        err => {
          if (err) console.error('Failed to seed admin:', err);
          else console.log('Seeded default admin user: admin/admin123');
        }
      );
    }
  });
});

db.close(() => {
  console.log('Migration complete ✅');
});
