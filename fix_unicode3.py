import re

file_path = r"d:\SIH PS2\SmartCrop\SmartCrop-main\SmartCrop-main\frontend\src\pages\FarmerDashboard.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# I will just carefully reconstruct that block based on standard layout
broken_block_regex = r"<span className=\"text-\[10px\] font-black uppercase text-emerald-950 px-2 flex items-center\">\s*<Globe className=\"h-3 w-3 mr-1 text-emerald-700\" /> Language:\s*</span>\s*<button\s*type=\"button\"\s*onClick=\{\(\) =>\?\?\?\? English</button>\s*<button\s*type=\"button\"\s*onClick=\{\(\) => \{\s*setWritingLang\('or'\);\s*changeLanguage\('or'\);\s*if \(nlpQuery\) handleNlpSubmit\(nlpQuery, 'or'\);\s*\}\}\s*className=\{`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \$\{\s*writingLang === 'or' \? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'\s*\}\`\}\s*>\?\?\?\? \?\?\?\?\?</button>\s*<button\s*type=\"button\"\s*onClick=\{\(\) => \{\s*setWritingLang\('hi'\);\s*changeLanguage\('hi'\);\s*if \(nlpQuery\) handleNlpSubmit\(nlpQuery, 'hi'\);\s*\}\}\s*className=\{`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer \$\{\s*writingLang === 'hi' \? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'\s*\}\`\}\s*>\?\?\?\? \?\?\?\?\?\?</button>"

fixed_block = """<span className="text-[10px] font-black uppercase text-emerald-950 px-2 flex items-center">
                  <Globe className="h-3 w-3 mr-1 text-emerald-700" /> Language:
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setWritingLang('en');
                    changeLanguage('en');
                    if (nlpQuery) handleNlpSubmit(nlpQuery, 'en');
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    writingLang === 'en' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }`}
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
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    writingLang === 'or' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }`}
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
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                    writingLang === 'hi' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-900 hover:bg-emerald-200'
                  }`}
                >
                  🇮🇳 हिन्दी
                </button>"""

content = re.sub(broken_block_regex, fixed_block, content, flags=re.DOTALL)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
