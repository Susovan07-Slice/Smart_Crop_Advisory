const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const full = path.join(dir, file);
    if (fs.statSync(full).isDirectory()) {
      if (file !== 'node_modules' && file !== 'dist') scanDir(full);
    } else if (/\.(jsx?|tsx?|json|html)$/.test(file)) {
      const content = fs.readFileSync(full, 'utf8');
      const lines = content.split('\n');
      lines.forEach((l, idx) => {
        if (/â‚¹|â€“|â€”|Â°|âš¡|ðŸ|â€¢|â€˜|â€™|â€œ|â€\x9d/.test(l)) {
          console.log(`${full}:${idx+1}: ${l.trim()}`);
        }
      });
    }
  }
}

scanDir('d:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src');
