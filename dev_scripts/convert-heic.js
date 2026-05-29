const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'SiteData', 'Founder Pic.HEIC');
const outputPath = path.join(__dirname, '..', 'public', 'SiteData', 'Founder Pic.webp');

async function convert() {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log('Successfully converted HEIC to WEBP');
  } catch (error) {
    console.error('Error converting image with sharp:', error);
    
    // If sharp fails because libvips isn't compiled with HEIC support, we might need heic-convert
    process.exit(1);
  }
}

convert();
