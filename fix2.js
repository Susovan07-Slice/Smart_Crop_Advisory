const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

// Replace all '?0' inside formatIndianCurrency
content = content.replace(/return '\?0';/g, "return '₹0';");
// Replace all `${sign}?${ with `${sign}₹${
content = content.replace(/\$\{sign\}\?\$\{/g, "${sign}₹${");

fs.writeFileSync(path, content, 'utf8');
