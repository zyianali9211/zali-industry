const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

const imagesObj = {
  "flat_lay": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/01_flat_lay.webp",
  "detail": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/02_detail.webp",
  "ghost_front": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/03_ghost_front.webp",
  "ghost_back": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/04_ghost_back.webp",
  "model_action": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/05_model_action.webp",
  "model_bottom": "FinalAllProductsZali/Downloads/Fightwear/Fight Shorts/MMA Fight Shorts-e58f47/06_model_bottom.webp"
};

const imagesJson = JSON.stringify(imagesObj);
const id = 'fightwear-fight-shorts-mma-fight-shorts-e58f47';

db.serialize(() => {
  db.run("UPDATE products SET images = ? WHERE id = ?", [imagesJson, id], function(err) {
    if (err) {
      console.error("Error updating MMA Fight Shorts:", err);
    } else {
      console.log(`Successfully updated images for ${id}. Rows affected: ${this.changes}`);
    }
  });
});

setTimeout(() => {
  db.close();
}, 1000);
