import React, { useState, useEffect, useRef } from 'react';
import apiClient from '../api/client';
import FarmerChat from './FarmerChat';
import { 
  MapPin, Sprout, TrendingUp, Calendar, Ruler, DollarSign, Award, Search, ChevronDown, 
  LocateFixed, LineChart, ShieldCheck, Volume2, VolumeX, X, User, Sun, Moon, CreditCard,
  Droplets, Clock, Sparkles, Globe, Mic, Send, Loader2, MessageSquare
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LocationPickerMap from '../components/LocationPickerMap';
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
    if (absNum >= 10000000) {
      return `${sign}₹${(absNum / 10000000).toFixed(2)} Cr`;
    }
    if (absNum >= 100000) {
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
  Rice: { hi: "चावल", or: "ଧାନ" },
  Ragi: { hi: "रागी (मडुआ)", or: "ମାଣ୍ଡିଆ" },
  "Moong(Green Gram)": { hi: "मूंग (हरा चना)", or: "ମୁଗ" },
  Moong: { hi: "मूंग", or: "ମୁଗ" },
  Groundnut: { hi: "मूंगफली", or: "ଚିନାବାଦାମ" },
  Jute: { hi: "जूट", or: "ଝୋଟ" },
  Maize: { hi: "मक्का", or: "ମକା" },
  Cotton: { hi: "कपास", or: "କପା" },
  Sugarcane: { hi: "गन्ना", or: "ଆଖୁ" },
  Pulses: { hi: "दालें", or: "ଡାଲି" },
  Sesamum: { hi: "तिल", or: "ରାଶି" },
  Wheat: { hi: "गेहूं", or: "ଗହମ" },
  Mustard: { hi: "सरसों", or: "ସୋରିଷ" },
  Potato: { hi: "आलू", or: "ଆଳୁ" },
  Urad: { hi: "उड़द", or: "ବିରି" },
  Arhar: { hi: "अरहर", or: "ହରଡ଼" },
  Gram: { hi: "चना", or: "ଚଣା" }
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
  
  // Theme Mode State (Light ¸ / Dark 🌙)
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
    return localStorage.getItem('smartCropLocation') || farmerProfile?.district || 'Cuttack';
  });

  const [season, setSeason] = useState('Kharif');

  const [landUnit, setLandUnit] = useState(() => {
    return localStorage.getItem('smartCropLandUnit') || 'Hectares';
  });
  const [displayArea, setDisplayArea] = useState(() => {
    const savedArea = localStorage.getItem('smartCropDisplayArea');
    if (savedArea) return parseFloat(savedArea) || 2.5;
    const oldSaved = localStorage.getItem('smartCropLandArea');
    if (oldSaved) return parseFloat(oldSaved);
    return farmerProfile?.land_area_ha || 2.5;
  });
  const areaHa = landUnit === 'Acres' ? displayArea * 0.404686 : displayArea;
  const [showLocationSelect, setShowLocationSelect] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
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

  // Real-time NLP Advisory, Voice Input, Speech Synthesis & Writing Language Toggle
  const [nlpQuery, setNlpQuery] = useState('');
  const [nlpResponse, setNlpResponse] = useState('');
  const [nlpLoading, setNlpLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [writingLang, setWritingLang] = useState(lang || 'en');

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported on this browser. Please type your query!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = writingLang === 'or' ? 'or-IN' : writingLang === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    
    setIsListening(true);
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setNlpQuery(transcript);
      setIsListening(false);
      handleNlpSubmit(transcript, writingLang);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleReadAloud = (textToRead) => {
    if (!('speechSynthesis' in window)) {
      alert("Speech synthesis is not supported in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = (textToRead || '').replace(/[*#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = writingLang === 'or' ? 'hi-IN' : writingLang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const handleStopReading = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleNlpSubmit = async (queryParam, langParam) => {
    const textToQuery = typeof queryParam === 'string' ? queryParam : nlpQuery;
    const langToUse = typeof langParam === 'string' ? langParam : writingLang;

    const queryToUse = (textToQuery || '').trim();
    if (!queryToUse) return;

    setNlpLoading(true);
    handleStopReading();

    let fetchedReply = null;

    try {
      const res = await apiClient.post('/chat', {
        message: queryToUse,
        context: {
          district: location,
          season: season,
          areaha: areaHa,
          language: langToUse
        }
      });
      if (res.data && res.data.reply) {
        fetchedReply = res.data.reply;
      }
    } catch (e) {
      console.warn("apiClient note, attempting direct fetch:", e);
    }

    if (!fetchedReply) {
      try {
        const rawRes = await fetch("http://127.0.0.1:8000/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: queryToUse,
            context: {
              district: location,
              season: season,
              areaha: areaHa,
              language: langToUse
            }
          })
        });
        const data = await rawRes.json();
        if (data && data.reply) {
          fetchedReply = data.reply;
        }
      } catch (err) {
        console.error("Direct fetch failed:", err);
      }
    }

    if (fetchedReply) {
      setNlpResponse(fetchedReply);
    } else {
      setNlpResponse("🌾 **Krushi Sahayak Advisory**: Advisory is active! Try asking about pest control, weather risk, or mandi prices in your district.");
    }

    setNlpLoading(false);
  };

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

  useEffect(() => {
    runFullPipeline(location, season, areaHa, loanProfile);

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
          areaha: parseFloat(areaVal) || 2.5,
          loaninput: currentLoan
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
    if (analysisData?.priceforecast) {
      const pf = analysisData.priceforecast;
      return {
        priceToday: Math.round(pf.currentpriceperquintal || basePrice || 2300),
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
    if (analysisData?.farmerfinancial && analysisData.farmerfinancial.loandistressscore > 0) {
      return analysisData.farmerfinancial;
    }
    if (loanProfile.has_loan) {
      const orig = Number(loanProfile.originalloan_amount) || 100000;
      const out = Number(loanProfile.outstandingprincipal) || 65000;
      const repaid = Number(loanProfile.totalamountrepaid) || 35000;
      const rate = Number(loanProfile.annualinterest_rate) || 7.5;
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
        loandistressscore: boundedDistress,
        distresscategory: cat
      };
    }
    return {
      has_loan: false,
      loandistressscore: 12,
      distresscategory: "Very Low"
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
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-4.5 w-4.5 text-slate-700 fill-slate-700" />
                      <span>Dark Mode</span>
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

        {/* HYPERLOCAL REAL-TIME NLP ADVISORY MODULE (VOICE + TEXT + READ ALOUD + LANGUAGE BUTTONS) */}
        <div className={`p-5 sm:p-6 rounded-3xl border shadow-md space-y-4 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-slate-800/95 border-emerald-500/40 text-slate-100' 
            : 'bg-gradient-to-r from-emerald-50/90 via-white to-green-50/80 border-emerald-200/90 text-gray-900'
        }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3 border-emerald-200/60">
            <div>
              <h3 className={`text-base sm:text-lg font-black tracking-tight flex items-center gap-2 ${
                isDarkMode ? 'text-emerald-300' : 'text-emerald-950'
              }`}>
                <Sparkles className="h-5 w-5 text-emerald-600 animate-pulse" />
                <span>HYPERLOCAL REAL-TIME NLP ADVISORY (VOICE + TEXT)</span>
              </h3>
              <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                Ask about weather risk, soil NPK nutrients, market price crash, or pest control in your regional language.
              </p>
            </div>

            {/* LANGUAGE OF WRITING TOGGLE BUTTONS */}
            <div className="flex items-center space-x-1.5 bg-emerald-100/70 p-1 rounded-2xl border border-emerald-300 shrink-0">
              <span className="text-[10px] font-black uppercase text-emerald-950 px-2 flex items-center">
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
                </button>
            </div>
          </div>

          {/* INPUT FORM WITH VOICE MIC & GET ADVISORY BUTTON */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleNlpSubmit(nlpQuery, writingLang); }} 
            className="flex items-center gap-2"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={nlpQuery}
                onChange={(e) => setNlpQuery(e.target.value)}
                placeholder={
                  writingLang === 'or'
                    ? "à¬†à¬ªà¬£à¬™à­à¬• à¬ªà­à¬°à¬¶à­à¬¨ à¬ªà¬šà¬¾à¬°à¬¨à­à¬¤à­ (à¬¯à¬¥à¬¾: à¬§à¬¾à¬¨à¬°à­‡ à¬ªà­‹à¬• à¬¨à¬¿à­Ÿà¬¨à­à¬¤à­à¬°à¬£, à¬®à¬£à­à¬¡à¬¿ à¬¦à¬°, à¬ªà¬¾à¬£à¬¿à¬ªà¬¾à¬—)..."
                    : writingLang === 'hi'
                    ? "à¤…à¤ªà¤¨à¤¾ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤ªà¥‚à¤›à¥‡à¤‚ (à¤‰à¤¦à¤¾. à¤§à¤¾à¤¨ à¤®à¥‡à¤‚ à¤•à¥€à¤Ÿ à¤¨à¤¿à¤¯à¤‚à¤¤à¥à¤°à¤£, à¤®à¤‚à¤¡à¥€ à¤­à¤¾à¤µ, à¤®à¥Œà¤¸à¤®)..."
                    : "Ask your farm question (e.g., stem borer control in rice, mandi price forecast, weather risk)..."
                }
                className={`w-full border rounded-2xl py-3 pl-4 pr-12 text-xs sm:text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs ${
                  isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-gray-300'
                }`}
              />

              {/* VOICE MIC BUTTON */}
              <button
                type="button"
                onClick={handleVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all cursor-pointer ${
                  isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                }`}
                title="Voice Input (Speech-to-Text)"
              >
                <Mic className="h-4 w-4" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleNlpSubmit(nlpQuery, writingLang)}
              disabled={nlpLoading || !nlpQuery.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-md flex items-center space-x-1.5 shrink-0 cursor-pointer"
            >
              {nlpLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <span>Get Advisory</span>
                  <Send className="h-4 w-4 ml-1" />
                </>
              )}
            </button>
          </form>

          {/* NLP RESPONSE ADVISORY OUTPUT BOX WITH ALWAYS-VISIBLE FEEDBACK & READ ALOUD */}
          <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 animate-in fade-in duration-200 ${
            isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white border-emerald-200 text-gray-900'
          }`}>
            <div className="flex items-center justify-between border-b pb-2 border-emerald-100">
              <span className="text-xs font-black text-emerald-600 uppercase flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                <span>REAL-TIME HYPERLOCAL ADVISORY OUTPUT</span>
              </span>

              {/* READ ALOUD & STOP READING BUTTONS */}
              {nlpResponse && !nlpLoading && (
                <div className="flex items-center space-x-2">
                  {isSpeaking ? (
                    <button
                      type="button"
                      onClick={handleStopReading}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <VolumeX className="h-3.5 w-3.5" />
                      <span>Stop Reading</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleReadAloud(nlpResponse)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      <span>🔊 Read Aloud</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* LIVE LOADING STATE VS FORMATTED ADVISORY TEXT */}
            {nlpLoading ? (
              <div className="py-6 flex flex-col items-center justify-center space-y-3 text-emerald-700">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                <p className="text-xs font-bold animate-pulse text-center">
                  ⚡ Analyzing soil NPK, weather forecast, mandi prices & pest datasets for {location}...
                </p>
              </div>
            ) : (
              <div className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {nlpResponse || "🌾 Namaste! Ask any farm question above and click 'Get Advisory' to get real-time advice!"}
              </div>
            )}
          </div>
        </div>

        {/* FULL-WIDTH FINANCIAL HEALTH DISTRESS CARD (WITH SPECTRUM RANGE SCALE) */}
        <div>
          <CreditScoreGauge
            score={farmerFinancial.loandistressscore}
            category={farmerFinancial.distresscategory}
            hasLoan={loanProfile.has_loan}
            loanProfile={loanProfile}
            onEditLoan={() => setIsLoanModalOpen(true)}
            isDarkMode={isDarkMode}
          />
        </div>

                                {/* Controls: Location, Season & Land Area */}
        <div className={`p-4.5 rounded-2xl border transition-colors duration-300 ${isDarkMode ? 'bg-slate-800/80 border-slate-700 text-slate-100' : 'bg-gray-50/90 border-gray-200 text-gray-900'}`}>
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 mb-4 rounded-xl border ${isDarkMode ? 'bg-slate-900 border-slate-600' : 'bg-white border-gray-200'} shadow-sm`}>
            <div className="flex items-center text-sm font-bold mb-2 sm:mb-0">
              <MapPin className="h-4 w-4 mr-2 text-red-500 shrink-0" />
              <span className={`mr-2 uppercase tracking-wide text-xs ${isDarkMode ? 'text-slate-300' : 'text-gray-500'}`}>Farm Location:</span>
              <span className={`text-base tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{location}</span>
            </div>
            <button 
              onClick={() => setIsMapModalOpen(true)}
              className="text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200 hover:border-emerald-300"
            >
              Change Location
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Season Selector */}
            <div>
              <label className={`flex items-center text-xs font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
                <Calendar className="h-3.5 w-3.5 mr-1.5 text-amber-500" />
                {t('farming_season')}
              </label>
              <select 
                value={season}
                onChange={(e) => {
                  setSeason(e.target.value);
                  runFullPipeline(location, e.target.value, areaHa, loanProfile);
                }}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none shadow-2xs ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'}`}
              >
                <option value="Kharif Monsoon">Kharif (Monsoon)</option>
                <option value="Rabi Winter">Rabi (Winter)</option>
                <option value="Zaid Summer">Zaid (Summer)</option>
              </select>
            </div>

            {/* Land Area Input */}
            <div>
              <div className={`flex justify-between items-center text-xs font-bold uppercase mb-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-700'}`}>
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
                    className={`ml-2 text-[10px] bg-transparent font-extrabold cursor-pointer outline-none ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}
                  >
                    <option value="Hectares" className="text-gray-900">Hectares</option>
                    <option value="Acres" className="text-gray-900">Acres</option>
                  </select>
                </div>
              <input 
                type="number"
                step="0.1"
                min="0.1"
                value={displayArea}
                onChange={(e) => { setDisplayArea(parseFloat(e.target.value) || 1.0); localStorage.setItem('smartCropDisplayArea', e.target.value); }}
                onBlur={() => runFullPipeline(location, season, areaHa, loanProfile)}
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none shadow-2xs ${isDarkMode ? 'bg-slate-700 text-white border-slate-600' : 'bg-white text-gray-800 border-gray-300'}`}
              />
            </div>
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
              <span className="block text-[10px] font-bold text-gray-400 uppercase">{t('soilph')}</span>
              <span className="text-lg font-black text-emerald-500">{soilProfile.pH}</span>
            </div>
          </div>
        </div>

        {/* FARM ADVISORY ANALYSIS RESULTS */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-bold text-gray-500">{t('analyzingfarmdata')}</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* RECOMMENDED CROP MAIN DISPLAY */}
            <div className={`p-6 sm:p-7 rounded-3xl border shadow-md relative overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-800/90 border-emerald-500/40 text-slate-100' : 'bg-gradient-to-br from-emerald-50 via-white to-green-50/40 border-emerald-200'}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-emerald-200/60 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-emerald-600 text-white font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider shadow-2xs">
                      {t('top_recommended_crop')}
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
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('currentmandiprice')}</span>
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>₹{basePrice.toLocaleString('en-IN')} <xs className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>/qtl</xs></span>
                </div>
              </div>

              {/* Crop Analysis Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-5">
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('expectedyield')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{analysisData.crop_recommendation?.yield_per_ha || 3.65} t/ha</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>Total ~{((analysisData.crop_recommendation?.yield_per_ha || 3.65) * areaHa).toFixed(1)} Tons</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('expected_net_profit')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? ((analysisData.profit_analysis?.net_profit_inr || 1) >= 0 ? "text-emerald-400" : "text-red-400") : ((analysisData.profit_analysis?.net_profit_inr || 1) >= 0 ? "text-emerald-600" : "text-red-600")}`}>{formatIndianCurrency(analysisData.profit_analysis?.net_profit_inr || ((3.65 * areaHa * 23000) - (75000 * areaHa)))}</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{displayArea} {landUnit === 'Acres' ? 'Acres' : 'Ha'} Total Land</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('cultivation_cost')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? 'text-slate-200' : 'text-gray-700'}`}>{formatIndianCurrency(75000 * areaHa)}</span>
                  <span className={`block text-[10px] font-medium mt-0.5 ${isDarkMode ? 'text-slate-400' : 'text-gray-400'}`}>{landUnit === 'Acres' ? '₹30,351 / acre' : '₹75,000 / ha'}</span>
                </div>
                <div className={`p-3.5 rounded-2xl border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-emerald-100'}`}>
                  <span className={`block text-[10px] font-bold uppercase ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{t('profit_margin')}</span>
                  <span className={`text-lg font-extrabold ${isDarkMode ? ((analysisData.profit_analysis?.roi_percent || 19.1) >= 0 ? "text-emerald-400" : "text-red-400") : ((analysisData.profit_analysis?.roi_percent || 19.1) >= 0 ? "text-emerald-600" : "text-red-600")}`}>{(analysisData.profit_analysis?.roi_percent || 19.1) > 0 ? "+" : ""}{analysisData.profit_analysis?.roi_percent || 19.1}%</span>
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
                  {t('riskbalancedcandidatecropscomparison')}
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className={`border-b text-[10px] uppercase font-bold ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-gray-50 border-gray-200 text-gray-500'}`}>
                        <th className="p-3">{t('crop')}</th>
                        <th className="p-3">{t('agronomicfit')}</th>
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
                                  {t('toppick')}
                                </span>
                              )}
                            </td>
                            <td className={`p-3 font-extrabold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{c.suitability_score}%</td>
                            <td className={`p-3 font-extrabold ${isDarkMode ? (c.expected_net_profit >= 0 ? "text-emerald-400" : "text-red-400") : (c.expected_net_profit >= 0 ? "text-emerald-700" : "text-red-700")}`}>{formatIndianCurrency(c.expected_net_profit, true)}</td>
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
                  <span className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{t('next_15_days') || '15 Day Forecast'}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.price15.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-emerald-300 font-extrabold mt-0.5">+3.8% Gain</span>
                </div>
                <div className="p-3.5 rounded-2xl border bg-emerald-800 text-white border-emerald-600 shadow-lg ring-1 ring-emerald-500/40">
                  <span className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider">{t('next_30_days') || '30 Day Forecast'}</span>
                  <span className="text-lg font-black text-white">₹{priceForecast.price30.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] text-amber-300 font-extrabold mt-0.5">+7.5% Gain</span>
                </div>
                <div className="p-3.5 rounded-2xl border bg-teal-900/90 text-teal-100 border-teal-700 shadow-md">
                  <span className="block text-[10px] font-bold text-teal-300 uppercase tracking-wider">{t('next_90_days') || '90 Day Forecast'}</span>
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
                {t('cultivation_cost_net_profit_estimate') || 'Estimated Financial Returns Breakdown'} ({displayArea} {landUnit === 'Acres' ? 'Acres' : 'Ha'} Land)
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
                  <span className={`text-2xl font-black ${isDarkMode ? ((analysisData.profit_analysis?.net_profit_inr || 1) >= 0 ? "text-emerald-400" : "text-red-400") : ((analysisData.profit_analysis?.net_profit_inr || 1) >= 0 ? "text-emerald-600" : "text-red-600")}`}>{formatIndianCurrency(analysisData.profit_analysis?.net_profit_inr || ((3.65 * areaHa * 23000) - (75000 * areaHa)))}</span>
                </div>
                <span className={`${(analysisData.profit_analysis?.roi_percent || 19.1) >= 0 ? "bg-emerald-700" : "bg-red-700"} text-white font-black text-sm px-4 py-1.5 rounded-full shadow-xs`}>{(analysisData.profit_analysis?.roi_percent || 19.1) > 0 ? "+" : ""}{analysisData.profit_analysis?.roi_percent || 19.1}% {t("roi")}</span>
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
      </div>

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
            </div>          </div>
        </div>
      )}

      {/* Map Modal */}
      {isMapModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl shadow-2xl p-6 ${isDarkMode ? "bg-slate-900 border border-slate-700" : "bg-white"}`}>
            <div className="flex justify-between items-center mb-4">
              <h3 className={`text-lg font-black flex items-center ${isDarkMode ? "text-emerald-400" : "text-emerald-700"}`}>
                <MapPin className="h-5 w-5 mr-2 text-red-500" /> Select Farm Location
              </h3>
              <button onClick={() => setIsMapModalOpen(false)} className={`p-1 rounded-full ${isDarkMode ? "hover:bg-slate-800 text-slate-400" : "hover:bg-gray-100 text-gray-500"}`}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="h-[350px] w-full rounded-xl overflow-hidden border border-emerald-100">
              <LocationPickerMap 
                initialDistrict={location} 
                onLocationSelect={(dist) => {
                  setLocation(dist);
                  localStorage.setItem("smartCropLocation", dist);
                  setIsMapModalOpen(false);
                  runFullPipeline(dist, season, areaHa, loanProfile);
                }} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FarmerDashboard;
















