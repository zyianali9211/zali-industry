const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const fabrics = [
  // Polyester Family
  {
    id: 'fab-interlock-poly',
    family: '01 · Polyester Family',
    familyDesc: 'Our most-used fabric type for sublimation. Polyester takes ink permanently at the molecular level, which means zero fade, zero cracking, and full color saturation across complex prints.',
    name: 'Interlock Polyester',
    spec: '160-220 GSM · 4-Way Stretch',
    description: 'Our workhorse for sublimated jerseys, tees, and performance tops. Soft hand, vivid print, full recovery after every wash.',
    bestFor: 'Jerseys, Tees',
    metaLabel: 'Stretch',
    metaValue: '4-Way',
    swatchClass: 's1',
    tag: 'Most Used'
  },
  {
    id: 'fab-birds-eye',
    family: '01 · Polyester Family',
    familyDesc: 'Our most-used fabric type for sublimation. Polyester takes ink permanently at the molecular level, which means zero fade, zero cracking, and full color saturation across complex prints.',
    name: 'Bird\'s Eye Mesh',
    spec: '140-180 GSM · Breathable',
    description: 'Hexagonal knit polyester for high-airflow sportswear. Soccer, basketball, and training tops where breathability is non-negotiable.',
    bestFor: 'Team Jerseys',
    metaLabel: 'Stretch',
    metaValue: '2-Way',
    swatchClass: 's2',
    tag: 'Performance'
  },
  {
    id: 'fab-peach-skin',
    family: '01 · Polyester Family',
    familyDesc: 'Our most-used fabric type for sublimation. Polyester takes ink permanently at the molecular level, which means zero fade, zero cracking, and full color saturation across complex prints.',
    name: 'Peach Skin Microfiber',
    spec: '90-110 GSM · Quick Dry',
    description: 'Soft brushed finish for boardshorts and lightweight athletic wear. Built for the water, quick drying, salt-resistant, abrasion tolerant.',
    bestFor: 'Boardshorts',
    metaLabel: 'Stretch',
    metaValue: 'None / 2-Way',
    swatchClass: 's3',
    tag: 'Surf / Beach'
  },
  // Cotton / Fleece Family
  {
    id: 'fab-heavy-fleece',
    family: '02 · Cotton & Fleece',
    familyDesc: 'For casual wear, hoodies, and sweats where hand-feel matters more than print intensity. Sublimation works on poly blends only, but DTF and screen print on these.',
    name: 'Heavy Fleece',
    spec: '320-400 GSM · Brushed Back',
    description: 'For pullover hoodies and crewnecks. Cotton-poly blends with eco-certified options available. Substantial drape and weight.',
    bestFor: 'Hoodies',
    metaLabel: 'Print',
    metaValue: 'DTF / Embroidery',
    swatchClass: 's6',
    tag: 'Hoodies'
  },
  {
    id: 'fab-combed-cotton',
    family: '02 · Cotton & Fleece',
    familyDesc: 'For casual wear, hoodies, and sweats where hand-feel matters more than print intensity. Sublimation works on poly blends only, but DTF and screen print on these.',
    name: 'Combed Cotton Jersey',
    spec: '180-220 GSM · 100% Cotton',
    description: 'Premium ringspun cotton for tees and casual tops. Soft, durable, and the right canvas for screen printed graphics.',
    bestFor: 'T-Shirts',
    metaLabel: 'Print',
    metaValue: 'Screen / DTF',
    swatchClass: 's7',
    tag: 'Tees'
  },
  {
    id: 'fab-palaka-plaid',
    family: '02 · Cotton & Fleece',
    familyDesc: 'For casual wear, hoodies, and sweats where hand-feel matters more than print intensity. Sublimation works on poly blends only, but DTF and screen print on these.',
    name: 'Palaka Plaid Cotton',
    spec: '200-240 GSM · Yarn-Dyed',
    description: 'Yarn-dyed plaid cotton in the right gauge for authentic palaka shirts. Sourced specifically for tropical-print apparel programs.',
    bestFor: 'Palaka Shirts',
    metaLabel: 'Print',
    metaValue: 'Yarn-Dyed Pattern',
    swatchClass: 's9',
    tag: 'Heritage'
  }
];

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS fabrics (
    id TEXT PRIMARY KEY,
    family TEXT,
    familyDesc TEXT,
    name TEXT,
    spec TEXT,
    description TEXT,
    bestFor TEXT,
    metaLabel TEXT,
    metaValue TEXT,
    swatchClass TEXT,
    tag TEXT
  )`);

  const stmt = db.prepare(`INSERT OR REPLACE INTO fabrics (id, family, familyDesc, name, spec, description, bestFor, metaLabel, metaValue, swatchClass, tag) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
  
  for (const fab of fabrics) {
    stmt.run(fab.id, fab.family, fab.familyDesc, fab.name, fab.spec, fab.description, fab.bestFor, fab.metaLabel, fab.metaValue, fab.swatchClass, fab.tag);
  }
  
  stmt.finalize();
  console.log('Fabrics migrated successfully.');
});
db.close();
