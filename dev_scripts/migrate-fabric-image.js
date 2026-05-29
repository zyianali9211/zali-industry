const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Check if image column exists, if not add it
  db.run(`ALTER TABLE fabrics ADD COLUMN image TEXT`, (err) => {
    if (err && !err.message.includes('duplicate column name')) {
      console.error(err);
    } else {
      console.log('Added image column to fabrics table.');
    }
  });
});
db.close();
