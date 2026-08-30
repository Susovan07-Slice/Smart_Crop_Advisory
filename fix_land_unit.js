const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

const stateRegex = /const \[areaHa, setAreaHa\] = useState\(\(\) => \{[\s\S]*?return farmerProfile\?\.land_area_ha \|\| 2\.5;\s*\}\);/;

const newState = `const [landUnit, setLandUnit] = useState(() => {
    return localStorage.getItem('smartCropLandUnit') || 'Hectares';
  });
  const [displayArea, setDisplayArea] = useState(() => {
    const savedArea = localStorage.getItem('smartCropDisplayArea');
    if (savedArea) return parseFloat(savedArea) || 2.5;
    const oldSaved = localStorage.getItem('smartCropLandArea');
    if (oldSaved) return parseFloat(oldSaved);
    return farmerProfile?.land_area_ha || 2.5;
  });
  const areaHa = landUnit === 'Acres' ? displayArea * 0.404686 : displayArea;`;

content = content.replace(stateRegex, newState);

const labelRegex = /<label className=\{`flex items-center text-xs font-bold uppercase mb-1\.5 \$\{isDarkMode \? 'text-slate-300' : 'text-gray-700'\}`\}>\s*<Ruler className="h-3\.5 w-3\.5 mr-1\.5 text-blue-500" \/>\s*\{t\('land_area'\)\}\s*<\/label>/;
const newLabel = `<div className={\`flex justify-between items-center text-xs font-bold uppercase mb-1.5 \${isDarkMode ? 'text-slate-300' : 'text-gray-700'}\`}>
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
                </div>`;

content = content.replace(labelRegex, newLabel);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed FarmerDashboard state and label');
