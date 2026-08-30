const fs = require('fs');
const path = 'd:/SIH PS2/SmartCrop/SmartCrop-main/SmartCrop-main/frontend/src/pages/FarmerDashboard.jsx';

let content = fs.readFileSync(path, 'utf8');

// Fix asset import
content = content.replace(/smartbot\.png/g, 'smart_bot.png');

// Fix API and Constant names
content = content.replace(/\bAPIBASE\b/g, 'API_BASE');
content = content.replace(/\bDEFAULTANALYSISDATA\b/g, 'DEFAULT_ANALYSIS_DATA');
content = content.replace(/\bODISHADISTRICTS\b/g, 'ODISHA_DISTRICTS');
content = content.replace(/\bODISHADISTRICTSCOORDS\b/g, 'ODISHA_DISTRICTS_COORDS');
content = content.replace(/\bCROPNAMEMAP\b/g, 'CROP_NAME_MAP');
content = content.replace(/\bCROPINSIGHTSDATABASE\b/g, 'CROP_INSIGHTS_DATABASE');

// Fix schema properties in analysis / response
content = content.replace(/\bcroprecommendation\b/g, 'crop_recommendation');
content = content.replace(/\brecommendedcrop\b/g, 'recommended_crop');
content = content.replace(/\byieldperha\b/g, 'yield_per_ha');
content = content.replace(/\bcandidatecrops\b/g, 'candidate_crops');
content = content.replace(/\bsuitabilityscore\b/g, 'suitability_score');
content = content.replace(/\bexpectednetprofit\b/g, 'expected_net_profit');
content = content.replace(/\btotalcultivationcost\b/g, 'total_cultivation_cost');
content = content.replace(/\bsafetyscore\b/g, 'safety_score');
content = content.replace(/\bprofitanalysis\b/g, 'profit_analysis');
content = content.replace(/\bnetprofitinr\b/g, 'net_profit_inr');
content = content.replace(/\btotalrevenueinr\b/g, 'total_revenue_inr');
content = content.replace(/\btotalcostinr\b/g, 'total_cost_inr');
content = content.replace(/\bformattedprofit\b/g, 'formatted_profit');
content = content.replace(/\bformattedrevenue\b/g, 'formatted_revenue');
content = content.replace(/\broipercent\b/g, 'roi_percent');
content = content.replace(/\bmarketpricesummary\b/g, 'market_price_summary');
content = content.replace(/\bmandipriceperquintal\b/g, 'mandi_price_per_quintal');
content = content.replace(/\bforecast15d\b/g, 'forecast_15d');
content = content.replace(/\bforecast30d\b/g, 'forecast_30d');
content = content.replace(/\bforecast90d\b/g, 'forecast_90d');

// Fix profile properties
content = content.replace(/\bfirst_name\b/g, 'first_name');
content = content.replace(/\blast_name\b/g, 'last_name');
content = content.replace(/\bland_area_ha\b/g, 'land_area_ha');
content = content.replace(/farmerProfile\?\.firstname/g, 'farmerProfile?.first_name');
content = content.replace(/farmerProfile\?\.lastname/g, 'farmerProfile?.last_name');
content = content.replace(/farmerProfile\?\.landareaha/g, 'farmerProfile?.land_area_ha');

// Fix loan profile properties
content = content.replace(/\bhas_loan\b/g, 'has_loan');
content = content.replace(/hasloan/g, 'has_loan');
content = content.replace(/loanamount/g, 'loan_amount');
content = content.replace(/interestrate/g, 'interest_rate');
content = content.replace(/monthlyinstallment/g, 'monthly_installment');
content = content.replace(/lendersource/g, 'lender_source');
content = content.replace(/isdefaulted/g, 'is_defaulted');
content = content.replace(/repaymentstatus/g, 'repayment_status');
content = content.replace(/distresslevel/g, 'distress_level');
content = content.replace(/risklabel/g, 'risk_label');
content = content.replace(/loanprofile/g, 'loan_profile');
content = content.replace(/loanProfile/g, 'loanProfile');

// Fix financial distress score and key names
content = content.replace(/\bfinancialdistressscore\b/g, 'financial_distress_score');

// Fix t('...') keys
content = content.replace(/t\('toprecommendedcrop'\)/g, "t('top_recommended_crop')");
content = content.replace(/t\('totalcultivationcost'\)/g, "t('total_cultivation_cost')");
content = content.replace(/t\('totalgrossrevenue'\)/g, "t('total_gross_revenue')");
content = content.replace(/t\('expectednetprofit'\)/g, "t('expected_net_profit')");
content = content.replace(/t\('cultivationcost'\)/g, "t('cultivation_cost')");
content = content.replace(/t\('profitmargin'\)/g, "t('profit_margin')");
content = content.replace(/t\('farmingseason'\)/g, "t('farming_season')");
content = content.replace(/t\('landarea'\)/g, "t('land_area')");
content = content.replace(/t\('soilprofilebadge'\)/g, "t('soil_profile_badge')");
content = content.replace(/t\('regionalsoilchemistryprofile'\)/g, "t('regional_soil_chemistry_profile')");
content = content.replace(/t\('mandipricetrendforecast'\)/g, "t('mandi_price_trend_forecast')");
content = content.replace(/t\('todaymandiprice'\)/g, "t('today_mandi_price')");
content = content.replace(/t\('forecastbadge'\)/g, "t('forecast_badge')");
content = content.replace(/t\('viewinsights'\)/g, "t('view_insights')");
content = content.replace(/t\('listentoadvisory'\)/g, "t('listen_to_advisory')");
content = content.replace(/t\('stopaudio'\)/g, "t('stop_audio')");
content = content.replace(/t\('whythiscropwasrecommended'\)/g, "t('why_this_crop_was_recommended')");
content = content.replace(/t\('croprecommendation'\)/g, "t('crop_recommendation')");
content = content.replace(/t\('candidatecrops'\)/g, "t('candidate_crops')");

fs.writeFileSync(path, content, 'utf8');
console.log('Restored identifiers with underscores');
