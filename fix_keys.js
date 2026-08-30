const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

content = content.replace(/t\('15dayforecast'\)/g, "t('next_15_days') || '15 Day Forecast'");
content = content.replace(/t\('30dayforecast'\)/g, "t('next_30_days') || '30 Day Forecast'");
content = content.replace(/t\('90dayforecast'\)/g, "t('next_90_days') || '90 Day Forecast'");
content = content.replace(/t\('estimatedfinancialreturnsbreakdown'\)/g, "t('cultivation_cost_net_profit_estimate') || 'Estimated Financial Returns Breakdown'");

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed forecast translation keys');
