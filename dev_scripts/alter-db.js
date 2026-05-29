const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Try adding columns. If they already exist, it will throw an error, which we catch.
  db.run("ALTER TABLE products ADD COLUMN printMethods TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added printMethods column.");
  });
  db.run("ALTER TABLE products ADD COLUMN sizeRange TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added sizeRange column.");
  });
  db.run("ALTER TABLE products ADD COLUMN leadTime TEXT", (err) => {
    if (err) console.log(err.message);
    else console.log("Added leadTime column.");
  });
});

db.close((err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Done migrating db.');
});
