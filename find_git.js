const fs = require('fs');
const path = require('path');

function findGit(dir, depth = 0) {
  if (depth > 4) return;
  try {
    const files = fs.readdirSync(dir);
    for (const f of files) {
      const full = path.join(dir, f);
      if (f === '.git') {
        console.log('Found .git:', full);
      } else if (fs.statSync(full).isDirectory() && f !== 'node_modules') {
        findGit(full, depth + 1);
      }
    }
  } catch(e) {}
}

findGit('d:/SIH PS2');
