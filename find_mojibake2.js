const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      scanDir(full);
    } else if (/\.(jsx?|tsx?|json|html|css)$/.test(file)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        // Look for â, ð, Ã, ?, corrupted characters
        if (/â|ð|Ã||(\?[\d,])|(\(\?[^\)]*\))/.test(l)) {
          console.log(`${full}:${idx+1}: ${l.trim()}`);
        }
      });
    }
  }
}

scanDir('d:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src');
