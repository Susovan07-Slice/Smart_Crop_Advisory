import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/client';
import { User, Lock, Phone, KeyRound, ArrowRight, Loader2, History, X, CheckCircle2, RotateCw, ShieldCheck, Building2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const OfficerLogin = () => {
 const [authMode, setAuthMode] = useState('otp'); // 'otp' | 'password'
 
 // OTP State
 const [step, setStep] = useState(1);
 const [phone, setPhone] = useState('');
 const [otp, setOtp] = useState('');
 const [cooldown, setCooldown] = useState(0);
 const [resending, setResending] = useState(false);
 const [successMsg, setSuccessMsg] = useState('');

 // Password State
 const [username, setUsername] = useState('');
 const [password, setPassword] = useState('');
 
 // Common State
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const { t } = useLanguage();
 const navigate = useNavigate();

 // Load recent officer phones & usernames from local storage
 const [recentPhones, setRecentPhones] = useState(() => {
 try {
 const stored = JSON.parse(localStorage.getItem('recentOfficerPhones'));
 if (stored && stored.length > 0) return stored;
 } catch (e) {
 console.error(e);
 }
 return ['9437111222', '9933445566'];
 });
 const [showRecentPhones, setShowRecentPhones] = useState(false);

 const [recentUsernames, setRecentUsernames] = useState(() => {
 try {
 const stored = JSON.parse(localStorage.getItem('recentOfficerUsernames'));
 if (stored && stored.length > 0) return stored;
 } catch (e) {
 console.error(e);
 }
 return ['officer_su', 'admin_od'];
 });
 const [showRecentUsernames, setShowRecentUsernames] = useState(false);

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

 // Request OTP for Officer
 const handleRequestOtp = async (e) => {
 e?.preventDefault();
 setError('');
 setSuccessMsg('');
 
 if (phone.length < 10) {
 setError('Please enter a valid 10-digit officer mobile number.');
 return;
 }

 setLoading(true);
 try {
 const response = await apiClient.post('/auth/request-otp', { 
 phone,
 role: 'officer'
 });
 setStep(2);
 setSuccessMsg(response.data.message || t('otp_sent_success'));
 setCooldown(response.data.resend_cooldown || 30);
 } catch (err) {
 setError(err.response?.data?.detail || 'Failed to send OTP. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 // Resend OTP for Officer
 const handleResendOtp = async () => {
 if (cooldown > 0 || resending) return;
 setError('');
 setSuccessMsg('');
 setResending(true);

 try {
 const response = await apiClient.post('/auth/request-otp', { 
 phone,
 role: 'officer'
 });
 setSuccessMsg(response.data.message || t('otp_sent_success'));
 setCooldown(response.data.resend_cooldown || 30);
 } catch (err) {
 setError(err.response?.data?.detail || 'Failed to resend OTP. Please try again.');
 } finally {
 setResending(false);
 }
 };

 // Verify OTP for Officer
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
 role: 'officer'
 });
 if (response.data.token) {
 localStorage.setItem('officerToken', response.data.token);
 
 // Save to recent logins
 const newRecents = [...new Set([phone, ...recentPhones])].slice(0, 3);
 localStorage.setItem('recentOfficerPhones', JSON.stringify(newRecents));
 setRecentPhones(newRecents);

 navigate('/officer-dashboard');
 }
 } catch (err) {
 setError(err.response?.data?.detail || 'Invalid OTP code. Please check and try again.');
 } finally {
 setLoading(false);
 }
 };

 // Password Login Handler
 const handlePasswordLogin = async (e) => {
 e.preventDefault();
 setError('');
 setLoading(true);

 try {
 const response = await apiClient.post('/auth/officer-login', { username, password });
 if (response.data.token) {
 localStorage.setItem('officerToken', response.data.token);
 
 const newRecents = [...new Set([username, ...recentUsernames])].slice(0, 3);
 localStorage.setItem('recentOfficerUsernames', JSON.stringify(newRecents));
 setRecentUsernames(newRecents);

 navigate('/officer-dashboard');
 }
 } catch (err) {
 setError('Invalid credentials. (Hint: use admin / 123)');
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

 <div className="relative z-10 max-w-sm sm:max-w-md w-full space-y-5 sm:space-y-6 bg-white/95 backdrop-blur-sm p-5 sm:p-8 rounded-2xl shadow-xl border border-blue-100 transition-colors">
 
 {/* Header */}
 <div>
 <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100">
 <Building2 className="h-10 w-10 text-blue-600" />
 </div>
 <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
 {t('officer_portal_title')}
 </h2>
 <p className="mt-2 text-center text-sm text-gray-600">
 {t('officer_sign_in')}
 </p>
 </div>

 {/* Tab Selection */}
 <div className="flex rounded-xl bg-gray-100 p-1 border border-gray-200">
 <button
 type="button"
 onClick={() => {
 setAuthMode('otp');
 setError('');
 setSuccessMsg('');
 }}
 className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
 authMode === 'otp'
 ? 'bg-white text-blue-700 shadow-xs'
 : 'text-gray-600 hover:text-gray-900 '
 }`}
 >
 {t('officer_login_otp')}
 </button>
 <button
 type="button"
 onClick={() => {
 setAuthMode('password');
 setError('');
 setSuccessMsg('');
 }}
 className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
 authMode === 'password'
 ? 'bg-white text-blue-700 shadow-xs'
 : 'text-gray-600 hover:text-gray-900 '
 }`}
 >
 {t('officer_login_pwd')}
 </button>
 </div>

 {error && (
 <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm">
 {error}
 </div>
 )}

 {successMsg && authMode === 'otp' && step === 2 && (
 <div className="bg-green-50 border border-green-200 text-green-700 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm flex items-center">
 <CheckCircle2 className="h-4 w-4 mr-2 flex-shrink-0 text-green-600" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* --- OPTION 1: MOBILE OTP AUTHENTICATION --- */}
 {authMode === 'otp' && (
 step === 1 ? (
 <form className="space-y-4" onSubmit={handleRequestOtp}>
 <div className="relative rounded-xl shadow-xs">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Phone className="h-5 w-5 text-gray-400" />
 </div>
 <input
 id="officer-phone"
 name="phone"
 type="tel"
 required
 autoComplete="off"
 className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 text-base sm:text-lg border-gray-300 rounded-xl py-3 sm:py-3.5 bg-gray-50 border font-mono tracking-wider text-gray-900"
 placeholder={t('officer_mobile_placeholder')}
 value={phone}
 onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
 onFocus={() => setShowRecentPhones(true)}
 onBlur={() => setShowRecentPhones(false)}
 maxLength={10}
 />
 
 {/* Recent Phones Dropdown */}
 {showRecentPhones && recentPhones.filter(p => p.includes(phone)).length > 0 && (
 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
 <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 flex items-center border-b border-gray-100">
 <History className="w-3.5 h-3.5 mr-1.5" /> {t('recent_logins')}
 </div>
 {recentPhones.filter(p => p.includes(phone)).map((p) => (
 <div
 key={p}
 onMouseDown={(e) => {
 e.preventDefault(); 
 setPhone(p);
 setShowRecentPhones(false);
 }}
 className="px-3 sm:px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0 group"
 >
 <div className="flex items-center min-w-0 pr-2">
 <Phone className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" />
 <span className="font-medium tracking-wide text-sm truncate">{p}</span>
 </div>
 <button
 onMouseDown={(e) => {
 e.preventDefault();
 e.stopPropagation();
 const updated = recentPhones.filter(item => item !== p);
 setRecentPhones(updated);
 localStorage.setItem('recentOfficerPhones', JSON.stringify(updated));
 }}
 className="text-gray-400 hover:text-red-500 p-1 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>

 <button
 type="submit"
 disabled={loading || phone.length < 10}
 className="group relative w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
 >
 {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('get_otp')}
 </button>
 </form>
 ) : (
 <form className="space-y-4" onSubmit={handleVerifyOtp}>
 <div className="relative rounded-xl shadow-xs">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <KeyRound className="h-5 w-5 text-gray-400" />
 </div>
 <input
 id="officer-otp"
 name="otp"
 type="text"
 required
 autoFocus
 className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 text-base sm:text-lg border-gray-300 rounded-xl py-3 sm:py-3.5 bg-gray-50 border text-center tracking-widest font-bold font-mono text-gray-900"
 placeholder="••••••"
 value={otp}
 onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
 maxLength={6}
 />
 </div>

 <button
 type="submit"
 disabled={loading || otp.length < 4}
 className="group relative w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
 >
 {loading ? (
 <Loader2 className="animate-spin h-5 w-5" />
 ) : (
 <span className="flex items-center justify-center">
 {t('access_dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
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
 className="text-blue-700 hover:text-blue-800 font-semibold disabled:text-gray-400 disabled:cursor-not-allowed flex items-center"
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
 )
 )}

 {/* --- OPTION 2: USERNAME & PASSWORD AUTHENTICATION --- */}
 {authMode === 'password' && (
 <form className="space-y-4" onSubmit={handlePasswordLogin}>
 <div className="space-y-3">
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <User className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type="text"
 required
 autoComplete="off"
 className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
 placeholder={t('username_placeholder')}
 value={username}
 onChange={(e) => setUsername(e.target.value)}
 onFocus={() => setShowRecentUsernames(true)}
 onBlur={() => setShowRecentUsernames(false)}
 />
 
 {/* Recent Usernames Dropdown */}
 {showRecentUsernames && recentUsernames.filter(u => u.toLowerCase().includes(username.toLowerCase())).length > 0 && (
 <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
 <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-500 flex items-center border-b border-gray-100">
 <History className="w-3.5 h-3.5 mr-1.5" /> {t('recent_logins')}
 </div>
 {recentUsernames.filter(u => u.toLowerCase().includes(username.toLowerCase())).map((u) => (
 <div
 key={u}
 onMouseDown={(e) => {
 e.preventDefault(); 
 setUsername(u);
 setShowRecentUsernames(false);
 }}
 className="px-3 sm:px-4 py-2.5 hover:bg-blue-50 cursor-pointer text-gray-700 flex items-center justify-between border-b border-gray-50 last:border-0 group"
 >
 <div className="flex items-center min-w-0 pr-2">
 <User className="w-4 h-4 mr-2.5 text-gray-400 flex-shrink-0" />
 <span className="font-medium text-sm truncate">{u}</span>
 </div>
 <button
 onMouseDown={(e) => {
 e.preventDefault();
 e.stopPropagation();
 const updated = recentUsernames.filter(item => item !== u);
 setRecentUsernames(updated);
 localStorage.setItem('recentOfficerUsernames', JSON.stringify(updated));
 }}
 className="text-gray-400 hover:text-red-500 p-1 rounded-full opacity-80 sm:opacity-0 sm:group-hover:opacity-100"
 >
 <X className="w-4 h-4" />
 </button>
 </div>
 ))}
 </div>
 )}
 </div>
 
 <div className="relative">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Lock className="h-5 w-5 text-gray-400" />
 </div>
 <input
 type="password"
 required
 className="appearance-none rounded-xl relative block w-full pl-10 px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
 placeholder={t('password_placeholder')}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 />
 </div>
 </div>

 <button
 type="submit"
 disabled={loading}
 className="group relative w-full flex justify-center items-center py-3 sm:py-3.5 px-4 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.99] focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-md"
 >
 {loading ? (
 <Loader2 className="animate-spin h-5 w-5" />
 ) : (
 <span className="flex items-center justify-center">
 {t('access_dashboard')} <ArrowRight className="ml-2 h-4 w-4" />
 </span>
 )}
 </button>
 </form>
 )}
 
 {/* Back link */}
 <div className="text-center pt-1">
 <button 
 type="button" 
 onClick={() => navigate('/')} 
 className="text-xs sm:text-sm text-gray-500 hover:text-blue-600 transition-colors inline-flex items-center"
 >
 <span>{t('back_to_roles')}</span>
 </button>
 </div>

 </div>
 </div>
 );
};

export default OfficerLogin;
