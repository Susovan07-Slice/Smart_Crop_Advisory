import React, { useState, useEffect, useRef } from 'react';
import FarmerChat from './FarmerChat';
import { 
  MapPin, Sprout, TrendingUp, DollarSign, Award, Search, ChevronDown, 
  LocateFixed, LineChart, ShieldCheck, Volume2, X, User, Sun, Moon, CreditCard,
  Droplets, Clock, Sparkles, Globe
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import CreditScoreGauge from '../components/CreditScoreGauge';
import LoanInformationModal from '../components/LoanInformationModal';
import smartBotImg from '../assets/smart_bot.png';

const API_BASE = "http://127.0.0.1:8000";

const formatIndianCurrency = (val, compact = false) => {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  const num = Math.round(Number(val));
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (compact) {
    if (absNum >= 10000000) { // 1 Crore
      return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`;
    }
    if (absNum >= 100000) { // 1 Lakh
      return `${sign}₹${(absNum / 100000).toFixed(2)} Lakh`;
    }
    if (absNum >= 1000) {
      return `${sign}₹${absNum.toLocaleString('en-IN')}`;
    }
    return `${sign}₹${absNum.toLocaleString('en-IN')}`;
  }

  if (absNum >= 10000000) {
    return `${sign}₹${absNum.toLocaleString('en-IN')} (${(absNum / 10000000).toFixed(2)} Cr)`;
  }
  if (absNum >= 100000) {
    return `${sign}₹${absNum.toLocaleString('en-IN')} (${(absNum / 100000).toFixed(2)} Lakh)`;
  }

  return `${sign}₹${absNum.toLocaleString('en-IN')}`;
};

const DEFAULT_ANALYSIS_DATA = {
  crop_recommendation: {
    recommended_crop: 'Moong(Green Gram)',
    yield_per_ha: 3.65,
    reasons: [
      'Optimal soil pH and climate match for selected Odisha district',
      'High market price stability and MSP government procurement support',
      'Low water footprint requirement, ideal for sustainable yield'
    ]
  },
  candidate_crops: [
    { crop: 'Moong(Green Gram)', suitability_score: 95.2, expected_net_profit: 4432816, total_cultivation_cost: 4310000, safety_score: 85 },
    { crop: 'Groundnut', suitability_score: 88.5, expected_net_profit: 4416490, total_cultivation_cost: 6350000, safety_score: 78 },
    { crop: 'Ragi', suitability_score: 94.9, expected_net_profit: 3250000, total_cultivation_cost: 3500000, safety_score: 92 },
    { crop: 'Rice', suitability_score: 82.1, expected_net_profit: 3850000, total_cultivation_cost: 7500000, safety_score: 80 },
    { crop: 'Maize', suitability_score: 79.4, expected_net_profit: 3100000, total_cultivation_cost: 5200000, safety_score: 75 }
  ],
  profit_analysis: {
    net_profit_inr: 4432816,
    total_revenue_inr: 8742816,
    total_cost_inr: 7500000,
    formatted_profit: '₹44,32,816 (44.33 Lakh)',
    formatted_revenue: '₹87,42,816 (87.43 Lakh)',
    roi_percent: 102.85
  },
  market_price_summary: {
    mandi_price_per_quintal: 9714.24,
    forecast_15d: 10361,
    forecast_30d: 10599,
    forecast_90d: 11548
  }
};

const ODISHA_DISTRICTS = [
  "Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh", 
  "Dhenkanal","Gajapati","Ganjam","Jagatsinghpur","Jajpur","Jharsuguda","Kalahandi", 
  "Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj", 
  "Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Subarnapur","Sundargarh"
];

const ODISHA_DISTRICTS_COORDS = {
  'Angul': { lat: 20.84, lon: 85.10 },
  'Balangir': { lat: 20.72, lon: 83.48 },
  'Balasore': { lat: 21.49, lon: 86.93 },
  'Bargarh': { lat: 21.33, lon: 83.62 },
  'Bhadrak': { lat: 21.06, lon: 86.50 },
  'Boudh': { lat: 20.84, lon: 84.32 },
  'Cuttack': { lat: 20.46, lon: 85.88 },
  'Deogarh': { lat: 21.54, lon: 84.73 },
  'Dhenkanal': { lat: 20.66, lon: 85.60 },
  'Gajapati': { lat: 18.77, lon: 84.09 },
  'Ganjam': { lat: 19.38, lon: 85.05 },
  'Jagatsinghpur': { lat: 20.27, lon: 86.17 },
  'Jajpur': { lat: 20.85, lon: 86.33 },
  'Jharsuguda': { lat: 21.86, lon: 84.01 },
  'Kalahandi': { lat: 19.91, lon: 83.16 },
  'Kandhamal': { lat: 20.20, lon: 84.05 },
  'Kendrapara': { lat: 20.50, lon: 86.42 },
  'Kendujhar': { lat: 21.63, lon: 85.58 },
  'Khordha': { lat: 20.18, lon: 85.62 },
  'Koraput': { lat: 18.81, lon: 82.71 },
  'Malkangiri': { lat: 18.35, lon: 81.90 },
  'Mayurbhanj': { lat: 21.93, lon: 86.73 },
  'Nabarangpur': { lat: 19.23, lon: 82.55 },
  'Nayagarh': { lat: 20.13, lon: 85.10 },
  'Nuapada': { lat: 20.83, lon: 82.52 },
  'Puri': { lat: 19.81, lon: 85.83 },
  'Rayagada': { lat: 19.17, lon: 83.42 },
  'Sambalpur': { lat: 21.47, lon: 83.97 },
  'Subarnapur': { lat: 20.83, lon: 83.92 },
  'Sundargarh': { lat: 22.12, lon: 84.03 }
};

const CROP_NAME_MAP = {
  Rice: { hi: "धान", or: "ଧାନ" },
  Ragi: { hi: "रागी (मडुआ)", or: "ମାଣ୍ଡିଆ (ରାଗି)" },
  "Moong(Green Gram)": { hi: "मूंग (हरा चना)", or: "ମୁଗ (ସବୁଜ ଡାଲି)" },
  Moong: { hi: "मूंग (हरा चना)", or: "ମୁଗ (ସବୁଜ ଡାଲି)" },
  Groundnut: { hi: "मूंगफली", or: "ଚିନାବାଦାମ" },
  Jute: { hi: "जूट", or: "ଜୋଟ" },
  Maize: { hi: "मक्का", or: "ମକା" },
  Cotton: { hi: "कपास", or: "କପା" },
  Sugarcane: { hi: "गन्ना", or: "ଖୁସି" },
  Pulses: { hi: "दालें", or: "ଡାଲି" },
  Sesamum: { hi: "तिल", or: "ଖସା" },
  Wheat: { hi: "गेहूं", or: "ଗହମ" },
  Mustard: { hi: "सरसों", or: "ସୋରିଷ" },
  Potato: { hi: "आलू", or: "ଆଳୁ" },
  Urad: { hi: "उड़द", or: "ବିରି" },
  Arhar: { hi: "अरहर", or: "ହରଡ" },
  Gram: { hi: "चना", or: "ବୁଟ" }
};

const CROP_INSIGHTS_DATABASE = {
  "moong": {
    soil: "Well-drained sandy loam or fertile loam (pH 6.0 - 7.5). Avoid waterlogged soils.",
    sowing: "Kharif (June–July) or Summer (March). Ideal temp: 25°C - 35°C.",
    water: "Low (250 - 300 mm). Requires 2–3 light irrigations; highly drought tolerant.",
    npk: "20:40:20 kg/ha NPK + Rhizobium seed treatment for soil nitrogen bio-fixation.",
    pest: "Yellow Mosaic Virus & Pod Borer. Spray Neem oil (5ml/L) or Imidacloprid early.",
    market: "High MSP Support (₹8,558/Quintal). Pulse crop enriches soil nitrogen naturally!",
    duration: "60 - 70 Days",
    yield: "1.2 - 1.5 Tons / Ha"
  },
  "moong(green gram)": {
    soil: "Well-drained sandy loam or fertile loam (pH 6.0 - 7.5). Avoid waterlogged soils.",
    sowing: "Kharif (June–July) or Summer (March). Ideal temp: 25°C - 35°C.",
    water: "Low (250 - 300 mm). Requires 2–3 light irrigations; highly drought tolerant.",
    npk: "20:40:20 kg/ha NPK + Rhizobium seed treatment for soil nitrogen bio-fixation.",
    pest: "Yellow Mosaic Virus & Pod Borer. Spray Neem oil (5ml/L) or Imidacloprid early.",
    market: "High MSP Support (₹8,558/Quintal). Pulse crop enriches soil nitrogen naturally!",
    duration: "60 - 70 Days",
    yield: "1.2 - 1.5 Tons / Ha"
  },
  "green gram": {
    soil: "Well-drained sandy loam or fertile loam (pH 6.0 - 7.5). Avoid waterlogged soils.",
    sowing: "Kharif (June–July) or Summer (March). Ideal temp: 25°C - 35°C.",
    water: "Low (250 - 300 mm). Requires 2–3 light irrigations; highly drought tolerant.",
    npk: "20:40:20 kg/ha NPK + Rhizobium seed treatment for soil nitrogen bio-fixation.",
    pest: "Yellow Mosaic Virus & Pod Borer. Spray Neem oil (5ml/L) or Imidacloprid early.",
    market: "High MSP Support (₹8,558/Quintal). Pulse crop enriches soil nitrogen naturally!",
    duration: "60 - 70 Days",
    yield: "1.2 - 1.5 Tons / Ha"
  },
  "groundnut": {
    soil: "Friable sandy loam rich in organic matter & calcium. Good aeration for peg development.",
    sowing: "Kharif (June) or Rabi (Nov–Dec). Ideal temp: 22°C - 30°C.",
    water: "Moderate (450 - 500 mm). Critical watering during flowering and pegging stages.",
    npk: "25:50:40 kg/ha NPK + Gypsum @ 400 kg/ha at peg formation for pod shell filling.",
    pest: "Tikka leaf spot & Root Rot. Apply Trichoderma bio-fungicide & Mancozeb spray.",
    market: "Mandi price range: ₹6,200 - ₹7,200/Quintal. High oil seed market demand.",
    duration: "105 - 120 Days",
    yield: "2.2 - 2.8 Tons / Ha"
  },
  "ragi": {
    soil: "Red loam, clay loam, or light soils. Tolerates acidic soils common in Odisha.",
    sowing: "Kharif (June–July). Ideal temp: 20°C - 32°C.",
    water: "Low (350 - 400 mm). Extremely climate resilient; thrives in rainfed Odisha districts.",
    npk: "40:20:20 kg/ha NPK. Organic farmyard manure (FYM) gives dense grains.",
    pest: "Highly resistant to major pests. Watch for blast disease during wet spells.",
    market: "Odisha Millet Mission scheme bonus + MSP (₹3,840/Quintal). Guaranteed govt procurement!",
    duration: "95 - 110 Days",
    yield: "1.8 - 2.4 Tons / Ha"
  },
  "finger millet": {
    soil: "Red loam, clay loam, or light soils. Tolerates acidic soils common in Odisha.",
    sowing: "Kharif (June–July). Ideal temp: 20°C - 32°C.",
    water: "Low (350 - 400 mm). Extremely climate resilient; thrives in rainfed Odisha districts.",
    npk: "40:20:20 kg/ha NPK. Organic farmyard manure (FYM) gives dense grains.",
    pest: "Highly resistant to major pests. Watch for blast disease during wet spells.",
    market: "Odisha Millet Mission scheme bonus + MSP (₹3,840/Quintal). Guaranteed govt procurement!",
    duration: "95 - 110 Days",
    yield: "1.8 - 2.4 Tons / Ha"
  },
  "rice": {
    soil: "Heavy clay or clay loam soil with good water retention capacity (pH 5.5 - 7.0).",
    sowing: "Kharif (June–July). Ideal temp: 20°C - 37°C.",
    water: "High (1200 - 1400 mm). Requires standing water or Alternate Wetting & Drying (AWD).",
    npk: "80:40:40 kg/ha NPK + Zinc Sulphate @ 25 kg/ha to prevent Khaira disease.",
    pest: "Stem Borer & Rice Blast. Apply Neem oil or Carbofuran granules as preventative.",
    market: "Mandatory MSP procurement (₹2,300/Quintal). PM-KISAN & KALIA financial support.",
    duration: "120 - 140 Days",
    yield: "3.5 - 4.5 Tons / Ha"
  },
  "paddy": {
    soil: "Heavy clay or clay loam soil with good water retention capacity (pH 5.5 - 7.0).",
    sowing: "Kharif (June–July). Ideal temp: 20°C - 37°C.",
    water: "High (1200 - 1400 mm). Requires standing water or Alternate Wetting & Drying (AWD).",
    npk: "80:40:40 kg/ha NPK + Zinc Sulphate @ 25 kg/ha to prevent Khaira disease.",
    pest: "Stem Borer & Rice Blast. Apply Neem oil or Carbofuran granules as preventative.",
    market: "Mandatory MSP procurement (₹2,300/Quintal). PM-KISAN & KALIA financial support.",
    duration: "120 - 140 Days",
    yield: "3.5 - 4.5 Tons / Ha"
  },
  "maize": {
    soil: "Deep fertile loam or silt loam with good drainage (pH 6.0 - 7.5).",
    sowing: "Kharif (June) or Rabi (Oct–Nov). Ideal temp: 21°C - 30°C.",
    water: "Moderate (500 - 600 mm). Critical at knee-high and tasseling stages.",
    npk: "120:60:40 kg/ha NPK. Apply Nitrogen in 3 split doses.",
    pest: "Fall Armyworm (FAW). Spray Emamectin Benzoate 5% SG @ 0.4g/L if leaf damage seen.",
    market: "High demand in Odisha cattle & poultry feed industries. Mandi price: ₹2,200 - ₹2,600/Q.",
    duration: "90 - 110 Days",
    yield: "4.0 - 5.5 Tons / Ha"
  },
  "mustard": {
    soil: "Loam to heavy clay loam soil. Cool temperature crops (Rabi season).",
    sowing: "Rabi (Oct–Nov). Ideal temp: 15°C - 25°C.",
    water: "Low (250 - 350 mm). 2 light irrigations at flowering and pod filling.",
    npk: "60:30:30 kg/ha NPK + Elemental Sulphur @ 20 kg/ha for higher oil content.",
    pest: "Mustard Aphids. Spray Dimethoate 30% EC @ 1.5ml/L during early bloom.",
    market: "MSP Support (₹5,650/Quintal). High demand for edible mustard oil in Odisha.",
    duration: "85 - 100 Days",
    yield: "1.2 - 1.8 Tons / Ha"
  }
};

const defaultCropInsight = (cropName) => ({
  soil: "Well-drained fertile loam soil with adequate organic matter (pH 6.0 - 7.5).",
  sowing: "Kharif / Rabi season depending on regional moisture and temperature.",
  water: "Moderate irrigation (400 - 500 mm). Maintain soil moisture without waterlogging.",
  npk: "Balanced NPK (60:30:30 kg/ha) + organic compost for healthy root growth.",
  pest: "Monitor weekly for chewing insects and leaf spots. Use bio-pesticides or Neem oil.",
  market: "Local Odisha mandi demand. Eligible for PM-KISAN and PMFBY crop insurance support.",
  duration: "90 - 120 Days",
  yield: "2.0 - 3.5 Tons / Ha"
});

const MandiPriceChart = ({ prices, cropName, isDarkMode }) => {
  const { priceToday, price15, price30, price90 } = prices;
  const pts = [
    { label: 'Today', val: priceToday, pct: 'Base', x: 50 },
    { label: '+15 Days', val: price15, pct: '+3.8%', x: 180 },
    { label: '+30 Days', val: price30, pct: '+7.5%', x: 310 },
    { label: '+90 Days', val: price90, pct: '+13.4%', x: 440 }
  ];

  const minV = Math.min(...pts.map(p => p.val)) * 0.96;
  const maxV = Math.max(...pts.map(p => p.val)) * 1.04;
  const range = maxV - minV || 1;

  const getY = (val) => 110 - ((val - minV) / range) * 75;

  const pointsWithY = pts.map(p => ({ ...p, y: getY(p.val) }));

  const pathD = `M ${pointsWithY[0].x} ${pointsWithY[0].y} ` +
    pointsWithY.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');

  const areaD = `${pathD} L ${pointsWithY[pointsWithY.length - 1].x} 130 L ${pointsWithY[0].x} 130 Z`;

  return (
    <div className={`mt-5 p-4.5 rounded-2xl border transition-all duration-300 ${
      isDarkMode 
        ? 'bg-slate-900 border-slate-700 text-white shadow-xl' 
        : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-950 shadow-2xs'
    }`}>
      <div className="flex justify-between items-center mb-3 px-1">
        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
          isDarkMode ? 'text-emerald-400' : 'text-emerald-900'
        }`}>
          <LineChart className="h-4 w-4 text-emerald-600" /> Mandi Price Trend Graph (₹/Quintal)
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          isDarkMode ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-emerald-200/80 text-emerald-900 border-emerald-300'
        }`}>
          Seasonal Market Rally
        </span>
      </div>

      <div className="relative w-full overflow-hidden pt-2">
        <svg viewBox="0 0 500 150" className="w-full h-36 sm:h-44 overflow-visible">
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="30" y1="35" x2="470" y2="35" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeDasharray="3 3" strokeWidth="1" />
          <line x1="30" y1="75" x2="470" y2="75" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeDasharray="3 3" strokeWidth="1" />
          <line x1="30" y1="115" x2="470" y2="115" stroke={isDarkMode ? "#334155" : "#cbd5e1"} strokeDasharray="3 3" strokeWidth="1" />

          {/* Area Fill */}
          <path d={areaD} fill="url(#priceGradient)" />

          {/* Line Chart */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Data Points and Labels */}
          {pointsWithY.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              {/* Outer pulsing ring */}
              <circle cx={pt.x} cy={pt.y} r="7" fill="#059669" className="animate-ping opacity-30" />
              {/* Core Circle */}
              <circle cx={pt.x} cy={pt.y} r="5" fill="#34d399" stroke="#ffffff" strokeWidth="2" />
              
              {/* Price text above point */}
              <text 
                x={pt.x} 
                y={pt.y - 12} 
                textAnchor="middle" 
                className={`text-[11px] font-black tracking-tight ${isDarkMode ? 'fill-emerald-300' : 'fill-emerald-800'}`}
              >
                ₹{pt.val.toLocaleString('en-IN')}
              </text>

              {/* Time Label below X axis */}
              <text 
                x={pt.x} 
                y="145" 
                textAnchor="middle" 
                className={`text-[10px] font-extrabold uppercase tracking-wider ${isDarkMode ? 'fill-slate-400' : 'fill-slate-600'}`}
              >
                {pt.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

const FarmerDashboard = () => {
  const { t, lang } = useLanguage();
  
  // Theme Mode State (Light ☀️ / Dark 🌙)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('smartCropTheme') === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('smartCropTheme', next ? 'dark' : 'light');
      window.dispatchEvent(new CustomEvent('smartCropThemeUpdated'));
      return next;
    });
  };

  // Retrieve saved farmer profile from login registration
  const [farmerProfile, setFarmerProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('smartCropFarmerProfile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [location, setLocation] = useState(() => {
    return farmerProfile?.district || localStorage.getItem('smartCropLocation') || 'Cuttack';
  });

  const [season, setSeason] = useState('Kharif');

  const [areaHa, setAreaHa] = useState(() => {
    const savedArea = localStorage.getItem('smartCropLandArea');
    if (savedArea) return parseFloat(savedArea) || 2.5;
    return farmerProfile?.land_area_ha || 2.5;
  });

  const [isLocating, setIsLocating] = useState(false);
  const [gpsActive, setGpsActive] = useState(false);
  const [locationNotice, setLocationNotice] = useState('📍 Requesting browser location permission...');
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const locationRef = useRef(null);

  const [isAssistantOpen, setIsAssistantOpen] = useState(false);

  const [loanProfile, setLoanProfile] = useState(() => {
    const saved = localStorage.getItem('farmerLoanProfile');
    return saved ? JSON.parse(saved) : { has_loan: false };
  });
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);

  const [soilProfile, setSoilProfile] = useState({ N: 56.6, P: 31.7, K: 42.8, pH: 6.39 });
  const [weatherInfo, setWeatherInfo] = useState({ temp: 27.5, condition: 'Partly Cloudy', humidity: 76, rainfall: 1150 });
  const [playing, setPlaying] = useState(false);

  const [loading, setLoading] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState('Rice');
  const [selectedInsightCrop, setSelectedInsightCrop] = useState(null);
  const [analysisData, setAnalysisData] = useState(DEFAULT_ANALYSIS_DATA);

  const getLocalizedCropName = (rawName) => {
    if (!rawName) return rawName;
    const entry = CROP_NAME_MAP[rawName];
    if (!entry) return rawName;
    return entry[lang] || rawName;
  };

  const getNearestDistrict = (lat, lon) => {
    let nearest = 'Cuttack';
    let minDistance = Infinity;

    Object.entries(ODISHA_DISTRICTS_COORDS).forEach(([distName, coords]) => {
      const dLat = coords.lat - lat;
      const dLon = coords.lon - lon;
      const distSq = dLat * dLat + dLon * dLon;
      if (distSq < minDistance) {
        minDistance = distSq;
        nearest = distName;
      }
    });
    return nearest;
  };

  const requestBrowserLocation = () => {
    if (!('geolocation' in navigator)) {
      setLocationNotice('⚠️ Geolocation not supported by browser. Using default: ' + location);
      return;
    }

    setIsLocating(true);
    setLocationNotice('🛰️ Accessing GPS coordinates...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const detectedDistrict = getNearestDistrict(latitude, longitude);
        setLocation(detectedDistrict);
        setGpsActive(true);
        setIsLocating(false);
        setLocationNotice(`✅ GPS Located: ${detectedDistrict} (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`);
        localStorage.setItem('smartCropLocation', detectedDistrict);
        runFullPipeline(detectedDistrict, season, areaHa, loanProfile);
      },
      (error) => {
        console.warn("GPS Permission error:", error);
        setIsLocating(false);
        setGpsActive(false);
        setLocationNotice(`📍 Default Location: ${location} (Grant GPS permission in browser for live location)`);
        runFullPipeline(location, season, areaHa, loanProfile);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    runFullPipeline(location, season, areaHa, loanProfile);
    requestBrowserLocation();

    const handleOpenLoan = () => setIsLoanModalOpen(true);
    const handleToggleAssistant = () => setIsAssistantOpen(prev => !prev);

    window.addEventListener('openLoanModal', handleOpenLoan);
    window.addEventListener('toggleSmartAssistant', handleToggleAssistant);

    return () => {
      window.removeEventListener('openLoanModal', handleOpenLoan);
      window.removeEventListener('toggleSmartAssistant', handleToggleAssistant);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (locationRef.current && !locationRef.current.contains(event.target)) {
        setShowLocationSelect(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDistrict = (distName) => {
    setLocation(distName);
    setShowLocationSelect(false);
    localStorage.setItem('smartCropLocation', distName);
    runFullPipeline(distName, season, areaHa, loanProfile);
  };

  const runFullPipeline = async (distName, seasonName, areaVal, currentLoan) => {
    setLoading(true);
    
    try {
      const soilRes = await fetch(`${API_BASE}/api/district-profile/${distName}`);
      if (soilRes.ok) {
        const data = await soilRes.json();
        setSoilProfile(data.soil);
      }
    } catch (e) {
      console.warn("Soil fetch note:", e);
    }

    try {
      const wRes = await fetch(`${API_BASE}/api/weather/${distName}`);
      if (wRes.ok) {
        const wData = await wRes.json();
        setWeatherInfo({
          temp: wData.temperature || 27.5,
          condition: wData.condition || 'Partly Cloudy',
          humidity: wData.humidity || 76,
          rainfall: 1150
        });
      }
    } catch (e) {
      console.warn("Weather fetch note:", e);
    }

    try {
      const res = await fetch(`${API_BASE}/api/full-farm-analysis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          district: distName,
          season: seasonName,
          area_ha: parseFloat(areaVal) || 2.5,
          loan_input: currentLoan
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAnalysisData(data);
        if (data.crop_recommendation?.recommended_crop) {
          setSelectedCrop(data.crop_recommendation.recommended_crop);
        }
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("Pipeline API fallback:", err);
      setAnalysisData(prev => prev || DEFAULT_ANALYSIS_DATA);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLoanProfile = (updatedProfile) => {
    setLoanProfile(updatedProfile);
    localStorage.setItem('farmerLoanProfile', JSON.stringify(updatedProfile));
    window.dispatchEvent(new CustomEvent('loanProfileUpdated'));
    runFullPipeline(location, season, areaHa, updatedProfile);
  };

  const getPriceForecast = (basePrice) => {
    if (analysisData?.price_forecast) {
      const pf = analysisData.price_forecast;
      return {
        priceToday: Math.round(pf.current_price_per_quintal || basePrice || 2300),
        price15: Math.round(pf.forecast_15d || (basePrice * 1.038)),
        price30: Math.round(pf.forecast_30d || (basePrice * 1.075)),
        price90: Math.round(pf.forecast_90d || (basePrice * 1.134))
      };
    }
    const priceToday = Math.round(basePrice || 2300);
    const price15 = Math.round(priceToday * 1.038);
    const price30 = Math.round(priceToday * 1.075);
    const price90 = Math.round(priceToday * 1.134);
    return { priceToday, price15, price30, price90 };
  };

  const handleReadAdvisory = () => {
    if (!('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      if (playing) {
        setPlaying(false);
        return;
      }
    }
    const recCrop = getLocalizedCropName(analysisData?.crop_recommendation?.recommended_crop || selectedCrop || 'Rice');
    const baseP = analysisData?.market_price_summary?.mandi_price_per_quintal || 2300;
    const { price30 } = getPriceForecast(baseP);
    const text = `Recommended crop for ${location} is ${recCrop}. Current price is ${baseP} rupees per quintal, expected to reach ${price30} rupees in 30 days.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const farmerFinancial = (() => {
    if (analysisData?.farmer_financial && analysisData.farmer_financial.loan_distress_score > 0) {
      return analysisData.farmer_financial;
    }
    if (loanProfile.has_loan) {
      const orig = Number(loanProfile.original_loan_amount) || 100000;
      const out = Number(loanProfile.outstanding_principal) || 65000;
      const repaid = Number(loanProfile.total_amount_repaid) || 35000;
      const rate = Number(loanProfile.annual_interest_rate) || 7.5;
      const profit = analysisData?.profit_analysis?.net_profit_inr || 150000;

      const repaymentRatio = Math.min(1, Math.max(0, repaid / (orig || 1)));
      const interestBurden = out * (rate / 100);
      const interestRatio = interestBurden / Math.max(10000, profit);
      const outRatio = out / Math.max(10000, profit);

      const distress = Math.round(
        0.35 * (100 * (1 - repaymentRatio)) +
        0.35 * Math.min(100, interestRatio * 100) +
        0.30 * Math.min(100, outRatio * 20)
      );

      const boundedDistress = Math.max(5, Math.min(95, distress));
      let cat = "Very Low";
      if (boundedDistress > 70) cat = "High";
      else if (boundedDistress > 45) cat = "Moderate";
      else if (boundedDistress > 25) cat = "Low";

      return {
        has_loan: true,
        loan_distress_score: boundedDistress,
        distress_category: cat
      };
    }
    return {
      has_loan: false,
      loan_distress_score: 12,
      distress_category: "Very Low"
    };
  })();

  const candidateCrops = (analysisData?.candidate_crops || analysisData?.candidates)?.length > 0 
    ? (analysisData.candidate_crops || analysisData.candidates) 
    : DEFAULT_ANALYSIS_DATA.candidate_crops;

  const filteredDistricts = ODISHA_DISTRICTS.filter(dist => 
    dist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const basePrice = analysisData?.market_price_summary?.mandi_price_per_quintal || 2300;
  const priceForecast = getPriceForecast(basePrice);
  const rawTopCrop = analysisData?.crop_recommendation?.recommended_crop || selectedCrop || 'Rice';
  const localizedTopCrop = getLocalizedCropName(rawTopCrop);

  const farmerName = farmerProfile?.first_name 
    ? `${farmerProfile.first_name} ${farmerProfile.last_name || ''}`.trim()
    : null;

  return (
    <div className={`w-full px-3 sm:px-6 lg:px-8 py-4 min-h-[calc(100vh-4.2rem)] flex flex-col relative transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-gray-100 text-gray-900'}`}>
      
      {/* Full-Width Dashboard Container */}
      <div className={`w-full rounded-3xl shadow-sm border p-4 sm:p-7 flex flex-col space-y-5 transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-gray-200 text-gray-900'}`}>
        
        {/* FRESH PROMINENT UI HEADER BANNER WITH THEME TOGGLE BUTTON */}
        <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-gradient-to-r from-emerald-50 via-green-50/80 to-emerald-100/60 border-emerald-200/90'}`}>
          <div className="flex items-center space-x-3.5">
            <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-md shrink-0">
              <Sprout className="h-8 w-8" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                  {t('smart_farm_advisory_title')}
                </h1>
                
                {farmerName && (
                  <span className="bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 rounded-full flex items-center shadow-2xs">
                    <User className="h-3.5 w-3.5 mr-1" />
                    {farmerName}
                  </span>
                )}

                {/* PROMINENT FAT LIGHT / DARK MODE TOGGLE BUTTON */}
                <button
                  onClick={toggleDarkMode}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black shadow-md hover:shadow-lg transition-all active:scale-95 border cursor-pointer ${
                    isDarkMode
                      ? 'bg-slate-800 text-amber-300 border-slate-600 hover:bg-slate-700'
                      : 'bg-white text-slate-800 border-gray-300 hover:bg-gray-50'
                  }`}
                  title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {isDarkMode ? (
                    <>
                      <Sun className="h-4.5 w-4.5 text-amber-400 fill-amber-400" />
                      <span>☀️ Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4.5 w-4.5 text-slate-700 fill-slate-700" />
                      <span>🌙 Dark Mode</span>
                    </>
                  )}
                </button>
              </div>
              <p className={`text-xs sm:text-sm font-semibold mt-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>
                {t('smart_farm_advisory_subtitle')}
              </p>
            </div>
          </div>
        </div>

        {/* FULL-WIDTH FINANCIAL HEALTH DISTRESS CARD (WITH SPECTRUM RANGE SCALE) */}
        <div>
          <CreditScoreGauge
            score={farmerFinancial.loan_distress_score}
            category={farmerFinancial.distress_category}
            hasLoan={loanProfile.has_loan}
            loanProfile={loanProfile}
            onEditLoan={() => setIsLoanModalOpen(true)}
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Location Status Notice Banner */}
        <div className={`flex items-center justify-between border rounded-xl px-4 py-2 text-xs font-semibold ${isDarkMode ? 'bg-blue-950/60 border-blue-800 text-blue-200' : 'bg-blue-50/80 border-blue-200 text-blue-900'}`}>
          <span className="flex items-center">
            <LocateFixed className={`h-4 w-4 mr-2 text-blue-500 ${isLocating ? 'animate-spin' : ''}`} />
            {locationNotice}
          </span>
          <button 
            onClick={requestBrowserLocation}
            className="text-[11px] font-extrabold bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1 rounded-lg transition-all shadow-2xs shrink-0"
          >
            {isLocating ? 'Detecting GPS...' : '📍 Request Location Access'}
          </button>
        </div>

        {/* Controls: Location, Season & Land Area */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 p-4.5 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-gray-50/90 border-gray-200 text-gray-900'}`}>
          
          {/* District Selector */}
          <div className="relative" ref={locationRef}>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>📍 {t('district_location')}</label>
            <div 
              className={`flex items-center justify-between border rounded-xl px-3.5 py-2.5 text-sm font-semibold cursor-pointer hover:border-green-500 transition-colors shadow-2xs ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'}`}
              onClick={() => { setShowLocationSelect(!showLocationSelect); setSearchQuery(''); }}
            >
              <div className="flex items-center truncate">
                <MapPin className="h-4 w-4 text-red-500 mr-2 shrink-0" />
                <span className="truncate">{location}</span>
                {gpsActive && (
                  <span className="ml-2 text-[9px] bg-green-100 text-green-800 font-extrabold px-1.5 py-0.5 rounded">GPS</span>
                )}
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${showLocationSelect ? 'rotate-180' : ''}`} />
            </div>

            {showLocationSelect && (
              <div className={`absolute top-full left-0 mt-1 w-64 rounded-2xl shadow-2xl border z-50 overflow-hidden ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                <div className={`p-2 border-b ${isDarkMode ? 'border-slate-700 bg-slate-900' : 'border-gray-100 bg-gray-50'}`}>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className={`w-full pl-9 pr-3 py-1.5 border rounded-lg text-xs outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white focus:ring-green-500' : 'bg-white border-gray-200 text-gray-800 focus:ring-green-500'}`}
                      placeholder={t('search_district_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5">
                  {filteredDistricts.length > 0 ? (
                    filteredDistricts.map(dist => (
                      <div
                        key={dist}
                        onClick={() => handleSelectDistrict(dist)}
                        className={`px-3 py-2 text-xs font-semibold rounded-lg flex items-center justify-between cursor-pointer ${
                          location === dist 
                            ? 'bg-emerald-600 text-white' 
                            : isDarkMode ? 'hover:bg-slate-700 text-slate-200' : 'hover:bg-green-50 text-gray-700'
                        }`}
                      >
                        <span>{dist}</span>
                        {location === dist && <span className="text-[10px] uppercase tracking-wider font-extrabold">{t('selected')}</span>}
                      </div>
                    ))
                  ) : (
                    <div className="px-3 py-2 text-xs text-gray-400 text-center font-medium">{t('no_districts_found')}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Season Selector */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>🗓️ {t('farming_season')}</label>
            <select 
              value={season} 
              onChange={(e) => {
                setSeason(e.target.value);
                runFullPipeline(location, e.target.value, areaHa, loanProfile);
              }}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none shadow-2xs cursor-pointer ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'}`}
            >
              <option value="Kharif">{t('kharif_monsoon')}</option>
              <option value="Rabi">{t('rabi_winter')}</option>
              <option value="Summer">{t('summer')}</option>
            </select>
          </div>

          {/* Land Area Input */}
          <div>
            <label className={`block text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>📐 {t('land_area')}</label>
            <input 
              type="number"
              step="0.1"
              min="0.1"
              value={areaHa}
              onChange={(e) => setAreaHa(parseFloat(e.target.value) || 1.0)}
              onBlur={() => runFullPipeline(location, season, areaHa, loanProfile)}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none shadow-2xs ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'}`}
            />
          </div>
        </div>

        {/* Weather Widget */}
        <div>
          <WeatherWidget location={location} isDarkMode={isDarkMode} />
        </div>

        {/* Regional Soil Profile */}
        <div className={`border rounded-2xl p-4 transition-colors ${isDarkMode ? 'bg-emerald-950/40 border-emerald-800 text-slate-100' : 'bg-emerald-50/80 border-emerald-200/90 text-emerald-900'}`}>
          <div className="flex justify-between items-center mb-3 text-xs font-bold">
            <span>🌱 {t('regional_soil_chemistry_profile')}</span>
            <span className="bg-emerald-700 text-white px-2.5 py-1 rounded-md font-bold">{location} {t('soil_profile_badge')}</span>
          </div>
          <div className="grid grid-cols-4 gap-3.5 text-center">
            <div className={`p-3 rounded-xl border shadow-2xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-100'}`}>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">{t('nitrogen')}</span>
              <span className="text-lg font-black text-emerald-500">{soilProfile.N} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className={`p-3 rounded-xl border shadow-2xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-100'}`}>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">{t('phosphorus')}</span>
              <span className="text-lg font-black text-emerald-500">{soilProfile.P} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className={`p-3 rounded-xl border shadow-2xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-100'}`}>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">{t('potassium')}</span>
              <span className="text-lg font-black text-emerald-500">{soilProfile.K} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className={`p-3 rounded-lg border shadow-2xs ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-emerald-100'}`}>
              <span className="block text-[10px] font-bold text-gray-400 uppercase">{t('soil_ph')}</span>
              <span className="text-lg font-black text-emerald-500">{soilProfile.pH}</span>
            </div>
          </div>
        </div>

        {/* FARM ADVISORY ANALYSIS RESULTS */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500">{t('analyzing_farm_data')}</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* RECOMMENDED CROP MAIN DISPLAY */}
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-md relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800/90 border-emerald-500/40 text-slate-100' : 'bg-gradient-to-br from-emerald-50 via-white to-green-50/40 border-emerald-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-200/60 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                      🏆 {t('top_recommended_crop')}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 font-bold text-xs px-2.5 py-1 rounded-full">
                      {location} • {season}
                    </span>
                  </div>
                  <h2 className={`text-3xl sm:text-4xl font-black mt-2 tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-950'}`}>
                    {localizedTopCrop}
                  </h2>
                </div>

                <div className={`text-left sm:text-right p-3.5 rounded-2xl border shadow-2xs ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-emerald-100 text-gray-900'
                }`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('current_mandi_price')}</span>
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{basePrice.toLocaleString('en-IN')} <xs className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>/qtl</xs></span>
                </div>
              </div>

              {/* Crop Analysis Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('expected_yield')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{analysisData.crop_recommendation?.yield_per_ha || 3.65} t/ha</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Total ~{((analysisData.crop_recommendation?.yield_per_ha || 3.65) * areaHa).toFixed(1)} Tons</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('expected_net_profit')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{formatIndianCurrency(analysisData.profit_analysis?.net_profit_inr || ((3.65 * areaHa * 23000) - (75000 * areaHa)))}</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{areaHa} Ha Total Land</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('cultivation_cost')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{formatIndianCurrency(75000 * areaHa)}</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>₹75,000 / ha</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('profit_margin')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>+{analysisData.profit_analysis?.roi_percent || 19.1}%</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Return on Investment</span>
                </div>
              </div>

              {/* Recommendation Rationale */}
              {analysisData.crop_recommendation?.reasons && (
                <div className={`mt-5 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-emerald-200/50'}`}>
                  <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-emerald-300' : 'text-emerald-900'}`}>💡 {t('why_this_crop_was_recommended')}</h4>
                  <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-medium ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>
                    {analysisData.crop_recommendation.reasons.map((reason, idx) => (
                      <li key={idx} className="flex items-center">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 mr-2 shrink-0" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CANDIDATE CROPS COMPARISON TABLE */}
            {candidateCrops.length > 0 && (
              <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
                <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-3.5 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <Award className="h-4 w-4 text-emerald-500 mr-2" />
                  {t('risk_balanced_candidate_crops_comparison')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        <th className="p-3">{t('crop')}</th>
                        <th className="p-3">{t('agronomic_fit')}</th>
                        <th className="p-3">{t('expected_net_profit')}</th>
                        <th className="p-3">{t('cultivation_cost')}</th>
                        <th className="p-3">{t('safety_score')}</th>
                        <th className="p-3">{t('action')}</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y font-semibold ${isDarkMode ? 'divide-slate-700/60' : 'divide-gray-100'}`}>
                      {candidateCrops.map((c, idx) => {
                        const cropName = c.crop || 'Crop';
                        const locCrop = getLocalizedCropName(cropName);
                        const isRecommended = rawTopCrop.toLowerCase() === cropName.toLowerCase();
                        
                        return (
                          <tr key={idx} className={`hover:bg-emerald-50/40 transition-colors ${isRecommended ? (isDarkMode ? 'bg-emerald-950/40 text-emerald-200' : 'bg-emerald-50/60') : ''}`}>
                            <td className={`p-3 font-bold flex items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                              {locCrop}
                              {isRecommended && (
                                <span className="ml-2 bg-emerald-600 text-white text-[9px] px-2 py-0.5 rounded-full uppercase font-black">
                                  {t('top_pick')}
                                </span>
                              )}
                            </td>
                            <td className={`p-3 font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{c.suitability_score}%</td>
                            <td className={`p-3 font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{formatIndianCurrency(c.expected_net_profit, true)}</td>
                            <td className={`p-3 ${isDarkMode ? 'text-slate-300' : 'text-gray-600'}`}>{formatIndianCurrency(c.total_cultivation_cost, true)}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                                c.safety_score >= 80 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {c.safety_score}/100
                              </span>
                            </td>
                            <td className="p-3">
                              <button
                                onClick={() => {
                                  setSelectedCrop(cropName);
                                  setSelectedInsightCrop(c);
                                }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1 cursor-pointer"
                              >
                                <Sparkles className="h-3.5 w-3.5" />
                                <span>{t('view_insights')}</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* MANDI PRICE FORECAST CARD */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`text-sm font-extrabold uppercase tracking-wider flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  <LineChart className="h-4 w-4 text-emerald-500 mr-2" />
                  {t('mandi_price_trend_forecast')} - {localizedTopCrop} ({location})
                </h3>
                <span className="text-[10px] bg-emerald-700 text-white font-extrabold px-3 py-1 rounded-full shadow-2xs">
                  {t('forecast_badge')}
                </span>
              </div>

              {/* RICH DARK EMERALD GREEN BOXES */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3.5 rounded-2xl border bg-slate-900 text-slate-100 border-slate-700 shadow-md">
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">{t('today_mandi_price')}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.priceToday.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-slate-400 font-extrabold mt-0.5">Base Rate</span>
                </div>
                <div className="p-3.5 rounded-2xl border bg-emerald-900/90 text-emerald-100 border-emerald-700 shadow-md">
                  <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{t('15_day_forecast')}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.price15.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-emerald-300 font-extrabold mt-0.5">+3.8% Gain</span>
                </div>
                <div className="p-3.5 rounded-2xl border bg-emerald-800 text-white border-emerald-600 shadow-lg ring-1 ring-emerald-500/40">
                  <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider">{t('30_day_forecast')}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.price30.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-amber-300 font-extrabold mt-0.5">+7.5% Gain</span>
                </div>
                <div className="p-3.5 rounded-2xl border bg-teal-900/90 text-teal-100 border-teal-700 shadow-md">
                  <span className="block text-[10px] font-bold text-teal-300 uppercase tracking-wider">{t('90_day_forecast')}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.price90.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-teal-300 font-extrabold mt-0.5">+13.4% Peak</span>
                </div>
              </div>

              {/* VISUAL MANDI PRICE TREND GRAPH */}
              <MandiPriceChart prices={priceForecast} cropName={localizedTopCrop} isDarkMode={isDarkMode} />
            </div>

            {/* PROFITABILITY BREAKDOWN */}
            <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}`}>
              <h3 className={`text-sm font-extrabold uppercase tracking-wider mb-3 flex items-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                <DollarSign className="h-4 w-4 text-emerald-500 mr-2" />
                {t('estimated_financial_returns_breakdown')} ({areaHa} Ha Land)
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs font-semibold">
                <div className={`p-3 rounded-xl border flex justify-between ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <span>{t('total_cultivation_cost')}:</span>
                  <span className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>{formatIndianCurrency(75000 * areaHa)}</span>
                </div>
                <div className={`p-3 rounded-xl border flex justify-between ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                  <span>{t('total_gross_revenue')}:</span>
                  <span className={`font-bold ${isDarkMode ? 'text-emerald-400' : 'text-gray-900'}`}>{formatIndianCurrency(analysisData.profit_analysis?.total_revenue_inr || (3.65 * areaHa * 23000))}</span>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border flex justify-between items-center ${isDarkMode ? 'bg-slate-900 border-emerald-500/40' : 'bg-white border-emerald-300'}`}>
                <div>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('expected_net_profit')}</span>
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatIndianCurrency(analysisData.profit_analysis?.net_profit_inr || ((3.65 * areaHa * 23000) - (75000 * areaHa)))}
                  </span>
                </div>
                <span className="bg-emerald-700 text-white font-black text-sm px-4 py-1.5 rounded-full shadow-xs">
                  +{analysisData.profit_analysis?.roi_percent || 19.1}% {t('roi')}
                </span>
              </div>
            </div>

          </div>
        ) : null}

      </div>

      {/* Floating Action Button Stack (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Listen to Voice Audio Advisory Button */}
        <button 
          onClick={handleReadAdvisory}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all border border-blue-400 text-xs font-extrabold"
          title={t('listen_to_advisory')}
        >
          <Volume2 className={`h-4.5 w-4.5 ${playing ? 'animate-pulse text-yellow-300' : 'text-white'}`} />
          <span>{playing ? t('stop_audio') : t('listen_to_advisory')}</span>
        </button>

        {/* Standard-Sized Button Bar with Popping-Out 3X Bot Logo Avatar */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="relative flex items-center space-x-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white pl-2 pr-5 py-2.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400 overflow-visible"
          title={t('smart_assistant')}
        >
          <img 
            src={smartBotImg} 
            alt="Smart AI Bot" 
            className="w-16 h-16 sm:w-18 sm:h-18 object-contain drop-shadow-xl shrink-0 -my-4 -ml-2 transition-transform hover:scale-110" 
          />
          <span className="font-black text-sm sm:text-base tracking-wide">{t('smart_assistant')}</span>
        </button>
      </div>

      {/* EXPANDED CENTERED GLASS-BLURRY SMART ASSISTANT MODAL WINDOW */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-4xl h-[85vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white/95 backdrop-blur-xl border-white/50 text-gray-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200/60 bg-emerald-700 text-white shadow-xs">
              <div className="flex items-center space-x-4">
                <div className="p-1 bg-white/20 rounded-2xl backdrop-blur-md">
                  <img 
                    src={smartBotImg} 
                    alt="Smart AI Bot Avatar" 
                    className="w-14 h-14 sm:w-16 sm:h-16 object-contain drop-shadow-md" 
                  />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2">
                    {t('chat_title')}
                    <span className="text-[10px] bg-emerald-400/30 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300/40">
                      Official Advisory
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100">{t('chat_subtitle')}</p>
                </div>
              </div>

              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                title="Close Assistant"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Embedded Chat Area taking full modal height */}
            <div className={`flex-1 overflow-hidden p-2 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50/50'}`}>
              <FarmerChat isEmbedded={true} isDarkMode={isDarkMode} />
            </div>
          </div>
        </div>
      )}

      {/* Loan Profile Modal */}
      <LoanInformationModal
        isOpen={isLoanModalOpen}
        onClose={() => setIsLoanModalOpen(false)}
        onSave={handleSaveLoanProfile}
        initialData={loanProfile}
      />

      {/* CROP INSIGHTS POPUP MODAL */}
      {selectedInsightCrop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-100 text-gray-900'
          }`}>
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-700 text-white shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Sprout className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg sm:text-xl flex items-center gap-2">
                    {getLocalizedCropName(selectedInsightCrop.crop || 'Crop')}
                    <span className="text-[10px] bg-emerald-400/30 text-emerald-100 px-2.5 py-0.5 rounded-full font-bold border border-emerald-300/40">
                      Essential Farmer Guide
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100">Practical Agronomic Insights & Market Advice</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedInsightCrop(null)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors cursor-pointer"
                title="Close Insights"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              
              {/* Quick Metrics Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-emerald-50/70 border-emerald-200'}`}>
                  <span className="block text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Clock className="h-3 w-3" /> Growth Duration
                  </span>
                  <span className="text-sm font-black text-emerald-800 dark:text-emerald-300 mt-0.5 block">
                    {(CROP_INSIGHTS_DATABASE[selectedInsightCrop.crop?.toLowerCase()] || defaultCropInsight(selectedInsightCrop.crop)).duration}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-50/70 border-blue-200'}`}>
                  <span className="block text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 flex items-center gap-1">
                    <Droplets className="h-3 w-3" /> Water Need
                  </span>
                  <span className="text-sm font-black text-blue-900 dark:text-blue-300 mt-0.5 block truncate">
                    {(CROP_INSIGHTS_DATABASE[selectedInsightCrop.crop?.toLowerCase()] || defaultCropInsight(selectedInsightCrop.crop)).water}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50/70 border-amber-200'}`}>
                  <span className="block text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" /> Net Profit
                  </span>
                  <span className="text-sm font-black text-amber-900 dark:text-amber-300 mt-0.5 block">
                    {formatIndianCurrency(selectedInsightCrop.expected_net_profit || 40000)}
                  </span>
                </div>

                <div className={`p-3 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-teal-50/70 border-teal-200'}`}>
                  <span className="block text-[10px] font-bold uppercase text-teal-600 dark:text-teal-400 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Safety Score
                  </span>
                  <span className="text-sm font-black text-teal-900 dark:text-teal-300 mt-0.5 block">
                    {selectedInsightCrop.safety_score || 75} / 100
                  </span>
                </div>
              </div>

              {/* Practical Insights Cards */}
              {(() => {
                const cropKey = (selectedInsightCrop.crop || '').toLowerCase();
                const info = CROP_INSIGHTS_DATABASE[cropKey] || defaultCropInsight(selectedInsightCrop.crop);
                return (
                  <div className="space-y-3 pt-1">
                    
                    {/* Soil & Sowing */}
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/50 border-emerald-200/80'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                        isDarkMode ? 'text-emerald-400' : 'text-emerald-900'
                      }`}>
                        <MapPin className="h-4 w-4 text-emerald-600" /> Soil & Sowing Requirements
                      </h4>
                      <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                        <strong className={`font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>Soil Type:</strong> {info.soil}
                      </p>
                      <p className={`text-xs font-medium leading-relaxed mt-1 ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                        <strong className={`font-black ${isDarkMode ? 'text-white' : 'text-emerald-950'}`}>Ideal Sowing:</strong> {info.sowing}
                      </p>
                    </div>

                    {/* Fertilizer & Soil Health */}
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-purple-50/60 border-purple-200/80'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                        isDarkMode ? 'text-purple-300' : 'text-purple-900'
                      }`}>
                        <Sparkles className="h-4 w-4 text-purple-600" /> Fertilizer & Soil Health Advice
                      </h4>
                      <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                        {info.npk}
                      </p>
                    </div>

                    {/* Pest & Disease Prevention */}
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-rose-50/60 border-rose-200/80'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                        isDarkMode ? 'text-rose-400' : 'text-rose-900'
                      }`}>
                        <ShieldCheck className="h-4 w-4 text-rose-600" /> Pest & Disease Care
                      </h4>
                      <p className={`text-xs font-medium leading-relaxed ${isDarkMode ? 'text-slate-200' : 'text-gray-900'}`}>
                        {info.pest}
                      </p>
                    </div>

                    {/* Government Schemes & Market Support */}
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-emerald-950/60 border-emerald-800' : 'bg-emerald-100/60 border-emerald-300'}`}>
                      <h4 className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 mb-1.5 ${
                        isDarkMode ? 'text-emerald-300' : 'text-emerald-950'
                      }`}>
                        <DollarSign className="h-4 w-4 text-emerald-600" /> Odisha Schemes & Market Potential
                      </h4>
                      <p className={`text-xs font-extrabold leading-relaxed ${isDarkMode ? 'text-emerald-200' : 'text-emerald-950'}`}>
                        {info.market}
                      </p>
                    </div>

                  </div>
                );
              })()}

            </div>

            {/* Modal Footer */}
            <div className={`px-6 py-3 border-t flex justify-end ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gray-50 border-gray-200'}`}>
              <button
                onClick={() => setSelectedInsightCrop(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Got It, Close
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
