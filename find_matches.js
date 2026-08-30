const fs = require('fs');
const readline = require('readline');

const path = 'C:/Users/Vabyajeet Das/.gemini/antigravity/brain/c76b4637-3ff4-4e78-b894-b88ea0d29a0e/.system_generated/logs/transcript_full.jsonl';
const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let matches = [];

rl.on('line', (line) => {
  if (line.includes('const CROP_NAME_MAP = {') && line.includes('Smart Farm Advisory & Insights')) {
    try {
      const obj = JSON.parse(line);
      matches.push({ step: obj.step_index, len: line.length });
    } catch(e) {}
  }
});

rl.on('close', () => {
  console.log('Matches:', matches);
});
