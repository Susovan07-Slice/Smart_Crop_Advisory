const fs = require('fs');
const readline = require('readline');

const path = 'C:/Users/Vabyajeet Das/.gemini/antigravity/brain/c76b4637-3ff4-4e78-b894-b88ea0d29a0e/.system_generated/logs/transcript_full.jsonl';
const fileStream = fs.createReadStream(path);
const rl = readline.createInterface({
  input: fileStream,
  crlfDelay: Infinity
});

let found = [];

rl.on('line', (line) => {
  if (line.includes('CROP_INSIGHTS_DATABASE') && line.includes('Soil & Sowing Requirements')) {
    found.push(line);
  }
});

rl.on('close', () => {
  console.log('Found CROP_INSIGHTS_DATABASE occurrences:', found.length);
  for (let i = 0; i < found.length; i++) {
    console.log(`Occurrence ${i+1}, length: ${found[i].length}`);
    fs.writeFileSync(`trans_match_${i+1}.json`, found[i], 'utf8');
  }
});
