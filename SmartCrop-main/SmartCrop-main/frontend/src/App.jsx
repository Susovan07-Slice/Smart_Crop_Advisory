import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import FarmerDashboard from './pages/FarmerDashboard';
import OfficerLogin from './pages/OfficerLogin';
import Dashboard from './pages/Dashboard';
import { Sprout, Globe, User, PhoneCall, Settings, LogOut, ChevronDown, CreditCard, DollarSign, LogIn } from 'lucide-react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import smartBotImg from './assets/smart_bot.png';

function NavigationBar() {
  const { lang, changeLanguage, t } = useLanguage();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('smartCropTheme') === 'dark';
  });

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return !!localStorage.getItem('farmerMobile') || !!localStorage.getItem('token');
  });

  // Reactive state for loan profile details from localStorage
  const [loanProfile, setLoanProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('farmerLoanProfile');
      return saved ? JSON.parse(saved) : { has_loan: false, original_loan_amount: 0, outstanding_principal: 0, total_amount_repaid: 0 };
    } catch (e) {
      return { has_loan: false, original_loan_amount: 0, outstanding_principal: 0, total_amount_repaid: 0 };
    }
  });

  const farmerProfile = (() => {
    try {
      const saved = localStorage.getItem('smartCropFarmerProfile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  })();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    const syncAuth = () => {
      setIsLoggedIn(!!localStorage.getItem('farmerMobile') || !!localStorage.getItem('token'));
      try {
        const saved = localStorage.getItem('farmerLoanProfile');
        setLoanProfile(saved ? JSON.parse(saved) : { has_loan: false });
      } catch (e) {}
    };
    const syncTheme = () => {
      setIsDarkMode(localStorage.getItem('smartCropTheme') === 'dark');
    };

    syncAuth();
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('farmerLoginUpdated', syncAuth);
    window.addEventListener('loanProfileUpdated', syncAuth);
    window.addEventListener('smartCropThemeUpdated', syncTheme);
    window.addEventListener('storage', syncAuth);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('farmerLoginUpdated', syncAuth);
      window.removeEventListener('loanProfileUpdated', syncAuth);
      window.removeEventListener('smartCropThemeUpdated', syncTheme);
      window.removeEventListener('storage', syncAuth);
    };
  }, [location.pathname]);

  const handleTriggerChat = () => {
    window.dispatchEvent(new CustomEvent('toggleSmartAssistant'));
  };

  const handleOpenLoanModal = () => {
    window.dispatchEvent(new CustomEvent('openLoanModal'));
    setShowProfileMenu(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('farmerMobile');
    localStorage.removeItem('smartCropFarmerProfile');
    localStorage.removeItem('farmerLoanProfile');
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    window.dispatchEvent(new CustomEvent('farmerLoginUpdated'));
    navigate('/farmer-login');
  };

  const handleHomeClick = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('farmerMobile');
    localStorage.removeItem('smartCropFarmerProfile');
    localStorage.removeItem('farmerLoanProfile');
    setIsLoggedIn(false);
    setShowProfileMenu(false);
    window.dispatchEvent(new CustomEvent('farmerLoginUpdated'));
    navigate('/');
  };

  const farmerName = farmerProfile?.first_name 
    ? `${farmerProfile.first_name} ${farmerProfile.last_name || ''}`.trim()
    : "Farmer Profile";

  return (
    <nav className={`w-full backdrop-blur-md border-b sticky top-0 z-50 shadow-2xs transition-colors ${
      isDarkMode 
        ? 'bg-slate-900/95 border-slate-800 text-white' 
        : 'bg-white/95 border-gray-200 text-gray-900'
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <a href="/" onClick={handleHomeClick} className="flex items-center space-x-2.5 group cursor-pointer">
            <div className="bg-gradient-to-tr from-emerald-600 to-green-500 p-2 rounded-xl text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <span className={`text-lg sm:text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {t('nav_brand')}
              <span className={`ml-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                isDarkMode ? 'text-emerald-300 bg-emerald-950/80 border border-emerald-800' : 'text-emerald-700 bg-emerald-100'
              }`}>
                {t('nav_farmer')}
              </span>
            </span>
          </a>

          {/* Right Action Stack */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Language Selector Dropdown */}
            <div className={`flex items-center border rounded-lg px-2 sm:px-2.5 py-1 transition-colors ${
              isDarkMode ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-800'
            }`}>
              <Globe className={`h-3.5 w-3.5 mr-1 flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`} />
              <select
                value={lang}
                onChange={(e) => changeLanguage(e.target.value)}
                aria-label={t('language')}
                className={`bg-transparent text-xs font-semibold focus:outline-hidden cursor-pointer border-none pr-1 ${
                  isDarkMode ? 'text-white' : 'text-gray-800'
                }`}
              >
                <option value="en" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>English</option>
                <option value="or" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>ଓଡ଼ିଆ</option>
                <option value="hi" className={isDarkMode ? 'bg-slate-900 text-white' : ''}>हिन्दी</option>
              </select>
            </div>

            {/* Home Link */}
            <a 
              href="/" 
              onClick={handleHomeClick}
              className={`text-xs font-semibold px-2 py-1.5 rounded-lg transition-colors cursor-pointer ${
                isDarkMode ? 'text-slate-300 hover:text-emerald-400 hover:bg-slate-800' : 'text-gray-700 hover:text-green-700 hover:bg-gray-100'
              }`}
            >
              {t('home')}
            </a>

            {/* CONDITIONAL AUTHENTICATED PROFILE & LOANS DROPDOWN */}
            {isLoggedIn ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-full border transition-colors shadow-2xs font-extrabold text-xs ${
                    isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-300'
                  }`}
                  title="Account Profile & Loan Summary"
                >
                  <User className="h-4 w-4 text-emerald-500" />
                  <span className="hidden md:inline max-w-[100px] truncate">{farmerName}</span>
                  <ChevronDown className="h-3 w-3 text-emerald-500" />
                </button>

                {/* Profile Dropdown Menu Modal */}
                {showProfileMenu && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border py-2.5 z-50 animate-in fade-in zoom-in-95 duration-150 ${
                    isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-gray-200 text-gray-800'
                  }`}>
                    
                    {/* Farmer Header Info */}
                    <div className={`px-4 py-2 border-b ${isDarkMode ? 'border-slate-800' : 'border-gray-100'}`}>
                      <p className={`text-sm font-black truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>👤 {farmerName}</p>
                      <p className="text-[11px] text-emerald-500 font-bold">
                        📍 {farmerProfile?.district || 'Odisha Node'} • {farmerProfile?.land_area_ha || 2.5} ha
                      </p>
                    </div>

                    {/* LOAN SUMMARY OVERVIEW SECTION INSIDE PROFILE DROPDOWN */}
                    <div className="p-3 my-1 mx-2 bg-gradient-to-br from-amber-50 to-orange-50/80 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-amber-950 uppercase flex items-center">
                          <CreditCard className="h-3.5 w-3.5 mr-1 text-amber-700" />
                          {t('loan_summary_title')}
                        </span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          loanProfile.has_loan ? 'bg-amber-200 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {loanProfile.has_loan ? "Active Loan" : t('no_active_loans_badge')}
                        </span>
                      </div>

                      {loanProfile.has_loan ? (
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between items-center text-gray-700"><span className="text-[11px] font-medium">{t("annual_interest_rate") || "Interest Rate"}:</span><span className="font-bold text-amber-600">{(loanProfile.annual_interest_rate || 8.5)}%</span></div><div className="flex justify-between items-center text-gray-700"><span className="text-[11px] font-medium">{t("loan_due_date") || "Due Date"}:</span><span className="font-bold text-gray-900">{loanProfile.loan_due_date || "2027-09-15"}</span></div>
                          <div className="flex justify-between items-center pt-1 border-t border-amber-200/80">
                            <span className="text-[11px] font-black text-amber-950">{t("outstanding_principal") || "Outstanding Principal"}:</span>
                            <span className="text-sm font-black text-red-600">
                              ₹{(loanProfile.outstanding_principal || 80000).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-gray-600 italic">No active loan registered on your profile.</p>
                      )}

                      <button
                        onClick={handleOpenLoanModal}
                        className="w-full mt-1 py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-extrabold transition-colors shadow-2xs text-center block"
                      >
                        {loanProfile.has_loan ? "✏️ Edit Loan & Financial Profile" : "+ Add Active Loan"}
                      </button>
                    </div>

                    {/* Kisan Helpline Numbers Section */}
                    <div className="px-3 py-2 border-t border-b border-gray-100 bg-emerald-50/50">
                      <p className="text-[10px] font-extrabold text-emerald-900 uppercase flex items-center mb-1">
                        <PhoneCall className="h-3 w-3 mr-1 text-emerald-600" />
                        {t('krushi_helpline')}
                      </p>
                      <div className="space-y-1 text-xs">
                        <a href="tel:18001801551" className="flex justify-between items-center text-gray-700 hover:text-emerald-700 font-semibold">
                          <span>{t('kisan_call_center')}:</span>
                          <span className="font-bold text-emerald-800">1800-180-1551</span>
                        </a>
                        <a href="tel:1551" className="flex justify-between items-center text-gray-700 hover:text-emerald-700 font-semibold">
                          <span>Toll Free Shortcode:</span>
                          <span className="font-bold text-emerald-800">1551</span>
                        </a>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center space-x-2 transition-colors border-t border-gray-100 cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-red-500" />
                      <span>{t('logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* BEFORE LOGIN: Clean Sign In Button */
              <Link
                to="/farmer-login"
                className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                <LogIn className="h-3.5 w-3.5 mr-1" />
                <span>{t('login_btn')}</span>
              </Link>
            )}

          </div>

        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <LanguageProvider>
      <Router>
        <div className="min-h-screen bg-slate-100 font-sans text-gray-900 flex flex-col">
          <NavigationBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/farmer-login" element={<Login />} />
              <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
              <Route path="/officer-login" element={<OfficerLogin />} />
              <Route path="/officer-dashboard" element={<Dashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </LanguageProvider>
  );
}

export default App;



