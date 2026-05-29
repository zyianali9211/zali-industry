const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const images = [
  'Casual WearDesktop.png',
  'Casual WearMobile.png',
  'Fightwear Desktop.png',
  'Fightwear Mobile (2).png',
  'Sportswear Desktop.png',
  'Sportswear Mobile.png',
  'SurfWear Desktop.png',
  'SurfWear Mobile.png',
  'Team Sports Desktop.png',
  'TeamSports Mobile.png',
  'Sublimation.png',
  'Screen Print.jpg',
  'DTF Heat Transfer.png',
  'Heat Vinyl.png'
];

const dataDir = path.join(__dirname, '..', 'public', 'SiteData');

async function convertAll() {
  for (const img of images) {
    const inputPath = path.join(dataDir, img);
    const parsed = path.parse(img);
    const outputPath = path.join(dataDir, `${parsed.name}.webp`);

    try {
      await sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath);
      console.log(`Converted: ${img} -> ${parsed.name}.webp`);
    } catch (err) {
      console.error(`Failed to convert ${img}:`, err);
    }
  }
}

convertAll();
