const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// 1. Replace state initialization
const oldState = `const [areaHa, setAreaHa] = useState(() => {
    const savedArea = localStorage.getItem('smartCropLandArea');
    if (savedArea) return parseFloat(savedArea) || 2.5;
    return 2.5;
  });`;

const newState = `const [landUnit, setLandUnit] = useState(() => {
    return localStorage.getItem('smartCropLandUnit') || 'Hectares';
  });
  const [displayArea, setDisplayArea] = useState(() => {
    const savedArea = localStorage.getItem('smartCropDisplayArea');
    if (savedArea) return parseFloat(savedArea) || 2.5;
    const oldSaved = localStorage.getItem('smartCropLandArea');
    return oldSaved ? parseFloat(oldSaved) : 2.5;
  });
  const areaHa = landUnit === 'Acres' ? displayArea * 0.404686 : displayArea;`;

content = content.replace(oldState, newState);

// 2. Replace the label and input for Land Area
const oldInputLabel = `<label className={\`flex items-center text-xs font-bold uppercase mb-1.5 \${isDarkMode ? 'text-slate-300' : 'text-gray-700'}\`}>
                  <Ruler className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                  {t('land_area')}
                </label>`;

const newInputLabel = `<label className={\`flex justify-between items-center text-xs font-bold uppercase mb-1.5 \${isDarkMode ? 'text-slate-300' : 'text-gray-700'}\`}>
                  <span className="flex items-center">
                    <Ruler className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                    {t('land_area')}
                  </span>
                  <select
                    value={landUnit}
                    onChange={(e) => {
                      const newUnit = e.target.value;
                      setLandUnit(newUnit);
                      localStorage.setItem('smartCropLandUnit', newUnit);
                      runFullPipeline(location, season, newUnit === 'Acres' ? displayArea * 0.404686 : displayArea, loanProfile);
                    }}
                    className={\`ml-2 text-[10px] bg-transparent font-extrabold cursor-pointer outline-none \${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}\`}
                  >
                    <option value="Hectares" className="text-gray-900">Hectares</option>
                    <option value="Acres" className="text-gray-900">Acres</option>
                  </select>
                </label>`;

content = content.replace(oldInputLabel, newInputLabel);

// 3. Replace value and onChange for the input
content = content.replace(/value=\{areaHa\}/, "value={displayArea}");
content = content.replace(/onChange=\{\(e\) => setAreaHa\(parseFloat\(e\.target\.value\) \|\| 1\.0\)\}/, "onChange={(e) => { setDisplayArea(parseFloat(e.target.value) || 1.0); localStorage.setItem('smartCropDisplayArea', e.target.value); }}");

// 4. Replace occurrences of "{areaHa} Ha Total Land" and similar strings
content = content.replace(/\{areaHa\} Ha Total Land/g, "{displayArea} {landUnit === 'Acres' ? 'Acres' : 'Ha'} Total Land");
content = content.replace(/\(\{areaHa\} Ha\s*\n*\s*Land\)/g, "({displayArea} {landUnit === 'Acres' ? 'Acres' : 'Ha'} Land)");
content = content.replace(/₹75,000 \/ ha/g, "{landUnit === 'Acres' ? '₹30,351 / acre' : '₹75,000 / ha'}");

fs.writeFileSync(path, content, 'utf8');
console.log('Updated FarmerDashboard for land area unit support');
