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
  if (line.includes('const formatIndianCurrency = (val, compact = false) => {') && line.includes('const DEFAULT_ANALYSIS_DATA = {')) {
    found.push(line);
  }
});

rl.on('close', () => {
  console.log('Found occurrences:', found.length);
  if (found.length > 0) {
    fs.writeFileSync('found_in_transcript.jsonl', found[found.length - 1], 'utf8');
    console.log('Saved last occurrence, size:', found[found.length - 1].length);
  }
});
