const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Fix translation keys
content = content.replace(/t\('smartfarmadvisorytitle'\)/g, "t('smart_farm_advisory_title')");
content = content.replace(/t\('smartfarmadvisorysubtitle'\)/g, "t('smart_farm_advisory_subtitle')");

// Fix farmerName
content = content.replace(/\$\{farmerProfile\.firstname\} \$\{farmerProfile\.lastname \|\| ''\}/g, "${farmerProfile.first_name} ${farmerProfile.last_name || ''}");
content = content.replace(/farmerProfile\.firstname/g, "farmerProfile.first_name");
content = content.replace(/farmerProfile\.lastname/g, "farmerProfile.last_name");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed dashboard title and farmer name');
