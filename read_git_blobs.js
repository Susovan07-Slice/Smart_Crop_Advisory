const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function scanGitObjects(gitDir) {
  const objDir = path.join(gitDir, 'objects');
  if (!fs.existsSync(objDir)) return;
  const dirs = fs.readdirSync(objDir);
  let best = null;
  let bestMtime = 0;

  for (const d of dirs) {
    if (d === 'info' || d === 'pack') continue;
    const sub = path.join(objDir, d);
    const files = fs.readdirSync(sub);
    for (const f of files) {
      const objPath = path.join(sub, f);
      try {
        const compressed = fs.readFileSync(objPath);
        const decompressed = zlib.inflateSync(compressed);
        const str = decompressed.toString('utf8');
        if (str.includes('Smart Farm Advisory & Insights') && str.includes('LocationPickerMap')) {
          const stat = fs.statSync(objPath);
          console.log(`Found git blob ${d}${f}, length: ${str.length}, mtime: ${stat.mtime}`);
          if (stat.mtimeMs > bestMtime) {
            bestMtime = stat.mtimeMs;
            best = str;
          }
        }
      } catch (e) {}
    }
  }
  return best;
}

const res = scanGitObjects('d:/SIH PS2/SmartCrop/.git') || scanGitObjects('d:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/.git');
if (res) {
  // Remove git header "blob <size>\0"
  const nullIdx = res.indexOf('\0');
  const fileContent = res.slice(nullIdx + 1);
  fs.writeFileSync('restored_from_git.jsx', fileContent, 'utf8');
  console.log('Successfully saved restored_from_git.jsx, length:', fileContent.length);
} else {
  console.log('No matching git blob found');
}
