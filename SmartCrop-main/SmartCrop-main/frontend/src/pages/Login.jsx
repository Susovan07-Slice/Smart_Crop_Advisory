import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { Phone, KeyRound, ArrowRight, Loader2, History, X, CheckCircle2, RotateCw, Sprout, Lock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Login = () => {
 const [step, setStep] = useState(1);
 const [phone, setPhone] = useState('');
 const [otp, setOtp] = useState('');
 const [loading, setLoading] = useState(false);
 const [resending, setResending] = useState(false);
 const [error, setError] = useState('');
 const [successMsg, setSuccessMsg] = useState('');
 const [testOtp, setTestOtp] = useState('');
 const [cooldown, setCooldown] = useState(0);

 // Load recent phones from local storage
 const [recentPhones, setRecentPhones] = useState(() => {
 try {
 const stored = JSON.parse(localStorage.getItem('recentFarmerPhones'));
 if (stored && stored.length > 0) return stored;
 } catch (e) {
 console.error(e);
 }
 return ['9437123456', '9876543210'];
 });
 const [showRecent, setShowRecent] = useState(false);
 
 const navigate = useNavigate();
 const { t } = useLanguage();

 // Handle countdown timer for Resend OTP
 useEffect(() => {
 let timer;
 if (cooldown > 0) {
 timer = setInterval(() => {
 setCooldown((prev) => prev - 1);
 }, 1000);
 }
 return () => clearInterval(timer);
 }, [cooldown]);

 const handleRequestOtp = async (e) => {
 e?.preventDefault();
 setError('');
 setSuccessMsg('');
 
 if (phone.length < 10) {
 setError('Please enter a valid 10-digit phone number.');
 return;
 }

 setLoading(true);
 try {
 const response = await apiClient.post('/auth/request-otp', { 
 phone,
 role: 'farmer'
 });
 setStep(2);
 setSuccessMsg(response.data.message || t('otp_sent_success'));
 setCooldown(response.data.resend_cooldown || 30);
 if (response.data.test_otp) setTestOtp(response.data.test_otp);
 } catch (err) {
 setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 const handleResendOtp = async () => {
 if (cooldown > 0 || resending) return;
 setError('');
 setSuccessMsg('');
 setResending(true);

 try {
 const response = await apiClient.post('/auth/request-otp', { 
 phone,
 role: 'farmer'
 });
 setSuccessMsg(response.data.message || t('otp_sent_success'));
 setCooldown(response.data.resend_cooldown || 30);
 if (response.data.test_otp) setTestOtp(response.data.test_otp);
 } catch (err) {
 setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
 } finally {
 setResending(false);
 }
 };

 const handleVerifyOtp = async (e) => {
 e.preventDefault();
 setError('');
 
 if (otp.length < 4) {
 setError('Please enter the full OTP code.');
 return;
 }

 setLoading(true);
 try {
 const response = await apiClient.post('/auth/verify-otp', { 
 phone, 
 otp,
 role: 'farmer'
 });
 if (response.data.token) {
 // Save token
 localStorage.setItem('token', response.data.token);
 
 // Save to recent logins (unique, max 3)
 const newRecents = [...new Set([phone, ...recentPhones])].slice(0, 3);
 localStorage.setItem('recentFarmerPhones', JSON.stringify(newRecents));
 setRecentPhones(newRecents);

 navigate('/farmer-dashboard');
 }
 } catch (err) {
 setError(err.response?.data?.detail || 'Invalid OTP code. Please check and try again.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div 
 className="min-h-[calc(100dvh-3.5rem)] sm:min-h-[calc(100vh-4rem)] flex items-center justify-center py-6 sm:py-12 px-3 sm:px-6 lg:px-8 relative overflow-hidden"
 style={{
 backgroundImage:"url('/bg-greenery.jpg')",
 backgroundSize: 'cover',
 backgroundPosition: 'center',
 backgroundRepeat: 'no-repeat'
 }}
 >
 <div className="absolute inset-0 bg-white/40 backdrop-blur-xs"></div>

 <div className="relative z-10 max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8 bg-white/95 backdrop-blur-sm p-5 sm:p-8 rounded-2xl shadow-xl border border-green-100">
 
 <div className="text-center">
 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
 <Sprout className="h-10 w-10 text-green-600" />
 </div>
 <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
 {t('farmer_login_title')}
 </h2>
 <p className="mt-2 text-xs sm:text-sm text-gray-600">
 {step === 1 ? t('enter_mobile') : `${t('enter_code')} ${phone}`}
 </p>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm">
 {error}
 </div>
 )}

 {successMsg && step === 2 && (
 <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex flex-col gap-1">
 <div className="flex items-center">
 <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
 <span>{successMsg}</span>
 </div>
 {testOtp && (
 <div className="mt-2 bg-green-100 p-2 rounded-lg border border-green-300 font-mono text-center text-lg font-bold text-green-900 tracking-widest shadow-sm">
 {testOtp}
 </div>
 )}
 </div>
 )}

 {step === 1 ? (
 <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleRequestOtp}>
 <div className="relative rounded-xl shadow-xs">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Phone className="h-5 w-5 text-gray-400" />
 </div>
 <input
 id="phone"
 name="phone"
 type="tel"
 required
 autoComplete="off"
 className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 text-base sm:text-lg border-gray-300 rounded-xl py-3 sm:py-3.5 bg-gray-50 border font-mono tracking-wider"
 placeholder={t('mobile_placeholder')}
 value={phone}
 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
 onFocus={() => setShowRecent(true)}
 onBlur={() => setShowRecent(false)}
 maxLength={10}
 />
 
 {/* Recent Logins Dropdown */}
 {showRecent && recentPhones.filter(p => p.includes(phone)).length > 0 && (
 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
 <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 flex items-center border-b border-gray-100">
 <History className="w-3.5 h-3.5 mr-1.5" /> {t('recent_logins')}
 </div>
 {recentPhones.filter(p => p.includes(phone)).map((p) => {
 const matchIndex = p.indexOf(phone);
 const beforeMatch = p.slice(0, matchIndex);
 const matchText = p.slice(matchIndex, matchIndex + phone.length);
 const afterMatch = p.slice(matchIndex + phone.length);

 return (
 <div
 key={p}
 onMouseDown={(e) => {
 e.preventDefault(); 
 setPhone(p);
 setShowRecent(false);
 }}
 className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-green-50 active:bg-green-100 cursor-pointer text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0 group"
 >
 <div className="flex items-center min-w-0 pr-2">
 <Phone className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" />
 <span className="font-medium tracking-wide text-sm sm:text-base truncate">
 {phone.length > 0 && matchIndex >= 0 ? (
 <>
 {beforeMatch}
 <span className="text-green-600 font-bold">{matchText}</span>
 {afterMatch}
 </>
 ) : (
 p
 )}
 </span>
 </div>
 
 <button
 onMouseDown={(e) => {
 e.preventDefault();
 e.stopPropagation();
 const updated = recentPhones.filter(item => item !== p);
 setRecentPhones(updated);
 localStorage.setItem('recentFarmerPhones', JSON.stringify(updated));
 }}
 className="text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50 transition-colors opacity-80 sm:opacity-0 sm:group-hover:opacity-100 flex-shrink-0"
 title="Remove from history"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 );
 })}
 </div>
 )}
 </div>

 <button
 type="submit"
 disabled={loading || phone.length < 10}
 className="group relative w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent text-base sm:text-lg font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
 >
 {loading ? <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6" /> : t('get_otp')}
 </button>
 </form>
 ) : (
 <form className="mt-6 sm:mt-8 space-y-4 sm:space-y-6" onSubmit={handleVerifyOtp}>
 <div className="relative rounded-xl shadow-xs">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-gray-400" />
 </div>
 <input
 id="otp"
 name="otp"
 type="text"
 required
 autoFocus
 className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 text-base sm:text-lg border-gray-300 rounded-xl py-3 sm:py-3.5 bg-gray-50 border text-center tracking-widest font-bold font-mono"
 placeholder="••••••"
 value={otp}
 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
 maxLength={6}
 />
 </div>

 <button
 type="submit"
 disabled={loading || otp.length < 4}
 className="group relative w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent text-base sm:text-lg font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
 >
 {loading ? (
 <Loader2 className="animate-spin h-5 w-5 sm:h-6 sm:w-6" />
 ) : (
 <span className="flex items-center justify-center">
 {t('verify_login')} <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
 </span>
 )}
 </button>
 
 {/* Resend & Change Mobile Actions */}
 <div className="flex items-center justify-between text-xs sm:text-sm pt-2 border-t border-gray-100">
 <button 
 type="button" 
 onClick={() => {
 setStep(1);
 setOtp('');
 setError('');
 setSuccessMsg('');
 }} 
 className="text-gray-500 hover:text-gray-700 font-medium"
 >
 ← {t('change_mobile')}
 </button>

 <button
 type="button"
 onClick={handleResendOtp}
 disabled={cooldown > 0 || resending}
 className="text-green-700 hover:text-green-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
 >
 {resending ? (
 <span className="flex items-center">
 <Loader2 className="animate-spin h-3.5 w-3.5 mr-1" />
 Sending...
 </span>
 ) : cooldown > 0 ? (
 <span>{t('resend_in')} {cooldown}{t('seconds_abbr')}</span>
 ) : (
 <span className="flex items-center">
 <RotateCw className="h-3.5 w-3.5 mr-1" />
 {t('resend_otp')}
 </span>
 )}
 </button>
 </div>
 </form>
 )}
 </div>
 </div>
 );
};

export default Login;
