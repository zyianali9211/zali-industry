const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const order = [
  'sportswear-training-tops',
  'sportswear-training-bottoms',
  'sportswear-accessories',
  'sportswear-golf-court',
  'sportswear-sets'
];

db.serialize(() => {
  order.forEach((id, index) => {
    db.run("UPDATE subcategories SET sort_order = ? WHERE id = ?", [index, id], (err) => {
      if (err) console.error("Error reordering", id, ":", err);
      else console.log("Set sort_order", index, "for", id);
    });
  });
});

setTimeout(() => {
  db.close(() => {
    console.log("Database updates complete.");
  });
}, 1000);
