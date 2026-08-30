const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const packDir = 'd:/SIH PS2/SmartCrop/.git/objects/pack';
if (fs.existsSync(packDir)) {
  const files = fs.readdirSync(packDir);
  console.log('Pack files:', files);
  for (const f of files) {
    if (f.endsWith('.pack')) {
      const buf = fs.readFileSync(path.join(packDir, f));
      console.log(`Processing ${f}, size: ${buf.length}`);
      // Search for decompressed streams in pack
      for (let i = 12; i < buf.length - 4; i++) {
        // Git pack objects start with header byte and zlib 0x78
        if (buf[i] === 0x78 && (buf[i+1] === 0x01 || buf[i+1] === 0x9c || buf[i+1] === 0xda || buf[i+1] === 0x5e)) {
          try {
            const decompressed = zlib.inflateSync(buf.slice(i));
            const str = decompressed.toString('utf8');
            if (str.includes('FarmerDashboard') || (str.includes('CROP_NAME_MAP') && str.includes('ODISHA_DISTRICTS'))) {
              console.log('Found matching object of length:', str.length);
              fs.writeFileSync('extracted_dashboard_from_pack.jsx', str, 'utf8');
            }
          } catch(e) {}
        }
      }
    }
  }
}
