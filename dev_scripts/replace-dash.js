const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');

function replaceDash(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace actual em dash with surrounding spaces or no spaces
  // \s* matches 0 or more whitespace characters
  // \u2014 is the em dash
  content = content.replace(/\s*\u2014\s*/g, ', ');
  
  // Replace HTML entity mdash
  content = content.replace(/\s*&mdash;\s*/g, ', ');
  
  fs.writeFileSync(filePath, content, 'utf8');
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.html') || fullPath.endsWith('.js')) {
      replaceDash(fullPath);
    }
  }
}

scanDir(publicDir);
console.log("Done replacing em dashes.");
