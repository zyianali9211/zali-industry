const heicConvert = require('heic-convert');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'public', 'SiteData', 'Founder Pic.HEIC');
const outputPath = path.join(__dirname, '..', 'public', 'SiteData', 'Founder Pic.webp');

async function convert() {
  try {
    const inputBuffer = fs.readFileSync(inputPath);
    
    // Convert HEIC to JPEG
    const jpegBuffer = await heicConvert({
      buffer: inputBuffer,
      format: 'JPEG',
      quality: 1
    });

    // Convert JPEG to WEBP
    await sharp(jpegBuffer)
      .webp({ quality: 85 })
      .toFile(outputPath);
      
    console.log('Successfully converted HEIC to WEBP');
  } catch (error) {
    console.error('Error converting image:', error);
    process.exit(1);
  }
}

convert();
