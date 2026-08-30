const fs = require('fs');
const path = require('path');

function findFiles(dir, name) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      if (f !== 'node_modules' && f !== '.git' && f !== 'dist') findFiles(full, name);
    } else if (f === name) {
      console.log('Found:', full, fs.statSync(full).size);
    }
  }
}

findFiles('d:/SIH PS2', 'FarmerDashboard.jsx');
