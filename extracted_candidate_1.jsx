import React, { useState, useEffect, useRef } from 'react';
import FarmerChat from './FarmerChat';
import { MapPin, Sprout, TrendingUp, DollarSign, Award, Search, ChevronDown, LocateFixed, LineChart, ShieldCheck, Volume2, Bot, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import WeatherWidget from '../components/WeatherWidget';
import CreditScoreGauge from '../components/CreditScoreGauge';
import LoanInformationModal from '../components/LoanInformationModal';

const API_BASE = "http://127.0.0.1:8000";

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
  'Deogarh': { lat: 21.53, lon: 84.73 },
  'Dhenkanal': { lat: 20.67, lon: 85.60 },
  'Gajapati': { lat: 18.81, lon: 84.15 },
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

const FarmerDashboard = () => {
  const { t } = useLanguage();
  
  const [location, setLocation] = useState(() => {
    return localStorage.getItem('smartCropLocation') || 'Cuttack';
  });
  const [season, setSeason] = useState('Kharif');
  const [areaHa, setAreaHa] = useState(2.5);
  const [isLocating, setIsLocating] = useState(false);
  const [locationNotice, setLocationNotice] = useState('📍 Requesting location permission...');
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
  const [analysisData, setAnalysisData] = useState(null);

  useEffect(() => {
    localStorage.setItem('smartCropLocation', location);
  }, [location]);

  useEffect(() => {
    localStorage.setItem('farmerLoanProfile', JSON.stringify(loanProfile));
  }, [loanProfile]);

  useEffect(() => {
    const handleToggleChat = () => setIsAssistantOpen(prev => !prev);
    const handleOpenLoan = () => setIsLoanModalOpen(true);

    window.addEventListener('toggleSmartAssistant', handleToggleChat);
    window.addEventListener('openLoanModal', handleOpenLoan);

    return () => {
      window.removeEventListener('toggleSmartAssistant', handleToggleChat);
      window.removeEventListener('openLoanModal', handleOpenLoan);
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

  const getNearestDistrict = (lat, lon) => {
    let minDistance = Infinity;
    let nearest = "Cuttack";
    for (const [district, coords] of Object.entries(ODISHA_DISTRICTS_COORDS)) {
      const dist = Math.hypot(lat - coords.lat, lon - coords.lon);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = district;
      }
    }
    return nearest;
  };

  const detectCurrentLocation = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      setLocationNotice('📍 Requesting GPS location permission from browser...');

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const nearest = getNearestDistrict(latitude, longitude);
            setLocation(nearest);
            setShowLocationSelect(false);
            setLocationNotice(`📍 Location Active: Detected District "${nearest}"`);
            runFullPipeline(nearest, season, areaHa, loanProfile);
          } catch (error) {
            console.error("Location error:", error);
            setLocationNotice(`📍 Location Note: Defaulting to ${location}.`);
          } finally {
            setIsLocating(false);
          }
        },
        (error) => {
          console.warn("Geolocation permission denied or timed out:", error.message);
          setIsLocating(false);
          setLocationNotice(`📍 Location permission ${error.code === 1 ? 'denied' : 'unavailable'}. Using selected district "${location}".`);
          runFullPipeline(location, season, areaHa, loanProfile);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocationNotice(`📍 Location not supported by browser. Using selected district "${location}".`);
      runFullPipeline(location, season, areaHa, loanProfile);
    }
  };

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  const runFullPipeline = async (distName = location, seasonName = season, areaVal = areaHa, currentLoan = loanProfile) => {
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
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLoanProfile = (updatedProfile) => {
    setLoanProfile(updatedProfile);
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
    const recCrop = analysisData?.crop_recommendation?.recommended_crop || selectedCrop || 'Rice';
    const baseP = analysisData?.market_price_summary?.mandi_price_per_quintal || 2300;
    const { price30 } = getPriceForecast(baseP);
    const text = `Recommended crop for ${location} is ${recCrop}. Current price is ${baseP} rupees per quintal, expected to reach ${price30} rupees in 30 days.`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };

  const farmerFinancial = analysisData?.farmer_financial || {
    has_loan: loanProfile.has_loan,
    loan_distress_score: 0.0,
    distress_category: "Very Low"
  };

  const candidateCrops = analysisData?.candidates || [];

  const filteredDistricts = ODISHA_DISTRICTS.filter(dist => 
    dist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const basePrice = analysisData?.market_price_summary?.mandi_price_per_quintal || 2300;
  const priceForecast = getPriceForecast(basePrice);

  return (
    <div className="w-full px-3 sm:px-6 lg:px-8 py-4 min-h-[calc(100vh-4.2rem)] flex flex-col relative">
      
      {/* Full-Width Dashboard Container */}
      <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-200 p-4 sm:p-7 flex flex-col space-y-5">
        
        {/* Header & Credit Score Gauge Meter */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200 flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-100/80 rounded-2xl border border-emerald-200">
              <Sprout className="h-7 w-7 text-emerald-700 shrink-0" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Smart Farm Advisory & Insights</h2>
              <p className="text-xs text-gray-500 font-medium mt-0.5">Risk-Aware Crop Recommendation & Farmer Financial Credit Health</p>
            </div>
          </div>

          <CreditScoreGauge
            score={farmerFinancial.loan_distress_score || 0}
            category={farmerFinancial.distress_category || "Very Low"}
            hasLoan={loanProfile.has_loan}
            onEditLoan={() => setIsLoanModalOpen(true)}
          />
        </div>

        {/* Controls: Location, Season & Land Area */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/90 p-4.5 rounded-2xl border border-gray-200">
          
          {/* District Selector */}
          <div className="relative" ref={locationRef}>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">📍 District / Location</label>
            <div 
              className="flex items-center justify-between bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 cursor-pointer hover:border-green-500 transition-colors shadow-2xs"
              onClick={() => { setShowLocationSelect(!showLocationSelect); setSearchQuery(''); }}
            >
              <div className="flex items-center truncate">
                <MapPin className="h-4 w-4 text-red-500 mr-2 shrink-0" />
                <span className="truncate">{location}</span>
              </div>
              <ChevronDown className={`h-4 w-4 text-gray-400 shrink-0 transition-transform ${showLocationSelect ? 'rotate-180' : ''}`} />
            </div>

            {showLocationSelect && (
              <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                <div className="p-2 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-9 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:ring-2 focus:ring-green-500 outline-none"
                      placeholder="Search district..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="max-h-56 overflow-y-auto py-1">
                  <div 
                    onClick={detectCurrentLocation}
                    className="px-3 py-2 text-xs cursor-pointer flex items-center text-blue-600 hover:bg-blue-50 font-semibold border-b border-gray-100"
                  >
                    <LocateFixed className={`h-4 w-4 mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
                    <span>{isLocating ? 'Detecting...' : 'Use Current Location'}</span>
                  </div>
                  {filteredDistricts.map(dist => (
                    <div
                      key={dist}
                      onClick={() => {
                        setLocation(dist);
                        setShowLocationSelect(false);
                        runFullPipeline(dist, season, areaHa, loanProfile);
                      }}
                      className={`px-3 py-1.5 text-xs cursor-pointer flex items-center justify-between ${
                        location === dist ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {dist}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Season Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">🗓️ Season</label>
            <select 
              value={season}
              onChange={(e) => {
                setSeason(e.target.value);
                runFullPipeline(location, e.target.value, areaHa, loanProfile);
              }}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none shadow-2xs"
            >
              <option value="Kharif">Kharif (Monsoon)</option>
              <option value="Rabi">Rabi (Winter)</option>
              <option value="Summer">Summer (Pre-Monsoon)</option>
            </select>
          </div>

          {/* Land Area Input */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">📐 Land Area (Hectares)</label>
            <input 
              type="number"
              step="0.1"
              min="0.1"
              value={areaHa}
              onChange={(e) => setAreaHa(parseFloat(e.target.value) || 1.0)}
              onBlur={() => runFullPipeline(location, season, areaHa, loanProfile)}
              className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-green-500 outline-none shadow-2xs"
            />
          </div>
        </div>

        {/* Weather Widget */}
        <div>
          <WeatherWidget location={location} />
        </div>

        {/* Regional Soil Profile */}
        <div className="bg-emerald-50/80 border border-emerald-200/90 rounded-2xl p-4">
          <div className="flex justify-between items-center mb-3 text-xs font-bold text-emerald-900">
            <span>🌱 Regional Soil Chemistry Profile</span>
            <span className="bg-emerald-200/70 px-2.5 py-1 rounded-md text-emerald-900 font-bold">{location} Soil Profile</span>
          </div>
          <div className="grid grid-cols-4 gap-3.5 text-center">
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Nitrogen (N)</span>
              <span className="text-lg font-black text-emerald-700">{soilProfile.N} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Phosphorus (P)</span>
              <span className="text-lg font-black text-emerald-700">{soilProfile.P} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Potassium (K)</span>
              <span className="text-lg font-black text-emerald-700">{soilProfile.K} <xs className="text-[10px]">kg/ha</xs></span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
              <span className="block text-[10px] font-bold text-gray-500 uppercase">Soil pH</span>
              <span className="text-lg font-black text-emerald-700">{soilProfile.pH}</span>
            </div>
          </div>
        </div>

        {/* FARM ADVISORY ANALYSIS RESULTS */}
        {loading ? (
          <div className="p-12 text-center bg-gray-50 rounded-3xl border border-gray-200">
            <div className="inline-block animate-spin text-emerald-600 text-3xl mb-3">🌾</div>
            <p className="text-base font-bold text-gray-700">Evaluating Risk-Balanced Crop Recommendations & Financial Safety...</p>
          </div>
        ) : analysisData ? (
          <div className="space-y-4">
            
            {/* TOP RECOMMENDED CROP */}
            <div className="bg-gradient-to-r from-emerald-600 via-green-700 to-emerald-800 text-white rounded-3xl p-6 shadow-md text-center relative overflow-hidden">
              <div className="inline-flex items-center space-x-1.5 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-black text-amber-300 mb-2">
                <Award className="h-4 w-4 mr-1 text-amber-300" />
                <span>TOP RECOMMENDED CROP (RISK-BALANCED)</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight my-1">
                {analysisData.crop_recommendation?.recommended_crop || selectedCrop || 'Rice'}
              </h3>
            </div>

            {/* TOP 3 CANDIDATE CROPS RANKING TABLE */}
            {candidateCrops.length > 0 && (
              <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4.5 text-slate-800 space-y-3.5 shadow-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-black text-emerald-900 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-emerald-600" />
                    TOP 3 RISK-BALANCED CANDIDATE CROPS
                  </span>
                  <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full">
                    40% Suitability + 35% Profit + 25% Safety
                  </span>
                </div>
                
                <div className="space-y-2.5">
                  {candidateCrops.map((c, idx) => (
                    <div key={c.crop || idx} className="bg-white border border-emerald-100/90 rounded-xl p-3.5 flex flex-col space-y-1.5 shadow-2xs">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="bg-emerald-600 text-white font-black text-xs px-3 py-1 rounded-full shadow-2xs">
                            Rank #{c.rank || idx + 1}
                          </span>
                          <span className="font-extrabold text-base text-slate-900">{c.crop}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs">
                          <span className="text-slate-600 font-semibold">
                            Est. Profit: <strong className={c.expected_net_profit >= 0 ? "text-emerald-700 font-black text-sm" : "text-red-600 font-black text-sm"}>₹{c.expected_net_profit?.toLocaleString('en-IN')}</strong>
                          </span>
                          <span className="text-slate-600 font-semibold">
                            Safety Score: <strong className="text-blue-700 font-black text-sm">{c.safety_score}/100</strong>
                          </span>
                          <span className="text-slate-600 font-semibold">
                            Final Crop Score: <strong className="text-amber-700 font-black text-sm">{c.final_crop_score}</strong>
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-normal">
                        💡 {c.recommendation_reason}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* EXPECTED YIELD & HARVEST PREDICTION */}
            <div className="bg-white border border-emerald-200 rounded-2xl p-4.5 shadow-xs">
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-extrabold text-green-900 flex items-center">
                  <TrendingUp className="h-4.5 w-4.5 mr-1.5 text-green-600" />
                  EXPECTED YIELD & HARVEST PREDICTION
                </span>
                <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2.5 py-0.5 rounded-full">Yield Estimation</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
                  <span className="block text-xs font-bold text-gray-500 uppercase">Estimated Yield Rate</span>
                  <span className="text-2xl font-black text-emerald-800">
                    {analysisData.yield_prediction?.predicted_yield_tonnes_per_ha?.toFixed(2) || '3.65'}
                  </span>
                  <span className="block text-xs font-bold text-emerald-600">Tonnes / Hectare</span>
                </div>
                <div className="bg-emerald-100/80 p-3.5 rounded-xl border border-emerald-300">
                  <span className="block text-xs font-bold text-gray-600 uppercase">Expected Total Harvest</span>
                  <span className="text-2xl font-black text-green-900">
                    {analysisData.yield_prediction?.predicted_total_production_tonnes?.toFixed(2) || '9.13'}
                  </span>
                  <span className="block text-xs font-extrabold text-green-700">Total Tonnes ({areaHa} ha)</span>
                </div>
              </div>
            </div>

            {/* MARKET PRICE FORECASTS & MARKET TREND CURVE (NEXT 15, 30, 90 DAYS) */}
            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-4.5 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs font-extrabold text-amber-950 flex items-center">
                  <LineChart className="h-5 w-5 mr-2 text-amber-700" />
                  EXPECTED MARKET PRICE & TREND CURVE (NEXT 15, 30, 90 DAYS)
                </span>
                <span className="text-[10px] bg-amber-200 text-amber-900 font-bold px-2.5 py-0.5 rounded-full flex items-center">
                  📈 Price Projection
                </span>
              </div>

              {/* 15, 30, 90 Days Price Cards Grid */}
              <div className="grid grid-cols-4 gap-3 text-center">
                <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-xs">
                  <span className="block text-[10px] font-bold text-gray-500 uppercase">Today</span>
                  <span className="text-base font-extrabold text-amber-900">₹{priceForecast.priceToday.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] font-bold text-gray-400">/ Quintal</span>
                </div>
                <div className="bg-amber-100/60 p-3 rounded-xl border border-amber-300 shadow-xs">
                  <span className="block text-[10px] font-bold text-amber-800 uppercase">Next 15 Days</span>
                  <span className="text-base font-extrabold text-amber-900">₹{priceForecast.price15.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] font-bold text-green-700">+3.8%</span>
                </div>
                <div className="bg-amber-200/60 p-3 rounded-xl border border-amber-400 shadow-xs">
                  <span className="block text-[10px] font-bold text-amber-900 uppercase">Next 30 Days</span>
                  <span className="text-base font-extrabold text-amber-950">₹{priceForecast.price30.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] font-bold text-green-700">+7.5%</span>
                </div>
                <div className="bg-amber-300/40 p-3 rounded-xl border border-amber-500 shadow-xs">
                  <span className="block text-[10px] font-bold text-amber-950 uppercase">Next 90 Days</span>
                  <span className="text-base font-black text-amber-950">₹{priceForecast.price90.toLocaleString('en-IN')}</span>
                  <span className="block text-[9px] font-bold text-green-700">+13.4%</span>
                </div>
              </div>

              {/* Interactive SVG Market Trend Line Curve Chart */}
              <div className="bg-white p-4 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center text-xs font-bold text-amber-900 mb-1">
                  <span>Market Price Curve ({analysisData.crop_recommendation?.recommended_crop || selectedCrop})</span>
                  <span className="text-[10px] text-gray-500">90-Day Outlook</span>
                </div>
                <div className="h-28 w-full relative pt-2">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 300 70">
                    <defs>
                      <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    <polygon 
                      points="20,60 20,48 100,38 180,26 260,10 260,60" 
                      fill="url(#priceGradient)" 
                    />

                    <polyline 
                      fill="none" 
                      stroke="#d97706" 
                      strokeWidth="3" 
                      strokeLinecap="round"
                      points="20,48 100,38 180,26 260,10" 
                    />

                    <circle cx="20" cy="48" r="4" fill="#d97706" />
                    <text x="20" y="65" fontSize="8" fontWeight="bold" fill="#78350f" textAnchor="middle">Today</text>
                    <text x="20" y="42" fontSize="8" fontWeight="extrabold" fill="#92400e" textAnchor="middle">₹{priceForecast.priceToday}</text>

                    <circle cx="100" cy="38" r="4" fill="#d97706" />
                    <text x="100" y="65" fontSize="8" fontWeight="bold" fill="#78350f" textAnchor="middle">+15 Days</text>
                    <text x="100" y="32" fontSize="8" fontWeight="extrabold" fill="#92400e" textAnchor="middle">₹{priceForecast.price15}</text>

                    <circle cx="180" cy="26" r="4" fill="#d97706" />
                    <text x="180" y="65" fontSize="8" fontWeight="bold" fill="#78350f" textAnchor="middle">+30 Days</text>
                    <text x="180" y="20" fontSize="8" fontWeight="extrabold" fill="#92400e" textAnchor="middle">₹{priceForecast.price30}</text>

                    <circle cx="260" cy="10" r="5" fill="#b45309" />
                    <text x="260" y="65" fontSize="8" fontWeight="bold" fill="#78350f" textAnchor="middle">+90 Days</text>
                    <text x="260" y="4" fontSize="8" fontWeight="black" fill="#b45309" textAnchor="middle">₹{priceForecast.price90}</text>
                  </svg>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs font-extrabold text-amber-900 pt-1 border-t border-amber-200/60">
                <span>Estimated Total Gross Revenue ({areaHa} ha):</span>
                <span className="text-lg font-black text-amber-800">
                  ₹{((analysisData.yield_prediction?.predicted_total_production_tonnes || 9.13) * 10 * (analysisData.market_price_summary?.mandi_price_per_quintal || 2300)).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* CULTIVATION COST & NET PROFIT ESTIMATE */}
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4.5 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black text-emerald-950 flex items-center">
                  <DollarSign className="h-4 w-4 mr-1 text-emerald-600" />
                  CULTIVATION COST & NET PROFIT ESTIMATE
                </span>
                <span className="text-[10px] bg-emerald-700 text-white font-black px-2.5 py-0.5 rounded-full">Profit Summary</span>
              </div>
              
              <div className="space-y-1.5 text-xs text-gray-700 font-semibold mb-3">
                <div className="flex justify-between">
                  <span>Est. Cultivation Cost (₹{(analysisData.profit_analysis?.cost_per_ha_inr || 75000).toLocaleString('en-IN')}/ha):</span>
                  <span className="font-bold text-gray-900">{analysisData.profit_analysis?.formatted_cost || `₹${(75000 * areaHa).toLocaleString('en-IN')}`}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Gross Revenue:</span>
                  <span className="font-bold text-gray-900">{analysisData.profit_analysis?.formatted_revenue || `₹${(3.65 * areaHa * 23000).toLocaleString('en-IN')}`}</span>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-emerald-300 flex justify-between items-center">
                <div>
                  <span className="block text-[10px] font-bold text-gray-500 uppercase">Expected Net Profit</span>
                  <span className="text-2xl font-black text-emerald-700">
                    {analysisData.profit_analysis?.formatted_profit || `₹${((3.65 * areaHa * 23000) - (75000 * areaHa)).toLocaleString('en-IN')}`}
                  </span>
                </div>
                <span className="bg-emerald-700 text-white font-black text-sm px-4 py-1.5 rounded-full shadow-xs">
                  +{analysisData.profit_analysis?.roi_percent || 19.1}% ROI
                </span>
              </div>
            </div>

          </div>
        ) : null}

      </div>

      {/* Floating Action Button Stack (Bottom Right Corner) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Listen to Voice Audio Advisory Button (Directly Above Smart Assistant) */}
        <button 
          onClick={handleReadAdvisory}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4.5 py-3 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all border border-blue-400 text-xs font-extrabold"
          title="Listen to Voice Audio Advisory"
        >
          <Volume2 className={`h-5 w-5 ${playing ? 'animate-pulse text-yellow-300' : 'text-white'}`} />
          <span>{playing ? 'Stop Audio' : 'Listen to Advisory'}</span>
        </button>

        {/* Smart Assistant Floating Trigger Button */}
        <button
          onClick={() => setIsAssistantOpen(true)}
          className="flex items-center space-x-2.5 bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 text-white px-5 py-3.5 rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all border border-emerald-400"
          title="Open Smart Assistant Chat"
        >
          <Bot className="h-6 w-6 text-amber-300 animate-pulse" />
          <span className="font-black text-sm tracking-wide">Smart Assistant</span>
        </button>
      </div>

      {/* EXPANDED CENTERED GLASS-BLURRY SMART ASSISTANT MODAL WINDOW */}
      {isAssistantOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-4xl h-[85vh] rounded-3xl border border-white/50 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-emerald-200/60 bg-emerald-700 text-white shadow-xs">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                  <Bot className="h-6 w-6 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg flex items-center gap-2">
                    Smart AI Farm Assistant
                    <span className="text-[10px] bg-amber-400/30 text-amber-200 px-2 py-0.5 rounded-full font-bold border border-amber-300/40">
                      Local Qwen 14B ML
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-100">Ask any questions about soil, crops, weather, mandi prices, or loans</p>
                </div>
              </div>

              <button 
                onClick={() => setIsAssistantOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-colors"
                title="Close Assistant"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Embedded Chat Area taking full modal height */}
            <div className="flex-1 overflow-hidden p-2 bg-gray-50/50">
              <FarmerChat isEmbedded={true} />
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
    </div>
  );
};

export default FarmerDashboard;
