import React, { useState, useEffect, useRef } from 'react';
import FarmerChat from './FarmerChat';
import { MapPin, Sprout, CloudRain, Lightbulb, Volume2, Landmark, AlertTriangle, Search, ChevronDown, LocateFixed } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

import WeatherWidget from '../components/WeatherWidget';

const ODISHA_DISTRICTS = [
"Angul","Balangir","Balasore","Bargarh","Bhadrak","Boudh","Cuttack","Deogarh", 
"Dhenkanal","Gajapati","Ganjam","Jagatsinghapur","Jajpur","Jharsuguda","Kalahandi", 
"Kandhamal","Kendrapara","Kendujhar","Khordha","Koraput","Malkangiri","Mayurbhanj", 
"Nabarangpur","Nayagarh","Nuapada","Puri","Rayagada","Sambalpur","Sonepur","Sundargarh"
];

const FarmerDashboard = () => {
 const { t } = useLanguage();
 
 // Persist location in localStorage
 const [location, setLocation] = useState(() => {
 return localStorage.getItem('smartCropLocation') || 'Sundargarh';
 });

 useEffect(() => {
 localStorage.setItem('smartCropLocation', location);
 }, [location]);

 const [playing, setPlaying] = useState(false);
 
 // Custom dropdown state
 const [showLocationSelect, setShowLocationSelect] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const locationRef = useRef(null);
 
 const [isLocating, setIsLocating] = useState(false);

 const detectCurrentLocation = () => {
 if ('geolocation' in navigator) {
 setIsLocating(true);
 navigator.geolocation.getCurrentPosition(async (position) => {
 try {
 const { latitude, longitude } = position.coords;
 // Reverse geocoding using OpenStreetMap Nominatim
 const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`);
 const data = await response.json();
 let cityOrDistrict = data.address.state_district || data.address.county || data.address.city || data.address.town || data.address.village || 'Sundargarh';
 cityOrDistrict = cityOrDistrict.replace(' District', '');
 
 // Update location (defaulting to nearest district if matched)
 if (ODISHA_DISTRICTS.includes(cityOrDistrict)) {
 setLocation(cityOrDistrict);
 } else {
 // Still update it even if it's not in our list exactly, or we can just fall back to it
 setLocation(cityOrDistrict);
 }
 setShowLocationSelect(false);
 } catch (error) {
 console.error("Error fetching location:", error);
 } finally {
 setIsLocating(false);
 }
 }, (error) => {
 console.warn("Geolocation permission denied or failed, using fallback.", error);
 setIsLocating(false);
 });
 }
 };

 useEffect(() => {
 const handleClickOutside = (event) => {
 if (locationRef.current && !locationRef.current.contains(event.target)) {
 setShowLocationSelect(false);
 }
 };
 document.addEventListener('mousedown', handleClickOutside);
 return () => document.removeEventListener('mousedown', handleClickOutside);
 }, []);

 const handleReadAdvisory = () => {
 if (!('speechSynthesis' in window)) return;
 
 if (window.speechSynthesis.speaking) {
 window.speechSynthesis.cancel();
 if (playing) {
 setPlaying(false);
 return;
 }
 }
 
 const text ="Today's Advisory: Heavy rain is expected. Delay irrigation today.";
 const utterance = new SpeechSynthesisUtterance(text);
 
 utterance.onstart = () => setPlaying(true);
 utterance.onend = () => setPlaying(false);
 utterance.onerror = () => setPlaying(false);
 
 window.speechSynthesis.speak(utterance);
 };

 const filteredDistricts = ODISHA_DISTRICTS.filter(dist => 
 dist.toLowerCase().includes(searchQuery.toLowerCase())
 );

 // Generate stable mock data based on location string
 const getMockDataForLocation = (loc) => {
 let hash = 0;
 for (let i = 0; i < loc.length; i++) {
 hash = loc.charCodeAt(i) + ((hash << 5) - hash);
 }
 
 // Base price around 2400-2800
 const price1 = 2400 + (Math.abs(hash) % 400);
 const price2 = 2300 + (Math.abs(hash * 2) % 500);
 
 // Distress Risk 20% to 85%
 const riskScore = 20 + (Math.abs(hash * 3) % 65);
 const riskLevel = riskScore > 60 ? 'High' : (riskScore > 40 ? 'Moderate' : 'Low');
 
 return {
 mandi1: `₹${price1.toLocaleString('en-IN')}/q`,
 mandi2: `₹${price2.toLocaleString('en-IN')}/q`,
 riskScore,
 riskLevel
 };
 };

 const mockData = getMockDataForLocation(location);

 return (
 <div className="max-w-[90rem] mx-auto px-4 py-6 h-[calc(100dvh-3.5rem)] sm:h-[calc(100vh-4rem)] flex flex-col">
 <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] overflow-hidden bg-gray-50 transition-colors">
 
 {/* Left Pane: Smart Crop Assistant (Chat) */}
 <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-gray-200 flex flex-col bg-white transition-colors">
 <FarmerChat isEmbedded={true} />
 </div>

 {/* Right Pane: Advisory Mockup */}
 <div className="flex-1 lg:w-1/2 bg-gray-50 rounded-2xl p-4 sm:p-5 flex flex-col space-y-4 overflow-y-auto relative">
 {/* Header */}
 <div className="flex items-center space-x-2 pb-3 border-b border-gray-200 shrink-0">
 <Sprout className="h-5 w-5 text-green-600" />
 <h2 className="text-lg font-bold text-gray-800">{t('advisory_title')}</h2>
 </div>

 {/* Location & Crop */}
 <div className="space-y-2 shrink-0">
 <div className="relative" ref={locationRef}>
 <div 
 className="flex items-center text-gray-700 cursor-pointer hover:text-green-700 transition-colors py-1 w-fit"
 onClick={() => { setShowLocationSelect(!showLocationSelect); setSearchQuery(''); }}
 >
 <MapPin className="h-4 w-4 text-red-500 mr-2 shrink-0" />
 <span className="font-medium text-base">{location}</span>
 <ChevronDown className={`h-4 w-4 ml-1.5 opacity-50 transition-transform ${showLocationSelect ? 'rotate-180' : ''}`} />
 </div>

 {showLocationSelect && (
 <div className="absolute top-full left-0 mt-1 w-64 sm:w-72 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
 <div className="p-2 border-b border-gray-100 bg-gray-50">
 <div className="relative">
 <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
 <input
 type="text"
 className="w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-500 outline-hidden transition-shadow"
 placeholder="Search district..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 autoFocus
 />
 </div>
 </div>
 <div className="max-h-60 overflow-y-auto py-1">
 <div 
 onClick={detectCurrentLocation}
 className="px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center text-blue-600 hover:bg-blue-50 border-b border-gray-100"
 >
 <LocateFixed className={`h-4 w-4 mr-2 ${isLocating ? 'animate-pulse' : ''}`} />
 <span className="font-medium">{isLocating ? 'Detecting location...' : 'Use Current Location'}</span>
 </div>
 {filteredDistricts.length > 0 ? (
 filteredDistricts.map(dist => (
 <div
 key={dist}
 onClick={() => {
 setLocation(dist);
 setShowLocationSelect(false);
 }}
 className={`px-4 py-2 text-sm cursor-pointer transition-colors flex items-center justify-between ${
 location === dist 
 ? 'bg-green-50 text-green-700 font-medium' 
 : 'text-gray-700 hover:bg-gray-50 '
 }`}
 >
 {dist}
 {location === dist && <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>}
 </div>
 ))
 ) : (
 <div className="px-4 py-3 text-sm text-gray-500 text-center">No districts found</div>
 )}
 </div>
 </div>
 )}
 </div>
 
 <div className="flex items-center text-gray-700 pt-1">
 <Sprout className="h-4 w-4 text-green-500 mr-2 shrink-0" />
 <span className="font-medium">{t('crop')}: {t('rice')}</span>
 </div>
 </div>

 {/* Weather Widget (Google Style) */}
 <div className="shrink-0 w-full pt-1 pb-1">
 <WeatherWidget location={location} />
 </div>

 {/* Today's Advisory */}
 <div className="space-y-1.5 pt-1 shrink-0">
 <div className="flex items-center text-yellow-600 font-bold uppercase text-xs tracking-wider">
 <Lightbulb className="h-4 w-4 mr-2" />
 <span>{t('todays_advisory')}</span>
 </div>
 <div className="pl-6 text-gray-800 font-medium text-sm">
 <p>{t('heavy_rain_expected')}</p>
 <p>{t('delay_irrigation')}</p>
 </div>
 <div className="pl-6 pt-1">
 <button 
 onClick={handleReadAdvisory}
 className="flex items-center space-x-1.5 text-blue-600 hover:text-blue-700 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors text-sm"
 >
 <Volume2 className={`h-4 w-4 ${playing ? 'animate-pulse' : ''}`} />
 <span>{t('listen')}</span>
 </button>
 </div>
 </div>

 {/* Mandi Prices */}
 <div className="space-y-1 pt-1 shrink-0">
 <div className="flex items-center text-gray-700 font-semibold text-sm">
 <Landmark className="h-4 w-4 text-orange-500 mr-2" />
 <span>{t('mandi_prices')}</span>
 </div>
 <div className="pl-6 space-y-0.5 text-gray-600 text-sm">
 <div className="flex justify-between">
 <span>{location}</span>
 <span className="font-medium text-gray-800">{mockData.mandi1}</span>
 </div>
 <div className="flex justify-between">
 <span>Nearby Market</span>
 <span className="font-medium text-gray-800">{mockData.mandi2}</span>
 </div>
 </div>
 </div>

 {/* Distress Risk */}
 <div className="space-y-1 pt-2 pb-1 border-t border-gray-200 mt-2 shrink-0">
 <div className="flex items-center text-gray-700 font-semibold uppercase text-xs tracking-wider mt-2">
 <AlertTriangle className={`h-4 w-4 mr-2 ${mockData.riskLevel === 'High' ? 'text-red-500' : (mockData.riskLevel === 'Moderate' ? 'text-yellow-500' : 'text-green-500')}`} />
 <span>{t('distress_risk')}</span>
 </div>
 <p className="pl-6 text-gray-800 font-medium text-sm">
 {mockData.riskLevel === 'High' && <span className="text-red-600 font-bold">High</span>}
 {mockData.riskLevel === 'Moderate' && <span className="text-yellow-600 font-bold">Moderate</span>}
 {mockData.riskLevel === 'Low' && <span className="text-green-600 font-bold">Low</span>}
 – {mockData.riskScore}%
 </p>
 </div>

 </div>
 </div>
 </div>
 );
};

export default FarmerDashboard;
