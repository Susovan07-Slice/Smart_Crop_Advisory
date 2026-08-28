import React, { useEffect, useState } from 'react';
import apiClient from '../api/client';
import { Users, AlertTriangle, Activity, MapPin, TrendingUp, FileText, Sprout } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Dashboard = () => {
 const [data, setData] = useState({ total_farmers: 0, high_risk_count: 0, high_risk_farmers: [] });
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 
 const { t } = useLanguage();

 useEffect(() => {
 const fetchDashboardData = async () => {
 try {
 const response = await apiClient.get('/dashboard-data/');
 setData(response.data);
 setLoading(false);
 } catch (err) {
 setError(t('fetch_error'));
 setLoading(false);
 }
 };

 fetchDashboardData();
 }, [t]);

 const [sendingAlertId, setSendingAlertId] = useState(null);
 const [alertSuccessId, setAlertSuccessId] = useState(null);

 const sendAlert = async (farmerId) => {
 setSendingAlertId(farmerId);
 try {
 await apiClient.post(`/alert/${farmerId}`);
 setAlertSuccessId(farmerId);
 setTimeout(() => setAlertSuccessId(null), 3000);
 } catch (err) {
 alert(t('alert_failed'));
 } finally {
 setSendingAlertId(null);
 }
 };

 if (loading) return (
 <div className="p-8 text-center text-gray-500 flex flex-col items-center justify-center min-h-[50vh]">
 <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3"></div>
 <p className="text-sm font-medium">{t('loading_dashboard')}</p>
 </div>
 );
 
 if (error) return (
 <div className="p-8 text-center text-red-600 max-w-md mx-auto my-12 bg-red-50 border border-red-200 rounded-2xl">
 <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-500" />
 <p className="text-sm font-medium">{error}</p>
 </div>
 );

 return (
 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
 <div className="flex justify-between items-center mb-8">
 <div>
 <h1 className="text-2xl font-bold text-gray-900">District Overview</h1>
 <p className="text-gray-500 mt-1">Real-time agricultural monitoring</p>
 </div>
 <div className="flex items-center space-x-2 bg-white p-2 rounded-lg shadow-xs border border-gray-100">
 <MapPin className="h-5 w-5 text-blue-500" />
 <select className="bg-transparent border-none focus:ring-0 text-gray-700 font-medium cursor-pointer">
 <option>Sundergarh</option>
 <option>Sambalpur</option>
 <option>Bargarh</option>
 </select>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
 {/* Placeholder for dynamic stats logic mapping */}
 </div>
 
 {/* Stats Cards */}
 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mb-6 sm:mb-8">
 <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex items-center hover:shadow-md transition-shadow">
 <div className="p-3 rounded-xl bg-blue-50 text-blue-600 mr-3.5 sm:mr-4 flex-shrink-0">
 <Users className="h-5 w-5 sm:h-6 sm:w-6" />
 </div>
 <div className="min-w-0">
 <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{t('total_farmers')}</p>
 <p className="text-xl sm:text-3xl font-extrabold text-gray-900">{data.total_farmers}</p>
 </div>
 </div>
 
 <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex items-center hover:shadow-md transition-shadow">
 <div className="p-3 rounded-xl bg-red-50 text-red-600 mr-3.5 sm:mr-4 flex-shrink-0">
 <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" />
 </div>
 <div className="min-w-0">
 <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{t('high_risk_farmers')}</p>
 <p className="text-xl sm:text-3xl font-extrabold text-red-600">{data.high_risk_count}</p>
 </div>
 </div>

 <div className="bg-white rounded-2xl shadow-xs border border-gray-100 p-4 sm:p-6 flex items-center hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
 <div className="p-3 rounded-xl bg-green-50 text-green-600 mr-3.5 sm:mr-4 flex-shrink-0">
 <Activity className="h-5 w-5 sm:h-6 sm:w-6" />
 </div>
 <div className="min-w-0">
 <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{t('system_status')}</p>
 <div className="flex items-center space-x-1.5">
 <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></span>
 <p className="text-lg sm:text-2xl font-bold text-gray-900">{t('status_active')}</p>
 </div>
 </div>
 </div>
 </div>

 {/* High Risk Farmers List */}
 <div className="bg-white shadow-xs border border-gray-200 rounded-2xl overflow-hidden transition-colors">
 <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-200 bg-gray-50/75 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
 <div>
 <h2 className="text-base sm:text-lg font-bold text-gray-900">{t('high_risk_farmers')}</h2>
 <p className="mt-0.5 text-xs sm:text-sm text-gray-500">{t('high_risk_subtitle')}</p>
 </div>
 {data.high_risk_farmers.length > 0 && (
 <span className="self-start sm:self-auto text-xs font-semibold px-2.5 py-1 bg-red-100 text-red-800 rounded-full border border-red-200">
 {data.high_risk_farmers.length} {t('high_risk_farmers')}
 </span>
 )}
 </div>
 
 {data.high_risk_farmers.length > 0 ? (
 <ul className="divide-y divide-gray-100">
 {data.high_risk_farmers.map((farmer) => (
 <li key={farmer.farmer_id} className="p-4 sm:px-6 sm:py-4 hover:bg-gray-50/80 transition-colors">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
 <div className="min-w-0">
 <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{farmer.name}</p>
 <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 mt-0.5">
 <span className="font-medium text-gray-700">{farmer.district}</span>
 <span>•</span>
 <span className="font-mono">{farmer.phone}</span>
 </div>
 </div>
 
 <div className="flex items-center justify-between sm:justify-end space-x-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-gray-100">
 <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-800 border border-red-200 flex-shrink-0">
 {t('score_label')}: {farmer.score.toFixed(1)}
 </span>
 
 <button 
 onClick={() => sendAlert(farmer.farmer_id)}
 disabled={sendingAlertId === farmer.farmer_id || alertSuccessId === farmer.farmer_id}
 className={`inline-flex items-center justify-center px-3.5 py-2 border border-transparent text-xs sm:text-sm font-semibold rounded-xl shadow-xs text-white transition-all active:scale-95 flex-shrink-0 ${
 alertSuccessId === farmer.farmer_id 
 ? 'bg-green-600 hover:bg-green-700' 
 : 'bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50'
 }`}
 >
 {sendingAlertId === farmer.farmer_id ? (
 <span className="flex items-center">
 <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin mr-1.5"></span>
 Sending...
 </span>
 ) : alertSuccessId === farmer.farmer_id ? (
 <span>✓ Alert Sent</span>
 ) : (
 t('send_alert_btn')
 )}
 </button>
 </div>
 </div>
 </li>
 ))}
 </ul>
 ) : (
 <div className="px-6 py-8 text-center text-gray-500 text-sm">{t('no_high_risk')}</div>
 )}
 </div>
 </div>
 );
};

export default Dashboard;
