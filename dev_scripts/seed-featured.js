const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const pIds = [
  'fightwear-fight-shorts-bjj-grappling-shorts',
  'casual-wear-tshirts-crew-neck-full-sleeve-sublimated-t-shirt',
  'team-team-training-tops-compression-top-long-sleeve', // Wait, the subcategory is 'training-tops'. The id might be different. Let's just use LIKE
];

db.serialize(() => {
  db.run(`UPDATE products SET is_featured = 1 WHERE name LIKE '%BJJ Grappling Shorts%' OR name LIKE '%crew neck full sleeve sublimated%' OR name LIKE '%Compression Top (Long Sleeve)%' OR name LIKE '%Aloha Camp Shirt%'`, (err) => {
    if (err) {
      console.error(err);
    } else {
      console.log('Updated default featured products.');
    }
  });
});
db.close();
