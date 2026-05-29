const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const order = [
  'casual-wear-tshirts',
  'casual-wear-polos',
  'casual-wear-shirts',
  'casual-wear-hoodies-and-sweat-shirts',
  'casual-wear-bottoms',
  'casual-wear-outerwear',
  'casual-wear-sets'
];

db.serialize(() => {
  // Fix the typo
  db.run("UPDATE subcategories SET name = 'Outerwear' WHERE id = 'casual-wear-outerwear'", (err) => {
    if (err) console.error("Error fixing typo:", err);
    else console.log("Fixed typo for Outerwear");
  });

  // Reorder
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
