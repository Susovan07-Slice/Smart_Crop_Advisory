const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/App.jsx';

let content = fs.readFileSync(path, 'utf8');

// Regex to remove the Smart Assistant button block
const buttonRegex = /\s*\{\/\* Smart Assistant Button[^<]*<button[^>]*onClick=\{handleTriggerChat\}[^>]*>[\s\S]*?<\/button>/;

content = content.replace(buttonRegex, '');

fs.writeFileSync(path, content, 'utf8');
console.log('Removed Smart Assistant Button');
