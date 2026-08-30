const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Replace all known mojibake sequences with correct characters
const replacements = [
  [/â‚¹/g, '₹'],
  [/â€“/g, '–'],
  [/â€”/g, '—'],
  [/Â°C/g, '°C'],
  [/âš¡/g, '⚡'],
  [/ðŸŒ¾/g, '🌾'],
  [/ðŸ”Š/g, '🔊'],
  [/ðŸŒ±/g, '🌱'],
  [/ðŸ †/g, '🏆'],
  [/ðŸ’¡/g, '💡'],
  [/â€¢/g, '•'],
  [/â˜€ï¸ /g, '☀️'],
  [/ðŸŒ™/g, '🌙'],
  [/dYO_/g, '🌾'],
  [/dYO/g, '🌱'],
  [/dY\?\+/g, '🏆'],
  [/dYOT/g, '🌙'],
  [/~?,\?/g, '☀️'],
  [/\s*\s*_\s*/g, ''], // corrupted crop name fragments if any
];

for (const [pattern, rep] of replacements) {
  content = content.replace(pattern, rep);
}

fs.writeFileSync(path, content, 'utf8');
console.log('FarmerDashboard.jsx cleaned successfully');
