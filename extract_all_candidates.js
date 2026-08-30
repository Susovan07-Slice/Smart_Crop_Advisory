const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const packFile = 'd:/SIH PS2/SmartCrop/.git/objects/pack/pack-e60a8d60f54918d64a858b747a114998ebd101ec.pack';
const buf = fs.readFileSync(packFile);

let count = 0;
for (let i = 12; i < buf.length - 4; i++) {
  if (buf[i] === 0x78 && (buf[i+1] === 0x01 || buf[i+1] === 0x9c || buf[i+1] === 0xda || buf[i+1] === 0x5e)) {
    try {
      const decompressed = zlib.inflateSync(buf.slice(i));
      const str = decompressed.toString('utf8');
      if (str.includes('Smart Farm Advisory & Insights') && str.includes('import React')) {
        count++;
        fs.writeFileSync(`extracted_candidate_${count}.jsx`, str, 'utf8');
        console.log(`Candidate ${count}, length: ${str.length}`);
      }
    } catch(e) {}
  }
}
