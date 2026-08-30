const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Replace formatIndianCurrency entirely
const newFunc = `const formatIndianCurrency = (val, compact = false) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.round(Number(val));
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (compact) {
    if (absNum >= 10000000) { // 1 Crore
      return \`\${sign}₹\${(absNum / 10000000).toFixed(2)} Cr\`;
    }
    if (absNum >= 100000) { // 1 Lakh
      return \`\${sign}₹\${(absNum / 100000).toFixed(2)} Lakh\`;
    }
    if (absNum >= 1000) {
      return \`\${sign}₹\${absNum.toLocaleString('en-IN')}\`;
    }
    return \`\${sign}₹\${absNum.toLocaleString('en-IN')}\`;
  }

  if (absNum >= 10000000) {
    return \`\${sign}₹\${absNum.toLocaleString('en-IN')} (\${(absNum / 10000000).toFixed(2)} Cr)\`;
  }
  if (absNum >= 100000) {
    return \`\${sign}₹\${absNum.toLocaleString('en-IN')} (\${(absNum / 100000).toFixed(2)} Lakh)\`;
  }
  return \`\${sign}₹\${absNum.toLocaleString('en-IN')}\`;
};`;

content = content.replace(/const formatIndianCurrency = \(val, compact = false\) => \{[\s\S]*?\n\};/, newFunc);

// Also replace the language block
const brokenBlockRegex = /<span className="text-\[10px\] font-black uppercase text-emerald-950 px-2 flex items-center">[\s\S]*?<button\s*type="button"\s*onClick=\{\(\) => \{\s*setWritingLang\('hi'\);\s*changeLanguage\('hi'\);\s*if \(nlpQuery\) handleNlpSubmit\(nlpQuery, 'hi'\);\s*\}\}\s*className=\{`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \$\{\s*writingLang === 'hi' \? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'\s*\}\`\}\s*>[^<]*<\/button>/g;

const fixedBlock = `<span className="text-[10px] font-black uppercase text-emerald-950 px-2 flex items-center">
                  <Globe className="h-3 w-3 mr-1 text-emerald-700" /> Language:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWritingLang('en');
                    changeLanguage('en');
                    if (nlpQuery) handleNlpSubmit(nlpQuery, 'en');
                  }}
                  className={\`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \${
                    writingLang === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }\`}
                >
                  🇮🇳 English
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWritingLang('or');
                    changeLanguage('or');
                    if (nlpQuery) handleNlpSubmit(nlpQuery, 'or');
                  }}
                  className={\`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \${
                    writingLang === 'or' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }\`}
                >
                  🇮🇳 ଓଡ଼ିଆ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setWritingLang('hi');
                    changeLanguage('hi');
                    if (nlpQuery) handleNlpSubmit(nlpQuery, 'hi');
                  }}
                  className={\`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \${
                    writingLang === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }\`}
                >
                  🇮🇳 हिन्दी
                </button>`;

content = content.replace(brokenBlockRegex, fixedBlock);

// Dark Mode / Light Mode buttons
content = content.replace(/<span>[^<]*Light Mode<\/span>/, '<span>Light Mode</span>');
content = content.replace(/<span>[^<]*Dark Mode<\/span>/, '<span>Dark Mode</span>');

fs.writeFileSync(path, content, 'utf8');
console.log("Done");
