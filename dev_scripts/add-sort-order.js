const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run("ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding sort_order to categories:", err);
    } else {
      console.log("Categories table successfully updated (or already updated).");
    }
  });

  db.run("ALTER TABLE subcategories ADD COLUMN sort_order INTEGER DEFAULT 0", (err) => {
    if (err && !err.message.includes("duplicate column name")) {
      console.error("Error adding sort_order to subcategories:", err);
    } else {
      console.log("Subcategories table successfully updated (or already updated).");
    }
  });
});

// Close the db after statements are finalized
setTimeout(() => {
  db.close(() => {
    console.log("Migration complete!");
  });
}, 1000);
