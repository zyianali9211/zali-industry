const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS fabric_families (
    id TEXT PRIMARY KEY,
    name TEXT,
    description TEXT
  )`);

  const families = [
    { id: 'polyester', name: '01 · Polyester Family', description: 'Our most-used fabric type for sublimation. Polyester takes ink permanently at the molecular level, which means zero fade, zero cracking, and full color saturation across complex prints.' },
    { id: 'cotton-fleece', name: '02 · Cotton & Fleece', description: 'For casual wear, hoodies, and sweats where hand-feel matters more than print intensity. Sublimation works on poly blends only, but DTF and screen print on these.' }
  ];

  const stmt = db.prepare(`INSERT OR REPLACE INTO fabric_families (id, name, description) VALUES (?, ?, ?)`);
  families.forEach(f => {
    stmt.run(f.id, f.name, f.description);
  });
  stmt.finalize();

  console.log('Fabric families migrated.');
});
db.close();
