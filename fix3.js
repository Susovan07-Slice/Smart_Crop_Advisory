const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';
let content = fs.readFileSync(path, 'utf8');

const newFunc = `const formatIndianCurrency = (val, compact = false) => {
  if (val === null || val === undefined || isNaN(val)) return '\u20B90';
  const num = Math.round(Number(val));
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (compact) {
    if (absNum >= 10000000) {
      return \`\${sign}\u20B9\${(absNum / 10000000).toFixed(2)} Cr\`;
    }
    if (absNum >= 100000) {
      return \`\${sign}\u20B9\${(absNum / 100000).toFixed(2)} Lakh\`;
    }
    if (absNum >= 1000) {
      return \`\${sign}\u20B9\${absNum.toLocaleString('en-IN')}\`;
    }
    return \`\${sign}\u20B9\${absNum.toLocaleString('en-IN')}\`;
  }

  if (absNum >= 10000000) {
    return \`\${sign}\u20B9\${absNum.toLocaleString('en-IN')} (\${(absNum / 10000000).toFixed(2)} Cr)\`;
  }
  if (absNum >= 100000) {
    return \`\${sign}\u20B9\${absNum.toLocaleString('en-IN')} (\${(absNum / 100000).toFixed(2)} Lakh)\`;
  }
  return \`\${sign}\u20B9\${absNum.toLocaleString('en-IN')}\`;
};`;

// Replace from 'const formatIndianCurrency' to '};' before 'const DEFAULT_ANALYSIS_DATA'
content = content.replace(/const formatIndianCurrency = \(val, compact = false\) => \{[\s\S]*?\n\};/, newFunc);

fs.writeFileSync(path, content, 'utf8');
