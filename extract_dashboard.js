const fs = require('fs');
const readline = require('readline');

const path = 'C:/Users/Vabyajeet Das/.gemini/antigravity/brain/c76b4637-3ff4-4e78-b894-b88ea0d29a0e/.system_generated/logs/transcript_full.jsonl';
const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let lastGoodContent = null;

rl.on('line', (line) => {
  if (line.includes('FarmerDashboard.jsx') && line.includes('import React')) {
    try {
      const obj = JSON.parse(line);
      const str = JSON.stringify(obj);
      // check if it has the full file content
      if (str.includes('const CROP_NAME_MAP') && str.includes('const formatIndianCurrency')) {
        lastGoodContent = obj;
      }
    } catch(e) {}
  }
});

rl.on('close', () => {
  if (lastGoodContent) {
    console.log('Found full content in step:', lastGoodContent.step_index);
    fs.writeFileSync('restored_raw.json', JSON.stringify(lastGoodContent, null, 2), 'utf8');
  } else {
    console.log('Not found');
  }
});
