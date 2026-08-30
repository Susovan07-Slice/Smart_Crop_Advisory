const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

const rs = String.fromCharCode(8377);
content = content.replace(/\?30,351 /g, rs + "30,351 ");
content = content.replace(/\?75,000 /g, rs + "75,000 ");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed rupees symbol using charCode');
