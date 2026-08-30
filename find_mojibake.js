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
      let found = false;
      lines.forEach((l, idx) => {
        if (/[\u00C0-\u024F\uFFFD]/.test(l) || /â|ð|Ã|/.test(l)) {
          if (!found) {
            console.log('\n--- File:', full);
            found = true;
          }
          console.log(`L${idx+1}: ${l.trim()}`);
        }
      });
    }
  }
}

scanDir('d:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src');
